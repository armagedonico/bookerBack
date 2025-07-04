import { PrismaClient } from "@prisma/client"; 
const prisma = new PrismaClient(); 
export const connect = async function () { 
await prisma.$connect(); 
  console.log("Database connected"); 
}; 
 
export const disconnect = async function () { 
  await prisma.$disconnect(); 
  console.log("Database disconnected"); 
}; 
export default prisma;