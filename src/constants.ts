import { TetrominoType } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINOES: Record<TetrominoType, number[][][]> = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
};

export const TETROMINO_COLORS: Record<
  TetrominoType,
  {
    bg: string;
    border: string;
    glow: string;
    light: string;
  }
> = {
  T: {
    bg: '#dc2626',
    border: '#991b1b',
    glow: 'rgba(220, 38, 38, 0.45)',
    light: '#f87171',
  },
  I: {
    bg: '#0284c7',
    border: '#0369a1',
    glow: 'rgba(2, 132, 199, 0.45)',
    light: '#38bdf8',
  },
  O: {
    bg: '#059669',
    border: '#047857',
    glow: 'rgba(5, 150, 105, 0.45)',
    light: '#34d399',
  },
  S: {
    bg: '#e11d48',
    border: '#be123c',
    glow: 'rgba(225, 29, 72, 0.45)',
    light: '#fb7185',
  },
  Z: {
    bg: '#e11d48',
    border: '#be123c',
    glow: 'rgba(225, 29, 72, 0.45)',
    light: '#fb7185',
  },
  J: {
    bg: '#0284c7',
    border: '#0369a1',
    glow: 'rgba(2, 132, 199, 0.45)',
    light: '#38bdf8',
  },
  L: {
    bg: '#dc2626',
    border: '#991b1b',
    glow: 'rgba(220, 38, 38, 0.45)',
    light: '#f87171',
  },
};

// SRS Wall Kick offsets for J, L, S, T, Z pieces
export const WALL_KICKS_JLSTZ: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

// SRS Wall Kick offsets for I piece
export const WALL_KICKS_I: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

export const LINE_POINTS = [0, 100, 300, 500, 800]; // 0, single, double, triple, tetris

export const LEVEL_SPEEDS: number[] = [
  800, // Level 1
  710, // Level 2
  620, // Level 3
  530, // Level 4
  440, // Level 5
  350, // Level 6
  260, // Level 7
  180, // Level 8
  120, // Level 9
  80,  // Level 10+
];

export const STORAGE_HIGH_SCORE_KEY = 'tetris_classic_high_score_v1';
export const STORAGE_SOUND_MUTED_KEY = 'tetris_sound_muted_v1';
export const STORAGE_MUSIC_MUTED_KEY = 'tetris_music_muted_v1';

export const COUNTRY_FLAGS: Record<TetrominoType, import('./types').CountryFlagInfo> = {
  T: {
    code: 'KG',
    nameKy: 'Кыргызстан',
    nameRu: 'Кыргызстан',
    nameEn: 'Kyrgyzstan',
    emoji: '🇰🇬',
    bgGradient: 'from-red-600 to-rose-700',
    primaryColor: '#dc2626',
    accentColor: '#facc15',
    description: 'Кызыл туу, алтын күн жана түндүк',
  },
  I: {
    code: 'KZ',
    nameKy: 'Казакстан',
    nameRu: 'Казахстан',
    nameEn: 'Kazakhstan',
    emoji: '🇰🇿',
    bgGradient: 'from-sky-500 to-cyan-600',
    primaryColor: '#0284c7',
    accentColor: '#facc15',
    description: 'Асман көк туу жана алтын бүркүт',
  },
  O: {
    code: 'UZ',
    nameKy: 'Өзбекстан',
    nameRu: 'Узбекистан',
    nameEn: 'Uzbekistan',
    emoji: '🇺🇿',
    bgGradient: 'from-sky-600 via-slate-100 to-emerald-600',
    primaryColor: '#0284c7',
    accentColor: '#10b981',
    description: 'Көк, ак, жашыл тилкелер жана жарым ай',
  },
  S: {
    code: 'TR',
    nameKy: 'Түркия',
    nameRu: 'Турция',
    nameEn: 'Turkey',
    emoji: '🇹🇷',
    bgGradient: 'from-red-600 to-red-700',
    primaryColor: '#e11d48',
    accentColor: '#ffffff',
    description: 'Ай жана жылдыздуу кызыл туу',
  },
  // Mapped to the 4 countries for compatibility
  Z: {
    code: 'TR',
    nameKy: 'Түркия',
    nameRu: 'Турция',
    nameEn: 'Turkey',
    emoji: '🇹🇷',
    bgGradient: 'from-red-600 to-red-700',
    primaryColor: '#e11d48',
    accentColor: '#ffffff',
    description: 'Ай жана жылдыздуу кызыл туу',
  },
  J: {
    code: 'KZ',
    nameKy: 'Казакстан',
    nameRu: 'Казахстан',
    nameEn: 'Kazakhstan',
    emoji: '🇰🇿',
    bgGradient: 'from-sky-500 to-cyan-600',
    primaryColor: '#0284c7',
    accentColor: '#facc15',
    description: 'Асман көк туу жана алтын бүркүт',
  },
  L: {
    code: 'KG',
    nameKy: 'Кыргызстан',
    nameRu: 'Кыргызстан',
    nameEn: 'Kyrgyzstan',
    emoji: '🇰🇬',
    bgGradient: 'from-red-600 to-rose-700',
    primaryColor: '#dc2626',
    accentColor: '#facc15',
    description: 'Кызыл туу, алтын күн жана түндүк',
  },
};

// 10 утуш болгондо оюн жеңиш менен аяктайт
export const TARGET_WINS = 10;

