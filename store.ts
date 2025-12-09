/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE } from './types';

// The massive list of words for levels
const LOM_WORDS = [
'абен', 'абич', 'ала', 'артиса', 'бадива', 'балдър', 'бам бадива', 'бапка', 'бара', 'барабиняк', 'бадънь', 'батисал', 'бафнем', 'башка', 'бекярин', 'беломуняв', 'беневреци', 'бибе', 'бибиткам', 'битанка', 'близним', 'биковит', 'бла', 'ботор', 'брез', 'бреца', 'буам', 'буедак', 'бутурньоствам', 'бучав', 'бучеавица', 'буцуняк', 'бътвам се', 'бювам', 'бювоч', 'вангълци', 'видело', 'вепър', 'влака', 'врабчово сръце', 'вратница', 'вратняк', 'връло', 'врътоглав', 'врътокав', 'гецко', 'гижа', 'гламав', 'глис', 'глъчим', 'гнявим', 'гнякне', 'гнясанье', 'граваям', 'гребаска', 'грездей', 'грома', 'гръджав', 'гръцмунь', 'гътне', 'гьоджаво', 'дебре', 'дедовия', 'дека', 'декам', 'дудне', 'джанарка', 'джапам', 'джваньок', 'дживгар', 'джуруяк', 'дзепам', 'дзвръкла', 'дзръкеле', 'донаюя', 'дръва', 'дръвя', 'дуд', 'дуня', 'ендък', 'ептем', 'ечанка', 'живодерняк', 'жмуьо', 'жояв', 'жуленье', 'забъкнем', 'заврътнячим', 'за глава', 'загрезва', 'затиской', 'затра', 'изврънат', 'изгъгвам', 'гъгнем', 'изкилиферчил', 'изклесяк', 'изкорубен', 'излундзи', 'изокам', 'изребрим', 'изрепчвам', 'изтресквам', 'ияк', 'казма', 'какаяшка', 'кам', 'камара', 'кандилкя', 'кандисам', 'караконяк', 'кикерчим', 'кимвам', 'кинем', 'киселица', 'кияк', 'клапавци', 'клесовиня', 'клефунь', 'клецам', 'климбуцам', 'ковнем', 'козиняк', 'колик', 'компир', 'конощип', 'коняк', 'костеница', 'котленкя', 'кощрамба', 'креотим', 'кротушка', 'кръжа', 'кръндей', 'кръпей', 'кукуруз', 'кукуржянка', 'кулен', 'куртулисам', 'кута', 'кьорав', 'кюца', 'лаасе', 'ландзим', 'лендзя', 'ливагье', 'лигурище', 'лизгам', 'лис', 'лиска', 'ломпар', 'лундзим', 'лупнем', 'льохав', 'лъчкам', 'магаза', 'маица', 'манара', 'мандрамуняк', 'мандръсам', 'мачка', 'мердень', 'мертек', 'мечка', 'мешина', 'меям', 'мирва', 'митията овца', 'мишка', 'млъзе', 'море', 'мотовилкя', 'мочам', 'мръзлица', 'муанем', 'музувирлък', 'мундза', 'нагньитам', 'нагръчвам', 'наиа', 'накокръжвам', 'накостръжвам', 'налундзим', 'натамия', 'натрътил', 'наюя', 'непрекръшнячван', 'неуметен', 'нефелен', 'ниел', 'нога', 'нужник', 'обги', 'огравазди', 'огръйе', 'окам', 'окапляк', 'окикерчил', 'олам', 'олисветим', 'олисел', 'опалия', 'опростил', 'ореше', 'орей', 'отваа', 'отдънък', 'оти', 'отма', 'отоди', 'ояндзим', 'паъздерки', 'палаш', 'паприкаш', 'пелешки', 'перашка', 'пишлегар', 'пойдех', 'полверняк', 'поокръвям', 'послушах', 'пребатам', 'прекинем', 'прерипам', 'претрошвам', 'призне', 'пристануша', 'проглобен', 'просуане', 'пръделник', 'пръйевина', 'пуанем', 'пупа', 'пьоска', 'плюска', 'пюскам', 'разклимбучкан', 'разпарчетосам', 'рапнем', 'разплул', 'разпоретина', 'разпръчвам', 'разчепанка', 'ребрим', 'репчим', 'ресовачка', 'ручим', 'саньи', 'светлосур', 'свинак', 'сгняви', 'сгруяк', 'сгръчен', 'сисам', 'склепаторен', 'скрибуцанье', 'скоросмрътница', 'скутам', 'слуням', 'спареняк', 'спаружен', 'спотурам', 'сприя', 'стеня', 'стока', 'стръчвам се', 'суросинкяв', 'стъвиня се', 'суек', 'сур', 'сурвам', 'съвиня се', 'съпикясвам', 'сътвер', 'съглам', 'тай се', 'таралясник', 'тенчасам', 'теферич', 'трескам', 'троним', 'тулуп', 'турта', 'тутма', 'тъпкач', 'удевам', 'укьо', 'улав', 'урбулешката', 'уруглица', 'урунгел', 'уруспия', 'уяндзвам', 'удзерепил', 'улендзим', 'умулузвам', 'урапляк', 'урбулешката', 'урунгел', 'урусрия', 'уръф(л)як', 'учуван', 'фараж', 'фейско', 'физгам', 'фулиш', 'цинка', 'циу', 'челенкя', 'чият', 'чмим', 'чръв', 'чучуято', 'шака', 'шашав', 'шашавица', 'швикам', 'шиблики', 'шибнем', 'шийок', 'шпора', 'шуштава', 'шишим', 'шмундел', 'шугавелняк', 'шунда', 'шуштава', 'шушумига', 'щрока', 'юрвам', 'юснем'
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

  // Actions
  startGame: () => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;
  collectLetter: (index: number) => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  increaseSpeed: (amount: number) => void;
  
  // Shop / Abilities
  buyItem: (type: 'DOUBLE_JUMP' | 'MAX_LIFE' | 'HEAL' | 'IMMORTAL', cost: number) => boolean;
  advanceLevel: () => void;
  openShop: () => void;
  closeShop: () => void;
  activateImmortality: () => void;
}

