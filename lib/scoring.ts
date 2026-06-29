import type { GameVariant } from './db';
import type { CustomRules } from './rules';

export type { GameVariant };

export interface PlayerRoundInput {
  playerId: string;
  hasPosed: boolean;
  cardTotal: number;
  isWinner: boolean;
  tookOpponentCard?: boolean;
}

export interface TeamConfig {
  team1: string[];
  team2: string[];
}

export type RoundScores = Record<string, number>;
export type CumulativeScores = Record<string, number>;

export function computeRoundScores(
  inputs: PlayerRoundInput[],
  _variant: GameVariant,
  teamConfig: TeamConfig | null,
  customRules: CustomRules
): RoundScores {
  const scores: RoundScores = {};

  for (const input of inputs) {
    if (input.isWinner) {
      const bonus = customRules.winnerBonus && !input.tookOpponentCard ? -20 : 0;
      scores[input.playerId] = bonus;
    } else if (!input.hasPosed) {
      scores[input.playerId] = 100;
    } else {
      scores[input.playerId] = input.cardTotal;
    }
  }

  if (teamConfig) {
    const applyTeamPenalty = (members: string[]) => {
      const allDidntPose = members.every((id) => {
        const inp = inputs.find((i) => i.playerId === id);
        return inp && !inp.hasPosed && !inp.isWinner;
      });
      if (allDidntPose) {
        for (const id of members) {
          scores[id] = 200;
        }
      }
    };
    applyTeamPenalty(teamConfig.team1);
    applyTeamPenalty(teamConfig.team2);
  }

  return scores;
}

export function buildCumulativeScores(
  rounds: Array<{ scores: Array<{ player_id: string; score: number }> }>
): CumulativeScores {
  const cum: CumulativeScores = {};
  for (const round of rounds) {
    for (const s of round.scores) {
      cum[s.player_id] = (cum[s.player_id] ?? 0) + s.score;
    }
  }
  return cum;
}

export function isGameOver(
  cumScores: CumulativeScores,
  threshold: number
): { over: boolean; loser: string | null } {
  for (const [playerId, score] of Object.entries(cumScores)) {
    if (score >= threshold) {
      return { over: true, loser: playerId };
    }
  }
  return { over: false, loser: null };
}

export function getWinner(cumScores: CumulativeScores): string | null {
  const entries = Object.entries(cumScores);
  if (entries.length === 0) return null;
  return entries.reduce((a, b) => (a[1] <= b[1] ? a : b))[0];
}
