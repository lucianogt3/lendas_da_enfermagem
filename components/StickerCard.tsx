import React from 'react';
import { Sticker, Rarity } from '../types';

interface StickerCardProps {
  sticker: Sticker;
  isLocked: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: number;
}

const RarityColors: Record<Rarity, string> = {
  [Rarity.COMMON]: 'border-slate-300 bg-slate-50',
  [Rarity.RARE]: 'border-blue-400 bg-blue-50',
  [Rarity.EPIC]: 'border-purple-500 bg-purple-50',
  [Rarity.LEGENDARY]: 'border-yellow-500 bg-yellow-50',
};

const StickerCard: React.FC<StickerCardProps> = ({ 
  sticker, 
  isLocked, 
  onClick, 
  size = 'md',
  showCount = 0
}) => {
  
  const sizeClasses = {
    sm: 'w-24 h-32 text-xs',
    md: 'w-32 h-44 text-sm',
    lg: 'w-64 h-80 text-base',
  };

  if (isLocked) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center p-2 transition-all opacity-60 hover:opacity-80`}
      >
        <div className="w-full h-2/3 bg-slate-200/50 rounded-lg flex items-center justify-center mb-2">
          <span className="text-2xl text-slate-400 font-bold">?</span>
        </div>
        <div className="w-12 h-2 bg-slate-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`
        relative group cursor-pointer 
        ${sizeClasses[size]} 
        rounded-xl border-[6px] 
        ${RarityColors[sticker.rarity]}
        flex flex-col items-center p-1.5 shadow-md
        transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:-rotate-1
        bg-white overflow-hidden
      `}
    >
      {/* Animated Shine Effect for Legendary/Animated */}
      {(sticker.rarity === Rarity.LEGENDARY || sticker.isAnimated) && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 animate-spin-slow"></div>
      )}

      {showCount > 1 && (
        <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center z-30 shadow-sm border-2 border-white">
          {showCount}
        </div>
      )}
      
      <div className="relative w-full h-2/3 mb-2 overflow-hidden rounded-lg bg-slate-100 border border-black/5">
        <img 
          src={sticker.imageUrl} 
          alt={sticker.name} 
          className={`w-full h-full object-cover transition-transform duration-700 ${sticker.isAnimated ? 'group-hover:scale-110' : ''}`}
        />
        
        {/* Animated Badge */}
        {sticker.isAnimated && (
            <div className="absolute bottom-1 right-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm animate-pulse z-20">
                LIVE
            </div>
        )}

        {/* Holo Overlay */}
        {sticker.rarity === Rarity.LEGENDARY && !sticker.isAnimated && (
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-blue-500/10 mix-blend-overlay pointer-events-none" />
        )}
      </div>

      <div className="w-full text-center flex-1 flex flex-col justify-between items-center z-10 relative">
        <h3 className="font-bold text-slate-800 leading-none line-clamp-2 text-[0.9em]">
          {sticker.name}
        </h3>
        <span className={`text-[9px] uppercase tracking-widest font-black mt-1 px-1 rounded-sm
          ${sticker.rarity === Rarity.LEGENDARY ? 'bg-yellow-100 text-yellow-700' : 'text-slate-400'}`}>
          {sticker.rarity}
        </span>
      </div>
    </div>
  );
};

export default StickerCard;
