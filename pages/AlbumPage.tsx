import React, { useState, useMemo, useEffect } from 'react';
import { Sticker, UserProfile, Rarity } from '../types';
import StickerCard from '../components/StickerCard';
import { CURIOSITIES } from '../seedData';
import { db } from '../services/database';

interface AlbumPageProps {
  stickers: Sticker[];
  user: UserProfile;
}

const ITEMS_PER_PAGE = 6;

const AlbumPage: React.FC<AlbumPageProps> = ({ stickers, user }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showRanking, setShowRanking] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);

  // Sort stickers by ID
  const sortedStickers = useMemo(() => {
    return [...stickers].sort((a, b) => parseInt(a.id) - parseInt(b.id));
  }, [stickers]);

  const totalPages = Math.max(1, Math.ceil(sortedStickers.length / ITEMS_PER_PAGE));
  
  useEffect(() => {
     if (currentPage >= totalPages && totalPages > 0) {
         setCurrentPage(totalPages - 1);
     }
  }, [totalPages, currentPage]);

  const currentStickers = sortedStickers.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const ownedCount = new Set(user.collectedStickers).size;
  const percentage = sortedStickers.length === 0 ? 0 : Math.round((ownedCount / sortedStickers.length) * 100);

  const handlePrev = () => setCurrentPage(p => Math.max(0, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1));
  const getCount = (id: string) => user.collectedStickers.filter(s => s === id).length;

  const pageCuriosity = CURIOSITIES[currentPage % CURIOSITIES.length];

  useEffect(() => {
    if (showRanking) {
      db.getAllUsers().then(users => {
        const sorted = users.sort((a, b) => b.xp - a.xp);
        setLeaderboard(sorted);
      });
    }
  }, [showRanking]);

  // Page Stats
  const pageStats = useMemo(() => {
     let legendary = 0;
     let ownedOnPage = 0;
     currentStickers.forEach(s => {
        if (s.rarity === Rarity.LEGENDARY) legendary++;
        if (user.collectedStickers.includes(s.id)) ownedOnPage++;
     });
     return { legendary, ownedOnPage, total: currentStickers.length };
  }, [currentStickers, user.collectedStickers]);

  const isPageComplete = pageStats.total > 0 && pageStats.ownedOnPage === pageStats.total;

  return (
    <div className="p-2 sm:p-4 pb-24 max-w-5xl mx-auto flex flex-col min-h-[85vh]">
      
      {/* --- DASHBOARD HEADER --- */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-5 mb-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-medical-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-medical-100 transition-colors"></div>
         
         <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">COLEÇÃO <span className="text-medical-600">LENDÁRIA</span></h1>
                <p className="text-slate-500 text-sm font-medium">Complete o álbum para se tornar uma referência.</p>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="flex-1 md:w-64">
                    <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-600">PROGRESSO TOTAL</span>
                        <span className="text-medical-600">{percentage}%</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                        <div 
                            className="h-full bg-gradient-to-r from-medical-500 via-blue-400 to-purple-500 transition-all duration-1000 ease-out relative" 
                            style={{ width: `${percentage}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="text-[10px] text-right text-slate-400 font-mono mt-1">{ownedCount} / {sortedStickers.length} CARDS</div>
                </div>

                <button 
                    onClick={() => setShowRanking(true)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 px-4 py-3 rounded-xl font-black shadow-md border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center leading-none min-w-[80px]"
                >
                    <span className="text-lg">👑</span>
                    <span className="text-[10px] mt-1">RANK</span>
                </button>
            </div>
         </div>
      </div>

      {/* --- BINDER BOOK VISUAL --- */}
      <div className="flex-1 relative z-0 mb-8 mx-auto w-full max-w-4xl perspective-1000">
        
        {/* Book Cover/Spine Effect */}
        <div className="absolute inset-0 bg-slate-900 rounded-r-3xl rounded-l-lg transform translate-x-2 translate-y-3 -z-10 shadow-2xl"></div>
        
        {/* Main Page Sheet */}
        <div className="bg-[#f8f9fa] relative rounded-r-2xl rounded-l-md shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] min-h-[650px] border border-slate-300 overflow-hidden md:ml-4 flex">
          
          {/* Subtle Texture */}
          <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')]"></div>
          
          {/* Binder Rings */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-200 border-r border-slate-300 z-20 flex flex-col justify-evenly items-center py-10 shadow-inner">
             {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-14 h-4 bg-gradient-to-b from-gray-300 via-white to-gray-400 rounded shadow-md border border-gray-400 transform -skew-y-6"></div>
             ))}
          </div>

          {/* PAGE CONTENT */}
          <div className="relative z-10 w-full pl-16 pr-4 py-8 sm:pr-8 sm:pl-20 flex flex-col">
            
            {/* Top Stats of Page */}
            <div className="flex justify-between items-center border-b-2 border-slate-200 pb-3 mb-6 border-dashed">
                <div className="flex items-center gap-2">
                    <span className="bg-slate-800 text-white text-xs font-black px-2 py-1 rounded">PÁG {currentPage + 1}</span>
                    <span className="text-slate-400 font-bold text-xs tracking-widest uppercase hidden sm:inline-block">Série {currentPage < 2 ? 'Fundamentos' : 'Especialidades'}</span>
                </div>
                <div className="flex gap-2">
                    {pageStats.legendary > 0 && <span className="text-[10px] font-black text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200 flex items-center gap-1">⚡ LENDÁRIA DETECTADA</span>}
                    {isPageComplete && <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 flex items-center gap-1">✨ COMPLETADA</span>}
                </div>
            </div>

            {/* GRID OF SLOTS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6 sm:gap-y-10 justify-items-center mb-auto">
                {currentStickers.map(sticker => {
                    const isOwned = user.collectedStickers.includes(sticker.id);
                    return (
                        <div key={sticker.id} className="relative group perspective-500">
                            {/* Empty Slot Visual */}
                            {!isOwned && (
                                <div className="absolute inset-0 bg-slate-200/50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center -z-10">
                                    <div className="w-16 h-16 bg-slate-300/50 rounded-full mb-2 mask-image-gradient"></div>
                                    <span className="text-slate-400 font-black text-2xl opacity-20">#{sticker.id}</span>
                                </div>
                            )}
                            
                            {/* The Card Component */}
                            <StickerCard
                                sticker={sticker}
                                isLocked={!isOwned}
                                showCount={getCount(sticker.id)}
                                onClick={() => isOwned && setSelectedSticker(sticker)}
                                size="md"
                            />
                            
                            {/* Slot Number Label */}
                            <div className="absolute -bottom-5 left-0 right-0 text-center">
                                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${isOwned ? 'bg-medical-100 text-medical-700' : 'bg-slate-200 text-slate-500'}`}>
                                    Nº {sticker.id}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Filler Slots */}
                {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - currentStickers.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-32 h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/20 flex items-center justify-center opacity-30 pointer-events-none">
                        <span className="text-slate-300 text-2xl">✕</span>
                    </div>
                ))}
            </div>

            {/* Curiosity Footer */}
            <div className="mt-8 bg-yellow-50 p-4 rounded-xl border border-yellow-100 relative">
                <div className="absolute -top-3 -left-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded shadow-sm rotate-[-2deg]">VOCÊ SABIA?</div>
                <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed italic text-center">
                    "{pageCuriosity}"
                </p>
                {isPageComplete && (
                     <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-contain bg-no-repeat opacity-90 pointer-events-none animate-bounce-short" style={{ backgroundImage: "url('https://cdn-icons-png.flaticon.com/512/7518/7518748.png')" }}></div>
                )}
            </div>

          </div>
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="sticky bottom-6 z-40 flex justify-center w-full pointer-events-none">
        <div className="flex items-center gap-4 bg-slate-900/90 backdrop-blur-md p-2 px-4 rounded-full shadow-2xl pointer-events-auto border border-white/10 ring-1 ring-black/20">
            <button 
              onClick={handlePrev} 
              disabled={currentPage === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-medical-600 disabled:opacity-30 disabled:bg-slate-800 transition-all border border-slate-700"
            >
              ←
            </button>
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-white text-sm font-black tracking-wide">PÁGINA</span>
              <span className="text-[10px] text-medical-400 font-bold">{currentPage + 1} / {totalPages}</span>
            </div>
            <button 
              onClick={handleNext} 
              disabled={currentPage >= totalPages - 1}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-medical-600 disabled:opacity-30 disabled:bg-slate-800 transition-all border border-slate-700"
            >
              →
            </button>
        </div>
      </div>

      {/* --- INSPECT MODAL --- */}
      {selectedSticker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fade-in" onClick={() => setSelectedSticker(null)}>
          
          {/* Light Rays Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/10 to-transparent animate-spin-slow duration-[10s]"></div>
          </div>

          <div className="bg-white rounded-3xl p-1 max-w-sm w-full shadow-[0_0_50px_rgba(255,255,255,0.2)] animate-bounce-short relative transform transition-all" onClick={e => e.stopPropagation()}>
             <div className="bg-slate-50 rounded-[22px] p-6 flex flex-col items-center relative overflow-hidden">
                 
                 {/* Background Rarity Glow */}
                 <div className={`absolute top-0 inset-x-0 h-32 opacity-30 blur-3xl rounded-full translate-y-[-50%] 
                    ${selectedSticker.rarity === Rarity.LEGENDARY ? 'bg-yellow-500' : selectedSticker.rarity === Rarity.EPIC ? 'bg-purple-500' : 'bg-blue-400'}`} 
                 />

                 <div className="mb-6 transform scale-110 shadow-2xl rounded-xl">
                    <StickerCard sticker={selectedSticker} isLocked={false} size="lg" />
                 </div>
                 
                 <div className="text-center relative z-10">
                    <h2 className="text-2xl font-black text-slate-800 mb-2 leading-none">{selectedSticker.name}</h2>
                    <div className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 shadow-sm">
                        {selectedSticker.category}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium bg-white/50 p-3 rounded-xl border border-slate-100">
                        {selectedSticker.description}
                    </p>
                 </div>
             </div>
             <button className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 font-bold p-2" onClick={() => setSelectedSticker(null)}>✕</button>
          </div>
        </div>
      )}

      {/* --- RANKING MODAL --- */}
      {showRanking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setShowRanking(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-0 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-medical-600 p-6 text-white text-center">
               <h2 className="text-2xl font-black uppercase tracking-widest">Placar de Líderes</h2>
               <p className="text-medical-200 text-xs font-bold">Quem são as lendas atuais?</p>
            </div>
            
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3 bg-slate-50">
              {leaderboard.length === 0 ? <p className="text-center text-slate-400 py-10">Carregando dados...</p> : 
               leaderboard.map((u, index) => (
                <div key={index} className={`flex items-center p-3 rounded-2xl border-2 transition-transform hover:scale-[1.02] ${u.email === user.email ? 'border-medical-400 bg-white shadow-lg relative z-10' : 'border-slate-100 bg-white shadow-sm'}`}>
                   {/* Rank Badge */}
                   <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-black text-lg mr-4 shadow-inner
                     ${index === 0 ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-200' : 
                       index === 1 ? 'bg-slate-300 text-slate-700' :
                       index === 2 ? 'bg-orange-300 text-orange-800' : 'bg-slate-100 text-slate-400'}`}>
                      {index + 1}
                   </div>
                   
                   <div className="text-3xl mr-3 filter drop-shadow-sm">{u.avatar}</div>

                   <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 truncate text-sm">{u.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{u.rankTitle}</div>
                   </div>

                   <div className="text-right bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                     <div className="font-black text-medical-600 text-sm">{u.xp}</div>
                     <div className="text-[8px] text-slate-400 font-bold uppercase">XP</div>
                   </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 bg-white text-center">
                 <button onClick={() => setShowRanking(false)} className="text-sm font-bold text-slate-500 hover:text-slate-800">Fechar Ranking</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AlbumPage;
