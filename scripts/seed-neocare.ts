/**
 * NeoCare Comprehensive Database Seed Script
 * Creates realistic patient data, room status, and AI reports for testing
 */

import { db } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate realistic vital signs
function generateVitals(status: 'stable' | 'critical' | 'observation') {
  const baseVitals = {
    stable: {
      heartRate: { min: 100, max: 140 },
      spo2: { min: 96, max: 100 },
      temperature: { min: 36.5, max: 37.2 },
      confidence: { min: 85, max: 98 },
    },
    observation: {
      heartRate: { min: 140, max: 160 },
      spo2: { min: 92, max: 96 },
      temperature: { min: 37.2, max: 37.8 },
      confidence: { min: 70, max: 85 },
    },
    critical: {
      heartRate: { min: 160, max: 200 },
      spo2: { min: 85, max: 92 },
      temperature: { min: 37.8, max: 38.5 },
      confidence: { min: 90, max: 98 },
    },
  };

  const range = baseVitals[status];
  return {
    heartRate: Math.floor(Math.random() * (range.heartRate.max - range.heartRate.min) + range.heartRate.min),
    spo2: Math.floor(Math.random() * (range.spo2.max - range.spo2.min) + range.spo2.min),
    temperature: Number((Math.random() * (range.temperature.max - range.temperature.min) + range.temperature.min).toFixed(1)),
    confidence: Math.floor(Math.random() * (range.confidence.max - range.confidence.min) + range.confidence.min),
  };
}

// Sleep states with realistic durations
const sleepStates = [
  { state: 'deep-sleep', duration: '2h 15m' },
  { state: 'light-sleep', duration: '1h 30m' },
  { state: 'awake', duration: '45m' },
  { state: 'deep-sleep', duration: '3h 20m' },
  { state: 'light-sleep', duration: '50m' },
];

