import { useState } from "react";

function Landing({ onStart }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-logo">
          🚀 CareerLaunch <span>AI</span>
        </div>

        <div className="landing-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <button onClick={onStart}>Get Started Free</button>
        </div>
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          ☰
        </button>
      </nav>

      {mobileMenuOpen && (
  <div className="mobile-menu">
    <a href="#features" onClick={() => setMobileMenuOpen(false)}>
      Features
    </a>

    <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
      How It Works
    </a>

    <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>
      Pricing
    </a>

    <a href="#faq" onClick={() => setMobileMenuOpen(false)}>
      FAQ
    </a>

    <button
      onClick={() => {
        setMobileMenuOpen(false);
        onStart();
      }}
    >
      Get Started Free
    </button>
  </div>
)}

      <section className="landing-hero">
        <div className="landing-left">
          <p className="landing-pill">✨ AI-Powered Career Toolkit</p>

          <h1>
            Land More Interviews With{" "}
            <span>AI-Powered Resume Optimization</span>
          </h1>

          <p className="landing-subtitle">
            Upload your resume and paste a job description. Get ATS analysis, an
            optimized resume, a tailored cover letter, and interview prep — all
            in minutes.
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

              <div className="preview-check">
                ✅ Good keyword match <b>92%</b>
              </div>
              <div className="preview-check">
                ✅ Clear formatting <b>95%</b>
              </div>
              <div className="preview-check">
                ✅ Relevant experience <b>88%</b>
              </div>

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
          AI-powered tools to help you create a winning application and land
          your dream job.
        </p>

        <div className="feature-row">
          <div className="feature-item">
            <div className="feature-icon blue">📈</div>
            <h3>ATS Analysis</h3>
            <p>
              Get a detailed ATS score and discover missing keywords to improve
              your chances.
            </p>
            <button onClick={onStart}>Learn more →</button>
          </div>

          <div className="feature-item">
            <div className="feature-icon purple">📄</div>
            <h3>Optimized Resume</h3>
            <p>
              AI rewrites your resume to better match the job description and
              beat ATS filters.
            </p>
            <button onClick={onStart}>Learn more →</button>
          </div>

          <div className="feature-item">
            <div className="feature-icon green">✉️</div>
            <h3>Cover Letter</h3>
            <p>
              Generate a personalized cover letter that highlights your
              strengths and fits the role.
            </p>
            <button onClick={onStart}>Learn more →</button>
          </div>

          <div className="feature-item">
            <div className="feature-icon orange">🎤</div>
            <h3>Interview Prep</h3>
            <p>
              Practice role-specific interview questions with AI-suggested
              answers and tips.
            </p>
            <button onClick={onStart}>Learn more →</button>
          </div>
        </div>

        <div className="success-banner">
          <div className="success-content">
            <div className="success-icon">🛡️</div>

            <div>
              <h3>Your Success. Our Priority.</h3>
              <p>
                CareerLaunch AI helps job seekers improve their resumes, cover
                letters, and interview preparation in one simple workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="how-it-works" id="how-it-works">
        <p className="section-eyebrow">How It Works</p>

        <h2>From Resume to Interview Ready</h2>

        <p className="section-subtitle">
          CareerLaunch AI guides you through your entire job application in one
          simple workflow.
        </p>

        <div className="how-it-works-grid">
          <div className="how-it-works-step">
            <span>1</span>
            <h3>Upload Your Resume</h3>
            <p>Upload your existing resume or paste your resume text.</p>
          </div>

          <div className="how-it-works-step">
            <span>2</span>
            <h3>Add the Job</h3>
            <p>
              Paste the job description so CareerLaunch AI can tailor your
              results.
            </p>
          </div>

          <div className="how-it-works-step">
            <span>3</span>
            <h3>Analyze Your Match</h3>
            <p>
              Get an ATS score, missing keywords, and personalized resume
              insights.
            </p>
          </div>

          <div className="how-it-works-step">
            <span>4</span>
            <h3>Optimize Your Resume</h3>
            <p>
              Improve your resume and choose a professional resume template.
            </p>
          </div>

          <div className="how-it-works-step">
            <span>5</span>
            <h3>Create Your Cover Letter</h3>
            <p>
              Generate a tailored cover letter for the position you're
              targeting.
            </p>
          </div>

          <div className="how-it-works-step">
            <span>6</span>
            <h3>Prepare for the Interview</h3>
            <p>
              Practice personalized interview questions, answers, and talking
              points.
            </p>
          </div>
        </div>

        <button className="how-it-works-cta" onClick={onStart}>
          Get Started Free →
        </button>
      </section>
      {/* PRICING SECTION */}
      <section className="landing-pricing" id="pricing">
        <p className="section-eyebrow">Simple Pricing</p>

        <h2>Choose the Plan That Works for You</h2>

        <p className="section-subtitle">
          Start free and upgrade when you're ready to unlock the full
          CareerLaunch AI toolkit.
        </p>

        <div className="pricing-grid">
          <div className="pricing-card">
            <p className="pricing-plan-name">Free</p>

            <div className="pricing-price">
              <span className="pricing-dollar">$0</span>
            </div>

            <p className="pricing-description">
              Get started and see how CareerLaunch AI can improve your job
              application.
            </p>

            <ul className="pricing-features">
              <li>✓ 1 resume analysis</li>
              <li>✓ ATS score and keyword analysis</li>
              <li>✓ Resume insights</li>
              <li>✓ Preview resume optimization</li>
              <li>✓ Limited resume templates</li>
            </ul>

            <button
              className="pricing-button pricing-button-free"
              onClick={onStart}
            >
              Get Started Free
            </button>
          </div>

          <div className="pricing-card pricing-card-pro">
            <div className="pricing-popular">Most Popular</div>

            <p className="pricing-plan-name">CareerLaunch Pro</p>

            <div className="pricing-price">
              <span className="pricing-dollar">$14.99</span>
              <span className="pricing-period">/month</span>
            </div>

            <p className="pricing-description">
              Everything you need to optimize your applications and prepare for
              interviews.
            </p>

            <ul className="pricing-features">
              <li>✓ Unlimited resume analyses</li>
              <li>✓ Full AI resume optimization</li>
              <li>✓ All professional resume templates</li>
              <li>✓ Unlimited PDF downloads</li>
              <li>✓ Tailored cover letters</li>
              <li>✓ Personalized interview preparation</li>
              <li>✓ Optimize for multiple job descriptions</li>
            </ul>

            <button
              className="pricing-button pricing-button-pro"
              onClick={onStart}
            >
              Start with Pro →
            </button>
          </div>
        </div>
      </section>
      {/* FAQ SECTION */}
      <section className="landing-faq" id="faq">
        <p className="section-eyebrow">Frequently Asked Questions</p>

        <h2>Questions? We've Got Answers.</h2>

        <p className="section-subtitle">
          Everything you need to know about CareerLaunch AI.
        </p>

        <div className="faq-list">
          <details className="faq-item">
            <summary>What is CareerLaunch AI?</summary>
            <p>
              CareerLaunch AI is an AI-powered career toolkit that helps you
              analyze your resume, improve it for a specific job, create a
              tailored cover letter, and prepare for interviews.
            </p>
          </details>

          <details className="faq-item">
            <summary>Can I use CareerLaunch AI for free?</summary>
            <p>
              Yes. The free plan lets you analyze one resume, review your ATS
              score and keyword insights, and explore the resume optimization
              workflow.
            </p>
          </details>

          <details className="faq-item">
            <summary>What does the Pro plan include?</summary>
            <p>
              CareerLaunch Pro includes unlimited resume analyses, full AI
              resume optimization, all professional templates, PDF downloads,
              tailored cover letters, and personalized interview preparation.
            </p>
          </details>

          <details className="faq-item">
            <summary>Can I optimize my resume for a specific job?</summary>
            <p>
              Yes. Paste the job description you're targeting and CareerLaunch
              AI uses it to identify relevant keywords, analyze your match, and
              tailor your application.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              Does CareerLaunch AI guarantee I will get an interview?
            </summary>
            <p>
              No service can guarantee an interview or job offer. CareerLaunch
              AI is designed to help you create a stronger, more targeted job
              application and prepare more effectively for interviews.
            </p>
          </details>

          <details className="faq-item">
            <summary>Is my resume information secure?</summary>
            <p>
              CareerLaunch AI is designed to process the information you provide
              so it can generate your career materials. Please avoid including
              sensitive information that isn't necessary for your resume or job
              application.
            </p>
          </details>
        </div>
      </section>
      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              🚀 CareerLaunch <span>AI</span>
            </div>

            <p>
              AI-powered tools to help you build stronger applications and
              prepare for your next opportunity.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>

            <div>
              <h4>Get Started</h4>
              <button onClick={onStart}>Build Your Resume →</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 CareerLaunch AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
