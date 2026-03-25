import Foundation
import CoreGraphics

enum StudyMode: String, CaseIterable, Identifiable, Codable {
    case reading
    case recitation
    case homework
    case writing

    var id: String { rawValue }

    var title: String {
        switch self {
        case .reading: return "Reading"
        case .recitation: return "Recitation"
        case .homework: return "Homework"
        case .writing: return "Writing"
        }
    }
}

struct GazePoint: Codable {
    let x: Double
    let y: Double
}

struct FocusAnalyzeRequest: Codable {
    let sessionId: String?
    let mode: String
    let gradeBand: String
    let transcript: String?
    let attentionScore: Double?
    let taskHint: String?
    let gazePoint: GazePoint?
    let imageBase64: String
}

struct CoachReply: Codable {
    let sessionId: String
    let recognizedText: String
    let inferredTask: String
    let diagnosis: String
    let scaffoldingPrompt: String
    let attentionAdvice: String
    let nextAction: String
    let sessionSummary: String
    let turnCount: Int
}
