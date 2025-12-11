import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import AuthScreen from './components/AuthScreen';
import AlbumPage from './pages/AlbumPage';
import QuizPage from './pages/QuizPage';
import StorePage from './pages/StorePage';
import AdminPage from './pages/AdminPage';
import TradePage from './pages/TradePage';
import { UserProfile, Sticker, RANKS, QuizQuestion, QuizTopic } from './types';
import { db } from './services/database';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('album');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // App State
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [topics, setTopics] = useState<QuizTopic[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedStickers, loadedQuestions, loadedTopics, loadedUser] = await Promise.all([
          db.getStickers(),
          db.getQuestions(),
          db.getTopics(),
          db.getCurrentUser()
        ]);
        
        setStickers(loadedStickers);
        setQuestions(loadedQuestions);
        setTopics(loadedTopics);
        setUser(loadedUser);
      } catch (e) {
        console.error("Erro ao carregar sistema", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // -- Actions --

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    await db.logout();
    setUser(null);
    setIsAdminMode(false);
    setCurrentPage('album'); // Reset navigation
  };

  const saveUser = (u: UserProfile) => {
    setUser(u); // Optimistic UI update
    db.updateUser(u); // Async save
  };

  // Admin Actions
  const handleAddSticker = async (newSticker: Sticker) => {
    await db.addSticker(newSticker);
    const fresh = await db.getStickers();
    setStickers(fresh); 
  };

  const handleAddQuestion = async (q: QuizQuestion) => {
    await db.addQuestion(q);
    const fresh = await db.getQuestions();
    setQuestions(fresh);
  };

  const handleDeleteQuestion = async (id: string) => {
    await db.deleteQuestion(id);
    const fresh = await db.getQuestions();
    setQuestions(fresh);
  };

  const handleAddTopic = async (t: QuizTopic) => {
    await db.addTopic(t);
    const fresh = await db.getTopics();
    setTopics(fresh);
  };

  const handleDeleteTopic = async (id: string) => {
    await db.deleteTopic(id);
    const fresh = await db.getTopics();
    setTopics(fresh);
  };

  // Game Logic
  const handleCorrectAnswer = (xpGain: number, coinGain: number, questionId: string) => {
    if (!user) return;
    
    const newXp = user.xp + xpGain;
    const newCoins = user.coins + coinGain;
    
    // Add question ID to answered list if not already there (prevents duplicates logic elsewhere)
    const newAnswered = user.answeredQuestions.includes(questionId) 
        ? user.answeredQuestions 
        : [...user.answeredQuestions, questionId];

    let newLevel = user.level;
    let newRankTitle = user.rankTitle;
    const nextRank = RANKS.find(r => r.level === user.level + 1);
    
    if (nextRank && newXp >= nextRank.minXp) {
      newLevel = nextRank.level;
      newRankTitle = nextRank.title;
      alert(`🎉 UP DE NÍVEL! Agora você é: ${newRankTitle}!`);
    }

    saveUser({ 
        ...user, 
        xp: newXp, 
        coins: Math.floor(newCoins), 
        level: newLevel, 
        rankTitle: newRankTitle,
        answeredQuestions: newAnswered
    });
  };

  const handleBuyPack = (newStickers: Sticker[], cost: number) => {
    if (!user) return;
    const newIds = newStickers.map(s => s.id);
    saveUser({
      ...user,
      coins: user.coins - cost,
      collectedStickers: [...user.collectedStickers, ...newIds]
    });
  };

  const handleSellDuplicate = (id: string, earn: number) => {
    if (!user) return;
    const index = user.collectedStickers.indexOf(id);
    if (index === -1) return;
    
    const newCollection = [...user.collectedStickers];
    newCollection.splice(index, 1);
    
    saveUser({
      ...user,
      coins: user.coins + earn,
      collectedStickers: newCollection
    });
    alert(`Vendido por ${earn} moedas!`);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-medical-600 font-bold text-xl animate-pulse">Conectando ao banco de dados...</div>;

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'album': return <AlbumPage stickers={stickers} user={user} />;
      case 'quiz': return <QuizPage 
        onCorrectAnswer={handleCorrectAnswer} 
        questions={questions} 
        userLevel={user.level} 
        topics={topics}
        answeredQuestions={user.answeredQuestions || []} 
      />;
      case 'store': return <StorePage user={user} stickers={stickers} onBuyPack={handleBuyPack} />;
      case 'trade': return <TradePage user={user} stickers={stickers} onSellDuplicate={handleSellDuplicate} />;
      case 'admin': 
        return isAdminMode 
          ? <AdminPage 
              stickers={stickers} 
              onAddSticker={handleAddSticker} 
              questions={questions}
              onAddQuestion={handleAddQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              topics={topics}
              onAddTopic={handleAddTopic}
              onDeleteTopic={handleDeleteTopic}
            /> 
          : <div className="p-10 text-center">Acesso restrito.</div>;
      default: return <AlbumPage stickers={stickers} user={user} />;
    }
  };

  return (
    <Layout 
      user={user} 
      currentPage={currentPage} 
      onNavigate={setCurrentPage}
      isAdminMode={isAdminMode}
      toggleAdminMode={() => setIsAdminMode(!isAdminMode)}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
