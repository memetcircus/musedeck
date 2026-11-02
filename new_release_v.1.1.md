# MuseDeck v1.1.0 — Elgato Marketplace (Maker Console) Release Notes

Copy and paste the markdown block below into the **Release Notes** field when submitting the **v1.1.0 (`1.1.0.0`)** update in the Elgato Maker Console:

```markdown
MuseDeck v1.1.0 update for Elgato Stream Deck (macOS):

- **Multimodal Live Preview Engine (`IMG TO CODE` & `VID TO CODE`):**
  - **React / Tailwind CSS / Framer Motion / Vue 3:** Fixed standalone `.sdPlugin` module resolution for TypeScript/JSX transpilation with built-in `@babel/standalone` fallback so web previews launch reliably in the browser on any macOS machine.
  - **macOS SwiftUI Auto-Healer:** Fixed native macOS `swiftc` live preview compilation failures when AI-generated SwiftUI code includes iOS/UIKit-only system colors (`Color(.systemGray6)`..`Color(.systemGray2)`, `Color(.systemBackground)`), shorthand multi-closure `Button { ... } { ... }` syntax, helper view functions missing `@ViewBuilder`, or unclosed struct braces before `@main`.
- **5-Second Screen Flow Recording HUD & Countdown:** Bundled native `wait-mouse-release` helper with CoreGraphics HID button state detection so the 5-second recording countdown (`0:05 -> 0:01`) and `STOP` control activate immediately upon releasing the selection crosshair.
- **Native Xcode Priority for SwiftUI Files & Silent Standalone Synthesis:** `.swift` components now open directly in Xcode when installed, and standalone multimodal synthesis no longer triggers a missing-terminal notification when no active Muse Code CLI session is open.
- **Elgato Stream Deck SDK v3 Upgrade:** Upgraded `@elgato/streamdeck` runtime to `v3.0.4` (`SDKVersion: 3`) for full compatibility with the latest Stream Deck 7.1+ validation requirements.
```

