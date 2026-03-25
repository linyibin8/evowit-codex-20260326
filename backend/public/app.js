async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderResult(data) {
  const result = document.getElementById("result");
  result.innerHTML = `
    <div class="card">
      <h2>AI Coaching</h2>
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
  const payload = {
    mode: document.getElementById("mode").value,
    gradeBand: document.getElementById("gradeBand").value,
    transcript: document.getElementById("transcript").value || undefined,
    attentionScore: Number(document.getElementById("attentionScore").value),
    imageBase64: await fileToBase64(file)
  };

  const response = await fetch("/api/analyze/focus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    result.innerHTML = `<p class="error">${data.error || "Request failed."}</p>`;
    return;
  }

  renderResult(data);
});
