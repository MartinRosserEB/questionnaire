import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // for debug output add {log: ['query', 'info', 'warn', 'error']} to constructor

export default prisma;