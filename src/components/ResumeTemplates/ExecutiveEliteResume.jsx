import ResumeHeader from "../ResumeSections/ResumeHeader";
import ResumeSummary from "../ResumeSections/ResumeSummary";
import ResumeExperience from "../ResumeSections/ResumeExperience";
import ResumeSkills from "../ResumeSections/ResumeSkills";

function ExecutiveEliteResume({ resume }) {
  if (!resume) return null;

  return (
    <div className="executive-elite-resume">
      <ResumeHeader
        name={resume.name}
        title={resume.title}
        contact={resume.contact}
        className="executive-elite-header"
      />

      <ResumeSummary
        summary={resume.summary}
        heading="Executive Profile"
        className="executive-elite-section"
      />

      <ResumeSkills
        skills={resume.skills}
        heading="Core Competencies"
        className="executive-elite-section"
        listClass="executive-elite-skills"
      />

      <ResumeExperience
        experience={resume.experience}
        heading="Professional Experience"
        className="executive-elite-section"
        jobClass="executive-elite-job"
        headerClass="executive-elite-job-header"
      />

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
