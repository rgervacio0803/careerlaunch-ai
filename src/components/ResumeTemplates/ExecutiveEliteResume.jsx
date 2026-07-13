function ExecutiveEliteResume({ resume }) {
  if (!resume) return null;

  return (
    <div className="executive-elite-resume">
      <header className="executive-elite-header">
        <div>
          <h1>{resume.name || "Candidate Name"}</h1>
          <p>{resume.title || "Executive Professional"}</p>
        </div>

        {resume.contact && (
          <div className="executive-elite-contact">{resume.contact}</div>
        )}
      </header>

      {resume.summary && (
        <section className="executive-elite-section">
          <h2>Executive Profile</h2>
          <p>{resume.summary}</p>
        </section>
      )}

      {resume.skills?.length > 0 && (
        <section className="executive-elite-section">
          <h2>Core Competencies</h2>

          <div className="executive-elite-skills">
            {resume.skills.map((skill, index) => (
              <span key={index}>{skill}</span>
            ))}
          </div>
        </section>
      )}

      {resume.experience?.length > 0 && (
        <section className="executive-elite-section">
          <h2>Professional Experience</h2>

          {resume.experience.map((job, index) => (
            <article key={index} className="executive-elite-job">
              <div className="executive-elite-job-header">
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
            </article>
          ))}
        </section>
      )}

      {resume.education?.length > 0 && (
        <section className="executive-elite-section">
          <h2>Education</h2>

          {resume.education.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </section>
      )}

      {resume.certifications?.length > 0 && (
        <section className="executive-elite-section">
          <h2>Certifications</h2>

          {resume.certifications.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </section>
      )}
    </div>
  );
}

export default ExecutiveEliteResume;