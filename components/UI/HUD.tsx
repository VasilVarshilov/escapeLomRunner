
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { Heart, Zap, Trophy, MapPin, Fish, Rocket, ArrowUpCircle, Shield, Activity, PlusCircle, Play, Beer, Medal, XCircle, RotateCcw } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, LETTER_COLORS, ShopItem, RUN_SPEED_BASE } from '../../types';
import { audio } from '../System/Audio';

// Available Shop Items
const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'DOUBLE_JUMP',
        name: 'ДВОЕН ОТСКОК',
        description: 'Пиеш една "Биричка" и получаваш двоен скок срещу всякакви Жмульовци.',
        cost: 1000,
        icon: ArrowUpCircle,
        oneTime: true
    },
    {
        id: 'MAX_LIFE',
        name: 'НОВ ЖИВОТ',
        description: 'Почивка в къща за гости "Ненийски". Увеличаваш живота си трайно.',
        cost: 1500,
        icon: Activity
    },
    {
        id: 'HEAL',
        name: 'РАКИЯ (ЛЕК)',
        description: 'Възстановява 1 живот веднага. Лек за душата.',
        cost: 1000,
        icon: PlusCircle
    },
    {
        id: 'IMMORTAL',
        name: 'БЕЗСМЪРТИЕ',
        description: 'Вечеряш в бистро "Рибката". Ставаш безсмъртен (Space/Tap). Веднъж на ниво!',
        cost: 3000,
        icon: Shield,
        oneTime: true // One time purchase, but skill is permanent
    }
];

