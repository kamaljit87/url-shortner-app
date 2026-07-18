import { Router } from 'express';
import * as redirectController from '../controllers/redirectController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/:code', asyncHandler(redirectController.redirectToOriginalUrl));

export default router;
