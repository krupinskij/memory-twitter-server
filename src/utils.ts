import { TweetV1, UserV1, UserV2 } from 'twitter-api-v2';

import { ResultDB } from './api/result/result.model';
import { Level, Tweet, User } from './model';

export const mapUserV1 = (user: UserV1): User => ({
  id: user.id_str,
  nm: user.name,
  un: user.screen_name,
  pp: decodeProfilePicture(user.profile_image_url_https),
});

export const mapUserV2 = (user: UserV2): User => ({
  id: user.id,
  nm: user.name,
  un: user.username,
  pp: decodeProfilePicture(user.profile_image_url),
});

export const decodeProfilePicture = (pp: string | undefined) => {
  if (pp?.match('default_profile_images')) {
    return undefined;
  }

  return pp?.replace('https://pbs.twimg.com/profile_images/', '').replace('_normal', '$');
};

export const encodeProfilePicture = (
  pp: string | undefined,
  format: string = '_400x400'
): string => {
  if (pp) {
    return `https://pbs.twimg.com/profile_images/${pp.replace('$', format)}`;
  }

  return `https://abs.twimg.com/sticky/default_profile_images/default_profile${format}.png`;
};

export const mapTweetV1 = (tweet: TweetV1): Tweet => ({
  id: tweet.id_str,
});

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

export const mapResult = (result: ResultDB): ResultDB => ({
  ...result,
  id: decodeResultId(result.id, result.level),
  tweeted: !!result.tweeted,
});

export const decodeResultId = (resultId: string, level: Level) => {
  switch (level) {
    case Level.Easy:
      return `0${resultId}`;
    case Level.Medium:
      return `1${resultId}`;
    case Level.Hard:
      return `2${resultId}`;
    case Level.Legendary:
      return `3${resultId}`;
  }
};

export const encodeResultId = (decodedResultId: string = ''): [string, Level] => {
  const levelId = decodedResultId[0];
  const resultId = decodedResultId.substring(1);

  switch (levelId) {
    case '0':
      return [resultId, Level.Easy];
    case '1':
      return [resultId, Level.Medium];
    case '2':
      return [resultId, Level.Hard];
    case '3':
      return [resultId, Level.Legendary];
    default:
      return [resultId, Level.Easy];
  }
};
