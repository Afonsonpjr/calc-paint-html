export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/translate" && request.method === "POST") {
      return handleTranslate(request, env);
    }

    if (url.pathname === "/api/ai-summary" && request.method === "POST") {
      return handleAiSummary(request, env);
    }

    // Qualquer outra rota cai nos assets estaticos gerados pelo Vite (pasta dist/)
    return env.ASSETS.fetch(request);
  },
};

async function handleTranslate(request, env) {
  try {
    const { text, source_lang = "pt", target_lang = "en" } = await request.json();

    if (!text || typeof text !== "string") {
      return jsonResponse({ error: "Campo 'text' e obrigatorio." }, 400);
    }

    const result = await env.AI.run("@cf/meta/m2m100-1.2b", {
      text,
      source_lang,
      target_lang,
    });

    return jsonResponse({ translated: result.translated_text });
  } catch (err) {
    return jsonResponse({ error: err.message || "Erro ao traduzir." }, 500);
  }
}

async function handleAiSummary(request, env) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return jsonResponse({ error: "Campo 'prompt' e obrigatorio." }, 400);
    }

    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        {
          role: "system",
          content:
            "Voce e um assistente de vendas de uma loja de tintas e decoracao. " +
            "Gere descricoes de orcamento e recomendacoes de produto claras, objetivas " +
            "e amigaveis em portugues, com no maximo 3 paragrafos curtos.",
        },
        { role: "user", content: prompt },
      ],
    });

    return jsonResponse({ text: result.response });
  } catch (err) {
    return jsonResponse({ error: err.message || "Erro ao gerar texto." }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
