import type { Profile } from './types';

// SEED DATA ONLY — starter catalog for Discover until real users join.
// These are NOT real users. Real accounts replace this catalog naturally
// as people sign up. Nothing here is presented to the user as a real person.

export const SEED_PROFILES: Profile[] = [
  {
    id: 'seed-avery',
    firstName: 'Avery',
    age: 23,
    city: 'Rexburg',
    distanceMiles: 2,
    intent: 'Open to a relationship',
    school: 'BYU-Idaho',
    faithContext: 'Sunday services, weekday scripture study when I remember.',
    photos: ['A', 'A2', 'A3'],
    widgets: [
      { kind: 'quest', value: 'Learn to make cinnamon rolls that behave.' },
      { kind: 'take', value: 'Mini golf is mostly architecture.' },
      { kind: 'idealDate', value: 'Walk somewhere with a view.' },
    ],
    isSeed: true,
  },
  {
    id: 'seed-jordan',
    firstName: 'Jordan',
    age: 21,
    city: 'Rexburg',
    distanceMiles: 3,
    intent: 'Go on fun dates',
    school: 'BYU-Idaho',
    photos: ['J', 'J2'],
    widgets: [
      { kind: 'quest', value: 'Find the best free snack sample in town.' },
      { kind: 'skill', value: 'Oddly good at parallel parking a scooter.' },
      { kind: 'ask', value: 'Ask me about my spreadsheet of free campus events.' },
    ],
    isSeed: true,
  },
  {
    id: 'seed-sam',
    firstName: 'Sam',
    age: 22,
    city: 'Rexburg',
    distanceMiles: 1,
    intent: 'Looking seriously',
    school: 'BYU-Idaho',
    photos: ['S', 'S2', 'S3'],
    widgets: [
      { kind: 'sunday', value: 'Church, a long walk, and a nap I pretend I did not take.' },
      { kind: 'joys', value: 'Fresh bread|Golden hour|Board game wins' },
      { kind: 'take', value: 'Cereal is a valid dinner when the day was long.' },
    ],
    isSeed: true,
  },
  {
    id: 'seed-emma',
    firstName: 'Emma',
    age: 21,
    city: 'Rexburg',
    distanceMiles: 4,
    intent: 'Go on fun dates',
    school: 'BYU-Idaho',
    photos: ['E', 'E2'],
    widgets: [
      { kind: 'quest', value: 'Rank every thrift store within biking distance.' },
      { kind: 'idealDate', value: 'Stargazing plus constellation awards ceremony.' },
      { kind: 'ask', value: 'Ask me about my bananagrams win streak.' },
    ],
    isSeed: true,
  },
  {
    id: 'seed-liam',
    firstName: 'Liam',
    age: 24,
    city: 'Rexburg',
    distanceMiles: 5,
    intent: 'Open to a relationship',
    photos: ['L', 'L2'],
    widgets: [
      { kind: 'skill', value: 'Oddly good at fixing wobbly tables.' },
      { kind: 'take', value: 'A walk counts as a date if the conversation is good.' },
      { kind: 'sunday', value: 'Services, family call, and meal prep for the week.' },
    ],
    isSeed: true,
  },
  {
    id: 'seed-maya',
    firstName: 'Maya',
    age: 20,
    city: 'Rexburg',
    distanceMiles: 2,
    intent: 'Go on fun dates',
    school: 'BYU-Idaho',
    photos: ['M', 'M2', 'M3'],
    widgets: [
      { kind: 'joys', value: 'Library holds|Sunset drives|Warm socks' },
      { kind: 'quest', value: 'Teach myself harmonica, quietly, in stages.' },
      { kind: 'idealDate', value: 'Free sample crawl, scored out of ten.' },
    ],
    isSeed: true,
  },
];

export const SEED_GREETING: Record<string, string> = {
  'seed-avery': 'Hey! A sidewalk gallery sounds perfect. Saturday afternoon?',
  'seed-jordan': 'Hello! I come with a spreadsheet of free events. Fair warning.',
  'seed-sam': 'Hi! I make a strong case for the sunset picnic.',
  'seed-emma': 'Hi! I already have strong opinions about constellations.',
  'seed-liam': 'Hey. I fixed a wobbly table today. Peak achievement.',
  'seed-maya': 'Hi! Free sample crawl, but make it a competition?',
};

export function emptyProfile(firstName: string): Profile {
  return {
    id: 'me',
    firstName,
    age: 21,
    city: 'Rexburg',
    distanceMiles: 0,
    intent: 'Go on fun dates',
    photos: [firstName.charAt(0).toUpperCase()],
    widgets: [
      { kind: 'quest', value: 'Find the best free date in Rexburg.' },
      { kind: 'take', value: 'A walk counts as a date if the conversation is good.' },
      { kind: 'idealDate', value: 'Sunset picnic, blanket I already own.' },
    ],
  };
}
