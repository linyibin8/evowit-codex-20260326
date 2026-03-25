import Foundation
import ARKit
import CoreGraphics

final class GazeTracker: NSObject, ObservableObject, ARSessionDelegate {
    @Published var normalizedPoint: CGPoint = CGPoint(x: 0.5, y: 0.5)
    let session = ARSession()

    func start() {
        guard ARFaceTrackingConfiguration.isSupported else { return }
        let configuration = ARFaceTrackingConfiguration()
        configuration.isWorldTrackingEnabled = false
        session.delegate = self
        session.run(configuration, options: [.resetTracking, .removeExistingAnchors])
    }

    func stop() {
        session.pause()
    }

    func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        guard let faceAnchor = anchors.compactMap({ $0 as? ARFaceAnchor }).first else { return }

        let lookAt = faceAnchor.lookAtPoint
        let x = max(0.0, min(1.0, Double((lookAt.x + 0.2) / 0.4)))
        let y = max(0.0, min(1.0, Double((lookAt.y + 0.2) / 0.4)))

        DispatchQueue.main.async {
            self.normalizedPoint = CGPoint(x: x, y: 1.0 - y)
        }
    }
}

