import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { createPrismaClient, PrismaClient } from '@freitty/db';

@Global()
@Module({
  providers: [{ provide: PrismaClient, useFactory: () => createPrismaClient(process.env.DATABASE_URL!) }],
  exports: [PrismaClient],
})
export class DbModule implements OnApplicationShutdown {
  constructor(private readonly prisma: PrismaClient) {}

  async onApplicationShutdown() {
    await this.prisma.$disconnect();
  }
}
