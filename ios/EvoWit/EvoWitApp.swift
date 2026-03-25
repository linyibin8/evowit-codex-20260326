import SwiftUI

@main
struct EvoWitApp: App {
    @StateObject private var viewModel = StudySessionViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(viewModel)
        }
    }
}

