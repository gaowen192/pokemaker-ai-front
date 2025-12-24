
import React, { CSSProperties } from 'react';
import { CardData, ElementType, Subtype } from '../../types';
import { useImageLoader } from '../../hooks/useImageLoader';
import { EnergyIcon } from '../Icons';
import { getTypeTheme } from '../../utils/cardStyles';
import { HoloOverlay } from '../card-parts/HoloOverlay';
import { TypeTransitionEffect } from '../card-parts/TypeTransitionEffect';

export const PokemonLayout: React.FC<{ data: CardData }> = ({ data }) => {
    const { currentSrc: mainImageSrc } = useImageLoader(data.image);
    const { currentSrc: setSymbolSrc } = useImageLoader(data.setSymbolImage);

    const subtypeStr = (data.subtype || '').toString();
    const isStage1 = subtypeStr.includes('Stage 1');
    const isStage2 = subtypeStr.includes('Stage 2');
    const isBasic = subtypeStr.includes('Basic') || (!isStage1 && !isStage2);
    
    const isVMAX = subtypeStr === Subtype.VMAX;
    const isRadiant = subtypeStr === Subtype.Radiant;

    const theme = getTypeTheme(data.type);

    const imageStyle: CSSProperties = {
        transform: `scale(${data.zoom}) translate(${data.xOffset}px, ${data.yOffset}px)`,
        transformOrigin: 'center center'
    };

    const hasEvolution = isStage1 || isStage2 || data.evolvesFrom;
    const contentPaddingBottom = isVMAX ? 'pb-12' : 'pb-5';

    // Calculate background gradient logic locally since it's specific to Pokemon layout nuances
    const getBgGradient = (): string => {
        switch (data.type) {
          case ElementType.Fire: return 'bg-gradient-to-br from-[#ea580c] via-[#c2410c] to-[#7c2d12]';
          case ElementType.Grass: return 'bg-gradient-to-br from-green-600 to-green-800';
          case ElementType.Water: return 'bg-gradient-to-br from-blue-500 to-blue-800';
          case ElementType.Lightning: return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
          case ElementType.Psychic: return 'bg-gradient-to-br from-purple-500 to-purple-800';
          case ElementType.Fighting: return 'bg-gradient-to-br from-orange-600 to-orange-800';
          case ElementType.Darkness: return 'bg-gradient-to-br from-gray-800 to-black';
          case ElementType.Metal: return 'bg-gradient-to-br from-gray-400 to-gray-600';
          case ElementType.Fairy: return 'bg-gradient-to-br from-pink-400 to-pink-700';
          case ElementType.Dragon: return 'bg-gradient-to-br from-yellow-600 to-green-800';
          case ElementType.Ice: return 'bg-gradient-to-br from-cyan-400 to-cyan-700';
          case ElementType.Poison: return 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-800';
          case ElementType.Ground: return 'bg-gradient-to-br from-yellow-700 to-yellow-900';
          case ElementType.Flying: return 'bg-gradient-to-br from-blue-300 to-blue-500';
          case ElementType.Bug: return 'bg-gradient-to-br from-lime-500 to-lime-700';
          case ElementType.Rock: return 'bg-gradient-to-br from-stone-500 to-stone-700';
          case ElementType.Ghost: return 'bg-gradient-to-br from-indigo-500 to-indigo-800';
          default: return 'bg-gradient-to-br from-gray-300 to-gray-400';
        }
    };

    const bgGradient = getBgGradient();

    return (
        <>
            {/* Card Border/Frame */}
            <div className={`absolute inset-0 p-[12px] z-0 bg-gradient-to-br from-gray-100 via-gray-300 to-gray-400`}>
                <div className="absolute inset-0 opacity-20" style={{ filter: 'contrast(120%) brightness(100%)', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            </div>
            
            {/* Main Content Area */}
            <div className={`relative w-full h-full ${bgGradient} rounded-[14px] overflow-hidden flex flex-col`}>
                
                {/* Background Art Layer (Full Art) */}
                <div className="absolute inset-0 z-0 bg-black/10">
                    <img 
                        src={mainImageSrc} 
                        crossOrigin="anonymous"
                        loading="lazy"
                        className="w-full h-full object-cover opacity-100 card-art-image"
                        style={imageStyle}
                        alt="Card Main Artwork"
                    />
                </div>

                <HoloOverlay pattern={data.holoPattern} />
                
                {/* Effect Overlay for Element Type Changes */}
                <TypeTransitionEffect type={data.type} isPokemon={true} />

                {/* EVOLUTION & SUBTYPE BADGES */}
                {(isStage1 || isStage2) && (
                    <div className="absolute top-[14%] left-4 z-20">
                        <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 text-black font-black uppercase text-[10px] px-3 py-1 rounded-sm shadow-md border-t border-yellow-200 tracking-wider shadow-black/30">
                            {isStage1 ? 'STAGE 1' : 'STAGE 2'}
                        </div>
                    </div>
                )}
                
                {isVMAX && (
                    <div className="absolute top-[12%] left-2 z-20">
                        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white font-black italic text-sm px-2 py-1 rounded shadow-lg border border-white/50">
                            VMAX
                        </div>
                    </div>
                )}

                {isRadiant && (
                    <div className="absolute top-[14%] left-4 z-20">
                        <div className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 text-black font-bold uppercase text-[9px] px-3 py-0.5 rounded shadow-md border border-white tracking-widest">
                            Radiant
                        </div>
                    </div>
                )}

                <div className="relative z-10 px-5 pt-3 pb-8 from-black/60 to-transparent">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-100 uppercase tracking-wide opacity-90 drop-shadow-md">
                                {hasEvolution && data.evolvesFrom ? `Evolves from ${data.evolvesFrom}` : (isBasic ? '' : '')}
                            </span>
                            <h1 className="text-3xl font-bold text-white drop-shadow-lg mt-0.5 font-heading tracking-tight leading-none">
                                {data.name}
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-1.5 self-center mt-2">
                            <span className="text-[11px] font-bold text-gray-200 drop-shadow-md pt-1">HP</span>
                            <span className="text-[28px] font-bold text-white drop-shadow-lg leading-none mr-0.5">{data.hp}</span>
                            <div className="relative z-20 flex items-center justify-center">
                                <EnergyIcon type={data.type} size={28} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-grow"></div>

                <div className="relative z-10 mx-2 mb-1">
                        <div className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 py-1 px-4 rounded-sm shadow-md flex justify-between items-center transform -skew-x-12 mx-4 border-y-2 border-yellow-400/50">
                            <span className="transform skew-x-12 text-[9px] font-bold text-gray-700">{data.dexSpecies}</span>
                            <span className="transform skew-x-12 text-[9px] font-bold text-gray-700">HT: {data.dexHeight}</span>
                            <span className="transform skew-x-12 text-[9px] font-bold text-gray-700">WT: {data.dexWeight}</span>
                        </div>
                    </div>

                <div className={`relative z-10 mx-3 mb-3 rounded-lg shadow-lg border border-white/20 backdrop-blur-sm p-3 ${contentPaddingBottom} ${theme.boxGradient}`}>
                    
                    <div className="space-y-4 w-full">
                        {data.attacks?.map((attack) => (
                            <div key={attack.id} className="relative">
                                <div className="flex items-center justify-between min-h-[26px]">
                                    <div className="flex items-center gap-0.5 w-[74px] flex-shrink-0 justify-start -ml-1">
                                        {attack.cost?.map((c, i) => (
                                            <EnergyIcon key={i} type={c} size={21} />
                                        ))}
                                    </div>
                                    
                                    <span className={`text-[19px] font-bold flex-grow drop-shadow-sm font-heading leading-none pt-0.5 ${theme.textColor}`}>
                                        {attack.name}
                                    </span>
                                    
                                    <span className={`text-[19px] font-bold flex-shrink-0 pl-2 leading-none pt-0.5 ${theme.textColor}`}>
                                        {attack.damage}
                                    </span>
                                </div>

                                {attack.description && (
                                    <p className={`text-[11px] font-medium leading-tight mt-0.5 pl-[74px] opacity-95 ${theme.subTextColor}`}>
                                        {attack.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {isVMAX && (
                        <div className="absolute bottom-1 right-1 left-1 bg-black border border-gray-600 rounded-sm p-1 flex gap-2 items-center opacity-95 shadow-sm mt-2 z-20">
                            <div className="text-white text-[9px] font-black px-1 uppercase italic">VMAX RULE</div>
                            <p className="text-[8px] font-medium text-white leading-tight">
                                When your Pokémon VMAX is Knocked Out, your opponent takes 3 Prize cards.
                            </p>
                        </div>
                    )}
                </div>

                <div className={`relative z-10 px-6 pb-3 text-xs font-bold pt-4 -mt-6 ${theme.footerGradient}`}>
                    
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2 min-w-[60px]">
                            <span className={`text-[10px] ${theme.subTextColor}`}>Weakness</span>
                            {data.weakness && (
                                <div className="flex items-center justify-center gap-1">
                                    <EnergyIcon type={data.weakness} size={14} />
                                    <span className={`text-[10px] font-bold leading-none pt-[1px] ${theme.textColor}`}>x2</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] ${theme.subTextColor}`}>Resistance</span>
                            {data.resistance && (
                                <div className="flex items-center justify-center gap-1">
                                    <EnergyIcon type={data.resistance} size={14} />
                                    <span className={`text-[10px] font-bold leading-none pt-[1px] ${theme.textColor}`}>-30</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 min-w-[60px] justify-end">
                            <span className={`text-[10px] ${theme.subTextColor}`}>Retreat</span>
                            <div className="flex gap-0.5">
                                {Array.from({length: data.retreatCost}).map((_, i) => (
                                    <EnergyIcon key={i} type={ElementType.Colorless} size={14} />
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {data.pokedexEntry && !isVMAX && (
                        <div className={`mb-2 px-2 py-1 bg-white/20 border border-black/5 rounded-sm italic text-[9px] leading-tight shadow-sm ${theme.textColor}`}>
                            {data.pokedexEntry}
                        </div>
                    )}

                    <div className="flex justify-between items-end px-1 opacity-90 mt-2">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black px-1.5 py-0.5 text-[8px] font-bold border border-black/20 rounded-sm shadow-sm">
                                Illus. {data.illustrator}
                            </div>
                            <span className="text-[8px] text-white/70">©2024 Pokémon / Nintendo / Creatures / GAME FREAK</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {data.setSymbolImage ? (
                                <img 
                                    src={setSymbolSrc} 
                                    className="w-4 h-4 object-contain filter drop-shadow-sm card-art-image" 
                                    alt="Set" 
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div className="w-4 h-4 bg-white flex items-center justify-center text-[9px] border border-black/30 rounded-sm font-bold text-black">
                                    {data.regulationMark}
                                </div>
                            )}
                            <span className={`font-bold font-mono ${theme.textColor}`}>{data.setNumber}</span>
                            <span className="text-white text-sm drop-shadow-md">★</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
