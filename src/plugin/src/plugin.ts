import streamDeck from "@elgato/streamdeck";
import * as fs from "node:fs";

const logFile = "/tmp/musedeck_plugin.log";
const origLog = console.log;
const origErr = console.error;
console.log = (...args: any[]) => {
  origLog(...args);
  try {
    fs.appendFileSync(
      logFile,
      `[LOG ${new Date().toISOString()}] ` +
        args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ") +
        "\n"
    );
  } catch {}
};
console.error = (...args: any[]) => {
  origErr(...args);
  try {
    fs.appendFileSync(
      logFile,
      `[ERR ${new Date().toISOString()}] ` +
        args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ") +
        "\n"
    );
  } catch {}
};

import { StreamDeckCoreBridge } from "./core-bridge.js";
import {
  AgentStatusAction,
  ActiveTaskAction,
  DiffSummaryAction,
  StructPromptAction,
  RejectAction,
  SamSnipAction,
  SparkCodeAction,
  RunMuseAction,
  HaltAction,
  ResetAction,
  PromptTaskAction,
  WriteTestsAction,
  FixBugAction,
  CommitPrAction,
  PageNextAction,
} from "./actions/index.js";

// Initialize local bridge to MuseDeck core server
const bridge = new StreamDeckCoreBridge();

// Register the 15 official MuseDeck actions
streamDeck.actions.registerAction(new AgentStatusAction(bridge));
streamDeck.actions.registerAction(new ActiveTaskAction(bridge));
streamDeck.actions.registerAction(new DiffSummaryAction(bridge));
streamDeck.actions.registerAction(new StructPromptAction(bridge));
streamDeck.actions.registerAction(new RejectAction(bridge));
streamDeck.actions.registerAction(new SamSnipAction(bridge));
streamDeck.actions.registerAction(new SparkCodeAction(bridge));
streamDeck.actions.registerAction(new RunMuseAction(bridge));
streamDeck.actions.registerAction(new HaltAction(bridge));
streamDeck.actions.registerAction(new ResetAction(bridge));
streamDeck.actions.registerAction(new PromptTaskAction(bridge));
streamDeck.actions.registerAction(new WriteTestsAction(bridge));
streamDeck.actions.registerAction(new FixBugAction(bridge));
streamDeck.actions.registerAction(new CommitPrAction(bridge));
streamDeck.actions.registerAction(new PageNextAction(bridge));

// Start local bridge client and connect to Stream Deck host
await bridge.start();
await streamDeck.connect();

streamDeck.logger.info("⚡ MuseDeck plugin connected and registered 15 physical actions.");
