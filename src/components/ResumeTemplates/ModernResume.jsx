import ResumePage from "./ResumePage";

function ModernResume({ resume }) {
  if (!resume) {
    return null;
  }

  return (
   <ResumePage className="modern-resume-paper">
      <header className="modern-resume-header">
        <h1>{resume.name || "Candidate Name"}</h1>
        <p>{resume.title || "Target Role"}</p>

        {resume.contact && <span>{resume.contact}</span>}
      </header>

      {resume.summary && (
        <section className="modern-resume-section">
          <h2>Professional Summary</h2>
          <p>{resume.summary}</p>
        </section>
      )}

      {resume.skills?.length > 0 && (
        <section className="modern-resume-section">
          <h2>Skills</h2>

          <div className="modern-skill-list">
            {resume.skills.map((skill, index) => (
              <span key={index}>{skill}</span>
            ))}
          </div>
        </section>
      )}

      {resume.experience?.length > 0 && (
        <section className="modern-resume-section">
          <h2>Experience</h2>

          {resume.experience.map((job, index) => (
            <div key={index} className="modern-job">
              <div className="modern-job-header">
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
        <section className="modern-resume-section">
          <h2>Education</h2>

          <ul>
            {resume.education.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {resume.certifications?.length > 0 && (
        <section className="modern-resume-section">
          <h2>Certifications</h2>

          <ul>
            {resume.certifications.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </ResumePage>
  );
}

export default ModernResume;