// DURF.EXE — spec constants, straight from the 20-page UI spec (v1.0).
// Palette: spec tokens. Typography: pixel-style monospaced (VT323) with
// monospace fallback; sentence case in paragraphs, caps for filenames.

export const COLORS = {
  teal: '#008080',
  silver: '#C8C8C8',
  navy: '#00006F',
  paper: '#FFFFFF',
  yellow: '#FFF36B',
  red: '#A40000',
  ink: '#1C1C1C',
};

export const COPY = {
  boot: 'Loading mutual interest...',
  profileSaved: 'PROFILE.INI saved successfully.',
  durfSent: 'Interest packet sent.',
  norf: 'No hard feelings. File closed.',
  match: 'Mutual interest detected.',
  faxPrinting: 'A free date is printing.',
  dateBudget: 'Required funds: $0.00',
  checkinDone: 'Two humans verified.',
  batteryLow: 'DISCOVER.EXE is running on fumes.',
  batteryFull: 'Fully charged. Please use responsibly.',
  groupReady: 'All humans accounted for.',
  couplesFax: 'Relationship maintenance file received.',
  noChats: 'No open channels. DISCOVER.EXE knows what to do.',
  chatClosed: 'This conversation is closed.',
  welcome1: 'Meet someone. Get a free date. Actually go.',
  welcome2: 'Choose people, not a pile of profiles.',
  welcome3: 'When it clicks, the fax machine wakes up.',
  welcome4: 'Go on the date. Trade codes. Keep Durfing.',
};

export type WidgetKind =
  | 'quest'
  | 'take'
  | 'idealDate'
  | 'joys'
  | 'sunday'
  | 'skill'
  | 'ask';

export const WIDGET_LIBRARY: {
  kind: WidgetKind;
  prompt: string;
  limit: string;
  display: string;
}[] = [
  { kind: 'quest', prompt: 'What are you into lately?', limit: '80 chars', display: 'Text panel' },
  { kind: 'take', prompt: 'A harmless opinion', limit: '80 chars', display: 'Alert panel' },
  { kind: 'idealDate', prompt: 'Describe one ideal $0 date', limit: '100 chars', display: 'Mini fax' },
  { kind: 'joys', prompt: 'List three tiny joys', limit: '3 × 24 chars', display: 'Checklist' },
  { kind: 'sunday', prompt: 'What does Sunday look like?', limit: '100 chars', display: 'Calendar card' },
  { kind: 'skill', prompt: 'Oddly good at...', limit: '60 chars', display: 'File icon' },
  { kind: 'ask', prompt: 'Conversation starter', limit: '60 chars', display: 'Help bubble' },
];

export const WIDGET_LABEL: Record<WidgetKind, string> = {
  quest: 'CURRENT QUEST',
  take: 'LOW-STAKES TAKE',
  idealDate: 'IDEAL $0 DATE',
  joys: 'THREE TINY JOYS',
  sunday: 'SUNDAY SNAPSHOT',
  skill: 'SKILL FILE',
  ask: 'ASK ME ABOUT',
};

export interface DateIdea {
  id: string;
  title: string;
  prompt: string;
  steps: string[];
  time: string;
  bring: string;
  access: string;
  indoorSwap: string;
}

export const DATE_CATALOG: DateIdea[] = [
  {
    id: 'sidewalk-gallery',
    title: 'Sidewalk Gallery',
    prompt: 'Take a 30-minute walk. Each person photographs three things the other person might not notice. Trade phones at the end and explain your picks.',
    steps: ['Meet at a public outdoor route', 'Walk for 30 minutes, photographing three unnoticed things each', 'Trade phones and explain your picks'],
    time: '30–45 minutes',
    bring: 'Charged phones',
    access: 'Public outdoor route. Choose a flat route if needed.',
    indoorSwap: 'Library gallery walk: photograph three book covers you would never pick up.',
  },
  {
    id: 'sunset-picnic',
    title: 'Sunset Picnic, No Basket Required',
    prompt: 'Sit somewhere with a view at golden hour. Bring only what you already own and rank the clouds like art critics.',
    steps: ['Pick a public viewpoint before sunset', 'Bring a blanket you already own', 'Rank the clouds, then rank the day'],
    time: '45–60 minutes',
    bring: 'A blanket and water bottles from home',
    access: 'Public viewpoint; check the sunset time and daylight.',
    indoorSwap: 'Window-seat sunset watch from a campus common area.',
  },
  {
    id: 'thrift-runway',
    title: 'Thrift Store Runway (Buy Nothing)',
    prompt: 'Browse a thrift store together and style each other an outfit from the racks. The only rule: nobody buys anything.',
    steps: ['Meet outside the store', 'Style each other an outfit from the racks', 'Stage a runway walk down one aisle'],
    time: '45 minutes',
    bring: 'Nothing to buy — browsing is free',
    access: 'Indoor, step-free stores preferred; check store hours.',
    indoorSwap: 'This one is already indoors. Rain only makes it better.',
  },
  {
    id: 'stargazing',
    title: 'Stargazing + Constellation Ranking',
    prompt: 'Find the darkest nearby spot, lie back, and rank the constellations by how hard they are trying.',
    steps: ['Pick a dark, public spot after dusk', 'Find three constellations together', 'Rank them by effort and give awards'],
    time: '60 minutes',
    bring: 'A blanket and a free stargazing app if you like',
    access: 'Needs clear skies and a safe, public spot.',
    indoorSwap: 'Planetarium-style video night in a common room (free videos only).',
  },
  {
    id: 'pantry-cookoff',
    title: 'Pantry Cook-Off',
    prompt: 'Cook something from only what is already in your kitchens. Present it like a cooking show finale.',
    steps: ['Each person brings one pantry ingredient', 'Cook one dish together from what you have', 'Present it with full cooking-show drama'],
    time: '60–90 minutes',
    bring: 'One pantry ingredient each',
    access: 'Needs a kitchen you already have access to; meet in a shared space if preferred.',
    indoorSwap: 'This one is already indoors.',
  },
  {
    id: 'sample-crawl',
    title: 'Free Sample Crawl',
    prompt: 'Tour every free sample in town like food critics on assignment. Rate each one out of ten and defend your scores.',
    steps: ['Map the free samples nearby', 'Taste everything on offer', 'Score each one and defend your ratings'],
    time: '45 minutes',
    bring: 'Nothing — samples are free',
    access: 'Indoor/outdoor mix; check store hours.',
    indoorSwap: 'Grocery-store sample tour on a rainy day.',
  },
];

export const MODES = ['Dating', 'Blind Date', 'Couples'] as const;
export type Mode = (typeof MODES)[number];

export const BATTERY_CAP = 10;
export const REWARD_CHARGE = 5;
