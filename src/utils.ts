import { UserV2 } from 'twitter-api-v2';

import { User } from './model';

export const mapUser = (user: UserV2): User => ({
  id: user.id,
  name: user.name,
  username: user.username,
  profilePicture: user.profile_image_url?.replace('normal', '200x200'),
});
