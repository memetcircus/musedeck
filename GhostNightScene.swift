import SwiftUI

// MARK: - Main Scene (matches screen recording)
struct GhostNightSceneView: View {
    var body: some View {
        TimelineView(.animation) { timeline in
            let t = timeline.date.timeIntervalSinceReferenceDate
            GeometryReader { geo in
                let w = geo.size.width
                let h = geo.size.height
                ZStack {
                    // Sky
                    LinearGradient(
                        colors: [Color(hex: "0E2242"), Color(hex: "162E55")],
                        startPoint: .top, endPoint: .bottom
                    )

                    // Moon (top-left, nearly static with slight drift)
                    MoonView()
                        .frame(width: w * 0.16, height: w * 0.16)
                        .position(x: w * 0.14, y: h * 0.14)

                    // Clouds — slow parallax
                    ParallaxStrip(speed: 12, patternWidth: w, time: t, y: h * 0.10) {
                        CloudRow(width: w)
                    }
                    ParallaxStrip(speed: 18, patternWidth: w, time: t, y: h * 0.20) {
                        CloudRow(width: w, variant: true)
                    }

                    // Far tree silhouette
                    ParallaxStrip(speed: 28, patternWidth: w, time: t, y: h * 0.38) {
                        FarTreesRow(width: w, height: h * 0.30)
                    }

                    // Mid hill
                    HillsView()
                        .position(x: w / 2, y: h * 0.52)
                        .frame(width: w, height: h * 0.25)

                    // Mausoleum / crypt building — medium parallax
                    ParallaxStrip(speed: 55, patternWidth: w * 1.2, time: t, y: h * 0.58) {
                        BuildingRow(width: w * 1.2, height: h * 0.32)
                    }

                    // Ground base
                    Rectangle()
                        .fill(Color(hex: "2E5C68"))
                        .frame(height: h * 0.30)
                        .position(x: w / 2, y: h * 0.85)

                    // Ground darker top edge
                    Rectangle()
                        .fill(Color(hex: "243B4E"))
                        .frame(height: 6)
                        .position(x: w / 2, y: h * 0.705)

                    // Road dashes — fast parallax
                    ParallaxStrip(speed: 110, patternWidth: w, time: t, y: h * 0.82) {
                        RoadDashesRow(width: w)
                    }

                    // Ghost shadow
                    let bob = sin(t * 2.2) * 8
                    Ellipse()
                        .fill(Color.black.opacity(0.35))
                        .frame(width: w * 0.42, height: 18)
                        .position(x: w * 0.46, y: h * 0.82 - bob * 0.3)

                    // Ghost
                    GhostView(time: t)
                        .frame(width: w * 0.40, height: h * 0.44)
                        .position(x: w * 0.44, y: h * 0.63 + bob)

                    // Foreground bushes — fastest parallax, bottom
                    ParallaxStrip(speed: 150, patternWidth: w, time: t, y: h * 0.96) {
                        BushesRow(width: w)
                    }

                    // Foreground grass tufts
                    GrassTuft()
                        .fill(Color(hex: "101B2E"))
                        .frame(width: 40, height: 20)
                        .position(x: w * 0.18 + CGFloat(sin(t * 0.5) * 4), y: h * 0.95)
                    GrassTuft()
                        .fill(Color(hex: "101B2E"))
                        .frame(width: 44, height: 22)
                        .position(x: w * 0.84, y: h * 0.78)
                }
                .frame(width: w, height: h)
                .clipped()
                .cornerRadius(12)
            }
        }
    }
}

// MARK: - Parallax helper (seamless loop)
struct ParallaxStrip<Content: View>: View {
    var speed: Double
    var patternWidth: CGFloat
    var time: Double
    var y: CGFloat
    @ViewBuilder var content: () -> Content

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let offset = -CGFloat(fmod(time * speed, Double(patternWidth)))
            HStack(spacing: 0) {
                content()
                content()
                content()
            }
            .frame(width: patternWidth * 3, alignment: .leading)
            .position(x: w / 2 + offset + patternWidth / 2, y: y)
        }
    }
}

// MARK: - Sky elements
struct MoonView: View {
    var body: some View {
        GeometryReader { geo in
            let s = min(geo.size.width, geo.size.height)
            ZStack {
                Circle().fill(Color.white)
                Circle().fill(Color(hex: "E4E6EA").opacity(0.9))
                    .frame(width: s * 0.28, height: s * 0.28)
                    .offset(x: -s * 0.12, y: -s * 0.10)
                Circle().fill(Color(hex: "EDEFF2"))
                    .frame(width: s * 0.16, height: s * 0.16)
                    .offset(x: s * 0.16, y: s * 0.12)
                Circle().fill(Color(hex: "E4E6EA").opacity(0.7))
                    .frame(width: s * 0.10, height: s * 0.10)
                    .offset(x: s * 0.02, y: s * 0.22)
            }
            .shadow(color: .white.opacity(0.25), radius: 18)
        }
    }
}

