import { z } from 'zod';

const aliasRegex = /^[a-zA-Z0-9_-]+$/;

export const createUrlSchema = z.object({
  originalUrl: z.string().trim().url('Please provide a valid URL'),
  customAlias: z
    .string()
    .trim()
    .min(3, 'Alias must be at least 3 characters long')
    .max(30, 'Alias must be at most 30 characters long')
    .regex(aliasRegex, 'Alias can only contain letters, numbers, hyphens, and underscores')
    .optional()
    .or(z.literal('')),
});

export const updateUrlSchema = z.object({
  originalUrl: z.string().trim().url('Please provide a valid URL').optional(),
  customAlias: z
    .string()
    .trim()
    .min(3, 'Alias must be at least 3 characters long')
    .max(30, 'Alias must be at most 30 characters long')
    .regex(aliasRegex, 'Alias can only contain letters, numbers, hyphens, and underscores')
    .optional()
    .or(z.literal('')),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
export type UpdateUrlInput = z.infer<typeof updateUrlSchema>;
