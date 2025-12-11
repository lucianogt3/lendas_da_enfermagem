import React, { useState, useEffect } from 'react';
import { Sticker, UserProfile, Rarity, StorePack } from '../types';
import StickerCard from '../components/StickerCard';
import { db } from '../services/database';

interface StorePageProps {
  user: UserProfile;
  stickers: Sticker[];
  onBuyPack: (newStickers: Sticker[], cost: number) => void;
}

const StorePage: React.FC<StorePageProps> = ({ user, stickers, onBuyPack }) => {
  const [packs, setPacks] = useState<StorePack[]>([]);
  const [openingState, setOpeningState] = useState<'idle' | 'shaking' | 'revealing' | 'done'>('idle');
  const [revealedStickers, setRevealedStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPacks = async () => {
        const loaded = await db.getPacks();
        setPacks(loaded);
        setLoading(false);
    };
    loadPacks();
  }, []);

  const handleBuy = (pack: StorePack) => {
    if (user.coins < pack.price) {
      alert("Moedas insuficientes! Vá ao Treinamento para ganhar mais.");
      return;
    }

    setOpeningState('shaking');
    setRevealedStickers([]);

    // 1. Shake animation for 2 seconds
    setTimeout(() => {
      // Logic to pick random stickers based on Pack Probabilities
      const newStickers: Sticker[] = [];

      for (let i = 0; i < pack.stickersCount; i++) {
        const rand = Math.random() * 100; // 0 to 100
        let chosenRarity = Rarity.COMMON;

        if (rand <= pack.legendaryChance) chosenRarity = Rarity.LEGENDARY;
        else if (rand <= (pack.legendaryChance + pack.epicChance)) chosenRarity = Rarity.EPIC;
        else if (rand <= (pack.legendaryChance + pack.epicChance + pack.rareChance)) chosenRarity = Rarity.RARE;

        let pool = stickers.filter(s => s.rarity === chosenRarity);
        if (pool.length === 0) pool = stickers; // Fallback if no sticker of rarity exists
        
        const randomSticker = pool[Math.floor(Math.random() * pool.length)];
        newStickers.push(randomSticker);
      }

      setRevealedStickers(newStickers);
      onBuyPack(newStickers, pack.price);
      setOpeningState('revealing');

      // 2. Reveal state triggers the modal
      setTimeout(() => {
          setOpeningState('done');
      }, 500); 

    }, 2000);
  };

  const closeOpening = () => {
    setOpeningState('idle');
    setRevealedStickers([]);
  };

  if (loading) return <div className="p-10 text-center">Carregando Loja...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Loja de Pacotes</h1>
        <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-6 py-2 rounded-full font-bold shadow-sm border border-yellow-200">
          <span className="mr-2 text-xl">💰</span> {user.coins} Moedas
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packs.map(pack => (
            <div key={pack.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col items-center p-8 transform hover:-translate-y-2 transition-all duration-300">
            <div 
                className={`w-40 h-52 ${pack.color || 'bg-blue-500'} rounded-xl shadow-2xl mb-8 flex items-center justify-center relative cursor-pointer
                ${openingState === 'shaking' ? 'animate-[bounce_0.1s_infinite]' : ''}
                `} 
                onClick={() => handleBuy(pack)}
            >
                <div className="absolute inset-2 border-2 border-dashed border-white/30 rounded-lg"></div>
                <div className="text-white text-center">
                    <span className="text-4xl block mb-2">📦</span>
                    <span className="font-bold text-xl uppercase tracking-widest">{pack.name}</span>
                </div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-800">{pack.name}</h3>
            <p className="text-slate-500 text-center text-sm mb-4 px-4">{pack.description}</p>
            
            <div className="flex gap-2 text-[10px] font-bold uppercase text-slate-400 mb-6">
                <span>{pack.stickersCount} Figs</span> • 
                <span className="text-yellow-600">{pack.legendaryChance}% Lenda</span>
            </div>

            <button
                onClick={() => handleBuy(pack)}
                disabled={user.coins < pack.price || openingState !== 'idle'}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95
                ${user.coins >= pack.price 
                    ? 'bg-yellow-500 hover:bg-yellow-400' 
                    : 'bg-slate-300 cursor-not-allowed'}`}
            >
                {openingState === 'shaking' ? 'Abrindo...' : `Comprar (${pack.price} 💰)`}
            </button>
            </div>
        ))}
      </div>

      {/* Opening Modal */}
      {(openingState === 'revealing' || openingState === 'done') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="max-w-4xl w-full p-4 flex flex-col items-center">
              <h2 className="text-white text-4xl font-bold text-center mb-12 animate-fade-in">Pacote Aberto!</h2>
              
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                {revealedStickers.map((sticker, idx) => (
                  <div 
                    key={idx} 
                    className="animate-[bounce_0.8s_ease-out_both]" 
                    style={{ animationDelay: `${idx * 0.4}s` }} 
                  >
                    <div className="transform scale-125">
                       <StickerCard sticker={sticker} isLocked={false} size="md" />
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={closeOpening}
                className="bg-white text-medical-600 font-bold py-4 px-16 rounded-full hover:bg-medical-50 shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all transform hover:scale-105"
              >
                Coletar Tudo
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePage;
