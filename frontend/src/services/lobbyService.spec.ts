import { beforeEach, describe, expect, it } from "vitest";
import { lobbySessionStore, playerIdentityStore } from "./lobbyService";

const createStorage = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
};

describe("lobbyService storage", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: createStorage(),
      configurable: true,
    });
    Object.defineProperty(window, "sessionStorage", {
      value: createStorage(),
      configurable: true,
    });

    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("stores per-lobby session data in sessionStorage", () => {
    lobbySessionStore.save("9MBTDS", "player-1", "token-1", "Alice", true);

    expect(lobbySessionStore.read("9MBTDS")).toEqual({
      lobbyId: "9MBTDS",
      playerId: "player-1",
      sessionToken: "token-1",
      playerName: "Alice",
      isHost: true,
    });
    expect(
      window.sessionStorage.getItem("coup:lobby-session:9MBTDS"),
    ).not.toBeNull();
    expect(window.localStorage.getItem("coup:lobby-session:9MBTDS")).toBeNull();
  });

  it("keeps the stable player identity in localStorage", () => {
    const identity = playerIdentityStore.getOrCreate();

    expect(identity.profileId).toBeTruthy();
    expect(window.localStorage.getItem("coup:player-identity")).not.toBeNull();
    expect(window.sessionStorage.getItem("coup:player-identity")).toBeNull();
  });
});
