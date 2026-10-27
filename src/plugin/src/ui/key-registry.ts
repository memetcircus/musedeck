import type { KeyAction } from "@elgato/streamdeck";

export interface RegisteredKey {
  action: KeyAction;
  column: number;
  row: number;
  excludeFromAnimation?: boolean;
  restore(): void;
}

class KeyRegistry {
  private readonly keys = new Map<string, RegisteredKey>();

  add(id: string, key: RegisteredKey): void {
    this.keys.set(id, key);
  }

  remove(id: string): void {
    this.keys.delete(id);
  }

  all(): RegisteredKey[] {
    return [...this.keys.values()];
  }

  restoreAll(): void {
    for (const key of this.keys.values()) {
      key.restore();
    }
  }
}

export const keyRegistry = new KeyRegistry();
