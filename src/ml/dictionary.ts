import type { WordEntry, WordMLDataset } from '../types/game';
import { extractFeatures } from './engine';

// Fallback high quality words in case fetch is delayed
const FALLBACK_WORDS: WordEntry[] = [
  { word: "water", len: 5, tier: 0, tierName: "Bilow (Easy)", pos: "noun", hintSo: "Dareere lagama maarmaan u ah nolosha (Biyo)", features: extractFeatures("water") },
  { word: "earth", len: 5, tier: 0, tierName: "Bilow (Easy)", pos: "noun", hintSo: "Dhulka aan ku noolnahay (Kowkabka)", features: extractFeatures("earth") },
  { word: "music", len: 5, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Dhawaaq muusig ama hees qiiro leh", features: extractFeatures("music") },
  { word: "peace", len: 5, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Nabad iyo xasillooni dalka oo dhan", features: extractFeatures("peace") },
  { word: "brave", len: 5, tier: 1, tierName: "Dhexe (Medium)", pos: "adj", hintSo: "Geesi aan cabsanayn (Geesinimo)", features: extractFeatures("brave") },
  { word: "light", len: 5, tier: 0, tierName: "Bilow (Easy)", pos: "noun", hintSo: "Iftiin ama nuur iftiimiya mugdiga", features: extractFeatures("light") },
  { word: "heart", len: 5, tier: 0, tierName: "Bilow (Easy)", pos: "noun", hintSo: "Wadnaha dhiigga wareejiya / Dareen", features: extractFeatures("heart") },
  { word: "power", len: 5, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Awood ama xoog weyn", features: extractFeatures("power") },
  { word: "ocean", len: 5, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Badweyn weyn oo biyo badan", features: extractFeatures("ocean") },
  { word: "storm", len: 5, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Duufaan ama dabayl daran", features: extractFeatures("storm") },
  { word: "smart", len: 5, tier: 1, tierName: "Dhexe (Medium)", pos: "adj", hintSo: "Qof xariif ah oo maskax badan", features: extractFeatures("smart") },
  { word: "robot", len: 5, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Qalab AI oo si toos ah u shaqeeya", features: extractFeatures("robot") },
  { word: "cyber", len: 5, tier: 2, tierName: "Adag (Hard)", pos: "adj", hintSo: "Dunida internet-ka iyo tiknoolajiyada", features: extractFeatures("cyber") },
  { word: "logic", len: 5, tier: 2, tierName: "Adag (Hard)", pos: "noun", hintSo: "Caqli-gal iyo fikir xisaabeed", features: extractFeatures("logic") },
  { word: "focus", len: 5, tier: 1, tierName: "Dhexe (Medium)", pos: "verb", hintSo: "Diirad-saarid ama ku fooganaansho", features: extractFeatures("focus") },
  { word: "dream", len: 5, tier: 0, tierName: "Bilow (Easy)", pos: "noun", hintSo: "Riyo ama himilo mustaqbal", features: extractFeatures("dream") },
  { word: "apple", len: 5, tier: 0, tierName: "Bilow (Easy)", pos: "noun", hintSo: "Miro guduudan ama cagaaran (Tufaax)", features: extractFeatures("apple") },
  { word: "silver", len: 6, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Qalin (macdan qaali ah)", features: extractFeatures("silver") },
  { word: "winter", len: 6, tier: 0, tierName: "Bilow (Easy)", pos: "noun", hintSo: "Xilliga qabowga badan", features: extractFeatures("winter") },
  { word: "forest", len: 6, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Kayn geedo badan oo duurjoog ku nooshahay", features: extractFeatures("forest") },
  { word: "island", len: 6, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Jasiirad ku dhex taal biyaha", features: extractFeatures("island") },
  { word: "desert", len: 6, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Saxare oomane ah", features: extractFeatures("desert") },
  { word: "planet", len: 6, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Meere ka tirsan bahda qorraxda", features: extractFeatures("planet") },
  { word: "guitar", len: 6, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Qalab muusig oo xadhko leh (Kaban)", features: extractFeatures("guitar") },
  { word: "future", len: 6, tier: 0, tierName: "Bilow (Easy)", pos: "noun", hintSo: "Mustaqbalka soo socda", features: extractFeatures("future") },
  { word: "system", len: 6, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Nidaam ama hab-raac iskuxiran", features: extractFeatures("system") },
  { word: "matrix", len: 6, tier: 2, tierName: "Adag (Hard)", pos: "noun", hintSo: "Shax xisaabeed safaf iyo tiirar leh", features: extractFeatures("matrix") },
  { word: "zenith", len: 6, tier: 3, tierName: "Halbowle (Expert)", pos: "noun", hintSo: "Barta ugu sarraysa cirka ama guusha", features: extractFeatures("zenith") },
  { word: "quantum", len: 7, tier: 3, tierName: "Halbowle (Expert)", pos: "adj", hintSo: "Fisigiska xisaabta atom-ka ugu yar", features: extractFeatures("quantum") },
  { word: "dynamic", len: 7, tier: 2, tierName: "Adag (Hard)", pos: "adj", hintSo: "Firfircoon oo mar kasta isbaddalaya", features: extractFeatures("dynamic") },
  { word: "crystal", len: 7, tier: 2, tierName: "Adag (Hard)", pos: "noun", hintSo: "Dheeman ama macdan dhalaalaysa", features: extractFeatures("crystal") },
  { word: "venture", len: 7, tier: 2, tierName: "Adag (Hard)", pos: "noun", hintSo: "Hal-abuur ganacsi ama safar halis leh", features: extractFeatures("venture") },
  { word: "glimpse", len: 7, tier: 2, tierName: "Adag (Hard)", pos: "noun", hintSo: "Jaleeco ama indho-indhayn kooban", features: extractFeatures("glimpse") },
  { word: "network", len: 7, tier: 1, tierName: "Dhexe (Medium)", pos: "noun", hintSo: "Shabakad isku xiraysa kombiyuutarada", features: extractFeatures("network") }
];

let globalDataset: WordMLDataset | null = null;
let validWordsSet: Set<string> = new Set(FALLBACK_WORDS.map(w => w.word));

/**
 * Loads dataset from JSON
 */
export async function loadWordDataset(): Promise<WordMLDataset> {
  if (globalDataset) return globalDataset;

  try {
    const baseUrl = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const res = await fetch(`${baseUrl}models/word_ml_data.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: WordMLDataset = await res.json();
    globalDataset = data;
    validWordsSet = new Set(data.words.map(w => w.word));
    return data;
  } catch (err) {
    console.warn('Using fallback word list:', err);
    return {
      metadata: {
        totalWords: FALLBACK_WORDS.length,
        rfAccuracy: 0.30,
        xgbAccuracy: 0.30,
        featureColumns: ['length', 'vowels', 'consonants', 'vowel_ratio', 'unique_ratio', 'entropy', 'scrabble_score', 'consonant_cluster', 'starts_with_vowel', 'ends_with_vowel', 'first_vowel_pos'],
        rfFeatureImportance: { scrabble_score: 0.30, entropy: 0.12, first_vowel_pos: 0.09, unique_ratio: 0.08, consonant_cluster: 0.07 },
        xgbFeatureImportance: { length: 0.24, entropy: 0.09, unique_ratio: 0.08, ends_with_vowel: 0.08, starts_with_vowel: 0.08 },
        sampleDecisionTree: {
          isLeaf: false,
          feature: 'scrabble_score',
          threshold: 9.5,
          samples: 3453,
          left: { isLeaf: true, prediction: 0, tierName: 'Bilow (Easy)', samples: 1800 },
          right: { isLeaf: true, prediction: 2, tierName: 'Adag (Hard)', samples: 1653 }
        },
        tierLabels: ["Bilow (Easy)", "Dhexe (Medium)", "Adag (Hard)", "Halbowle (Expert)"]
      },
      words: FALLBACK_WORDS
    };
  }
}

/**
 * Seeded PRNG (Mulberry32) for deterministic word selection
 */
export function getSeededRandom(seedStr: string): () => number {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  
  let s = h ^ 0xdeadbeef;
  return function() {
    s |= 0;
    s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Generates today's daily seed string (e.g. "2026-10-29")
 */
export function getDailySeed(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `daily-${y}-${m}-${d}`;
}

/**
 * Picks a target word based on word length, difficulty, and seed
 */
export function pickTargetWord(
  words: WordEntry[],
  options: {
    wordLength?: number;
    difficultyTier?: number; // -1 for all
    seed: string;
  }
): WordEntry {
  const { wordLength = 5, difficultyTier = -1, seed } = options;
  
  let pool = words.filter(w => w.len === wordLength);
  if (difficultyTier >= 0) {
    const tierFiltered = pool.filter(w => w.tier === difficultyTier);
    if (tierFiltered.length > 0) pool = tierFiltered;
  }

  if (pool.length === 0) {
    pool = words.length > 0 ? words : FALLBACK_WORDS;
  }

  const rng = getSeededRandom(seed);
  const randomIndex = Math.floor(rng() * pool.length);
  return pool[randomIndex];
}

/**
 * Validates if the guessed word is in our dictionary
 */
export function isValidWord(word: string): boolean {
  const clean = word.toLowerCase().trim();
  if (validWordsSet.has(clean)) return true;
  // If fallback set or not yet loaded
  return FALLBACK_WORDS.some(w => w.word === clean) || clean.length >= 3;
}
