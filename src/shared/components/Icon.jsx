// Ícone reutilizável. Ex.: <Icon name="wrench" /> ou <Icon name="check" size="lg" />
// Os nomes disponíveis são os ids definidos em IconSprite.jsx (sem o prefixo "i-").
export default function Icon({ name, size, className = "", ...rest }) {
  const cls = ["icon", size === "lg" ? "icon-lg" : "", className].filter(Boolean).join(" ");
  return (
    <svg className={cls} aria-hidden="true" {...rest}>
      <use href={`#i-${name}`} />
    </svg>
  );
}
