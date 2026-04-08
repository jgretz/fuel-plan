import SwiftUI

struct RaceSummaryView: View {
    let plan: WatchPlanPayload
    let payload: WatchExecutionPayload
    @Binding var navigationPath: NavigationPath

    @EnvironmentObject var sessionManager: WatchSessionManager

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                Image(systemName: "flag.checkered")
                    .font(.largeTitle)

                Text("Race Complete")
                    .font(.headline)

                Divider()

                SummaryRow(label: "Taken", value: "\(takenCount)")
                SummaryRow(label: "Skipped", value: "\(skippedCount)")
                SummaryRow(label: "Pause", value: "\(payload.pauseDurationSeconds / 60)m")

                Divider()

                Button("Sync to Phone") {
                    sessionManager.sendExecutionLog(payload)
                }
                .buttonStyle(.borderedProminent)

                Button("Done") {
                    navigationPath = NavigationPath()
                }
                .buttonStyle(.bordered)

                Text("Log synced automatically on finish")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .padding()
        }
        .navigationTitle("Summary")
        .navigationBarBackButtonHidden(true)
    }

    private var takenCount: Int {
        payload.entries.filter { $0.status == .taken }.count
    }

    private var skippedCount: Int {
        payload.entries.filter { $0.status == .skipped }.count
    }
}

struct SummaryRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.semibold)
        }
    }
}
