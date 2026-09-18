import { test } from "node:test";
import assert from "node:assert/strict";
import { detectLocale, normalizeLocale, translate } from "../src/i18n/core.js";

test("normalizes supported locale families", () => {
  assert.equal(normalizeLocale("pt-BR"), "pt-BR");
  assert.equal(normalizeLocale("pt-PT"), "pt-BR");
  assert.equal(normalizeLocale("es-MX"), "es");
  assert.equal(normalizeLocale("en-US"), "en");
  assert.equal(normalizeLocale("fr-FR"), null);
});

test("locale detection prefers URL, then saved preference, then browser", () => {
  assert.equal(detectLocale({ query: "es", stored: "pt-BR", languages: ["en-US"] }), "es");
  assert.equal(detectLocale({ stored: "pt-BR", languages: ["en-US"] }), "pt-BR");
  assert.equal(detectLocale({ languages: ["es-AR", "en-US"] }), "es");
  assert.equal(detectLocale({ languages: ["fr-FR"] }), "en");
});

test("translations fall back to English and interpolate variables", () => {
  assert.equal(translate("pt-BR", "header.open"), "Abrir");
  assert.equal(translate("es", "toolbar.scale", { sheet: "A-101" }), "Escala — A-101");
  assert.equal(translate("pt-BR", "missing.key", {}, "Fallback"), "Fallback");
});
