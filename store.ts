/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE } from './types';

// The massive list of words for levels
const LOM_WORDS = [
'абен', 'абич', 'ала', 'артиса', 'артише', 'бадива', 'балдър', 'балдисам', 'бам бадива', 'банкова джанка', 'бапка', 'бара', 'барабиняк', 'бадънь', 'батисал', 'батисам', 'бафнем', 'башка', 'бекярин', 'бек ярин', 'беломуняв', 'беневреци', 'бега', 'бибе', 'бибиткам', 'битанка', 'близним', 'биковит', 'бла', 'бобовица', 'ботор', 'брез', 'брег', 'бреца', 'брус', 'бръмбайосканье', 'бръстец', 'буам', 'бубам', 'буедак', 'бутурньоствам', 'бучав', 'бучеавица', 'буцуняк', 'бътвам се', 'бювам', 'бювоч', 'вангълци', 'вария', 'варкам', 'ваявица', 'видело', 'вепър', 'влака', 'врабче', 'врабчово сръце', 'вратница', 'вратняк', 'връло', 'врътоглав', 'врътокав', 'гашник', 'гецко', 'гижа', 'гламав', 'глис', 'глъчим', 'гнявим', 'гнякне', 'гнясам', 'гнясанье', 'гньетем', 'граваям', 'гребаска', 'грездей', 'грома', 'груава', 'гръджав', 'гръцмунь', 'гуменици', 'гъгнем', 'гътне', 'гьоджа', 'гьоджаво', 'гьостерица', 'деййй', 'дебре', 'дедовия', 'дека', 'декам', 'диня', 'донадя', 'донаюя', 'донаюям', 'дреньосвам', 'дръва', 'дръвя', 'дръжайе', 'дуд', 'дудна', 'дудне', 'дуня', 'джанарка', 'джапам', 'джваньок', 'дживгар', 'джинка', 'джуруяк', 'дзевам', 'дзепам', 'дзиндзирикам', 'дзвръкла', 'дзръкеле', 'емвам', 'ендък', 'ептем', 'ерча', 'ечанка', 'живодерняк', 'жмулим', 'жмуьо', 'жояв', 'жуберкам', 'жуленье', 'забъкнем', 'забъквам', 'заврътнячим', 'за глава', 'загрезва', 'занемим', 'запищен', 'затиской', 'затра', 'изврънат', 'изгъгвам', 'гъгнем', 'изджугам', 'изжлембен', 'изкилиферчил', 'изклесяк', 'изкорубен', 'излундзи', 'изместо', 'изокам', 'изребрим', 'изрепчвам', 'изтресквам', 'изувам', 'ияк', 'иядим', 'казма', 'какаяшка', 'кам', 'камара', 'камберица', 'кандилкя', 'кандисам', 'караконяк', 'качамилкя', 'кикерчим', 'кимвам', 'кинем', 'киселица', 'кияк', 'клапавци', 'клес', 'клесовиня', 'клефунь', 'клецам', 'климбуцам', 'ковнем', 'козиняк', 'колик', 'коликав', 'компир', 'конощип', 'коняк', 'костеница', 'котленкя', 'кощрамба', 'кракна', 'креотим', 'кротушка', 'кръжа', 'кръндей', 'кръпей', 'кукуруз', 'кукуржянка', 'кулен', 'куртолисам', 'куртулисам', 'кута', 'къдея', 'кьорав', 'кюфна', 'кюца', 'лаасе', 'ландзим', 'леа', 'лендзя', 'ливагье', 'лигурище', 'лизгам', 'лис', 'лиска', 'лисковиня', 'ломотим', 'ломпар', 'лубеница', 'лугье', 'лундзим', 'лупнем', 'льохав', 'лъчкам', 'магаза', 'маица', 'макя', 'малешка', 'манара', 'манарче', 'мандрамуняк', 'мандръсам', 'маторец', 'мачка', 'мердень', 'мертек', 'мечка', 'мешина', 'меям', 'мирва', 'митията овца', 'мишка', 'млъзе', 'море', 'мотовилкя', 'мочам', 'мръзлица', 'муж', 'муанем', 'музувирлък', 'мундза', 'навияк', 'нагньитам', 'нагръчвам', 'наиа', 'накокръжвам', 'накостръжвам', 'налундзим', 'наплатисам', 'натамия', 'натрътил', 'наюя', 'непрекръшнячван', 'неуметен', 'нефелен', 'ниел', 'нога', 'нужник', 'обги', 'образ', 'огалатим', 'огравазди', 'ограваздим', 'огръйе', 'одекам', 'оджак', 'озяве', 'озявница', 'окам', 'окапляк', 'окикерчил', 'олам', 'олисветим', 'олисел', 'опалия', 'опиня', 'опростил', 'опупен', 'ореше', 'орей', 'отваа', 'отдънък', 'оти', 'отма', 'отоди', 'отчръпна', 'офянквам', 'ояндзим', 'паъздерки', 'паздерки', 'палаш', 'паприкаш', 'пелешки', 'пенджер', 'перашка', 'печеняк', 'пишлегар', 'пищеж', 'плавя', 'плюска', 'побуял', 'поврачам', 'поврътиням', 'подфръкат', 'пойдех', 'полверняк', 'поокръвям', 'послушах', 'пранги', 'пребатам', 'прекинем', 'прекросним', 'прекръшнячим', 'прерипам', 'пресламбачим', 'претрошвам', 'призне', 'приклопим', 'приоданец', 'пристануша', 'проглобен', 'просуане', 'пръвица', 'пръделник', 'пръжено', 'пръйевина', 'пръцела', 'пуанем', 'пукяшем', 'пупа', 'пупнем', 'пъквам', 'пьоска', 'пюскам', 'раат', 'разжлембен', 'разклимбучкан', 'разландисвам', 'размитам', 'разпарчетосам', 'рапнем', 'разплул', 'разпоретина', 'разпръчвам', 'разчепанка', 'ребрим', 'репчим', 'ресовачка', 'ритли', 'ручим', 'ръски', 'саньи', 'светлосур', 'свинак', 'свинаковина', 'сгняви', 'сгруяк', 'сгръчен', 'син-котлен', 'сине', 'сисам', 'скали', 'склепаторен', 'скомино', 'скрибуцанье', 'скоросмрътница', 'скутам', 'слуням', 'слутам', 'слутняк', 'слушам', 'смитам', 'спареняк', 'спаружен', 'сплащам', 'спотурам', 'сприя', 'стеня', 'стока', 'столовка', 'стришам', 'стръчвам', 'стръчвам се', 'суглет', 'суек', 'сур', 'суросинкяв', 'сурвам', 'стъвиня се', 'съвиня се', 'съпикясвам', 'сътвер', 'съглам', 'тай', 'тай се', 'тараба', 'таралясник', 'таферен', 'тенчасам', 'теферич', 'трескам', 'троним', 'тръни', 'тулуп', 'турта', 'тутма', 'туч', 'тъпкач', 'удевам', 'укьо', 'улав', 'урбулешката', 'уруглица', 'урунгел', 'уруспия', 'уяндзвам', 'удзерепил', 'улендзим', 'умулузвам', 'урапляк', 'уръф(л)як', 'ускоре', 'учуван', 'фараж', 'фейско', 'физгам', 'фулиш', 'цедило', 'цепленка', 'цифка', 'цинка', 'циу', 'циция', 'црън', 'челенкя', 'чеели', 'чият', 'чмим', 'човещинка', 'чръв', 'чувам', 'чудинка', 'чучуято', 'шака', 'шанец', 'шашав', 'шашавица', 'шашю', 'швикам', 'шиблики', 'шибнем', 'шийок', 'шишим', 'шмундел', 'шпора', 'шугавелняк', 'шукна', 'шунда', 'шупя', 'шуштава', 'шушумига', 'щрока', 'юрвам', 'юснем', 'ягмосва'
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
          }, 25000); // 25 seconds
      }
  },

  setStatus: (status) => set({ status }),
}));
