/**
 * EdgeCare-5G Validation Schemas
 * Zod schemas for API request validation
 */

import { z } from 'zod';

// ============================================================================
// AI Reports Schemas
// ============================================================================

export const createReportSchema = z.object({
  room_id: z.string().min(1, 'Room ID is required'),
  patient_id: z.string().optional(),
  module: z.enum(['NeoCare-AI', 'GeriCare-AI']),
  status: z.string().min(1, 'Status is required'),
  confidence: z.number().min(0).max(1),
  timestamp: z.number().positive(),
  predictions: z.record(z.string(), z.number()).optional(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  alert_level: z.enum(['normal', 'warning', 'critical']).default('normal'),
  alert_count: z.number().int().default(0),
  person_ids: z.array(z.number()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const getReportsQuerySchema = z.object({
  room_id: z.string().optional(),
  patient_id: z.string().optional(),
  module: z.enum(['NeoCare-AI', 'GeriCare-AI']).optional(),
  alert_level: z.enum(['normal', 'warning', 'critical']).optional(),
  limit: z.coerce.number().int().positive().max(5000).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const acknowledgeReportSchema = z.object({
  acknowledged_by: z.string().min(1, 'Acknowledger name is required'),
});

// ============================================================================
// Patients Schemas
// ============================================================================

export const createPatientSchema = z.object({
  patient_id: z.string().optional(),
  full_name: z.string().min(1, 'Full name is required'),
  age: z.number().int().positive().max(150),
  gender: z.enum(['male', 'female', 'other']).optional(),
  room_id: z.string().optional(),
  admission_date: z.string().datetime().optional(),
  contact_number: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  blood_type: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  current_medications: z.array(z.string()).optional(),
  medical_conditions: z.array(z.string()).optional(),
  doctor_assigned: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export const getPatientsQuerySchema = z.object({
  status: z.enum(['active', 'discharged', 'transferred']).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

// ============================================================================
// Consultations Schemas
// ============================================================================

export const createConsultationSchema = z.object({
  room_id: z.string().min(1, 'Room ID is required'),
  patient_id: z.string().min(1, 'Patient ID is required'),
  doctor_id: z.string().min(1, 'Doctor ID is required'),
  doctor_name: z.string().min(1, 'Doctor name is required'),
});

export const endConsultationSchema = z.object({
  notes: z.string().optional(),
});

export const heartbeatSchema = z.object({
  peer_id: z.string().min(1, 'Peer ID is required'),
  connection_quality: z.enum(['excellent', 'good', 'fair', 'poor']),
});

// ============================================================================
// WebRTC Signaling Schemas
// ============================================================================

export const createSignalSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required'),
  from_peer: z.string().min(1, 'From peer is required'),
  to_peer: z.string().min(1, 'To peer is required'),
  signal_type: z.enum(['offer', 'answer', 'ice-candidate']),
  signal_data: z.unknown(), // RTCSessionDescriptionInit or RTCIceCandidateInit
});

// ============================================================================
// Type exports
// ============================================================================

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type GetReportsQuery = z.infer<typeof getReportsQuerySchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type GetPatientsQuery = z.infer<typeof getPatientsQuerySchema>;
export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
export type EndConsultationInput = z.infer<typeof endConsultationSchema>;
export type CreateSignalInput = z.infer<typeof createSignalSchema>;
