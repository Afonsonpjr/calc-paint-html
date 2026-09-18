import { useState } from "react";

/**
 * Botao de automacao com IA: gera um resumo/descricao de orcamento
 * a partir dos dados calculados na sua calculadora de tinta.
 *
 * Uso: <AiSummaryButton prompt={`Gere um resumo de orcamento para ${areaM2}m2, tinta ${produto}, cor ${cor}.`} />
 */
export default function AiSummaryButton({ prompt, onResult }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function generate() {
    if (!prompt) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Falha ao gerar texto com IA");

      const data = await response.json();
      onResult?.(data.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={generate}
        disabled={loading || !prompt}
        style={{
          padding: "8px 14px",
          borderRadius: "8px",
          border: "none",
          background: "#16a34a",
          color: "#fff",
          fontWeight: 600,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Gerando..." : "Gerar resumo com IA"}
      </button>
      {error && <p style={{ color: "#dc2626", fontSize: "12px" }}>{error}</p>}
    </div>
  );
}
