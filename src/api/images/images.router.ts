import { Router } from 'express';

import imagesController from './images.controller';

const router = Router();

router.get('/stop', imagesController.stop);

export default router;
