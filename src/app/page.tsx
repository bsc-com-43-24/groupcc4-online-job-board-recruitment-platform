"use client";
import "./page.css";
export default function Home() {
  return (
    <main className="home">
      {/* Navigation bar */}
      <nav className="navbar">
        <a href="/" className="logo">
          <span className="logo-icon">▣</span>
          Job<span>Board</span>
        </a>

        <div className="nav-links">
          <a className="active" href="/">Home</a>
          <a href="/jobs">Jobs</a>
          <a href="/employers">Employers</a>
          <a href="/about">About</a>
        </div>

        <div className="nav-actions">
          <a className="login-btn" href="/auth/login">
            Login
          </a>
          <a className="register-btn" href="/auth/register">
            Register
          </a>
        </div>
      </nav>

      {/* Hero section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>▣</span> Find Your Next Opportunity
          </div>

          <h1>
            Your Dream Job is
            <br />
            <span>Waiting</span>
          </h1>

          <p className="subtitle">
            Search vacancies, apply, and track every application
            <br className="desktop-break" />
            in one place.
          </p>

          {/* Job search form */}
          <form className="search-box" action="/jobs" method="GET">
            <label className="search-field">
              <span>⌕</span>
              <input
                type="text"
                name="keyword"
                placeholder="Job title, keyword or company"
              />
            </label>

            <label className="search-field location-field">
              <span>⌖</span>
              <input
                type="text"
                name="location"
                placeholder="Location"
              />
            </label>

            <button className="search-btn" type="submit">
              <span>⌕</span> Search
            </button>
          </form>
        </div>
      </section>


    </main>
  );
}