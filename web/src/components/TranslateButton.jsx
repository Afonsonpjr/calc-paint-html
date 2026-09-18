import { useState } from "react";

/**
 * Botao de traducao para o header do site.
 * Marque qualquer elemento de texto que deve ser traduzido com o atributo
 * data-translate="true", por exemplo: <h1 data-translate="true">Calculadora de Tinta</h1>
 *
 * Uso: importe e coloque <TranslateButton /> dentro do seu componente de header existente.
 */

const LANGUAGES = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

const originalTextCache = new WeakMap();

export default function TranslateButton() {
  const [loading, setLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState("pt");

  async function translatePage(targetLang) {
    if (targetLang === currentLang || loading) return;
    setLoading(true);

    try {
      const nodes = Array.from(document.querySelectorAll("[data-translate]"));

      if (targetLang === "pt") {
        nodes.forEach((el) => {
          const original = originalTextCache.get(el);
          if (original !== undefined) el.textContent = original;
        });
        setCurrentLang("pt");
        return;
      }

      nodes.forEach((el) => {
        if (!originalTextCache.has(el)) {
          originalTextCache.set(el, el.textContent);
        }
      });

      const texts = nodes.map((el) => originalTextCache.get(el) ?? el.textContent);
      const joined = texts.join("\n");

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: joined,
          source_lang: "pt",
          target_lang: targetLang,
        }),
      });

      if (!response.ok) throw new Error("Falha na traducao");

      const data = await response.json();
      const translatedLines = (data.translated || "").split("\n");

      nodes.forEach((el, i) => {
        if (translatedLines[i]) el.textContent = translatedLines[i];
      });

      setCurrentLang(targetLang);
    } catch (err) {
      console.error("Erro ao traduzir a pagina:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        alignItems: "center",
      }}
      aria-label="Seletor de idioma"
    >
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => translatePage(lang.code)}
          disabled={loading || lang.code === currentLang}
          style={{
            padding: "4px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: lang.code === currentLang ? "#2563eb" : "#fff",
            color: lang.code === currentLang ? "#fff" : "#333",
            fontSize: "12px",
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