struct CloudRow: View {
    var width: CGFloat
    var variant: Bool = false
    var body: some View {
        HStack(spacing: width * 0.25) {
            CloudShape().fill(Color(hex: "9AA3B2").opacity(0.85))
                .frame(width: width * 0.22, height: 22)
                .offset(y: variant ? 30 : 0)
            CloudShape().fill(Color(hex: "8B95A8").opacity(0.9))
                .frame(width: width * 0.16, height: 18)
                .offset(y: variant ? -6 : 12)
        }
        .frame(width: width, alignment: .leading)
        .padding(.leading, variant ? width * 0.4 : width * 0.1)
    }
}

struct CloudShape: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let h = rect.height
        p.addEllipse(in: CGRect(x: rect.minX, y: rect.minY + h * 0.3, width: rect.width * 0.45, height: h * 0.7))
        p.addEllipse(in: CGRect(x: rect.minX + rect.width * 0.25, y: rect.minY, width: rect.width * 0.45, height: h))
        p.addEllipse(in: CGRect(x: rect.minX + rect.width * 0.55, y: rect.minY + h * 0.35, width: rect.width * 0.4, height: h * 0.65))
        return p
    }
}

// MARK: - Midground
struct FarTreesRow: View {
    var width: CGFloat
    var height: CGFloat
    var body: some View {
        HStack(alignment: .bottom, spacing: 0) {
            TreeSilhouette().fill(Color(hex: "14182B")).frame(width: width * 0.3, height: height)
            TreeSilhouette(small: true).fill(Color(hex: "1A2036")).frame(width: width * 0.22, height: height * 0.8)
            TreeSilhouette().fill(Color(hex: "14182B")).frame(width: width * 0.34, height: height * 1.05)
        }
        .frame(width: width, alignment: .leading)
    }
}

struct TreeSilhouette: Shape {
    var small: Bool = false
    func path(in rect: CGRect) -> Path {
        var p = Path()
        // trunk
        let trunkW: CGFloat = small ? 10 : 14
        p.addRect(CGRect(x: rect.midX - trunkW / 2, y: rect.midY, width: trunkW, height: rect.height / 2))
        // canopy blobs
        p.addEllipse(in: CGRect(x: rect.minX + rect.width * 0.1, y: rect.minY + rect.height * 0.15, width: rect.width * 0.8, height: rect.height * 0.6))
        p.addEllipse(in: CGRect(x: rect.minX + rect.width * 0.25, y: rect.minY, width: rect.width * 0.5, height: rect.height * 0.45))
        return p
    }
}

struct HillsView: View {
    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width; let h = geo.size.height
            Path { p in
                p.move(to: CGPoint(x: 0, y: h))
                p.addLine(to: CGPoint(x: 0, y: h * 0.5))
                p.addQuadCurve(to: CGPoint(x: w * 0.4, y: h * 0.35), control: CGPoint(x: w * 0.2, y: h * 0.1))
                p.addQuadCurve(to: CGPoint(x: w, y: h * 0.55), control: CGPoint(x: w * 0.7, y: h * 0.6))
                p.addLine(to: CGPoint(x: w, y: h))
                p.closeSubpath()
            }
            .fill(Color(hex: "101527"))
        }
    }
}

struct BuildingRow: View {
    var width: CGFloat
    var height: CGFloat
    var body: some View {
        HStack(spacing: width * 0.08) {
            ForEach(0..<2) { _ in
                ZStack {
                    CryptBuilding().fill(Color(hex: "232842"))
                    CryptWindows()
                }
                .frame(width: width * 0.5, height: height)
            }
        }
        .frame(width: width, alignment: .leading)
    }
}

// Flat-roof mausoleum with 3 arches, drawn as one shape with arch cutouts via mask
struct CryptBuilding: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let roofH = rect.height * 0.18
        // roof
        p.addRoundedRect(in: CGRect(x: rect.minX, y: rect.minY, width: rect.width, height: roofH + 10), cornerSize: CGSize(width: 18, height: 18))
        // body
        p.addRect(CGRect(x: rect.minX + 6, y: rect.minY + roofH, width: rect.width - 12, height: rect.height - roofH))
        return p
    }
}

// Overlay arches (light windows like in recording)
struct CryptWindows: View {
    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width; let h = geo.size.height
            HStack(spacing: w * 0.06) {
                ForEach(0..<3) { i in
                    RoundedTopRect()
                        .fill(i == 1 ? Color(hex: "C9CDD4") : Color(hex: "101527"))
                        .frame(width: w * 0.2, height: h * 0.45)
                }
            }
            .position(x: w / 2, y: h * 0.68)
        }
    }
}

