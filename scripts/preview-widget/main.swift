// Renders the widget layouts to a PNG contact sheet for design review, using
// the very same view code the extension ships. Run via scripts/preview-ios-widget.sh.
import SwiftUI
import AppKit

let outPath = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "widget-preview.png"

func entry(balance: Double, daily: Double = 100, tone: String, lang: String,
           trusted: Bool = true, currency: String = "ILS") -> CalmSpendEntry {
    let snap = CalmSpendSnapshot(
        balance: balance, dailyBudget: daily, currency: currency, tone: tone,
        lang: lang, lastAccrualDate: "2026-10-18", monthEnd: "reset", updatedAt: 0
    )
    return CalmSpendEntry(date: Date(), snapshot: snap, balance: balance, trusted: trusted)
}

struct Tile: View {
    let title: String
    let entry: CalmSpendEntry
    let layout: CalmSpendLayout
    let dark: Bool
    let size: CGSize

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(.secondary)
            CalmSpendWidgetContent(entry: entry, layout: layout, dark: dark)
                .padding(layout == .wide ? 18 : 16)
                .frame(width: size.width, height: size.height)
                .background(Brand.page(dark))
                .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        }
    }
}

let small = CGSize(width: 170, height: 170)
let medium = CGSize(width: 364, height: 170)

let sheet = VStack(alignment: .leading, spacing: 26) {
    Text("Calm Spend — home screen widget")
        .font(.system(size: 20, weight: .bold))

    HStack(alignment: .top, spacing: 22) {
        Tile(title: "Small · light", entry: entry(balance: 240, tone: "normal", lang: "en"),
             layout: .compact, dark: false, size: small)
        Tile(title: "Small · dark", entry: entry(balance: 240, tone: "normal", lang: "en"),
             layout: .compact, dark: true, size: small)
        Tile(title: "Small · Hebrew", entry: entry(balance: 240, tone: "normal", lang: "he"),
             layout: .compact, dark: false, size: small)
    }

    HStack(alignment: .top, spacing: 22) {
        Tile(title: "Running low (amber)", entry: entry(balance: 12, tone: "low", lang: "en"),
             layout: .compact, dark: false, size: small)
        Tile(title: "Over budget (red)", entry: entry(balance: -38, tone: "over", lang: "en"),
             layout: .compact, dark: false, size: small)
        Tile(title: "Needs a refresh", entry: entry(balance: 240, tone: "normal", lang: "en", trusted: false),
             layout: .compact, dark: false, size: small)
    }

    HStack(alignment: .top, spacing: 22) {
        Tile(title: "Medium · light", entry: entry(balance: 1240, tone: "normal", lang: "en"),
             layout: .wide, dark: false, size: medium)
        Tile(title: "Medium · Hebrew, dark", entry: entry(balance: 1240, tone: "normal", lang: "he"),
             layout: .wide, dark: true, size: medium)
    }
}
.padding(34)
.background(Color(red: 0.96, green: 0.96, blue: 0.97))

// ImageRenderer is MainActor-isolated, so the render hops onto the main actor.
MainActor.assumeIsolated {
    let renderer = ImageRenderer(content: sheet)
    renderer.scale = 2.0

    guard let image = renderer.nsImage,
          let tiff = image.tiffRepresentation,
          let rep = NSBitmapImageRep(data: tiff),
          let png = rep.representation(using: .png, properties: [:]) else {
        print("could not render"); exit(1)
    }
    try! png.write(to: URL(fileURLWithPath: outPath))
    print("wrote \(outPath)")
}
