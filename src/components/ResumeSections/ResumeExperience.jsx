function ResumeExperience({
  experience,
  heading = "Professional Experience",
  className = "",
  jobClass = "",
  headerClass = "",
}) {
  if (!experience?.length) return null;

  return (
    <section className={className}>
      <h2>{heading}</h2>

      {experience.map((job, index) => (
        <article key={index} className={`resume-job-entry ${jobClass}`}>
          <div className={headerClass}>
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
  );
}

export default ResumeExperience;
