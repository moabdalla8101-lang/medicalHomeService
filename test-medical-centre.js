// Quick test script to check medical centre setup
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // Get all medical centres
    const centres = await prisma.medicalCentre.findMany();
    console.log('Medical Centres:', centres.length);
    centres.forEach(c => console.log(`  - ${c.name} (${c.id})`));
    
    // Get all providers with medical centres
    const providers = await prisma.providerProfile.findMany({
      include: { medicalCentre: true }
    });
    console.log('\nProviders with Medical Centres:', providers.length);
    providers.forEach(p => {
      console.log(`  - ${p.name}: ${p.medicalCentreId ? p.medicalCentre?.name : 'No centre'}`);
    });
    
    // Get users with medical_centre role
    const mcUsers = await prisma.user.findMany({
      where: { role: 'medical_centre' },
      include: { medicalCentre: true }
    });
    console.log('\nMedical Centre Admin Users:', mcUsers.length);
    mcUsers.forEach(u => {
      console.log(`  - ${u.phone}: ${u.medicalCentreId ? u.medicalCentre?.name : 'No centre assigned'}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
