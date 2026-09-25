import jwt from "jsonwebtoken";
export function auth(req,res,next){
  const header=req.headers.authorization||"";
  const token=header.startsWith("Bearer ")?header.slice(7):null;
  if(!token) return res.status(401).json({message:"Token requis"});
  try { req.user=jwt.verify(token,process.env.JWT_SECRET||"dev-secret"); next(); }
  catch { return res.status(401).json({message:"Token invalide ou expiré"}); }
}
export const allow=(...roles)=>(req,res,next)=>{
  if(!roles.includes(req.user.role)) return res.status(403).json({message:"Accès refusé"});
  next();
};
