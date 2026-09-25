import { prisma } from "../src/prisma.js";

async function main() {
  const school = await prisma.school.findFirst();
  if (!school) return;
  const schoolId = school.id;
  const year = await prisma.schoolYear.findFirst({ where: { schoolId } });
  const term = await prisma.term.findFirst();
  const classroom = await prisma.classroom.findFirst({ where: { schoolId } });

  // Ensure subjects
  const subjectsData = [
    { name: "Sciences & SVT", coefficient: 2 },
    { name: "Histoire - Géo", coefficient: 2 },
    { name: "Anglais", coefficient: 2 },
  ];
  for (const s of subjectsData) {
    const exists = await prisma.subject.findFirst({ where: { schoolId, name: s.name } });
    if (!exists) {
      await prisma.subject.create({ data: { schoolId, name: s.name, coefficient: s.coefficient } });
    }
  }

  // Ensure classroom CM2 for comparison
  const cm2 = await prisma.classroom.findFirst({ where: { schoolId, name: "CM2" } });
  if (!cm2 && year) {
    await prisma.classroom.create({
      data: { schoolId, schoolYearId: year.id, name: "CM2", level: "CM2" }
    });
  }

  // Enroll all students without enrollment
  const students = await prisma.student.findMany({ include: { enrollments: true, user: true } });
  for (const st of students) {
    if (st.enrollments.length === 0 && classroom) {
      await prisma.enrollment.create({
        data: {
          studentId: st.id,
          classroomId: classroom.id,
          status: "ACTIVE"
        }
      });
      console.log("Enrolled:", st.user.firstName);
    }
  }

  // Ensure evaluation exists
  let eval1 = await prisma.evaluation.findFirst();
  if (!eval1 && term) {
    eval1 = await prisma.evaluation.create({
      data: {
        termId: term.id,
        title: "Contrôle Continu N°1",
        type: "CONTROLE_CONTINU",
        maxScore: 20,
        date: new Date()
      }
    });
  }

  // Check grades
  const allSubjects = await prisma.subject.findMany({ where: { schoolId } });
  const existingGrades = await prisma.grade.count();
  if (existingGrades < 8 && eval1) {
    const scores = [14, 16.5, 12, 18, 13.5, 15, 11, 17, 15.5, 16];
    let i = 0;
    for (const st of students) {
      for (const sub of allSubjects.slice(0, 4)) {
        const hasGrade = await prisma.grade.findFirst({ where: { studentId: st.id, subjectId: sub.id } });
        if (!hasGrade) {
          await prisma.grade.create({
            data: {
              studentId: st.id,
              evaluationId: eval1.id,
              subjectId: sub.id,
              score: scores[i % scores.length],
              comment: "Très bon travail et assiduité."
            }
          });
          i++;
        }
      }
    }
    console.log("Added realistic grades");
  }

  // Check attendances
  const existingAtt = await prisma.attendance.count();
  if (existingAtt < 8) {
    const statuses = ["PRESENT", "PRESENT", "PRESENT", "LATE", "PRESENT", "ABSENT"];
    let d = 1;
    for (const st of students) {
      for (const stStatus of statuses.slice(0, 3)) {
        await prisma.attendance.create({
          data: {
            studentId: st.id,
            date: new Date(Date.now() - d * 86400000),
            status: stStatus,
            justified: stStatus === "ABSENT",
            note: stStatus === "LATE" ? "Retard transport" : stStatus === "ABSENT" ? "Certificat médical" : null
          }
        });
        d++;
      }
    }
    console.log("Added realistic attendances");
  }

  // Check invoices & payments
  for (const st of students) {
    const hasInv = await prisma.invoice.findFirst({ where: { studentId: st.id } });
    if (!hasInv) {
      const inv = await prisma.invoice.create({
        data: {
          schoolId,
          studentId: st.id,
          label: "Frais de scolarite T1",
          amount: 75000,
          dueDate: new Date(Date.now() + 15 * 86400000),
          status: "PAID"
        }
      });
      await prisma.payment.create({
        data: {
          invoiceId: inv.id,
          amount: 75000,
          method: "MOBILE_MONEY",
          reference: "PAY-" + Date.now().toString().slice(-6)
        }
      });
      console.log("Added invoice and payment for:", st.user.firstName);
    }
  }

  console.log("Finished enriching data!");
}

main().catch(console.error).finally(() => process.exit(0));
