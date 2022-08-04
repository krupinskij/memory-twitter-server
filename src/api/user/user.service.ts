import { UnauthorizedException } from '../../exception';
import { Request, User } from '../../model';
import { mapUserV1, mapUserV2 } from '../../utils';

const me = async (req: Request): Promise<User> => {
  const twitter = req.twitter;
  const t = req.t;

  const { me: sessionMe } = req.session;

  if (!twitter) {
    throw new UnauthorizedException(t('errors:not-logged'));
  }

  if (sessionMe) {
    return sessionMe;
  }

  const twitterMe = await twitter.currentUser();

  const me = mapUserV1(twitterMe);
  req.session.me = me;

  return me;
};

const getFollowings = async (req: Request, id: string, filtered: boolean): Promise<User[]> => {
  const twitter = req.twitter;
  const redis = req.redis;
  const t = req.t;

  if (!twitter) {
    throw new UnauthorizedException(t('errors:not-logged'));
  }

  const cachedFollowingsIds = (await redis?.json.get(`${id}#followings`)) as string[];
  if (cachedFollowingsIds?.length > 0) {
    const cachedFollowings = (await redis?.json.mGet(cachedFollowingsIds, '$')) as User[];
    const mappedFollowings = cachedFollowings.flatMap((following) => following);

    if (filtered) {
      return mappedFollowings.filter((following) => !!following.pp);
    }

    return mappedFollowings;
  }

  const { data: twitterFollowings = [] } = await twitter.v2.following(id, {
    'user.fields': ['name', 'profile_image_url'],
  });

  // filter out followings without images
  const filteredFollowings = twitterFollowings
    .filter((following) => !!following.profile_image_url)
    .map((following) => mapUserV2(following));

  const followingsIds = filteredFollowings.map((following) => following.id);

  await redis?.json.set(`${id}#followings`, '$', followingsIds);
  await redis?.expire(`${id}#followings`, 300);

  const followingsToCache = twitterFollowings.map(mapUserV2);
  for (let i = 0; i < followingsToCache.length; i++) {
    const following = followingsToCache[i];
    await redis?.json.set(following.id, '$', following);
    await redis?.expire(following.id, 300);
  }

  return filtered ? filteredFollowings : followingsToCache;
};

export default {
  me,
  getFollowings,
};
