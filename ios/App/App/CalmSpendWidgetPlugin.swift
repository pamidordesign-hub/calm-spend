import Foundation
import Capacitor
import WidgetKit

/// Bridges the web layer to the home-screen widget.
///
/// `CalmSpendWidget.update(...)` from TypeScript lands here; the snapshot goes
/// into the shared App Group and the widget's timeline is reloaded so the new
/// number shows without waiting for the system's next refresh.
@objc(CalmSpendWidgetPlugin)
public class CalmSpendWidgetPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CalmSpendWidgetPlugin"
    public let jsName = "CalmSpendWidget"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise)
    ]

    @objc func update(_ call: CAPPluginCall) {
        let snapshot = CalmSpendSnapshot(
            balance: call.getDouble("balance") ?? 0,
            dailyBudget: call.getDouble("dailyBudget") ?? 0,
            currency: call.getString("currency") ?? "ILS",
            tone: call.getString("tone") ?? "normal",
            lang: call.getString("lang") ?? "en",
            lastAccrualDate: call.getString("lastAccrualDate") ?? "",
            monthEnd: call.getString("monthEnd") ?? "reset",
            updatedAt: call.getDouble("updatedAt") ?? Date().timeIntervalSince1970 * 1000
        )

        guard snapshot.save() else {
            // Almost always a missing App Group entitlement — worth saying so
            // plainly rather than failing silently.
            call.reject("Could not write to App Group \(CalmSpendSnapshot.appGroup)")
            return
        }

        // The app still supports iOS 13, where WidgetKit does not exist; the
        // snapshot is saved either way, so older systems simply have no widget
        // to refresh.
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve()
    }
}
