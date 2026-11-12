import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';
import { createPrismaClient, PrismaClient } from '@freitty/db';
import { loadContext } from './context';
import { generateOrder } from './generate-order';
import { saveOrder } from './save-order';

interface Secrets {
  prisma: PrismaClient;
  openAiApiKey: string;
}

const ssm = new SSMClient({});
let secrets: Secrets | undefined;

async function loadSecrets(): Promise<Secrets> {
  const databaseUrlName = process.env.DATABASE_URL_PARAMETER ?? '';
  const openAiApiKeyName = process.env.OPENAI_API_KEY_PARAMETER ?? '';

  const { Parameters = [] } = await ssm.send(
    new GetParametersCommand({ Names: [databaseUrlName, openAiApiKeyName], WithDecryption: true }),
  );
  const value = (name: string) => Parameters.find((parameter) => parameter.Name === name)?.Value ?? '';

  return { prisma: createPrismaClient(value(databaseUrlName)), openAiApiKey: value(openAiApiKeyName) };
}

export async function handler(): Promise<{ number: string }> {
  secrets ??= await loadSecrets();
  const { prisma, openAiApiKey } = secrets;

  const context = await loadContext(prisma);
  const order = await generateOrder(context, { apiKey: openAiApiKey, model: process.env.OPENAI_MODEL });
  const number = await saveOrder(prisma, order, context);
  console.log(`Created order ${number}`);
  return { number };
}
