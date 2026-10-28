import os
import sys
import json
import math
import urllib.request

# Ensure UTF-8 output on Windows terminal
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import xgboost as xgb

# 1. Scrabble letter values
SCRABBLE_SCORES = {
    'a': 1, 'b': 3, 'c': 3, 'd': 2, 'e': 1, 'f': 4, 'g': 2, 'h': 4, 'i': 1,
    'j': 8, 'k': 5, 'l': 1, 'm': 3, 'n': 1, 'o': 1, 'p': 3, 'q': 10, 'r': 1,
    's': 1, 't': 1, 'u': 1, 'v': 4, 'w': 4, 'x': 8, 'y': 4, 'z': 10
}

VOWELS = set('aeiou')

def calculate_entropy(word: str) -> float:
    """Calculates Shannon Entropy of character distribution in word."""
    length = len(word)
    if length == 0:
        return 0.0
    freqs = {}
    for char in word:
        freqs[char] = freqs.get(char, 0) + 1
    entropy = 0.0
    for count in freqs.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)

def max_consonant_cluster(word: str) -> int:
    """Finds max consecutive consonants."""
    max_c = 0
    curr_c = 0
    for ch in word:
        if ch not in VOWELS:
            curr_c += 1
            if curr_c > max_c:
                max_c = curr_c
        else:
            curr_c = 0
    return max_c

def extract_features(word: str) -> dict:
    word = word.lower().strip()
    length = len(word)
    vowels = sum(1 for c in word if c in VOWELS)
    consonants = length - vowels
    unique_chars = len(set(word))
    
    # First vowel position
    first_vowel_pos = -1
    for i, c in enumerate(word):
        if c in VOWELS:
            first_vowel_pos = i
            break
    if first_vowel_pos == -1:
        first_vowel_pos = length

    # Scrabble score
    scrabble = sum(SCRABBLE_SCORES.get(c, 1) for c in word)

    # Phonetic/lexical features
    vowel_ratio = vowels / length if length > 0 else 0
    unique_ratio = unique_chars / length if length > 0 else 0
    entropy = calculate_entropy(word)
    consonant_cluster = max_consonant_cluster(word)
    ends_with_vowel = 1 if (length > 0 and word[-1] in VOWELS) else 0
    starts_with_vowel = 1 if (length > 0 and word[0] in VOWELS) else 0

    return {
        'length': length,
        'vowels': vowels,
        'consonants': consonants,
        'vowel_ratio': round(vowel_ratio, 4),
        'unique_ratio': round(unique_ratio, 4),
        'entropy': entropy,
        'scrabble_score': scrabble,
        'consonant_cluster': consonant_cluster,
        'starts_with_vowel': starts_with_vowel,
        'ends_with_vowel': ends_with_vowel,
        'first_vowel_pos': first_vowel_pos
    }

