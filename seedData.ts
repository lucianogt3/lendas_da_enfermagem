
import { Sticker, QuizQuestion, Rarity, QuizTopic } from './types';

// --- CLEAN SLATE FOR PRODUCTION ---

export const INITIAL_TOPICS: QuizTopic[] = [
  { id: 't1', name: 'Farmacologia', icon: '💊' },
  { id: 't2', name: 'Anatomia e Fisiologia', icon: '🫀' },
  { id: 't3', name: 'Ética e Legislação', icon: '⚖️' },
  { id: 't4', name: 'Urgência e Emergência', icon: '🚑' },
  { id: 't5', name: 'Saúde Pública', icon: '🌍' },
  { id: 't6', name: 'Centro Cirúrgico', icon: '😷' },
  { id: 't7', name: 'Humanização', icon: '🤝' },
];

export const INITIAL_QUESTIONS: QuizQuestion[] = [
  {
    id: 'welcome-q1',
    topic: 'Humanização',
    difficulty: 'Fácil',
    question: 'Bem-vindo ao Lendas da Enfermagem! Qual é o principal objetivo deste app?',
    options: [
       'Aprender brincando e colecionar conquistas',
       'Apenas passar o tempo',
       'Decorar textos longos',
       'Nenhuma das anteriores'
    ],
    correctIndex: 0,
    explanation: 'O app une gamificação e ensino para tornar o aprendizado da enfermagem envolvente.'
  }
];

export const INITIAL_STICKERS: Sticker[] = [
  {
    id: '1',
    name: 'Bem-vindo(a)!',
    description: 'Sua primeira figurinha. O início da sua jornada lendária.',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png', 
    rarity: Rarity.COMMON,
    category: 'Geral',
    isAnimated: false
  },
  {
    id: '2',
    name: 'Batimentos Cardíacos',
    description: 'Sinal vital essencial para a vida.',
    imageUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDNqZXZ4Zmd6a3Uxdnh6ZmR6a3Uxdnh6ZmR6a3Uxdnh6ZmR6a3UxdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjeiVyM/giphy.gif',
    rarity: Rarity.EPIC,
    category: 'Anatomia e Fisiologia',
    isAnimated: true
  }
];

export const CURIOSITIES = [
  "A sepse é a principal causa de morte nas UTIs não cardiológicas.",
  "O tempo é cérebro: cada minuto em um AVC não tratado perde milhões de neurônios.",
  "A higienização das mãos é a medida mais simples e eficaz contra IPCS.",
  "Cicely Saunders fundou o movimento moderno de Cuidados Paliativos em 1967.",
  "A humanização na UTI reduz o tempo de internação e melhora o pós-alta.",
  "A Florence Nightingale reduziu a mortalidade de 42% para 2% na Guerra da Crimeia.",
];
