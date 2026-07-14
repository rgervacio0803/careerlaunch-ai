function ResumeSkills({
  skills,
  heading = "Core Competencies",
  className = "",
  listClass = "",
}) {
  if (!skills?.length) return null;

  return (
    <section className={className}>
      <h2>{heading}</h2>

      <div className={listClass}>
        {skills.map((skill, index) => (
          <span key={index}>{skill}</span>
        ))}
      </div>
    </section>
  );
}

export default ResumeSkills;