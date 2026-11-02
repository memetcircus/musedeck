# MuseDeck v1.1.0 — Elgato Marketplace (Maker Console) Release Notes

Copy and paste the markdown block below into the **Release Notes** field when submitting the **v1.1.0 (`1.1.0.0`)** update in the Elgato Maker Console:

```markdown
MuseDeck v1.1.0 update for Elgato Stream Deck (macOS):

- **macOS SwiftUI Live Preview Auto-Healer (`IMG TO CODE` & `VID TO CODE`):** Fixed native macOS `swiftc` live preview compilation failures when AI-generated SwiftUI code includes iOS/UIKit-only system colors (`Color(.systemGray6)`..`Color(.systemGray2)`, `Color(.systemBackground)`, `Color(.secondarySystemBackground)`), shorthand multi-closure `Button { ... } { ... }` syntax without an explicit `label:` argument, or helper view functions missing `@ViewBuilder` annotations on view-returning closures. The built-in SwiftUI compiler sanitizer now automatically translates these patterns into valid macOS SwiftUI syntax before compiling the standalone `PreviewApp` binary.
- **Native Xcode Priority for SwiftUI Files & Silent Standalone Synthesis:** `.swift` components synthesized via `IMG TO CODE` or `VID TO CODE` now open directly in Xcode when installed, and standalone multimodal synthesis no longer triggers a missing-terminal notification when no active Muse Code CLI session is open.
- **Improved Muse Spark 1.3 SwiftUI System Prompts:** Updated multimodal synthesis prompts for `SWIFTUI` and `SWIFTUI_SPRING` targets to enforce concise, self-contained macOS-compatible SwiftUI syntax (`ContentView` root view, `@ViewBuilder` closures, and zero UIKit dependencies).
- **Elgato Stream Deck SDK v3 Upgrade:** Upgraded `@elgato/streamdeck` runtime to `v3.0.4` (`SDKVersion: 3`) for full compatibility with the latest Stream Deck 7.1+ validation requirements.
```

