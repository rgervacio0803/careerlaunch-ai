function Landing({ onStart }) {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-logo">🚀 CareerLaunch <span>AI</span></div>

        <div className="landing-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <button onClick={onStart}>Get Started Free</button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-left">
          <p className="landing-pill">✨ AI-Powered Career Toolkit</p>

          <h1>
            Land More Interviews With{" "}
            <span>AI-Powered Resume Optimization</span>
          </h1>

          <p className="landing-subtitle">
            Upload your resume and paste a job description. Get ATS analysis,
            an optimized resume, a tailored cover letter, and interview prep —
            all in minutes.
          </p>

          <div className="landing-actions">
            <button onClick={onStart}>Get Started Free →</button>
            <button className="landing-outline" onClick={onStart}>
              ⬆ Upload Resume
            </button>
          </div>

          <div className="landing-trust">
            <span>🛡️ No credit card required</span>
            <span>⚡ Instant results</span>
            <span>🔒 Your data is secure</span>
          </div>
        </div>

        <div className="landing-preview">
          <div className="preview-shell">
            <aside className="preview-sidebar">
              <div>⬆ Upload Resume</div>
              <div>🎯 Job Match</div>
              <div className="active">📊 ATS Analysis</div>
              <div>📄 Optimize Resume</div>
              <div>✉️ Cover Letter</div>
              <div>🎤 Interview Prep</div>
            </aside>

            <div className="preview-main">
              <h3>ATS Analysis</h3>

              <div className="preview-circle">
                <strong>92</strong>
                <span>/100</span>
              </div>

              <h4>Excellent Match ✨</h4>
              <p>Your resume is well-optimized for this job.</p>

              <div className="preview-check">✅ Good keyword match <b>92%</b></div>
              <div className="preview-check">✅ Clear formatting <b>95%</b></div>
              <div className="preview-check">✅ Relevant experience <b>88%</b></div>

              <div className="preview-keywords">
                <p>Top Missing Keywords</p>
                <span>Python</span>
                <span>AWS</span>
                <span>Django</span>
                <span>REST API</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features" id="features">
  <p className="section-eyebrow">Powerful Features</p>

  <h2>Everything You Need to Stand Out</h2>

  <p className="section-subtitle">
    AI-powered tools to help you create a winning application and land your dream job.
  </p>

  <div className="feature-row">
    <div className="feature-item">
      <div className="feature-icon blue">📈</div>
      <h3>ATS Analysis</h3>
      <p>
        Get a detailed ATS score and discover missing keywords to improve your chances.
      </p>
      <button onClick={onStart}>Learn more →</button>
    </div>

    <div className="feature-item">
      <div className="feature-icon purple">📄</div>
      <h3>Optimized Resume</h3>
      <p>
        AI rewrites your resume to better match the job description and beat ATS filters.
      </p>
      <button onClick={onStart}>Learn more →</button>
    </div>

    <div className="feature-item">
      <div className="feature-icon green">✉️</div>
      <h3>Cover Letter</h3>
      <p>
        Generate a personalized cover letter that highlights your strengths and fits the role.
      </p>
      <button onClick={onStart}>Learn more →</button>
    </div>

    <div className="feature-item">
      <div className="feature-icon orange">🎤</div>
      <h3>Interview Prep</h3>
      <p>
        Practice role-specific interview questions with AI-suggested answers and tips.
      </p>
      <button onClick={onStart}>Learn more →</button>
    </div>
  </div>

  <div className="success-banner">
    <div className="success-left">
      <div className="success-icon">🛡️</div>

      <div>
        <h3>Your Success. Our Priority.</h3>
        <p>
          CareerLaunch AI helps job seekers improve their resumes, cover letters,
          and interview preparation in one simple workflow.
        </p>
      </div>
    </div>

    <div className="success-stats">
      <div>
        <strong>10K+</strong>
        <span>Resumes Improved</span>
      </div>

      <div>
        <strong>4.9/5</strong>
        <span>User Rating</span>
      </div>

      <div>
        <strong>90%</strong>
        <span>Interview Confidence</span>
      </div>
    </div>
  </div>
</section>
    </div>
  );
}

export default Landing;