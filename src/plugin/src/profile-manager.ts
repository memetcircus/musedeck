import streamDeck from "@elgato/streamdeck";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Auto-switches the Stream Deck to the bundled "MuseDeck" profile when Terminal
 * launches or when an active Meta Muse Code (`muse`) session starts inside Terminal.app.
 * Mirrors the KiroCan ProfileManager behavior where the 15-key layout loads automatically.
 */
export class ProfileManager {
  /** Must match a manifest `Profiles[].Name`, which maps to `MuseDeck.streamDeckProfile`. */
  private static readonly PROFILE_NAME = "MuseDeck";

  /** DeviceType 0 = Stream Deck (classic 15-key MK.1 / MK.2), which this profile targets. */
  private static readonly TARGET_DEVICE_TYPE = 0;

  private hadActiveMuseWindow = false;
  private pollTimer: NodeJS.Timeout | null = null;

  start(): void {
    // 1. Switch when monitored application (com.apple.Terminal) launches
    streamDeck.system.onApplicationDidLaunch((ev) => {
      streamDeck.logger.info(`[ProfileManager] Application launched: ${ev.application}`);
      void this.switchToMuseDeckProfile();
    });

    // 2. Switch when a Stream Deck device connects
    streamDeck.devices.onDeviceDidConnect(() => {
      void this.switchToMuseDeckProfile();
    });

    // 3. Watch for `muse` CLI starting inside an already-open Terminal.app window
    this.pollTimer = setInterval(() => {
      void this.checkMuseTerminalTransition();
    }, 2500);
  }

  /** Switch every connected classic 15-key Stream Deck to the MuseDeck profile. */
  async switchToMuseDeckProfile(): Promise<void> {
    for (const device of streamDeck.devices) {
      if (!device.isConnected) continue;
      if (device.type !== ProfileManager.TARGET_DEVICE_TYPE) continue;
      try {
        await streamDeck.profiles.switchToProfile(device.id, ProfileManager.PROFILE_NAME);
        streamDeck.logger.info(`[ProfileManager] Switched ${device.name} to the MuseDeck profile.`);
      } catch (err) {
        streamDeck.logger.warn(`[ProfileManager] Could not switch profile on ${device.name}: ${String(err)}`);
      }
    }
  }

  private async checkMuseTerminalTransition(): Promise<void> {
    try {
      const script = `
tell application "System Events"
  if not (exists process "Terminal") then return "NONE"
end tell
tell application "Terminal"
  repeat with w in windows
    set winName to name of w
    if winName contains "muse-bin" or winName contains "MUSE_ACTIVE_SESSION" then
      return "ACTIVE"
    end if
  end repeat
  return "NONE"
end tell
      `.trim();
      const { stdout } = await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
      const isMuseActive = stdout.trim() === "ACTIVE";
      if (isMuseActive && !this.hadActiveMuseWindow) {
        this.hadActiveMuseWindow = true;
        streamDeck.logger.info("[ProfileManager] Detected active Muse Code session in Terminal -> switching to MuseDeck profile.");
        await this.switchToMuseDeckProfile();
      } else if (!isMuseActive && this.hadActiveMuseWindow) {
        this.hadActiveMuseWindow = false;
      }
    } catch {
      // Ignore transient AppleScript errors
    }
  }
}

