import React, { useState } from 'react';
import { generateStickerImage, generateQuizQuestion } from '../services/geminiService';
import { Sticker, Rarity, QuizQuestion, StorePack, QuizTopic } from '../types';
import StickerCard from '../components/StickerCard';
import { db } from '../services/database';

interface AdminPageProps {
  onAddSticker: (sticker: Sticker) => void;
  stickers: Sticker[];
  questions: QuizQuestion[];
  onAddQuestion: (q: QuizQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  topics: QuizTopic[];
  onAddTopic: (t: QuizTopic) => void;
  onDeleteTopic: (id: string) => void;
}

const MEDICAL_ICONS = ['💊', '💉', '🩺', '🫀', '🦠', '🏥', '🚑', '🩸', '🦴', '🦷', '🧠', '🧬', '🩹', '🌡️', '🔬', '😷', '🧪', '⚕️', '🤝', '⚖️', '👶', '🤰', '👁️', '👂', '🦶', '🫁'];

const AdminPage: React.FC<AdminPageProps> = ({ 
  onAddSticker, stickers, questions, onAddQuestion, onDeleteQuestion, topics, onAddTopic, onDeleteTopic 
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'questions' | 'store' | 'topics'>('cards');

  // --- STICKER STATE ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stickerMode, setStickerMode] = useState<'ai' | 'url'>('url');
  const [prompt, setPrompt] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [sName, setSName] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [rarity, setRarity] = useState<Rarity>(Rarity.COMMON);
  const [category, setCategory] = useState(topics[0]?.name || 'Geral');
  const [isAnimated, setIsAnimated] = useState(false);
  const [loadingSticker, setLoadingSticker] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // --- QUESTION STATE ---
  const [questionMode, setQuestionMode] = useState<'ai' | 'manual'>('ai');
  const [qTopic, setQTopic] = useState(topics[0]?.name || 'Geral');
  const [qDiff, setQDiff] = useState<'Fácil' | 'Médio' | 'Difícil'>('Fácil');
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState<QuizQuestion>({
    id: '', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', difficulty: 'Fácil', topic: topics[0]?.name || 'Geral'
  });

  // --- STORE PACK STATE ---
  const [packName, setPackName] = useState('');
  const [packDesc, setPackDesc] = useState('');
  const [packPrice, setPackPrice] = useState(100);
  const [legendaryChance, setLegendaryChance] = useState(5);
  const [packColor, setPackColor] = useState('bg-blue-500');

  // --- TOPIC STATE ---
  const [topicName, setTopicName] = useState('');
  const [topicIcon, setTopicIcon] = useState('💉');

  // --- LOGIC ---
  
  const resetStickerForm = () => {
    setEditingId(null);
    setSName('');
    setSDesc('');
    setGeneratedImage(null);
    setPrompt('');
    setExternalUrl('');
    setRarity(Rarity.COMMON);
    setCategory(topics[0]?.name || 'Geral');
    setIsAnimated(false);
  };

  const handleGenerateSticker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setLoadingSticker(true);
    const imgUrl = await generateStickerImage(prompt, rarity);
    setGeneratedImage(imgUrl);
    setLoadingSticker(false);
  };

  const handlePreviewUrl = () => { if (externalUrl) setGeneratedImage(externalUrl); };

  const handleSaveSticker = async () => {
    if (!generatedImage || !sName) { alert("Nome e imagem obrigatórios."); return; }
    
    let finalId = editingId;
    if (!finalId) {
        const maxId = stickers.reduce((max, s) => { 
            const p = parseInt(s.id); 
            return !isNaN(p) && p > max ? p : max; 
        }, 0);
        finalId = (maxId + 1).toString();
    }

    const newSticker: Sticker = { 
        id: finalId, 
        name: sName, 
        description: sDesc || 'Sem descrição.', 
        imageUrl: generatedImage, 
        rarity, 
        category,
        isAnimated 
    };

    if (editingId) {
        await db.updateSticker(newSticker);
        alert(`Card "${sName}" atualizado com sucesso!`);
    } else {
        await db.addSticker(newSticker);
        alert(`Novo Card "${sName}" criado!`);
    }
    window.location.reload(); 
  };

  const handleSelectSticker = (s: Sticker) => {
    setEditingId(s.id);
    setSName(s.name);
    setSDesc(s.description);
    setGeneratedImage(s.imageUrl);
    setExternalUrl(s.imageUrl);
    setRarity(s.rarity);
    setCategory(s.category);
    setIsAnimated(!!s.isAnimated);
    setStickerMode('url');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateQuestion = async () => {
    setLoadingQuestion(true);
    const q = await generateQuizQuestion(qTopic, qDiff);
    setDraftQuestion(q);
    setLoadingQuestion(false);
  };

  const handleSaveQuestion = () => {
    if (!draftQuestion.question) { alert("Preencha a pergunta."); return; }
    const newQ = { ...draftQuestion, id: draftQuestion.id || 'manual-' + Date.now() };
    onAddQuestion(newQ);
    setDraftQuestion({ id: '', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', difficulty: 'Fácil', topic: topics[0]?.name || 'Geral' });
    alert("Pergunta salva!");
  };

  const handleCreatePack = async () => {
    if (!packName) return;
    const newPack: StorePack = {
        id: 'pack-' + Date.now(),
        name: packName,
        description: packDesc,
        price: packPrice,
        stickersCount: 3,
        legendaryChance: legendaryChance,
        epicChance: 15,
        rareChance: 30,
        color: packColor
    };
    await db.addPack(newPack);
    alert("Pacote criado e disponível na loja!");
    setPackName('');
  };

  const handleCreateTopic = () => {
    if (!topicName || !topicIcon) { alert("Nome e ícone obrigatórios."); return; }
    onAddTopic({
      id: 'topic-' + Date.now(),
      name: topicName,
      icon: topicIcon
    });
    setTopicName('');
  };

  return (
    <div className="p-4 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-4xl">🛠️</span> Painel Admin
        </h1>
        <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
          <button onClick={() => setActiveTab('cards')} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${activeTab === 'cards' ? 'bg-medical-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Cards</button>
          <button onClick={() => setActiveTab('questions')} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${activeTab === 'questions' ? 'bg-medical-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Perguntas</button>
          <button onClick={() => setActiveTab('store')} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${activeTab === 'store' ? 'bg-medical-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Loja</button>
          <button onClick={() => setActiveTab('topics')} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${activeTab === 'topics' ? 'bg-medical-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Tópicos</button>
        </div>
      </div>

      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-7 flex flex-col gap-6">
             {/* EDIT FORM */}
             <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 ring-1 ring-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {editingId ? '✏️ Editando Card' : '✨ Novo Card'}
                    </h2>
                    {editingId && (
                        <button onClick={resetStickerForm} className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full hover:bg-slate-200">
                            Cancelar Edição
                        </button>
                    )}
                </div>
                
                <p className="text-xs text-slate-500 mb-4">Preencha os dados abaixo. Use uma URL de imagem ou gere com IA.</p>
                
                <div className="flex gap-2 mb-4 bg-slate-50 p-1 rounded-lg w-fit border border-slate-200">
                    <button onClick={() => setStickerMode('url')} className={`px-3 py-1 text-sm font-bold rounded ${stickerMode === 'url' ? 'bg-white shadow text-medical-600' : 'text-slate-500'}`}>🔗 Usar URL (Imagem/GIF)</button>
                    <button onClick={() => setStickerMode('ai')} className={`px-3 py-1 text-sm font-bold rounded ${stickerMode === 'ai' ? 'bg-white shadow text-purple-600' : 'text-slate-500'}`}>🤖 Gerar com IA</button>
                </div>

                {stickerMode === 'ai' ? (
                    <div className="mb-4">
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Descreva a imagem (ex: Coração anatômico dourado)..." className="w-full p-3 border rounded-xl mb-2 focus:ring-2 ring-medical-200 outline-none" rows={2} />
                        <button onClick={handleGenerateSticker} disabled={loadingSticker} className="bg-purple-600 hover:bg-purple-700 text-white w-full py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50">
                            {loadingSticker ? '✨ Gerando Arte...' : '✨ Gerar Imagem'}
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2 mb-4">
                        <input value={externalUrl} onChange={e => setExternalUrl(e.target.value)} placeholder="Cole o link da imagem ou GIF..." className="w-full p-3 border rounded-xl focus:ring-2 ring-medical-200 outline-none" />
                        <button onClick={handlePreviewUrl} className="bg-slate-800 text-white px-4 rounded-xl font-bold hover:bg-slate-700">Ver</button>
                    </div>
                )}
                
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Nome do Card</label>
                        <input value={sName} onChange={e => setSName(e.target.value)} placeholder="Ex: Florence Nightingale" className="w-full p-3 border rounded-xl font-bold text-slate-800" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Descrição (Curiosidade)</label>
                        <input value={sDesc} onChange={e => setSDesc(e.target.value)} placeholder="Texto que aparece no verso..." className="w-full p-3 border rounded-xl text-sm" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Raridade</label>
                            <select value={rarity} onChange={e => setRarity(e.target.value as Rarity)} className="w-full p-3 border rounded-xl bg-white">
                                {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-medical-600 uppercase">Vincular a Tópico</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 border-2 border-medical-100 rounded-xl bg-white font-bold text-medical-700">
                                {topics.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <input 
                            type="checkbox" 
                            id="animCheck"
                            checked={isAnimated} 
                            onChange={e => setIsAnimated(e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" 
                        />
                        <label htmlFor="animCheck" className="text-sm font-bold text-purple-800 flex items-center gap-1">
                            ✨ É uma Figurinha Animada (GIF)?
                        </label>
                    </div>
                </div>

                <button onClick={handleSaveSticker} disabled={!generatedImage} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold mt-6 shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none">
                    {editingId ? '💾 Salvar Alterações' : '➕ Criar Card no Álbum'}
                </button>
             </div>

             {/* LISTA DE FIGURINHAS EXISTENTES */}
             <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Banco de Cards ({stickers.length})</h3>
                    <span className="text-xs text-slate-400">Clique para editar</span>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {stickers.map(s => (
                        <div 
                            key={s.id} 
                            onClick={() => handleSelectSticker(s)} 
                            className={`cursor-pointer transition-all border rounded-lg p-1 hover:shadow-md relative group
                                ${editingId === s.id ? 'ring-2 ring-medical-500 bg-medical-50' : 'bg-slate-50 border-slate-200'}
                            `}
                        >
                            <div className="aspect-square rounded overflow-hidden mb-1 relative">
                                <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                                {s.isAnimated && <span className="absolute bottom-0 right-0 bg-purple-600 text-white text-[8px] font-bold px-1">GIF</span>}
                            </div>
                            <p className="text-[9px] font-bold truncate text-center leading-tight">{s.name}</p>
                            
                            {/* Edit Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                <span className="text-white text-xs font-bold">Editar</span>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
           </div>
           
           {/* PREVIEW */}
           <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-slate-100 p-6 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 min-h-[400px] sticky top-24 shadow-inner">
                 <p className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-widest">Pré-visualização</p>
                 {generatedImage ? (
                    <div className="animate-fade-in transform hover:scale-105 transition-transform duration-500">
                        <StickerCard sticker={{ id: 'PREVIEW', name: sName || 'Nome da Carta', description: sDesc || 'Descrição...', imageUrl: generatedImage, rarity, category, isAnimated }} isLocked={false} size="lg" />
                    </div>
                 ) : (
                    <div className="flex flex-col items-center text-slate-300">
                        <span className="text-6xl mb-2">🖼️</span>
                        <span className="text-sm font-bold">Sem imagem</span>
                    </div>
                 )}
                 <div className="mt-6 text-center">
                    <p className="text-slate-500 text-xs font-bold">Status: {editingId ? 'Editando ID: ' + editingId : 'Criando Novo'}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'questions' && (
         <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl shadow-lg">
               <div className="flex gap-2 mb-4">
                  <button onClick={() => setQuestionMode('ai')} className={`flex-1 py-2 font-bold rounded ${questionMode === 'ai' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}>IA</button>
                  <button onClick={() => setQuestionMode('manual')} className={`flex-1 py-2 font-bold rounded ${questionMode === 'manual' ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`}>Manual</button>
               </div>
               
               <div className="mb-4">
                 <label className="text-xs font-bold text-slate-400 uppercase">Tópico</label>
                 <select value={qTopic} onChange={e => setQTopic(e.target.value)} className="w-full p-3 border rounded-xl">
                    {topics.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                 </select>
               </div>

               {questionMode === 'ai' && <button onClick={handleGenerateQuestion} disabled={loadingQuestion} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mb-4 shadow-md">{loadingQuestion ? 'Gerando...' : 'Sugerir Pergunta com IA'}</button>}
               
               <div className="space-y-2">
                   <textarea value={draftQuestion.question} onChange={e => setDraftQuestion({...draftQuestion, question: e.target.value})} className="w-full p-3 border rounded-xl font-medium" placeholder="Digite a pergunta..." rows={3} />
                   {draftQuestion.options.map((o, i) => (
                       <div key={i} className="flex gap-2 items-center">
                           <div className="flex flex-col items-center">
                               <input type="radio" name="correct" checked={draftQuestion.correctIndex === i} onChange={() => setDraftQuestion({...draftQuestion, correctIndex: i})} className="w-4 h-4" />
                           </div>
                           <input value={o} onChange={e => {const n = [...draftQuestion.options]; n[i] = e.target.value; setDraftQuestion({...draftQuestion, options: n})}} className={`flex-1 p-2 border rounded-lg ${draftQuestion.correctIndex === i ? 'border-green-500 bg-green-50' : ''}`} placeholder={`Opção ${i+1}`} />
                       </div>
                   ))}
                   <textarea value={draftQuestion.explanation} onChange={e => setDraftQuestion({...draftQuestion, explanation: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50 text-sm" placeholder="Explicação da resposta correta..." />
               </div>
               
               <button onClick={handleSaveQuestion} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl mt-4 shadow-lg">Salvar Pergunta no Banco</button>
            </div>
            
            <div className="flex flex-col h-[600px]">
                <h3 className="font-bold text-slate-700 mb-2">Banco de Questões ({questions.length})</h3>
                <div className="bg-slate-50 p-4 rounded-3xl flex-1 overflow-y-auto border border-slate-200">
                {questions.length === 0 ? <div className="text-center text-slate-400 mt-20">Nenhuma pergunta cadastrada.</div> :
                    questions.slice().reverse().map(q => (
                        <div key={q.id} className="bg-white p-4 rounded-xl mb-3 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{q.topic} • {q.difficulty}</span> 
                                <button onClick={() => onDeleteQuestion(q.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                            </div>
                            <div className="text-sm font-bold text-slate-800 leading-tight">{q.question}</div>
                            <div className="mt-2 text-xs text-green-700">Resp: {q.options[q.correctIndex]}</div>
                        </div>
                    ))
                }
                </div>
            </div>
         </div>
      )}

      {activeTab === 'store' && (
          <div className="bg-white p-8 rounded-3xl shadow-lg max-w-2xl mx-auto border border-slate-200">
             <h2 className="text-2xl font-bold mb-6 text-slate-800">Gerenciador da Loja</h2>
             
             <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome do Pacote</label>
                    <input value={packName} onChange={e => setPackName(e.target.value)} className="w-full p-3 border rounded-xl font-bold" placeholder="Ex: Pacote de Anatomia" />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Descrição Comercial</label>
                    <input value={packDesc} onChange={e => setPackDesc(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Ex: Contém figurinhas raras do sistema cardíaco..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Preço (Moedas)</label>
                        <input type="number" value={packPrice} onChange={e => setPackPrice(Number(e.target.value))} className="w-full p-3 border rounded-xl" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Chance de Lendária (%)</label>
                        <input type="number" value={legendaryChance} onChange={e => setLegendaryChance(Number(e.target.value))} className="w-full p-3 border rounded-xl" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Identidade Visual (Cor)</label>
                    <div className="flex gap-2">
                        {['bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500', 'bg-slate-800', 'bg-pink-500', 'bg-teal-500'].map(c => (
                            <button key={c} onClick={() => setPackColor(c)} className={`w-10 h-10 rounded-full ${c} ${packColor === c ? 'ring-4 ring-offset-2 ring-slate-300 scale-110' : ''} shadow-sm transition-all`} />
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Pré-visualização do Item na Loja</p>
                    <div className={`p-6 rounded-2xl text-white text-center mb-6 shadow-lg transform transition-all hover:scale-[1.02] cursor-pointer ${packColor}`}>
                        <div className="text-4xl mb-2">📦</div>
                        <div className="font-bold text-2xl tracking-wide">{packName || 'Nome do Pacote'}</div>
                        <div className="text-sm opacity-90 mt-1 font-medium bg-black/20 inline-block px-3 py-1 rounded-full">{packPrice} Moedas</div>
                        <div className="text-xs opacity-75 mt-2">Chance de Lenda: {legendaryChance}%</div>
                    </div>
                    <button onClick={handleCreatePack} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 shadow-xl transition-all">
                        Publicar Pacote na Loja
                    </button>
                </div>
             </div>
          </div>
      )}

      {activeTab === 'topics' && (
         <div className="max-w-2xl mx-auto">
             <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 mb-8">
                 <h2 className="text-xl font-bold text-slate-800 mb-4">Adicionar Novo Tópico</h2>
                 
                 {/* Icon Selector */}
                 <div className="mb-6">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Escolha um Ícone</label>
                    <div className="flex flex-wrap gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 justify-center">
                        {MEDICAL_ICONS.map(icon => (
                            <button 
                                key={icon}
                                onClick={() => setTopicIcon(icon)}
                                className={`w-10 h-10 flex items-center justify-center text-2xl rounded-xl transition-all hover:scale-110 active:scale-95 ${topicIcon === icon ? 'bg-white shadow-md ring-2 ring-medical-500 scale-110' : 'hover:bg-white hover:shadow-sm grayscale hover:grayscale-0 opacity-70 hover:opacity-100'}`}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                 </div>

                 <div className="flex gap-4 items-end">
                     <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome do Tópico</label>
                        <input value={topicName} onChange={e => setTopicName(e.target.value)} className="w-full p-3 border rounded-xl font-bold text-slate-700" placeholder="Ex: Oncologia" />
                     </div>
                     
                     {/* Preview of Selected */}
                     <div className="w-20 flex flex-col items-center">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1">Visual</label>
                        <div className="w-full h-[50px] bg-medical-50 rounded-xl border-2 border-medical-100 flex items-center justify-center text-3xl shadow-inner">
                            {topicIcon}
                        </div>
                     </div>

                     <button onClick={handleCreateTopic} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg h-[50px] flex items-center gap-2">
                        <span>➕</span> Criar
                     </button>
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 {topics.map(t => (
                     <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center group hover:border-red-200 transition-colors">
                         <div className="flex items-center gap-3">
                             <span className="text-2xl bg-slate-50 p-2 rounded-lg">{t.icon}</span>
                             <span className="font-bold text-slate-700">{t.name}</span>
                         </div>
                         <button onClick={() => onDeleteTopic(t.id)} className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             ✕
                         </button>
                     </div>
                 ))}
             </div>
         </div>
      )}
    </div>
  );
};

export default AdminPage;
