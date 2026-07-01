function ProfessionalResume({ resume }) {
  if (!resume) return null;

  return (
    <div className="professional-resume-paper">
      <header className="professional-resume-header">
        <h1>{resume.name || "Candidate Name"}</h1>
        <p>{resume.title || "Target Role"}</p>
        {resume.contact && <span>{resume.contact}</span>}
      </header>

      {resume.summary && (
        <section className="professional-section">
          <h2>Professional Summary</h2>
          <p>{resume.summary}</p>
        </section>
      )}

      {resume.experience?.length > 0 && (
        <section className="professional-section">
          <h2>Professional Experience</h2>

          {resume.experience.map((job, index) => (
            <div key={index} className="professional-job">
              <div className="professional-job-header">
                <div>
                  <h3>{job.company}</h3>
                  <p>{job.jobTitle}</p>
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

      {resume.skills?.length > 0 && (
        <section className="professional-section">
          <h2>Core Skills</h2>
          <p>{resume.skills.join(" • ")}</p>
        </section>
      )}

      {resume.education?.length > 0 && (
        <section className="professional-section">
          <h2>Education</h2>
          <ul>
            {resume.education.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default ProfessionalResume;