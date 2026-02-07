/**
 * EdgeCare-5G TypeScript Definitions
 * Shared types across the application
 */

import type { Patient, AIReport, ConsultationSession } from '../drizzle/schema';

// ============================================================================
// Database Types
// ============================================================================

export type { Patient, AIReport, ConsultationSession };

// ============================================================================
// API Request/Response Types
// ============================================================================

// Health API
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  version: string;
  timestamp: string;
  server_ip: string;
  all_ips: string[];
  port: number;
  database: {
    status: 'connected' | 'disconnected';
    type: 'sqlite' | 'supabase';
  };
  ai_agents: {
    online: number;
    total: number;
  };
}

// AI Reports API
export interface CreateReportRequest {
  room_id: string;
  patient_id?: string;
  module: 'NeoCare-AI' | 'GeriCare-AI';
  status: string;
  confidence: number;
  timestamp: number;
  predictions?: Record<string, number>;
  bbox?: [number, number, number, number];
  alert_level?: 'normal' | 'warning' | 'critical';
  metadata?: Record<string, any>;
}

export interface GetReportsResponse {
  reports: AIReport[];
  count: number;
  total: number;
  has_more: boolean;
}

// Rooms API
export interface RoomStatus {
  roomId: string;
  patientId: string | null;
  patientName: string | null;
  module: string;
  status: string;
  confidence: number;
  lastSeen: string;
  online: boolean;
  alertLevel: string;
  lastUpdate: string; // alias for last_seen
  latest_report: AIReport | null;
}

// Alias for convenience
export type Room = RoomStatus;

export interface GetRoomsResponse {
  rooms: RoomStatus[];
  count: number;
  online: number;
  offline: number;
}

// Patients API
export interface CreatePatientRequest {
  patient_id: string;
  full_name: string;
  age: number;
  gender?: 'male' | 'female' | 'other';
  room_id?: string;
  contact_number?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  blood_type?: string;
  allergies?: string[];
  current_medications?: string[];
  medical_conditions?: string[];
  doctor_assigned?: string;
  notes?: string;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {}

// Consultations API
export interface CreateConsultationRequest {
  room_id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name: string;
}

export interface EndConsultationRequest {
  notes?: string;
}

// WebRTC Signaling API
export interface CreateSignalRequest {
  session_id: string;
  from_peer: string;
  to_peer: string;
  signal_type: 'offer' | 'answer' | 'ice-candidate';
  signal_data: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export interface SignalResponse {
  success: boolean;
  signal_id: string;
}

export interface HeartbeatRequest {
  peer_id: string;
  connection_quality: 'excellent' | 'good' | 'fair' | 'poor';
}

// ============================================================================
// Frontend Component Types
// ============================================================================

export interface RoomCardProps {
  roomId: string;
  patientName: string | null;
  module: string;
  status: string;
  confidence: number;
  alertLevel: 'normal' | 'warning' | 'critical';
  online: boolean;
  lastSeen: string;
  onStartConsultation: () => void;
  onViewDetails: () => void;
}

export interface StatsSummary {
  totalRooms: number;
  onlineRooms: number;
  criticalAlerts: number;
  activeConsultations: number;
}

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  roomId: string;
  module: string;
  status: string;
  alertLevel: 'normal' | 'warning' | 'critical';
}

// ============================================================================
// WebRTC Types
// ============================================================================

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
}

export type ConnectionState =
  | 'idle'
  | 'initializing'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'failed';

export interface WebRTCCallState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: ConnectionState;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface APIError {
  error: string;
  message?: string;
  details?: any;
}

export interface APISuccess<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export type Module = 'NeoCare-AI' | 'GeriCare-AI';
export type AlertLevel = 'normal' | 'warning' | 'critical';
export type ConsultationStatus = 'pending' | 'active' | 'completed' | 'cancelled';

// ============================================================================
// Room Registry (In-Memory)
// ============================================================================

export interface RoomRegistryEntry {
  room_id: string;
  module: string;
  status: string;
  confidence: number;
  last_seen: string;
  online: boolean;
  latest_report: any;
}

export type RoomRegistry = Map<string, RoomRegistryEntry>;

// ============================================================================
// File Transfer Types (WebRTC Data Channel)
// ============================================================================

export interface FileTransferProgress {
  fileName: string;
  fileSize: number;
  bytesTransferred: number;
  progress: number; // 0-100
  status: 'sending' | 'receiving' | 'completed' | 'failed';
  error?: string;
  chunksSent?: number;
  chunksReceived?: number;
  totalChunks?: number;
}

export interface FileTransferOptions {
  onProgress?: (progress: FileTransferProgress) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface ReceivedFile {
  file: File;
  receivedAt: Date;
  sender: string;
}
