/**
 * EdgeCare-5G Database Seed Script
 * Initializes the database with sample data for demo purposes
 */

import { db } from '../lib/database';

export async function seedDatabase(force: boolean = false) {
  try {
    console.log('[Seed] Starting database seeding...');

    await db.initialize();

    // Check if patients already exist
    const existingPatients = await db.getPatients({ limit: 1 });
    if (existingPatients.length > 0 && !force) {
      console.log('[Seed] Database already contains data. Skipping seed.');
      return;
    }

    // Sample patients data
    const samplePatients = [
      {
        patient_id: 'P001',
        fullName: 'Baby Emma Johnson',
        age: 1,
        gender: 'female' as const,
        roomId: 'R2',
        admissionDate: new Date('2026-02-01').toISOString(),
        contactNumber: '+1-555-0101',
        emergencyContact: 'Sarah Johnson (Mother)',
        emergencyPhone: '+1-555-0102',
        bloodType: 'O+',
        allergies: JSON.stringify(['None']),
        currentMedications: JSON.stringify(['Vitamin D supplements']),
        medicalConditions: JSON.stringify(['Routine neonatal care']),
        doctorAssigned: 'Dr. Emily Chen',
        notes: 'Healthy infant. Monitoring sleep patterns for SIDS prevention.',
        status: 'active' as const,
      },
      {
        patient_id: 'P002',
        fullName: 'Robert Smith',
        age: 78,
        gender: 'male' as const,
        roomId: 'R5',
        admissionDate: new Date('2026-01-28').toISOString(),
        contactNumber: '+1-555-0201',
        emergencyContact: 'Mary Smith (Spouse)',
        emergencyPhone: '+1-555-0202',
        bloodType: 'A+',
        allergies: JSON.stringify(['Penicillin']),
        currentMedications: JSON.stringify([
          'Metformin 500mg (2x daily)',
          'Lisinopril 10mg (1x daily)',
          'Aspirin 81mg (1x daily)',
        ]),
        medicalConditions: JSON.stringify([
          'Type 2 Diabetes',
          'Hypertension',
          'History of falls',
        ]),
        doctorAssigned: 'Dr. Michael Rodriguez',
        notes: 'High fall risk patient. Requires continuous monitoring. Recent hip replacement recovery.',
        status: 'active' as const,
      } as any,
      {
        patient_id: 'P003',
        fullName: 'Margaret Wilson',
        age: 82,
        gender: 'female' as const,
        roomId: 'R7',
        admissionDate: new Date('2026-02-03').toISOString(),
        contactNumber: '+1-555-0301',
        emergencyContact: 'David Wilson (Son)',
        emergencyPhone: '+1-555-0302',
        bloodType: 'AB+',
        allergies: JSON.stringify(['None known']),
        currentMedications: JSON.stringify(['Calcium supplements', 'Vitamin B12', 'Blood pressure medication']),
        medicalConditions: JSON.stringify(['Osteoporosis', 'Mild dementia', 'History of falls']),
        doctorAssigned: 'Dr. Michael Rodriguez',
        notes: 'Elderly patient requiring 24/7 monitoring for fall prevention. Recent admission after minor fall at home.',
        status: 'active' as const,
      } as any,
    ];

    // Insert sample patients
    console.log('[Seed] Inserting sample patients...');
    for (const patientData of samplePatients) {
      try {
        const patient = await db.createPatient(patientData);
        console.log(`[Seed] ✓ Created patient: ${patient.patientId} - ${patient.fullName}`);
      } catch (error) {
        console.error(`[Seed] ✗ Failed to create patient ${patientData.patient_id}:`, error);
      }
    }

    // Create sample AI reports for testing
    console.log('[Seed] Creating sample AI reports...');

    const now = Date.now() / 1000;

    const sampleReports = [
      {
        roomId: 'R2',
        patientId: (await db.getPatients({ limit: 1, offset: 0 }))[0]?.id,
        module: 'NeoCare-AI' as const,
        status: 'SLEEPING',
        confidence: 0.92,
        timestamp: now - 60,
        alertLevel: 'normal' as const,
        bbox: JSON.stringify([120, 80, 200, 150]),
      },
      {
        roomId: 'R5',
        patientId: (await db.getPatients({ limit: 1, offset: 1 }))[0]?.id,
        module: 'GeriCare-AI' as const,
        status: 'NORMAL',
        confidence: 0.88,
        timestamp: now - 30,
        alertLevel: 'normal' as const,
        personIds: JSON.stringify([1]),
      },
      {
        roomId: 'R7',
        patientId: (await db.getPatients({ limit: 1, offset: 2 }))[0]?.id,
        module: 'GeriCare-AI' as const,
        status: 'STANDING',
        confidence: 0.91,
        timestamp: now - 120,
        alertLevel: 'normal' as const,
        personIds: JSON.stringify([1]),
      },
    ];

    for (const reportData of sampleReports) {
      try {
        await db.createReport(reportData);
        console.log(`[Seed] ✓ Created AI report: ${reportData.module} - ${reportData.status}`);
      } catch (error) {
        console.error(`[Seed] ✗ Failed to create report:`, error);
      }
    }

    console.log('[Seed] ✅ Database seeding completed successfully!');
    console.log('[Seed] Sample patients: 3');
    console.log('[Seed] Sample reports: 3');
  } catch (error) {
    console.error('[Seed] ❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase(process.argv.includes('--force'))
    .then(() => {
      console.log('[Seed] Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Seed] Fatal error:', error);
      process.exit(1);
    });
}
