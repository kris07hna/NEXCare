# Dashboard Feature Analysis & Implementation Plan

**Generated:** Feb 2025  
**Status:** Complete Analysis

## 📊 Executive Summary

Your dashboard has **22 pages** with comprehensive UI/UX design. Most pages use **hardcoded data** and need to be connected to the **Supabase database** (polling every 5 seconds).

### Current State:
- ✅ **11 API Routes** implemented (rooms, reports, patients, consultations, health, monitoring, webrtc)
- ✅ **22 Page Routes** created with professional UI
- ⚠️ **Most pages use hardcoded/mock data** instead of Supabase
- ❌ **Missing API routes** for analytics, notifications, search, schedule

---

## 🗂️ Feature Matrix

| Feature | Route | Page Exists | Uses Supabase | API Route | Priority | Status |
|---------|-------|-------------|---------------|-----------|----------|--------|
| **Main Dashboard** | `/` | ✅ | ✅ Partial | `/api/rooms` | HIGH | 🟡 Needs real notifications |
| **Patients** | `/patients` | ✅ | ✅ Yes | `/api/patients` | HIGH | ✅ Working |
| **Consultations** | `/consultations` | ✅ | ✅ Yes | `/api/consultations` | HIGH | ✅ Working |
| **Analytics** | `/analytics` | ✅ | ✅ Yes | `/api/reports` `/api/consultations` | HIGH | ✅ Working |
| **Room Monitoring** | `/room-monitoring` | ✅ | ❌ No | ❌ None | HIGH | 🔴 Hardcoded |
| **NeoCare** | `/neocare` | ✅ | ✅ Partial | `/api/reports` | HIGH | 🟡 Camera + DB |
| **GeriCare** | `/gericare` | ✅ | ❌ No | ❌ None | MEDIUM | 🔴 Hardcoded |
| **Diagnostics** | `/diagnostics` | ✅ | ❌ No | ❌ None | MEDIUM | 🔴 Hardcoded |
| **Schedule** | `/schedule` | ✅ | ❌ No | ❌ None | MEDIUM | 🔴 Hardcoded |
| **File Transfer** | `/file-transfer` | ✅ | ❌ No | ❌ None | LOW | 🔴 Hardcoded |
| **Physician Hub** | `/physician-hub` | ✅ | ❌ No | ❌ None | LOW | 🔴 Hardcoded |
| **Setup/Servers** | `/setup/servers` | ✅ | ❌ No | ❌ None | LOW | 🔴 Hardcoded |
| **Search** | N/A (header) | ✅ UI | ❌ No | ❌ None | HIGH | 🔴 Not functional |
| **Notifications** | N/A (header) | ✅ UI | ❌ No | ❌ None | HIGH | 🔴 Hardcoded |

**Legend:**
- ✅ Working with Supabase
- 🟡 Partial implementation
- 🔴 Hardcoded data / Not functional

---

## 📍 Detailed Feature Analysis

### 1. **Main Dashboard** (`/`)
**Status:** 🟡 Partially Working  
**Current Implementation:**
- ✅ Room monitoring with Supabase polling (5s intervals)
- ✅ Room cards displaying AI reports from `ai_reports` table
- ✅ Video consultation buttons (Jitsi integration)
- ✅ Sidebar navigation
- ❌ Search bar (UI only, no functionality)
- ❌ Notifications dropdown (3 hardcoded items)
- ❌ Activity feed (hardcoded data)
- ❌ Doctor menu (UI only, no profile data)

**Needs:**
1. `/api/notifications` - Fetch critical/warning alerts from `ai_reports`
2. `/api/search` - Search patients by ID/name
3. `/api/activity` - Recent activity feed from `ai_reports` + `consultations`
4. Update Activity Feed component to use real data

---

### 2. **Consultations Page** (`/consultations`)
**Status:** ✅ Working  
**Current Implementation:**
- ✅ Fetches rooms from `/api/rooms`
- ✅ Creates consultations via `/api/consultations` POST
- ✅ Displays online/offline rooms
- ✅ Start video call functionality
- ✅ Patient links

