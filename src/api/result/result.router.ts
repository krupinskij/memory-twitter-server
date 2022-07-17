import { Router } from 'express';

import resultController from './result.controller';

const router = Router();

router.post('/', resultController.addResult);

export default router;
