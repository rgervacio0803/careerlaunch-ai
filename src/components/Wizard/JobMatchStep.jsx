function JobMatchStep({
  jobTitle,
  setJobTitle,

  companyName,
  setCompanyName,

  jobDescription,
  setJobDescription,

  loading,
  handleAnalyze,
}) {
  return (
    <section className="wizard-step-page">
      <div className="step-page-header">
        <p className="step-kicker">Step 2</p>

        <h2>Target Job Details</h2>

        <p>
          Enter the job title and company name, then paste the complete job
          description so CareerLaunch AI can tailor your resume and cover
          letter.
        </p>
      </div>

      <div className="job-details-workspace">
        <div className="form-group">
          <label htmlFor="job-title">Job Title</label>

          <input
            id="job-title"
            className="job-title-input-modern"
            type="text"
            placeholder="Example: Cytogenetic Technologist"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="company-name">Company Name</label>

          <input
            id="company-name"
            className="job-title-input-modern"
            type="text"
            placeholder="Example: Kaiser Permanente"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="job-description">Responsibilities and Duties</label>

          <textarea
            id="job-description"
            className="job-description-modern"
            placeholder="Paste the job responsibilities, requirements, and duties here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <button
          className="primary-action-button"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "Analyzing Match..." : "Analyze Match →"}
        </button>
      </div>
    </section>
  );
}

export default JobMatchStep;