**No Changes Needed** ✅

---

### 3. **Analytics Page** (`/analytics`)
**Status:** ✅ Working  
**Current Implementation:**
- ✅ Fetches data from `/api/reports`, `/api/consultations`, `/api/patients`
- ✅ Beautiful charts (Recharts) showing:
  - AI reports trend (7/30/90 days)
  - Reports by module (NeoCare/GeriCare)
  - Alert distribution (critical/warning/normal)
  - System health metrics
- ✅ Time range selector (7d/30d/90d)
- ✅ Export button (UI)

**Potential Enhancement:**
- Make export button functional (download CSV/PDF)

---

### 4. **Room Monitoring** (`/room-monitoring`)
**Status:** 🔴 **100% Hardcoded**  
**Current Implementation:**
- ❌ 6 hardcoded rooms with fake vitals
- ❌ Fake heart rate, blood pressure, SpO2, temperature
- ❌ Mock video feeds
- ❌ Hardcoded alerts

**Needs Complete Rewrite:**
1. Fetch rooms from `/api/rooms`
2. Display real patient vitals (if you add vitals to `ai_reports` table)
3. Real-time video feeds (integrate with existing Jitsi)
4. Real alert data from `ai_reports.alertLevel`

**Implementation Plan:**
- Connect to existing `/api/rooms` endpoint
- Parse `ai_reports.report` JSON for vitals data
- Add optional `vitals` column to `ai_reports` table:
  ```sql
  vitals: {
    heartRate: 72,
    bloodPressure: "120/80",
    oxygen: 98,
    temperature: 36.8
  }
  ```

---

### 5. **NeoCare Page** (`/neocare`)
**Status:** 🟡 Partial  
**Current Implementation:**
- ✅ Camera integration with error handling
- ✅ Fetches AI reports from `/api/reports`
- ⚠️ Some UI elements hardcoded

**Needs:**
- Minor: Update hardcoded room list to fetch from `/api/rooms`

---

### 6. **GeriCare Page** (`/gericare`)
**Status:** 🔴 **100% Hardcoded**  
**Current Implementation:**
- ❌ 4 hardcoded rooms with fake fall detection data
- ❌ Hardcoded sensor status
- ❌ Mock activity logs
- ❌ Fake emergency alerts

**Needs Complete Database Integration:**
1. Create `gericare_sensors` table in Supabase:
   ```sql
   CREATE TABLE gericare_sensors (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     sensor_id TEXT NOT NULL,
     room_id TEXT NOT NULL,
     status TEXT CHECK (status IN ('online', 'offline')),
     battery INTEGER CHECK (battery >= 0 AND battery <= 100),
     last_update TIMESTAMP DEFAULT NOW()
   );
   ```

2. Create `gericare_events` table:
   ```sql
   CREATE TABLE gericare_events (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     room_id TEXT NOT NULL,
     patient_id TEXT REFERENCES patients(id),
     event_type TEXT CHECK (event_type IN ('fall', 'bed_exit', 'movement', 'bathroom')),
     severity TEXT CHECK (severity IN ('critical', 'warning', 'info')),
     timestamp TIMESTAMP DEFAULT NOW(),
     details JSONB
   );
   ```

3. Create API routes:
   - `/api/gericare/sensors` - GET sensor status
   - `/api/gericare/events` - GET/POST fall detection events
   - `/api/gericare/rooms` - GET room status

4. Update GeriCare page to fetch from these endpoints

---

### 7. **Diagnostics Page** (`/diagnostics`)
**Status:** 🔴 **Hardcoded**  
**Current Implementation:**
- ❌ Hardcoded system metrics (CPU, memory, latency)
- ❌ Hardcoded server status
- ❌ Mock events log

