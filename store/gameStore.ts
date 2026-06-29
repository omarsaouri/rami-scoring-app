import { create } from 'zustand';
import type { GameWithPlayers, RoundWithScores } from '@/lib/db';

interface GameStore {
  activeGame: GameWithPlayers | null;
  rounds: RoundWithScores[];
  setActiveGame: (game: GameWithPlayers | null) => void;
  setRounds: (rounds: RoundWithScores[]) => void;
  clearGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  activeGame: null,
  rounds: [],
  setActiveGame: (game) => set({ activeGame: game }),
  setRounds: (rounds) => set({ rounds }),
  clearGame: () => set({ activeGame: null, rounds: [] }),
}));
