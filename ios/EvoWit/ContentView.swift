import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var viewModel: StudySessionViewModel
    @StateObject private var speechRecognizer = SpeechRecognizer()
    @StateObject private var cameraManager = CameraManager()
    @StateObject private var gazeTracker = GazeTracker()
    @State private var lastAutoSentAt = Date.distantPast

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Picker("Mode", selection: $viewModel.mode) {
                        ForEach(StudyMode.allCases) { mode in
                            Text(mode.title).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)

                    Toggle("Auto analyze every 6 seconds", isOn: $viewModel.autoAnalyze)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Live transcript")
                            .font(.headline)
                        TextEditor(text: Binding(
                            get: {
                                speechRecognizer.transcript.isEmpty ? viewModel.transcript : speechRecognizer.transcript
                            },
                            set: { viewModel.transcript = $0 }
                        ))
                        .frame(minHeight: 120)
                        .padding(8)
                        .background(.thinMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Attention")
                            .font(.headline)
                        Text("x: \(viewModel.gazePoint.x, specifier: "%.2f")  y: \(viewModel.gazePoint.y, specifier: "%.2f")")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        ProgressView(value: viewModel.attentionScore)
                        Text("score: \(viewModel.attentionScore, specifier: "%.2f")")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    if let frame = cameraManager.latestFrame {
                        let roi = ImageCropper.crop(image: frame, around: viewModel.gazePoint)
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Focus ROI")
                                .font(.headline)
                            Image(uiImage: roi)
                                .resizable()
                                .scaledToFit()
                                .frame(maxHeight: 260)
                                .clipShape(RoundedRectangle(cornerRadius: 16))

                            Button(viewModel.isSending ? "Analyzing..." : "Analyze current focus") {
                                Task {
                                    await viewModel.submitFocusFrame(image: roi)
                                }
                            }
                            .buttonStyle(.borderedProminent)
                            .disabled(viewModel.isSending)

                            Button("New session") {
                                viewModel.resetSession()
                            }
                            .buttonStyle(.bordered)
                        }
                    }

                    if let reply = viewModel.latestReply {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("AI coaching")
                                .font(.title3.bold())
                            InsightRow(title: "Recognized text", text: reply.recognizedText)
                            InsightRow(title: "Inferred task", text: reply.inferredTask)
                            InsightRow(title: "Diagnosis", text: reply.diagnosis)
                            InsightRow(title: "Scaffold", text: reply.scaffoldingPrompt)
                            InsightRow(title: "Attention advice", text: reply.attentionAdvice)
                            InsightRow(title: "Next action", text: reply.nextAction)
                            InsightRow(title: "Session summary", text: reply.sessionSummary)
                        }
                        .padding()
                        .background(Color(uiColor: .secondarySystemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }

                    if let errorMessage = viewModel.errorMessage {
                        Text(errorMessage)
                            .foregroundStyle(.red)
                    }
                }
                .padding()
            }
            .navigationTitle("EvoWit")
            .task {
                let granted = await speechRecognizer.requestAccess()
                if granted {
                    try? speechRecognizer.start()
                }
                cameraManager.start()
                gazeTracker.start()
            }
            .onReceive(speechRecognizer.$transcript) { transcript in
                viewModel.transcript = transcript
            }
            .onReceive(gazeTracker.$normalizedPoint) { point in
                viewModel.updateGazePoint(point)
            }
            .onReceive(cameraManager.$latestFrame) { frame in
                guard viewModel.autoAnalyze, let frame else { return }
                guard Date().timeIntervalSince(lastAutoSentAt) >= 6 else { return }
                lastAutoSentAt = Date()
                let roi = ImageCropper.crop(image: frame, around: viewModel.gazePoint)
                Task {
                    await viewModel.submitFocusFrame(image: roi)
                }
            }
        }
    }
}

private struct InsightRow: View {
    let title: String
    let text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(text)
                .font(.body)
        }
    }
}
