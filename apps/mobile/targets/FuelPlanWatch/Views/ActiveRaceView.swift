import SwiftUI

struct ActiveRaceView: View {
    let plan: WatchPlanPayload
    @Binding var navigationPath: NavigationPath

    @EnvironmentObject var sessionManager: WatchSessionManager
    @StateObject private var timerManager = RaceTimerManager()
    private let alertManager = AlertManager()

    @State private var showFinishConfirm = false
    @State private var showSummary = false
    @State private var executionPayload: WatchExecutionPayload?

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                Text(timerManager.elapsedFormatted)
                    .font(.system(.title, design: .monospaced))
                    .fontWeight(.bold)

                if timerManager.isPaused {
                    Text("PAUSED")
                        .font(.caption)
                        .foregroundColor(.orange)
                        .fontWeight(.bold)
                }

                if let triggered = timerManager.lastTriggeredEntryId,
                   let entry = plan.sortedEntries.first(where: { $0.id == triggered }) {
                    let status = timerManager.entryStatuses[entry.id] ?? nil
                    FuelCard(entry: entry, status: status) { newStatus in
                        timerManager.markEntry(entry.id, status: newStatus)
                    }
                }

                if let next = timerManager.nextEntry {
                    VStack(spacing: 4) {
                        Text("Next at \(next.timeFormatted)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(next.fuelNames)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }

                let completed = plan.entries.filter { (timerManager.entryStatuses[$0.id] ?? nil) == .taken }.count
                Text("\(completed)/\(plan.entries.count) taken")
                    .font(.caption2)
                    .foregroundColor(.secondary)

                Divider()

                HStack(spacing: 16) {
                    Button(action: {
                        if timerManager.isPaused {
                            timerManager.resume()
                        } else {
                            timerManager.pause()
                        }
                    }) {
                        Image(systemName: timerManager.isPaused ? "play.fill" : "pause.fill")
                    }
                    .buttonStyle(.bordered)

                    Button(action: { showFinishConfirm = true }) {
                        Image(systemName: "flag.checkered")
                    }
                    .buttonStyle(.bordered)
                    .tint(.red)
                }
            }
            .padding()
        }
        .navigationTitle(plan.raceName)
        .navigationBarBackButtonHidden(true)
        .onAppear {
            timerManager.start(with: plan.sortedEntries)
            timerManager.onEntryTriggered = { entry in
                alertManager.triggerAlert(for: entry, silent: plan.silent)
            }
        }
        .confirmationDialog("Finish Race?", isPresented: $showFinishConfirm) {
            Button("Finish", role: .destructive) {
                if var payload = timerManager.finish() {
                    payload = WatchExecutionPayload(
                        raceId: plan.raceId,
                        startedAt: payload.startedAt,
                        finishedAt: payload.finishedAt,
                        pauseDurationSeconds: payload.pauseDurationSeconds,
                        entries: payload.entries
                    )
                    executionPayload = payload
                    sessionManager.sendExecutionLog(payload)
                    showSummary = true
                }
            }
            Button("Cancel", role: .cancel) {}
        }
        .navigationDestination(isPresented: $showSummary) {
            if let payload = executionPayload {
                RaceSummaryView(plan: plan, payload: payload, navigationPath: $navigationPath)
            }
        }
    }
}

struct FuelCard: View {
    let entry: WatchPlanEntry
    let status: EntryStatus?
    let onMark: (EntryStatus) -> Void

    var body: some View {
        VStack(spacing: 8) {
            Text(entry.fuelNames)
                .font(.headline)
                .multilineTextAlignment(.center)

            Text("\(Int(entry.totalCalories)) cal · \(Int(entry.totalCarbs))g carbs")
                .font(.caption)
                .foregroundColor(.secondary)

            if status == nil {
                HStack(spacing: 12) {
                    Button("Taken") { onMark(.taken) }
                        .buttonStyle(.borderedProminent)
                        .tint(.green)
                        .font(.caption)

                    Button("Skip") { onMark(.skipped) }
                        .buttonStyle(.bordered)
                        .font(.caption)
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.darkGray).opacity(0.3))
        )
    }
}
