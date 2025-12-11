import React from 'react';
import { UserProfile, RANKS } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, user, currentPage, onNavigate, isAdminMode, toggleAdminMode, onLogout
}) => {
  
  const navItems = [
    { id: 'album', icon: '📖', label: 'Álbum' },
    { id: 'quiz', icon: '🧠', label: 'Treino' },
    { id: 'store', icon: '🏪', label: 'Loja' },
    { id: 'trade', icon: '♻️', label: 'Trocas' },
  ];

  // Secure Admin Access Check
  const isSuperUser = user.email === 'admin@admin.com';

  if (isSuperUser && isAdminMode) {
    navItems.push({ id: 'admin', icon: '⚙️', label: 'Admin' });
  }

  // Calculate progress
  const nextRank = RANKS.find(r => r.level === user.level + 1);
  const currentRankMin = RANKS.find(r => r.level === user.level)?.minXp || 0;
  const nextRankMin = nextRank?.minXp || (currentRankMin + 1000);
  const progressPercent = Math.min(100, Math.max(0, ((user.xp - currentRankMin) / (nextRankMin - currentRankMin)) * 100));

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-2 flex justify-between items-center">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-medical-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transform rotate-3">
               L
             </div>
             <div className="hidden sm:block leading-tight">
                <div className="font-bold text-slate-800 text-sm">Lendas da</div>
                <div className="font-black text-medical-600 text-sm tracking-wide">ENFERMAGEM</div>
             </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* XP Badge */}
            <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-100 flex flex-col items-end">
               <span className="text-[9px] font-bold uppercase">EXP</span>
               <span className="font-bold text-sm leading-none">{user.xp}</span>
            </div>

            <div className="flex items-center gap-2 bg-white pl-2 pr-3 py-1 rounded-full border border-slate-200 shadow-sm">
               <span className="text-2xl">{user.avatar}</span>
               <div className="text-right hidden xs:block">
                  <div className="text-xs font-bold text-slate-700 uppercase leading-none mb-0.5 max-w-[80px] truncate">{user.name}</div>
                  <div className="text-[9px] font-bold text-medical-600 bg-medical-50 px-2 rounded-full inline-block">{user.rankTitle}</div>
               </div>
            </div>
            
            {/* Admin Toggle - Only Visible to Admin Email */}
            {isSuperUser && (
              <button 
                onClick={toggleAdminMode}
                className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors ${isAdminMode ? 'bg-slate-800 text-white shadow-inner' : 'border-slate-300 text-slate-400'}`}
                title="Painel Admin"
              >
                ⚙️
              </button>
            )}
            
            <button 
              onClick={onLogout} 
              className="bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ml-1"
            >
              SAIR
            </button>
          </div>
        </div>
        
        {/* XP Progress Bar Strip */}
        <div className="w-full h-1 bg-slate-100 relative">
           <div className="h-full bg-gradient-to-r from-medical-400 via-blue-500 to-purple-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-xl mx-auto flex justify-around">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all duration-200 group
                ${currentPage === item.id ? 'text-medical-600 -translate-y-1.5' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className={`text-2xl filter drop-shadow-sm transition-transform group-hover:scale-110 ${currentPage === item.id ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider opacity-80">{item.label}</span>
              {currentPage === item.id && <div className="w-1 h-1 bg-medical-500 rounded-full mt-1"></div>}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
