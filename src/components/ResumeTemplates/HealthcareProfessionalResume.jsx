import ResumePage from "./ResumePage";
import ResumeHeader from "../ResumeSections/ResumeHeader";
import ResumeSummary from "../ResumeSections/ResumeSummary";
import ResumeSkills from "../ResumeSections/ResumeSkills";
import ResumeExperience from "../ResumeSections/ResumeExperience";
import ResumeEducation from "../ResumeSections/ResumeEducation";
import ResumeCertifications from "../ResumeSections/ResumeCertifications";

function HealthcareProfessionalResume({ resume }) {
  if (!resume) return null;

  return (
    <ResumePage className="healthcare-professional-resume">
      <ResumeHeader
        name={resume.name}
        title={resume.title}
        contact={resume.contact}
        className="healthcare-professional-header"
      />

      <ResumeSummary
        summary={resume.summary}
        heading="Professional Summary"
        className="healthcare-professional-section"
      />

      <ResumeSkills
        skills={resume.skills}
        heading="Clinical & Professional Skills"
        className="healthcare-professional-section"
        listClass="healthcare-professional-skills"
      />

      <ResumeExperience
        experience={resume.experience}
        heading="Professional Experience"
        className="healthcare-professional-section"
        jobClass="healthcare-professional-job"
        headerClass="healthcare-professional-job-header"
      />

      <ResumeCertifications
        certifications={resume.certifications}
        heading="Licenses & Certifications"
        className="healthcare-professional-section"
      />

      <ResumeEducation
        education={resume.education}
        heading="Education"
        className="healthcare-professional-section"
      />
    </ResumePage>
  );
}

export default HealthcareProfessionalResume;