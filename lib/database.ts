/**
 * 5G MEC Cloud Database - Supabase Only
 * Real-time edge-to-cloud data synchronization
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types
export interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  age: number;
  gender?: string;
  room_id?: string;
  admission_date: string;
  status: string;
  blood_type?: string;
  created_at?: string;
}

export interface AIReport {
  id: number;
  report_id: string;
  room_id: string;
  patient_id?: string;
  module: string;
  status: string;
  confidence: number;
  timestamp: number;
  alert_level: string;
  metadata?: Record<string, unknown>;
  edge_node_id?: string;
  created_at?: string;
}

export interface Consultation {
  id: string;
  session_id: string;
  room_id: string;
  patient_id?: string;
  doctor_id?: string;
  doctor_name?: string;
  start_time: string;
  end_time?: string;
  status: string;
  jitsi_room_url?: string;
  created_at?: string;
}

export class EdgeCareDatabase {
  private supabase: SupabaseClient | null = null;
  private initialized: boolean = false;

  /**
   * Initialize 5G MEC Cloud connection
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    this.supabase = createClient(url, key);
    console.log('[5G MEC] ✓ Connected to cloud database');
    this.initialized = true;
  }

  // ==================================================
  // PATIENTS
  // ==================================================

  async createPatient(patient: Partial<Patient>): Promise<Patient> {
    await this.initialize();
    
    const { data, error } = await this.supabase!
      .from('patients')
      .insert([{
        patient_id: patient.patient_id || `P${Date.now()}`,
        full_name: patient.full_name,
        age: patient.age,
        gender: patient.gender,
        room_id: patient.room_id,
        admission_date: patient.admission_date || new Date().toISOString(),
        status: patient.status || 'active',
        blood_type: patient.blood_type
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPatients(filters?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<Patient[]> {
    await this.initialize();
    
    let query = this.supabase!.from('patients').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.ilike('full_name', `%${filters.search}%`);
    }
    
    query = query
      .order('created_at', { ascending: false })
      .limit(filters?.limit || 100)
      .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 100) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getPatientById(id: string): Promise<Patient | null> {
    await this.initialize();
    
    const { data, error } = await this.supabase!
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  // ==================================================
  // AI REPORTS (Real-time from edge nodes)
  // ==================================================

  async createReport(report: Partial<AIReport>): Promise<AIReport> {
    await this.initialize();
    
    const { data, error } = await this.supabase!
      .from('ai_reports')
      .insert([{
        room_id: report.room_id,
        patient_id: report.patient_id,
        module: report.module,
        status: report.status,
        confidence: report.confidence,
        timestamp: report.timestamp || Math.floor(Date.now() / 1000),
        alert_level: report.alert_level || 'normal',
        metadata: report.metadata,
        edge_node_id: report.edge_node_id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
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
    
    let query = this.supabase!.from('ai_reports').select('*', { count: 'exact' });

    if (filters?.roomId) query = query.eq('room_id', filters.roomId);
    if (filters?.patientId) query = query.eq('patient_id', filters.patientId);
    if (filters?.module) query = query.eq('module', filters.module);
    if (filters?.alertLevel) query = query.eq('alert_level', filters.alertLevel);

    query = query
      .order('created_at', { ascending: false })
      .limit(filters?.limit || 50)
      .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 50) - 1);

    const { data, error, count } = await query;
    
    if (error) throw error;
    return { reports: data || [], total: count || 0 };
  }

  // ==================================================
  // CONSULTATIONS (Video via Jitsi)
  // ==================================================

  async createConsultation(consultation: Partial<Consultation>): Promise<Consultation> {
    await this.initialize();
    
    const jitsiRoomUrl = `https://meet.jit.si/nexcare-${consultation.room_id}-${Date.now()}`;
    
    const { data, error } = await this.supabase!
      .from('consultations')
      .insert([{
        session_id: consultation.session_id || `S${Date.now()}`,
        room_id: consultation.room_id,
        patient_id: consultation.patient_id,
        doctor_id: consultation.doctor_id,
        doctor_name: consultation.doctor_name,
        start_time: consultation.start_time || new Date().toISOString(),
        status: consultation.status || 'pending',
        jitsi_room_url: jitsiRoomUrl
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getConsultations(filters?: {
    roomId?: string;
    patientId?: string;
    status?: string;
    limit?: number;
  }): Promise<Consultation[]> {
    await this.initialize();
    
    let query = this.supabase!.from('consultations').select('*');

    if (filters?.roomId) query = query.eq('room_id', filters.roomId);
    if (filters?.patientId) query = query.eq('patient_id', filters.patientId);
    if (filters?.status) query = query.eq('status', filters.status);

    query = query
      .order('start_time', { ascending: false })
      .limit(filters?.limit || 20);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async endConsultation(consultationId: string, notes?: string): Promise<void> {
    await this.initialize();
    
    const { error } = await this.supabase!
      .from('consultations')
      .update({
        end_time: new Date().toISOString(),
        status: 'completed',
        notes: notes
      })
      .eq('id', consultationId);

    if (error) throw error;
  }

  // ==================================================
  // REAL-TIME SUBSCRIPTIONS
  // ==================================================

  subscribeToReports(roomId: string, callback: (report: AIReport) => void) {
    if (!this.supabase) throw new Error('Database not initialized');
    
    return this.supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_reports',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => callback(payload.new as AIReport)
      )
      .subscribe();
  }

  subscribeToAllReports(callback: (report: AIReport) => void) {
    if (!this.supabase) throw new Error('Database not initialized');
    
    return this.supabase
      .channel('all-reports')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_reports'
        },
        (payload) => callback(payload.new as AIReport)
      )
      .subscribe();
  }
}

// Singleton instance
export const db = new EdgeCareDatabase();
