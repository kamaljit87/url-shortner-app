import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { generateShortCode } from '../utils/generateShortCode';
import { CreateUrlInput, UpdateUrlInput } from '../validation/urlValidation';

async function generateUniqueShortCode(): Promise<string> {
  let shortCode = generateShortCode();
  let existing = await prisma.shortUrl.findUnique({ where: { shortCode } });

  while (existing) {
    shortCode = generateShortCode();
    existing = await prisma.shortUrl.findUnique({ where: { shortCode } });
  }

  return shortCode;
}

export async function createShortUrl(userId: string, input: CreateUrlInput) {
  const customAlias = input.customAlias?.trim() || undefined;

  if (customAlias) {
    const aliasTaken = await prisma.shortUrl.findFirst({
      where: { OR: [{ customAlias }, { shortCode: customAlias }] },
    });
    if (aliasTaken) {
      throw new AppError('This custom alias is already taken', 409);
    }
  }

  const shortCode = await generateUniqueShortCode();

  return prisma.shortUrl.create({
    data: {
      originalUrl: input.originalUrl,
      shortCode,
      customAlias,
      userId,
    },
  });
}

export async function listUserUrls(userId: string) {
  return prisma.shortUrl.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserUrlById(userId: string, id: string) {
  const url = await prisma.shortUrl.findFirst({ where: { id, userId } });

  if (!url) {
    throw new AppError('Short URL not found', 404);
  }

  return url;
}

export async function updateShortUrl(userId: string, id: string, input: UpdateUrlInput) {
  await getUserUrlById(userId, id);

  const customAlias = input.customAlias?.trim() || undefined;

  if (customAlias) {
    const aliasTaken = await prisma.shortUrl.findFirst({
      where: {
        id: { not: id },
        OR: [{ customAlias }, { shortCode: customAlias }],
      },
    });
    if (aliasTaken) {
      throw new AppError('This custom alias is already taken', 409);
    }
  }

  return prisma.shortUrl.update({
    where: { id },
    data: {
      ...(input.originalUrl ? { originalUrl: input.originalUrl } : {}),
      ...(input.customAlias !== undefined ? { customAlias } : {}),
    },
  });
}

export async function deleteShortUrl(userId: string, id: string) {
  await getUserUrlById(userId, id);
  await prisma.shortUrl.delete({ where: { id } });
}

export async function resolveAndTrackClick(code: string) {
  const url = await prisma.shortUrl.findFirst({
    where: { OR: [{ shortCode: code }, { customAlias: code }] },
  });

  if (!url) {
    throw new AppError('Short URL not found', 404);
  }

  const updated = await prisma.shortUrl.update({
    where: { id: url.id },
    data: {
      clickCount: { increment: 1 },
      lastAccessed: new Date(),
    },
  });

  return updated;
}
