import Foundation

struct APIClient {
    func analyzeFocus(_ request: FocusAnalyzeRequest) async throws -> CoachReply {
        var urlRequest = URLRequest(url: AppConfig.backendBaseURL.appending(path: "/api/analyze/focus"))
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try JSONEncoder().encode(request)

        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            let message = String(data: data, encoding: .utf8) ?? "server error"
            throw NSError(domain: "APIClient", code: httpResponse.statusCode, userInfo: [
                NSLocalizedDescriptionKey: message
            ])
        }

        return try JSONDecoder().decode(CoachReply.self, from: data)
    }
}

