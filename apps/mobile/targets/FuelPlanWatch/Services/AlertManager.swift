import AVFoundation
import WatchKit

final class AlertManager {
    private let synthesizer = AVSpeechSynthesizer()

    func triggerAlert(for entry: WatchPlanEntry, silent: Bool) {
        playHaptic()

        guard !silent else { return }

        let fuelNames = entry.fuelSources.map(\.name).joined(separator: " and ")
        speak("Time for \(fuelNames)")
    }

    func playHaptic() {
        let device = WKInterfaceDevice.current()
        device.play(.start)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            device.play(.success)
        }
    }

    func speak(_ text: String) {
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate
        utterance.volume = 1.0
        synthesizer.speak(utterance)
    }
}
