import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

// [BUG_INTENCIONAL_ID_19] One password hashed with MD5 instead of bcrypt
function hashPasswordMD5(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding GymManager Pro database...');

  // Clean existing data
  await prisma.classCheckin.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.modality.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.bodyMeasurement.deleteMany();
  await prisma.student.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.user.deleteMany();

  console.log('  ✓ Cleaned existing data');

  // ============================================
  // USERS
  // ============================================
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Carlos Admin',
        email: 'admin@lifefit.com',
        password: hashPassword('admin123'),
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Maria Recepcionista',
        email: 'recepcao@lifefit.com',
        password: hashPassword('recepcao123'),
        role: 'RECEPTIONIST',
      },
    }),
    prisma.user.create({
      data: {
        name: 'João Professor',
        email: 'joao.prof@lifefit.com',
        // [BUG_INTENCIONAL_ID_19] Password hashed with MD5
        password: hashPasswordMD5('prof123'),
        role: 'INSTRUCTOR',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ana Professora',
        email: 'ana.prof@lifefit.com',
        password: hashPassword('prof123'),
        role: 'INSTRUCTOR',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Pedro Aluno',
        email: 'pedro.aluno@lifefit.com',
        password: hashPassword('aluno123'),
        role: 'STUDENT',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Roberto Instrutor',
        email: 'roberto.inst@lifefit.com',
        password: hashPassword('inst123'),
        role: 'INSTRUCTOR',
      },
    }),
  ]);

  console.log(`  ✓ Created ${users.length} users`);

  // ============================================
  // PLANS
  // ============================================
  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: 'Plano Mensal',
        description: 'Acesso completo à academia por 1 mês',
        durationMonths: 1,
        price: 89.90,
        isActive: true,
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Plano Trimestral',
        description: 'Acesso completo à academia por 3 meses com desconto',
        durationMonths: 3,
        price: 239.70,
        isActive: true,
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Plano Semestral',
        description: 'Acesso completo à academia por 6 meses',
        durationMonths: 6,
        price: 449.40,
        isActive: true,
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Plano Anual',
        description: 'Acesso completo à academia por 12 meses - melhor custo benefício',
        durationMonths: 12,
        price: 779.00,
        isActive: true,
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Plano Estudante',
        description: 'Desconto especial para estudantes - mensal',
        durationMonths: 1,
        price: 59.90,
        isActive: true,
      },
    }),
  ]);

  console.log(`  ✓ Created ${plans.length} plans`);

  // ============================================
  // STUDENTS (30+)
  // ============================================
  const studentData = [
    { name: 'João Silva', cpf: '123.456.789-01', birthDate: new Date('1990-05-15'), phone: '(11) 99999-0001', address: 'Rua das Flores, 100 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Maria Santos', cpf: '234.567.890-12', birthDate: new Date('1988-03-22'), phone: '(11) 99999-0002', address: 'Av. Paulista, 200 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Pedro Oliveira', cpf: '345.678.901-23', birthDate: new Date('1995-07-10'), phone: '(11) 99999-0003', address: 'Rua Augusta, 300 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Ana Costa', cpf: '456.789.012-34', birthDate: new Date('1992-11-08'), phone: '(11) 99999-0004', address: 'Rua Oscar Freire, 400 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Lucas Ferreira', cpf: '567.890.123-45', birthDate: new Date('1997-01-25'), phone: '(11) 99999-0005', address: 'Av. Brigadeiro, 500 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Juliana Lima', cpf: '678.901.234-56', birthDate: new Date('1993-09-30'), phone: '(11) 99999-0006', address: 'Rua Haddock Lobo, 600 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Rafael Souza', cpf: '789.012.345-67', birthDate: new Date('1991-04-17'), phone: '(11) 99999-0007', address: 'Alameda Santos, 700 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Camila Rodrigues', cpf: '890.123.456-78', birthDate: new Date('1996-08-05'), phone: '(11) 99999-0008', address: 'Rua Consolação, 800 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Marcos Almeida', cpf: '901.234.567-89', birthDate: new Date('1989-12-20'), phone: '(11) 99999-0009', address: 'Av. Rebouças, 900 - São Paulo, SP', status: 'INACTIVE' },
    { name: 'Fernanda Pereira', cpf: '012.345.678-90', birthDate: new Date('1994-02-14'), phone: '(11) 99999-0010', address: 'Rua Bela Cintra, 1000 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Gustavo Martins', cpf: '111.222.333-44', birthDate: new Date('1998-06-08'), phone: '(11) 99999-0011', address: 'Rua da Liberdade, 1100 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Isabela Araújo', cpf: '222.333.444-55', birthDate: new Date('1990-10-12'), phone: '(11) 99999-0012', address: 'Av. Ipiranga, 1200 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Thiago Barbosa', cpf: '333.444.555-66', birthDate: new Date('1987-03-03'), phone: '(11) 99999-0013', address: 'Rua Vergueiro, 1300 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Larissa Gomes', cpf: '444.555.666-77', birthDate: new Date('1999-07-21'), phone: '(11) 99999-0014', address: 'Av. Jabaquara, 1400 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Bruno Ribeiro', cpf: '555.666.777-88', birthDate: new Date('1993-05-30'), phone: '(11) 99999-0015', address: 'Rua Domingos de Morais, 1500 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Patrícia Carvalho', cpf: '666.777.888-99', birthDate: new Date('1991-11-15'), phone: '(11) 99999-0016', address: 'Av. Santo Amaro, 1600 - São Paulo, SP', status: 'INACTIVE' },
    { name: 'Diego Nascimento', cpf: '777.888.999-00', birthDate: new Date('1996-01-10'), phone: '(11) 99999-0017', address: 'Rua Funchal, 1700 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Vanessa Moreira', cpf: '888.999.000-11', birthDate: new Date('1994-08-25'), phone: '(11) 99999-0018', address: 'Av. Faria Lima, 1800 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Alexandre Teixeira', cpf: '999.000.111-22', birthDate: new Date('1988-04-07'), phone: '(11) 99999-0019', address: 'Rua Pinheiros, 1900 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Carolina Mendes', cpf: '100.200.300-40', birthDate: new Date('1997-12-01'), phone: '(11) 99999-0020', address: 'Av. Pedroso de Morais, 2000 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Felipe Castro', cpf: '200.300.400-50', birthDate: new Date('1992-06-18'), phone: '(11) 99999-0021', address: 'Rua Teodoro Sampaio, 2100 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Daniela Rocha', cpf: '300.400.500-60', birthDate: new Date('1995-09-09'), phone: '(11) 99999-0022', address: 'Av. Henrique Schaumann, 2200 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Rodrigo Correia', cpf: '400.500.600-70', birthDate: new Date('1990-02-28'), phone: '(11) 99999-0023', address: 'Rua Cardeal Arcoverde, 2300 - São Paulo, SP', status: 'INACTIVE' },
    { name: 'Tatiana Dias', cpf: '500.600.700-80', birthDate: new Date('1993-07-14'), phone: '(11) 99999-0024', address: 'Av. Sumaré, 2400 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Leonardo Freitas', cpf: '600.700.800-90', birthDate: new Date('1986-10-22'), phone: '(11) 99999-0025', address: 'Rua Heitor Penteado, 2500 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Aline Monteiro', cpf: '700.800.900-01', birthDate: new Date('1998-03-16'), phone: '(11) 99999-0026', address: 'Av. Pompéia, 2600 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Ricardo Cunha', cpf: '800.900.100-12', birthDate: new Date('1991-08-04'), phone: '(11) 99999-0027', address: 'Rua Clélia, 2700 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Mariana Lopes', cpf: '900.100.200-23', birthDate: new Date('1994-05-27'), phone: '(11) 99999-0028', address: 'Av. Francisco Matarazzo, 2800 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Eduardo Vieira', cpf: '101.202.303-34', birthDate: new Date('1989-11-11'), phone: '(11) 99999-0029', address: 'Rua Turiassú, 2900 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Priscila Cardoso', cpf: '202.303.404-45', birthDate: new Date('1996-04-19'), phone: '(11) 99999-0030', address: 'Av. Marquês de São Vicente, 3000 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'André Pinto', cpf: '303.404.505-56', birthDate: new Date('1993-01-06'), phone: '(11) 99999-0031', address: 'Rua Barra Funda, 3100 - São Paulo, SP', status: 'ACTIVE' },
    { name: 'Renata Campos', cpf: '404.505.606-67', birthDate: new Date('1997-09-23'), phone: '(11) 99999-0032', address: 'Av. Pacaembu, 3200 - São Paulo, SP', status: 'ACTIVE' },
  ];

  const students = await Promise.all(
    studentData.map((s) =>
      prisma.student.create({
        data: s,
      })
    )
  );

  console.log(`  ✓ Created ${students.length} students`);

  // ============================================
  // BODY MEASUREMENTS
  // ============================================
  const measurementPromises = students.slice(0, 15).map((student, i) =>
    prisma.bodyMeasurement.create({
      data: {
        studentId: student.id,
        weight: 60 + Math.random() * 40,
        height: 1.55 + Math.random() * 0.35,
        bodyFat: 15 + Math.random() * 20,
        chest: 80 + Math.random() * 30,
        waist: 65 + Math.random() * 25,
        hips: 85 + Math.random() * 20,
        arms: 25 + Math.random() * 15,
        thighs: 45 + Math.random() * 20,
        date: new Date(2024, i % 12, 15),
      },
    })
  );
  const measurements = await Promise.all(measurementPromises);
  console.log(`  ✓ Created ${measurements.length} body measurements`);

  // ============================================
  // ENROLLMENTS
  // ============================================
  const now = new Date();
  const enrollmentData = students.slice(0, 25).map((student, i) => {
    const plan = plans[i % plans.length];
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - (i % 6));
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    let status = 'ACTIVE';
    if (i === 8 || i === 15 || i === 22) status = 'CANCELLED';
    if (endDate < now) status = 'EXPIRED';

    return {
      studentId: student.id,
      planId: plan.id,
      startDate,
      endDate,
      status,
    };
  });

  const enrollments = await Promise.all(
    enrollmentData.map((e) => prisma.enrollment.create({ data: e }))
  );
  console.log(`  ✓ Created ${enrollments.length} enrollments`);

  // ============================================
  // INVOICES
  // ============================================
  const invoicePromises: any[] = [];
  enrollments.forEach((enrollment, i) => {
    const plan = plans.find((p) => p.id === enrollment.planId)!;
    const numInvoices = Math.min(plan.durationMonths, 3);

    for (let m = 0; m < numInvoices; m++) {
      const dueDate = new Date(enrollment.startDate);
      dueDate.setMonth(dueDate.getMonth() + m);
      dueDate.setDate(10);

      let status = 'PENDING';
      let paidAt = null;

      if (m === 0 && i < 20) {
        status = 'PAID';
        paidAt = new Date(dueDate);
        paidAt.setDate(paidAt.getDate() - 2);
      } else if (dueDate < now && i >= 20) {
        status = 'OVERDUE';
      } else if (dueDate < now) {
        status = 'PAID';
        paidAt = new Date(dueDate);
        paidAt.setDate(paidAt.getDate() + 1);
      }

      if (enrollment.status === 'CANCELLED') {
        status = 'CANCELLED';
        paidAt = null;
      }

      const monthlyAmount = plan.price / plan.durationMonths;

      invoicePromises.push(
        prisma.invoice.create({
          data: {
            enrollmentId: enrollment.id,
            studentId: enrollment.studentId,
            amount: monthlyAmount,
            discount: 0,
            finalAmount: monthlyAmount,
            dueDate,
            paidAt,
            status,
          },
        })
      );
    }
  });

  const invoices = await Promise.all(invoicePromises);
  console.log(`  ✓ Created ${invoices.length} invoices`);

  // ============================================
  // MODALITIES
  // ============================================
  const modalities = await Promise.all([
    prisma.modality.create({
      data: { name: 'Musculação', description: 'Treino de força e hipertrofia com equipamentos', maxCapacity: 40 },
    }),
    prisma.modality.create({
      data: { name: 'Spinning', description: 'Aula de ciclismo indoor de alta intensidade', maxCapacity: 20 },
    }),
    prisma.modality.create({
      data: { name: 'Yoga', description: 'Prática de yoga para flexibilidade e relaxamento', maxCapacity: 15 },
    }),
    prisma.modality.create({
      data: { name: 'CrossFit', description: 'Treino funcional de alta intensidade', maxCapacity: 25 },
    }),
    prisma.modality.create({
      data: { name: 'Pilates', description: 'Exercícios de baixo impacto para core e postura', maxCapacity: 12 },
    }),
    prisma.modality.create({
      data: { name: 'Zumba', description: 'Dança fitness com ritmos latinos', maxCapacity: 30 },
    }),
  ]);

  console.log(`  ✓ Created ${modalities.length} modalities`);

  // ============================================
  // CLASS SCHEDULES
  // ============================================
  const instructorUsers = users.filter((u) => u.role === 'INSTRUCTOR');
  const scheduleData = [
    { modalityId: modalities[0].id, dayOfWeek: 1, startTime: '06:00', endTime: '07:00', instructorId: instructorUsers[0].id },
    { modalityId: modalities[0].id, dayOfWeek: 3, startTime: '06:00', endTime: '07:00', instructorId: instructorUsers[0].id },
    { modalityId: modalities[0].id, dayOfWeek: 5, startTime: '06:00', endTime: '07:00', instructorId: instructorUsers[0].id },
    { modalityId: modalities[1].id, dayOfWeek: 1, startTime: '08:00', endTime: '09:00', instructorId: instructorUsers[1].id },
    { modalityId: modalities[1].id, dayOfWeek: 3, startTime: '08:00', endTime: '09:00', instructorId: instructorUsers[1].id },
    { modalityId: modalities[2].id, dayOfWeek: 2, startTime: '07:00', endTime: '08:00', instructorId: instructorUsers[1].id },
    { modalityId: modalities[2].id, dayOfWeek: 4, startTime: '07:00', endTime: '08:00', instructorId: instructorUsers[1].id },
    { modalityId: modalities[3].id, dayOfWeek: 1, startTime: '17:00', endTime: '18:00', instructorId: instructorUsers[0].id },
    { modalityId: modalities[3].id, dayOfWeek: 3, startTime: '17:00', endTime: '18:00', instructorId: instructorUsers[0].id },
    { modalityId: modalities[3].id, dayOfWeek: 5, startTime: '17:00', endTime: '18:00', instructorId: instructorUsers[0].id },
    { modalityId: modalities[4].id, dayOfWeek: 2, startTime: '09:00', endTime: '10:00', instructorId: instructorUsers[1].id },
    { modalityId: modalities[4].id, dayOfWeek: 4, startTime: '09:00', endTime: '10:00', instructorId: instructorUsers[1].id },
    { modalityId: modalities[5].id, dayOfWeek: 6, startTime: '10:00', endTime: '11:00', instructorId: instructorUsers[2].id },
  ];

  const schedules = await Promise.all(
    scheduleData.map((s) => prisma.classSchedule.create({ data: s }))
  );
  console.log(`  ✓ Created ${schedules.length} class schedules`);

  // ============================================
  // CLASS CHECK-INS
  // ============================================
  const checkinPromises = [];
  for (let i = 0; i < 20; i++) {
    const student = students[i % students.length];
    const schedule = schedules[i % schedules.length];
    const checkinDate = new Date(now);
    checkinDate.setDate(checkinDate.getDate() - (i * 2));

    checkinPromises.push(
      prisma.classCheckin.create({
        data: {
          classScheduleId: schedule.id,
          studentId: student.id,
          checkinDate,
        },
      })
    );
  }

  const checkins = await Promise.all(checkinPromises);
  console.log(`  ✓ Created ${checkins.length} class check-ins`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:         admin@lifefit.com / admin123');
  console.log('  Recepcionista: recepcao@lifefit.com / recepcao123');
  console.log('  Professor:     ana.prof@lifefit.com / prof123');
  console.log('  Aluno:         pedro.aluno@lifefit.com / aluno123');
  console.log('\n⚠️  Note: joao.prof@lifefit.com has a known auth issue (BUG #19)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
