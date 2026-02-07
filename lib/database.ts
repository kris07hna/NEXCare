/**
 * EdgeCare-5G Database Layer
 * Unified abstraction for SQLite (offline) and Supabase (cloud)
 */

import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { eq, desc, and, gte, lte, like, or } from 'drizzle-orm';
import * as schema from '../drizzle/schema';
import type {
  Patient,
  NewPatient,
  AIReport,
  NewAIReport,
  ConsultationSession,
  NewConsultationSession,
  WebRTCSignal,
  NewWebRTCSignal,
  SystemLog,
  NewSystemLog,
} from '../drizzle/schema';
import { v4 as uuidv4 } from 'uuid';

export class EdgeCareDatabase {
  private sqlite: BetterSQLite3Database<typeof schema> | null = null;
  private sqliteRaw: Database.Database | null = null;
  private supabase: SupabaseClient | null = null;
  private useCloud: boolean;
  private initialized: boolean = false;

  constructor() {
    this.useCloud = process.env.OFFLINE_MODE !== 'true';
  }

  /**
   * Initialize the database connection
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.useCloud && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Initialize Supabase
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      console.log('[Database] Using Supabase (cloud mode)');
    } else {
      // Initialize SQLite
      const dbPath = process.env.DATABASE_PATH || './data/edgecare.db';
      this.sqliteRaw = new Database(dbPath);
      this.sqliteRaw.pragma('journal_mode = WAL'); // Write-Ahead Logging for better performance
      this.sqlite = drizzle(this.sqliteRaw, { schema });
      console.log(`[Database] Using SQLite (offline mode): ${dbPath}`);

      // Create tables if they don't exist
      await this.createTables();
    }

    this.initialized = true;
  }

  /**
   * Create SQLite tables
   */
  private async createTables(): Promise<void> {
    if (!this.sqlite) return;

    const db = this.sqlite;

    try {
      // The schema is automatically applied by Drizzle migrations
      // For development, we'll create tables manually
      this.executeSQLite(`
        CREATE TABLE IF NOT EXISTS patients (
          id TEXT PRIMARY KEY,
          patient_id TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          age INTEGER NOT NULL,
          gender TEXT,
          room_id TEXT,
          admission_date TEXT NOT NULL,
          discharge_date TEXT,
          status TEXT DEFAULT 'active',
          contact_number TEXT,
          emergency_contact TEXT,
          emergency_phone TEXT,
          blood_type TEXT,
          allergies TEXT,
          current_medications TEXT,
          medical_conditions TEXT,
          doctor_assigned TEXT,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          synced_to_cloud INTEGER DEFAULT 0,
          last_sync_at TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_patients_room ON patients(room_id);
        CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
        CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
      `);

      this.executeSQLite(`
        CREATE TABLE IF NOT EXISTS ai_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_id TEXT UNIQUE NOT NULL,
          room_id TEXT NOT NULL,
          patient_id TEXT,
          module TEXT NOT NULL,
          status TEXT NOT NULL,
          confidence REAL,
          timestamp REAL NOT NULL,
          predictions TEXT,
          bbox TEXT,
          alert_level TEXT DEFAULT 'normal',
          alert_count INTEGER DEFAULT 0,
          person_ids TEXT,
          metadata TEXT,
          acknowledged INTEGER DEFAULT 0,
          acknowledged_by TEXT,
          acknowledged_at TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          synced_to_cloud INTEGER DEFAULT 0,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_reports_room ON ai_reports(room_id);
        CREATE INDEX IF NOT EXISTS idx_reports_patient ON ai_reports(patient_id);
        CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON ai_reports(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_reports_alert_level ON ai_reports(alert_level);
      `);

      this.executeSQLite(`
        CREATE TABLE IF NOT EXISTS consultation_sessions (
          id TEXT PRIMARY KEY,
          session_id TEXT UNIQUE NOT NULL,
          room_id TEXT NOT NULL,
          patient_id TEXT,
          doctor_id TEXT,
          doctor_name TEXT,
          start_time TEXT NOT NULL,
          end_time TEXT,
          duration_seconds INTEGER,
          status TEXT DEFAULT 'pending',
          connection_quality TEXT,
          notes TEXT,
          recorded INTEGER DEFAULT 0,
          recording_path TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_consultations_room ON consultation_sessions(room_id);
        CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultation_sessions(patient_id);
      `);

      this.executeSQLite(`
        CREATE TABLE IF NOT EXISTS webrtc_signals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          signal_id TEXT UNIQUE NOT NULL,
          session_id TEXT NOT NULL,
          from_peer TEXT NOT NULL,
          to_peer TEXT NOT NULL,
          signal_type TEXT NOT NULL,
          signal_data TEXT NOT NULL,
          delivered INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          expires_at TEXT NOT NULL,
          FOREIGN KEY (session_id) REFERENCES consultation_sessions(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_signals_to_peer ON webrtc_signals(to_peer, delivered);
      `);

      this.executeSQLite(`
        CREATE TABLE IF NOT EXISTS system_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          log_level TEXT NOT NULL,
          component TEXT NOT NULL,
          message TEXT NOT NULL,
          details TEXT,
          room_id TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_logs_level ON system_logs(log_level);
        CREATE INDEX IF NOT EXISTS idx_logs_created ON system_logs(created_at DESC);
      `);

      this.executeSQLite(`
        CREATE TABLE IF NOT EXISTS room_status (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_id TEXT NOT NULL UNIQUE,
          patient_id TEXT,
          status TEXT DEFAULT 'stable',
          heart_rate INTEGER,
          spo2 INTEGER,
          temperature REAL,
          ai_confidence INTEGER,
          sleep_state TEXT,
          sleep_duration TEXT,
          alert_count INTEGER DEFAULT 0,
          last_seen TEXT,
          online INTEGER DEFAULT 1,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_room_status_room ON room_status(room_id);
        CREATE INDEX IF NOT EXISTS idx_room_status_patient ON room_status(patient_id);
        CREATE INDEX IF NOT EXISTS idx_room_status_status ON room_status(status);
      `);

      this.executeSQLite(`
        CREATE TABLE IF NOT EXISTS consultation_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id TEXT NOT NULL,
          doctor_name TEXT NOT NULL,
          consultation_type TEXT DEFAULT 'routine',
          start_time TEXT NOT NULL,
          end_time TEXT,
          duration_seconds INTEGER,
          notes TEXT,
          quality_rating INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_consultation_logs_patient ON consultation_logs(patient_id);
        CREATE INDEX IF NOT EXISTS idx_consultation_logs_start ON consultation_logs(start_time DESC);
      `);

      console.log('[Database] Tables created successfully');
    } catch (error) {
      console.error('[Database] Error creating tables:', error);
      throw error;
    }
  }

