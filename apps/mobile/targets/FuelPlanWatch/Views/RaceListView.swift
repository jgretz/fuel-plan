import SwiftUI

struct RaceListView: View {
    @EnvironmentObject var storageManager: PlanStorageManager
    @State private var navigationPath = NavigationPath()

    var body: some View {
        NavigationStack(path: $navigationPath) {
            Group {
                if storageManager.plans.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "trophy")
                            .font(.title)
                            .foregroundColor(.secondary)
                        Text("No races synced")
                            .foregroundColor(.secondary)
                        Text("Send a plan from your phone")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                } else {
                    List(sortedPlans) { plan in
                        NavigationLink(value: plan.raceId) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(plan.raceName)
                                    .font(.headline)
                                Text(plan.raceDate)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Races")
            .navigationDestination(for: String.self) { raceId in
                if let plan = storageManager.plans.first(where: { $0.raceId == raceId }) {
                    RaceDetailView(plan: plan, navigationPath: $navigationPath)
                }
            }
        }
    }

    private var sortedPlans: [WatchPlanPayload] {
        storageManager.plans.sorted { a, b in
            guard let dateA = a.parsedDate, let dateB = b.parsedDate else { return false }
            return dateA < dateB
        }
    }
}
