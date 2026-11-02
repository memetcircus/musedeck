import fs from "node:fs";
import path from "node:path";
import type { MetaModelApiClient } from "./meta-client.js";

export type TargetFramework =
  | "AUTO"
  | "REACT"
  | "HTML_CSS"
  | "VUE"
  | "SWIFTUI"
  | "COMPOSE"
  | "FLUTTER"
  | "PYTHON"
  | "FRAMER"
  | "TAILWIND_ANIM"
  | "SWIFTUI_SPRING"
  | "COMPOSE_ANIM"
  | "FLUTTER_ANIM"
  | "VUE_ANIM"
  | "GSAP";

export interface SparkCodeResult {
  code: string;
  framework: TargetFramework;
  frameworkName: string;
  filename: string;
  filePath: string;
  explanation: string;
}

export class MuseSparkClient {
  private modelName: string;

  constructor(
    private readonly apiClient: MetaModelApiClient,
    modelName?: string
  ) {
    this.modelName = modelName || process.env.SPARK_MODEL_NAME || "muse-spark-1.3";
  }

  /**
   * Auto-detect project tech stack from workspace root files
   */
  static detectProjectFramework(workspaceDir = process.cwd()): TargetFramework {
    try {
      if (fs.existsSync(path.join(workspaceDir, "Package.swift")) || fs.existsSync(path.join(workspaceDir, "project.pbxproj"))) {
        return "SWIFTUI";
      }
      if (fs.existsSync(path.join(workspaceDir, "pubspec.yaml"))) {
        return "FLUTTER";
      }
      if (fs.existsSync(path.join(workspaceDir, "build.gradle")) || fs.existsSync(path.join(workspaceDir, "build.gradle.kts"))) {
        return "COMPOSE";
      }
      if (fs.existsSync(path.join(workspaceDir, "requirements.txt")) || fs.existsSync(path.join(workspaceDir, "pyproject.toml"))) {
        return "PYTHON";
      }

      const pkgPath = path.join(workspaceDir, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps.vue) return "VUE";
        if (deps.svelte) return "VUE";
        if (deps.react || deps["react-dom"] || deps.next) return "REACT";
      }
    } catch {}

