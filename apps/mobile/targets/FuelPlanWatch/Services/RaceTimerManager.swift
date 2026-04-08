import Combine
import Foundation
import SwiftUI

class RaceTimerManager: ObservableObject {
    @Published var elapsedSeconds: Int = 0
    @Published var isPaused = false
    @Published var isRunning = false
    @Published var currentEntryIndex = 0
    @Published var entryStatuses: [String: EntryStatus?] = [:]
    @Published var lastTriggeredEntryId: String?

    private var timer: AnyCancellable?
    private var startDate: Date?
    private var pauseStartDate: Date?
    private var totalPauseDuration: TimeInterval = 0
    private var entries: [WatchPlanEntry] = []
    private var triggeredEntries: Set<String> = []
    var onEntryTriggered: ((WatchPlanEntry) -> Void)?

    var elapsedMinutes: Int {
        elapsedSeconds / 60
    }

    var elapsedFormatted: String {
        let h = elapsedSeconds / 3600
        let m = (elapsedSeconds % 3600) / 60
        let s = elapsedSeconds % 60
        return String(format: "%d:%02d:%02d", h, m, s)
    }

    var nextEntry: WatchPlanEntry? {
        let sortedEntries = entries.sorted { $0.sortOrder < $1.sortOrder }
        return sortedEntries.first { !triggeredEntries.contains($0.id) }
    }

    func start(with planEntries: [WatchPlanEntry]) {
        entries = planEntries.sorted { $0.sortOrder < $1.sortOrder }
        entryStatuses = Dictionary(uniqueKeysWithValues: entries.map { ($0.id, nil as EntryStatus?) })
        triggeredEntries = []
        currentEntryIndex = 0
        elapsedSeconds = 0
        totalPauseDuration = 0
        isPaused = false
        isRunning = true
        startDate = Date()

        timer = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in self?.tick() }
    }

    func pause() {
        guard isRunning, !isPaused else { return }
        isPaused = true
        pauseStartDate = Date()
    }

    func resume() {
        guard isRunning, isPaused else { return }
        if let pauseStart = pauseStartDate {
            totalPauseDuration += Date().timeIntervalSince(pauseStart)
        }
        isPaused = false
        pauseStartDate = nil
    }

    func markEntry(_ entryId: String, status: EntryStatus) {
        entryStatuses[entryId] = status
        // advance to the next triggered-but-unmarked entry
        let sorted = entries.sorted { $0.sortOrder < $1.sortOrder }
        let nextPending = sorted.first { triggeredEntries.contains($0.id) && entryStatuses[$0.id] == nil }
        lastTriggeredEntryId = nextPending?.id
    }

    func finish() -> WatchExecutionPayload? {
        timer?.cancel()
        timer = nil
        isRunning = false

        guard let start = startDate else { return nil }

        if let pauseStart = pauseStartDate {
            totalPauseDuration += Date().timeIntervalSince(pauseStart)
        }

        let finishedAt = Date()
        let formatter = ISO8601DateFormatter()

        let executionEntries = entries.map { entry in
            WatchExecutionEntry(
                planEntryId: entry.id,
                status: (entryStatuses[entry.id] ?? nil) ?? .skipped,
                actualTimeSeconds: triggeredEntries.contains(entry.id) ? entry.timeMinutes * 60 : nil
            )
        }

        return WatchExecutionPayload(
            raceId: "",  // set by caller
            startedAt: formatter.string(from: start),
            finishedAt: formatter.string(from: finishedAt),
            pauseDurationSeconds: Int(totalPauseDuration),
            entries: executionEntries
        )
    }

    // MARK: - Private

    private func tick() {
        guard isRunning, !isPaused, let start = startDate else { return }

        let now = Date()
        let elapsed = now.timeIntervalSince(start) - totalPauseDuration
        elapsedSeconds = max(0, Int(elapsed))

        checkForAlerts()
    }

    private func checkForAlerts() {
        let currentMinutes = elapsedSeconds / 60

        for entry in entries {
            guard !triggeredEntries.contains(entry.id) else { continue }
            guard entry.timeMinutes <= currentMinutes else { continue }

            triggeredEntries.insert(entry.id)
            lastTriggeredEntryId = entry.id
            onEntryTriggered?(entry)
        }
    }
}
