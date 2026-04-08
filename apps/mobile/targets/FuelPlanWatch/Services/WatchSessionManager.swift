import Combine
import Foundation
import WatchConnectivity

class WatchSessionManager: NSObject, ObservableObject, WCSessionDelegate {
    @Published var isReachable = false
    var onPlanReceived: ((WatchPlanPayload) -> Void)?

    func activate() {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        session.delegate = self
        session.activate()
    }

    func sendExecutionLog(_ payload: WatchExecutionPayload) {
        guard WCSession.default.activationState == .activated else { return }

        let encoder = JSONEncoder()
        guard let data = try? encoder.encode(payload),
              let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return }

        WCSession.default.transferUserInfo(dict)
    }

    // MARK: - WCSessionDelegate

    func session(
        _ session: WCSession,
        activationDidCompleteWith activationState: WCSessionActivationState,
        error: Error?
    ) {
        DispatchQueue.main.async {
            self.isReachable = session.isReachable
        }
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: applicationContext) else { return }
        let decoder = JSONDecoder()
        guard let payload = try? decoder.decode(WatchPlanPayload.self, from: data) else { return }

        DispatchQueue.main.async {
            self.onPlanReceived?(payload)
        }
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.isReachable = session.isReachable
        }
    }
}
