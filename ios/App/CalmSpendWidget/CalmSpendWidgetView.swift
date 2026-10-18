import WidgetKit
import SwiftUI

// MARK: - Brand palette (mirrors the @theme tokens in src/index.css)

enum Brand {
    static func page(_ dark: Bool) -> Color {
        dark ? Color(red: 0.07, green: 0.08, blue: 0.12) : Color(red: 0.86, green: 0.88, blue: 0.95)
    }
    static func heading(_ dark: Bool) -> Color {
        dark ? Color(red: 0.93, green: 0.95, blue: 0.97) : Color(red: 0.17, green: 0.19, blue: 0.25)
    }
    /// Deliberately darker than the app's `--color-muted`: the widget is read
    /// at a glance against a busy wallpaper, where that token is too faint.
    static func muted(_ dark: Bool) -> Color {
        dark ? Color(red: 0.60, green: 0.64, blue: 0.72) : Color(red: 0.42, green: 0.45, blue: 0.54)
    }
    static let amber = Color(red: 0.90, green: 0.63, blue: 0.24)
    static let expense = Color(red: 0.93, green: 0.36, blue: 0.36)
}

// MARK: - Entry

struct CalmSpendEntry: TimelineEntry {
    let date: Date
    let snapshot: CalmSpendSnapshot
    let balance: Double
    /// False once the app has to run before the number can be trusted again.
    let trusted: Bool
}

// MARK: - Layout
//
// The layout is described by its own enum rather than by `WidgetFamily`, which
// keeps it free of WidgetKit: `scripts/preview-ios-widget.sh` renders these
// same views to a PNG on macOS, where some widget families do not exist.

enum CalmSpendLayout {
    /// systemSmall — caption above a large amount.
    case compact
    /// systemMedium — adds the daily budget underneath.
    case wide
    /// accessoryRectangular — lock screen, no background of its own.
    case inline
}

struct CalmSpendWidgetContent: View {
    let entry: CalmSpendEntry
    let layout: CalmSpendLayout
    let dark: Bool

    private var tint: Color {
        switch entry.snapshot.tone {
        case "over": return Brand.expense
        case "low": return Brand.amber
        default: return Brand.heading(dark)
        }
    }

    private var captionText: String {
        entry.trusted ? entry.snapshot.caption : entry.snapshot.openAppHint
    }

    private var dailyLine: String {
        let budget = entry.snapshot.formatted(entry.snapshot.dailyBudget)
        return entry.snapshot.isHebrew ? "תקציב יומי \(budget)" : "\(budget) a day"
    }

    private func amount(_ size: CGFloat) -> some View {
        Text(entry.snapshot.formatted(entry.balance))
            .font(.system(size: size, weight: .bold, design: .rounded))
            .foregroundStyle(tint)
            .minimumScaleFactor(0.5)
            .lineLimit(1)
            // A number the app has yet to settle is shown, but visibly held back.
            .opacity(entry.trusted ? 1 : 0.45)
    }

    private func caption(_ size: CGFloat) -> some View {
        Text(captionText)
            .font(.system(size: size, weight: .semibold))
            .foregroundStyle(Brand.muted(dark))
            .lineLimit(1)
            .minimumScaleFactor(0.8)
    }

    var body: some View {
        stack
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .environment(\.layoutDirection, entry.snapshot.isHebrew ? .rightToLeft : .leftToRight)
    }

    @ViewBuilder
    private var stack: some View {
        switch layout {
        case .inline:
            VStack(alignment: .leading, spacing: 2) {
                Text(captionText).font(.system(size: 12, weight: .medium))
                Text(entry.snapshot.formatted(entry.balance))
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
            }
        case .wide:
            VStack(alignment: .leading, spacing: 6) {
                caption(13)
                amount(52)
                Spacer(minLength: 0)
                Text(dailyLine)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Brand.muted(dark))
                    .lineLimit(1)
            }
        case .compact:
            VStack(alignment: .leading, spacing: 6) {
                caption(12)
                Spacer(minLength: 0)
                amount(36)
            }
        }
    }
}

/// The widget's root view: the layout above, plus the system container background.
struct CalmSpendWidgetView: View {
    @Environment(\.colorScheme) private var scheme
    @Environment(\.widgetFamily) private var family
    let entry: CalmSpendEntry

    private var layout: CalmSpendLayout {
        switch family {
        case .systemMedium, .systemLarge, .systemExtraLarge: return .wide
        default:
            // Lock-screen families only exist on iOS/watchOS.
            #if os(iOS)
            if family == .accessoryRectangular || family == .accessoryInline { return .inline }
            #endif
            return .compact
        }
    }

    var body: some View {
        let dark = scheme == .dark
        CalmSpendWidgetContent(entry: entry, layout: layout, dark: dark)
            .containerBackground(for: .widget) {
                if layout == .inline { Color.clear } else { Brand.page(dark) }
            }
    }
}
