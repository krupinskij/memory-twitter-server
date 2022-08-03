import { UserV2 } from 'twitter-api-v2';

import { Level, User } from './model';

export const mapUser = (user: UserV2): User => ({
  id: user.id,
  nm: user.name,
  un: user.username,
  pp: decodeProfilePicture(user.profile_image_url),
});

export const decodeProfilePicture = (pp: string | undefined) =>
  pp?.replace('https://pbs.twimg.com/profile_images/', '').replace('_normal', '$');

export const encodeProfilePicture = (
  pp: string | undefined,
  format: string = '_400x400'
): string => {
  if (pp) {
    return `https://pbs.twimg.com/profile_images/${pp.replace('$', format)}`;
  }

  return `https://abs.twimg.com/sticky/default_profile_images/default_profile${format}.png`;
};

export const formatTime = (time: number) => {
  const ms = time;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);

  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(
    ms % 1000
  ).padStart(3, '0')}`;
};

export const getRandomIndexes = (count: number, maxIndex: number): number[] => {
  if (count >= maxIndex) {
    return new Array(maxIndex).fill(0).map((_, index) => index);
  }

  const randomIndexesSet = new Set<number>();

  while (randomIndexesSet.size < count) {
    let randomIdx = Math.floor(Math.random() * maxIndex);
    while (randomIndexesSet.has(randomIdx)) {
      randomIdx = (randomIdx + 1) % maxIndex;
    }

    randomIndexesSet.add(randomIdx);
  }

  return Array.from(randomIndexesSet);
};

export const isValidLevel = (level: any): level is Level => {
  return Object.values(Level).includes(level);
};
