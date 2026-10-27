import streamDeck from "@elgato/streamdeck";
import { StreamDeckCoreBridge } from "./core-bridge.js";
import {
  AgentStatusAction,
  ActiveTaskAction,
  DiffSummaryAction,
  ApproveAction,
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
  PagePrevAction,
} from "./actions/index.js";

// Initialize local bridge to MuseDeck core server
const bridge = new StreamDeckCoreBridge();

// Register all Stream Deck actions
streamDeck.actions.registerAction(new AgentStatusAction(bridge));
streamDeck.actions.registerAction(new ActiveTaskAction(bridge));
streamDeck.actions.registerAction(new DiffSummaryAction(bridge));
streamDeck.actions.registerAction(new ApproveAction(bridge));
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
streamDeck.actions.registerAction(new WebConsoleAction());
streamDeck.actions.registerAction(new PageNextAction());
streamDeck.actions.registerAction(new RecordToFixAction(bridge));
streamDeck.actions.registerAction(new PagePrevAction());

// Start local bridge client and connect to Stream Deck host
await bridge.start();
await streamDeck.connect();

streamDeck.logger.info("⚡ MuseDeck plugin connected and registered 15 physical actions.");
