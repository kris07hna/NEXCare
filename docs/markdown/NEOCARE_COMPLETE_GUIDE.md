# NeoCare Complete Dashboard - Feature Guide

## 🎯 Overview

The complete NeoCare dashboard now includes:
- ✅ **Full Patient Data Integration** - Real data from database
- ✅ **Patient Registry** - Complete patient management
- ✅ **Critical Alerts System** - Real-time alert monitoring
- ✅ **Clinical Units** - Ward/zone management
- ✅ **Data Management** - Delete, edit, export options

## 🚀 Accessing the Complete Dashboard

**URL:** `http://localhost:3000/neocare/complete`

**Login Credentials:**
- **Email:** neocare@edgecare.local
- **Password:** neo123

Or use admin account for full access.

## 📊 Features Breakdown

### 1. Dashboard View (Main Monitoring)

**What you see:**
- Real-time infant monitoring cards
- Live vital signs (HR, SpO2, Temperature)
- AI-powered sleep state detection
- Status indicators (Stable, Critical, Observation)
- AI confidence percentages

**Features:**
- Filter by clinical unit
- Search by patient name, ID, or bed number
- Click any card to view full patient details
- Auto-refreshes every 2 seconds

**Patient Card Shows:**
- Patient name and ID
- Bed number
- Current status
- Sleep state (Deep Sleep, Light Sleep, Awake)
- Sleep duration
- Heart rate, SpO2, Temperature
- AI confidence level

### 2. Patient Registry

**Access:** Click "Registry" tab in header

**Features:**
- Complete list of all patients
- Sortable table view
- Patient information at a glance
- Quick actions per patient

**Available Actions:**
- 👁️ **View Details** - See full patient information
- ✏️ **Edit** - Modify patient record
- 🗑️ **Delete** - Remove patient from registry (with confirmation)
- 📥 **Export Data** - Download CSV of all patients

**Table Columns:**
- Patient ID
- Name (with age)
- Bed number
- Current status
- Vital signs (HR, SpO2)
- Assigned doctor
- Action buttons

**Export Data:**
- Click "Export Data" button
- Downloads CSV file with all patient information
- Filename format: `neocare-data-YYYY-MM-DD.csv`
- Includes: ID, Name, Age, Bed, Status, Vitals, AI data

### 3. Critical Alerts

**Access:** Click "Critical Alerts" tab (shows badge with count)

**Features:**
- Separate critical and observation alerts
- Detailed alert information
- Acknowledgement system
- Quick access to patient details

**Alert Information Shows:**
- Patient name, bed, and ID
- Current vitals (with red highlighting if abnormal)
- Number of alerts triggered
- Last update timestamp
- Status indicators

**Alert Actions:**
- **View Details** - Open full patient modal
- **Acknowledge** - Mark alert as seen
- Auto-sorting by severity

**Alert Levels:**
- 🔴 **Critical** - Immediate attention required
  - High heart rate (>150 bpm)
  - Low SpO2 (<95%)
  - Abnormal AI detection
- 🟡 **Observation** - Monitoring recommended
  - Borderline vitals
  - Restless sleep patterns
  - Minor AI alerts
- 🟢 **Stable** - No action needed

### 4. Clinical Units

**Access:** Click "Clinical Units" tab

**Features:**
- View all NICU zones/wards
- Occupancy tracking
- Unit-specific patient lists
- Capacity management

**Each Unit Shows:**
- Unit name and bed assignments
- Current occupancy (X/Y beds)
- Occupancy percentage bar
  - 🟢 Green: <50% occupied
  - 🟡 Amber: 50-80% occupied
  - 🔴 Red: >80% occupied
- Critical patient count
- Stable vs. Observation breakdown
- List of assigned patients

**Available Units:**
- NICU Zone A (Beds R1, R2)
- NICU Zone B (Beds R3, R4)

### 5. Patient Detail Modal

**Access:** Click any patient card or "View Details" button

**Shows Complete Information:**

**Status Overview:**
- Current status (Critical/Observation/Stable)
- Real-time vitals (HR, SpO2, Temperature)
- All in easy-to-read cards

**Patient Information:**
- Age in months
- Admission date
- Assigned doctor
- Emergency contact details

**Medical Information:**
- Allergies (highlighted in red badges)
- Medical conditions (blue badges)
- Shows "None" if no data

**AI Monitoring:**
- AI confidence level with progress bar
- Current sleep state
- Sleep duration
- Total alerts count

**Quick Actions:**
- **Edit Patient Record** - Go to patient edit page
- **Start Consultation** - Launch video consultation

## 🎨 Visual Indicators

### Color Coding

**Patient Status:**
- 🟢 **Green/Cyan** - Stable condition
- 🟡 **Amber** - Observation required
- 🔴 **Red** - Critical alert

**Sleep States:**
- 🌙 **Emerald** - Deep Sleep (restful)
- 🌙 **Blue** - Light Sleep (active)
- ☀️ **Orange** - Awake (active)

**Vital Sign Alerts:**
- Heart Rate >150: Red text
- SpO2 <95%: Red text
- Temperature abnormal: Highlighted

### Icons

- 💓 **Heart** - Heart rate
- 🫁 **Wind** - SpO2 (oxygen)
- 🌡️ **Thermometer** - Temperature
- ⏱️ **Timer** - Duration
- 🌙 **Moon** - Sleep state
- ⚡ **Activity** - Awake state
- 🔔 **Bell** - Alerts/notifications
- 👤 **User** - Patient info
- 🏥 **Bed** - Bed/room assignment

## 🔍 Search & Filter

### Search Bar
**Searches across:**
- Patient full name
- Patient ID (e.g., P001)
- Bed number (e.g., 01, 02)

