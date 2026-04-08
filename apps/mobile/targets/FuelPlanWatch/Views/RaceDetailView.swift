import SwiftUI

struct RaceDetailView: View {
    let plan: WatchPlanPayload
    @Binding var navigationPath: NavigationPath

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text(plan.raceName)
                    .font(.headline)

                Text(plan.raceDate)
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                Divider()

                HStack {
                    StatView(value: "\(plan.entries.count)", label: "Entries")
                    Spacer()
                    StatView(value: "\(Int(plan.totalCalories))", label: "Cal")
                    Spacer()
                    StatView(value: "\(Int(plan.totalCarbs))g", label: "Carbs")
                }

                if plan.silent {
                    Label("Silent Mode", systemImage: "speaker.slash")
                        .font(.caption)
                        .foregroundColor(.orange)
                }

                NavigationLink(destination: ActiveRaceView(plan: plan, navigationPath: $navigationPath)) {
                    Text("Start Race")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)
            }
            .padding()
        }
        .navigationTitle("Plan")
    }
}

struct StatView: View {
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }
}
