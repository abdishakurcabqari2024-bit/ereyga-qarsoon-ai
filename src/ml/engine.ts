import type { WordFeatures, DecisionTreeNode, LetterEvaluation, LetterStatus, WordEntry } from '../types/game';

export const SCRABBLE_SCORES: Record<string, number> = {
  a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1,
  j: 8, k: 5, l: 1, m: 3, n: 1, o: 1, p: 3, q: 10, r: 1,
  s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4, z: 10
};

export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

/**
 * Calculates Shannon Entropy of character distribution
 */
export function calculateEntropy(word: string): number {
  const len = word.length;
  if (len === 0) return 0;
  
  const freq: Record<string, number> = {};
  for (const char of word) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(4));
}

/**
 * Calculates maximum consecutive consonants
 */
export function maxConsonantCluster(word: string): number {
  let maxC = 0;
  let currC = 0;
  for (const ch of word) {
    if (!VOWELS.has(ch)) {
      currC++;
      if (currC > maxC) maxC = currC;
    } else {
      currC = 0;
    }
  }
  return maxC;
}

/**
 * Extracts 11 Machine Learning Linguistic Features
 */
export function extractFeatures(wordInput: string): WordFeatures {
  const word = wordInput.toLowerCase().trim();
  const len = word.length;
  let vowels = 0;
  let firstVowelPos = -1;

  for (let i = 0; i < len; i++) {
    if (VOWELS.has(word[i])) {
      vowels++;
      if (firstVowelPos === -1) firstVowelPos = i;
    }
  }

  if (firstVowelPos === -1) firstVowelPos = len;
  const consonants = len - vowels;
  const uniqueChars = new Set(word).size;

  let scrabbleScore = 0;
  for (const ch of word) {
    scrabbleScore += SCRABBLE_SCORES[ch] || 1;
  }

  const vowelRatio = len > 0 ? vowels / len : 0;
  const uniqueRatio = len > 0 ? uniqueChars / len : 0;
  const entropy = calculateEntropy(word);
  const cluster = maxConsonantCluster(word);
  const startsWithVowel = (len > 0 && VOWELS.has(word[0])) ? 1 : 0;
  const endsWithVowel = (len > 0 && VOWELS.has(word[len - 1])) ? 1 : 0;

  return {
    length: len,
    vowels,
    consonants,
    vowel_ratio: Number(vowelRatio.toFixed(4)),
    unique_ratio: Number(uniqueRatio.toFixed(4)),
    entropy,
    scrabble_score: scrabbleScore,
    consonant_cluster: cluster,
    starts_with_vowel: startsWithVowel,
    ends_with_vowel: endsWithVowel,
    first_vowel_pos: firstVowelPos
  };
}

/**
 * Computes ML Feature Proximity (Affinity) between Guess and Target
 * Uses XGBoost & Random Forest normalized weights
 */
export function calculateMLAffinity(
  guessFeats: WordFeatures,
  targetFeats: WordFeatures,
  rfWeights?: Record<string, number>
): { score: number; similarityBreakdown: Record<string, number> } {
  const weights: Record<string, number> = rfWeights || {
    scrabble_score: 0.28,
    entropy: 0.18,
    length: 0.15,
    first_vowel_pos: 0.10,
    unique_ratio: 0.08,
    consonant_cluster: 0.08,
    vowel_ratio: 0.07,
    vowels: 0.04,
    consonants: 0.04,
    starts_with_vowel: 0.03,
    ends_with_vowel: 0.03
  };

  // Normalization scales
  const scales: Record<string, number> = {
    length: 8,
    vowels: 5,
    consonants: 6,
    vowel_ratio: 1.0,
    unique_ratio: 1.0,
    entropy: 3.0,
    scrabble_score: 25.0,
    consonant_cluster: 5,
    starts_with_vowel: 1,
    ends_with_vowel: 1,
    first_vowel_pos: 6
  };

  let totalWeightedDiff = 0;
  let totalWeight = 0;
  const similarityBreakdown: Record<string, number> = {};

  for (const key of Object.keys(weights) as (keyof WordFeatures)[]) {
    const w = weights[key] || 0.05;
    const scale = scales[key] || 1;
    const diff = Math.abs(Number(guessFeats[key]) - Number(targetFeats[key])) / scale;
    const boundedDiff = Math.min(diff, 1.0);
    const subSim = Math.max(0, 1.0 - boundedDiff) * 100;

    similarityBreakdown[key] = Math.round(subSim);
    totalWeightedDiff += boundedDiff * w;
    totalWeight += w;
  }

  const normalizedDiff = totalWeightedDiff / (totalWeight || 1);
  const affinity = Math.max(5, Math.min(100, Math.round((1.0 - normalizedDiff) * 100)));

  return {
    score: affinity,
    similarityBreakdown
  };
}

