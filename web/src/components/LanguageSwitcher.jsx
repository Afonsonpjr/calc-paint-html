import React from "react";
import { LANGUAGE_OPTIONS, useI18n } from "../i18n/index.js";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <label
      title={t("common.language")}
      style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--ink-muted)" }}
    >
      <span aria-hidden="true" style={{ fontSize: 13 }}>🌐</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        aria-label={t("common.language")}
        style={{
          fontFamily: "var(--f-mono)",
          fontSize: 10.5,
          padding: "5px 7px",
          border: "1px solid var(--ink-faint)",
          background: "var(--paper-bright)",
          color: "var(--ink)",
          cursor: "pointer",
          maxWidth: 112,
        }}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