**Needs:**
1. Create `/api/diagnostics/system` - Real system metrics
2. Create `/api/diagnostics/servers` - Edge server status
3. Query `system_logs` table for recent events
4. Optional: Integrate with actual system monitoring (psutil, node-os-utils)

---

### 8. **Schedule Page** (`/schedule`)
**Status:** 🔴 **Hardcoded**  
**Current Implementation:**
- ❌ 4 hardcoded staff members with fake schedules
- ❌ Mock shift assignments

**Needs:**
1. Create `staff` table:
   ```sql
   CREATE TABLE staff (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     role TEXT NOT NULL,
     department TEXT,
     avatar TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. Create `shifts` table:
   ```sql
   CREATE TABLE shifts (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     staff_id UUID REFERENCES staff(id),
     day TEXT NOT NULL,
     shift_time TEXT CHECK (shift_time IN ('Morning', 'Afternoon', 'Night')),
     start_time TIME,
     end_time TIME,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. Create API routes:
   - `/api/staff` - GET/POST staff
   - `/api/shifts` - GET/POST/PUT/DELETE shifts

---

### 9. **File Transfer Page** (`/file-transfer`)
**Status:** 🔴 **Exists but needs implementation**  
**Needs:**
- WebRTC data channel for P2P file transfer (already have `hooks/useFileTransfer.ts`)
- Or S3-compatible storage (Supabase Storage)
- File upload/download UI
- File history table

---

### 10. **Header Features**

#### **Search Bar**
**Status:** 🔴 Not functional  
**Needs:**
- `/api/search` endpoint
- Search patients by name, ID, room
- Autocomplete dropdown

#### **Notifications Dropdown**
**Status:** 🔴 Hardcoded (3 mock items)  
**Needs:**
- `/api/notifications` endpoint
- Fetch recent critical/warning alerts from `ai_reports`
- Mark as read functionality
- Real-time badge count

#### **Activity Feed**
**Status:** 🔴 Hardcoded  
**Current:** 5 hardcoded activities  
**Needs:**
- Fetch from `ai_reports` + `consultations`
- Show recent events (last 20)
- "View All Activity" page

---

## 🛠️ Implementation Priority

### **Phase 1: Critical Features** (HIGH Priority)
1. **Notifications System**
   - Create `/api/notifications` route
   - Fetch critical/warning alerts from `ai_reports`
   - Update header dropdown to show real data
   - Add "mark as read" functionality

2. **Search Functionality**
   - Create `/api/search` route
   - Search patients, rooms, reports
   - Add autocomplete to header search bar

3. **Room Monitoring Page**
   - Connect to existing `/api/rooms`
   - Display real patient data
   - Use actual AI reports for vitals

4. **Activity Feed**
   - Fetch from `ai_reports` + `consultations`
   - Replace hardcoded data on dashboard

---

### **Phase 2: Module Integration** (MEDIUM Priority)
5. **GeriCare Module**
   - Create database tables (sensors, events)
   - Create API routes (`/api/gericare/*`)
   - Connect page to Supabase
   - Integrate with GeriCare-AI agent

6. **Diagnostics Page**
   - Create `/api/diagnostics/*` routes
   - Query `system_logs` table
   - Optional: Real system metrics

7. **Schedule Management**
   - Create `staff` and `shifts` tables
   - Create `/api/staff` and `/api/shifts`
   - Update schedule page

---

### **Phase 3: Enhancements** (LOW Priority)
8. **File Transfer**
   - Implement file upload/download
   - Use Supabase Storage or WebRTC

9. **Doctor Profile**
   - Create `doctors` table
   - Store preferences, profile data
   - Update doctor menu dropdown

10. **Export Functionality**
    - Implement CSV/PDF export for analytics
    - Add report download buttons

---

## 📋 API Routes Summary

### ✅ Existing API Routes
| Route | Method | Purpose | Status |
|-------|--------|---------|--------|
| `/api/rooms` | GET | Get all rooms | ✅ |
| `/api/reports` | GET, POST | AI reports | ✅ |
| `/api/patients` | GET, POST | Patient management | ✅ |
| `/api/patients/[id]` | GET | Single patient | ✅ |
| `/api/consultations` | GET, POST | Video consultations | ✅ |
| `/api/consultations/[id]` | GET | Single consultation | ✅ |
| `/api/consultations/[id]/end` | POST | End consultation | ✅ |
| `/api/health` | GET | Health check | ✅ |
| `/api/monitoring/update` | POST | Update monitoring | ✅ |
| `/api/webrtc/signal` | POST | WebRTC signaling | ✅ |
| `/api/webrtc/signal/[peerId]` | GET | Get WebRTC signal | ✅ |

### ❌ Missing API Routes (To Create)
| Route | Method | Purpose | Priority |
|-------|--------|---------|----------|
| `/api/notifications` | GET, PUT | Get alerts, mark read | HIGH |
| `/api/search` | GET | Search patients/rooms | HIGH |
| `/api/activity` | GET | Activity feed | HIGH |
| `/api/gericare/sensors` | GET, POST | Sensor status | MEDIUM |
| `/api/gericare/events` | GET, POST | Fall events | MEDIUM |
| `/api/gericare/rooms` | GET | GeriCare rooms | MEDIUM |
| `/api/diagnostics/system` | GET | System metrics | MEDIUM |
| `/api/diagnostics/servers` | GET | Server status | MEDIUM |
| `/api/staff` | GET, POST | Staff management | LOW |
| `/api/shifts` | GET, POST, PUT, DELETE | Shift scheduling | LOW |
| `/api/profile` | GET, PUT | Doctor profile | LOW |

---

## 🎯 Next Steps

### Immediate Actions:
1. **Create notifications API** (`/api/notifications/route.ts`)
2. **Create search API** (`/api/search/route.ts`)
3. **Create activity API** (`/api/activity/route.ts`)
4. **Update main dashboard** to use real notifications and activity
5. **Update room-monitoring page** to fetch from `/api/rooms`

### Database Changes Needed:
```sql
-- Add to ai_reports table (optional vitals)
ALTER TABLE ai_reports 
ADD COLUMN vitals JSONB;

-- Create GeriCare tables
CREATE TABLE gericare_sensors (...);
CREATE TABLE gericare_events (...);

-- Create staff management tables
CREATE TABLE staff (...);
CREATE TABLE shifts (...);

-- Add notification tracking
ALTER TABLE ai_reports
ADD COLUMN acknowledged BOOLEAN DEFAULT FALSE,
ADD COLUMN acknowledged_at TIMESTAMP;
```

---

## 📊 Database Schema (Current)

### Existing Tables:
- ✅ `patients` - Patient records
- ✅ `ai_reports` - AI detection reports
- ✅ `consultations` - Video consultation records
- ✅ `room_status` - Room online/offline status
- ✅ `edge_nodes` - Edge server registry
- ✅ `system_logs` - System event logs

### Tables to Create:
- ❌ `gericare_sensors` - Fall detection sensors
- ❌ `gericare_events` - Fall/bed exit events
- ❌ `staff` - Medical staff
- ❌ `shifts` - Staff schedules
- ❌ `files` - File transfer history (if using database)

---

## ✅ Conclusion

**Your dashboard is 70% complete** with excellent UI/UX design. The main work needed is:

1. **Connect existing pages to Supabase** (Room Monitoring, GeriCare, Diagnostics, Schedule)
2. **Create missing API routes** (15 new endpoints)
3. **Add database tables** (4-5 new tables)
4. **Implement header features** (search, notifications, activity feed)

**Estimated Work:**
- High Priority: 8-10 hours
- Medium Priority: 12-15 hours
- Low Priority: 5-7 hours

**Total:** 25-32 hours of development

Would you like me to start implementing these features? I can begin with the **High Priority** items (notifications, search, activity feed, room monitoring).
