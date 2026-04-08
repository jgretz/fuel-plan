import Foundation

// MARK: - Phone -> Watch

struct WatchFuelSource: Codable, Identifiable {
    var id: String { name }
    let name: String
    let calories: Double
    let carbs: Double
}

struct WatchPlanEntry: Codable, Identifiable {
    let id: String
    let timeMinutes: Int
    let sortOrder: Int
    let fuelSources: [WatchFuelSource]

    var timeFormatted: String {
        let h = timeMinutes / 60
        let m = timeMinutes % 60
        return String(format: "%d:%02d", h, m)
    }

    var fuelNames: String {
        fuelSources.map(\.name).joined(separator: ", ")
    }

    var totalCalories: Double {
        fuelSources.reduce(0) { $0 + $1.calories }
    }

    var totalCarbs: Double {
        fuelSources.reduce(0) { $0 + $1.carbs }
    }
}

struct WatchPlanPayload: Codable, Identifiable {
    var id: String { raceId }
    let raceId: String
    let raceName: String
    let raceDate: String
    let silent: Bool
    let alarmSound: String
    let entries: [WatchPlanEntry]

    var totalCalories: Double {
        entries.reduce(0) { $0 + $1.totalCalories }
    }

    var totalCarbs: Double {
        entries.reduce(0) { $0 + $1.totalCarbs }
    }

    var sortedEntries: [WatchPlanEntry] {
        entries.sorted { $0.sortOrder < $1.sortOrder }
    }

    var parsedDate: Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]
        return formatter.date(from: raceDate)
    }
}

// MARK: - Watch -> Phone

enum EntryStatus: String, Codable {
    case taken
    case skipped
}

struct WatchExecutionEntry: Codable {
    let planEntryId: String
    let status: EntryStatus
    let actualTimeSeconds: Int?
}

struct WatchExecutionPayload: Codable {
    let raceId: String
    let startedAt: String
    let finishedAt: String
    let pauseDurationSeconds: Int
    let entries: [WatchExecutionEntry]
}
