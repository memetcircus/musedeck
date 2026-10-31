import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";
import { TerminalAutomation } from "../../../agent/terminal-automation.js";

class MemorySubmenuManager {
  private active = false;

  get isActive(): boolean {
    return this.active;
  }

  open(): void {
    console.log("🧠 [MemorySubmenu] Opening Muse Memory Sub-Dashboard");
    this.active = true;
    this.render();
  }

  close(): void {
    if (!this.active) return;
    console.log("🔙 [MemorySubmenu] Closing Muse Memory Sub-Dashboard -> Restoring Page 1");
    this.active = false;
    keyRegistry.restoreAll();
  }

  forceClose(): void {
    if (!this.active) return;
    this.active = false;
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
      // (1,0): MUSE RULES
      else if (col === 1 && row === 0) {
        image = SvgKeyRenderer.renderMemoryRulesKey();
      }
      // (2,0): SPEC.md
      else if (col === 2 && row === 0) {
        image = SvgKeyRenderer.renderMemorySpecKey();
      }
      // (3,0): PLAN.md
      else if (col === 3 && row === 0) {
        image = SvgKeyRenderer.renderMemoryPlanKey();
      }
      // (4,0): TODO.md
      else if (col === 4 && row === 0) {
        image = SvgKeyRenderer.renderMemoryTodoKey();
      }

      // ROW 1:
      // (0,1): ARCH.md
      else if (col === 0 && row === 1) {
        image = SvgKeyRenderer.renderMemoryArchKey();
      }
      // (1,1): PROGRESS.md
      else if (col === 1 && row === 1) {
        image = SvgKeyRenderer.renderMemoryProgressKey();
      }
      // (2,1): README.md
      else if (col === 2 && row === 1) {
        image = SvgKeyRenderer.renderMemoryReadmeKey();
      }
      // (3,1): DECISIONS.md
      else if (col === 3 && row === 1) {
        image = SvgKeyRenderer.renderMemoryDecisionsKey();
      }
      // (4,1): API.md
      else if (col === 4 && row === 1) {
        image = SvgKeyRenderer.renderMemoryApiKey();
      }

      // ROW 2:
      // (0,2): TESTING.md
      else if (col === 0 && row === 2) {
        image = SvgKeyRenderer.renderMemoryTestingKey();
      }
      // (1,2): SYNC CONTEXT
      else if (col === 1 && row === 2) {
        image = SvgKeyRenderer.renderMemorySyncKey();
      }
      // (2,2): UPDATE LOG
      else if (col === 2 && row === 2) {
        image = SvgKeyRenderer.renderMemoryUpdateKey();
      }
      // Remaining empty tiles
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

    // (1, 0): MUSE RULES (MUSE.md / AGENTS.md)
    if (col === 1 && row === 0) {
      console.log("🧠 [MemorySubmenu] Triggering MUSE RULES session...");
      await TerminalAutomation.focusOrLaunchDocSession(
        "rules",
        ["MUSE.md", "muse.md", "AGENTS.md", "agents.md"],
        "We are creating the MUSE.md file for project working agreements, constraints, and coding rules. Start by greeting me and letting me know that this session is dedicated to drafting MUSE.md. Interview me step by step about rules, conventions, and things not to touch.",
        "Existing MUSE.md found. Let's review and update our persistent working agreements, rules, and constraints. Greet me and ask what rules or conventions we should refine or add in this session."
      );
      return true;
    }

    // (2, 0): SPEC.md
    if (col === 2 && row === 0) {
      console.log("🧠 [MemorySubmenu] Triggering SPEC.md session...");
      await TerminalAutomation.focusOrLaunchDocSession(
        "spec",
        ["SPEC.md", "spec.md", "REQUIREMENTS.md", "requirements.md", "specs.md"],
        "We are creating the SPEC.md file for this project using Spec-Driven Development. Start by greeting me and letting me know that this session is dedicated to drafting SPEC.md. Interview me step by step about the core product goals, target users, scope, and acceptance criteria.",
        "Existing SPEC.md found. Let's review and update our product specifications and requirements. Greet me and ask what new requirements, changes, or refinements we should make in this session."
      );
      return true;
    }

    // (3, 0): PLAN.md
    if (col === 3 && row === 0) {
      console.log("🧠 [MemorySubmenu] Triggering PLAN.md session...");
      await TerminalAutomation.focusOrLaunchDocSession(
        "plan",
        ["PLAN.md", "plan.md", "ROADMAP.md", "roadmap.md"],
        "We are creating the PLAN.md implementation roadmap. Start by greeting me and letting me know that this session is dedicated to drafting PLAN.md. Interview me to break our requirements into clear development phases, milestones, and dependencies.",
        "Existing PLAN.md found. Let's review our roadmap and phase progress. Greet me and ask which phase or milestone we are planning or adjusting in this session."
      );
      return true;
    }

    // (4, 0): TODO.md
    if (col === 4 && row === 0) {
      console.log("🧠 [MemorySubmenu] Triggering TODO.md session...");
      await TerminalAutomation.focusOrLaunchDocSession(
        "todo",
        ["TODO.md", "todo.md", "TASKS.md", "tasks.md"],
        "We are creating the TODO.md checklist. Start by greeting me and letting me know this session is dedicated to building our TODO list. Scan the codebase and interview me to generate a structured checklist of action items categorized by milestone.",
        "Existing TODO.md found. Let's review our task checklist. Greet me and ask which tasks we should check off or add in this session."
      );
      return true;
    }

    // (0, 1): ARCH.md (ARCHITECTURE.md)
    if (col === 0 && row === 1) {
      console.log("🧠 [MemorySubmenu] Triggering ARCHITECTURE.md session...");
      await TerminalAutomation.focusOrLaunchDocSession(
        "arch",
        ["ARCHITECTURE.md", "architecture.md", "ARCH.md", "arch.md"],
        "We are creating the ARCHITECTURE.md file. Start by greeting me and letting me know that this session is dedicated to drafting our architecture documentation. Inspect our tech stack, folder structure, and design patterns, then interview me on key architectural principles.",
        "Existing ARCHITECTURE.md found. Let's review our system architecture, stack patterns, and data flow. Greet me and ask what architectural updates or diagrams we should refine in this session."
      );
      return true;
    }

    // (1, 1): PROGRESS.md (DEVLOG.md / CHANGELOG.md)
    if (col === 1 && row === 1) {
      console.log("🧠 [MemorySubmenu] Triggering PROGRESS.md session...");
      await TerminalAutomation.focusOrLaunchDocSession(
        "progress",
        ["PROGRESS.md", "progress.md", "DEVLOG.md", "devlog.md", "CHANGELOG.md"],
        "We are initializing the PROGRESS.md living work log. Start by greeting me and setting up the structure with Completed, In-Progress, and Next Steps sections. Record our first work session entry.",
        "Existing PROGRESS.md found. Let's update our work log. Greet me and ask for a quick summary of what was accomplished today so we can log it under Completed, In-Progress, and Next Steps."
      );
      return true;
    }

    // (2, 1): README.md
    if (col === 2 && row === 1) {
      console.log("🧠 [MemorySubmenu] Triggering README.md session...");
      await TerminalAutomation.focusOrLaunchDocSession(
        "readme",
        ["README.md", "readme.md"],
        "We are creating the README.md file. Start by greeting me and letting me know that this session is dedicated to drafting our README. Interview me about the project summary, prerequisites, installation steps, commands, and environment setup.",
        "Existing README.md found. Let's review and update our project documentation, setup instructions, or CLI commands. Greet me and ask what needs updating in README.md."
      );
      return true;
    }

    // (3, 1): DECISIONS.md (ADRs)
    if (col === 3 && row === 1) {
      console.log("🧠 [MemorySubmenu] Triggering DECISIONS.md session...");
      await TerminalAutomation.focusOrLaunchDocSession(
        "decisions",
        ["DECISIONS.md", "decisions.md", "ADR.md", "adr.md"],
        "We are initializing the DECISIONS.md Architecture Decision Record (ADR) file. Start by greeting me and setting up the ADR template (Context, Decision, Consequences). Interview me about recent trade-offs or technology choices to log.",
        "Existing DECISIONS.md found. Let's record a new Architecture Decision Record (ADR) or review past decisions. Greet me and ask what new decision or trade-off we are evaluating today."
      );
      return true;
    }

    // (4, 1): API.md
    if (col === 4 && row === 1) {
      console.log("🧠 [MemorySubmenu] Triggering API.md session...");
      await TerminalAutomation.focusOrLaunchDocSession(
        "api",
        ["API.md", "api.md", "SPEC_API.md"],
        "We are creating the API.md specification. Start by greeting me and scanning our endpoints/contracts. Interview me to document request/response formats, payloads, and error codes.",
        "Existing API.md found. Let's review our endpoint specs, schemas, and API contracts. Greet me and ask what routes or payload definitions we should update."
      );
      return true;
    }

    // (0, 2): TESTING.md
    if (col === 0 && row === 2) {
      console.log("🧠 [MemorySubmenu] Triggering TESTING.md session...");
      await TerminalAutomation.focusOrLaunchDocSession(
        "testing",
        ["TESTING.md", "testing.md", "TESTS.md"],
        "We are creating the TESTING.md guide. Start by greeting me and letting me know that this session is dedicated to our test strategy. Interview me to document test runners, unit/integration suites, fixtures, and acceptance criteria.",
        "Existing TESTING.md found. Let's review and update our testing guide, test commands, or test coverage targets. Greet me and ask what testing instructions we should update."
      );
      return true;
    }

    // (1, 2): SYNC CONTEXT (Start of Session: Read SPEC, PLAN, PROGRESS)
    if (col === 1 && row === 2) {
      console.log("🧠 [MemorySubmenu] Executing SYNC CONTEXT in terminal...");
      await TerminalAutomation.runContextAction(
        "Read SPEC.md, PLAN.md, and PROGRESS.md to catch up on the latest project context and summarize your understanding."
      );
      return true;
    }

    // (2, 2): UPDATE LOG (End of Session: Update TODO & PROGRESS)
    if (col === 2 && row === 2) {
      console.log("🧠 [MemorySubmenu] Executing UPDATE LOG in terminal...");
      await TerminalAutomation.runContextAction(
        "Analyze our recent code changes and git status. Update the TODO.md checklist and append today's session summary to PROGRESS.md."
      );
      return true;
    }

    return true;
  }
}

export const memorySubmenuManager = new MemorySubmenuManager();

