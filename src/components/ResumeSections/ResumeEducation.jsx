function ResumeEducation({
  education,
  heading = "Education",
  className = "",
}) {
  if (!education?.length) return null;

  return (
    <section className={className}>
      <h2>{heading}</h2>

      {education.map((item, index) => (
        <p key={index}>{item}</p>
      ))}
    </section>
  );
}

export default ResumeEducation;
