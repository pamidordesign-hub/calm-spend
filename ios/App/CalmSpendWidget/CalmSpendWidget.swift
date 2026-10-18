import WidgetKit
import SwiftUI

struct CalmSpendProvider: TimelineProvider {
    private func entry(_ snapshot: CalmSpendSnapshot, at date: Date) -> CalmSpendEntry {
        CalmSpendEntry(
            date: date,
            snapshot: snapshot,
            balance: snapshot.projectedBalance(on: date),
            trusted: snapshot.isProjectable(on: date)
        )
    }

    func placeholder(in context: Context) -> CalmSpendEntry {
        entry(.placeholder, at: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (CalmSpendEntry) -> Void) {
        completion(entry(CalmSpendSnapshot.load() ?? .placeholder, at: Date()))
    }

    /// One entry now, then one at each of the next midnights, so the balance
    /// climbs with the day even while the app stays closed.
    func getTimeline(in context: Context, completion: @escaping (Timeline<CalmSpendEntry>) -> Void) {
        let snapshot = CalmSpendSnapshot.load() ?? .placeholder
        let calendar = Calendar.current
        let now = Date()

        var entries = [entry(snapshot, at: now)]
        let midnight = calendar.startOfDay(for: now)
        for offset in 1...7 {
            guard let day = calendar.date(byAdding: .day, value: offset, to: midnight) else { break }
            entries.append(entry(snapshot, at: day))
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

struct CalmSpendWidget: Widget {
    let kind = "CalmSpendWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalmSpendProvider()) { entry in
            CalmSpendWidgetView(entry: entry)
        }
        .configurationDisplayName("Calm Spend")
        .description("How much is left to spend today.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}

@main
struct CalmSpendWidgetBundle: WidgetBundle {
    var body: some Widget {
        CalmSpendWidget()
    }
}
