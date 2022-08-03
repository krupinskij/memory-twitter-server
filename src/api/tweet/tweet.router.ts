import { Router } from 'express';

import tweetController from './tweet.controller';

const router = Router();

router.post('/:tweetId', tweetController.sendTweet);

export default router;
