
export enum Rarity {
  COMMON = 'Comum',
  RARE = 'Rara',
  EPIC = 'Épica',
  LEGENDARY = 'Lendária',
}

export interface Sticker {
  id: string;
  name: string;
  description: string;
  imageUrl: string; // URL or Base64
  rarity: Rarity;
  category: string;
  isAnimated?: boolean; // New: Moving sticker support
}

export interface UserProfile {
  name: string;
  email: string;
  password?: string; // New: Password field
  profession: string;
  avatar: string; // Emoji or URL
  level: number;
  xp: number;
  rankTitle: string;
  coins: number;
  collectedStickers: string[]; // List of IDs
  answeredQuestions: string[]; // New: Track answered question IDs
}

export interface StorePack {
  id: string;
  name: string;
  description: string;
  price: number;
  stickersCount: number;
  // Probabilities (0-100)
  legendaryChance: number;
  epicChance: number;
  rareChance: number;
  color: string; // css class or hex
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  topic: string;
}

export interface QuizTopic {
  id: string;
  name: string;
  icon: string; // Emoji
}

export const RANKS = [
  { level: 1, title: 'Aspirante do Cuidado', minXp: 0, reward: 'Desbloqueio do App' },
  { level: 2, title: 'Guardião da Saúde', minXp: 500, reward: '+50 Moedas' },
  { level: 3, title: 'Mestre do Alívio', minXp: 1500, reward: 'Acesso a perguntas Médias' },
  { level: 4, title: 'Lenda da Enfermagem', minXp: 3000, reward: 'Borda Dourada no Perfil' },
  { level: 5, title: 'Divindade do Plantão', minXp: 5000, reward: 'Pacotes Lendários na Loja' },
  { level: 6, title: 'Imortal da Medicina', minXp: 10000, reward: 'Avatar Animado' },
];
