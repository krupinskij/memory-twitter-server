import { Router } from 'express';

import userController from './user.controller';

const router = Router();

router.get('/me', userController.me);
router.get('/followings', userController.getFollowings);

export default router;