**How to use:**
1. Type in top-right search box
2. Results filter instantly
3. Works across all views

### Unit Filter (Dashboard View)
**Filter by clinical unit:**
1. Use dropdown on dashboard
2. Select "All Units", "NICU Zone A", or "NICU Zone B"
3. Shows only patients in selected unit

## 🗑️ Data Management

### Delete Patient

**Steps:**
1. Go to Registry view
2. Find patient row
3. Click trash icon (🗑️)
4. Confirm deletion
5. Patient removed from system

**Confirmation Dialog:**
- "Are you sure you want to remove this patient from the registry?"
- Prevents accidental deletions

**What gets deleted:**
- Patient record
- Associated data
- **Note:** AI reports and history remain for audit

### Edit Patient

**Steps:**
1. Click edit icon (✏️) in registry
2. Or click "Edit Patient Record" in detail modal
3. Redirects to patient edit page
4. Modify information
5. Save changes

### Export Data

**Steps:**
1. Go to Registry view
2. Click "Export Data" button
3. CSV file downloads automatically

**CSV Contains:**
- Patient ID
- Name
- Age (months)
- Bed number
- Status
- Heart Rate
- SpO2
- Temperature
- AI Confidence
- Sleep State
- Alert Count

**Use cases:**
- Reporting to management
- Medical records
- Data analysis
- Backup

## 📱 Real-Time Updates

**Auto-Refresh:**
- Dashboard updates every 2 seconds
- Fetches latest room status
- Updates patient vitals
- Refreshes AI confidence
- Updates alert counts

**What Updates in Real-Time:**
- Patient status (Stable → Critical)
- Vital signs (HR, SpO2, Temp)
- Sleep state changes
- AI confidence levels
- Alert counts
- Last update timestamps

## 🎯 Workflow Examples

### Example 1: Monitoring Routine

1. **Login** to NeoCare dashboard
2. **View Dashboard** - Check all patients at a glance
3. **Look for red cards** - Identify critical patients
4. **Click critical patient** - View details
5. **Review vitals** - Check HR, SpO2, Temp
6. **Start consultation** if needed
7. **Acknowledge alert** when addressed

### Example 2: Patient Admission

1. Click **"Add Patient"** in Registry
2. Fill patient information form
3. Assign to specific bed/unit
4. Patient appears in dashboard
5. AI monitoring starts automatically
6. View in clinical units view

### Example 3: End of Shift Report

1. Go to **Registry** view
2. Review all patients
3. Click **"Export Data"**
4. Download CSV
5. Share with next shift/management
6. Check **Critical Alerts** tab
7. Acknowledge handled alerts

### Example 4: Unit Capacity Check

1. Go to **Clinical Units** tab
2. View occupancy percentages
3. Identify units nearing capacity
4. Plan patient assignments
5. Check critical counts per unit
6. Coordinate with other zones

## 🔔 Alert Management

### Alert Workflow

**When Critical Alert Appears:**
1. **Critical banner** shows at top
2. **Bell icon** in header shows red dot
3. **Critical Alerts tab** shows badge count
4. **Patient card** highlighted in red

**Handling Alerts:**
1. Click **"View Details"** on banner or in Alerts tab
2. Review patient vitals
3. Take necessary action
4. Click **"Acknowledge"** to mark as handled
5. Alert count decreases

**Alert Types:**
- **Critical:** Requires immediate response
- **Observation:** Requires monitoring
- **Stable:** No action needed

## 📊 Data Sources

**Patient Data:** From `/api/patients`
- Personal information
- Medical history
- Allergies, medications
- Emergency contacts

**Room Status:** From `/api/rooms`
- Real-time status
- AI module output
- Online/offline state
- Last seen timestamp

**AI Reports:** From `/api/reports`
- Detection results
- Alert levels
- Confidence scores
- Historical data

## 🎓 Tips & Best Practices

### For Monitoring

1. **Check critical alerts first** - Always address red cards
2. **Use unit filter** - Focus on one zone at a time
3. **Watch AI confidence** - Low confidence may need review
4. **Monitor sleep patterns** - Extended awake time may be concerning
5. **Set regular reviews** - Check registry every shift

### For Data Management

1. **Export data regularly** - Daily backups recommended
2. **Confirm before delete** - Patient removal is permanent
3. **Keep records updated** - Edit patient info as needed
4. **Monitor occupancy** - Plan admissions based on capacity
5. **Acknowledge all alerts** - Keep alert list clean

### For Efficiency

1. **Use search** - Faster than scrolling
2. **Filter by unit** - Focus on your assigned zone
3. **Click patient cards** - Quick access to full details
4. **Use keyboard** - Tab through forms
5. **Watch timestamps** - Know when last updated

## 🚀 Quick Actions

| Action | Where | Shortcut |
|--------|-------|----------|
| Search patient | Top right | Start typing |
| View details | Click patient card | - |
| Add patient | Registry → Add Patient | - |
| Export data | Registry → Export | - |
| Delete patient | Registry → Trash icon | Confirm prompt |
| Edit patient | Registry → Edit icon | Opens edit page |
| Acknowledge alert | Alerts → Acknowledge | - |
| Filter by unit | Dashboard → Dropdown | Select unit |

## 📞 Support

**If something doesn't work:**
1. Refresh the page (F5)
2. Check network connection
3. Verify AI agents are running
4. Check browser console for errors
5. Restart servers if needed

**Common Issues:**
- **No patients showing:** Run `npm run seed` to add sample data
- **Not updating:** Check AI agents are sending data
- **Can't delete:** Check permissions/authentication
- **Export not working:** Check browser allows downloads

---

**The Complete NeoCare Dashboard is now your comprehensive solution for neonatal patient monitoring, management, and data analytics!** 🏥👶✨