const getRandomWord = () => {
    const word = LOM_WORDS[Math.floor(Math.random() * LOM_WORDS.length)];
    // Filter out spaces or weird chars if any, though list looks mostly clean words
    // Convert to uppercase for display
    return word.toUpperCase().split('').filter(c => c.trim() !== '');
};

const MAX_LEVEL = 10; // Increased max levels since we have many words

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
    isImmortalityActive: false
  }),

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
    isImmortalityActive: false
  }),

  takeDamage: () => {
    const { lives, isImmortalityActive } = get();
    if (isImmortalityActive) return; 

    if (lives > 1) {
      set({ lives: lives - 1 });
    } else {
      set({ lives: 0, status: GameStatus.GAME_OVER, speed: 0 });
    }
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  
  collectGem: (value) => set((state) => ({ 
    score: state.score + value, 
    gemsCollected: state.gemsCollected + 1 
  })),

  setDistance: (dist) => set({ distance: dist }),

  collectLetter: (index: number) => {
    const { collectedLetters, level, speed, targetWord } = get();
    
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
      const { level, speed } = get();
      const nextLevel = level + 1;
      
      const newWord = getRandomWord();

      // Reset speed to base for every level start
      set({
          level: nextLevel,
          laneCount: 3, // Always keep it 3 lanes
          status: GameStatus.PLAYING, 
          speed: RUN_SPEED_BASE,
          collectedLetters: [],
          targetWord: newWord
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
                  set({ maxLives: maxLives + 1, lives: lives + 1 });
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
      const { hasImmortality, isImmortalityActive } = get();
      if (hasImmortality && !isImmortalityActive) {
          set({ 
            isImmortalityActive: true,
            hasImmortality: false // Consume the item immediately
          });
          setTimeout(() => {
              set({ isImmortalityActive: false });
          }, 5000);
      }
  },

  setStatus: (status) => set({ status }),
}));
