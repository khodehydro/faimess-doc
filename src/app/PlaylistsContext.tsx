import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  STORE_KEY,
  byNewest,
  cleanName,
  isUserPlaylist,
  makePlaylistId,
  type PlaylistCoverId,
  type UserPlaylist,
} from "../data/playlists";

/* ------------------------------------------------------------------ *
 *  The listener's own playlists.
 *
 *  The model is a few ids (see data/playlists.ts), so persistence is one
 *  JSON blob in localStorage — the demo has no account service to sync to,
 *  and the copy says as much. Every mutation goes through here so the
 *  player panel, the Playlists page and the "add to playlist" sheet can
 *  never disagree about what exists.
 * ------------------------------------------------------------------ */

type PlaylistsValue = {
  /** newest first */
  mine: UserPlaylist[];
  create: (name: string, cover: PlaylistCoverId, trackIds?: string[]) => UserPlaylist;
  update: (id: string, patch: { name?: string; cover?: PlaylistCoverId; trackIds?: string[] }) => void;
  remove: (id: string) => void;
  /** true when the track went in, false when it was already there */
  addTrack: (id: string, trackId: string) => boolean;
  removeTrack: (id: string, trackId: string) => void;
  contains: (id: string, trackId: string) => boolean;
  find: (id: string) => UserPlaylist | null;
};

const PlaylistsContext = createContext<PlaylistsValue | null>(null);

function readStored(): UserPlaylist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isUserPlaylist) : [];
  } catch {
    /* private mode, storage off, or junk in the slot — start empty */
    return [];
  }
}

export function PlaylistsProvider({
  children,
  initial,
}: {
  children: ReactNode;
  /** seeded lists, for the SSR check and for previews */
  initial?: UserPlaylist[];
}) {
  const [mine, setMine] = useState<UserPlaylist[]>(() => byNewest(initial ?? readStored()));

  /* write-through: one effect, so a burst of edits costs one write */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(mine));
    } catch {
      /* nothing to persist to — the lists still work for this session */
    }
  }, [mine]);

  const create = useCallback((name: string, cover: PlaylistCoverId, trackIds: string[] = []) => {
    const list: UserPlaylist = {
      id: makePlaylistId(),
      name: cleanName(name),
      cover,
      trackIds: [...new Set(trackIds)],
      createdAt: Date.now(),
    };
    setMine((lists) => [list, ...lists]);
    return list;
  }, []);

  const update = useCallback(
    (id: string, patch: { name?: string; cover?: PlaylistCoverId; trackIds?: string[] }) => {
      setMine((lists) =>
        lists.map((list) =>
          list.id === id
            ? {
                ...list,
                ...(patch.name !== undefined ? { name: cleanName(patch.name) } : {}),
                ...(patch.cover !== undefined ? { cover: patch.cover } : {}),
                ...(patch.trackIds !== undefined ? { trackIds: [...new Set(patch.trackIds)] } : {}),
              }
            : list,
        ),
      );
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setMine((lists) => lists.filter((list) => list.id !== id));
  }, []);

  const addTrack = useCallback((id: string, trackId: string) => {
    let added = false;
    setMine((lists) =>
      lists.map((list) => {
        if (list.id !== id) return list;
        if (list.trackIds.includes(trackId)) return list;
        added = true;
        return { ...list, trackIds: [...list.trackIds, trackId] };
      }),
    );
    return added;
  }, []);

  const removeTrack = useCallback((id: string, trackId: string) => {
    setMine((lists) =>
      lists.map((list) =>
        list.id === id ? { ...list, trackIds: list.trackIds.filter((t) => t !== trackId) } : list,
      ),
    );
  }, []);

  const value = useMemo<PlaylistsValue>(
    () => ({
      mine,
      create,
      update,
      remove,
      addTrack,
      removeTrack,
      contains: (id, trackId) => !!mine.find((list) => list.id === id)?.trackIds.includes(trackId),
      find: (id) => mine.find((list) => list.id === id) ?? null,
    }),
    [mine, create, update, remove, addTrack, removeTrack],
  );

  return <PlaylistsContext.Provider value={value}>{children}</PlaylistsContext.Provider>;
}

export function usePlaylists() {
  const ctx = useContext(PlaylistsContext);
  if (!ctx) throw new Error("usePlaylists must be used inside <PlaylistsProvider>");
  return ctx;
}
