export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  }
  
  export interface LoginResponse {
    accessToken: string;
    user: AuthUser;
  }
  
  export interface Cartoon {
    id: string;
    title: string;
    slug: string;
    description: string;
    rating: number;
    posterUrl: string;
    year: number;
    genres: string[];
    isPublished: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Season {
    id: string;
    cartoonId: string;
    number: number;
    title: string;
    description?: string;
    posterUrl?: string;
  }
  
  export interface Episode {
    id: string;
    seasonId: string;
    cartoonId: string;
    number: number;
    title: string;
    description?: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: number;
    isPublished: boolean;
    voiceoverIds: Voiceover[];
  }
  
  export interface Voiceover {
    id: string;
    name: string;
    language: string;
    studio?: string;
  }
  
  export interface NewsItem {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverUrl: string;
    isPublished: boolean;
    publishedAt?: string;
    createdAt?: string;
  }
  
  export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export type ThemeMode = 'light' | 'dark';