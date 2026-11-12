import { PrismaClient } from '@freitty/db';
import { GeneratorContext } from './types';

export async function loadContext(prisma: PrismaClient): Promise<GeneratorContext> {
  const [hubs, carriers] = await Promise.all([
    prisma.hub.findMany({ select: { id: true, name: true, region: true, docks: { select: { id: true, number: true } } } }),
    prisma.carrier.findMany({
      select: { id: true, name: true, trucks: { select: { id: true, number: true, trailerType: true } } },
    }),
  ]);
  return { today: new Date().toISOString(), hubs, carriers };
}
