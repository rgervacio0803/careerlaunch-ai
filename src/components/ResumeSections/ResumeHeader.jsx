function ResumeHeader({
  name,
  title,
  contact,
  className = "",
  align = "left",
}) {
  return (
    <header
      className={`resume-shared-header ${className}`}
      style={{ textAlign: align }}
    >
      <div className="resume-shared-header-main">
        <h1>{name || "Candidate Name"}</h1>

        {title && <p className="resume-shared-title">{title}</p>}
      </div>

      {contact && (
        <div className="resume-shared-contact">
          {contact}
        </div>
      )}
    </header>
  );
}

export default ResumeHeader;