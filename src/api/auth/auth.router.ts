import { Router } from 'express';

import authController from './auth.controller';

const router = Router();

router.get('/link', authController.link);
router.get('/callback', authController.callback);
router.post('/logout', authController.logout);

export default router;
