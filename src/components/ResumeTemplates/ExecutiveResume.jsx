import ResumePage from "./ResumePage";

function ExecutiveResume({ resume }) {
  if (!resume) return null;

  return (
    <ResumePage className="executive-resume-paper">
      <header className="executive-header">
        <div>
          <h1>{resume.name || "Candidate Name"}</h1>
          <p>{resume.title || "Executive Leader"}</p>
        </div>

        {resume.contact && <span>{resume.contact}</span>}
      </header>

      {resume.summary && (
        <section className="executive-section executive-summary">
          <h2>Executive Profile</h2>
          <p>{resume.summary}</p>
        </section>
      )}

      {resume.skills?.length > 0 && (
        <section className="executive-section">
          <h2>Leadership Strengths</h2>

          <div className="executive-skill-grid">
            {resume.skills.map((skill, index) => (
              <span key={index}>{skill}</span>
            ))}
          </div>
        </section>
      )}

      {resume.experience?.length > 0 && (
        <section className="executive-section">
          <h2>Professional Experience</h2>

          {resume.experience.map((job, index) => (
            <div key={index} className="executive-job">
              <div className="executive-job-header">
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
        <section className="executive-section">
          <h2>Education</h2>
          <p>{resume.education.join(" • ")}</p>
        </section>
      )}

      {resume.certifications?.length > 0 && (
        <section className="executive-section">
          <h2>Certifications</h2>
          <p>{resume.certifications.join(" • ")}</p>
        </section>
      )}
    </ResumePage>
  );
}

export default ExecutiveResume;