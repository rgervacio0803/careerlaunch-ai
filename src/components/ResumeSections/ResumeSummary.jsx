function ResumeSummary({
  summary,
  heading = "Professional Summary",
  className = "",
}) {
  if (!summary) return null;

  return (
    <section className={`resume-shared-summary ${className}`}>
      <h2>{heading}</h2>
      <p>{summary}</p>
    </section>
  );
}

export default ResumeSummary;