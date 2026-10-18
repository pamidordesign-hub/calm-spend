import Foundation

/// The small slice of app state the home-screen widget needs.
///
/// The widget runs in its own process and cannot read the web layer's
/// localStorage, so the app writes this into a shared App Group container
/// whenever the numbers change, and the widget reads it back.
struct CalmSpendSnapshot: Codable {
    var balance: Double
    var dailyBudget: Double
    /// "ILS" | "USD" | "EUR" | "GBP"
    var currency: String
    /// "normal" | "low" | "over"
    var tone: String
    /// "en" | "he"
    var lang: String
    /// 'yyyy-MM-dd' of the last day already credited by the app.
    var lastAccrualDate: String
    /// "reset" | "carryover"
    var monthEnd: String
    /// Epoch milliseconds.
    var updatedAt: Double

    static let appGroup = "group.com.calmspend.app"
    static let storageKey = "calmspend.snapshot"

    static var defaults: UserDefaults? {
        UserDefaults(suiteName: appGroup)
    }

    static func load() -> CalmSpendSnapshot? {
        guard let data = defaults?.data(forKey: storageKey) else { return nil }
        return try? JSONDecoder().decode(CalmSpendSnapshot.self, from: data)
    }

    @discardableResult
    func save() -> Bool {
        guard let defaults = Self.defaults,
              let data = try? JSONEncoder().encode(self) else { return false }
        defaults.set(data, forKey: Self.storageKey)
        return true
    }

    /// The placeholder shown in the widget gallery and before the first sync.
    static let placeholder = CalmSpendSnapshot(
        balance: 240,
        dailyBudget: 100,
        currency: "ILS",
        tone: "normal",
        lang: "en",
        lastAccrualDate: "",
        monthEnd: "reset",
        updatedAt: 0
    )
}

// MARK: - Projecting forward between app launches

extension CalmSpendSnapshot {
    private static let dayFormatter: DateFormatter = {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = TimeZone.current
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    /// What the balance will be on `day`, mirroring the app's rule of crediting
    /// one daily budget per whole day elapsed.
    ///
    /// Projection deliberately stops at a month boundary: the month-end rule
    /// (reset or carry over) is the app's decision, and guessing it here could
    /// show a number the app would never arrive at. `isProjectable` says which
    /// case the view is in so it can mark the value as waiting to be refreshed.
    func projectedBalance(on day: Date, calendar: Calendar = .current) -> Double {
        guard let elapsed = daysElapsed(to: day, calendar: calendar) else { return balance }
        return balance + Double(elapsed) * dailyBudget
    }

    func isProjectable(on day: Date, calendar: Calendar = .current) -> Bool {
        daysElapsed(to: day, calendar: calendar) != nil
    }

    /// Whole days from the last credited day to `day`, or nil when the app has
    /// to run before the number can be trusted (unknown date, or a new month).
    private func daysElapsed(to day: Date, calendar: Calendar) -> Int? {
        guard let last = Self.dayFormatter.date(from: lastAccrualDate) else { return nil }
        let from = calendar.startOfDay(for: last)
        let to = calendar.startOfDay(for: day)
        guard let days = calendar.dateComponents([.day], from: from, to: to).day else { return nil }
        if days <= 0 { return 0 }
        guard calendar.isDate(from, equalTo: to, toGranularity: .month) else { return nil }
        return days
    }
}

// MARK: - Presentation

extension CalmSpendSnapshot {
    var currencySymbol: String {
        switch currency {
        case "USD": return "$"
        case "EUR": return "€"
        case "GBP": return "£"
        default: return "₪"
        }
    }

    var isHebrew: Bool { lang == "he" }

    /// "Left to spend" — the widget's only label.
    var caption: String {
        isHebrew ? "נשאר להוציא" : "Left to spend"
    }

    var openAppHint: String {
        isHebrew ? "פתח לעדכון" : "Open to refresh"
    }

    /// Whole units only, matching the app: no decimals anywhere.
    ///
    /// The result is wrapped in a left-to-right isolate (U+2066 … U+2069) for
    /// the same reason `formatMoney` does it in the web app: without it a
    /// Hebrew line renders "100₪" with the symbol adrift on the wrong side.
    func formatted(_ amount: Double) -> String {
        let rounded = amount.rounded()
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.maximumFractionDigits = 0
        formatter.groupingSeparator = ","
        formatter.usesGroupingSeparator = true
        let magnitude = formatter.string(from: NSNumber(value: abs(rounded))) ?? "0"
        // U+2212 minus, as in the app.
        let sign = rounded < 0 ? "\u{2212}" : ""
        return "\u{2066}\(sign)\(currencySymbol)\(magnitude)\u{2069}"
    }
}
