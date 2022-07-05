import { Request, User } from '../../model';
import { mapUser } from '../../utils';

const me = async (req: Request): Promise<User> => {
  const twitter = req.twitter;
  const { me: sessionMe } = req.session;

  if (sessionMe) {
    return sessionMe;
  }

  if (!twitter) {
    throw new Error('Nie ma twittera');
  }

  const { data: twitterMe } = await twitter.v2.me({
    'user.fields': ['name', 'profile_image_url'],
  });

  const me = mapUser(twitterMe);
  req.session.me = me;

  return me;
};

const getFollowings = async (req: Request, id: string): Promise<User[]> => {
  const twitter = req.twitter;
  const redis = req.redis;

  if (!twitter) {
    throw new Error('Nie ma twittera');
  }

  const cachedFollowingsIds = (await redis?.json.get(`${id}#followings`)) as string[] | null;
  if (cachedFollowingsIds) {
    const cachedFollowings = (await redis?.json.mGet(cachedFollowingsIds, '$')) as User[];

    return cachedFollowings.flatMap((following) => following);
  }

  const { data: twitterFollowings } = await twitter.v2.following(id, {
    'user.fields': ['name', 'profile_image_url'],
  });

  // filter out followings without images
  const filteredFollowings = twitterFollowings
    .filter((following) => !!following.profile_image_url)
    .map((following) => mapUser(following));

  const followingsIds = filteredFollowings.map((following) => following.id);

  await redis?.json.set(`${id}#followings`, '$', followingsIds);
  await redis?.expire(`${id}#followings`, 300);

  const followingsToCache = twitterFollowings.map(mapUser);
  for (let i = 0; i < followingsToCache.length; i++) {
    const following = followingsToCache[i];
    await redis?.json.set(following.id, '$', following);
    await redis?.expire(following.id, 300);
  }

  return filteredFollowings;
};

export default {
  me,
  getFollowings,
};
