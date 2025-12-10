
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE, BossType, HighScores } from './types';

// The massive list of words for levels
const LOM_WORDS = [
'абен', 'абич', 'ала', 'артиса', 'артише', 'бадива', 'балдър', 'балдисам', 'бам бадива', 'банкова джанка', 'бапка', 'бара', 'барабиняк', 'бадънь', 'батисал', 'батисам', 'бафнем', 'башка', 'бекярин', 'бек ярин', 'беломуняв', 'беневреци', 'бега', 'бибе', 'бибиткам', 'битанка', 'близним', 'биковит', 'бла', 'бобовица', 'ботор', 'брез', 'брег', 'бреца', 'брус', 'бръмбайосканье', 'бръстец', 'буам', 'бубам', 'буедак', 'бутурньоствам', 'бучав', 'бучеавица', 'буцуняк', 'бътвам се', 'бювам', 'бювоч', 'вангълци', 'вария', 'варкам', 'ваявица', 'видело', 'вепър', 'влака', 'врабче', 'врабчово сръце', 'вратница', 'вратняк', 'връло', 'врътоглав', 'врътокав', 'гашник', 'гецко', 'гижа', 'гламав', 'глис', 'глъчим', 'гнявим', 'гнякне', 'гнясам', 'гнясанье', 'гньетем', 'граваям', 'гребаска', 'грездей', 'грома', 'груава', 'гръджав', 'гръцмунь', 'гуменици', 'гъгнем', 'гътне', 'гьоджа', 'гьоджаво', 'гьостерица', 'деййй', 'дебре', 'дедовия', 'дека', 'декам', 'диня', 'донадя', 'донаюя', 'донаюям', 'дреньосвам', 'дръва', 'дръвя', 'дръжайе', 'дуд', 'дудна', 'дудне', 'дуня', 'джанарка', 'джапам', 'джваньок', 'дживгар', 'джинка', 'джуруяк', 'дзепам', 'дзепам', 'дзиндзирикам', 'дзвръкла', 'дзръкеле', 'емвам', 'ендък', 'ептем', 'ерча', 'ечанка', 'живодерняк', 'жмулим', 'жмуьо', 'жояв', 'жуберкам', 'жуленье', 'забъкнем', 'забъквам', 'заврътнячим', 'за глава', 'загрезва', 'занемим', 'запищен', 'затиской', 'затра', 'изврънат', 'изгъгвам', 'гъгнем', 'изджугам', 'изжлембен', 'изкилиферчил', 'изклесяк', 'изкорубен', 'излундзи', 'изместо', 'изокам', 'изребрим', 'изрепчвам', 'изтресквам', 'изувам', 'ияк', 'иядим', 'казма', 'какаяшка', 'кам', 'камара', 'камберица', 'кандилкя', 'кандисам', 'караконяк', 'качамилкя', 'кикерчим', 'кимвам', 'кинем', 'киселица', 'кияк', 'клапавци', 'клес', 'клесовиня', 'клефунь', 'клецам', 'климбуцам', 'ковнем', 'козиняк', 'колик', 'коликав', 'компир', 'конощип', 'коняк', 'костеница', 'котленкя', 'кощрамба', 'кракна', 'креотим', 'кротушка', 'кръжа', 'кръндей', 'кръпей', 'кукуруз', 'кукуржянка', 'кулен', 'куртолисам', 'куртулисам', 'кута', 'къдея', 'кьорав', 'кюфна', 'кюца', 'лаасе', 'ландзим', 'леа', 'лендзя', 'ливагье', 'лигурище', 'лизгам', 'лис', 'лиска', 'лисковиня', 'ломотим', 'ломпар', 'лубеница', 'лугье', 'лундзим', 'лупнем', 'льохав', 'лъчкам', 'магаза', 'маица', 'макя', 'малешка', 'манара', 'манарче', 'мандрамуняк', 'мандръсам', 'маторец', 'мачка', 'мердень', 'мертек', 'мечка', 'мешина', 'меям', 'мирва', 'митията овца', 'мишка', 'млъзе', 'море', 'мотовилкя', 'мочам', 'мръзлица', 'муж', 'муанем', 'музувирлък', 'мундза', 'навияк', 'нагньитам', 'нагръчвам', 'накостръжвам', 'накостръжвам', 'налундзим', 'наплатисам', 'натамия', 'натрътил', 'наюя', 'непрекръшнячван', 'неуметен', 'нефелен', 'ниел', 'нога', 'нужник', 'обги', 'образ', 'огалатим', 'огравазди', 'ограваздим', 'огръйе', 'одекам', 'оджак', 'озяве', 'озявница', 'окам', 'окапляк', 'окикерчил', 'олам', 'олисветим', 'олисел', 'опалия', 'опиня', 'опростил', 'опупен', 'ореше', 'орей', 'отваа', 'отдънък', 'оти', 'отма', 'отоди', 'отчръпна', 'офянквам', 'ояндзим', 'паъздерки', 'паздерки', 'палаш', 'паприкаш', 'пелешки', 'пенджер', 'перашка', 'печеняк', 'пишлегар', 'пищеж', 'плавя', 'плюска', 'побуял', 'поврачам', 'поврътиням', 'подфръкат', 'пойдех', 'полверняк', 'поокръвям', 'послушах', 'пранги', 'пребатам', 'прекинем', 'прекросним', 'прекръшнячим', 'прерипам', 'пресламбачим', 'претрошвам', 'призне', 'приклопим', 'приоданец', 'пристануша', 'проглобен', 'просуане', 'пръвица', 'пръделник', 'пръжено', 'пръйевина', 'пръцела', 'пуанем', 'пукяшем', 'пупа', 'пупнем', 'пъквам', 'пьоска', 'пюскам', 'раат', 'разжлембен', 'разклимбучкан', 'разландисвам', 'размитам', 'разпарчетосам', 'рапнем', 'разплул', 'разпоретина', 'разпръчвам', 'разпоретина', 'разпръчвам', 'разчепанка', 'ребрим', 'репчим', 'ресовачка', 'ритли', 'ручим', 'ръски', 'саньи', 'светлосур', 'свинак', 'свинаковина', 'сгняви', 'сгруяк', 'сгръчен', 'син-котлен', 'сине', 'сисам', 'скали', 'склепаторен', 'скомино', 'скрибуцанье', 'скоросмрътница', 'скутам', 'слуням', 'слутам', 'слутняк', 'слушам', 'смитам', 'спареняк', 'спаружен', 'сплащам', 'спотурам', 'сприя', 'стеня', 'стока', 'столовка', 'стришам', 'стръчвам', 'стръчвам се', 'суглет', 'суек', 'сур', 'суросинкяв', 'сурвам', 'стъвиня се', 'съвиня се', 'съпикясвам', 'сътвер', 'съглам', 'тай', 'тай се', 'тараба', 'таралясник', 'таферен', 'тенчасам', 'теферич', 'трескам', 'троним', 'тръни', 'тулуп', 'турта', 'тутма', 'туч', 'тъпкач', 'удевам', 'укьо', 'улав', 'урбулешката', 'уруглица', 'урунгел', 'уруспия', 'уяндзвам', 'удзерепил', 'улендзим', 'умулузвам', 'урапляк', 'уръф(л)як', 'ускоре', 'учуван', 'фараж', 'фейско', 'физгам', 'фулиш', 'цедило', 'цепленка', 'цифка', 'цинка', 'циу', 'циция', 'црън', 'челенкя', 'чеели', 'чият', 'чмим', 'човещинка', 'чръв', 'чувам', 'чудинка', 'чучуято', 'шака', 'шанец', 'шашав', 'шашавица', 'шашю', 'швикам', 'шиблики', 'шибнем', 'шийок', 'шишим', 'шмундел', 'шпора', 'шугавелняк', 'шукна', 'шунда', 'шупя', 'шуштава', 'шушумига', 'щрока', 'юрвам', 'юснем', 'ягмосва'
];

interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  maxLives: number;
  speed: number;
  collectedLetters: number[]; 
  targetWord: string[];
  level: number;
  laneCount: number;
  gemsCollected: number;
  distance: number;
  
  // Inventory / Abilities
  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;
  immortalityUsedOnLevel: number; // Tracks on which level it was last used
  
  // Boss State
  bossHp: number;
  maxBossHp: number;
  bossType: BossType;

  // Persistence
  highScores: HighScores;
  newRecordSet: boolean;
  lastPlayedLevel: number;

  // Actions
  startGame: () => void;
  continueGame: () => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;
  collectLetter: (index: number) => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  increaseSpeed: (amount: number) => void;
  checkHighScores: (finalDistance: number) => void;
  
  // Shop / Abilities
  buyItem: (type: 'DOUBLE_JUMP' | 'MAX_LIFE' | 'HEAL' | 'IMMORTAL', cost: number) => boolean;
  advanceLevel: () => void;
  openShop: () => void;
  closeShop: () => void;
  activateImmortality: () => void;
  
  // Boss Actions
  damageBoss: (amount: number) => void;
  defeatBoss: () => void;
}

const getRandomWord = () => {
    const word = LOM_WORDS[Math.floor(Math.random() * LOM_WORDS.length)];
    return word.toUpperCase().split('').filter(c => c.trim() !== '');
};

