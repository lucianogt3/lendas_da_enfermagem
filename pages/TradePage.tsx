import React, { useMemo, useState } from 'react';
import { Sticker, UserProfile } from '../types';
import StickerCard from '../components/StickerCard';

interface TradePageProps {
  user: UserProfile;
  stickers: Sticker[];
  onSellDuplicate: (id: string, earn: number) => void;
}

const TradePage: React.FC<TradePageProps> = ({ user, stickers, onSellDuplicate }) => {
  const duplicates = useMemo(() => {
    const counts: Record<string, number> = {};
    user.collectedStickers.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });
    
    // Return stickers that have count > 1
    return Object.keys(counts)
      .filter(id => counts[id] > 1)
      .map(id => ({
        sticker: stickers.find(s => s.id === id)!,
        count: counts[id]
      }))
      .filter(item => item.sticker !== undefined);
  }, [user.collectedStickers, stickers]);

  const getPrice = (rarity: string) => {
    switch(rarity) {
      case 'Lendária': return 50;
      case 'Épica': return 25;
      case 'Rara': return 10;
      default: return 5;
    }
  };

  return (
    <div className="p-4 pb-24 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 flex justify-between items-center border border-slate-200">
         <div>
           <h1 className="text-2xl font-bold text-slate-800">Centro de Reciclagem</h1>
           <p className="text-slate-500 text-sm">Troque repetidas por moedas!</p>
         </div>
         <div className="text-2xl">♻️</div>
      </div>

      {duplicates.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl grayscale opacity-50">🃏</span>
          <p className="text-slate-500 mt-4 font-medium">Você não tem figurinhas repetidas no momento.</p>
          <p className="text-slate-400 text-sm">Abra mais pacotes para conseguir trocas!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {duplicates.map(({ sticker, count }) => {
            const sellPrice = getPrice(sticker.rarity);
            return (
              <div key={sticker.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center relative">
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  x{count - 1} Disp.
                </span>
                <div className="transform scale-75 origin-top">
                   <StickerCard sticker={sticker} isLocked={false} size="sm" />
                </div>
                <div className="mt-[-20px] text-center w-full">
                  <p className="font-bold text-sm text-slate-700 truncate w-full">{sticker.name}</p>
                  <button 
                    onClick={() => onSellDuplicate(sticker.id, sellPrice)}
                    className="mt-2 w-full bg-green-100 hover:bg-green-200 text-green-700 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Vender</span>
                    <span>💰 +{sellPrice}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TradePage;
