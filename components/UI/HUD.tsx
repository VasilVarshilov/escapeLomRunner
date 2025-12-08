/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Heart, Zap, Trophy, MapPin, Fish, Rocket, ArrowUpCircle, Shield, Activity, PlusCircle, Play, Beer } from 'lucide-react';
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
        name: 'ОЩЕ ЖИВОТ',
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
        description: 'Вечеряш в бистро "Рибката" и ставаш безсмъртен за 5 секунди с Space/Tap.',
        cost: 3000,
        icon: Shield,
        oneTime: true
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
             <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                 <h2 className="text-3xl md:text-5xl font-black text-yellow-400 mb-2 font-cyber tracking-widest text-center uppercase">Вече не си отЛомка</h2>
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
                    className="flex items-center px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,0,0.4)]"
                 >
                     ПРОДЪЛЖИ НАПРЕД <Play className="ml-2 w-5 h-5" fill="white" />
                 </button>
             </div>
        </div>
    );
};

export const HUD: React.FC = () => {
  const { score, lives, maxLives, collectedLetters, status, level, restartGame, startGame, gemsCollected, distance, isImmortalityActive, speed, targetWord } = useStore();
  
  const containerClass = "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-50";

  if (status === GameStatus.SHOP) {
      return <ShopScreen />;
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,100,255,0.4)] border border-white/10 animate-in zoom-in-95 duration-500">
                <div className="relative w-full bg-slate-900 h-96 flex flex-col items-center justify-center overflow-hidden">
                     {/* Dynamic Title Background */}
                     <div className="absolute inset-0 bg-gradient-to-b from-[#002244] via-blue-900/50 to-slate-900"></div>
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
                     
                     {/* Title Text */}
                     <div className="relative z-20 flex flex-col items-center mb-10 transform -rotate-3 scale-110">
                        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 font-cyber drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
                            ИЗБЯГАЙ
                        </h1>
                        <h2 className="text-4xl md:text-6xl font-black text-white font-cyber tracking-widest drop-shadow-[0_0_15px_rgba(0,100,255,0.8)] mt-[-10px]">
                            ОТ ЛОМ
                        </h2>
                     </div>

                     <div className="absolute inset-0 flex flex-col justify-end items-center p-6 pb-8 text-center z-10">
                        <button 
                          onClick={() => { audio.init(); startGame(); }}
                          className="w-full group relative px-6 py-4 bg-blue-600/80 backdrop-blur-md border border-blue-400/50 text-white font-black text-2xl rounded-xl hover:bg-blue-500 transition-all shadow-lg overflow-hidden"
                        >
                            <span className="relative z-10 tracking-widest flex items-center justify-center uppercase">
                                БЕГА БЕ <Play className="ml-2 w-6 h-6 fill-white" />
                            </span>
                        </button>

                        <p className="text-blue-200/80 text-[10px] md:text-xs font-mono mt-3 tracking-wider">
                            [ СТРЕЛКИ / SWIPE ЗА ДА МЪРДАШ ]
                        </p>
                     </div>
                </div>
              </div>
          </div>
      );
  }

  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-red-900/90 z-[100] text-white pointer-events-auto backdrop-blur-sm overflow-y-auto">
              <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] font-cyber text-center uppercase">Ти си Жмульо</h1>
                
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
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/90 to-blue-900/95 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <Rocket className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
                <h1 className="text-3xl md:text-6xl font-black text-white mb-2 drop-shadow-lg font-cyber text-center leading-tight uppercase">
                    Поздравления, ти избега от Лом
                </h1>
                <p className="text-blue-200 text-sm md:text-2xl font-mono mb-8 tracking-widest text-center uppercase">
                    Евала!
                </p>
                
                <div className="grid grid-cols-1 gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-blue-900/60 p-6 rounded-xl border border-blue-400/30">
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

  return (
    <div className={containerClass}>
        {/* Top Bar */}
        <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
                <div className="text-3xl md:text-5xl font-bold text-white drop-shadow-md font-cyber">
                    {score.toLocaleString()}
                </div>
            </div>
            
            <div className="flex space-x-1 md:space-x-2">
                {[...Array(maxLives)].map((_, i) => (
                    <Heart 
                        key={i} 
                        className={`w-6 h-6 md:w-8 md:h-8 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-800 fill-gray-800'} drop-shadow-sm`} 
                    />
                ))}
            </div>
        </div>
        
        {/* Level Indicator */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-sm md:text-lg text-white font-bold tracking-wider font-mono bg-blue-900/50 px-3 py-1 rounded-full border border-blue-400/30 backdrop-blur-sm z-50">
            НИВО {level}
        </div>

        {/* Active Skill Indicator */}
        {isImmortalityActive && (
             <div className="absolute top-28 left-1/2 transform -translate-x-1/2 text-yellow-300 font-bold text-xl md:text-2xl animate-pulse flex items-center drop-shadow-md">
                 <Shield className="mr-2 fill-yellow-300" /> БЕЗСМЪРТЕН
             </div>
        )}

        {/* Word Collection Status */}
        <div className="absolute top-16 md:top-24 left-1/2 transform -translate-x-1/2 flex space-x-1 md:space-x-2">
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
                        className={`w-8 h-10 md:w-10 md:h-12 flex items-center justify-center border-2 font-black text-lg md:text-xl font-cyber rounded-md transform transition-all duration-300`}
                    >
                        {char}
                    </div>
                );
            })}
        </div>

        {/* Bottom Overlay */}
        <div className="w-full flex justify-end items-end">
             <div className="flex items-center space-x-2 text-white opacity-90 bg-black/30 px-2 py-1 rounded">
                 <Beer className="w-4 h-4 md:w-6 md:h-6 animate-pulse text-yellow-400" />
                 <span className="font-mono text-base md:text-xl">БИРИЧКИ В ЧАС {Math.round((speed / RUN_SPEED_BASE) * 100)}</span>
             </div>
        </div>
    </div>
  );
};