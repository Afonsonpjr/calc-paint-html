import TranslateButton from "./TranslateButton";

/**
 * Footer padrao do Ink-It.
 * Para usar, importe e coloque <Footer /> no final do seu layout principal (ex.: dentro de App.jsx,
 * depois do conteudo da calculadora).
 *
 * IMPORTANTE: preencha DONATION_URL com o link real de doacao (Pix, Buy Me a Coffee, GitHub Sponsors, etc.)
 * antes de publicar. Enquanto estiver vazio, o botao de doacao fica desabilitado.
 */

const WHATSAPP_NUMBER = "5547991757098"; // +55 47 99175-7098, formato E.164 sem simbolos
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
const DONATION_URL = ""; // TODO: preencher com o link de doacao (Pix Copia e Cola, PayPal, Buy Me a Coffee, etc.)

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "40px",
        padding: "24px 16px",
        borderTop: "1px solid #e5e7eb",
        background: "#fafafa",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px", color: "#374151" }}>
            Construido com <span aria-hidden="true">♥️</span> por{" "}
            <strong>Afonso Pereira</strong>.
          </p>
          <TranslateButton />
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            fontSize: "14px",
            color: "#374151",
          }}
        >
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#16a34a", fontWeight: 600, textDecoration: "none" }}
          >
            WhatsApp: +55 47 99175-7098
          </a>
          <span style={{ color: "#6b7280" }}>E-mail: em breve!</span>
        </div>

        <div
          style={{
            padding: "14px 16px",
            borderRadius: "10px",
            background: "#fef3c7",
            border: "1px solid #fde68a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "14px", color: "#92400e", fontWeight: 500 }}>
            Doe aqui para auxiliar no desenvolvimento do Projeto
          </span>
          <a
            href={DONATION_URL || "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!DONATION_URL}
            onClick={(e) => {
              if (!DONATION_URL) e.preventDefault();
            }}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              background: DONATION_URL ? "#f59e0b" : "#d1d5db",
              color: "#fff",
              fontWeight: 700,
              fontSize: "13px",
              textDecoration: "none",
              cursor: DONATION_URL ? "pointer" : "not-allowed",
            }}
          >
            Doar
          </a>
        </div>
      </div>
    </footer>
  );
}
