import { stringify } from 'querystring';

import { Request, User } from '../../model';
import { getRandomIndexes, mapUser } from '../../utils';

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

  const { data: twitterFollowings } = await twitter.v2.following(id, {
    'user.fields': ['name', 'profile_image_url'],
  });

  const filteredFollowings = twitterFollowings
    .filter((following) => !!following.profile_image_url)
    .map((following) => mapUser(following));

  const followingsIds = filteredFollowings.map((following) => following.id);
  const followingsObj = filteredFollowings.reduce<Record<string, User>>((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});

  await redis?.json.set('users', '$', followingsObj);
  await redis?.expire('users', 300);

  await redis?.json.set('followings', `$.${id}`, followingsIds);
  await redis?.expire('followings', 300);

  return filteredFollowings;
};

export default {
  me,
  getFollowings,
};
