//
//  FuelPlanWatchApp.swift
//  FuelPlanWatch Watch App
//
//  Created by Josh Gretz on 4/8/26.
//

import SwiftUI

@main
struct FuelPlanWatchApp: App {
    @StateObject private var sessionManager = WatchSessionManager()
    @StateObject private var storageManager = PlanStorageManager()

    var body: some Scene {
        WindowGroup {
            RaceListView()
                .environmentObject(sessionManager)
                .environmentObject(storageManager)
                .onAppear {
                    sessionManager.activate()
                    sessionManager.onPlanReceived = { payload in
                        storageManager.save(payload)
                    }
                }
        }
    }
}
