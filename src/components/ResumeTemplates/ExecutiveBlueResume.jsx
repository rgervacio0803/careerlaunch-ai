import ResumeHeader from "../ResumeSections/ResumeHeader";
import ResumeSummary from "../ResumeSections/ResumeSummary";
import ResumeSkills from "../ResumeSections/ResumeSkills";
import ResumeExperience from "../ResumeSections/ResumeExperience";
import ResumeEducation from "../ResumeSections/ResumeEducation";
import ResumeCertifications from "../ResumeSections/ResumeCertifications";

function ExecutiveBlueResume({ resume }) {
  if (!resume) return null;

  return (
    <div className="executive-blue-resume">
      <ResumeHeader
        name={resume.name}
        title={resume.title}
        contact={resume.contact}
        className="executive-blue-header"
      />

      <div className="executive-blue-layout">
        <aside className="executive-blue-sidebar">
          <ResumeSkills
            skills={resume.skills}
            heading="Core Skills"
            className="executive-blue-sidebar-section"
            listClass="executive-blue-skills"
          />

          <ResumeEducation
            education={resume.education}
            heading="Education"
            className="executive-blue-sidebar-section"
          />

          <ResumeCertifications
            certifications={resume.certifications}
            heading="Certifications"
            className="executive-blue-sidebar-section"
          />
        </aside>

        <main className="executive-blue-main">
          <ResumeSummary
            summary={resume.summary}
            heading="Professional Profile"
            className="executive-blue-section"
          />

          <ResumeExperience
            experience={resume.experience}
            heading="Professional Experience"
            className="executive-blue-section"
            jobClass="executive-blue-job"
            headerClass="executive-blue-job-header"
          />
        </main>
      </div>
    </div>
  );
}

export default ExecutiveBlueResume;