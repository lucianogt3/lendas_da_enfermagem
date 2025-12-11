import { Sticker, QuizQuestion, UserProfile, RANKS, StorePack, QuizTopic } from '../types';
import { INITIAL_STICKERS, INITIAL_QUESTIONS, INITIAL_TOPICS } from '../seedData';

/**
 * CONFIGURAÇÃO PARA MIGRAÇÃO FUTURA (FIREBASE/VERCEL):
 * ...
 */

const DB_KEYS = {
  USERS: 'prod_users_v2', 
  STICKERS: 'prod_stickers_v2', 
  QUESTIONS: 'prod_questions_v2', 
  PACKS: 'prod_packs_v2',
  TOPICS: 'prod_topics_v2', // New Key
  SESSION: 'prod_session_user_v2'
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const INITIAL_PACKS: StorePack[] = [
  {
    id: 'pack-starter',
    name: 'Pacote Inicial',
    description: 'Comece sua coleção aqui.',
    price: 50,
    stickersCount: 3,
    legendaryChance: 5,
    epicChance: 15,
    rareChance: 40,
    color: 'bg-blue-500'
  }
];

// --- DATABASE INITIALIZATION ---
const initDB = () => {
  if (!localStorage.getItem(DB_KEYS.STICKERS)) {
    localStorage.setItem(DB_KEYS.STICKERS, JSON.stringify(INITIAL_STICKERS));
  }
  if (!localStorage.getItem(DB_KEYS.QUESTIONS)) {
    localStorage.setItem(DB_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
  }
  if (!localStorage.getItem(DB_KEYS.PACKS)) {
    localStorage.setItem(DB_KEYS.PACKS, JSON.stringify(INITIAL_PACKS));
  }
  if (!localStorage.getItem(DB_KEYS.TOPICS)) {
    localStorage.setItem(DB_KEYS.TOPICS, JSON.stringify(INITIAL_TOPICS));
  }
  
  const usersRaw = localStorage.getItem(DB_KEYS.USERS);
  let users = usersRaw ? JSON.parse(usersRaw) : {};
  
  if (!users['admin@admin.com']) {
    users['admin@admin.com'] = {
      name: 'Administrador',
      email: 'admin@admin.com',
      password: '123', 
      profession: 'Gestão',
      avatar: '🛡️',
      level: 99,
      xp: 99999,
      rankTitle: 'Mestre do Sistema',
      coins: 99999,
      collectedStickers: [],
      answeredQuestions: []
    };
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  }
};

initDB();

// --- API METHODS ---

export const db = {
  // --- STICKERS ---
  getStickers: async (): Promise<Sticker[]> => {
    await delay(100);
    return JSON.parse(localStorage.getItem(DB_KEYS.STICKERS) || '[]');
  },

  addSticker: async (sticker: Sticker): Promise<void> => {
    await delay(300);
    const list = JSON.parse(localStorage.getItem(DB_KEYS.STICKERS) || '[]');
    list.push(sticker);
    localStorage.setItem(DB_KEYS.STICKERS, JSON.stringify(list));
  },

  updateSticker: async (sticker: Sticker): Promise<void> => {
    await delay(300);
    const list: Sticker[] = JSON.parse(localStorage.getItem(DB_KEYS.STICKERS) || '[]');
    const index = list.findIndex(s => s.id === sticker.id);
    if (index !== -1) {
        list[index] = sticker;
        localStorage.setItem(DB_KEYS.STICKERS, JSON.stringify(list));
    }
  },

  // --- QUESTIONS ---
  getQuestions: async (): Promise<QuizQuestion[]> => {
    await delay(100);
    return JSON.parse(localStorage.getItem(DB_KEYS.QUESTIONS) || '[]');
  },

  addQuestion: async (q: QuizQuestion): Promise<void> => {
    await delay(300);
    const list = JSON.parse(localStorage.getItem(DB_KEYS.QUESTIONS) || '[]');
    list.push(q);
    localStorage.setItem(DB_KEYS.QUESTIONS, JSON.stringify(list));
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await delay(200);
    const list: QuizQuestion[] = JSON.parse(localStorage.getItem(DB_KEYS.QUESTIONS) || '[]');
    const newList = list.filter(q => q.id !== id);
    localStorage.setItem(DB_KEYS.QUESTIONS, JSON.stringify(newList));
  },

  // --- TOPICS (NEW) ---
  getTopics: async (): Promise<QuizTopic[]> => {
    await delay(100);
    return JSON.parse(localStorage.getItem(DB_KEYS.TOPICS) || '[]');
  },

  addTopic: async (topic: QuizTopic): Promise<void> => {
    await delay(300);
    const list = JSON.parse(localStorage.getItem(DB_KEYS.TOPICS) || '[]');
    list.push(topic);
    localStorage.setItem(DB_KEYS.TOPICS, JSON.stringify(list));
  },

  deleteTopic: async (id: string): Promise<void> => {
    await delay(200);
    const list: QuizTopic[] = JSON.parse(localStorage.getItem(DB_KEYS.TOPICS) || '[]');
    const newList = list.filter(t => t.id !== id);
    localStorage.setItem(DB_KEYS.TOPICS, JSON.stringify(newList));
  },

  // --- STORE PACKS ---
  getPacks: async (): Promise<StorePack[]> => {
    await delay(100);
    return JSON.parse(localStorage.getItem(DB_KEYS.PACKS) || '[]');
  },

  addPack: async (pack: StorePack): Promise<void> => {
    await delay(300);
    const list = JSON.parse(localStorage.getItem(DB_KEYS.PACKS) || '[]');
    list.push(pack);
    localStorage.setItem(DB_KEYS.PACKS, JSON.stringify(list));
  },

  // --- AUTH & USER DATA ---
  login: async (email: string, password?: string): Promise<UserProfile | null> => {
    await delay(500);
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '{}');
    const user = users[email.toLowerCase()];
    
    if (user) {
        if (password && user.password !== password) {
            return null;
        }
        // Ensure legacy users have the new field
        if (!user.answeredQuestions) user.answeredQuestions = [];
        
        localStorage.setItem(DB_KEYS.SESSION, email.toLowerCase());
        return user;
    }
    return null;
  },

  register: async (data: { name: string; email: string; password?: string; profession: string; avatar: string }): Promise<UserProfile> => {
    await delay(800);
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '{}');
    const key = data.email.toLowerCase();
    
    if (users[key]) {
      throw new Error("Email já cadastrado!");
    }

    const newUser: UserProfile = {
      name: data.name,
      email: data.email,
      password: data.password,
      profession: data.profession,
      avatar: data.avatar,
      level: 1,
      xp: 0,
      rankTitle: RANKS[0].title,
      coins: 100,
      collectedStickers: [],
      answeredQuestions: []
    };

    users[key] = newUser;
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(DB_KEYS.SESSION, key);
    return newUser;
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    const email = localStorage.getItem(DB_KEYS.SESSION);
    if (!email) return null;
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '{}');
    const user = users[email];
    if (user && !user.answeredQuestions) user.answeredQuestions = [];
    return user || null;
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    await delay(400);
    const usersObj = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '{}');
    return Object.values(usersObj);
  },

  updateUser: async (user: UserProfile): Promise<void> => {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '{}');
    users[user.email.toLowerCase()] = user;
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(DB_KEYS.SESSION);
  }
};
