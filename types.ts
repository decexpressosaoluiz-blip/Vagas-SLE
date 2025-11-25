export enum VisualStyle {
  CORPORATIVO = 'CORPORATIVO',
  MODERNO = 'MODERNO',
  IMPACTO = 'IMPACTO',
  MINIMALISTA = 'MINIMALISTA',
  CLEAN = 'CLEAN',
  BOLD = 'BOLD',
  CRIATIVO = 'CRIATIVO',
}

export type FormatType = 'SQUARE' | 'PORTRAIT' | 'STORY';

export type FontPairing = 'MODERN' | 'EDITORIAL' | 'TECH' | 'BOLD' | 'CLASSIC';

export interface ImagePosition {
  x: number;
  y: number;
  scale: number;
}

export interface JobData {
  title: string;
  companyName: string; 
  salary: string;
  schedule: string;
  workModel: string;
  location: string;
  description: {
    activities: string;
    requirements: string;
    benefits: string;
  };
  contact: {
    email: string;
    whatsapp: string;
    website: string;
  };
  selectedDays: string[];
  colors: {
    primary: string;      // Principal (Theme)
    accent: string;       // Destaque (Highlights)
    title: string;        // Título (Headings)
    text: string;         // Texto (Body)
    canvas: string;       // Fundo (Solid Background)
    icons: string;        // Ícones (SVG Icons)
    designElements: string; // Borders/Lines
  };
  generatedPalette: string[]; 
  fontPairing: FontPairing;
  images: {
    logo: string | null;
    hero: string | null;
    background: string | null; // Texture Overlay
  };
  heroPosition: ImagePosition;
  bgOpacity: number;
  fontScale: {
    title: number;
    details: number;
    activities: number;
    requirements: number;
  };
}

export const DAYS_OF_WEEK = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const DEFAULT_JOB_DATA: JobData = {
  title: "Designer Senior UI/UX",
  companyName: "TechVision",
  salary: "R$ 8.000 - R$ 12.000",
  schedule: "09:00 às 18:00",
  workModel: "100% Remoto",
  location: "São Paulo, SP",
  description: {
    activities: "Desenhar interfaces incríveis e sistemas de design escaláveis. Prototipação em alta fidelidade.",
    requirements: "Experiência com Figma, React e Design Systems. Inglês avançado é um diferencial.",
    benefits: "VR, VA, Plano de Saúde, Gympass.",
  },
  contact: {
    email: "vagas@techvision.com",
    whatsapp: "(11) 99999-9999",
    website: "techvision.com/careers",
  },
  selectedDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
  colors: {
    primary: '#0F172A',
    accent: '#3B82F6',
    title: '#0F172A',
    text: '#334155',
    canvas: '#FFFFFF',
    icons: '#3B82F6',
    designElements: '#E2E8F0',
  },
  generatedPalette: [],
  fontPairing: 'MODERN',
  images: {
    logo: null,
    hero: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
    background: null,
  },
  heroPosition: { x: 0, y: 0, scale: 1 },
  bgOpacity: 0.1,
  fontScale: {
    title: 1,
    details: 1,
    activities: 1,
    requirements: 1,
  }
};