import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginDir = path.resolve(__dirname, "../com.memetcircus.musedeck.sdPlugin");
const imgsDir = path.join(pluginDir, "imgs");

const actions = [
  "status",
  "task",
  "diff",
  "approve",
  "reject",
  "sam-snip",
  "spark-code",
  "run-muse",
  "halt",
  "reset",
  "prompt-task",
  "write-tests",
  "fix-bug",
  "commit-pr",
  "web-console",
];

async function generate() {
  await fs.mkdir(imgsDir, { recursive: true });

  // 1x1 transparent PNG fallback
  const transparentPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  // Category & Plugin icons
  await fs.writeFile(path.join(imgsDir, "category-icon.png"), transparentPng);
  await fs.writeFile(path.join(imgsDir, "category-icon@2x.png"), transparentPng);
  await fs.writeFile(path.join(imgsDir, "plugin-icon.png"), transparentPng);
  await fs.writeFile(path.join(imgsDir, "plugin-icon@2x.png"), transparentPng);

  // Action icons
  for (const actionName of actions) {
    const actionDir = path.join(imgsDir, "actions", actionName);
    await fs.mkdir(actionDir, { recursive: true });
    await fs.writeFile(path.join(actionDir, "icon.png"), transparentPng);
    await fs.writeFile(path.join(actionDir, "icon@2x.png"), transparentPng);
    await fs.writeFile(path.join(actionDir, "key.png"), transparentPng);
    await fs.writeFile(path.join(actionDir, "key@2x.png"), transparentPng);
  }

  console.log("✅ Stream Deck plugin asset structure generated successfully!");
}

generate().catch(console.error);
