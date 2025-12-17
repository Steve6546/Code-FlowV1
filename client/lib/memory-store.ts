import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { nanoid } from "nanoid/non-secure";

export type MemoryType = "text" | "voice" | "photo" | "link" | "screenshot";

export type MemoryItem = {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  createdAt: string;
  location?: string;
  tags?: string[];
  metadata?: {
    durationSec?: number;
    uri?: string;
    thumbnailUri?: string;
  };
};

type MemoryState = {
  items: MemoryItem[];
  focusGoal: string | null;
};

type Action =
  | { type: "set_state"; payload: MemoryState }
  | { type: "add_item"; payload: MemoryItem }
  | { type: "set_focus"; payload: string | null };

type MemoryContextValue = {
  items: MemoryItem[];
  focusGoal: string | null;
  addMemory: (input: Omit<MemoryItem, "id" | "createdAt">) => void;
  setFocusGoal: (goal: string | null) => void;
};

const STORAGE_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}memory-store.json`
  : null;

const initialState: MemoryState = {
  items: [],
  focusGoal: null,
};

const MemoryContext = createContext<MemoryContextValue | undefined>(undefined);

function reducer(state: MemoryState, action: Action): MemoryState {
  switch (action.type) {
    case "set_state":
      return action.payload;
    case "add_item":
      return { ...state, items: [action.payload, ...state.items] };
    case "set_focus":
      return { ...state, focusGoal: action.payload };
    default:
      return state;
  }
}

async function loadFromDisk(): Promise<MemoryState | null> {
  if (!STORAGE_URI) return null;
  try {
    const file = await FileSystem.getInfoAsync(STORAGE_URI);
    if (!file.exists) return null;

    const data = await FileSystem.readAsStringAsync(STORAGE_URI);
    const parsed = JSON.parse(data) as MemoryState;
    return parsed;
  } catch (error) {
    console.warn("Failed to load memory store:", error);
    return null;
  }
}

async function persistToDisk(state: MemoryState) {
  if (!STORAGE_URI) return;
  try {
    await FileSystem.writeAsStringAsync(STORAGE_URI, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist memory store:", error);
  }
}

function seedMemories(): MemoryItem[] {
  const now = Date.now();
  return [
    {
      id: nanoid(),
      type: "voice",
      title: "Morning check-in",
      content: "Voice note about today’s priorities.",
      createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
      tags: ["work", "focus"],
      metadata: { durationSec: 38 },
    },
    {
      id: nanoid(),
      type: "text",
      title: "Idea: local-first sync",
      content: "Use CRDTs for offline merges and prioritize privacy.",
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      tags: ["idea", "research"],
    },
    {
      id: nanoid(),
      type: "link",
      title: "Article: contextual reminders",
      content: "https://example.com/contextual-reminders",
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      tags: ["reading"],
    },
    {
      id: nanoid(),
      type: "photo",
      title: "Whiteboard snapshot",
      content: "Meeting notes photo.",
      createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      tags: ["workshop"],
      metadata: {
        thumbnailUri: undefined,
      },
    },
  ];
}

export function MemoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadFromDisk().then((stored) => {
      if (stored) {
        dispatch({ type: "set_state", payload: stored });
      } else {
        dispatch({
          type: "set_state",
          payload: { items: seedMemories(), focusGoal: null },
        });
      }
    });
  }, []);

  useEffect(() => {
    if (state.items.length === 0 && state.focusGoal === null) return;
    persistToDisk(state);
  }, [state]);

  const addMemory = useCallback(
    (input: Omit<MemoryItem, "id" | "createdAt">) => {
      const newItem: MemoryItem = {
        ...input,
        id: nanoid(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "add_item", payload: newItem });
    },
    [],
  );

  const setFocusGoal = useCallback((goal: string | null) => {
    dispatch({ type: "set_focus", payload: goal });
  }, []);

  const sortedItems = useMemo(
    () =>
      [...state.items].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [state.items],
  );

  const value = useMemo(
    () => ({
      items: sortedItems,
      focusGoal: state.focusGoal,
      addMemory,
      setFocusGoal,
    }),
    [addMemory, setFocusGoal, sortedItems, state.focusGoal],
  );

  return (
    <MemoryContext.Provider value={value}>{children}</MemoryContext.Provider>
  );
}

export function useMemoryStore() {
  const ctx = useContext(MemoryContext);
  if (!ctx) {
    throw new Error("useMemoryStore must be used within MemoryProvider");
  }
  return ctx;
}

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "صباح الخير";
  if (hour < 18) return "مساء الخير";
  return "أهلًا في نهاية اليوم";
}

export function getTimeBucket(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

export function getSmartSuggestions(items: MemoryItem[]) {
  const bucket = getTimeBucket();
  const suggestions: MemoryItem[] = [];

  if (bucket === "morning") {
    suggestions.push(...items.filter((item) => isWithinHours(item, 24)));
  } else if (bucket === "evening") {
    suggestions.push(...items.filter((item) => isWithinHours(item, 48)));
  } else {
    suggestions.push(...items.slice(0, 3));
  }

  return suggestions.slice(0, 4);
}

function isWithinHours(item: MemoryItem, hours: number) {
  const diff =
    Date.now() - new Date(item.createdAt ?? new Date(0)).getTime();
  return diff < hours * 60 * 60 * 1000;
}

export const AUDIO_RECORDING_PERMISSIONS = Platform.select({
  ios: "We need microphone access to capture your voice notes.",
  android: "Allow microphone to capture your voice notes.",
});
