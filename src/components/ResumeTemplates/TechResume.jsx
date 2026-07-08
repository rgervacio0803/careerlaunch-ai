function TechResume({ resume }) {
  if (!resume) return null;

  return (
    <div className="tech-resume-paper">
      <header className="tech-header">
        <div>
          <h1>{resume.name || "Candidate Name"}</h1>
          <p>{resume.title || "Technology Professional"}</p>
        </div>

        {resume.contact && <span>{resume.contact}</span>}
      </header>

      {resume.summary && (
        <section className="tech-section">
          <h2>Profile</h2>
          <p>{resume.summary}</p>
        </section>
      )}

      {resume.skills?.length > 0 && (
        <section className="tech-section">
          <h2>Tech Stack</h2>

          <div className="tech-stack-grid">
            {resume.skills.map((skill, index) => (
              <span key={index} className="tech-pill">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {resume.experience?.length > 0 && (
        <section className="tech-section">
          <h2>Engineering Experience</h2>

          {resume.experience.map((job, index) => (
            <div key={index} className="tech-job">
              <div className="tech-job-header">
                <div>
                  <h3>{job.jobTitle}</h3>
                  <p>{job.company}</p>
                </div>
                <span>{job.dates}</span>
              </div>

              <ul>
                {job.bullets?.map((bullet, bulletIndex) => (
                  <li key={bulletIndex}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {resume.education?.length > 0 && (
        <section className="tech-section">
          <h2>Education</h2>
          <p>{resume.education.join(" • ")}</p>
        </section>
      )}
    </div>
  );
}

export default TechResume;
