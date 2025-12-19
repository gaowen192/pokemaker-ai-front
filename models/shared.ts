
import { ElementType } from './enums';

export interface Attack {
  id: string;
  name: string;
  cost: ElementType[];
  damage: string;
  description: string;
  sortOrder: number;
}

export interface User {
    email?: string;
    name: string;
    userId?: number;
    username?: string;
    realName?: string | null;
    avatar?: string | null;
    role?: string | null;
    accessToken?: string;
    tokenExpireTime?: string;
    status?: string | null;
    userType?: string | null;
    created?: string;
    coins?: number;
    lastDailyDraw?: string;
    free_generations_left?: number;
    total_generations?: number;
    last_generation_time?: string;
    level?: number;
    exp?: number;
    gamesPlayed?: number;
    gamesWon?: number;
    winRate?: number;
    rankScore?: number;
    currentStreak?: number;
    bestStreak?: number;
    isAdmin?: boolean;
    remainFreeCount?: number;
    freeGenerationsLeft?: number | null;
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}
