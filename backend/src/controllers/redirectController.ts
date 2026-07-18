import { Request, Response } from 'express';
import * as urlService from '../services/urlService';

export async function redirectToOriginalUrl(req: Request, res: Response) {
  const url = await urlService.resolveAndTrackClick(req.params.code);
  res.redirect(302, url.originalUrl);
}
