function ResumeCertifications({
  certifications,
  heading = "Certifications",
  className = "",
}) {
  if (!certifications?.length) return null;

  return (
    <section className={className}>
      <h2>{heading}</h2>

      {certifications.map((item, index) => (
        <p key={index}>{item}</p>
      ))}
    </section>
  );
}

export default ResumeCertifications;