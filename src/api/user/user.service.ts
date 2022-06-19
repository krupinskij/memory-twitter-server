import { Request, User } from '../../model';
import { mapUser } from '../../utils';

const me = async (req: Request): Promise<User> => {
  const twitter = req.twitter;

  if (!twitter) {
    throw new Error('Nie ma twittera');
  }

  const { data: twitterMe } = await twitter.v2.me({
    'user.fields': ['name', 'profile_image_url'],
  });

  return mapUser(twitterMe);
};

export default {
  me,
};
