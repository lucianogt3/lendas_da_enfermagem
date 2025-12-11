import React, { useState } from 'react';
import { UserProfile } from '../types';
import { db } from '../services/database';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

const AVATARS = ['👩‍⚕️', '👨‍⚕️', '🏥', '🚑', '💉', '🩺', '💊', '🧬'];

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError("Email e Senha são obrigatórios.");
      return;
    }

    if (isRegistering && (!name.trim() || !profession.trim())) {
      setError("Preencha todos os campos do cadastro.");
      return;
    }

    setLoading(true);
    try {
      let user: UserProfile | null = null;

      if (isRegistering) {
        user = await db.register({
          name, 
          email, 
          password,
          profession, 
          avatar: selectedAvatar
        });
      } else {
        user = await db.login(email, password);
        if (!user) {
          setError("Credenciais inválidas. Tente novamente.");
          setLoading(false);
          return;
        }
      }

      // Simulate a "Loading Game" delay for effect
      setTimeout(() => {
          if (user) onLogin(user);
      }, 800);

    } catch (e: any) {
      setError(e.message || "Erro ao processar.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-medical-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Animated Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-medical-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-spin-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')] opacity-5 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10 animate-fade-in flex flex-col">
        
        {/* Header / Logo Area */}
        <div className="flex flex-col items-center mb-8">
            <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-medical-400 to-medical-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg transform rotate-3 mb-4 z-10 relative">
                    🩺
                </div>
                <div className="absolute inset-0 bg-medical-400 blur-lg opacity-60 rounded-2xl animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight text-center drop-shadow-md">
                LENDAS DA <br/>
                <span className="text-medical-300">ENFERMAGEM</span>
            </h1>
            <p className="text-blue-200 text-sm font-medium tracking-widest uppercase mt-2 opacity-80">
                Sistema Gamificado de Ensino
            </p>
        </div>

        {/* Toggle Switch */}
        <div className="bg-black/20 p-1 rounded-xl flex mb-6 relative">
             <div 
                className={`absolute top-1 bottom-1 w-[48%] bg-medical-500 rounded-lg shadow transition-all duration-300 ${isRegistering ? 'left-[50%]' : 'left-[2%]'}`}
             ></div>
             <button 
                type="button"
                onClick={() => { setIsRegistering(false); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${!isRegistering ? 'text-white' : 'text-slate-400 hover:text-white'}`}
             >
                LOGIN
             </button>
             <button 
                type="button"
                onClick={() => { setIsRegistering(true); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${isRegistering ? 'text-white' : 'text-slate-400 hover:text-white'}`}
             >
                NOVA CONTA
             </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input Group */}
            <div className="space-y-3">
                <div className="relative group">
                    <span className="absolute left-4 top-3.5 text-lg opacity-50 group-focus-within:opacity-100 transition-opacity">✉️</span>
                    <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email Profissional"
                        className="w-full bg-black/20 border border-white/10 text-white placeholder-white/30 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-medical-400 focus:bg-black/30 transition-all outline-none font-medium"
                    />
                </div>
                
                <div className="relative group">
                    <span className="absolute left-4 top-3.5 text-lg opacity-50 group-focus-within:opacity-100 transition-opacity">🔒</span>
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Senha"
                        className="w-full bg-black/20 border border-white/10 text-white placeholder-white/30 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-medical-400 focus:bg-black/30 transition-all outline-none font-medium"
                    />
                </div>

                {isRegistering && (
                    <div className="space-y-3 animate-fade-in pt-2">
                         <div className="relative group">
                            <span className="absolute left-4 top-3.5 text-lg opacity-50 group-focus-within:opacity-100 transition-opacity">👤</span>
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Nome Completo"
                                className="w-full bg-black/20 border border-white/10 text-white placeholder-white/30 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-medical-400 focus:bg-black/30 transition-all outline-none font-medium"
                            />
                        </div>
                        <div className="relative group">
                            <span className="absolute left-4 top-3.5 text-lg opacity-50 group-focus-within:opacity-100 transition-opacity">💼</span>
                            <input 
                                type="text" 
                                value={profession}
                                onChange={e => setProfession(e.target.value)}
                                placeholder="Cargo (Ex: Enfermeiro)"
                                className="w-full bg-black/20 border border-white/10 text-white placeholder-white/30 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-medical-400 focus:bg-black/30 transition-all outline-none font-medium"
                            />
                        </div>

                        <div>
                            <label className="text-white/60 text-xs font-bold uppercase ml-1 mb-2 block">Escolha seu Avatar</label>
                            <div className="flex gap-2 justify-center flex-wrap bg-black/20 p-3 rounded-xl">
                                {AVATARS.map(av => (
                                    <button
                                        key={av}
                                        type="button"
                                        onClick={() => setSelectedAvatar(av)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${selectedAvatar === av ? 'bg-medical-500 scale-110 shadow-lg ring-2 ring-white' : 'bg-white/10 hover:bg-white/20'}`}
                                    >
                                        {av}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs font-bold p-3 rounded-xl text-center animate-bounce-short">
                    ⚠️ {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-medical-500 to-blue-600 hover:from-medical-400 hover:to-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-medical-900/50 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-lg tracking-wide border-b-4 border-medical-800 active:border-b-0 active:translate-y-1"
            >
                {loading ? 'CARREGANDO...' : (isRegistering ? 'INICIAR JORNADA' : 'CONTINUAR JOGO')}
            </button>
        </form>
        
        {/* Admin Quick Link */}
        <div className="mt-6 text-center opacity-30 hover:opacity-100 transition-opacity">
            <p className="text-[10px] text-white">Admin: admin@admin.com | 123</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
