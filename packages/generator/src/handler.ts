import { createPrismaClient } from '@freitty/db';
import { loadContext } from './context';
import { generateOrder } from './generate-order';
import { saveOrder } from './save-order';

const prisma = createPrismaClient(process.env.DATABASE_URL ?? '');

export async function handler(): Promise<{ number: string }> {
  const context = await loadContext(prisma);
  const order = await generateOrder(context, { apiKey: process.env.OPENAI_API_KEY ?? '', model: process.env.OPENAI_MODEL });
  const number = await saveOrder(prisma, order, context);
  console.log(`Created order ${number}`);
  return { number };
}
