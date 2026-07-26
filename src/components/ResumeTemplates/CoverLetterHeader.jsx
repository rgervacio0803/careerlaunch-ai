function ModernHeader({ resume }) {
  const name = resume?.name || "Candidate Name";
  const title = resume?.title || "";
  const contact = resume?.contact || "";

  return (
    <header className="cover-letter-theme-header modern-cover-letter-header">
      <div className="modern-cover-letter-heading">
        <h1>{name}</h1>

        {title && <p className="modern-cover-letter-title">{title}</p>}
      </div>

      {contact && <p className="modern-cover-letter-contact">{contact}</p>}
    </header>
  );
}

function ExecutiveBlueHeader({ resume }) {
  const name = resume?.name || "Candidate Name";
  const title = resume?.title || "";
  const contact = resume?.contact || "";

  return (
    <header className="executive-blue-cover-letter-header">
      <h1>{name}</h1>

      {title && <p className="executive-blue-cover-letter-title">{title}</p>}

      {contact && (
        <p className="executive-blue-cover-letter-contact">{contact}</p>
      )}
    </header>
  );
}

function ExecutiveEliteHeader({ resume }) {
  const name = resume?.name || "Candidate Name";
  const title = resume?.title || "";
  const contact = resume?.contact || "";

  return (
    <header className="executive-elite-cover-letter-header">
      <div>
        <h1>{name}</h1>

        {title && <p className="executive-elite-cover-letter-title">{title}</p>}
      </div>

      {contact && (
        <p className="executive-elite-cover-letter-contact">{contact}</p>
      )}
    </header>
  );
}

function ProfessionalHeader({ resume }) {
  const name = resume?.name || "Candidate Name";
  const title = resume?.title || "";
  const contact = resume?.contact || "";

  return (
    <header className="professional-cover-letter-header">
      <h1>{name}</h1>

      {title && <p className="professional-cover-letter-title">{title}</p>}

      {contact && (
        <p className="professional-cover-letter-contact">{contact}</p>
      )}
    </header>
  );
}

function ExecutiveHeader({ resume }) {
  const name = resume?.name || "Candidate Name";
  const title = resume?.title || "";
  const contact = resume?.contact || "";

  return (
    <header className="executive-cover-letter-header">
      <div>
        <h1>{name}</h1>

        {title && <p className="executive-cover-letter-title">{title}</p>}
      </div>

      {contact && <p className="executive-cover-letter-contact">{contact}</p>}
    </header>
  );
}

function MinimalHeader({ resume }) {
  const name = resume?.name || "Candidate Name";
  const title = resume?.title || "";
  const contact = resume?.contact || "";

  return (
    <header className="minimal-cover-letter-header">
      <h1>{name}</h1>

      {title && <p className="minimal-cover-letter-title">{title}</p>}

      {contact && (
        <span className="minimal-cover-letter-contact">{contact}</span>
      )}
    </header>
  );
}

function TechHeader({ resume }) {
  const name = resume?.name || "Candidate Name";
  const title = resume?.title || "";
  const contact = resume?.contact || "";

  return (
    <header className="tech-cover-letter-header">
      <div>
        <h1>{name}</h1>

        <p>{title || "Technology Professional"}</p>
      </div>

      {contact && <span className="tech-cover-letter-contact">{contact}</span>}
    </header>
  );
}

function HealthcareProfessionalHeader({ resume }) {
  const name = resume?.name || "Candidate Name";
  const title = resume?.title || "";
  const contact = resume?.contact || "";

  return (
    <header className="healthcare-cover-letter-header">
      <div>
        <h1>{name}</h1>

        {title && <p className="healthcare-cover-letter-title">{title}</p>}
      </div>

      {contact && <p className="healthcare-cover-letter-contact">{contact}</p>}
    </header>
  );
}

function DefaultHeader({ resume, template }) {
  const name = resume?.name || "Candidate Name";
  const title = resume?.title || "";
  const contact = resume?.contact || "";

  return (
    <header className={`cover-letter-theme-header theme-${template}`}>
      <div className="cover-letter-theme-name">
        <h1>{name}</h1>

        {title && <p className="cover-letter-theme-title">{title}</p>}
      </div>

      {contact && <p className="cover-letter-theme-contact">{contact}</p>}
    </header>
  );
}

function CoverLetterHeader({ template, structuredResume }) {
  switch (template) {
    case "modern":
      return <ModernHeader resume={structuredResume} />;

    case "executive-blue":
      return <ExecutiveBlueHeader resume={structuredResume} />;

    case "executive-elite":
      return <ExecutiveEliteHeader resume={structuredResume} />;

    case "executive":
      return <ExecutiveHeader resume={structuredResume} />;

    case "professional":
      return <ProfessionalHeader resume={structuredResume} />;

    case "minimal":
      return <MinimalHeader resume={structuredResume} />;

    case "tech":
      return <TechHeader resume={structuredResume} />;

    case "healthcare-professional":
      return <HealthcareProfessionalHeader resume={structuredResume} />;

    default:
      return <DefaultHeader resume={structuredResume} template={template} />;
  }
}

export default CoverLetterHeader;
