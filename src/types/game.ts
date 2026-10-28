export interface WordFeatures {
  length: number;
  vowels: number;
  consonants: number;
  vowel_ratio: number;
  unique_ratio: number;
  entropy: number;
  scrabble_score: number;
  consonant_cluster: number;
  starts_with_vowel: number;
  ends_with_vowel: number;
  first_vowel_pos: number;
}

export interface WordEntry {
  word: string;
  len: number;
  tier: number; // 0: Bilow (Easy), 1: Dhexe (Medium), 2: Adag (Hard), 3: Halbowle (Expert)
  tierName: string;
  pos: string;
  hintSo: string;
  features: WordFeatures;
}

export interface DecisionTreeNode {
  isLeaf: boolean;
  feature?: keyof WordFeatures;
  threshold?: number;
  samples: number;
  prediction?: number;
  tierName?: string;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
}

export interface MLMetadata {
  totalWords: number;
  rfAccuracy: number;
  xgbAccuracy: number;
  featureColumns: (keyof WordFeatures)[];
  rfFeatureImportance: Record<string, number>;
  xgbFeatureImportance: Record<string, number>;
  sampleDecisionTree: DecisionTreeNode;
  tierLabels: string[];
}

export interface WordMLDataset {
  metadata: MLMetadata;
  words: WordEntry[];
}

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export interface LetterEvaluation {
  letter: string;
  status: LetterStatus;
}

export interface GuessResult {
  word: string;
  evaluations: LetterEvaluation[];
  mlAffinity: number; // 0 - 100%
  entropyCloseness: number;
  aiHint: string;
  timestamp: number;
}

export interface GameState {
  targetWord: WordEntry;
  guesses: GuessResult[];
  maxGuesses: number;
  wordLength: number;
  gameStatus: 'IN_PROGRESS' | 'WON' | 'LOST';
  seed: string;
  isDaily: boolean;
  difficulty: number;
}

export interface GameStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  distribution: { [key: number]: number };
  averageAffinity: number;
}
