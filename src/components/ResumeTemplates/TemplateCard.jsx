function TemplateCard({
  template,
  isSelected,
  isRecommended,
  onSelect,
  children,
}) {
  return (
    <button
      type="button"
      className={`template-gallery-card premium-template-card ${
        isSelected ? "active" : ""
      }`}
      onClick={onSelect}
    >
      {isRecommended && (
        <div className="premium-recommended-ribbon">
          ⭐ AI Recommended
        </div>
      )}

      {isSelected && (
        <div className="premium-selected-check">✓</div>
      )}

      {children}

<div className="premium-template-details">
        <h3>{template.name}</h3>

        <p className="premium-template-description">
          {template.description}
        </p>

        <p className="premium-template-best-for">
          Best for: {template.bestFor}
        </p>

        <div className="premium-template-tags">
          <span>ATS Friendly</span>
          <span>PDF Ready</span>
        </div>
      </div>
    </button>
  );
}

export default TemplateCard;