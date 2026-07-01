function MinimalResume({ resume }) {
  if (!resume) return null;

  return (
    <div className="minimal-resume-paper">
      <header className="minimal-resume-header">
        <h1>{resume.name || "Candidate Name"}</h1>
        <p>{resume.title || "Target Role"}</p>
        {resume.contact && <span>{resume.contact}</span>}
      </header>

      {resume.summary && (
        <section className="minimal-section">
          <h2>Summary</h2>
          <p>{resume.summary}</p>
        </section>
      )}

      {resume.experience?.length > 0 && (
        <section className="minimal-section">
          <h2>Experience</h2>

          {resume.experience.map((job, index) => (
            <div key={index} className="minimal-job">
              <h3>{job.jobTitle}</h3>
              <p>
                {job.company} {job.dates && `• ${job.dates}`}
              </p>

              <ul>
                {job.bullets?.map((bullet, bulletIndex) => (
                  <li key={bulletIndex}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {resume.skills?.length > 0 && (
        <section className="minimal-section">
          <h2>Skills</h2>
          <p>{resume.skills.join(" / ")}</p>
        </section>
      )}

      {resume.education?.length > 0 && (
        <section className="minimal-section">
          <h2>Education</h2>
          <p>{resume.education.join(" / ")}</p>
        </section>
      )}
    </div>
  );
}

export default MinimalResume;