/**
 * Standard Letter Matching Algorithm with accurate duplicate letter handling
 */
export function evaluateGuessLetters(guessWord: string, targetWord: string): LetterEvaluation[] {
  const guess = guessWord.toLowerCase();
  const target = targetWord.toLowerCase();
  const len = target.length;

  const result: LetterEvaluation[] = Array.from({ length: len }, (_, i) => ({
    letter: guess[i] || '',
    status: 'empty' as LetterStatus
  }));

  const targetLetterCounts: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const char = target[i];
    targetLetterCounts[char] = (targetLetterCounts[char] || 0) + 1;
  }

  // 1st Pass: Exact matches (Green)
  for (let i = 0; i < len; i++) {
    if (guess[i] === target[i]) {
      result[i].status = 'correct';
      targetLetterCounts[guess[i]]--;
    }
  }

  // 2nd Pass: Misplaced matches (Yellow) or Absent (Gray)
  for (let i = 0; i < len; i++) {
    if (result[i].status === 'correct') continue;

    const char = guess[i];
    if (char && targetLetterCounts[char] && targetLetterCounts[char] > 0) {
      result[i].status = 'present';
      targetLetterCounts[char]--;
    } else {
      result[i].status = 'absent';
    }
  }

  return result;
}

/**
 * Decision Tree Explorer: Traverses a serialized decision tree
 */
export function traverseDecisionTree(
  features: WordFeatures,
  root: DecisionTreeNode
): { path: { feature: string; value: number; threshold: number; decision: string }[]; predictedTier: number; tierName: string } {
  const path: { feature: string; value: number; threshold: number; decision: string }[] = [];
  let curr: DecisionTreeNode | undefined = root;

  while (curr && !curr.isLeaf) {
    const featKey = curr.feature as keyof WordFeatures;
    const threshold = curr.threshold ?? 0;
    const actualVal = features[featKey] ?? 0;

    if (actualVal <= threshold) {
      path.push({
        feature: String(featKey),
        value: Number(actualVal),
        threshold,
        decision: `${actualVal} <= ${threshold} (Bidix / Left branch)`
      });
      curr = curr.left;
    } else {
      path.push({
        feature: String(featKey),
        value: Number(actualVal),
        threshold,
        decision: `${actualVal} > ${threshold} (Midig / Right branch)`
      });
      curr = curr.right;
    }
  }

  return {
    path,
    predictedTier: curr?.prediction ?? 0,
    tierName: curr?.tierName || 'Bilow (Easy)'
  };
}

/**
 * Generates an intelligent ML Oracle Hint based on guess progress and model state
 */
export function generateAIHint(
  guessNumber: number,
  _guessWord: string,
  targetWord: WordEntry,
  affinity: number
): string {
  const tFeats = targetWord.features;

  if (affinity >= 90) {
    return `🔥 XGBoost Radar: Aad ayaad ugu dhowdahay! Lexical Affinity waa ${affinity}%. Xarfaha dhisme ahaan way isku mid yihiin.`;
  }

  if (guessNumber === 1) {
    return `🌲 Random Forest Insight: Ereyga qarsoon waxaa loo asteeyay heerka "${targetWord.tierName}". Wuxuu leeyahay ${tFeats.vowels} shaqal (vowels).`;
  }

  if (guessNumber === 2) {
    if (tFeats.starts_with_vowel) {
      return `💡 ML Pattern Clue: Ereygu wuxuu ku bilaabmaa Xaraf Shaqal ah (Vowel). Shannon Entropy: ${tFeats.entropy} bits.`;
    } else {
      return `💡 ML Pattern Clue: Ereygu wuxuu ku bilaabmaa Xaraf Shibane ah (Consonant). Shaqalka ugu horreeya wuxuu ku jiraa booska #${tFeats.first_vowel_pos + 1}.`;
    }
  }

  if (guessNumber === 3) {
    return `⚡ XGBoost Split Hint: Qaybta naxwaha (Part of Speech): [${targetWord.pos.toUpperCase()}]. Scrabble Complexity score: ${tFeats.scrabble_score}.`;
  }

  if (guessNumber >= 4) {
    if (targetWord.hintSo) {
      return `🎯 Tilmaanta Weyn (Somali Clue): "${targetWord.hintSo}"`;
    }
    return `🎯 Qiyaasta Entropy: Ereyga qarsoon wuxuu leeyahay ${tFeats.consonant_cluster} shibane oo isku xiga.`;
  }

  return `📊 ML Affinity: ${affinity}% u dhawaansho xagga astaamaha erayga sirta ah.`;
}
