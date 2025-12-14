import { ProviderProfile, Service, AvailabilitySlot, ServiceType, MedicalCentre } from './types';

// Generate availability slots for the next 7 days
function generateAvailabilitySlots(providerId: string): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const today = new Date();
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate slots from 9 AM to 6 PM, every hour
    for (let hour = 9; hour < 18; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      slots.push({
        id: `${providerId}-${dateStr}-${hour}`,
        providerId,
        date: dateStr,
        startTime,
        endTime,
        isAvailable: Math.random() > 0.3, // 70% of slots available
        isBooked: false,
      });
    }
  }
  
  return slots;
}

export async function seedDummyProviders(forceUpdate: boolean = false) {
  // Import db here to avoid circular dependency
  const { db } = await import('./db');
  
  // Check if providers already exist
  const existingProviders = await db.getAllProviders();
  if (existingProviders.length > 0 && !forceUpdate) {
    console.log('[SEED] Providers already exist, skipping seed');
    return existingProviders.length;
  }
  
  // If forceUpdate is true, update existing providers with availability slots
  if (existingProviders.length > 0 && forceUpdate) {
    console.log('[SEED] Updating existing providers with availability slots...');
    for (const provider of existingProviders) {
      const availability = generateAvailabilitySlots(provider.id);
      await db.updateProviderProfile(provider.id, {
        availability,
      });
      console.log(`[SEED] Updated availability slots for: ${provider.name}`);
    }
    console.log(`[SEED] Updated ${existingProviders.length} providers with availability slots`);
    return existingProviders.length;
  }

  console.log('[SEED] Creating dummy medical centres...');
  
  // Create medical centres first
  const medicalCentres = [
    {
      name: 'Al-Sabah Medical Centre',
      address: 'Salmiya, Block 10, Street 5',
      phone: '+96522345678',
      email: 'info@alsabahmedical.kw',
      license: 'MC-2024-001',
      status: 'active' as const,
    },
    {
      name: 'Kuwait City Health Clinic',
      address: 'Kuwait City, Al-Sharq District',
      phone: '+96522345679',
      email: 'contact@kuwaitcityhealth.kw',
      license: 'MC-2024-002',
      status: 'active' as const,
    },
    {
      name: 'Home Care Medical Services',
      address: 'Hawalli, Block 2, Street 8',
      phone: '+96522345680',
      email: 'support@homecaremedical.kw',
      license: 'MC-2024-003',
      status: 'active' as const,
    },
  ];

  const createdCentres: MedicalCentre[] = [];
  for (const centreData of medicalCentres) {
    const centre = await db.createMedicalCentre(centreData);
    createdCentres.push(centre);
    console.log(`[SEED] Created medical centre: ${centre.name}`);
  }

  console.log('[SEED] Creating dummy providers...');

  const providers = [
    {
      userId: 'dummy-user-1',
      name: 'Dr. Ahmed Al-Mansouri',
      bio: 'Experienced general practitioner with 15 years of experience in home healthcare. Specialized in family medicine and geriatric care.',
      experience: 15,
      specialty: 'General Practitioner',
      profilePhoto: undefined,
      gallery: [],
      civilId: undefined,
      medicalLicense: undefined,
      iban: 'KW81CBKU0000000000001234567890',
      status: 'approved' as const,
      emergencyAvailable: true,
      services: [
        {
          id: 'service-1-1',
          providerId: '',
          name: 'General Consultation',
          description: 'Comprehensive health check-up and consultation',
          price: 25,
          duration: 30,
          category: 'general_consultation' as ServiceType,
        },
        {
          id: 'service-1-2',
          providerId: '',
          name: 'Blood Pressure Check',
          description: 'Blood pressure monitoring and assessment',
          price: 10,
          duration: 15,
          category: 'blood_test' as ServiceType,
        },
      ],
      maxBookingsPerDay: 10,
    },
    {
      userId: 'dummy-user-2',
      name: 'Dr. Fatima Al-Sabah',
      bio: 'Pediatric specialist with expertise in child healthcare. Available for home visits to provide convenient care for your little ones.',
      experience: 12,
      specialty: 'Pediatrician',
      profilePhoto: undefined,
      gallery: [],
      civilId: undefined,
      medicalLicense: undefined,
      iban: 'KW81CBKU0000000000002345678901',
      status: 'approved' as const,
      emergencyAvailable: true,
      services: [
        {
          id: 'service-2-1',
          providerId: '',
          name: 'Pediatric Consultation',
          description: 'Child health check-up and consultation',
          price: 30,
          duration: 45,
          category: 'pediatric' as ServiceType,
        },
        {
          id: 'service-2-2',
          providerId: '',
          name: 'Vaccination',
          description: 'Child vaccination services',
          price: 20,
          duration: 20,
          category: 'injection' as ServiceType,
        },
      ],
      maxBookingsPerDay: 8,
    },
    {
      userId: 'dummy-user-3',
      name: 'Nurse Sarah Johnson',
      bio: 'Registered nurse specializing in wound care and post-operative care. Available for home nursing services.',
      experience: 8,
      specialty: 'Nursing Care',
      profilePhoto: undefined,
      gallery: [],
      civilId: undefined,
      medicalLicense: undefined,
      iban: 'KW81CBKU0000000000003456789012',
      status: 'approved' as const,
      emergencyAvailable: false,
      services: [
        {
          id: 'service-3-1',
          providerId: '',
          name: 'Wound Dressing',
          description: 'Professional wound care and dressing',
          price: 15,
          duration: 30,
          category: 'wound_care' as ServiceType,
        },
        {
          id: 'service-3-2',
          providerId: '',
          name: 'Nursing Care Visit',
          description: 'General nursing care and monitoring',
          price: 20,
          duration: 60,
          category: 'nursing_care' as ServiceType,
        },
      ],
      maxBookingsPerDay: 12,
    },
    {
      userId: 'dummy-user-4',
      name: 'Dr. Mohammed Al-Kharafi',
      bio: 'Geriatric specialist providing comprehensive care for elderly patients. Home visits available for convenience.',
      experience: 20,
      specialty: 'Geriatrician',
      profilePhoto: undefined,
      gallery: [],
      civilId: undefined,
      medicalLicense: undefined,
      iban: 'KW81CBKU0000000000004567890123',
      status: 'approved' as const,
      emergencyAvailable: true,
      services: [
        {
          id: 'service-4-1',
          providerId: '',
          name: 'Geriatric Consultation',
          description: 'Comprehensive health assessment for elderly patients',
          price: 35,
          duration: 45,
          category: 'geriatric' as ServiceType,
        },
        {
          id: 'service-4-2',
          providerId: '',
          name: 'Medication Review',
          description: 'Review and management of medications',
          price: 25,
          duration: 30,
          category: 'general_consultation' as ServiceType,
        },
      ],
      maxBookingsPerDay: 6,
    },
    {
      userId: 'dummy-user-5',
      name: 'Dr. Layla Al-Mutawa',
      bio: 'Physiotherapist specializing in rehabilitation and pain management. Home physiotherapy sessions available.',
      experience: 10,
      specialty: 'Physiotherapist',
      profilePhoto: undefined,
      gallery: [],
      civilId: undefined,
      medicalLicense: undefined,
      iban: 'KW81CBKU0000000000005678901234',
      status: 'approved' as const,
      emergencyAvailable: false,
      services: [
        {
          id: 'service-5-1',
          providerId: '',
          name: 'Physiotherapy Session',
          description: 'One-on-one physiotherapy session',
          price: 40,
          duration: 60,
          category: 'physiotherapy' as ServiceType,
        },
        {
          id: 'service-5-2',
          providerId: '',
          name: 'Pain Management',
          description: 'Pain assessment and management techniques',
          price: 30,
          duration: 45,
          category: 'physiotherapy' as ServiceType,
        },
      ],
      maxBookingsPerDay: 10,
    },
    {
      userId: 'dummy-user-6',
      name: 'Dr. Khalid Al-Rashid',
      bio: 'General practitioner with emergency medicine training. Available 24/7 for urgent medical needs.',
      experience: 18,
      specialty: 'Emergency Medicine',
      profilePhoto: undefined,
      gallery: [],
      civilId: undefined,
      medicalLicense: undefined,
      iban: 'KW81CBKU0000000000006789012345',
      status: 'approved' as const,
      emergencyAvailable: true,
      services: [
        {
          id: 'service-6-1',
          providerId: '',
          name: 'Emergency Consultation',
          description: 'Urgent medical consultation and treatment',
          price: 50,
          duration: 30,
          category: 'general_consultation' as ServiceType,
        },
        {
          id: 'service-6-2',
          providerId: '',
          name: 'Injection Service',
          description: 'Medical injection administration',
          price: 15,
          duration: 15,
          category: 'injection' as ServiceType,
        },
      ],
      maxBookingsPerDay: 15,
    },
  ];

  // Create dummy users first
  for (let index = 0; index < providers.length; index++) {
    const providerData = providers[index];
    const user = await db.createUser({
      phone: `+965${12345670 + index}`,
      role: 'provider',
      name: providerData.name,
    });

    // Update provider data with correct userId and providerId
    const profile = await db.createProviderProfile({
      userId: user.id,
      name: providerData.name,
      bio: providerData.bio,
      experience: providerData.experience,
      specialty: providerData.specialty,
      profilePhoto: providerData.profilePhoto,
      gallery: providerData.gallery,
      civilId: providerData.civilId,
      medicalLicense: providerData.medicalLicense,
      iban: providerData.iban,
      status: providerData.status,
      emergencyAvailable: providerData.emergencyAvailable,
      services: providerData.services.map(s => ({
        ...s,
        providerId: '', // Will be set after profile creation
      })),
      availability: [],
      maxBookingsPerDay: providerData.maxBookingsPerDay,
    });

    // Generate availability slots
    const availability = generateAvailabilitySlots(profile.id);

    // Update profile with availability slots
    // Note: In Prisma, availability slots are created as part of the profile creation
    // So we need to update the profile to add them
    await db.updateProviderProfile(profile.id, {
      availability,
    });

    console.log(`[SEED] Created provider: ${profile.name} (${profile.specialty})`);
  }

  console.log(`[SEED] Created ${providers.length} dummy providers`);
  return providers.length;
}

