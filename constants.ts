import { Sticker, Rarity } from './types';

// Seed data in case Gemini isn't used immediately
export const INITIAL_STICKERS: Sticker[] = [
  {
    id: '1',
    name: 'Estetoscópio Dourado',
    description: 'A ferramenta essencial para ouvir o coração da vida.',
    imageUrl: 'https://picsum.photos/id/10/300/300', // Placeholder
    rarity: Rarity.COMMON,
    category: 'Instrumentos',
  },
  {
    id: '2',
    name: 'Florence Nightingale',
    description: 'A dama da lâmpada, pioneira da enfermagem moderna.',
    imageUrl: 'https://picsum.photos/id/65/300/300',
    rarity: Rarity.LEGENDARY,
    category: 'História',
  },
  {
    id: '3',
    name: 'Seringa de Precisão',
    description: 'Administração correta, paciente seguro.',
    imageUrl: 'https://picsum.photos/id/96/300/300',
    rarity: Rarity.COMMON,
    category: 'Instrumentos',
  },
  {
    id: '4',
    name: 'Anatomia Cardíaca',
    description: 'O motor do corpo humano em detalhes.',
    imageUrl: 'https://picsum.photos/id/102/300/300',
    rarity: Rarity.RARE,
    category: 'Anatomia',
  },
];

export const TOPICS = [
  'Sepse',
  'AVC (Acidente Vascular Cerebral)',
  'ITU (Infecção Trato Urinário)',
  'IPCS (Infecção Primária)',
  'UTI e Terapia Intensiva',
  'Humanização',
  'Cuidados Paliativos',
  'Farmacologia',
  'Anatomia e Fisiologia',
  'Ética e Legislação',
  'Urgência e Emergência',
];
