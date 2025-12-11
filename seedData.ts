// services/database.ts
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "./firebase";
import {
  Sticker,
  QuizQuestion,
  UserProfile,
  RANKS,
  StorePack,
  QuizTopic,
} from "../types";
import { INITIAL_TOPICS } from "../seedData";

// chave de sessão no localStorage (só pra guardar o email logado)
const SESSION_KEY = "lendas_session_email";

// Coleções do Firestore
const COLL = {
  STICKERS: "stickers",
  QUESTIONS: "questions",
  TOPICS: "topics",
  PACKS: "packs",
  USERS: "users",
};

// Pequeno helper pra mapear docs → objeto
const mapDocs = <T>(snap: any): T[] =>
  snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as T) }));

// Garante que os tópicos iniciais existem no Firestore
const ensureTopicsSeed = async () => {
  const snap = await getDocs(collection(firestore, COLL.TOPICS));
  if (!snap.empty) return;

  for (const topic of INITIAL_TOPICS) {
    await setDoc(doc(firestore, COLL.TOPICS, topic.id), topic);
  }
};

export const db = {
  // --- STICKERS ---

  getStickers: async (): Promise<Sticker[]> => {
    const snap = await getDocs(collection(firestore, COLL.STICKERS));
    return mapDocs<Sticker>(snap);
  },

  addSticker: async (sticker: Sticker): Promise<void> => {
    // usa o id da figurinha como id do documento
    await setDoc(doc(firestore, COLL.STICKERS, sticker.id), sticker);
  },

  updateSticker: async (sticker: Sticker): Promise<void> => {
    await setDoc(doc(firestore, COLL.STICKERS, sticker.id), sticker, {
      merge: true,
    });
  },

  // --- QUESTIONS ---

  getQuestions: async (): Promise<QuizQuestion[]> => {
    const snap = await getDocs(collection(firestore, COLL.QUESTIONS));
    return mapDocs<QuizQuestion>(snap);
  },

  addQuestion: async (q: QuizQuestion): Promise<void> => {
    await setDoc(doc(firestore, COLL.QUESTIONS, q.id), q);
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await deleteDoc(doc(firestore, COLL.QUESTIONS, id));
  },

  // --- TOPICS ---

  getTopics: async (): Promise<QuizTopic[]> => {
    await ensureTopicsSeed();
    const snap = await getDocs(collection(firestore, COLL.TOPICS));
    return mapDocs<QuizTopic>(snap);
  },

  addTopic: async (topic: QuizTopic): Promise<void> => {
    await setDoc(doc(firestore, COLL.TOPICS, topic.id), topic);
  },

  deleteTopic: async (id: string): Promise<void> => {
    await deleteDoc(doc(firestore, COLL.TOPICS, id));
  },

  // --- STORE PACKS ---

  getPacks: async (): Promise<StorePack[]> => {
    const snap = await getDocs(collection(firestore, COLL.PACKS));
    const packs = mapDocs<StorePack>(snap);

    // se não tiver nenhum pacote ainda, você pode criar 1 default aqui em código:
    if (packs.length === 0) {
      const defaultPack: StorePack = {
        id: "pack-starter",
        name: "Pacote Inicial",
        description: "Comece sua coleção aqui.",
        price: 50,
        stickersCount: 3,
        legendaryChance: 5,
        epicChance: 15,
        rareChance: 40,
        color: "bg-blue-500",
      };
      await setDoc(doc(firestore, COLL.PACKS, defaultPack.id), defaultPack);
      return [defaultPack];
    }

    return packs;
  },

  addPack: async (pack: StorePack): Promise<void> => {
    await setDoc(doc(firestore, COLL.PACKS, pack.id), pack);
  },

  // --- AUTH & USER DATA ---

  login: async (email: string, password?: string): Promise<UserProfile | null> => {
    const key = email.toLowerCase();
    const ref = doc(firestore, COLL.USERS, key);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const user = snap.data() as UserProfile & { password?: string };

    if (password && user.password && user.password !== password) {
      return null;
    }

    if (!user.answeredQuestions) user.answeredQuestions = [];

    // salva sessão local
    localStorage.setItem(SESSION_KEY, key);

    return user;
  },

  register: async (data: {
    name: string;
    email: string;
    password?: string;
    profession: string;
    avatar: string;
  }): Promise<UserProfile> => {
    const key = data.email.toLowerCase();
    const ref = doc(firestore, COLL.USERS, key);
    const snap = await getDoc(ref);

    if (snap.exists()) {
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
      answeredQuestions: [],
    };

    await setDoc(ref, newUser);
    localStorage.setItem(SESSION_KEY, key);

    return newUser;
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;

    const ref = doc(firestore, COLL.USERS, email);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const user = snap.data() as UserProfile;
    if (!user.answeredQuestions) user.answeredQuestions = [];

    return user;
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    const snap = await getDocs(collection(firestore, COLL.USERS));
    return mapDocs<UserProfile>(snap);
  },

  updateUser: async (user: UserProfile): Promise<void> => {
    const key = user.email.toLowerCase();
    await setDoc(doc(firestore, COLL.USERS, key), user, { merge: true });
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
  },
};
