import Foundation

var failures = 0
func check(_ label: String, _ actual: String, _ expected: String) {
    if actual == expected { print("  ok   \(label)  →  \(actual)") }
    else { failures += 1; print("  FAIL \(label)  →  got \(actual), want \(expected)") }
}
func check(_ label: String, _ actual: Double, _ expected: Double) {
    check(label, String(actual), String(expected))
}
func check(_ label: String, _ actual: Bool, _ expected: Bool) {
    check(label, String(actual), String(expected))
}

var cal = Calendar(identifier: .gregorian)
cal.timeZone = TimeZone.current

func day(_ s: String) -> Date {
    let f = DateFormatter()
    f.calendar = cal; f.locale = Locale(identifier: "en_US_POSIX")
    f.timeZone = TimeZone.current; f.dateFormat = "yyyy-MM-dd"
    return f.date(from: s)!
}

func snap(balance: Double = 240, daily: Double = 100, last: String = "2026-10-15",
          currency: String = "ILS", lang: String = "en") -> CalmSpendSnapshot {
    CalmSpendSnapshot(balance: balance, dailyBudget: daily, currency: currency,
                      tone: "normal", lang: lang, lastAccrualDate: last,
                      monthEnd: "reset", updatedAt: 0)
}

print("\n— forward accrual —")
let s = snap()
check("same day",        s.projectedBalance(on: day("2026-10-15"), calendar: cal), 240)
check("next day",        s.projectedBalance(on: day("2026-10-16"), calendar: cal), 340)
check("three days on",   s.projectedBalance(on: day("2026-10-18"), calendar: cal), 540)
check("end of month",    s.projectedBalance(on: day("2026-10-31"), calendar: cal), 1840)
check("a day earlier",   s.projectedBalance(on: day("2026-10-14"), calendar: cal), 240)

print("\n— stops at the month boundary —")
check("into November",   s.projectedBalance(on: day("2026-11-01"), calendar: cal), 240)
check("Nov not trusted", s.isProjectable(on: day("2026-11-01"), calendar: cal), false)
check("Oct is trusted",  s.isProjectable(on: day("2026-10-20"), calendar: cal), true)

print("\n— an unknown last-accrual date is never projected —")
let blank = snap(last: "")
check("blank balance",   blank.projectedBalance(on: day("2026-10-18"), calendar: cal), 240)
check("blank untrusted", blank.isProjectable(on: day("2026-10-18"), calendar: cal), false)

// Strip the bidi isolates the formatter adds, exactly as the JS tests do.
func plain(_ s: String) -> String {
    s.replacingOccurrences(of: "\u{2066}", with: "").replacingOccurrences(of: "\u{2069}", with: "")
}
print("\n— formatting: whole units, brand minus —")
check("positive ILS",  plain(snap().formatted(240)),        "₪240")
check("thousands",     plain(snap().formatted(12750)),      "₪12,750")
check("negative",      plain(snap().formatted(-38)),        "\u{2212}₪38")
check("rounds down",   plain(snap().formatted(240.4)),      "₪240")
check("rounds up",     plain(snap().formatted(240.6)),      "₪241")
check("zero",          plain(snap().formatted(0)),          "₪0")
check("USD", plain(snap(currency: "USD").formatted(50)),     "$50")
check("EUR", plain(snap(currency: "EUR").formatted(50)),     "€50")
check("GBP", plain(snap(currency: "GBP").formatted(50)),     "£50")
check("unknown falls back to ₪", plain(snap(currency: "ZZZ").formatted(50)), "₪50")
check("isolates present", snap().formatted(1).hasPrefix("\u{2066}"), true)

print("\n— localisation —")
check("en caption", snap().caption,              "Left to spend")
check("he caption", snap(lang: "he").caption,    "נשאר להוציא")
check("en is not rtl", snap().isHebrew,          false)
check("he is rtl",  snap(lang: "he").isHebrew,   true)

print("\n— Codable round trip —")
let encoded = try! JSONEncoder().encode(snap(balance: 1234, daily: 99, last: "2026-02-28"))
let back = try! JSONDecoder().decode(CalmSpendSnapshot.self, from: encoded)
check("balance survives", back.balance, 1234)
check("daily survives",   back.dailyBudget, 99)
check("date survives",    back.lastAccrualDate, "2026-02-28")
check("leap-month accrual", back.projectedBalance(on: day("2026-02-28"), calendar: cal), 1234)

print(failures == 0 ? "\n✅ all snapshot logic checks passed\n" : "\n❌ \(failures) failed\n")
exit(failures == 0 ? 0 : 1)