const ShopScreen: React.FC = () => {
    const { score, buyItem, closeShop, hasDoubleJump, hasImmortality } = useStore();
    const [items, setItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        let pool = SHOP_ITEMS.filter(item => {
            if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
            if (item.id === 'IMMORTAL' && hasImmortality) return false;
            return true;
        });

        pool = pool.sort(() => 0.5 - Math.random());
        setItems(pool.slice(0, 3));
    }, []);

    return (
        <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
             <div className="flex flex-col items-center justify-center min-h-full pt-10 pb-32 px-4">
                 <div className="text-center mb-6 md:mb-8">
                     <h2 className="text-3xl md:text-5xl font-black text-yellow-400 mb-2 font-cyber tracking-widest uppercase leading-tight">Вече не си отЛомка</h2>
                     <p className="text-blue-200 text-xs md:text-lg font-mono tracking-wider uppercase opacity-80">Избяга от Лом, но Лом не може да избяга от теб!</p>
                 </div>

                 <div className="flex items-center text-blue-300 mb-6 md:mb-8">
                     <span className="text-base md:text-lg mr-2">ПАРИ (РИБИ):</span>
                     <span className="text-xl md:text-2xl font-bold">{score.toLocaleString()}</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full mb-8">
                     {items.map(item => {
                         const Icon = item.icon;
                         const canAfford = score >= item.cost;
                         return (
                             <div key={item.id} className="bg-slate-800/90 border border-slate-600 p-4 md:p-6 rounded-xl flex flex-col items-center text-center hover:border-blue-400 transition-colors">
                                 <div className="bg-slate-700 p-3 md:p-4 rounded-full mb-3 md:mb-4">
                                     <Icon className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                                 </div>
                                 <h3 className="text-lg md:text-xl font-bold mb-2">{item.name}</h3>
                                 <p className="text-gray-300 text-xs md:text-sm mb-4 h-10 md:h-12 flex items-center justify-center">{item.description}</p>
                                 <button 
                                    onClick={() => buyItem(item.id as any, item.cost)}
                                    disabled={!canAfford}
                                    className={`px-4 md:px-6 py-2 rounded font-bold w-full text-sm md:text-base ${canAfford ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110' : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                                 >
                                     {item.cost} РИБИ
                                 </button>
                             </div>
                         );
                     })}
                 </div>

                 <button 
                    onClick={closeShop}
                    className="flex items-center px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,0,0.4)] mb-8"
                 >
                     ПРОДЪЛЖИ НАПРЕД <Play className="ml-2 w-5 h-5" fill="white" />
                 </button>
             </div>
        </div>
    );
};

export const HUD: React.FC = () => {
  const { score, lives, maxLives, collectedLetters, status, level, restartGame, startGame, continueGame, lastPlayedLevel, gemsCollected, distance, isImmortalityActive, speed, targetWord, bossHp, maxBossHp, bossType, highScores, newRecordSet } = useStore();
  const [showRecords, setShowRecords] = useState(false);
  
  // Adjusted padding since bottom element is gone
  const containerClass = "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-50";

  if (status === GameStatus.SHOP) {
      return <ShopScreen />;
  }

  // MAIN MENU
  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,100,255,0.4)] border border-white/10 animate-in zoom-in-95 duration-500">
                {/* Changed h-[550px] to min-h-[550px] and layout to flex-col justify-between to prevent overlap */}
                <div className="relative w-full bg-slate-900 min-h-[600px] flex flex-col items-center justify-between overflow-hidden py-8">
                     {/* Dynamic Title Background */}
                     <div className="absolute inset-0 bg-gradient-to-b from-[#002244] via-blue-900/50 to-slate-900"></div>
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
                     
                     {/* Title Text - Added flex-grow to push content apart */}
                     <div className="relative z-20 flex flex-col items-center justify-center flex-grow transform -rotate-3 scale-110">
                        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 font-cyber drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
                            ИЗБЯГАЙ
                        </h1>
                        <h2 className="text-4xl md:text-6xl font-black text-white font-cyber tracking-widest drop-shadow-[0_0_15px_rgba(0,100,255,0.8)] mt-[-10px]">
                            ОТ ЛОМ
                        </h2>
                     </div>

                     {/* Menu Buttons - Removed absolute positioning, now part of flex flow */}
                     <div className="relative z-20 w-full flex flex-col items-center px-6 gap-3 mt-4">
                        <button 
                          onClick={() => { audio.init(); startGame(); }}
                          className="w-full group relative px-6 py-4 bg-blue-600/80 backdrop-blur-md border border-blue-400/50 text-white font-black text-2xl rounded-xl hover:bg-blue-500 transition-all shadow-lg overflow-hidden"
                        >
                            <span className="relative z-10 tracking-widest flex items-center justify-center uppercase">
                                БЕГА БЕ <Play className="ml-2 w-6 h-6 fill-white" />
                            </span>
                        </button>

                        {/* CONTINUE BUTTON (Only if saved level > 1) */}
                        {lastPlayedLevel > 1 && (
                            <button 
                              onClick={() => { audio.init(); continueGame(); }}
                              className="w-full relative px-6 py-3 bg-emerald-600/80 backdrop-blur-md border border-emerald-400/50 text-white font-black text-xl rounded-xl hover:bg-emerald-500 transition-all shadow-lg uppercase flex items-center justify-center"
                            >
                                <span className="mr-2">Бега пак де</span>
                                <span className="text-sm bg-black/30 px-2 py-0.5 rounded ml-2">НИВО {lastPlayedLevel}</span>
                                <RotateCcw className="ml-2 w-5 h-5" />
                            </button>
                        )}

                        <button 
                          onClick={() => setShowRecords(true)}
                          className="w-full relative px-6 py-3 bg-yellow-600/80 backdrop-blur-md border border-yellow-400/50 text-white font-black text-xl rounded-xl hover:bg-yellow-500 transition-all shadow-lg uppercase flex items-center justify-center"
                        >
                            Лични Рекорди <Medal className="ml-2 w-5 h-5" />
                        </button>

                        <p className="text-blue-200/80 text-[10px] md:text-xs font-mono mt-1 tracking-wider">
                            [ СТРЕЛКИ / SWIPE ЗА ДА МЪРДАШ ]
                        </p>
                     </div>
                </div>
              </div>

              {/* RECORDS MODAL */}
              {showRecords && (
                  <div className="absolute inset-0 flex items-center justify-center z-[110] bg-black/80 backdrop-blur-md p-4">
                      <div className="bg-slate-900 border border-yellow-500/50 rounded-2xl p-6 w-full max-w-sm relative shadow-[0_0_40px_rgba(255,200,0,0.2)]">
                          <button onClick={() => setShowRecords(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                              <XCircle className="w-8 h-8" />
                          </button>
                          
                          <h3 className="text-2xl font-black text-yellow-400 mb-6 text-center uppercase tracking-wider font-cyber">Твоите Постижения</h3>
                          
                          <div className="space-y-4">
                              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                  <span className="text-gray-400 font-mono">РЕЗУЛТАТ</span>
                                  <span className="text-2xl font-bold text-white">{highScores.maxScore.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                  <span className="text-gray-400 font-mono">РАЗСТОЯНИЕ</span>
                                  <span className="text-2xl font-bold text-blue-300">{highScores.maxDistance} м</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                  <span className="text-gray-400 font-mono">НИВО</span>
                                  <span className="text-2xl font-bold text-green-300">{highScores.maxLevel}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                  <span className="text-gray-400 font-mono">РИБИ</span>
                                  <span className="text-2xl font-bold text-yellow-300">{highScores.maxGems}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // GAME OVER
  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-red-900/90 z-[100] text-white pointer-events-auto backdrop-blur-sm overflow-y-auto">
              <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] font-cyber text-center uppercase">Ти си Жмульо</h1>
                
                {/* NEW RECORD MESSAGE */}
                {newRecordSet && (
                    <div className="mb-6 px-4 py-2 bg-yellow-500/20 border border-yellow-400 rounded-lg animate-bounce">
                        <p className="text-yellow-300 text-lg md:text-2xl font-black font-cyber text-center uppercase drop-shadow-md">
                            Браво бе, Пустиняк! Нов рекорд!
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 md:gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-slate-800/80 p-3 md:p-4 rounded-lg border border-slate-600 flex items-center justify-between">
                        <div className="flex items-center text-yellow-400 text-sm md:text-base"><Trophy className="mr-2 w-4 h-4 md:w-5 md:h-5"/> НИВО</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{level}</div>
                    </div>
                    <div className="bg-slate-800/80 p-3 md:p-4 rounded-lg border border-slate-600 flex items-center justify-between">
                        <div className="flex items-center text-blue-400 text-sm md:text-base"><Fish className="mr-2 w-4 h-4 md:w-5 md:h-5"/> СЪБРАНИ РИБИ</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{gemsCollected}</div>
                    </div>
                    <div className="bg-slate-800/80 p-3 md:p-4 rounded-lg border border-slate-600 flex items-center justify-between">
                        <div className="flex items-center text-purple-400 text-sm md:text-base"><MapPin className="mr-2 w-4 h-4 md:w-5 md:h-5"/> РАЗСТОЯНИЕ</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{Math.floor(distance)} м</div>
                    </div>
                     <div className="bg-slate-800/50 p-3 md:p-4 rounded-lg flex items-center justify-between mt-2">
                        <div className="flex items-center text-white text-sm md:text-base">РЕЗУЛТАТ</div>
                        <div className="text-2xl md:text-3xl font-bold font-cyber text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{score.toLocaleString()}</div>
                    </div>
                </div>

                <button 
                  onClick={() => { audio.init(); restartGame(); }}
                  className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-lg uppercase"
                >
                    Бега пак
                </button>
              </div>
          </div>
      );
  }

  if (status === GameStatus.VICTORY) {
    return (
        <div className="absolute inset-0 bg-transparent z-[100] text-white pointer-events-auto overflow-y-auto">
            <div className="flex flex-col items-center justify-end min-h-full py-8 px-4 pb-20">
                
                {/* Minimal Overlay for Score/Restart so 3D scene is visible */}
                <div className="grid grid-cols-1 gap-2 text-center mb-4 w-full max-w-sm">
                    <div className="bg-black/60 p-4 rounded-xl border border-blue-400/30 backdrop-blur-sm">
                        <div className="text-xs md:text-sm text-gray-300 mb-1 tracking-wider">КРАЕН РЕЗУЛТАТ</div>
                        <div className="text-3xl md:text-4xl font-bold font-cyber text-yellow-400">{score.toLocaleString()}</div>
                    </div>
                </div>

                <button 
                  onClick={() => { audio.init(); restartGame(); }}
                  className="px-8 md:px-12 py-4 md:py-5 bg-white text-blue-900 font-black text-lg md:text-xl rounded hover:scale-105 transition-all shadow-xl tracking-widest uppercase"
                >
                    Бега пак
                </button>
            </div>
        </div>
    );
  }

  // Adaptive sizing for long words on mobile
  const wordLen = targetWord.length;
  // Default (<= 8)
  let boxClass = "w-8 h-10 md:w-10 md:h-12 text-lg md:text-xl border-2"; 
  let gapClass = "gap-1 md:gap-2";

  if (wordLen > 12) {
      // 13+ chars: Very small to fit ~15 chars in 320px
      boxClass = "w-5 h-7 md:w-10 md:h-12 text-[10px] md:text-xl border-[1px]";
      gapClass = "gap-px md:gap-2"; 
  } else if (wordLen > 8) {
      // 9-12 chars
      boxClass = "w-6 h-8 md:w-10 md:h-12 text-sm md:text-xl border-2";
      gapClass = "gap-1 md:gap-2";
  }

  return (
    <div className={containerClass}>
        {/* Top Bar */}
        <div className="flex justify-between items-start w-full">
            {/* Left: Score */}
            <div className="flex flex-col items-start z-50">
                <div className="flex items-center gap-1 md:gap-2 mb-1">
                    <Fish className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                    <span className="text-yellow-400 font-bold text-sm md:text-lg font-cyber tracking-widest uppercase drop-shadow-sm">РИБКИ</span>
                </div>
                <div className="text-3xl md:text-5xl font-bold text-white drop-shadow-md font-cyber leading-none">
                    {score.toLocaleString()}
                </div>
            </div>
            
            {/* Right: Hearts + Beer Speed */}
            <div className="flex flex-col items-end gap-1 md:gap-2">
                <div className="flex space-x-1 md:space-x-2">
                    {[...Array(maxLives)].map((_, i) => (
                        <Heart 
                            key={i} 
                            className={`w-6 h-6 md:w-8 md:h-8 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-800 fill-gray-800'} drop-shadow-sm`} 
                        />
                    ))}
                </div>
                
                {/* Relocated Beer Counter */}
                <div className="flex items-center space-x-1 text-white opacity-90 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-white/10 shadow-sm">
                     <Beer className="w-3 h-3 md:w-5 md:h-5 animate-pulse text-yellow-400" />
                     <span className="font-mono text-[10px] md:text-base font-bold tracking-wider">
                        БИРИЧКИ В ЧАС {Math.round((speed / RUN_SPEED_BASE) * 100)}
                     </span>
                </div>
            </div>
        </div>
        
        {/* Level Indicator */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-sm md:text-lg text-white font-bold tracking-wider font-mono bg-blue-900/50 px-3 py-1 rounded-full border border-blue-400/30 backdrop-blur-sm z-50">
            НИВО {level}
        </div>

        {/* BOSS HEALTH BAR */}
        {status === GameStatus.BOSS_FIGHT && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-50">
                <div className="flex justify-between text-white font-black font-cyber mb-1 text-shadow-sm uppercase">
                    <span>
                        {bossType === 'KALIN' ? 'КАЛИН (ГРИЗАЧА)' : 
                         bossType === 'STILYAN' ? 'СТИЛЯН (КОБРАТА)' : 
                         'НИКОЛАЙ (БОС)'}
                    </span>
                    <span>{Math.ceil((bossHp / maxBossHp) * 100)}%</span>
                </div>
                <div className="w-full h-4 md:h-6 bg-slate-900/80 border border-red-500/50 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-red-600 to-orange-600 transition-all duration-300"
                        style={{ width: `${(bossHp / maxBossHp) * 100}%` }}
                    />
                </div>
                <div className="text-center text-yellow-300 text-xs mt-1 animate-pulse font-mono">
                    [SPACE/TAP] ЗА ДА ХВЪРЛЯШ БИРИ
                </div>
            </div>
        )}

        {/* Active Skill Indicator - Moved Down to top-48 */}
        {isImmortalityActive && (
             <div className="absolute top-48 left-1/2 transform -translate-x-1/2 text-yellow-300 font-bold text-xl md:text-2xl animate-pulse flex items-center drop-shadow-md z-40 whitespace-nowrap">
                 <Shield className="mr-2 fill-yellow-300" /> БЕЗСМЪРТЕН
             </div>
        )}

        {/* Word Collection Status (Hidden during Boss Fight) */}
        {status !== GameStatus.BOSS_FIGHT && (
            <div className={`absolute top-24 md:top-32 left-1/2 transform -translate-x-1/2 flex flex-nowrap justify-center ${gapClass} max-w-full px-1 z-40`}>
                {targetWord.map((char, idx) => {
                    const isCollected = collectedLetters.includes(idx);
                    // Cycle through colors
                    const color = LETTER_COLORS[idx % LETTER_COLORS.length];

                    return (
                        <div 
                            key={idx}
                            style={{
                                borderColor: isCollected ? color : 'rgba(255, 255, 255, 0.3)',
                                color: isCollected ? 'black' : 'rgba(255, 255, 255, 0.5)',
                                backgroundColor: isCollected ? color : 'rgba(0, 0, 0, 0.5)',
                                boxShadow: isCollected ? `0 0 10px ${color}` : 'none',
                            }}
                            className={`${boxClass} flex items-center justify-center font-black font-cyber rounded-md transform transition-all duration-300`}
                        >
                            {char}
                        </div>
                    );
                })}
            </div>
        )}

        {/* Empty Bottom Div to maintain flex spacing if needed, though 'justify-between' handles it */}
        <div></div>
    </div>
  );
};
