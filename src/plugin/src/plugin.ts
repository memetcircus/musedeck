import streamDeck from "@elgato/streamdeck";
import * as fs from "node:fs";
const logFile = "/tmp/musedeck_plugin.log";
const origLog = console.log;
const origErr = console.error;
console.log = (...args: any[]) => {
  origLog(...args);
  try { fs.appendFileSync(logFile, `[LOG ${new Date().toISOString()}] ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ") + "\n"); } catch {}
};
console.error = (...args: any[]) => {
  origErr(...args);
  try { fs.appendFileSync(logFile, `[ERR ${new Date().toISOString()}] ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ") + "\n"); } catch {}
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
  WebConsoleAction,
  PageNextAction,
  RecordToFixAction,
  VidToCodeAction,
  UploadFileAction,
  AudioTransAction,
  ReInspectAction,
  PhoneRecAction,
  StyleTransAction,
  WorkspaceAction,
  TerminalLogAction,
  RewindWorkAction,
  ClearMediaAction,
  ApiStatusAction,
  SparkChatAction,
  OpenWorkAction,
  PagePrevAction,
} from "./actions/index.js";

// Initialize local bridge to MuseDeck core server
const bridge = new StreamDeckCoreBridge();

// Register all Stream Deck Page 1 & Page 2 actions
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
streamDeck.actions.registerAction(new WebConsoleAction(bridge));
streamDeck.actions.registerAction(new PageNextAction(bridge));

// Page 2 Actions
streamDeck.actions.registerAction(new RecordToFixAction(bridge));
streamDeck.actions.registerAction(new VidToCodeAction(bridge));
streamDeck.actions.registerAction(new UploadFileAction(bridge));
streamDeck.actions.registerAction(new AudioTransAction(bridge));
streamDeck.actions.registerAction(new ReInspectAction(bridge));
streamDeck.actions.registerAction(new PhoneRecAction(bridge));
streamDeck.actions.registerAction(new StyleTransAction(bridge));
streamDeck.actions.registerAction(new WorkspaceAction(bridge));
streamDeck.actions.registerAction(new TerminalLogAction(bridge));
streamDeck.actions.registerAction(new RewindWorkAction(bridge));
streamDeck.actions.registerAction(new ClearMediaAction(bridge));
streamDeck.actions.registerAction(new ApiStatusAction(bridge));
streamDeck.actions.registerAction(new SparkChatAction(bridge));
streamDeck.actions.registerAction(new OpenWorkAction(bridge));
streamDeck.actions.registerAction(new PagePrevAction());

// Start local bridge client and connect to Stream Deck host
await bridge.start();
await streamDeck.connect();

streamDeck.logger.info("⚡ MuseDeck plugin connected and registered 15 physical actions.");
