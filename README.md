# 🧠 Ereyga Qarsoon AI — ML Mystery Word Game

> **Cayaarta Ereyga Qarsoon oo ay Hagayso Machine Learning (Random Forest & XGBoost)**  
> *An intelligent, seedable mystery word puzzle game powered by trained Machine Learning models and Kaggle NLP linguistic feature engineering.*

---

## 🌟 Muuqaalka Guud (Overview)

**Ereyga Qarsoon AI** waa cayaar cusub oo casri ah oo ku dhisan cilmiga **Machine Learning (Sirdoonka Macmalka ah)**. Halkii aad kaliya xarfo ka qiyaasi lahayd sidii Wordle-ka caadiga ah, halkan waxaa ku weheliya laba model oo xooggan: **Random Forest** iyo **XGBoost**.

- 🎯 **Qiyaas Ereyga Qarsoon**: Hayso 6 fursadood oo aad ku hesho ereyga qarsoon.
- 📡 **XGBoost ML Radar**: Qiyaas kasta kadib, radar-ka ayaa xisaabinaya boqolleyda u-dhowaanshaha astaamaha (Lexical Feature Affinity %: 0% - 100%).
- 🌲 **Random Forest Oracle Clues**: Model-ku wuxuu bixiyaa talooyin caqli-gal ah oo ku saabsan tirada shaqallada, heerka adkaanta, iyo macnaha ereyga af Soomaali!
- 🎲 **Deterministic Seeding (Multiplayer)**: Dooro **Daily Challenge** (Maalinle) ama qor **Seed gaar ah** (tusaale: `somali-ai-2026`) si adiga iyo asxaabtaadu u wada heshaan isla hal erey oo aad u tartantaan!
- 🔬 **ML Laboratory (Model Inspector)**: Baar erey kasta, arag 11-ka astaamood oo xisaabeed (Shannon Entropy, Scrabble Score, Consonant Clusters), oo daawo socodka geedka go'aanka (Decision Tree Traversal) ee Random Forest.
- 🔊 **Synthesized Web Audio**: Dhawaaqyo macaan oo toos looga dhex sameeyay browser-ka iyadoo la adeegsanayo Web Audio API (uma baahna faylal dibadda laga soo dejiyo).
- 🌐 **Dual Language Support**: Hal gujin ku kala beddel **Af-Soomaali** iyo **English**.

---

## 🤖 Awoodda Machine Learning (ML Architecture)

### 1. Dataset-ka (Kaggle & Oxford 5K Corpus)
Model-ku wuxuu ku tababaran yahay keyd xogeed ka kooban **3,450+ erey** oo leh astaamo naxwe iyo heerarka adkaanta CEFR (A1, A2, B1, B2, C1):
- **Bilow (Easy - A1)**: Ereyada aasaasiga ah sida `water`, `earth`, `apple`, `light`
- **Dhexe (Medium - A2/B1)**: Ereyada caadiga ah sida `planet`, `music`, `silver`, `nature`
- **Adag (Hard - B2)**: Ereyada kakan sida `crystal`, `dynamic`, `matrix`, `venture`
- **Halbowle (Expert - C1)**: Ereyada sayniska iyo farsamada sida `quantum`, `zenith`, `ambush`

### 2. Astaamaha Xisaabeed (11 Feature Dimensions)
1. `length`: Dhererka ereyga (4 ilaa 8 xaraf)
2. `vowels`: Tirada xarfaha shaqalka ah (`a, e, i, o, u`)
3. `consonants`: Tirada xarfaha shibanayaasha ah
4. `vowel_ratio`: Saamiga shaqallada ku leeyihiin ereyga
5. `unique_ratio`: Kala duwanaanshaha xarfaha (Unique char density)
6. `entropy`: Shannon Information Entropy:
   $$H(w) = - \sum_{c \in \Sigma} p(c) \log_2 p(c)$$
7. `scrabble_score`: Miisaanka xarfaha dhifka ah (Q, Z, X, J vs E, A, T)
8. `consonant_cluster`: Shibane-yaasha ugu badan ee isku xiga
9. `starts_with_vowel`: In uu ku bilaabmo shaqal (Binary 0 ama 1)
10. `ends_with_vowel`: In uu ku dhamaado shaqal (Binary 0 ama 1)
11. `first_vowel_pos`: Booska uu shaqalka koowaad ku jiro

### 3. Algoritmada La Isticmaalay:
- **Random Forest Classifier**: Tababaran yahay 120 geed oo go'aanno ah (`n_estimators=120`, `max_depth=9`). Waxaa loo adeegsadaa saadaalinta heerka adkaanta iyo kala saarista astaamaha.
- **XGBoost Classifier & Regressor**: Tababaran yahay (`learning_rate=0.08`, `max_depth=5`) si uu u xisaabiyo miisaanka masaafada u dhexeysa qiyaasta cayaaryahanka iyo ereyga qarsoon (ML Radar Affinity Score).

---

## 🚀 Sida Loo Orod siiyo Local-ka (Getting Started)

### Shuruudaha:
- Node.js (v18+)
- Python (3.9+) oo leh `scikit-learn`, `xgboost`, `pandas`, `numpy`

### 1. Rakib Node Dependencies
```bash
npm install
```

### 2. Tababar Model-ka ML (Haddii aad rabto inaad dib u tababarto)
```bash
python ml/train_models.py
```
*Tani waxay soo dejinaysaa dataset-ka, tababaraysaa Random Forest & XGBoost, waxayna `public/models/word_ml_data.json` u dhoofinaysaa qaabka Web-ku aqrin karo.*

### 3. Bilow Server-ka Cayaarta
```bash
npm run dev
```
Fur browser-ka: `http://localhost:5173`

### 4. Build-ka Production-ka
```bash
npm run build
```

---

## ☁️ Daabacaadda Vercel & GitHub (Deploy to Vercel & GitHub)

### Habka 1: Vercel CLI (1-Click Deployment)
Mashruucani wuxuu horey u leeyahay `vercel.json` oo si toos ah u habaysan:

```bash
# 1. Login to Vercel
npx vercel login

# 2. Deploy to Production
npx vercel --prod
```

### Habka 2: GitHub + Vercel Dashboard
1. Ku riix mashruucaaga GitHub:
   ```bash
   git add .
   git commit -m "feat: Ereyga Qarsoon ML Game with Random Forest & XGBoost"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/ereyga-qarsoon-ai.git
   git push -u origin main
   ```
2. Tag [vercel.com](https://vercel.com)
3. Dooro **"Add New Project"** -> Soo xulo repository-gaaga GitHub.
4. Framework Preset wuxuu noqonayaa **Vite** (si toos ah ayuu u garanayaa).
5. Guji **Deploy**! 🚀

---

## 🎮 Qawaaniinta Cayaarta (Game Rules)

- 🟩 **Cagaar (Correct)**: Xarafku wuxuu ku jiraa ereyga, booskiisuna waa sax.
- 🟨 **Hurdi (Present)**: Xarafku wuxuu ku jiraa ereyga, laakiin boos khaldan ayuu ku jiraa.
- ⬛ **Ciil (Absent)**: Xarafku kuma jiro ereyga qarsoon haba yaraatee.
- 📡 **Radar Meter**: Wuxuu ku tusayaa boqolleyda (Affinity %) uu ereygaagu u dhow yahay qaab-dhismeedka ereyga la raadinayo.

---

## 📄 License
MIT License — Xor ayaad u tahay inaad horumariso ama wax ku kordhiso!
