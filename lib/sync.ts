import { getDB } from './db';
import { supabase } from './supabase';

let cachedUserId: string | null = null;

export async function ensureSession(): Promise<string> {
  if (cachedUserId) return cachedUserId;

  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    cachedUserId = session.user.id;
    return cachedUserId;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    throw error ?? new Error('Anonymous sign-in returned no user');
  }
  cachedUserId = data.user.id;
  return cachedUserId;
}

interface SyncTable {
  name: string;
  idColumns: string[];
  onConflict?: string;
  mapRow: (row: any) => Record<string, unknown>;
}

const TABLES: SyncTable[] = [
  {
    name: 'players',
    idColumns: ['id'],
    mapRow: (r) => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar,
      created_at: r.created_at,
    }),
  },
  {
    name: 'games',
    idColumns: ['id'],
    mapRow: (r) => ({
      id: r.id,
      status: r.status,
      variant: r.variant,
      score_threshold: r.score_threshold,
      is_team_mode: r.is_team_mode === 1,
      custom_rules: r.custom_rules,
      created_at: r.created_at,
      completed_at: r.completed_at,
      winner_id: r.winner_id,
    }),
  },
  {
    name: 'game_players',
    idColumns: ['game_id', 'player_id'],
    onConflict: 'game_id,player_id',
    mapRow: (r) => ({
      game_id: r.game_id,
      player_id: r.player_id,
      seat_order: r.seat_order,
      team: r.team,
      is_eliminated: r.is_eliminated === 1,
    }),
  },
  {
    name: 'rounds',
    idColumns: ['id'],
    mapRow: (r) => ({
      id: r.id,
      game_id: r.game_id,
      round_number: r.round_number,
      winner_id: r.winner_id,
      joker_color: r.joker_color,
      created_at: r.created_at,
    }),
  },
  {
    name: 'round_scores',
    idColumns: ['round_id', 'player_id'],
    onConflict: 'round_id,player_id',
    mapRow: (r) => ({
      round_id: r.round_id,
      player_id: r.player_id,
      score: r.score,
      has_posed: r.has_posed === 1,
    }),
  },
];

export async function syncPending(): Promise<void> {
  let userId: string;
  try {
    userId = await ensureSession();
  } catch (e) {
    console.warn('[sync] no session, skipping this pass', e);
    return;
  }

  const d = getDB();

  for (const table of TABLES) {
    try {
      const rows = await d.getAllAsync<any>(
        `SELECT * FROM ${table.name} WHERE synced_at IS NULL`
      );
      if (rows.length === 0) continue;

      const payload = rows.map((r) => ({ ...table.mapRow(r), user_id: userId }));
      const { error } = await supabase
        .from(table.name)
        .upsert(payload, table.onConflict ? { onConflict: table.onConflict } : undefined);
      if (error) throw error;

      const now = Date.now();
      for (const r of rows) {
        const where = table.idColumns.map((c) => `${c} = ?`).join(' AND ');
        const values = table.idColumns.map((c) => r[c]);
        await d.runAsync(
          `UPDATE ${table.name} SET synced_at = ? WHERE ${where}`,
          [now, ...values]
        );
      }
    } catch (e) {
      console.warn(`[sync] failed to push ${table.name}`, e);
    }
  }
}
