import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);
  const school = await prisma.school.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "SmartSchool Demo",
      address: "Dakar, Sénégal",
      phone: "+221 77 000 00 00",
      email: "contact@smartschool.local",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@smartschool.local" },
    update: { passwordHash },
    create: {
      schoolId: school.id,
      email: "admin@smartschool.local",
      passwordHash,
      firstName: "Admin",
      lastName: "SmartSchool",
      role: "ADMIN",
    },
  });

  const year = await prisma.schoolYear.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      schoolId: school.id,
      label: "2025-2026",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-06-30"),
    },
  });

  const term = await prisma.term.upsert({
    where: { id: "00000000-0000-0000-0000-000000000011" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000011",
      schoolYearId: year.id,
      label: "Trimestre 1",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-12-20"),
    },
  });

  const classroom = await prisma.classroom.upsert({
    where: { id: "00000000-0000-0000-0000-000000000020" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000020",
      schoolId: school.id,
      schoolYearId: year.id,
      name: "6ème A",
      level: "6ème",
    },
  });

  const math = await prisma.subject.upsert({
    where: { id: "00000000-0000-0000-0000-000000000030" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000030", schoolId: school.id, name: "Mathématiques", coefficient: 3 },
  });

  const french = await prisma.subject.upsert({
    where: { id: "00000000-0000-0000-0000-000000000031" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000031", schoolId: school.id, name: "Français", coefficient: 3 },
  });

  const teacherHash = await bcrypt.hash("Teacher@123", 12);
  const teacherUser = await prisma.user.upsert({
    where: { email: "marie.dupont@smartschool.local" },
    update: {},
    create: {
      schoolId: school.id,
      email: "marie.dupont@smartschool.local",
      passwordHash: teacherHash,
      firstName: "Marie",
      lastName: "Dupont",
      role: "TEACHER",
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: { userId: teacherUser.id, subjects: [math.id, french.id] },
  });

  const studentHash = await bcrypt.hash("Student@123", 12);
  const studentUser = await prisma.user.upsert({
    where: { email: "amadou.fall@smartschool.local" },
    update: {},
    create: {
      schoolId: school.id,
      email: "amadou.fall@smartschool.local",
      passwordHash: studentHash,
      firstName: "Amadou",
      lastName: "Fall",
      role: "STUDENT",
    },
  });

  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: { userId: studentUser.id, matricule: "SS-2025-001" },
  });

  await prisma.enrollment.upsert({
    where: { id: "00000000-0000-0000-0000-000000000040" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000040", studentId: student.id, classroomId: classroom.id },
  });

  const evaluation = await prisma.evaluation.upsert({
    where: { id: "00000000-0000-0000-0000-000000000050" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000050",
      termId: term.id,
      title: "Contrôle n°1",
      type: "CONTROLE_CONTINU",
      maxScore: 20,
      date: new Date("2025-10-15"),
    },
  });

  await prisma.grade.upsert({
    where: { id: "00000000-0000-0000-0000-000000000060" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000060",
      studentId: student.id,
      evaluationId: evaluation.id,
      subjectId: math.id,
      score: 15.5,
    },
  });

  await prisma.attendance.upsert({
    where: { id: "00000000-0000-0000-0000-000000000070" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000070",
      studentId: student.id,
      date: new Date("2025-10-01"),
      status: "ABSENT",
      note: "Non justifiée",
    },
  });

  await prisma.homework.upsert({
    where: { id: "00000000-0000-0000-0000-000000000080" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000080",
      title: "Exercices chapitre 3",
      description: "Pages 45 à 48",
      dueDate: new Date("2025-11-01"),
      subjectId: math.id,
      classroomId: classroom.id,
    },
  });

  await prisma.invoice.upsert({
    where: { id: "00000000-0000-0000-0000-000000000090" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000090",
      schoolId: school.id,
      studentId: student.id,
      label: "Frais de scolarité T1",
      amount: 75000,
      dueDate: new Date("2025-10-31"),
      status: "UNPAID",
    },
  });

  await prisma.timetable.upsert({
    where: { id: "00000000-0000-0000-0000-000000000100" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000100",
      classroomId: classroom.id,
      subjectId: math.id,
      teacherId: teacher.id,
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "09:00",
      room: "Salle 12",
    },
  });

  const admin = await prisma.user.findUnique({ where: { email: "admin@smartschool.local" } });
  await prisma.message.upsert({
    where: { id: "00000000-0000-0000-0000-000000000110" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000110",
      senderId: admin.id,
      receiverId: teacherUser.id,
      content: "Bienvenue sur SmartSchool !",
    },
  });

  console.log("Compte demo: admin@smartschool.local / Admin@123");
  console.log("Enseignant: marie.dupont@smartschool.local / Teacher@123");
  console.log("Élève: amadou.fall@smartschool.local / Student@123");
}

main().finally(() => prisma.$disconnect());