    return "REACT"; // Default standard
  }

  /**
   * Dispatches the SAM extracted UI to Muse Spark for multimodal code synthesis
   */
  async generateCodeFromImage(
    imageBufferOrBase64: Buffer | string,
    target: TargetFramework = "AUTO",
    workspaceDir = process.cwd()
  ): Promise<SparkCodeResult> {
    const resolvedFramework = target === "AUTO" ? MuseSparkClient.detectProjectFramework(workspaceDir) : target;
    const base64Data = Buffer.isBuffer(imageBufferOrBase64)
      ? imageBufferOrBase64.toString("base64")
      : imageBufferOrBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const { prompt, systemPrompt, frameworkName, filename } = this.getFrameworkMeta(resolvedFramework);

    console.log(`✨ [Muse Spark] Synthesizing ${frameworkName} component (${filename}) using ${this.modelName}...`);

    let code = "";
    if (this.apiClient.isConfigured()) {
      try {
        const response = await this.apiClient.request<{
          choices: Array<{
            message: {
              content: string;
            };
          }>;
        }>("/chat/completions", {
          method: "POST",
          body: JSON.stringify({
            model: this.modelName,
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/png;base64,${base64Data}`,
                    },
                  },
                ],
              },
            ],
            temperature: 0.2,
            max_tokens: 12288,
          }),
        });

        const rawContent = response.choices?.[0]?.message?.content || "";
        code = this.extractBestCodeBlock(rawContent, resolvedFramework);
      } catch (err: any) {
        console.warn(`⚠️ [Muse Spark API] Remote generation failed (${err.message}). Using fallback synthesizer.`);
      }
    }

    if (!code) {
      code = this.getFallbackCode(resolvedFramework);
    }

    // Ensure SwiftUI has valid parameters and standalone @main App runner for Live Preview
    if (resolvedFramework === "SWIFTUI" || resolvedFramework === "SWIFTUI_SPRING") {
      code = code.replace(/dampingFactor:/g, "dampingFraction:");
      code = code.replace(/\.padding\(\.horizontal,\s*(\d+),\s*vertical:\s*(\d+)\)/g, ".padding(.horizontal, $1).padding(.vertical, $2)");
      code = code.replace(/\.padding\(\.vertical,\s*(\d+),\s*horizontal:\s*(\d+)\)/g, ".padding(.vertical, $1).padding(.horizontal, $2)");
      // Convert CSS-style numeric weights (e.g. weight: .800, weight: 700) to valid SwiftUI Font.Weight enum
      code = code.replace(/weight:\s*\.?100\b/g, "weight: .ultraLight");
      code = code.replace(/weight:\s*\.?200\b/g, "weight: .thin");
      code = code.replace(/weight:\s*\.?300\b/g, "weight: .light");
      code = code.replace(/weight:\s*\.?400\b/g, "weight: .regular");
      code = code.replace(/weight:\s*\.?500\b/g, "weight: .medium");
      code = code.replace(/weight:\s*\.?600\b/g, "weight: .semibold");
      code = code.replace(/weight:\s*\.?700\b/g, "weight: .bold");
      code = code.replace(/weight:\s*\.?800\b/g, "weight: .heavy");
      code = code.replace(/weight:\s*\.?900\b/g, "weight: .black");
      code = code.replace(
        /\.stroke\(([\s\S]*?),\s*lineWidth:\s*([^,)]+),\s*lineCap:\s*([^,)]+)\)/g,
        (match, content, lw, lc) => {
          if (content.includes("StrokeStyle")) return match;
          return `.stroke(${content}, style: StrokeStyle(lineWidth: ${lw}, lineCap: ${lc}))`;
        }
      );
      code = code.replace(
        /\.stroke\(([\s\S]*?),\s*lineCap:\s*([^,)]+),\s*lineWidth:\s*([^,)]+)\)/g,
        (match, content, lc, lw) => {
          if (content.includes("StrokeStyle")) return match;
          return `.stroke(${content}, style: StrokeStyle(lineWidth: ${lw}, lineCap: ${lc}))`;
        }
      );
      // Auto-heal iOS/UIKit-only colors, closures, and modifiers for macOS swiftc compatibility
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)systemGray6\s*\)/g, "Color(white: 0.95)");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)systemGray5\s*\)/g, "Color(white: 0.90)");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)systemGray4\s*\)/g, "Color(white: 0.84)");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)systemGray3\s*\)/g, "Color(white: 0.78)");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)systemGray2\s*\)/g, "Color(white: 0.68)");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)systemGray\s*\)/g, "Color.gray");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)systemBackground\s*\)/g, "Color.white");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)secondarySystemBackground\s*\)/g, "Color(white: 0.95)");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)tertiarySystemBackground\s*\)/g, "Color(white: 0.98)");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)systemGroupedBackground\s*\)/g, "Color(white: 0.95)");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)secondarySystemGroupedBackground\s*\)/g, "Color.white");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)label\s*\)/g, "Color.primary");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)secondaryLabel\s*\)/g, "Color.secondary");
      code = code.replace(/Color\(\s*(?:UIColor\s*\.\s*|\.\s*)separator\s*\)/g, "Color.gray.opacity(0.25)");
      code = code.replace(/(Button\s*\{[^\n]*\})\s*\{/g, "$1 label: {");
      code = code.replace(
        /((?:func\s+\w+|init)\s*(?:<[^>]+>)?\s*\([^)]*?)(?<!@ViewBuilder\s+)(\b(?:_\s+\w+|\w+(?:\s+\w+)?)\s*:\s*(?:@escaping\s*)?\(\)\s*->\s*(?:some\s+View|Content\b))/g,
        "$1@ViewBuilder $2"
      );
      code = code.replace(/UIScreen\.main\.bounds\.width/g, "800.0");
      code = code.replace(/UIScreen\.main\.bounds\.height/g, "700.0");
      code = code.replace(/\.listStyle\(\.insetGrouped\)/g, ".listStyle(.inset)");
      code = code.replace(/\.fullScreenCover\(/g, ".sheet(");
      code = code.replace(/\.navigationBarTitleDisplayMode\([^)]*\)/g, "");
      code = code.replace(/\.navigationBarHidden\([^)]*\)/g, "");
      code = code.replace(/\.navigationBarItems\([^)]*\)/g, "");
      code = code.replace(/\.statusBarHidden\([^)]*\)/g, "");
      code = code.replace(/\.statusBarStyle\([^)]*\)/g, "");
      code = code.replace(/\.presentationDragIndicator\([^)]*\)/g, "");
      code = code.replace(/\.keyboardType\([^)]*\)/g, "");
      code = code.replace(/\.textInputAutocapitalization\([^)]*\)/g, "");
      if (!code.includes("@main")) {
        const hasContentView = /struct\s+ContentView\s*:\s*View/.test(code);
        const allViewMatches = [...code.matchAll(/struct\s+(\w+)\s*:\s*View/g)];
        const mainViewName = hasContentView
          ? "ContentView"
          : allViewMatches.length > 0
            ? allViewMatches[allViewMatches.length - 1][1]
            : "ExtractedComponent";

        let idealW = 390;
        let idealH = 780;
        let minW = 320;
        let minH = 500;

        try {
          const imgBuf = Buffer.isBuffer(imageBufferOrBase64)
            ? imageBufferOrBase64
            : Buffer.from(base64Data, "base64");
          let meta: { width?: number; height?: number } = {};
          if (imgBuf.length >= 24 && imgBuf[0] === 0x89 && imgBuf[1] === 0x50) {
            meta = { width: imgBuf.readUInt32BE(16), height: imgBuf.readUInt32BE(20) };
          } else {
            const sharpMod: any = await import("sharp");
            const sharp = sharpMod.default || sharpMod;
            meta = await sharp(imgBuf).metadata();
          }
          if (meta.width && meta.height) {
            const ratio = meta.width / meta.height;
            if (ratio >= 1.2) {
              // Landscape layout (iPad / tablet / desktop / dashboard)
              idealW = Math.min(1200, Math.max(900, Math.round(meta.width)));
              idealH = Math.round(idealW / ratio);
              minW = 750;
              minH = 500;
            } else if (ratio <= 0.8) {
              // Portrait layout (mobile phone)
              idealW = 390;
              idealH = 780;
              minW = 320;
              minH = 500;
            } else {
              // Square or card layout
              idealW = Math.min(800, Math.max(520, Math.round(meta.width)));
              idealH = Math.round(idealW / ratio);
              minW = 400;
              minH = 400;
            }
          }
        } catch (err: any) {
          console.warn("Could not determine screenshot aspect ratio:", err.message);
        }

        code += `\n\n@main\nstruct PreviewApp: App {\n    var body: some Scene {\n        WindowGroup {\n            ${mainViewName}()\n                .frame(minWidth: ${minW}, idealWidth: ${idealW}, maxWidth: .infinity, minHeight: ${minH}, idealHeight: ${idealH}, maxHeight: .infinity)\n        }\n    }\n}\n`;
      }
    }

    // Save to stable /tmp/musedeck/ directory
    const tempDir = "/tmp/musedeck";
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, code, "utf8");
    console.log(`💾 [Muse Spark] Component saved to: ${filePath}`);

    return {
      code,
      framework: resolvedFramework,
      frameworkName,
      filename,
      filePath,
      explanation: `Generated by Meta Muse Spark for ${frameworkName}.`,
    };
  }

  private extractBestCodeBlock(rawContent: string, target: TargetFramework): string {
    const blocks: Array<{ lang: string; code: string; len: number }> = [];
    const regex = /```([a-zA-Z0-9_-]*)[ \t]*\n([\s\S]*?)(?:```|$)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(rawContent)) !== null) {
      const lang = (match[1] || "").toLowerCase().trim();
      const blockCode = match[2].trim();
      if (blockCode && lang !== "bash" && lang !== "sh" && lang !== "shell") {
        blocks.push({ lang, code: blockCode, len: blockCode.length });
      }
    }

    if (blocks.length === 0) {
      return rawContent.replace(/^```[a-zA-Z0-9_-]*\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    }

    const langMap: Record<string, string[]> = {
      PYTHON: ["python", "py"],
      SWIFTUI: ["swift"],
      SWIFTUI_SPRING: ["swift"],
      COMPOSE: ["kotlin", "kt"],
      COMPOSE_ANIM: ["kotlin", "kt"],
      FLUTTER: ["dart"],
      FLUTTER_ANIM: ["dart"],
      VUE: ["vue", "html"],
      VUE_ANIM: ["vue", "html"],
      REACT: ["tsx", "jsx", "typescript", "javascript"],
      FRAMER: ["tsx", "jsx", "typescript", "javascript"],
      TAILWIND_ANIM: ["html", "tsx", "jsx"],
      GSAP: ["html", "javascript", "js"],
      HTML_CSS: ["html"],
    };

    const preferred = langMap[target] || [];
    for (const p of preferred) {
      const found = blocks.find((b) => b.lang === p);
      if (found) return found.code;
    }

    // Otherwise, pick the longest non-shell code block
    blocks.sort((a, b) => b.len - a.len);
    return blocks[0].code;
  }

  private getFrameworkMeta(target: TargetFramework) {
    switch (target) {
      case "SWIFTUI":
        return {
          filename: "ExtractedComponent.swift",
          frameworkName: "Apple SwiftUI",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate production-ready, idiomatic Apple SwiftUI components targeting macOS (compiled via swiftc -parse-as-library) with modern styling, SF Symbols, and smooth animations. Do NOT use UIKit-only APIs such as UIColor, Color(.systemGray6), Color(.systemBackground), or UIScreen; use pure SwiftUI colors (e.g., Color(white: 0.95), Color.gray.opacity(0.12), Color.white), Button(action: { ... }) { ... }, and always annotate view-returning closure parameters with @ViewBuilder (e.g., @ViewBuilder _ content: () -> some View). The file must be 100% complete and self-contained so that swiftc compiles it cleanly.",
          prompt: "Convert this UI design into a complete, self-contained Apple SwiftUI View with @State and SF Symbols. Include all subviews and helpers inline in the same file so the code compiles with zero external dependencies.",
        };

      case "SWIFTUI_SPRING":
        return {
          filename: "AnimatedComponent.swift",
          frameworkName: "SwiftUI Interactive Flow",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate production-ready Apple SwiftUI Views targeting macOS (compiled via swiftc -parse-as-library) for interactive UI flows (modals, drawers, multi-step steppers, tab transitions, accordions, gesture interactions, and smooth animations with .animation(.spring()), TimelineView(.animation), and interactive @State). Do NOT use UIKit-only APIs such as UIColor, Color(.systemGray6), Color(.systemBackground), or UIScreen; use pure SwiftUI colors (e.g., Color(white: 0.95), Color.gray.opacity(0.12), Color.white), Button(action: { ... }) { ... }, and always annotate view-returning closure parameters with @ViewBuilder (e.g., @ViewBuilder _ content: () -> some View). Name the root view ContentView and keep the entire file concise (under 240 lines) so it never truncates and swiftc compiles it cleanly.",
          prompt: "The image shows an 8-step chronological storyboard grid (2 rows x 4 columns, t=0.6s to t=5.0s) captured at high frame rate from a screen recording. Analyze the micro-interactions, state transitions, spring dynamics, and animated elements across all 8 frames. Recreate this complete interactive UI flow in SwiftUI with a root ContentView, interactive state, spring/timeline animations, and realistic controls in under 240 lines.",
        };

      case "FRAMER":
        return {
          filename: "AnimatedComponent.tsx",
          frameworkName: "React + Framer Motion Flow",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate production-grade, accessible React + TypeScript components for interactive UI flows (modals, sheet drawers, multi-step wizards, accordion expands) with Framer Motion (motion.div, AnimatePresence, spring transition physics, and layout animations).",
          prompt: "The image shows an 8-step chronological storyboard grid (2 rows x 4 columns, t=0.6s to t=5.0s) from a screen recording. Analyze the state transitions and micro-interactions across the sequence and recreate this complete interactive UI flow in React with Framer Motion and Tailwind CSS.",
        };

      case "TAILWIND_ANIM":
        return {
          filename: "AnimatedComponent.tsx",
          frameworkName: "Tailwind CSS Interaction Flow",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate production-grade React + Tailwind CSS components with keyframes, transition utilities (transition-all duration-300 ease-out), and interactive hover/active states for UI flows.",
          prompt: "The image shows an 8-step chronological storyboard grid (2 rows x 4 columns) from a screen recording. Recreate this interactive UI component with smooth Tailwind CSS transitions and state management.",
        };

      case "COMPOSE_ANIM":
        return {
          filename: "AnimatedComponent.kt",
          frameworkName: "Compose Interactive Flow",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate idiomatic Android Jetpack Compose @Composable code using AnimatedVisibility, animateFloatAsState, and spring transitionSpec for interactive UI flows.",
          prompt: "The image shows an 8-step chronological storyboard grid (2 rows x 4 columns). Recreate this animated flow in Jetpack Compose.",
        };

      case "FLUTTER_ANIM":
        return {
          filename: "animated_component.dart",
          frameworkName: "Flutter Interactive Flow",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate Flutter StatefulWidget widgets using AnimatedContainer, CurvedAnimation(Curves.easeInOut), or Hero transitions for interactive UI flows.",
          prompt: "The image shows an 8-step chronological storyboard grid (2 rows x 4 columns). Recreate this interactive flow in Flutter.",
        };

      case "VUE_ANIM":
        return {
          filename: "AnimatedComponent.vue",
          frameworkName: "Vue 3 Transition Flow",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate Vue 3 Single File Components using <script setup lang=\"ts\"> and <Transition> wrappers with Tailwind CSS enter/leave classes for interactive flows.",
          prompt: "The image shows an 8-step chronological storyboard grid (2 rows x 4 columns). Recreate this interactive component in Vue 3.",
        };

      case "GSAP":
        return {
          filename: "animated_component.html",
          frameworkName: "HTML + GSAP Timelines",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate clean HTML5 + CSS3 with GSAP (GreenSock) CDN and interactive timeline animations for UI flows.",
          prompt: "The image shows an 8-step chronological storyboard grid (2 rows x 4 columns). Recreate this flow in standalone HTML with GSAP.",
        };

      case "COMPOSE":
        return {
          filename: "ExtractedComponent.kt",
          frameworkName: "Android Jetpack Compose",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate idiomatic, production-grade Android Jetpack Compose @Composable functions with Material 3 styling.",
          prompt: "Convert this UI design into an Android Jetpack Compose @Composable function with Material 3 styling.",
        };

      case "FLUTTER":
        return {
          filename: "extracted_component.dart",
          frameworkName: "Flutter Dart",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate production-ready Flutter StatelessWidget/StatefulWidget widgets with modern Material/Cupertino styling.",
          prompt: "Convert this UI design into a modern Flutter widget using Dart.",
        };

      case "HTML_CSS":
        return {
          filename: "extracted_component.html",
          frameworkName: "HTML5 + Vanilla CSS",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate semantic HTML5 and clean, modern CSS3 flexbox/grid layout without any frameworks.",
          prompt: "Convert this UI design into pure semantic HTML5 and clean CSS3.",
        };

      case "VUE":
        return {
          filename: "ExtractedComponent.vue",
          frameworkName: "Vue 3 SFC",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate clean Vue 3 Single File Components using <script setup lang=\"ts\"> and Tailwind CSS.",
          prompt: "Convert this UI design into a Vue 3 component with <script setup> and Tailwind CSS.",
        };

      case "PYTHON":
        return {
          filename: "extracted_component.py",
          frameworkName: "Python UI (Streamlit)",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate clean, modern Python Streamlit or CustomTkinter UI code.",
          prompt: "Convert this UI design into a modern Python Streamlit component.",
        };

      case "REACT":
      default:
        return {
          filename: "ExtractedComponent.tsx",
          frameworkName: "React + Tailwind CSS",
          systemPrompt: "You are Muse Spark, Meta's multimodal engineering agent. Generate production-grade, clean, accessible React 19 / 18 + TypeScript + Tailwind CSS components.",
          prompt: "Convert this extracted UI component into a modern React component using TypeScript and Tailwind CSS.",
        };
    }
  }

  private getFallbackCode(target: TargetFramework): string {
    switch (target) {
      case "SWIFTUI_SPRING":
        return `import SwiftUI

public struct AnimatedComponent: View {
    @State private var isExpanded: Bool = false
    @State private var isPressed: Bool = false
    @State private var count: Int = 12

    public var body: some View {
        VStack(spacing: 20) {
            // Animated Header Badge
            HStack {
                ZStack {
                    Circle()
                        .fill(isExpanded ? Color.purple : Color.blue)
                        .frame(width: 48, height: 48)
                        .scaleEffect(isPressed ? 0.92 : 1.0)
                    Image(systemName: isExpanded ? "waveform.path.ecg" : "sparkles")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.white)
                        .rotationEffect(.degrees(isExpanded ? 180 : 0))
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Interactive Flow Card")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                    Text(isExpanded ? "Live Spring Physics Active" : "Tap Card to Expand")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                Spacer()
            }

            // Expanding Content Card with Spring Animation
            if isExpanded {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Synthesized from Video Flow")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.9))
                    
                    HStack {
                        Label("Spring Physics", systemImage: "bolt.fill")
                            .font(.caption)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.purple.opacity(0.3))
                            .cornerRadius(8)
                            .foregroundColor(.purple)
                        
                        Label("Fluid UI", systemImage: "sparkle")
                            .font(.caption)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.blue.opacity(0.3))
                            .cornerRadius(8)
                            .foregroundColor(.cyan)
                    }
                }
                .transition(.asymmetric(
                    insertion: .scale(scale: 0.85).combined(with: .opacity),
                    removal: .opacity
                ))
            }

            // Interactive Trigger Button
            Button(action: {
                withAnimation(.spring(response: 0.45, dampingFraction: 0.65)) {
                    isExpanded.toggle()
                }
            }) {
                HStack {
                    Text(isExpanded ? "Collapse View" : "Trigger Flow Animation")
                        .font(.system(size: 15, weight: .semibold))
                    Spacer()
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                }
                .padding()
                .background(isExpanded ? Color.purple : Color.blue)
                .foregroundColor(.white)
                .cornerRadius(14)
                .scaleEffect(isPressed ? 0.96 : 1.0)
            }
            .buttonStyle(PlainButtonStyle())
            .simultaneousGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in isPressed = true }
                    .onEnded { _ in isPressed = false }
            )
        }
        .padding(22)
        .background(Color(red: 0.08, green: 0.10, blue: 0.16))
        .cornerRadius(22)
        .overlay(
            RoundedRectangle(cornerRadius: 22)
                .stroke(isExpanded ? Color.purple.opacity(0.6) : Color.white.opacity(0.12), lineWidth: 1.5)
        )
        .frame(maxWidth: 360)
        .shadow(color: isExpanded ? Color.purple.opacity(0.25) : Color.black.opacity(0.3), radius: 20, y: 10)
    }
}
`;

      case "SWIFTUI":
        return `import SwiftUI

public struct ExtractedComponent: View {
    @State private var isHovered: Bool = false
    @State private var isActive: Bool = false

    public var title: String = "Meta Muse Component"
    public var subtitle: String = "Synthesized with Meta Muse Spark"
    public var onAction: (() -> Void)? = nil

    public var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(LinearGradient(colors: [.blue, .purple], startPoint: .topLeading, endPoint: .bottomTrailing))
                        .frame(width: 44, height: 44)
                    Image(systemName: "sparkles")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(.white)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(.white)
                    Label("SwiftUI Native", systemImage: "checkmark.seal.fill")
                        .font(.caption2)
                        .foregroundColor(.green)
                }
            }
            Text(subtitle)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)

            Button(action: { onAction?() }) {
                HStack {
                    Text("Execute Action")
                        .fontWeight(.semibold)
                    Spacer()
                    Image(systemName: "arrow.right")
                }
                .padding()
                .background(Color.white.opacity(0.12))
                .cornerRadius(12)
                .foregroundColor(.white)
            }
        }
        .padding(20)
        .background(Color(red: 0.08, green: 0.10, blue: 0.16))
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.white.opacity(0.1), lineWidth: 1))
        .frame(maxWidth: 360)
    }
}
`;

      case "COMPOSE":
        return `package com.meta.musedeck.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun ExtractedComponent(
    title: String = "Meta Muse Component",
    subtitle: String = "Synthesized with Meta Muse Spark",
    onAction: () -> Unit = {}
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF111827))
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(text = title, style = MaterialTheme.typography.titleMedium, color = Color.White)
            Text(text = subtitle, style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = onAction,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Execute Compose Action")
            }
        }
    }
}
`;

      case "FLUTTER":
        return `import 'package:flutter/material.dart';

class ExtractedComponent extends StatelessWidget {
  final String title;
  final String subtitle;
  final VoidCallback? onAction;

  const ExtractedComponent({
    super.key,
    this.title = "Meta Muse Component",
    this.subtitle = "Synthesized with Meta Muse Spark",
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(subtitle, style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14)),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: onAction,
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF38BDF8)),
            child: const Center(child: Text("Execute Flutter Action", style: TextStyle(color: Colors.black))),
          ),
        ],
      ),
    );
  }
}
`;

      case "HTML_CSS":
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Extracted Component</title>
  <style>
    .muse-card {
      background: #090d16;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 24px;
      max-width: 380px;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .muse-card h3 { margin: 0 0 8px 0; font-size: 20px; font-weight: 700; }
    .muse-card p { margin: 0 0 20px 0; color: #94a3b8; font-size: 14px; line-height: 1.5; }
    .muse-btn {
      display: block;
      width: 100%;
      padding: 12px 16px;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="muse-card">
    <h3>Meta Muse Component</h3>
    <p>Synthesized semantic HTML5 and clean CSS3 via Meta Muse Spark.</p>
    <button class="muse-btn">Execute Action</button>
  </div>
</body>
</html>
`;

      case "VUE":
        return `<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()

const emit = defineEmits(['action'])
</script>

<template>
  <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white max-w-sm shadow-2xl">
    <div class="flex items-center space-x-3 mb-3">
      <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
        ⚡
      </div>
      <div>
        <h3 class="font-bold text-lg leading-tight">{{ title || 'Meta Muse Component' }}</h3>
        <span class="text-xs text-emerald-400">Vue 3 Single File Component</span>
      </div>
    </div>
    <p class="text-sm text-slate-400 mb-5">{{ subtitle || 'Synthesized with Meta Muse Spark' }}</p>
    <button
      @click="emit('action')"
      class="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold text-sm transition"
    >
      Execute Vue Action
    </button>
  </div>
</template>
`;

      case "PYTHON":
        return `"""
Extracted Component for Python (Streamlit UI)
Synthesized with Meta Muse Spark
"""
import streamlit as st

def render_extracted_component(
    title="Meta Muse Component",
    subtitle="Synthesized with Meta Muse Spark"
):
    with st.container():
        st.markdown(f"""
        <div style="background-color: #0b1329; padding: 20px; border-radius: 16px; border: 1px solid #1e293b;">
            <h3 style="color: #38bdf8; margin: 0 0 6px 0;">{title}</h3>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">{subtitle}</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Execute Python Action", key="muse_btn"):
            st.success("Action Executed Successfully!")

if __name__ == "__main__":
    st.set_page_config(page_title="MuseDeck Python Component", layout="centered")
    render_extracted_component()
`;

      case "REACT":
      default:
        return `import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export interface ExtractedUIProps {
  title?: string;
  description?: string;
  onAction?: () => void;
}

export const ExtractedUIComponent: React.FC<ExtractedUIProps> = ({
  title = "Meta Muse Component",
  description = "Synthesized from UI screenshot with Meta Muse Spark",
  onAction
}) => {
  return (
    <div className="flex flex-col p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl backdrop-blur-md max-w-sm">
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-white tracking-tight">{title}</h3>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Muse Spark Verified
          </span>
        </div>
      </div>
      <p className="text-sm text-zinc-400 mb-5 leading-relaxed">{description}</p>
      <button
        onClick={onAction}
        className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all text-white font-medium text-sm flex items-center justify-center space-x-2 border border-white/10"
      >
        <span>Execute Workflow</span>
        <ArrowRight className="w-4 h-4 text-zinc-300" />
      </button>
    </div>
  );
};
`;
    }
  }
}