def main():
    print("🚀 [Step 1] Loading Kaggle / Oxford 5K Linguistic Dataset...")
    url = "https://raw.githubusercontent.com/nalgeon/words/main/data/oxford-5k.csv"
    raw_csv = "ml/oxford-5k.csv"
    os.makedirs("ml", exist_ok=True)
    os.makedirs("public/models", exist_ok=True)

    if not os.path.exists(raw_csv):
        urllib.request.urlretrieve(url, raw_csv)
        print("  Downloaded oxford-5k.csv")

    df = pd.read_csv(raw_csv)
    # Filter valid single alphabetic words between 4 and 8 chars
    df = df[df['word'].str.match(r'^[a-z]{4,8}$')].copy()
    df.drop_duplicates(subset=['word'], inplace=True)
    print(f"  Total filtered words for game corpus: {len(df)}")

    # Map CEFR levels to 4 distinct game difficulty tiers:
    # 0: Bilow (Easy - A1)
    # 1: Dhexe (Medium - A2, B1)
    # 2: Adag (Hard - B2)
    # 3: Halbowle (Expert - C1)
    def map_level(lvl):
        lvl = str(lvl).lower()
        if lvl == 'a1': return 0
        elif lvl in ['a2', 'b1']: return 1
        elif lvl == 'b2': return 2
        elif lvl == 'c1': return 3
        return 1

    df['tier'] = df['level'].apply(map_level)
    tier_names = {0: 'Bilow (Easy)', 1: 'Dhexe (Medium)', 2: 'Adag (Hard)', 3: 'Halbowle (Expert)'}

    # Extract feature matrix
    print("🔬 [Step 2] Feature Engineering (Entropy, Consonant Clusters, Scrabble, N-grams)...")
    feature_list = []
    for word in df['word']:
        feature_list.append(extract_features(word))
    
    X = pd.DataFrame(feature_list)
    y = df['tier'].values

    feature_cols = list(X.columns)
    print("  Extracted Features:", feature_cols)

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # 1. Train Random Forest Classifier
    print("🌲 [Step 3] Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(n_estimators=120, max_depth=9, random_state=42, min_samples_split=4)
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)
    print(f"  Random Forest Test Accuracy: {rf_acc * 100:.2f}%")

    # 2. Train XGBoost Classifier
    print("⚡ [Step 4] Training XGBoost Classifier...")
    xgb_model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.08, random_state=42, eval_metric='mlogloss')
    xgb_model.fit(X_train, y_train)
    xgb_preds = xgb_model.predict(X_test)
    xgb_acc = accuracy_score(y_test, xgb_preds)
    print(f"  XGBoost Test Accuracy: {xgb_acc * 100:.2f}%")

    # Feature Importances comparison
    rf_importance = dict(zip(feature_cols, [round(float(v), 4) for v in rf_model.feature_importances_]))
    xgb_importance = dict(zip(feature_cols, [round(float(v), 4) for v in xgb_model.feature_importances_]))

    print("  Random Forest Feature Importances:", rf_importance)
    print("  XGBoost Feature Importances:", xgb_importance)

    # Export Representative Decision Tree for UI Visualization
    # We extract tree 0 from Random Forest
    estimator = rf_model.estimators_[0].tree_
    def serialize_tree(node=0, depth=0, max_depth=4):
        if depth >= max_depth or estimator.children_left[node] == estimator.children_right[node]:
            # Leaf node
            val = estimator.value[node][0]
            predicted_class = int(np.argmax(val))
            return {
                "isLeaf": True,
                "prediction": predicted_class,
                "tierName": tier_names[predicted_class],
                "samples": int(estimator.n_node_samples[node])
            }
        feature_idx = estimator.feature[node]
        threshold = round(float(estimator.threshold[node]), 3)
        return {
            "isLeaf": False,
            "feature": feature_cols[feature_idx],
            "threshold": threshold,
            "samples": int(estimator.n_node_samples[node]),
            "left": serialize_tree(estimator.children_left[node], depth + 1, max_depth),
            "right": serialize_tree(estimator.children_right[node], depth + 1, max_depth)
        }

    sample_tree = serialize_tree(0, 0, 4)

    # 3. Build Word Knowledge Base for the Game
    print("📖 [Step 5] Compiling Curated Game Words with ML Metadata...")
    # Add predicted tier and ML affinity metrics
    df['rf_pred'] = rf_model.predict(X)
    df['xgb_pred'] = xgb_model.predict(X)

    # Selected words by length (4, 5, 6, 7 letters)
    game_words = []
    
    # Somali translations/hints for popular words
    somali_hints = {
        "apple": "Miro guduudan ama cagaaran oo macaan (Tufaax)",
        "water": "Dareere lagama maarmaan u ah nolosha (Biyo)",
        "bread": "Cunto laga sameeyo bur iyo khamiir (Rooti)",
        "chair": "Alaabta guriga lagu fariisto (Kursi)",
        "table": "Alaab dusha wax la saaro (Miis)",
        "money": "Waxyaalaha wax lagu kala iibsado (Lacag)",
        "house": "Guri ama hoy lagu noolaado",
        "plant": "Geed yar oo ka baxa ciidda (Dhir)",
        "river": "Webi ama biyo socda oo dabiici ah",
        "earth": "Dhulka aan ku noolnahay (Kowkabka)",
        "cloud": "Daruur cirka ku shareeran oo roob keenta",
        "light": "Iftiin ama nuur (Ileys)",
        "music": "Hees ama dhawaaq muusig oo heersare ah",
        "heart": "Wadnaha dhiigga wareejiya / Dareen jacayl",
        "peace": "Nabad iyo xasillooni (Nabadda)",
        "dream": "Riyo ama hammi mustaqbal",
        "brave": "Geesi aan cabsanayn (Geesinimo)",
        "space": "Hawada sare ama meerayaasha (Meere)",
        "speed": "Xawaare dheereeya (Dhaqso)",
        "flame": "Ololka dabka kuleylka badan",
        "beach": "Xeebta badda ee quruxda badan",
        "ocean": "Badweyn weyn oo biyo badan",
        "storm": "Duufaan ama dabayl roob wadata",
        "tiger": "Shabeel ama libaax xoog badan",
        "magic": "Farsamo yaab leh ama saxis",
        "smile": "Dhoolacaddayn ama farxad",
        "power": "Awood ama xoog weyn",
        "queen": "Boqorad hoggaamisa boqortooyo",
        "clock": "Saacad lagu cabiro waqtiga",
        "guide": "Hagaha wax tusaalayaasha (Talo-bixiye)",
        "robot": "Qalab AI oo si toos ah u shaqeeya",
        "cyber": "Dunida internet-ka iyo tiknoolajiyada",
        "focus": "Diirad-saar ama ku fooganaansho",
        "logic": "Caqli-gal ama xisaabtan xeel-dheer",
        "pixel": "Dhibicda ugu yar ee shaashadda",
        "smart": "Xariif ama maskax badan",
        "vital": "Muhiim ah ama nolosha u dhow",
        "world": "Dunida oo dhan ama caalamka",
        "youth": "Dhalinyarada iyo mustaqbalka",
        "stone": "Dhagax adag",
        "silver": "Qalin (macdan qaali ah)",
        "winter": "Xilliga qabowga / jiilaalka",
        "summer": "Xilliga xagaaga ee diirran",
        "spring": "Xilliga gu'ga ee doogga leh",
        "forest": "Kayn weyn oo geedo badan",
        "desert": "Saxare ama dhul oomane ah",
        "island": "Jasiirad ku dhex taal biyaha"
    }

    for idx, row in df.iterrows():
        w = row['word']
        feats = extract_features(w)
        hint = somali_hints.get(w, f"Erey ka kooban {len(w)} xaraf ({row['pos'] if pd.notna(row['pos']) else 'erey'})")
        
        game_words.append({
            "word": w,
            "len": len(w),
            "tier": int(row['tier']),
            "tierName": tier_names[int(row['tier'])],
            "pos": str(row['pos']) if pd.notna(row['pos']) else "noun",
            "hintSo": hint,
            "features": feats
        })

    # Save models metadata JSON
    model_export = {
        "metadata": {
            "totalWords": len(game_words),
            "rfAccuracy": round(rf_acc, 4),
            "xgbAccuracy": round(xgb_acc, 4),
            "featureColumns": feature_cols,
            "rfFeatureImportance": rf_importance,
            "xgbFeatureImportance": xgb_importance,
            "sampleDecisionTree": sample_tree,
            "tierLabels": ["Bilow (Easy)", "Dhexe (Medium)", "Adag (Hard)", "Halbowle (Expert)"]
        },
        "words": game_words
    }

    out_path = "public/models/word_ml_data.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(model_export, f, indent=2, ensure_ascii=False)
    
    print(f"✨ Successfully saved ML Model & Word Data to {out_path} ({len(game_words)} words)")
    print(f"File size: {os.path.getsize(out_path) / 1024:.1f} KB")

if __name__ == "__main__":
    main()
