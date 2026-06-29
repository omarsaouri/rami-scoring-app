import * as SQLite from 'expo-sqlite';

export type GameVariant = 'simple' | '71' | '71_bla_joker';
export type JokerColor = 'red' | 'black';
export type GameStatus = 'active' | 'completed' | 'abandoned';

export interface Player {
  id: string;
  name: string;
  avatar: string | null;
  created_at: number;
}

export interface Game {
  id: string;
  status: GameStatus;
  variant: GameVariant;
  score_threshold: number;
  is_team_mode: boolean;
  custom_rules: string | null;
  created_at: number;
  completed_at: number | null;
  winner_id: string | null;
}

export interface GamePlayer {
  game_id: string;
  player_id: string;
  seat_order: number;
  team: number | null;
  is_eliminated: boolean;
  name: string;
}

export interface GameWithPlayers extends Game {
  players: GamePlayer[];
}

export interface Round {
  id: string;
  game_id: string;
  round_number: number;
  winner_id: string | null;
  joker_color: JokerColor | null;
  created_at: number;
}

export interface RoundScore {
  round_id: string;
  player_id: string;
  score: number;
  has_posed: boolean;
}

export interface RoundWithScores extends Round {
  scores: RoundScore[];
}

export interface PlayerScore {
  player_id: string;
  score: number;
  has_posed: boolean;
}

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDB(): Promise<void> {
  db = await SQLite.openDatabaseAsync('rami_score.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const versionRow = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    ['schema_version']
  );
  const currentVersion = versionRow ? parseInt(versionRow.value, 10) : 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL DEFAULT 'active',
        variant TEXT NOT NULL,
        score_threshold INTEGER NOT NULL DEFAULT 1001,
        is_team_mode INTEGER NOT NULL DEFAULT 0,
        custom_rules TEXT,
        created_at INTEGER NOT NULL,
        completed_at INTEGER,
        winner_id TEXT REFERENCES players(id)
      );

      CREATE TABLE IF NOT EXISTS game_players (
        game_id TEXT REFERENCES games(id),
        player_id TEXT REFERENCES players(id),
        seat_order INTEGER NOT NULL,
        team INTEGER,
        is_eliminated INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (game_id, player_id)
      );

      CREATE TABLE IF NOT EXISTS rounds (
        id TEXT PRIMARY KEY,
        game_id TEXT REFERENCES games(id),
        round_number INTEGER NOT NULL,
        winner_id TEXT REFERENCES players(id),
        joker_color TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS round_scores (
        round_id TEXT REFERENCES rounds(id),
        player_id TEXT REFERENCES players(id),
        score INTEGER NOT NULL,
        has_posed INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (round_id, player_id)
      );
    `);

    await db.runAsync(
      'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
      ['schema_version', '1']
    );
  }
}

function getDB(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('DB not initialized — call initDB() first');
  return db;
}

export async function createPlayer(name: string): Promise<Player> {
  const d = getDB();
  const player: Player = {
    id: uuid(),
    name: name.trim(),
    avatar: null,
    created_at: Date.now(),
  };
  await d.runAsync(
    'INSERT INTO players (id, name, avatar, created_at) VALUES (?, ?, ?, ?)',
    [player.id, player.name, player.avatar, player.created_at]
  );
  return player;
}

export async function getOrCreatePlayer(name: string): Promise<Player> {
  const d = getDB();
  const trimmed = name.trim();
  const existing = await d.getFirstAsync<Player>(
    'SELECT * FROM players WHERE name = ? COLLATE NOCASE LIMIT 1',
    [trimmed]
  );
  if (existing) return existing;
  return createPlayer(trimmed);
}

export interface CreateGameParams {
  variant: GameVariant;
  score_threshold: number;
  is_team_mode: boolean;
  players: Array<{ name: string; team?: number }>;
  custom_rules?: string;
}

export async function createGame(params: CreateGameParams): Promise<GameWithPlayers> {
  const d = getDB();
  const gameId = uuid();
  const now = Date.now();

  await d.runAsync(
    `INSERT INTO games (id, status, variant, score_threshold, is_team_mode, custom_rules, created_at)
     VALUES (?, 'active', ?, ?, ?, ?, ?)`,
    [
      gameId,
      params.variant,
      params.score_threshold,
      params.is_team_mode ? 1 : 0,
      params.custom_rules ?? null,
      now,
    ]
  );

  const gamePlayers: GamePlayer[] = [];
  for (let i = 0; i < params.players.length; i++) {
    const p = params.players[i];
    const player = await getOrCreatePlayer(p.name);
    const team = p.team ?? null;
    await d.runAsync(
      'INSERT INTO game_players (game_id, player_id, seat_order, team, is_eliminated) VALUES (?, ?, ?, ?, 0)',
      [gameId, player.id, i, team]
    );
    gamePlayers.push({
      game_id: gameId,
      player_id: player.id,
      seat_order: i,
      team,
      is_eliminated: false,
      name: player.name,
    });
  }

  return {
    id: gameId,
    status: 'active',
    variant: params.variant,
    score_threshold: params.score_threshold,
    is_team_mode: params.is_team_mode,
    custom_rules: params.custom_rules ?? null,
    created_at: now,
    completed_at: null,
    winner_id: null,
    players: gamePlayers,
  };
}

async function loadGamePlayers(gameId: string): Promise<GamePlayer[]> {
  const d = getDB();
  const rows = await d.getAllAsync<{
    game_id: string;
    player_id: string;
    seat_order: number;
    team: number | null;
    is_eliminated: number;
    name: string;
  }>(
    `SELECT gp.*, p.name FROM game_players gp
     JOIN players p ON p.id = gp.player_id
     WHERE gp.game_id = ?
     ORDER BY gp.seat_order`,
    [gameId]
  );
  return rows.map((r) => ({
    game_id: r.game_id,
    player_id: r.player_id,
    seat_order: r.seat_order,
    team: r.team,
    is_eliminated: r.is_eliminated === 1,
    name: r.name,
  }));
}

function mapGameRow(r: {
  id: string;
  status: string;
  variant: string;
  score_threshold: number;
  is_team_mode: number;
  custom_rules: string | null;
  created_at: number;
  completed_at: number | null;
  winner_id: string | null;
}): Game {
  return {
    id: r.id,
    status: r.status as GameStatus,
    variant: r.variant as GameVariant,
    score_threshold: r.score_threshold,
    is_team_mode: r.is_team_mode === 1,
    custom_rules: r.custom_rules,
    created_at: r.created_at,
    completed_at: r.completed_at,
    winner_id: r.winner_id,
  };
}

export async function getActiveGame(): Promise<GameWithPlayers | null> {
  const d = getDB();
  const row = await d.getFirstAsync<{
    id: string;
    status: string;
    variant: string;
    score_threshold: number;
    is_team_mode: number;
    custom_rules: string | null;
    created_at: number;
    completed_at: number | null;
    winner_id: string | null;
  }>('SELECT * FROM games WHERE status = ? ORDER BY created_at DESC LIMIT 1', ['active']);
  if (!row) return null;
  const game = mapGameRow(row);
  const players = await loadGamePlayers(game.id);
  return { ...game, players };
}

export async function getGame(id: string): Promise<GameWithPlayers | null> {
  const d = getDB();
  const row = await d.getFirstAsync<{
    id: string;
    status: string;
    variant: string;
    score_threshold: number;
    is_team_mode: number;
    custom_rules: string | null;
    created_at: number;
    completed_at: number | null;
    winner_id: string | null;
  }>('SELECT * FROM games WHERE id = ?', [id]);
  if (!row) return null;
  const game = mapGameRow(row);
  const players = await loadGamePlayers(game.id);
  return { ...game, players };
}

export async function listGames(): Promise<GameWithPlayers[]> {
  const d = getDB();
  const rows = await d.getAllAsync<{
    id: string;
    status: string;
    variant: string;
    score_threshold: number;
    is_team_mode: number;
    custom_rules: string | null;
    created_at: number;
    completed_at: number | null;
    winner_id: string | null;
  }>('SELECT * FROM games ORDER BY created_at DESC');
  const games: GameWithPlayers[] = [];
  for (const row of rows) {
    const game = mapGameRow(row);
    const players = await loadGamePlayers(game.id);
    games.push({ ...game, players });
  }
  return games;
}

export async function addRound(
  gameId: string,
  winnerId: string | null,
  jokerColor: JokerColor | null,
  scores: PlayerScore[]
): Promise<Round> {
  const d = getDB();
  const roundId = uuid();
  const now = Date.now();

  const countRow = await d.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM rounds WHERE game_id = ?',
    [gameId]
  );
  const roundNumber = (countRow?.cnt ?? 0) + 1;

  await d.runAsync(
    'INSERT INTO rounds (id, game_id, round_number, winner_id, joker_color, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [roundId, gameId, roundNumber, winnerId, jokerColor, now]
  );

  for (const s of scores) {
    await d.runAsync(
      'INSERT INTO round_scores (round_id, player_id, score, has_posed) VALUES (?, ?, ?, ?)',
      [roundId, s.player_id, s.score, s.has_posed ? 1 : 0]
    );
  }

  return { id: roundId, game_id: gameId, round_number: roundNumber, winner_id: winnerId, joker_color: jokerColor, created_at: now };
}

export async function getRounds(gameId: string): Promise<RoundWithScores[]> {
  const d = getDB();
  const rounds = await d.getAllAsync<{
    id: string;
    game_id: string;
    round_number: number;
    winner_id: string | null;
    joker_color: string | null;
    created_at: number;
  }>('SELECT * FROM rounds WHERE game_id = ? ORDER BY round_number', [gameId]);

  const result: RoundWithScores[] = [];
  for (const r of rounds) {
    const scoreRows = await d.getAllAsync<{
      round_id: string;
      player_id: string;
      score: number;
      has_posed: number;
    }>('SELECT * FROM round_scores WHERE round_id = ?', [r.id]);
    result.push({
      id: r.id,
      game_id: r.game_id,
      round_number: r.round_number,
      winner_id: r.winner_id,
      joker_color: r.joker_color as JokerColor | null,
      created_at: r.created_at,
      scores: scoreRows.map((s) => ({
        round_id: s.round_id,
        player_id: s.player_id,
        score: s.score,
        has_posed: s.has_posed === 1,
      })),
    });
  }
  return result;
}

export async function completeGame(gameId: string, winnerId: string): Promise<void> {
  const d = getDB();
  await d.runAsync(
    "UPDATE games SET status = 'completed', completed_at = ?, winner_id = ? WHERE id = ?",
    [Date.now(), winnerId, gameId]
  );
}

export async function abandonGame(gameId: string): Promise<void> {
  const d = getDB();
  await d.runAsync(
    "UPDATE games SET status = 'abandoned' WHERE id = ?",
    [gameId]
  );
}