  /**
   * Execute raw SQL in SQLite
   */
  private executeSQLite(sql: string): void {
    if (!this.sqliteRaw) return;
    this.sqliteRaw.exec(sql);
  }

  /**
   * Execute parameterized SQL query (for seeding and custom operations)
   */
  async execute(sql: string, params?: any[]): Promise<any> {
    if (!this.sqliteRaw) {
      throw new Error('Database not initialized');
    }

    try {
      if (params && params.length > 0) {
        const stmt = this.sqliteRaw.prepare(sql);
        return stmt.run(...params);
      } else {
        return this.sqliteRaw.exec(sql);
      }
    } catch (error) {
      console.error('[Database] Execute error:', error);
      throw error;
    }
  }

  /**
   * Query database and return rows (for seeding and custom operations)
   */
  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.sqliteRaw) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.sqliteRaw.prepare(sql);
      if (params && params.length > 0) {
        return stmt.all(...params);
      } else {
        return stmt.all();
      }
    } catch (error) {
      console.error('[Database] Query error:', error);
      throw error;
    }
  }

  /**
   * Get database status
   */
  getStatus(): { status: 'connected' | 'disconnected'; type: 'sqlite' | 'supabase' } {
    if (this.supabase) {
      return { status: 'connected', type: 'supabase' };
    } else if (this.sqlite) {
      return { status: 'connected', type: 'sqlite' };
    } else {
      return { status: 'disconnected', type: 'sqlite' };
    }
  }

  // ============================================================================
  // PATIENTS OPERATIONS
  // ============================================================================

  async getPatients(filters?: {
    status?: 'active' | 'discharged' | 'transferred';
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Patient[]> {
    await this.initialize();

    if (this.sqlite) {
      const conditions = [];
      if (filters?.status) {
        conditions.push(eq(schema.patients.status, filters.status));
      }
      if (filters?.search) {
        conditions.push(
          or(
            like(schema.patients.fullName, `%${filters.search}%`),
            like(schema.patients.patientId, `%${filters.search}%`)
          )
        );
      }

      const query = this.sqlite
        .select()
        .from(schema.patients)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0);

      return await query;
    }

    // Supabase implementation
    if (this.supabase) {
      let query = this.supabase.from('patients').select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,patient_id.ilike.%${filters.search}%`);
      }

      query = query.limit(filters?.limit || 100).range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 100) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data as Patient[];
    }

    return [];
  }

  async getPatientById(id: string): Promise<Patient | null> {
    await this.initialize();

    if (this.sqlite) {
      const result = await this.sqlite
        .select()
        .from(schema.patients)
        .where(eq(schema.patients.id, id))
        .limit(1);
      return result[0] || null;
    }

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Patient;
    }

    return null;
  }

  async createPatient(patient: Omit<NewPatient, 'id' | 'createdAt' | 'patient_id'> & { patient_id?: string }): Promise<Patient> {
    await this.initialize();

    const { patient_id, fullName, age, gender, roomId, admissionDate, ...restPatient } = patient as any;
    const newPatient: NewPatient = {
      ...restPatient,
      id: uuidv4(),
      patientId: patient_id || `P${String(Date.now()).slice(-6)}`,
      fullName,
      age,
      gender,
      roomId,
      admissionDate: admissionDate || new Date().toISOString(),
    };

    if (this.sqlite) {
      await this.sqlite.insert(schema.patients).values(newPatient);
      return newPatient as Patient;
    }

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('patients')
        .insert([newPatient])
        .select()
        .single();
      if (error) throw error;
      return data as Patient;
    }

    throw new Error('Database not initialized');
  }

  async updatePatient(id: string, updates: Partial<NewPatient>): Promise<Patient> {
    await this.initialize();

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (this.sqlite) {
      await this.sqlite
        .update(schema.patients)
        .set(updateData)
        .where(eq(schema.patients.id, id));

      const updated = await this.getPatientById(id);
      if (!updated) throw new Error('Patient not found after update');
      return updated;
    }

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('patients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Patient;
    }

    throw new Error('Database not initialized');
  }

  async deletePatient(id: string): Promise<boolean> {
    await this.initialize();

    if (this.sqlite) {
      await this.sqlite
        .delete(schema.patients)
        .where(eq(schema.patients.id, id));
      return true;
    }

    if (this.supabase) {
      const { error } = await this.supabase
        .from('patients')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }

    return false;
  }

  // ============================================================================
  // AI REPORTS OPERATIONS
  // ============================================================================

  async createReport(report: Omit<NewAIReport, 'id' | 'reportId' | 'createdAt'>): Promise<AIReport> {
    await this.initialize();

    const newReport: NewAIReport = {
      reportId: uuidv4(),
      ...report,
    };

    if (this.sqlite) {
      const result = await this.sqlite.insert(schema.aiReports).values(newReport).returning();
      return result[0];
    }

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('ai_reports')
        .insert([newReport])
        .select()
        .single();
      if (error) throw error;
      return data as AIReport;
    }

    throw new Error('Database not initialized');
  }

  async getReports(filters?: {
    roomId?: string;
    patientId?: string;
    module?: string;
    alertLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ reports: AIReport[]; total: number }> {
    await this.initialize();

    if (this.sqlite) {
      const conditions = [];
      if (filters?.roomId) {
        conditions.push(eq(schema.aiReports.roomId, filters.roomId));
      }
      if (filters?.patientId) {
        conditions.push(eq(schema.aiReports.patientId, filters.patientId));
      }
      if (filters?.module) {
        conditions.push(eq(schema.aiReports.module, filters.module as any));
      }
      if (filters?.alertLevel) {
        conditions.push(eq(schema.aiReports.alertLevel, filters.alertLevel as any));
      }

      const query = this.sqlite
        .select()
        .from(schema.aiReports)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(schema.aiReports.timestamp))
        .limit(filters?.limit || 50)
        .offset(filters?.offset || 0);

      const reports = await query;

      // Get total count
      const countQuery = this.sqlite
        .select()
        .from(schema.aiReports)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
      const totalReports = await countQuery;

      return { reports, total: totalReports.length };
    }

    if (this.supabase) {
      let query = this.supabase.from('ai_reports').select('*', { count: 'exact' });

      if (filters?.roomId) query = query.eq('room_id', filters.roomId);
      if (filters?.patientId) query = query.eq('patient_id', filters.patientId);
      if (filters?.module) query = query.eq('module', filters.module);
      if (filters?.alertLevel) query = query.eq('alert_level', filters.alertLevel);

      query = query
        .order('timestamp', { ascending: false })
        .limit(filters?.limit || 50)
        .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 50) - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return { reports: (data as AIReport[]) || [], total: count || 0 };
    }

    return { reports: [], total: 0 };
  }

  async acknowledgeReport(reportId: string, acknowledgedBy: string): Promise<boolean> {
    await this.initialize();

    if (this.sqlite) {
      await this.sqlite
        .update(schema.aiReports)
        .set({
          acknowledged: true,
          acknowledgedBy,
          acknowledgedAt: new Date().toISOString(),
        })
        .where(eq(schema.aiReports.reportId, reportId));
      return true;
    }

    if (this.supabase) {
      const { error } = await this.supabase
        .from('ai_reports')
        .update({
          acknowledged: true,
          acknowledged_by: acknowledgedBy,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('report_id', reportId);
      if (error) throw error;
      return true;
    }

    return false;
  }

  // ============================================================================
  // CONSULTATION OPERATIONS
  // ============================================================================

  async createConsultation(consultation: Omit<NewConsultationSession, 'id' | 'sessionId' | 'createdAt'>): Promise<ConsultationSession> {
    await this.initialize();

    const newConsultation: NewConsultationSession = {
      id: uuidv4(),
      sessionId: `CS${Date.now()}`,
      ...consultation,
    };

    if (this.sqlite) {
      await this.sqlite.insert(schema.consultationSessions).values(newConsultation);
      return newConsultation as ConsultationSession;
    }

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('consultation_sessions')
        .insert([newConsultation])
        .select()
        .single();
      if (error) throw error;
      return data as ConsultationSession;
    }

    throw new Error('Database not initialized');
  }

  async getConsultationById(id: string): Promise<ConsultationSession | null> {
    await this.initialize();

    if (this.sqlite) {
      const result = await this.sqlite
        .select()
        .from(schema.consultationSessions)
        .where(eq(schema.consultationSessions.id, id))
        .limit(1);
      return result[0] || null;
    }

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('consultation_sessions')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ConsultationSession;
    }

    return null;
  }

  async endConsultation(id: string, notes?: string): Promise<ConsultationSession> {
    await this.initialize();

    const endTime = new Date().toISOString();

    // Get the consultation to calculate duration
    const consultation = await this.getConsultationById(id);
    if (!consultation) throw new Error('Consultation not found');

    const startTime = new Date(consultation.startTime).getTime();
    const endTimeMs = new Date(endTime).getTime();
    const durationSeconds = Math.floor((endTimeMs - startTime) / 1000);

    const updateData = {
      endTime,
      durationSeconds,
      status: 'completed' as const,
      notes: notes || consultation.notes,
    };

    if (this.sqlite) {
      await this.sqlite
        .update(schema.consultationSessions)
        .set(updateData)
        .where(eq(schema.consultationSessions.id, id));

      const updated = await this.getConsultationById(id);
      if (!updated) throw new Error('Consultation not found after update');
      return updated;
    }

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('consultation_sessions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ConsultationSession;
    }

    throw new Error('Database not initialized');
  }

  // ============================================================================
  // WEBRTC SIGNALING OPERATIONS
  // ============================================================================

  async createSignal(signal: Omit<NewWebRTCSignal, 'id' | 'signalId' | 'createdAt' | 'expiresAt'>): Promise<WebRTCSignal> {
    await this.initialize();

    const expiresAt = new Date(Date.now() + 60000).toISOString(); // 60 seconds TTL

    const newSignal: NewWebRTCSignal = {
      signalId: uuidv4(),
      expiresAt,
      ...signal,
    };

    if (this.sqlite) {
      const result = await this.sqlite.insert(schema.webrtcSignals).values(newSignal).returning();
      return result[0];
    }

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('webrtc_signals')
        .insert([newSignal])
        .select()
        .single();
      if (error) throw error;
      return data as WebRTCSignal;
    }

    throw new Error('Database not initialized');
  }

  async getPendingSignals(peerId: string): Promise<WebRTCSignal[]> {
    await this.initialize();

    const now = new Date().toISOString();

    if (this.sqlite) {
      return await this.sqlite
        .select()
        .from(schema.webrtcSignals)
        .where(
          and(
            eq(schema.webrtcSignals.toPeer, peerId),
            eq(schema.webrtcSignals.delivered, false),
            gte(schema.webrtcSignals.expiresAt, now)
          )
        );
    }

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('webrtc_signals')
        .select('*')
        .eq('to_peer', peerId)
        .eq('delivered', false)
        .gte('expires_at', now);
      if (error) throw error;
      return (data as WebRTCSignal[]) || [];
    }

    return [];
  }

  async markSignalDelivered(signalId: string): Promise<boolean> {
    await this.initialize();

    if (this.sqlite) {
      await this.sqlite
        .update(schema.webrtcSignals)
        .set({ delivered: true })
        .where(eq(schema.webrtcSignals.signalId, signalId));
      return true;
    }

    if (this.supabase) {
      const { error } = await this.supabase
        .from('webrtc_signals')
        .update({ delivered: true })
        .eq('signal_id', signalId);
      if (error) throw error;
      return true;
    }

    return false;
  }

  async cleanupExpiredSignals(): Promise<number> {
    await this.initialize();

    const now = new Date().toISOString();

    if (this.sqlite) {
      const result = await this.sqlite
        .delete(schema.webrtcSignals)
        .where(lte(schema.webrtcSignals.expiresAt, now));
      return (result as any).changes || 0;
    }

    if (this.supabase) {
      const { error, count } = await this.supabase
        .from('webrtc_signals')
        .delete()
        .lte('expires_at', now);
      if (error) throw error;
      return count || 0;
    }

    return 0;
  }

  // ============================================================================
  // SYSTEM LOGS OPERATIONS
  // ============================================================================

  async createLog(log: Omit<NewSystemLog, 'id' | 'createdAt'>): Promise<void> {
    await this.initialize();

    if (this.sqlite) {
      await this.sqlite.insert(schema.systemLogs).values(log);
    }

    if (this.supabase) {
      await this.supabase.from('system_logs').insert([log]);
    }
  }
}

// Export singleton instance
export const db = new EdgeCareDatabase();
