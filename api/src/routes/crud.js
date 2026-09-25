import { Router } from "express";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../prisma.js";
import { allow } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../../public/uploads");

function handlePhotoUpload(photoBase64, email) {
  if (!photoBase64 || !photoBase64.startsWith("data:image")) return null;
  const matches = photoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;
  const ext = matches[1].split('/')[1] === 'jpeg' ? 'jpg' : matches[1].split('/')[1];
  const buffer = Buffer.from(matches[2], "base64");
  const filename = `student_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${ext}`;
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}

const router = Router();

const resources = {
  students: { model: "student", include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, photoUrl: true } }, enrollments: { include: { classroom: true } } } },
  teachers: { model: "teacher", include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } } },
  classes: { model: "classroom", include: { schoolYear: true } },
  subjects: { model: "subject" },
  schoolYears: { model: "schoolYear" },
  evaluations: { model: "evaluation", include: { term: true } },
  grades: { model: "grade", include: { student: { include: { user: true } }, subject: true, evaluation: true } },
  attendances: { model: "attendance", include: { student: { include: { user: true } } } },
  attendance: { model: "attendance", include: { student: { include: { user: true } } } },
  invoices: { model: "invoice", include: { student: { include: { user: true } }, payments: true } },
  homeworks: { model: "homework", include: { subject: true, classroom: true } },
  messages: { model: "message", include: { sender: true, receiver: true } },
  timetables: { model: "timetable", include: { classroom: true, subject: true } },
  timetable: { model: "timetable", include: { classroom: true, subject: true } },
  notifications: { model: "notification" },
};

function clean(model, body) {
  const b = { ...body };
  delete b.id;
  delete b.schoolId;
  delete b.createdAt;
  delete b.updatedAt;
  delete b.firstName;
  delete b.lastName;
  delete b.email;
  delete b.password;
  delete b.photoBase64;
  if (model === "student") return { ...b, user: undefined };
  return b;
}

// ─── /users (tous rôles) ────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { schoolId: req.user.schoolId, isActive: true },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
      orderBy: { lastName: "asc" },
    });
    res.json(users);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ─── Routes "mes données" pour STUDENT ─────────────────────────────────────