// Helper to load high scores
const loadHighScores = (): { scores: HighScores, lastLevel: number } => {
    try {
        const saved = localStorage.getItem('lom_highscores');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migration for older saves or adding new field
            return {
                scores: {
                    maxScore: parsed.maxScore || 0,
                    maxDistance: parsed.maxDistance || 0,
                    maxLevel: parsed.maxLevel || 1,
                    maxGems: parsed.maxGems || 0
                },
                lastLevel: parsed.lastPlayedLevel || 1
            };
        }
    } catch (e) {
        console.error("Failed to load high scores", e);
    }
    return { 
        scores: { maxScore: 0, maxDistance: 0, maxLevel: 1, maxGems: 0 },
        lastLevel: 1 
    };
};

const loadedData = loadHighScores();

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  score: 0,
  lives: 3,
  maxLives: 3,
  speed: 0,
  collectedLetters: [],
  targetWord: [],
  level: 1,
  laneCount: 3,
  gemsCollected: 0,
  distance: 0,
  
  hasDoubleJump: false,
  hasImmortality: false,
  isImmortalityActive: false,
  immortalityUsedOnLevel: -1,
  
  bossHp: 100,
  maxBossHp: 100,
  bossType: 'NONE',

  highScores: loadedData.scores,
  lastPlayedLevel: loadedData.lastLevel,
  newRecordSet: false,

  startGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 3,
    maxLives: 3,
    speed: RUN_SPEED_BASE,
    collectedLetters: [],
    targetWord: getRandomWord(),
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    hasDoubleJump: false,
    hasImmortality: false,
    isImmortalityActive: false,
    immortalityUsedOnLevel: -1,
    bossHp: 100,
    maxBossHp: 100,
    bossType: 'NONE',
    newRecordSet: false 
  }),

  continueGame: () => {
      const { lastPlayedLevel } = get();
      const startLevel = lastPlayedLevel > 1 ? lastPlayedLevel : 1;
      
      set({ 
        status: GameStatus.PLAYING, 
        score: 0, 
        lives: 3,
        maxLives: 3,
        speed: RUN_SPEED_BASE,
        collectedLetters: [],
        targetWord: getRandomWord(),
        level: startLevel,
        laneCount: 3,
        gemsCollected: 0,
        distance: 0,
        hasDoubleJump: false,
        hasImmortality: false,
        isImmortalityActive: false,
        immortalityUsedOnLevel: -1,
        bossHp: 100,
        maxBossHp: 100,
        bossType: 'NONE',
        newRecordSet: false 
      });
  },

  restartGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 3,
    maxLives: 3,
    speed: RUN_SPEED_BASE,
    collectedLetters: [],
    targetWord: getRandomWord(),
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    hasDoubleJump: false,
    hasImmortality: false,
    isImmortalityActive: false,
    immortalityUsedOnLevel: -1,
    bossHp: 100,
    maxBossHp: 100,
    bossType: 'NONE',
    newRecordSet: false
  }),

  takeDamage: () => {
    const { lives, isImmortalityActive } = get();
    if (isImmortalityActive) return; 

    if (lives > 1) {
      set({ 
        lives: lives - 1,
        hasDoubleJump: false // LOSE DOUBLE JUMP ON HIT
      });
    } else {
      // GAME OVER - Score logic moved to checkHighScores
      set({ 
          lives: 0, 
          status: GameStatus.GAME_OVER, 
          speed: 0,
          newRecordSet: false,
          hasDoubleJump: false
      });
    }
  },

  checkHighScores: (finalDistance: number) => {
      const state = get();
      const currentScore = state.score;
      const currentLevel = state.level;
      const currentGems = state.gemsCollected;
      
      const { maxScore, maxDistance, maxLevel, maxGems } = state.highScores;
      const lastPlayedLevel = state.lastPlayedLevel;
      
      let isNewRecord = false;
      const newHighScores = { ...state.highScores };

      if (currentScore > maxScore) { newHighScores.maxScore = currentScore; isNewRecord = true; }
      if (finalDistance > maxDistance) { newHighScores.maxDistance = finalDistance; isNewRecord = true; }
      if (currentLevel > maxLevel) { newHighScores.maxLevel = currentLevel; isNewRecord = true; }
      if (currentGems > maxGems) { newHighScores.maxGems = currentGems; isNewRecord = true; }

      // Save persistent data
      const dataToSave = {
          ...newHighScores,
          lastPlayedLevel: Math.max(lastPlayedLevel, currentLevel) // Keep the highest level reached
      };
      
      localStorage.setItem('lom_highscores', JSON.stringify(dataToSave));

      set({ 
          highScores: newHighScores,
          lastPlayedLevel: dataToSave.lastPlayedLevel,
          newRecordSet: isNewRecord
      });
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  
  collectGem: (value) => set((state) => ({ 
    score: state.score + value, 
    gemsCollected: state.gemsCollected + 1 
  })),

  setDistance: (dist) => set({ distance: dist }),

  collectLetter: (index: number) => {
    const { collectedLetters, level, speed, targetWord } = get();
    
    // Safety check: Do not advance if no word set (e.g. during Boss Fight)
    if (!targetWord || targetWord.length === 0) return;

    if (!collectedLetters.includes(index)) {
      const newLetters = [...collectedLetters, index];
      
      const speedIncrease = RUN_SPEED_BASE * 0.10;
      const nextSpeed = speed + speedIncrease;

      set({ 
        collectedLetters: newLetters,
        speed: nextSpeed
      });

      // Check if full word collected
      if (newLetters.length === targetWord.length) {
          // Immediately advance level
          get().advanceLevel();
      }
    }
  },

  increaseSpeed: (amount) => set((state) => ({ speed: state.speed + amount })),

  advanceLevel: () => {
      const { level, speed, highScores, lastPlayedLevel } = get();
      const nextLevel = level + 1;
      
      // Update lastPlayedLevel persistence immediately on advance
      if (nextLevel > lastPlayedLevel) {
          const dataToSave = {
              ...highScores,
              lastPlayedLevel: nextLevel
          };
          localStorage.setItem('lom_highscores', JSON.stringify(dataToSave));
          set({ lastPlayedLevel: nextLevel });
      }

      // VICTORY CHECK
      if (nextLevel > LOM_WORDS.length) {
          set({ 
              status: GameStatus.VICTORY,
              level: nextLevel,
              speed: 0 
          });
          return;
      }

      // BOSS FIGHT LOGIC: Every 3 levels
      if (nextLevel % 3 === 0) {
          const encounterIndex = nextLevel / 3;
          // Rotation: 1 -> Kalin, 2 -> Stilyan, 3 -> Nikolai
          const cycle = encounterIndex % 3; 
          
          let bossType: BossType = 'KALIN'; 
          if (cycle === 2) bossType = 'STILYAN';
          if (cycle === 0) bossType = 'NIKOLAI';
          
          const bossHealth = (500 + (nextLevel * 50)) * 2;
          
          set({
              level: nextLevel,
              status: GameStatus.BOSS_FIGHT,
              bossHp: bossHealth,
              maxBossHp: bossHealth,
              bossType: bossType,
              collectedLetters: [],
              targetWord: [] 
          });
          return;
      }
      
      const newWord = getRandomWord();

      // Reset speed to base for every level start
      set({
          level: nextLevel,
          laneCount: 3, 
          status: GameStatus.PLAYING, 
          speed: RUN_SPEED_BASE,
          collectedLetters: [],
          targetWord: newWord,
          bossType: 'NONE'
      });
  },
  
  damageBoss: (amount) => {
      const { bossHp, defeatBoss } = get();
      const newHp = bossHp - amount;
      if (newHp <= 0) {
          set({ bossHp: 0 });
          defeatBoss();
      } else {
          set({ bossHp: newHp });
      }
  },
  
  defeatBoss: () => {
      const { score, level } = get();
      const newWord = getRandomWord();
      
      set({ 
          status: GameStatus.PLAYING, 
          score: score + 5000,
          level: level + 1, 
          collectedLetters: [],
          targetWord: newWord,
          bossHp: 0,
          bossType: 'NONE',
          speed: RUN_SPEED_BASE
      });
  },

  openShop: () => set({ status: GameStatus.SHOP }),
  
  closeShop: () => set({ status: GameStatus.PLAYING }),

  buyItem: (type, cost) => {
      const { score, maxLives, lives } = get();
      
      if (score >= cost) {
          set({ score: score - cost });
          
          switch (type) {
              case 'DOUBLE_JUMP':
                  set({ hasDoubleJump: true });
                  break;
              case 'MAX_LIFE':
                  const newMax = Math.min(maxLives + 1, 5); // CHANGED MAX TO 5
                  set({ maxLives: newMax, lives: Math.min(lives + 1, newMax) });
                  break;
              case 'HEAL':
                  set({ lives: Math.min(lives + 1, maxLives) });
                  break;
              case 'IMMORTAL':
                  set({ hasImmortality: true });
                  break;
          }
          return true;
      }
      return false;
  },

  activateImmortality: () => {
      const { hasImmortality, isImmortalityActive, level, immortalityUsedOnLevel } = get();
      
      // Check if player has the ability and it's not currently active
      if (hasImmortality && !isImmortalityActive) {
          set({ 
            isImmortalityActive: true,
            hasImmortality: false // Consumed on use
          });
          setTimeout(() => {
              set({ isImmortalityActive: false });
          }, 25000); // 25 seconds
      }
  },

  setStatus: (status) => set({ status }),
}));