struct RoundedTopRect: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let r = rect.width / 2
        p.move(to: CGPoint(x: rect.minX, y: rect.maxY))
        p.addLine(to: CGPoint(x: rect.minX, y: rect.minY + r))
        p.addArc(center: CGPoint(x: rect.midX, y: rect.minY + r), radius: r, startAngle: .degrees(180), endAngle: .degrees(0), clockwise: false)
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        p.closeSubpath()
        return p
    }
}

// MARK: - Ground details
struct RoadDashesRow: View {
    var width: CGFloat
    var body: some View {
        HStack(spacing: width * 0.3) {
            ForEach(0..<3) { _ in
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color(hex: "8A9AA0").opacity(0.6))
                    .frame(width: width * 0.28, height: 6)
            }
        }
        .frame(width: width, alignment: .leading)
    }
}

struct BushesRow: View {
    var width: CGFloat
    var body: some View {
        HStack(spacing: width * 0.35) {
            BushShape().fill(Color(hex: "1A2438")).frame(width: width * 0.4, height: 44)
            BushShape().fill(Color(hex: "1A2438")).frame(width: width * 0.32, height: 36)
        }
        .frame(width: width, alignment: .leading)
    }
}

struct BushShape: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.addEllipse(in: CGRect(x: rect.minX, y: rect.minY + rect.height * 0.3, width: rect.width * 0.4, height: rect.height * 0.7))
        p.addEllipse(in: CGRect(x: rect.minX + rect.width * 0.3, y: rect.minY, width: rect.width * 0.45, height: rect.height))
        p.addEllipse(in: CGRect(x: rect.minX + rect.width * 0.6, y: rect.minY + rect.height * 0.35, width: rect.width * 0.38, height: rect.height * 0.65))
        return p
    }
}

struct GrassTuft: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let base = CGPoint(x: rect.midX, y: rect.maxY)
        for (dx, hFrac): (CGFloat, CGFloat) in [(-0.35, 0.9), (-0.15, 1.0), (0.05, 0.75), (0.25, 1.0), (0.4, 0.7)] {
            p.move(to: base)
            p.addQuadCurve(
                to: CGPoint(x: rect.midX + dx * rect.width, y: rect.minY + (1 - hFrac) * rect.height * 0.4),
                control: CGPoint(x: base.x + dx * rect.width * 0.3, y: base.y - rect.height * 0.5)
            )
            p.addLine(to: CGPoint(x: rect.midX + dx * rect.width + 4, y: rect.minY + (1 - hFrac) * rect.height * 0.4 + 2))
            p.addQuadCurve(to: base, control: CGPoint(x: base.x + 2, y: base.y - rect.height * 0.4))
        }
        return p
    }
}

// MARK: - Ghost + Lantern
struct GhostView: View {
    var time: Double
    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width; let h = geo.size.height
            ZStack {
                // body
                GhostShape()
                    .fill(
                        LinearGradient(colors: [Color(hex: "F2F3F5"), Color(hex: "C9CDD4")], startPoint: .topLeading, endPoint: .bottomTrailing)
                    )
                    .frame(width: w * 0.62, height: h * 0.9)
                    .offset(x: -w * 0.12)
                    .shadow(color: .black.opacity(0.2), radius: 6, y: 4)

                // right-side shading
                GhostShade()
                    .fill(Color(hex: "A8AEB9").opacity(0.55))
                    .frame(width: w * 0.62, height: h * 0.9)
                    .offset(x: -w * 0.12)

                // fold line
                Path { p in
                    p.move(to: CGPoint(x: w * 0.32, y: h * 0.44))
                    p.addQuadCurve(to: CGPoint(x: w * 0.26, y: h * 0.66), control: CGPoint(x: w * 0.34, y: h * 0.56))
                }
                .stroke(Color(hex: "3A3F4B"), lineWidth: 2)
                .offset(x: -w * 0.12)

                // eyes
                HStack(spacing: w * 0.06) {
                    Capsule().fill(Color(hex: "1E2330")).frame(width: 8, height: 14)
                    Capsule().fill(Color(hex: "1E2330")).frame(width: 8, height: 14)
                }
                .position(x: w * 0.36, y: h * 0.36)

                // lantern glow (behind arm + body so they stay solid)
                Circle()
                    .fill(RadialGradient(colors: [.yellow.opacity(0.5), .clear], center: .center, startRadius: 4, endRadius: 70))
                    .frame(width: 140, height: 140)
                    .position(x: w * 0.78, y: h * 0.64)

                // arm
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color(hex: "E8EAED"))
                    .frame(width: w * 0.30, height: h * 0.10)
                    .rotationEffect(.degrees(-12))
                    .position(x: w * 0.55, y: h * 0.55)

