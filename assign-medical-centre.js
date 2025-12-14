// Script to assign medical centre admins to medical centres
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignAdmins() {
  try {
    // Get all medical centres
    const centres = await prisma.medicalCentre.findMany();
    console.log('Medical Centres:', centres.length);
    
    // Get users with medical_centre role but no medicalCentreId
    const mcUsers = await prisma.user.findMany({
      where: { 
        role: 'medical_centre',
        medicalCentreId: null
      }
    });
    console.log('\nUnassigned Medical Centre Admins:', mcUsers.length);
    
    // Assign each admin to a medical centre (round-robin)
    for (let i = 0; i < mcUsers.length && i < centres.length; i++) {
      const user = mcUsers[i];
      const centre = centres[i];
      
      await prisma.user.update({
        where: { id: user.id },
        data: { medicalCentreId: centre.id }
      });
      
      console.log(`✅ Assigned ${user.phone} to ${centre.name}`);
    }
    
    // Verify assignments
    const assigned = await prisma.user.findMany({
      where: { role: 'medical_centre' },
      include: { medicalCentre: true }
    });
    
    console.log('\n✅ All Medical Centre Admins:');
    assigned.forEach(u => {
      console.log(`  - ${u.phone}: ${u.medicalCentre?.name || 'No centre'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignAdmins();
