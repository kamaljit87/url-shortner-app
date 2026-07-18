import { Request, Response } from 'express';
import { env } from '../config/env';
import * as urlService from '../services/urlService';

function toResponseShape(url: {
  id: string;
  originalUrl: string;
  shortCode: string;
  customAlias: string | null;
  clickCount: number;
  createdAt: Date;
  lastAccessed: Date | null;
}) {
  const code = url.customAlias ?? url.shortCode;
  return {
    id: url.id,
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    customAlias: url.customAlias,
    shortUrl: `${env.baseUrl}/${code}`,
    clickCount: url.clickCount,
    createdAt: url.createdAt,
    lastAccessed: url.lastAccessed,
  };
}

export async function createUrl(req: Request, res: Response) {
  const url = await urlService.createShortUrl(req.user!.userId, req.body);
  res.status(201).json(toResponseShape(url));
}

export async function listUrls(req: Request, res: Response) {
  const urls = await urlService.listUserUrls(req.user!.userId);
  res.status(200).json(urls.map(toResponseShape));
}

export async function getUrl(req: Request, res: Response) {
  const url = await urlService.getUserUrlById(req.user!.userId, req.params.id);
  res.status(200).json(toResponseShape(url));
}

export async function updateUrl(req: Request, res: Response) {
  const url = await urlService.updateShortUrl(req.user!.userId, req.params.id, req.body);
  res.status(200).json(toResponseShape(url));
}

export async function deleteUrl(req: Request, res: Response) {
  await urlService.deleteShortUrl(req.user!.userId, req.params.id);
  res.status(204).send();
}
