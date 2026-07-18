import ResumePage from "./ResumePage";
import ResumeHeader from "../ResumeSections/ResumeHeader";
import ResumeSummary from "../ResumeSections/ResumeSummary";
import ResumeExperience from "../ResumeSections/ResumeExperience";
import ResumeSkills from "../ResumeSections/ResumeSkills";
import ResumeEducation from "../ResumeSections/ResumeEducation";
import ResumeCertifications from "../ResumeSections/ResumeCertifications";

function ExecutiveEliteResume({ resume }) {
  if (!resume) return null;

  return (
    <ResumePage className="executive-elite-resume">
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

      <ResumeEducation
        education={resume.education}
        heading="Education"
        className="executive-elite-section"
      />
      <ResumeCertifications
        certifications={resume.certifications}
        heading="Certifications"
        className="executive-elite-section"
      />
    </ResumePage>
  );
}

export default ExecutiveEliteResume;
