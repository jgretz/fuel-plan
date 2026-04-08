import Combine
import Foundation

class PlanStorageManager: ObservableObject {
    @Published var plans: [WatchPlanPayload] = []

    private let storageKey = "fuel_plan_watch_plans"

    init() {
        load()
    }

    func save(_ plan: WatchPlanPayload) {
        var current = plans
        current.removeAll { $0.raceId == plan.raceId }
        current.append(plan)
        plans = current
        persist()
    }

    func remove(raceId: String) {
        plans.removeAll { $0.raceId == raceId }
        persist()
    }

    /// Returns today's race or the next upcoming one
    var defaultPlan: WatchPlanPayload? {
        let today = Calendar.current.startOfDay(for: Date())

        let sorted = plans
            .compactMap { plan -> (WatchPlanPayload, Date)? in
                guard let date = plan.parsedDate else { return nil }
                return (plan, date)
            }
            .sorted { $0.1 < $1.1 }

        // today's race first
        if let todayPlan = sorted.first(where: { Calendar.current.isDate($0.1, inSameDayAs: today) }) {
            return todayPlan.0
        }

        // next upcoming
        return sorted.first(where: { $0.1 >= today })?.0
    }

    // MARK: - Private

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey) else { return }
        let decoded = try? JSONDecoder().decode([WatchPlanPayload].self, from: data)
        plans = decoded ?? []
    }

    private func persist() {
        let data = try? JSONEncoder().encode(plans)
        UserDefaults.standard.set(data, forKey: storageKey)
    }
}
