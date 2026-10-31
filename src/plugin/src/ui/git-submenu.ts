import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";
import { TerminalAutomation } from "../../../agent/terminal-automation.js";
import { exec } from "node:child_process";
import * as path from "node:path";

class GitSubmenuManager {
  private active = false;
  private discardConfirming = false;
  private discardTimer: NodeJS.Timeout | null = null;
  private commitStatus: "idle" | "no_focus" | "no_git" | "clean" | "committing" | "committed" = "idle";
  private commitTimer: NodeJS.Timeout | null = null;

  get isActive(): boolean {
    return this.active;
  }

  open(): void {
    console.log("🌿 [GitSubmenu] Opening Git Commands Sub-Dashboard");
    this.active = true;
    this.discardConfirming = false;
    this.commitStatus = "idle";
    this.render();
  }

  close(): void {
    if (!this.active) return;
    console.log("🔙 [GitSubmenu] Closing Git Commands Sub-Dashboard -> Restoring Page 1");
    this.active = false;
    this.clearTimers();
    keyRegistry.restoreAll();
  }

  forceClose(): void {
    if (!this.active) return;
    this.active = false;
    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.discardTimer) {
      clearTimeout(this.discardTimer);
      this.discardTimer = null;
    }
    if (this.commitTimer) {
      clearTimeout(this.commitTimer);
      this.commitTimer = null;
    }
  }

  setCommitStatus(status: "idle" | "no_focus" | "no_git" | "clean" | "committing" | "committed"): void {
    this.commitStatus = status;
    if (this.active) {
      this.render();
    }
    if (status !== "idle" && status !== "committing") {
      if (this.commitTimer) clearTimeout(this.commitTimer);
      this.commitTimer = setTimeout(() => {
        this.commitStatus = "idle";
        if (this.active) this.render();
      }, 2000);
    }
  }

  render(): void {
    if (!this.active) return;

    for (const key of keyRegistry.all()) {
      const col = key.column;
      const row = key.row;

      let image = "";

      // ROW 0:
      // (0,0): ↑ BACK
      if (col === 0 && row === 0) {
        image = SvgKeyRenderer.renderUpBackKey();
      }
      // (1,0): GIT STATUS
      else if (col === 1 && row === 0) {
        image = SvgKeyRenderer.renderGitStatusSubKey();
      }
      // (2,0): GIT COMMIT
      else if (col === 2 && row === 0) {
        image = SvgKeyRenderer.renderGitCommitKey(this.commitStatus);
      }
      // (3,0): GIT PULL
      else if (col === 3 && row === 0) {
        image = SvgKeyRenderer.renderGitPullKey();
      }
      // (4,0): GIT PUSH
      else if (col === 4 && row === 0) {
        image = SvgKeyRenderer.renderGitPushKey();
      }

      // ROW 1:
      // (0,1): VIEW DIFF
      else if (col === 0 && row === 1) {
        image = SvgKeyRenderer.renderGitDiffKey();
      }
      // (1,1): STASH SAVE
      else if (col === 1 && row === 1) {
        image = SvgKeyRenderer.renderGitStashSaveKey();
      }
      // (2,1): STASH POP
      else if (col === 2 && row === 1) {
        image = SvgKeyRenderer.renderGitStashPopKey();
      }
      // (3,1): DISCARD (with 2-tap confirmation)
      else if (col === 3 && row === 1) {
        image = SvgKeyRenderer.renderGitDiscardKey(this.discardConfirming);
      }
      // (4,1): MAIN BRANCH
      else if (col === 4 && row === 1) {
        image = SvgKeyRenderer.renderGitMainKey();
      }

      // ROW 2:
      // (0,2): CREATE PR
      else if (col === 0 && row === 2) {
        image = SvgKeyRenderer.renderGitPrKey();
      }
      // (1,2): OPEN REPO
      else if (col === 1 && row === 2) {
        image = SvgKeyRenderer.renderGitRepoKey();
      }
      // (2,2): GIT LOG
      else if (col === 2 && row === 2) {
        image = SvgKeyRenderer.renderGitLogKey();
      }
      // Remaining tiles empty
      else {
        image = SvgKeyRenderer.renderEmptyTile();
      }

      if (image) {
        void key.action.setImage(image);
        void key.action.setTitle("");
      }
    }
  }

  async handleKeyDown(col: number, row: number): Promise<boolean> {
    if (!this.active) return false;

    // (0, 0): ↑ BACK -> Return to Page 1
    if (col === 0 && row === 0) {
      this.close();
      return true;
    }

    // (1, 0): GIT STATUS
    if (col === 1 && row === 0) {
      console.log("🌿 [GitSubmenu] Executing git status in terminal...");
      await TerminalAutomation.typeSnippetIntoTerminal("git status", true);
      return true;
    }

    // (2, 0): GIT COMMIT (Safe focus & repo check)
    if (col === 2 && row === 0) {
      console.log("🌿 [GitSubmenu] Executing safe git commit...");
      const res = await TerminalAutomation.executeSafeGitCommit();
      this.setCommitStatus(
        res === "COMMITTING" ? "committing" :
        res === "CLEAN" ? "clean" :
        res === "NO_FOCUS" ? "no_focus" :
        res === "NO_GIT" ? "no_git" : "idle"
      );
      return true;
    }

    // (3, 0): GIT PULL
    if (col === 3 && row === 0) {
      console.log("🌿 [GitSubmenu] Executing git pull in terminal...");
      await TerminalAutomation.typeSnippetIntoTerminal("git pull", true);
      return true;
    }

    // (4, 0): GIT PUSH
    if (col === 4 && row === 0) {
      console.log("🌿 [GitSubmenu] Executing git push in terminal...");
      await TerminalAutomation.typeSnippetIntoTerminal("git push", true);
      return true;
    }

    // (0, 1): VIEW DIFF
    if (col === 0 && row === 1) {
      console.log("🌿 [GitSubmenu] Executing git diff in terminal...");
      await TerminalAutomation.typeSnippetIntoTerminal("git diff", true);
      return true;
    }

    // (1, 1): STASH SAVE
    if (col === 1 && row === 1) {
      console.log("🌿 [GitSubmenu] Executing git stash in terminal...");
      await TerminalAutomation.typeSnippetIntoTerminal("git stash", true);
      return true;
    }

    // (2, 1): STASH POP
    if (col === 2 && row === 1) {
      console.log("🌿 [GitSubmenu] Executing git stash pop in terminal...");
      await TerminalAutomation.typeSnippetIntoTerminal("git stash pop", true);
      return true;
    }

    // (3, 1): DISCARD (Two-tap safety)
    if (col === 3 && row === 1) {
      if (!this.discardConfirming) {
        console.log("⚠️ [GitSubmenu] Discard first tap -> Waiting for confirmation");
        this.discardConfirming = true;
        this.render();
        this.discardTimer = setTimeout(() => {
          this.discardConfirming = false;
          if (this.active) this.render();
        }, 3000);
        return true;
      } else {
        console.log("🗑️ [GitSubmenu] Discard confirmed -> Executing restore in terminal");
        this.discardConfirming = false;
        if (this.discardTimer) clearTimeout(this.discardTimer);
        this.render();
        await TerminalAutomation.typeSnippetIntoTerminal("git restore . && git clean -fd", true);
        return true;
      }
    }

    // (4, 1): MAIN BRANCH
    if (col === 4 && row === 1) {
      console.log("🌿 [GitSubmenu] Checking out main branch in terminal...");
      await TerminalAutomation.typeSnippetIntoTerminal("git checkout main || git checkout master", true);
      return true;
    }

    // (0, 2): CREATE PR
    if (col === 0 && row === 2) {
      console.log("🌿 [GitSubmenu] Opening PR creation in browser...");
      exec(
        `gh pr create --web 2>/dev/null || open "https://github.com/$(git config --get remote.origin.url 2>/dev/null | sed -E 's/.*github.com[:\\/](.*)\\.git/\\1/')/pull/new/$(git branch --show-current 2>/dev/null)" 2>/dev/null || true`
      );
      return true;
    }

    // (1, 2): OPEN REPO
    if (col === 1 && row === 2) {
      console.log("🌿 [GitSubmenu] Opening repository in browser...");
      exec(
        `open "$(git config --get remote.origin.url 2>/dev/null | sed -E 's/git@github.com:/https:\\/\\/github.com\\//')" 2>/dev/null || open .`
      );
      return true;
    }

    // (2, 2): GIT LOG
    if (col === 2 && row === 2) {
      console.log("🌿 [GitSubmenu] Displaying git log in terminal...");
      await TerminalAutomation.typeSnippetIntoTerminal("git log --oneline -n 10", true);
      return true;
    }

    return true;
  }
}

export const gitSubmenuManager = new GitSubmenuManager();

