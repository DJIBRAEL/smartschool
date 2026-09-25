import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import crudRoutes from "./routes/crud.js";
import { auth } from "./middleware/auth.js";

const app=express();
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// Servir les fichiers uploadés
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

if (process.env.NODE_ENV === "production" || process.env.RENDER) { const buildPath = path.join(__dirname, "../../web/dist"); app.use(express.static(buildPath)); } app.get(["/health", "/api/health"], (req, res) => res.json({ status: "ok", service: "SmartSchool API" }));
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1",auth,dashboardRoutes);
app.use("/api/v1",auth,crudRoutes);

if (process.env.NODE_ENV === "production" || process.env.RENDER) { app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "../../web/dist/index.html")); }); } app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:"Erreur interne du serveur"});});
const port=process.env.PORT||3001;
app.listen(port,()=>console.log(`SmartSchool API: http://localhost:${port}/api/health`));
