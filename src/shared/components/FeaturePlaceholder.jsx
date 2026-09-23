import Icon from "./Icon";

// Placeholder padrão para uma feature que ainda não foi implementada.
// Cada página em src/features/<feature>/ usa isto até o responsável
// substituir pelo conteúdo de verdade (ver protótipo V2 como referência de tela).
export default function FeaturePlaceholder({ icon, title, description, owner, endpoints = [] }) {
  return (
    <section>
      <div className="view-header">
        <div>
          <h1>{title}</h1>
          <div className="desc">{description}</div>
        </div>
      </div>
      <div className="card card-pad" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
        <Icon name={icon} size="lg" className="icon-lg" />
        <h3 style={{ fontSize: "1.05rem", margin: ".6rem 0 .4rem" }}>Em construção</h3>
        <p style={{ color: "var(--ink-muted)", fontSize: ".88rem", marginBottom: endpoints.length ? "1rem" : 0 }}>
          Responsável: <strong>{owner}</strong>. Use o{" "}
          <a href="https://github.com/Peaguinha/garage-system" target="_blank" rel="noreferrer">
            protótipo V2
          </a>{" "}
          como referência de tela.
        </p>
        {endpoints.length > 0 && (
          <div className="mono" style={{ fontSize: ".8rem", color: "var(--ink-muted)" }}>
            {endpoints.join(" · ")}
          </div>
        )}
      </div>
    </section>
  );
}