export async function seedNeoCareDatabase() {
  try {
    console.log('\n========================================');
    console.log('  NeoCare Database Seeding');
    console.log('========================================\n');

    await db.initialize();

    // Clear existing data
    console.log('[1/4] Clearing existing data...');
    await db.execute('DELETE FROM ai_reports WHERE module = ?', ['NeoCare-AI']);
    await db.execute('DELETE FROM room_status WHERE room_id LIKE ?', ['R%']);
    await db.execute('DELETE FROM patients WHERE patient_id LIKE ?', ['NEO%']);

    // Define comprehensive patient data
    console.log('[2/4] Creating infant patients...');

    const infantPatients = [
      // Room R1 - Critical patient
      {
        patient_id: 'NEO001',
        fullName: 'Baby Emma Johnson',
        age: 0,
        gender: 'female' as const,
        roomId: 'R1',
        admissionDate: new Date('2026-02-05').toISOString(),
        contactNumber: '+1-555-1001',
        emergencyContact: 'Sarah Johnson (Mother)',
        emergencyPhone: '+1-555-1002',
        bloodType: 'O+',
        allergies: JSON.stringify(['None']),
        currentMedications: JSON.stringify(['Vitamin K injection', 'Eye prophylaxis']),
        medicalConditions: JSON.stringify(['Premature birth (34 weeks)', 'Respiratory monitoring']),
        doctorAssigned: 'Dr. Emily Chen',
        notes: 'Premature infant requiring close monitoring. High heart rate detected. NICU care.',
        status: 'active' as const,
        vitalSigns: 'critical',
      },

      // Room R2 - Stable patient
      {
        patient_id: 'NEO002',
        fullName: 'Baby Liam Martinez',
        age: 0,
        gender: 'male' as const,
        roomId: 'R2',
        admissionDate: new Date('2026-02-06').toISOString(),
        contactNumber: '+1-555-2001',
        emergencyContact: 'Maria Martinez (Mother)',
        emergencyPhone: '+1-555-2002',
        bloodType: 'A+',
        allergies: JSON.stringify(['None']),
        currentMedications: JSON.stringify(['Vitamin D supplements', 'Iron supplements']),
        medicalConditions: JSON.stringify(['Healthy full-term infant']),
        doctorAssigned: 'Dr. Emily Chen',
        notes: 'Routine neonatal care. All vitals stable. Sleep pattern monitoring for SIDS prevention.',
        status: 'active' as const,
        vitalSigns: 'stable',
      },

      // Room R3 - Observation patient
      {
        patient_id: 'NEO003',
        fullName: 'Baby Sophia Chen',
        age: 0,
        gender: 'female' as const,
        roomId: 'R3',
        admissionDate: new Date('2026-02-04').toISOString(),
        contactNumber: '+1-555-3001',
        emergencyContact: 'Linda Chen (Mother)',
        emergencyPhone: '+1-555-3002',
        bloodType: 'B+',
        allergies: JSON.stringify(['None']),
        currentMedications: JSON.stringify(['Antibiotic (prophylactic)', 'Vitamin supplements']),
        medicalConditions: JSON.stringify(['Jaundice (mild)', 'Phototherapy treatment']),
        doctorAssigned: 'Dr. Michael Rodriguez',
        notes: 'Under observation for jaundice. Bilirubin levels monitored. Phototherapy in progress.',
        status: 'active' as const,
        vitalSigns: 'observation',
      },

      // Room R4 - Stable patient
      {
        patient_id: 'NEO004',
        fullName: 'Baby Noah Williams',
        age: 0,
        gender: 'male' as const,
        roomId: 'R4',
        admissionDate: new Date('2026-02-07').toISOString(),
        contactNumber: '+1-555-4001',
        emergencyContact: 'Jessica Williams (Mother)',
        emergencyPhone: '+1-555-4002',
        bloodType: 'AB+',
        allergies: JSON.stringify(['None']),
        currentMedications: JSON.stringify(['Vitamin K', 'Hepatitis B vaccine']),
        medicalConditions: JSON.stringify(['Healthy newborn', 'Post-vaccination monitoring']),
        doctorAssigned: 'Dr. Emily Chen',
        notes: 'Newborn admitted for standard post-delivery care. All systems normal.',
        status: 'active' as const,
        vitalSigns: 'stable',
      },

      // Room R1 - Additional critical patient (Bed 01B)
      {
        patient_id: 'NEO005',
        fullName: 'Baby Olivia Davis',
        age: 0,
        gender: 'female' as const,
        roomId: 'R1',
        admissionDate: new Date('2026-02-03').toISOString(),
        contactNumber: '+1-555-5001',
        emergencyContact: 'Amanda Davis (Mother)',
        emergencyPhone: '+1-555-5002',
        bloodType: 'O-',
        allergies: JSON.stringify(['None']),
        currentMedications: JSON.stringify(['Caffeine citrate', 'Surfactant therapy']),
        medicalConditions: JSON.stringify(['Respiratory distress syndrome', 'Premature (32 weeks)']),
        doctorAssigned: 'Dr. Michael Rodriguez',
        notes: 'Critical care. Oxygen saturation fluctuating. Continuous monitoring required.',
        status: 'active' as const,
        vitalSigns: 'critical',
      },

      // Room R3 - Additional observation patient
      {
        patient_id: 'NEO006',
        fullName: 'Baby Ethan Brown',
        age: 0,
        gender: 'male' as const,
        roomId: 'R3',
        admissionDate: new Date('2026-02-05').toISOString(),
        contactNumber: '+1-555-6001',
        emergencyContact: 'Rebecca Brown (Mother)',
        emergencyPhone: '+1-555-6002',
        bloodType: 'A-',
        allergies: JSON.stringify(['None']),
        currentMedications: JSON.stringify(['Gentamicin', 'Ampicillin']),
        medicalConditions: JSON.stringify(['Suspected sepsis', 'Antibiotic therapy']),
        doctorAssigned: 'Dr. Emily Chen',
        notes: 'Under observation for infection. Blood cultures pending. IV antibiotics administered.',
        status: 'active' as const,
        vitalSigns: 'observation',
      },
    ];

    // Insert patients
    const patientIds: string[] = [];
    for (const patient of infantPatients) {
      const result = await db.createPatient(patient as any);
      patientIds.push(result.id);
      console.log(`   ✓ Created patient: ${patient.fullName} (${patient.patient_id}) - ${patient.vitalSigns}`);
    }

    // Create room status entries
    console.log('\n[3/4] Creating room status data...');

    // Group patients by room and pick one per room (prioritize critical patients)
    const roomMap = new Map<string, { patient: any; patientId: string; index: number }>();
    infantPatients.forEach((patient, index) => {
      const existing = roomMap.get(patient.roomId);
      // Prioritize critical patients, then observation, then stable
      if (!existing ||
          (patient.vitalSigns === 'critical') ||
          (patient.vitalSigns === 'observation' && existing.patient.vitalSigns === 'stable')) {
        roomMap.set(patient.roomId, { patient, patientId: patientIds[index], index });
      }
    });

    const roomStatuses = Array.from(roomMap.values()).map(({ patient, patientId, index }) => {
      const vitals = generateVitals(patient.vitalSigns as any);
      const sleepData = sleepStates[index % sleepStates.length];

      return {
        room_id: patient.roomId,
        patient_id: patientId,
        status: patient.vitalSigns === 'critical' ? 'critical' : patient.vitalSigns === 'observation' ? 'observation' : 'stable',
        heart_rate: vitals.heartRate,
        spo2: vitals.spo2,
        temperature: vitals.temperature,
        ai_confidence: vitals.confidence,
        sleep_state: sleepData.state,
        sleep_duration: sleepData.duration,
        alert_count: patient.vitalSigns === 'critical' ? Math.floor(Math.random() * 5) + 3 :
                     patient.vitalSigns === 'observation' ? Math.floor(Math.random() * 3) + 1 : 0,
        last_seen: new Date().toISOString(),
        online: true,
      };
    });

    for (const roomStatus of roomStatuses) {
      await db.execute(`
        INSERT OR REPLACE INTO room_status (
          room_id, patient_id, status, heart_rate, spo2, temperature,
          ai_confidence, sleep_state, sleep_duration, alert_count, last_seen, online
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        roomStatus.room_id,
        roomStatus.patient_id,
        roomStatus.status,
        roomStatus.heart_rate,
        roomStatus.spo2,
        roomStatus.temperature,
        roomStatus.ai_confidence,
        roomStatus.sleep_state,
        roomStatus.sleep_duration,
        roomStatus.alert_count,
        roomStatus.last_seen,
        roomStatus.online ? 1 : 0,
      ]);
      console.log(`   ✓ Room ${roomStatus.room_id}: HR=${roomStatus.heart_rate}, SpO2=${roomStatus.spo2}%, Temp=${roomStatus.temperature}°C`);
    }

    // Create AI reports
    console.log('\n[4/4] Creating AI detection reports...');

    for (let i = 0; i < infantPatients.length; i++) {
      const patient = infantPatients[i];
      const roomStatus = roomStatuses[i];

      // Create 3-5 recent reports per patient
      const reportCount = Math.floor(Math.random() * 3) + 3;

      for (let j = 0; j < reportCount; j++) {
        const timestamp = new Date(Date.now() - (j * 2000)); // 2 seconds apart
        const vitals = generateVitals(patient.vitalSigns as any);

        const report = {
          report_id: `${patient.roomId}-${Date.now()}-${j}`,
          room_id: patient.roomId,
          module: 'NeoCare-AI',
          status: patient.vitalSigns,
          confidence: vitals.confidence,
          predictions: JSON.stringify({
            sleep_state: roomStatuses.find(rs => rs.room_id === patient.roomId)?.sleep_state || 'deep-sleep',
            movement_detected: Math.random() > 0.5,
            breathing_regular: patient.vitalSigns !== 'critical',
            position: ['supine', 'lateral', 'prone'][Math.floor(Math.random() * 3)],
          }),
          bbox: JSON.stringify([[120, 80, 480, 360]]), // Bounding box for infant detection
          alert_level: patient.vitalSigns === 'critical' ? 'high' :
                      patient.vitalSigns === 'observation' ? 'medium' : 'low',
          metadata: JSON.stringify({
            heart_rate: vitals.heartRate,
            spo2: vitals.spo2,
            temperature: vitals.temperature,
            sleep_duration: roomStatuses.find(rs => rs.room_id === patient.roomId)?.sleep_duration || '2h',
            model_version: '1.5.2',
            processing_time_ms: Math.floor(Math.random() * 50) + 20,
          }),
          timestamp: timestamp.getTime() / 1000, // Convert to Unix timestamp in seconds
        };

        await db.execute(`
          INSERT INTO ai_reports (
            report_id, room_id, module, status, confidence, predictions, bbox,
            alert_level, metadata, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          report.report_id,
          report.room_id,
          report.module,
          report.status,
          report.confidence,
          report.predictions,
          report.bbox,
          report.alert_level,
          report.metadata,
          report.timestamp,
        ]);
      }
      console.log(`   ✓ Created ${reportCount} AI reports for ${patient.fullName}`);
    }

    // Create consultation logs
    console.log('\n[5/5] Creating consultation logs...');

    await db.execute(`
      INSERT INTO consultation_logs (
        patient_id, doctor_name, consultation_type, start_time, end_time,
        duration_seconds, notes, quality_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      patientIds[0], // Critical patient
      'Dr. Emily Chen',
      'emergency',
      new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
      600, // 10 minutes
      'Emergency consultation for premature infant. Respiratory support adjusted.',
      5,
    ]);
    console.log('   ✓ Created consultation log for critical patient');

    // Summary
    console.log('\n========================================');
    console.log('  ✓ Database Seeding Complete');
    console.log('========================================');
    console.log(`  Patients created:     ${infantPatients.length}`);
    console.log(`  Room statuses:        ${roomStatuses.length}`);
    console.log(`  AI reports:           ${infantPatients.length * 4} (avg)`);
    console.log(`  Consultations:        1`);
    console.log('========================================\n');

    console.log('Patient Summary:');
    console.log('  Room R1: 2 patients (CRITICAL - Premature infants)');
    console.log('  Room R2: 1 patient  (STABLE - Healthy full-term)');
    console.log('  Room R3: 2 patients (OBSERVATION - Jaundice, Sepsis)');
    console.log('  Room R4: 1 patient  (STABLE - Healthy newborn)');
    console.log('\nAccess the dashboard at: http://localhost:3000/neocare/complete\n');

  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedNeoCareDatabase()
    .then(() => {
      console.log('Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedNeoCareDatabase;