                // lantern with swing
                LanternView()
                    .frame(width: w * 0.22, height: h * 0.30)
                    .rotationEffect(.degrees(sin(time * 2.2 + 0.6) * 7), anchor: .top)
                    .position(x: w * 0.78, y: h * 0.62)
            }
            .position(x: w / 2, y: h / 2)
        }
    }
}

struct GhostShape: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let w = rect.width; let h = rect.height
        // top dome
        p.move(to: CGPoint(x: rect.minX + w * 0.1, y: rect.maxY - 6))
        p.addCurve(
            to: CGPoint(x: rect.minX + w * 0.5, y: rect.minY),
            control1: CGPoint(x: rect.minX + w * 0.12, y: rect.minY + h * 0.45),
            control2: CGPoint(x: rect.minX + w * 0.18, y: rect.minY)
        )
        p.addCurve(
            to: CGPoint(x: rect.minX + w * 0.88, y: rect.minY + h * 0.5),
            control1: CGPoint(x: rect.minX + w * 0.82, y: rect.minY),
            control2: CGPoint(x: rect.minX + w * 0.88, y: rect.minY + h * 0.25)
        )
        // right side down to wavy hem
        p.addLine(to: CGPoint(x: rect.minX + w * 0.82, y: rect.maxY - 10))
        // wavy bottom (3 waves)
        p.addQuadCurve(to: CGPoint(x: rect.minX + w * 0.60, y: rect.maxY), control: CGPoint(x: rect.minX + w * 0.72, y: rect.maxY - 18))
        p.addQuadCurve(to: CGPoint(x: rect.minX + w * 0.38, y: rect.maxY - 4), control: CGPoint(x: rect.minX + w * 0.49, y: rect.maxY + 6))
        p.addQuadCurve(to: CGPoint(x: rect.minX + w * 0.10, y: rect.maxY - 6), control: CGPoint(x: rect.minX + w * 0.24, y: rect.maxY - 16))
        p.closeSubpath()
        return p
    }
}

struct GhostShade: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let w = rect.width; let h = rect.height
        p.move(to: CGPoint(x: rect.minX + w * 0.62, y: rect.minY + h * 0.08))
        p.addQuadCurve(to: CGPoint(x: rect.minX + w * 0.66, y: rect.maxY - 8), control: CGPoint(x: rect.minX + w * 0.58, y: h * 0.5))
        p.addLine(to: CGPoint(x: rect.minX + w * 0.82, y: rect.maxY - 10))
        p.addLine(to: CGPoint(x: rect.minX + w * 0.88, y: rect.minY + h * 0.5))
        p.addQuadCurve(to: CGPoint(x: rect.minX + w * 0.62, y: rect.minY + h * 0.08), control: CGPoint(x: rect.minX + w * 0.80, y: rect.minY + h * 0.12))
        p.closeSubpath()
        return p
    }
}

struct LanternView: View {
    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width; let h = geo.size.height
            VStack(spacing: 0) {
                // ring handle
                Circle()
                    .stroke(Color(hex: "D97B2E"), lineWidth: 3)
                    .frame(width: w * 0.42, height: w * 0.42)
                // cap
                Path { p in
                    p.move(to: CGPoint(x: w * 0.18, y: 8))
                    p.addLine(to: CGPoint(x: w * 0.82, y: 8))
                    p.addLine(to: CGPoint(x: w * 0.68, y: 0))
                    p.addLine(to: CGPoint(x: w * 0.32, y: 0))
                    p.closeSubpath()
                }
                .fill(Color(hex: "D97B2E"))
                .frame(width: w * 0.8, height: 10)
                // glass
                RoundedRectangle(cornerRadius: 4)
                    .fill(LinearGradient(colors: [Color(hex: "FFE6A3"), Color(hex: "FFB84D")], startPoint: .top, endPoint: .bottom))
                    .frame(width: w * 0.66, height: h * 0.42)
                    .overlay(
                        RoundedRectangle(cornerRadius: 4)
                            .stroke(Color(hex: "8A4A1A"), lineWidth: 2)
                    )
                    .shadow(color: .orange.opacity(0.8), radius: 12)
                // base
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color(hex: "D97B2E"))
                    .frame(width: w * 0.72, height: 6)
                // bottom tip
                Circle().fill(Color(hex: "8A4A1A"))
                    .frame(width: 6, height: 6)
            }
            .position(x: w / 2, y: h / 2)
        }
    }
}

// MARK: - Hex helper
extension Color {
    init(hex: String) {
        let h = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: h).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch h.count {
        case 6: (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: Double(a) / 255)
    }
}

struct GhostNightSceneView_Previews: PreviewProvider {
    static var previews: some View {
        GhostNightSceneView()
            .frame(width: 400, height: 400)
    }
}
