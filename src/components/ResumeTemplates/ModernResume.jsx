function ModernResume({ resumeText }) {
  return (
    <div className="resume-template modern-resume">
      <div className="resume-template-header">
        <h2>Modern Resume</h2>
        <p>Clean, professional resume preview</p>
      </div>

      <div className="modern-resume-paper">
        <pre>{resumeText}</pre>
      </div>
    </div>
  );
}

export default ModernResume;