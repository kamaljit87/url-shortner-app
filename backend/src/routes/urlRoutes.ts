import { Router } from 'express';
import * as urlController from '../controllers/urlController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { createUrlSchema, updateUrlSchema } from '../validation/urlValidation';

const router = Router();

router.use(authenticate);

router.post('/', validate(createUrlSchema), asyncHandler(urlController.createUrl));
router.get('/', asyncHandler(urlController.listUrls));
router.get('/:id', asyncHandler(urlController.getUrl));
router.put('/:id', validate(updateUrlSchema), asyncHandler(urlController.updateUrl));
router.delete('/:id', asyncHandler(urlController.deleteUrl));

export default router;
