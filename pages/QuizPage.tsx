import React, { useState, useMemo } from 'react';
import { QuizQuestion, QuizTopic } from '../types';
import { generateQuizQuestion } from '../services/geminiService';

interface QuizPageProps {
  onCorrectAnswer: (xpGain: number, coinGain: number, questionId: string) => void;
  questions: QuizQuestion[];
  userLevel: number;
  topics: QuizTopic[];
  answeredQuestions: string[];
}

const QuizPage: React.FC<QuizPageProps> = ({ onCorrectAnswer, questions, userLevel, topics, answeredQuestions }) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [loadingSupreme, setLoadingSupreme] = useState(false);
  const [isSupremeMode, setIsSupremeMode] = useState(false);

  // Calculate Progress Per Topic
  const topicStats = useMemo(() => {
    const stats: Record<string, { total: number, answered: number, completed: boolean }> = {};
    
    topics.forEach(t => {
      const topicQuestions = questions.filter(q => q.topic === t.name);
      const total = topicQuestions.length;
      const answered = topicQuestions.filter(q => answeredQuestions.includes(q.id)).length;
      stats[t.name] = {
        total,
        answered,
        completed: total > 0 && answered >= total
      };
    });
    return stats;
  }, [topics, questions, answeredQuestions]);

  const allTopicsComplete = useMemo(() => {
    if (topics.length === 0) return false;
    return topics.every(t => topicStats[t.name]?.completed);
  }, [topicStats, topics]);

  const getQuestion = async (topic: string, isSupreme: boolean = false) => {
    setFeedback(null);
    setIsSupremeMode(isSupreme);
    
    if (isSupreme) {
      // SUPREME MODE: Infinite AI Generation
      setLoadingSupreme(true);
      try {
         // Pick a random topic for variety
         const randomTopic = topics[Math.floor(Math.random() * topics.length)]?.name || 'Geral';
         const newQ = await generateQuizQuestion(randomTopic, 'Difícil');
         // Modify ID to ensure it doesn't conflict and isn't marked as answered immediately in logic (though for Supreme we don't save ID to block it, we just award coins)
         newQ.id = `supreme-${Date.now()}`;
         setCurrentQuestion(newQ);
      } catch (e) {
         alert("Erro ao invocar o desafio supremo. Tente novamente.");
         setSelectedTopic(null);
      } finally {
         setLoadingSupreme(false);
      }
      return;
    }

    // NORMAL MODE: Local filtering
    let targetDiff = ['Fácil'];
    if (userLevel > 2) targetDiff.push('Médio');
    if (userLevel > 4) targetDiff.push('Difícil');

    // Filter available AND unanswered questions
    const available = questions.filter(q => 
        q.topic === topic && 
        targetDiff.includes(q.difficulty) &&
        !answeredQuestions.includes(q.id)
    );
    
    if (available.length === 0) {
      alert("Você completou todas as perguntas disponíveis para o seu nível neste tópico!");
      setSelectedTopic(null);
    } else {
      const random = available[Math.floor(Math.random() * available.length)];
      setCurrentQuestion(random);
    }
  };

  const handleTopicSelect = (topic: string) => {
    if (topicStats[topic].completed) return; // Prevent click if complete
    setSelectedTopic(topic);
    getQuestion(topic, false);
  };

  const handleSupremeSelect = () => {
    setSelectedTopic("SUPREMO");
    getQuestion("SUPREMO", true);
  };

  const handleAnswer = (index: number) => {
    if (!currentQuestion || feedback) return;

    if (index === currentQuestion.correctIndex) {
      setFeedback('correct');
      setStreak(s => s + 1);
      
      let baseReward = 10;
      if (currentQuestion.difficulty === 'Médio') baseReward = 25;
      if (currentQuestion.difficulty === 'Difícil') baseReward = 50;
      
      let coinReward = (baseReward / 2) + Math.min(streak * 5, 50);

      // Supreme Bonus: Double Coins
      if (isSupremeMode) {
        coinReward = coinReward * 3; // Triple coins to buy legendary packs!
        baseReward = baseReward * 2;
      }

      onCorrectAnswer(baseReward, coinReward, currentQuestion.id);

    } else {
      setFeedback('wrong');
      setStreak(0);
    }
  };

  // --- VIEW: TOPIC SELECTION (CARDS) ---
  if (!selectedTopic) {
    return (
      <div className="p-4 max-w-4xl mx-auto pb-24">
        <div className="text-center mb-8">
           <h2 className="text-3xl font-bold text-slate-800">Centro de Treinamento</h2>
           <p className="text-slate-500">Complete os módulos para desbloquear o Desafio Supremo.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {topics.map(topic => {
            const stat = topicStats[topic.name] || { total: 0, answered: 0, completed: false };
            const percent = stat.total === 0 ? 0 : Math.round((stat.answered / stat.total) * 100);

            return (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic.name)}
                disabled={stat.completed}
                className={`
                   relative overflow-hidden p-6 rounded-2xl shadow-lg border-b-4 transition-all flex flex-col items-center justify-center gap-3 group
                   ${stat.completed 
                      ? 'bg-slate-100 border-slate-300 opacity-60 grayscale cursor-not-allowed' 
                      : 'bg-white border-medical-200 hover:border-medical-500 hover:-translate-y-1'
                   }
                `}
              >
                {stat.completed && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <span className="bg-green-600 text-white font-black px-3 py-1 rounded text-xs transform -rotate-12 shadow-md">CONCLUÍDO</span>
                    </div>
                )}

                <div className="text-5xl group-hover:scale-110 transition-transform">
                  {topic.icon || '🩺'}
                </div>
                <span className="font-bold text-slate-700 text-center text-sm md:text-base group-hover:text-medical-600 z-0">
                  {topic.name}
                </span>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2 border border-slate-200">
                    <div 
                        className={`h-full ${stat.completed ? 'bg-green-500' : 'bg-medical-500'}`} 
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <span className="text-[10px] text-slate-400 font-bold">{stat.answered}/{stat.total}</span>
              </button>
            );
          })}

          {/* CARD SUPREMO */}
          {allTopicsComplete && (
             <button
                onClick={handleSupremeSelect}
                className="col-span-2 md:col-span-1 bg-gradient-to-br from-yellow-400 to-orange-600 p-6 rounded-2xl shadow-2xl border-b-4 border-orange-800 hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden group animate-fade-in"
             >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                
                <div className="text-6xl filter drop-shadow-md z-10 animate-bounce-short">👑</div>
                <span className="font-black text-white text-center text-lg z-10 tracking-wider uppercase drop-shadow-md">
                  DESAFIO SUPREMO
                </span>
                <span className="text-[10px] bg-black/30 text-white px-2 py-1 rounded-full font-bold z-10 border border-white/20">
                  MODO INFINITO (3x MOEDAS)
                </span>
             </button>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW: QUIZ ACTIVE ---
  if (loadingSupreme) return (
      <div className="p-10 flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="text-6xl mb-4 animate-spin-slow">🔮</div>
          <h2 className="text-xl font-bold text-slate-800">Invocando Desafio Supremo...</h2>
          <p className="text-slate-500">A IA está gerando uma pergunta única para você.</p>
      </div>
  );

  if (!currentQuestion) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
       {/* Back Button */}
       <button onClick={() => {setSelectedTopic(null); setStreak(0);}} className="mb-4 text-slate-500 hover:text-medical-600 font-bold flex items-center">
         ← Voltar para Temas
       </button>

       <div className={`rounded-3xl shadow-2xl overflow-hidden border relative ${isSupremeMode ? 'bg-slate-900 border-yellow-500 ring-2 ring-yellow-400/50' : 'bg-white border-slate-100'}`}>
          <div className={`p-1 h-2 w-full ${isSupremeMode ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-pulse' : 'bg-medical-600'}`}></div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
               <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${isSupremeMode ? 'bg-yellow-500 text-yellow-900' : 'bg-medical-50 text-medical-600'}`}>
                 {isSupremeMode ? '⚡ MODO SUPREMO' : currentQuestion.topic}
               </span>
               <div className="flex items-center gap-2 bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                  <span className="text-sm">🔥</span>
                  <span className="font-bold text-sm">{streak}</span>
               </div>
            </div>

            <h3 className={`text-xl md:text-2xl font-bold mb-8 leading-snug ${isSupremeMode ? 'text-white' : 'text-slate-800'}`}>
              {currentQuestion.question}
            </h3>
            
            <div className="space-y-4">
              {currentQuestion.options.map((opt, idx) => {
                let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium relative overflow-hidden ";
                
                if (isSupremeMode) {
                    // Dark theme for Supreme
                    btnClass += "text-slate-200 ";
                    if (feedback) {
                        if (idx === currentQuestion.correctIndex) btnClass += "border-green-400 bg-green-900/50 text-green-200 shadow-[0_0_15px_rgba(74,222,128,0.3)] ";
                        else if (idx !== currentQuestion.correctIndex && feedback === 'wrong') btnClass += "border-red-800 opacity-50 ";
                        else btnClass += "border-slate-700 bg-slate-800 ";
                    } else {
                        btnClass += "border-slate-700 bg-slate-800 hover:border-yellow-500 hover:bg-slate-700 hover:shadow-lg hover:shadow-yellow-500/20 ";
                    }
                } else {
                    // Light theme for Normal
                    btnClass += "text-slate-700 ";
                    if (feedback) {
                        if (idx === currentQuestion.correctIndex) btnClass += "border-green-500 bg-green-50 text-green-800 shadow-md transform scale-[1.02] ";
                        else if (idx !== currentQuestion.correctIndex && feedback === 'wrong') btnClass += "border-red-100 opacity-50 ";
                        else btnClass += "border-slate-100 ";
                    } else {
                        btnClass += "border-slate-200 hover:border-medical-400 hover:bg-slate-50 hover:shadow-md ";
                    }
                }

                return (
                  <button
                    key={idx}
                    disabled={!!feedback}
                    onClick={() => handleAnswer(idx)}
                    className={btnClass}
                  >
                    <span className="relative z-10">{opt}</span>
                  </button>
                );
              })}
            </div>

            {feedback && (
              <div className={`mt-8 animate-fade-in border-t pt-6 ${isSupremeMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <div className={`p-4 rounded-2xl mb-4 ${feedback === 'correct' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                   <p className="font-bold mb-1 text-lg">{feedback === 'correct' ? 'Excelente! 🎉' : 'Que pena! 😅'}</p>
                   <p className="text-sm opacity-90">{currentQuestion.explanation}</p>
                </div>
                <button 
                  onClick={() => getQuestion(selectedTopic!, isSupremeMode)}
                  className={`w-full font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all
                    ${isSupremeMode 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:brightness-110 shadow-orange-500/30' 
                        : 'bg-medical-600 text-white hover:bg-medical-500'
                    }`}
                >
                  {isSupremeMode ? 'Desafiar Próxima (Infinito) →' : 'Próxima Pergunta →'}
                </button>
              </div>
            )}
          </div>
       </div>
    </div>
  );
};

export default QuizPage;
