function renderResult(data) {
  const result = document.getElementById("result");
  result.innerHTML = `
    <div class="card">
      <h2>AI Coaching</h2>
      <p><strong>OCR text:</strong> ${data.ocrText || "(empty)"}</p>
      <p><strong>Recognized text:</strong> ${data.recognizedText}</p>
      <p><strong>Task:</strong> ${data.inferredTask}</p>
      <p><strong>Diagnosis:</strong> ${data.diagnosis}</p>
      <p><strong>Scaffold:</strong> ${data.scaffoldingPrompt}</p>
      <p><strong>Attention advice:</strong> ${data.attentionAdvice}</p>
      <p><strong>Next action:</strong> ${data.nextAction}</p>
      <p><strong>Turn count:</strong> ${data.turnCount}</p>
      <pre>${data.sessionSummary}</pre>
    </div>
  `;
}

document.getElementById("demo-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const result = document.getElementById("result");
  result.innerHTML = `<p class="placeholder">Analyzing...</p>`;

  const file = document.getElementById("imageInput").files[0];
  const formData = new FormData();
  formData.append("image", file);
  formData.append("mode", document.getElementById("mode").value);
  formData.append("gradeBand", document.getElementById("gradeBand").value);
  formData.append("transcript", document.getElementById("transcript").value || "");
  formData.append("attentionScore", document.getElementById("attentionScore").value);

  const response = await fetch("/api/analyze/upload", {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    result.innerHTML = `<p class="error">${data.error || "Request failed."}</p>`;
    return;
  }

  renderResult(data);
});
