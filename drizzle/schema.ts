/**
 * EdgeCare-5G Database Schema
 * Drizzle ORM schema definitions for SQLite/PostgreSQL
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Patients Table
export const patients = sqliteTable('patients', {
  id: text('id').primaryKey(), // UUID v4
  patientId: text('patient_id').notNull().unique(), // P001, P002, etc.
  fullName: text('full_name').notNull(),
  age: integer('age').notNull(),
  gender: text('gender', { enum: ['male', 'female', 'other'] }),
  roomId: text('room_id'), // R2, R5, R3
  admissionDate: text('admission_date').notNull(), // ISO 8601
  dischargeDate: text('discharge_date'),
  status: text('status', { enum: ['active', 'discharged', 'transferred'] }).default('active'),
  contactNumber: text('contact_number'),
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  bloodType: text('blood_type'),
  allergies: text('allergies'), // JSON array stored as text
  currentMedications: text('current_medications'), // JSON array
  medicalConditions: text('medical_conditions'), // JSON array
  doctorAssigned: text('doctor_assigned'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  syncedToCloud: integer('synced_to_cloud', { mode: 'boolean' }).default(false),
  lastSyncAt: text('last_sync_at'),
});

// AI Reports Table
export const aiReports = sqliteTable('ai_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reportId: text('report_id').notNull().unique(), // UUID
  roomId: text('room_id').notNull(),
  patientId: text('patient_id').references(() => patients.id, { onDelete: 'set null' }),
  module: text('module', { enum: ['NeoCare-AI', 'GeriCare-AI'] }).notNull(),
  status: text('status').notNull(),
  confidence: real('confidence'),
  timestamp: real('timestamp').notNull(),
  predictions: text('predictions'), // JSON for DermaCare multi-class predictions
  bbox: text('bbox'), // JSON [x, y, w, h]
  alertLevel: text('alert_level', { enum: ['normal', 'warning', 'critical'] }).default('normal'),
  alertCount: integer('alert_count').default(0),
  personIds: text('person_ids'), // JSON array
  metadata: text('metadata'), // JSON for additional module-specific data
  acknowledged: integer('acknowledged', { mode: 'boolean' }).default(false),
  acknowledgedBy: text('acknowledged_by'),
  acknowledgedAt: text('acknowledged_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  syncedToCloud: integer('synced_to_cloud', { mode: 'boolean' }).default(false),
});

// Consultation Sessions Table
export const consultationSessions = sqliteTable('consultation_sessions', {
  id: text('id').primaryKey(), // UUID
  sessionId: text('session_id').notNull().unique(),
  roomId: text('room_id').notNull(),
  patientId: text('patient_id').references(() => patients.id, { onDelete: 'set null' }),
  doctorId: text('doctor_id'),
  doctorName: text('doctor_name'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  durationSeconds: integer('duration_seconds'),
  status: text('status', { enum: ['pending', 'active', 'completed', 'cancelled'] }).default('pending'),
  connectionQuality: text('connection_quality', { enum: ['excellent', 'good', 'fair', 'poor'] }),
  notes: text('notes'),
  recorded: integer('recorded', { mode: 'boolean' }).default(false),
  recordingPath: text('recording_path'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// WebRTC Signaling Table
export const webrtcSignals = sqliteTable('webrtc_signals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  signalId: text('signal_id').notNull().unique(),
  sessionId: text('session_id').notNull().references(() => consultationSessions.id, { onDelete: 'cascade' }),
  fromPeer: text('from_peer').notNull(),
  toPeer: text('to_peer').notNull(),
  signalType: text('signal_type', { enum: ['offer', 'answer', 'ice-candidate'] }).notNull(),
  signalData: text('signal_data').notNull(), // JSON SDP/ICE data
  delivered: integer('delivered', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text('expires_at').notNull(),
});

// System Logs Table
export const systemLogs = sqliteTable('system_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  logLevel: text('log_level', { enum: ['info', 'warning', 'error', 'critical'] }).notNull(),
  component: text('component').notNull(), // 'ai-agent', 'api', 'webrtc', 'database'
  message: text('message').notNull(),
  details: text('details'), // JSON
  roomId: text('roomId'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Sync Queue Table (for offline → online sync)
export const syncQueue = sqliteTable('sync_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tableName: text('table_name').notNull(),
  recordId: text('record_id').notNull(),
  operation: text('operation', { enum: ['insert', 'update', 'delete'] }).notNull(),
  data: text('data').notNull(), // JSON
  retryCount: integer('retry_count').default(0),
  lastRetryAt: text('last_retry_at'),
  synced: integer('synced', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Export types for use in the application
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type AIReport = typeof aiReports.$inferSelect;
export type NewAIReport = typeof aiReports.$inferInsert;
export type ConsultationSession = typeof consultationSessions.$inferSelect;
export type NewConsultationSession = typeof consultationSessions.$inferInsert;
export type WebRTCSignal = typeof webrtcSignals.$inferSelect;
export type NewWebRTCSignal = typeof webrtcSignals.$inferInsert;
export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;
