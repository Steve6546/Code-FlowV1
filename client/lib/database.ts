import * as SQLite from "expo-sqlite";

export type ContentType = "text" | "voice" | "photo" | "link" | "screenshot";

export interface Memory {
  id: number;
  content: string;
  contentType: ContentType;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  audioUri?: string;
  imageUri?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkPreview?: string;
  focusTags?: string;
  viewCount: number;
  lastViewedAt?: string;
}

export interface FocusGoal {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserPreferences {
  id: number;
  displayName: string;
  avatarIndex: number;
  themeMode: "light" | "dark" | "auto";
  locationEnabled: boolean;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync("thakira.db");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      contentType TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      locationName TEXT,
      audioUri TEXT,
      imageUri TEXT,
      linkUrl TEXT,
      linkTitle TEXT,
      linkPreview TEXT,
      focusTags TEXT,
      viewCount INTEGER DEFAULT 0,
      lastViewedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS focus_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      isActive INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      displayName TEXT DEFAULT 'User',
      avatarIndex INTEGER DEFAULT 0,
      themeMode TEXT DEFAULT 'auto',
      locationEnabled INTEGER DEFAULT 0
    );

    INSERT OR IGNORE INTO user_preferences (id) VALUES (1);
  `);
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    await initDatabase();
  }
  return db!;
}

export async function addMemory(
  memory: Omit<Memory, "id" | "viewCount" | "lastViewedAt">
): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO memories (content, contentType, createdAt, latitude, longitude, locationName, audioUri, imageUri, linkUrl, linkTitle, linkPreview, focusTags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      memory.content,
      memory.contentType,
      memory.createdAt,
      memory.latitude ?? null,
      memory.longitude ?? null,
      memory.locationName ?? null,
      memory.audioUri ?? null,
      memory.imageUri ?? null,
      memory.linkUrl ?? null,
      memory.linkTitle ?? null,
      memory.linkPreview ?? null,
      memory.focusTags ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function getAllMemories(): Promise<Memory[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Memory>(
    "SELECT * FROM memories ORDER BY createdAt DESC"
  );
  return rows;
}

export async function getMemoriesByType(type: ContentType): Promise<Memory[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Memory>(
    "SELECT * FROM memories WHERE contentType = ? ORDER BY createdAt DESC",
    [type]
  );
  return rows;
}

export async function getMemoriesByDateRange(
  startDate: string,
  endDate: string
): Promise<Memory[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Memory>(
    "SELECT * FROM memories WHERE createdAt >= ? AND createdAt <= ? ORDER BY createdAt DESC",
    [startDate, endDate]
  );
  return rows;
}

export async function getRecentMemories(limit: number = 10): Promise<Memory[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Memory>(
    "SELECT * FROM memories ORDER BY createdAt DESC LIMIT ?",
    [limit]
  );
  return rows;
}

export async function updateMemory(
  id: number,
  updates: Partial<Memory>
): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== "id") {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length > 0) {
    values.push(id);
    await database.runAsync(
      `UPDATE memories SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
  }
}

export async function deleteMemory(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM memories WHERE id = ?", [id]);
}

export async function incrementViewCount(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE memories SET viewCount = viewCount + 1, lastViewedAt = ? WHERE id = ?",
    [new Date().toISOString(), id]
  );
}

export async function getFocusGoals(): Promise<FocusGoal[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<FocusGoal>(
    "SELECT * FROM focus_goals ORDER BY createdAt DESC"
  );
  return rows;
}

export async function addFocusGoal(name: string): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    "INSERT INTO focus_goals (name, createdAt) VALUES (?, ?)",
    [name, new Date().toISOString()]
  );
  return result.lastInsertRowId;
}

export async function setActiveFocusGoal(id: number | null): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("UPDATE focus_goals SET isActive = 0");
  if (id !== null) {
    await database.runAsync(
      "UPDATE focus_goals SET isActive = 1 WHERE id = ?",
      [id]
    );
  }
}

export async function deleteFocusGoal(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM focus_goals WHERE id = ?", [id]);
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<UserPreferences>(
    "SELECT * FROM user_preferences WHERE id = 1"
  );
  return row || {
    id: 1,
    displayName: "User",
    avatarIndex: 0,
    themeMode: "auto",
    locationEnabled: false,
  };
}

export async function updateUserPreferences(
  updates: Partial<UserPreferences>
): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== "id") {
      fields.push(`${key} = ?`);
      values.push(typeof value === "boolean" ? (value ? 1 : 0) : value);
    }
  });

  if (fields.length > 0) {
    await database.runAsync(
      `UPDATE user_preferences SET ${fields.join(", ")} WHERE id = 1`,
      values
    );
  }
}

export async function getMemoryCount(): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM memories"
  );
  return result?.count ?? 0;
}

export async function getTodayMemoryCount(): Promise<number> {
  const database = await getDatabase();
  const today = new Date().toISOString().split("T")[0];
  const result = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM memories WHERE date(createdAt) = ?",
    [today]
  );
  return result?.count ?? 0;
}

export async function getMorningMemories(): Promise<Memory[]> {
  const database = await getDatabase();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  
  const rows = await database.getAllAsync<Memory>(
    "SELECT * FROM memories WHERE date(createdAt) = ? ORDER BY createdAt DESC LIMIT 5",
    [yesterdayStr]
  );
  return rows;
}

export async function getFrequentlyViewedMemories(): Promise<Memory[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Memory>(
    "SELECT * FROM memories WHERE viewCount > 0 ORDER BY viewCount DESC LIMIT 5"
  );
  return rows;
}
