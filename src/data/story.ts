/* ═══════════════════════════════════════════════════
   BLACKOUT — Story Data
   All narrative content in structured format
   ═══════════════════════════════════════════════════ */

export interface StoryLine {
  text: string;
  style?: 'body' | 'headline' | 'quote' | 'emergency' | 'timestamp' | 'signal-lost' | 'mystery' | 'terminal';
  delay?: number; // ms delay before showing
  special?: 'flicker' | 'typewriter' | 'flash' | 'shake' | 'glitch' | 'red-text';
}

export interface StoryImage {
  src: string;
  videoSrc?: string;
  alt: string;
  timestamp?: string;
  headline: string;
  bodyLines: StoryLine[];
  specialText?: StoryLine;
  effect?: 'normal' | 'minimal' | 'flash' | 'static' | 'emergency';
}

export interface StoryScene {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  openingCaption?: string;
  images: StoryImage[];
  endSection?: {
    lines: StoryLine[];
    effect?: 'blackout' | 'mystery' | 'signal-lost';
  };
}

export const scenes: StoryScene[] = [
  // ═══════════════════════════════════
  // SCENE 01 — THE NIGHT OF BLACKOUT
  // ═══════════════════════════════════
  {
    id: 'scene-01',
    number: 'SCENE 01',
    title: 'THE NIGHT OF BLACKOUT',
    subtitle: '11:47 PM',
    openingCaption: 'THE CITY LOSES POWER.',
    images: [
      {
        src: '/assets/scene1/scene1-1.png',
        alt: 'City skyline losing power — lights disappearing across the horizon',
        timestamp: '11:47 PM',
        headline: 'THE CITY LOSES POWER.',
        bodyLines: [
          { text: 'Every light disappears simultaneously.', style: 'body' },
          { text: 'The entire city goes dark.', style: 'body', delay: 300 },
        ],
        effect: 'normal',
      },
      {
        src: '/assets/scene1/scene1-2.png',
        alt: 'People looking at dead phones — No Service displayed on screen',
        headline: 'THE PHONES DIE.',
        bodyLines: [
          { text: 'Phones stop working.', style: 'body' },
          { text: 'No signal.', style: 'body', delay: 200, special: 'flicker' },
          { text: 'No internet.', style: 'body', delay: 300, special: 'flicker' },
          { text: 'No connection.', style: 'body', delay: 400, special: 'flicker' },
        ],
        effect: 'static',
      },
      {
        src: '/assets/scene1/scene1-3.png',
        alt: 'Person at desk with laptop showing No Internet Connection — servers offline',
        headline: 'THE NETWORK GOES DARK.',
        bodyLines: [
          { text: 'Internet goes down.', style: 'body' },
          { text: 'No messages. No calls. No connection.', style: 'body', delay: 200 },
          { text: 'Emergency services lose communication.', style: 'body', delay: 400 },
          { text: 'The city has gone completely silent.', style: 'body', delay: 600 },
        ],
        specialText: {
          text: 'BUT SOMETHING IS STILL TRANSMITTING.',
          style: 'body',
          special: 'flicker',
        },
        effect: 'normal',
      },
    ],
  },

  // ═══════════════════════════════════
  // SCENE 02 — THE LAST SIGNAL
  // ═══════════════════════════════════
  {
    id: 'scene-02',
    number: 'SCENE 02',
    title: 'THE LAST SIGNAL',
    openingCaption: 'THE ONLY THING STILL FUNCTIONING',
    subtitle: 'An old emergency radio frequency.',
    images: [
      {
        src: '/assets/scene2/scene2-1.png',
        alt: 'Emergency radio broadcasting HELIOS FAILURE CONFIRMED',
        timestamp: '11:59 PM',
        headline: '17 SECONDS.',
        bodyLines: [
          { text: 'For exactly 17 seconds, the emergency frequency broadcasts.', style: 'body' },
          { text: '"HELIOS FAILURE CONFIRMED."', style: 'quote', delay: 600, special: 'typewriter' },
        ],
        effect: 'static',
      },
      {
        src: '/assets/scene2/scene2-2.png',
        alt: 'Emergency radio falling silent — countdown to silence',
        headline: 'THEN—',
        bodyLines: [
          { text: 'Silence.', style: 'body' },
          { text: 'People begin moving into the streets.', style: 'body', delay: 800 },
          { text: 'Nobody understands what happened.', style: 'body', delay: 400 },
        ],
        effect: 'minimal',
      },
      {
        src: '/assets/scene3/scene3-1.png',
        videoSrc: '/video/nuclear_blast.mp4',
        alt: 'The sky turns white — nuclear blast mushroom cloud rising over the city skyline',
        timestamp: '11:59 PM',
        headline: 'THE SKY TURNS WHITE.',
        bodyLines: [
          { text: 'THE GROUND SHAKES.', style: 'headline', delay: 600, special: 'shake' },
        ],
        effect: 'flash',
      },
      {
        src: '/assets/scene3/scene3-2.png',
        alt: 'Ground shaking — buildings crumbling, people thrown to the ground',
        headline: 'WINDOWS SHATTER.',
        bodyLines: [
          { text: 'The emergency radio suddenly comes alive.', style: 'body' },
          { text: '"NUCLEAR DETONATION DETECTED."', style: 'emergency', delay: 500, special: 'flicker' },
        ],
        effect: 'emergency',
      },
    ],
    endSection: {
      lines: [
        { text: '"DO NOT GO OUTSIDE."', style: 'quote', special: 'flicker' },
        { text: 'SIGNAL LOST.', style: 'signal-lost', delay: 2000 },
      ],
      effect: 'signal-lost',
    },
  },

  // ═══════════════════════════════════
  // SCENE 03 — SIX HOURS LATER
  // ═══════════════════════════════════
  {
    id: 'scene-03',
    number: 'SCENE 03',
    title: 'SIX HOURS LATER',
    openingCaption: 'The city is unrecognizable.',
    images: [
      {
        src: '/assets/scene3/scene3-3.png',
        alt: 'Shattered windows — nuclear mushroom cloud visible through broken glass',
        timestamp: '6 HOURS LATER',
        headline: 'THE CITY IS UNRECOGNIZABLE.',
        bodyLines: [
          { text: 'Buildings are damaged.', style: 'body' },
          { text: 'Streets are buried beneath debris.', style: 'body', delay: 300 },
        ],
        effect: 'normal',
      },
      {
        src: '/assets/scene3/scene3-4.png',
        alt: 'Emergency broadcast — NUCLEAR DETONATION DETECTED on radio',
        headline: 'NO ONE IS COMING FAST ENOUGH.',
        bodyLines: [
          { text: 'Emergency services are overwhelmed.', style: 'body' },
          { text: 'Hospitals are full.', style: 'body', delay: 200 },
          { text: 'Communication remains down.', style: 'body', delay: 300 },
        ],
        effect: 'normal',
      },
    ],
    endSection: {
      lines: [
        { text: 'BUT SOMETHING DOESN\'T MAKE SENSE.', style: 'headline' },
        { text: 'The detonation site isn\'t where everyone expected it to be.', style: 'body', delay: 600 },
        { text: 'And there is no evidence of a conventional missile launch.', style: 'body', delay: 400 },
        { text: 'NO LAUNCH', style: 'emergency', delay: 600, special: 'red-text' },
      ],
      effect: 'mystery',
    },
  },

  // ═══════════════════════════════════
  // SCENE 04 — THE TRUTH BENEATH
  // ═══════════════════════════════════
  {
    id: 'scene-04',
    number: 'SCENE 04',
    title: 'THE TRUTH BENEATH THE BLACKOUT',
    openingCaption: 'The blackout wasn\'t caused by the explosion.',
    images: [],
    endSection: {
      lines: [
        { text: 'The blackout came first.', style: 'headline', delay: 600 },
        { text: 'WHY?', style: 'quote', delay: 800 },
      ],
      effect: 'blackout',
    },
  },
];