// Mes notes (STUDENT uniquement)
router.get("/me/grades", allow("STUDENT"), async (req, res) => {
  try {
    const student = await prisma.student.findFirst({ where: { userId: req.user.sub } });
    if (!student) return res.status(404).json({ message: "Profil élève introuvable" });
    const grades = await prisma.grade.findMany({
      where: { studentId: student.id },
      include: { subject: true, evaluation: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(grades);
  } catch { res.status(500).json({ message: "Erreur serveur" }); }
});

// Mes absences (STUDENT uniquement)
router.get("/me/attendances", allow("STUDENT"), async (req, res) => {
  try {
    const student = await prisma.student.findFirst({ where: { userId: req.user.sub } });
    if (!student) return res.status(404).json({ message: "Profil élève introuvable" });
    const attendances = await prisma.attendance.findMany({
      where: { studentId: student.id },
      orderBy: { date: "desc" },
    });
    res.json(attendances);
  } catch { res.status(500).json({ message: "Erreur serveur" }); }
});

// Mes devoirs (STUDENT — via ses classes)
router.get("/me/homeworks", allow("STUDENT"), async (req, res) => {
  try {
    const student = await prisma.student.findFirst({
      where: { userId: req.user.sub },
      include: { enrollments: { include: { classroom: true } } },
    });
    if (!student) return res.status(404).json({ message: "Profil élève introuvable" });
    const classroomIds = student.enrollments.map((e) => e.classroomId);
    const homeworks = await prisma.homework.findMany({
      where: { classroomId: { in: classroomIds } },
      include: { subject: true, classroom: true },
      orderBy: { dueDate: "asc" },
    });
    res.json(homeworks);
  } catch { res.status(500).json({ message: "Erreur serveur" }); }
});

// Mon emploi du temps (STUDENT — via ses classes)
router.get("/me/timetable", allow("STUDENT"), async (req, res) => {
  try {
    const student = await prisma.student.findFirst({
      where: { userId: req.user.sub },
      include: { enrollments: true },
    });
    if (!student) return res.status(404).json({ message: "Profil élève introuvable" });
    const classroomIds = student.enrollments.map((e) => e.classroomId);
    const timetables = await prisma.timetable.findMany({
      where: { classroomId: { in: classroomIds } },
      include: { classroom: true, subject: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    res.json(timetables);
  } catch { res.status(500).json({ message: "Erreur serveur" }); }
});

// Mes cours / emploi du temps (TEACHER — ses créneaux)
router.get("/me/timetable-teacher", allow("TEACHER"), async (req, res) => {
  try {
    const teacher = await prisma.teacher.findFirst({ where: { userId: req.user.sub } });
    if (!teacher) return res.status(404).json({ message: "Profil enseignant introuvable" });
    const timetables = await prisma.timetable.findMany({
      where: { teacherId: teacher.id },
      include: { classroom: true, subject: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    res.json(timetables);
  } catch { res.status(500).json({ message: "Erreur serveur" }); }
});

// ─── Routes CRUD génériques avec protection par rôle ───────────────────────

for (const [name, cfg] of Object.entries(resources)) {

  // ── GET list ──────────────────────────────────────────────────────────────
  router.get(`/${name}`, async (req, res) => {
    const role = req.user.role;

    // STUDENT : ne peut pas accéder aux listes globales sensibles
    if (role === "STUDENT" && ["students", "teachers", "invoices", "grades", "attendances", "attendance"].includes(name)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const args = { include: cfg.include, orderBy: { id: "desc" } };
    if (["students", "teachers"].includes(name)) args.where = { user: { schoolId: req.user.schoolId } };
    else if (["classes", "subjects", "schoolYears", "invoices"].includes(name)) args.where = { schoolId: req.user.schoolId };
    else if (name === "homeworks") args.where = { classroom: { schoolId: req.user.schoolId } };
    else if (["timetables", "timetable"].includes(name)) args.where = { classroom: { schoolId: req.user.schoolId } };
    else if (["attendances", "attendance", "grades"].includes(name)) args.where = { student: { user: { schoolId: req.user.schoolId } } };
    else if (name === "evaluations") args.where = { term: { schoolYear: { schoolId: req.user.schoolId } } };

    // TEACHER : limiter les devoirs à ses classes
    if (role === "TEACHER" && name === "homeworks") {
      const teacher = await prisma.teacher.findFirst({ where: { userId: req.user.sub } });
      const myTimetables = teacher
        ? await prisma.timetable.findMany({ where: { teacherId: teacher.id }, select: { classroomId: true } })
        : [];
      const classroomIds = [...new Set(myTimetables.map((t) => t.classroomId))];
      args.where = { classroomId: { in: classroomIds } };
    }

    try {
      res.json(await prisma[cfg.model].findMany(args));
    } catch {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // ── GET by id ──────────────────────────────────────────────────────────────
  router.get(`/${name}/:id`, async (req, res) => {
    try {
      const item = await prisma[cfg.model].findUnique({ where: { id: req.params.id }, include: cfg.include });
      if (!item) return res.status(404).json({ message: "Introuvable" });
      res.json(item);
    } catch {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // ── POST create ────────────────────────────────────────────────────────────
  // Seuls ADMIN et SUPER_ADMIN peuvent créer des ressources sensibles
  const createAllowed = {
    students: ["ADMIN", "SUPER_ADMIN"],
    teachers: ["ADMIN", "SUPER_ADMIN"],
    schoolYears: ["ADMIN", "SUPER_ADMIN"],
    classes: ["ADMIN", "SUPER_ADMIN"],
    invoices: ["ADMIN", "SUPER_ADMIN", "ACCOUNTANT"],
    subjects: ["ADMIN", "SUPER_ADMIN"],
    grades: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    attendances: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    attendance: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    homeworks: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    timetables: ["ADMIN", "SUPER_ADMIN"],
    timetable: ["ADMIN", "SUPER_ADMIN"],
    messages: ["ADMIN", "SUPER_ADMIN", "TEACHER", "STUDENT"],
    evaluations: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    notifications: ["ADMIN", "SUPER_ADMIN"],
  };

  router.post(`/${name}`, allow(...(createAllowed[name] || ["ADMIN", "SUPER_ADMIN"])), async (req, res) => {
    try {
      if (name === "students" && req.body.email) {
        let photoUrl = handlePhotoUpload(req.body.photoBase64, req.body.email);
        const passwordHash = await bcrypt.hash(req.body.password || "Student@123", 12);
        const item = await prisma.student.create({
          data: {
            matricule: req.body.matricule,
            user: {
              create: {
                schoolId: req.user.schoolId,
                email: req.body.email,
                passwordHash,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                role: "STUDENT",
                photoUrl,
              },
            },
          },
          include: cfg.include,
        });
        return res.status(201).json(item);
      }

      if (name === "teachers" && req.body.email) {
        const passwordHash = await bcrypt.hash(req.body.password || "Teacher@123", 12);
        const item = await prisma.teacher.create({
          data: {
            subjects: req.body.subjects || [],
            user: {
              create: {
                schoolId: req.user.schoolId,
                email: req.body.email,
                passwordHash,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                role: "TEACHER",
              },
            },
          },
          include: cfg.include,
        });
        return res.status(201).json(item);
      }

      const data = clean(cfg.model, req.body);
      if (["classroom", "subject", "schoolYear"].includes(cfg.model)) data.schoolId = req.user.schoolId;
      if (cfg.model === "student" && data.userId) {
        data.user = { connect: { id: data.userId } };
        delete data.userId;
      }
      if (cfg.model === "message") {
        data.senderId = req.user.sub;
      }
      const item = await prisma[cfg.model].create({ data, include: cfg.include });
      res.status(201).json(item);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  // ── PATCH update ───────────────────────────────────────────────────────────
  const updateAllowed = {
    students: ["ADMIN", "SUPER_ADMIN"],
    teachers: ["ADMIN", "SUPER_ADMIN"],
    schoolYears: ["ADMIN", "SUPER_ADMIN"],
    classes: ["ADMIN", "SUPER_ADMIN"],
    invoices: ["ADMIN", "SUPER_ADMIN", "ACCOUNTANT"],
    subjects: ["ADMIN", "SUPER_ADMIN"],
    grades: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    attendances: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    homeworks: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    timetables: ["ADMIN", "SUPER_ADMIN"],
    messages: ["ADMIN", "SUPER_ADMIN"],
    evaluations: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    notifications: ["ADMIN", "SUPER_ADMIN"],
  };

  router.patch(`/${name}/:id`, allow(...(updateAllowed[name] || ["ADMIN", "SUPER_ADMIN"])), async (req, res) => {
    try {
      if (name === "students" && (req.body.firstName || req.body.lastName || req.body.email || req.body.photoBase64)) {
        const student = await prisma.student.findUnique({ where: { id: req.params.id } });
        if (!student) return res.status(404).json({ message: "Introuvable" });
        
        let updateData = { firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email };
        if (req.body.photoBase64 && req.body.email) {
          const newPhotoUrl = handlePhotoUpload(req.body.photoBase64, req.body.email);
          if (newPhotoUrl) updateData.photoUrl = newPhotoUrl;
        }

        await prisma.user.update({
          where: { id: student.userId },
          data: updateData,
        });
      }
      if (name === "teachers" && (req.body.firstName || req.body.lastName || req.body.email)) {
        const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } });
        if (!teacher) return res.status(404).json({ message: "Introuvable" });
        await prisma.user.update({
          where: { id: teacher.userId },
          data: { firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email },
        });
      }

      const item = await prisma[cfg.model].update({
        where: { id: req.params.id },
        data: clean(cfg.model, req.body),
        include: cfg.include,
      });
      res.json(item);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const deleteAllowed = {
    students: ["ADMIN", "SUPER_ADMIN"],
    teachers: ["ADMIN", "SUPER_ADMIN"],
    schoolYears: ["ADMIN", "SUPER_ADMIN"],
    classes: ["ADMIN", "SUPER_ADMIN"],
    invoices: ["ADMIN", "SUPER_ADMIN"],
    subjects: ["ADMIN", "SUPER_ADMIN"],
    grades: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    attendances: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    homeworks: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    timetables: ["ADMIN", "SUPER_ADMIN"],
    messages: ["ADMIN", "SUPER_ADMIN"],
    evaluations: ["ADMIN", "SUPER_ADMIN", "TEACHER"],
    notifications: ["ADMIN", "SUPER_ADMIN"],
  };

  router.delete(`/${name}/:id`, allow(...(deleteAllowed[name] || ["ADMIN", "SUPER_ADMIN"])), async (req, res) => {
    try {
      await prisma[cfg.model].delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });
}

export default router;
