import Foundation
import UIKit

@MainActor
final class StudySessionViewModel: ObservableObject {
    @Published var mode: StudyMode = .reading
    @Published var gradeBand: String = "Upper elementary"
    @Published var transcript: String = ""
    @Published var latestReply: CoachReply?
    @Published var attentionScore: Double = 0.9
    @Published var gazePoint: CGPoint = CGPoint(x: 0.5, y: 0.5)
    @Published var isSending = false
    @Published var autoAnalyze = true
    @Published var errorMessage: String?

    private let apiClient = APIClient()
    private(set) var sessionId: String?
    private var recentGazePoints: [CGPoint] = []

    func submitFocusFrame(image: UIImage) async {
        guard let jpegData = image.jpegData(compressionQuality: 0.72) else {
            errorMessage = "Unable to encode image."
            return
        }

        isSending = true
        errorMessage = nil

        let request = FocusAnalyzeRequest(
            sessionId: sessionId,
            mode: mode.rawValue,
            gradeBand: gradeBand,
            transcript: transcript.isEmpty ? nil : transcript,
            attentionScore: attentionScore,
            taskHint: nil,
            gazePoint: GazePoint(x: gazePoint.x, y: gazePoint.y),
            imageBase64: jpegData.base64EncodedString()
        )

        do {
            let reply = try await apiClient.analyzeFocus(request)
            latestReply = reply
            sessionId = reply.sessionId
        } catch {
            errorMessage = error.localizedDescription
        }

        isSending = false
    }

    func updateGazePoint(_ point: CGPoint) {
        gazePoint = point
        recentGazePoints.append(point)
        if recentGazePoints.count > 15 {
            recentGazePoints.removeFirst(recentGazePoints.count - 15)
        }

        let movement = zip(recentGazePoints.dropFirst(), recentGazePoints).map { lhs, rhs in
            hypot(lhs.x - rhs.x, lhs.y - rhs.y)
        }
        let averageMovement = movement.isEmpty ? 0.0 : movement.reduce(0, +) / Double(movement.count)
        let transcriptBoost = transcript.isEmpty ? 0.0 : 0.1
        attentionScore = max(0.1, min(0.99, 1.0 - averageMovement * 1.6 + transcriptBoost))
    }

    func resetSession() {
        sessionId = nil
        latestReply = nil
        transcript = ""
        errorMessage = nil
    }
}