export const mysteryBoard = {
  items: [
    'EXPECTED DETONATION SITE',
    '↓',
    'ACTUAL DETONATION SITE',
  ],
  revelations: [
    'NO MISSILE',
    'NO TRAJECTORY',
    'NO LAUNCH',
  ],
  question: 'SO WHAT HAPPENED?',
};

export const heliosTerminal = {
  header: 'HELIOS SYSTEM',
  statusLines: [
    { key: 'STATUS', value: 'UNKNOWN' },
    { key: 'NETWORK', value: 'OFFLINE' },
    { key: 'PROTOCOL', value: 'AFTERLIGHT' },
    { key: 'UPLINK', value: 'DISCONNECTED' },
    { key: 'LAST SIGNAL', value: '00:00:17' },
  ],
  logs: [
    '> SYSTEM BOOT SEQUENCE INITIATED...',
    '> CHECKING NETWORK STATUS... FAILED',
    '> HELIOS CORE: UNRESPONSIVE',
    '> ENERGY GRID: OFFLINE',
    '> FAILSAFE PROTOCOL: NOT FOUND',
    '> WARNING: UNAUTHORIZED SHUTDOWN DETECTED',
    '> THE BLACKOUT PRECEDED THE DETONATION BY 12 MINUTES',
    '> CONCLUSION: BLACKOUT WAS DELIBERATE',
    '> AWAITING INPUT...',
  ],
  revelation: [
    { text: 'The blackout wasn\'t caused by the explosion.', style: 'headline' as const },
    { text: 'The blackout came first.', style: 'headline' as const, delay: 800 },
    { text: 'Then the detonation.', style: 'headline' as const, delay: 600 },
    { text: 'SO WHO TURNED OFF THE CITY?', style: 'quote' as const, delay: 1000 },
  ],
};

export const finale = {
  lines: [
    { text: 'THE BLACKOUT WAS NEVER THE END.', delay: 0 },
    { text: 'IT WAS THE WARNING.', delay: 1500 },
  ],
  cta: {
    title: 'BLACKOUT',
    subtitle: 'An interactive story.',
    primaryButton: 'ENTER THE STORY',
    secondaryButtons: ['EVENT DETAILS', 'REGISTER'],
  },
};

// Sound-ready hook points (no audio files, just structure)
export const soundHooks = [
  'radio-static',
  'power-failure',
  'glass-break',
  'low-rumble',
  'emergency-alert',
  'scene-transition',
  'typewriter-click',
  'signal-lost',
] as const;

export type SoundHook = typeof soundHooks[number];
