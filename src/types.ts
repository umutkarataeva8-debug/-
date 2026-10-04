export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type CellValue = TetrominoType | null;

export interface BoardCoord {
  x: number;
  y: number;
}

export type BoardMatrix = CellValue[][];

export interface ActivePiece {
  type: TetrominoType;
  matrix: number[][];
  x: number;
  y: number;
  rotation: number; // 0, 1, 2, 3 (0°, 90°, 180°, 270°)
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export interface CountryFlagInfo {
  code: string;
  nameKy: string;
  nameRu: string;
  nameEn: string;
  emoji: string;
  bgGradient: string;
  primaryColor: string;
  accentColor: string;
  description: string;
}

export interface BonusEvent {
  id: number;
  text: string;
  subText?: string;
  points: number;
  type: 'single' | 'double' | 'triple' | 'tetris' | 'combo' | 'levelup' | 'flag_match' | 'flag_twin';
  rows: number[];
  timestamp: number;
}

export interface FloatingScore {
  id: number;
  text: string;
  points: number;
  xPercent: number; // 0 - 100 on board
  yPercent: number; // 0 - 100 on board
  color?: string;
  emoji?: string;
  createdAt: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  lines: number;
  level: number;
  combo: number;
  maxCombo: number;
  pieceCounts: Record<TetrominoType, number>;
  totalBonusPoints: number;
  wins: number; // Жалпы утуштардын саны (10 болгондо оюн аяктайт)
  targetWins: number; // Максат: 10 утуш
}

