import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <a className="home-logo" href="/">
          Golf Website
        </a>

        <nav className="home-nav">
          <a href="#about">About</a>
          <a href="#charities">Charities</a>
          <a href="#draw">Draw</a>
        </nav>

        <button
          className="home-login-button"
          type="button"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-hero-content">
            <p className="home-eyebrow">Play for more</p>

            <h1>
              Your game.
              <br />
              <span>Your impact.</span>
            </h1>

            <p className="home-description">
              Track your golf scores, join monthly prize draws, and support a
              charity you care about.
            </p>

            <button
              className="home-primary-button"
              type="button"
              onClick={() => navigate("/register")}
            >
              Start playing
            </button>
          </div>

          <div className="home-hero-art">
            <div className="home-ball">⛳</div>
          </div>
        </section>

        <section className="home-impact" id="about">
          <div>
            <strong>£48,620</strong>
            <span>Given to charities</span>
          </div>

          <div>
            <strong>10%</strong>
            <span>Minimum charity contribution</span>
          </div>

          <div>
            <strong>19</strong>
            <span>Communities supported</span>
          </div>
        </section>

        <section className="home-section" id="draw">
          <p className="home-eyebrow">How the draw works</p>

          <h2>
            Play golf.
            <br />
            <span>Win prizes.</span>
          </h2>

          <p className="home-description">
            Enter your latest five Stableford scores. Active subscribers are
            included in the monthly draw.
          </p>

          <button
            className="home-primary-button"
            type="button"
            onClick={() => navigate("/register")}
          >
            Learn more
          </button>
        </section>

        <section className="home-section" id="charities">
          <p className="home-eyebrow">Choose your charity</p>

          <h2>
            Give back.
            <br />
            <span>Make a difference.</span>
          </h2>

          <p className="home-description">
            Choose from charities such as Girls on the Green, Fairways for All,
            and The Caddy Project.
          </p>
        </section>

        <section className="home-section">
          <p className="home-eyebrow">Membership</p>

          <h2>
            Start your
            <br />
            <span>golf journey.</span>
          </h2>

          <p className="home-description">
            Join our community of golfers and start making a difference.
          </p>

          <button
            className="home-primary-button"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Become a member
          </button>
        </section>
      </main>

      <footer className="home-footer">
        <a className="home-logo" href="/">
          Golf Website
        </a>

        <span>Better play. Better outcomes.</span>
      </footer>
    </div>
  );
}

export default Home;