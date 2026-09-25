import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { auth } from "../middleware/auth.js";
const router=Router();
const schema=z.object({email:z.string().email(),password:z.string().min(6)});
router.post("/login",async(req,res)=>{
  const parsed=schema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({message:"Email et mot de passe invalides"});
  const user=await prisma.user.findUnique({where:{email:parsed.data.email}});
  if(!user || !user.isActive || !(await bcrypt.compare(parsed.data.password,user.passwordHash)))
    return res.status(401).json({message:"Identifiants invalides"});
  const token=jwt.sign({sub:user.id,schoolId:user.schoolId,role:user.role,email:user.email},process.env.JWT_SECRET||"dev-secret",{expiresIn:"8h"});
  res.json({token,role:user.role,user:{id:user.id,email:user.email,firstName:user.firstName,lastName:user.lastName}});
});
router.get("/me", auth, async(req,res)=>{
  const id=req.user?.sub;
  if(!id) return res.status(401).json({message:"Non authentifié"});
  const user=await prisma.user.findUnique({where:{id},select:{id:true,email:true,firstName:true,lastName:true,role:true,schoolId:true}});
  res.json(user);
});
export default router;
