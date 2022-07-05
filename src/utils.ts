import { UserV2 } from 'twitter-api-v2';

import { Level, User } from './model';

export const mapUser = (user: UserV2): User => ({
  id: user.id,
  nm: user.name,
  un: user.username,
  pp: user.profile_image_url
    ?.replace('https://pbs.twimg.com/profile_images/', '')
    .replace('_normal.jpg', ''),
});

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
