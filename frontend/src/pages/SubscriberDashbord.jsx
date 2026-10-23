
import { useEffect, useState } from "react";
import axios from "axios";
import "./Subscription.css";
import server from "../../environment";

function SubscriberDashboard() {
  const [scores, setScores] = useState([]);
  const [charityImpact, setCharityImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("golfToken");

    async function fetchDashboard() {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [scoreResponse, charityResponse] = await Promise.all([
          axios.get(`${server}/api/golf-scores`, config),
          axios.get(`${server}/api/charity/impact/me`, config),
        ]);

        setScores(scoreResponse.data.scores || []);
        setCharityImpact(charityResponse.data);
      } catch (err) {
        console.error(
          "Dashboard error:",
          err.response?.data || err.message
        );
        setError("Unable to load some dashboard information.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchDashboard();
    } else {
      setError("Please log in to view your dashboard.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="dashboard-message">Loading dashboard...</div>;
  }

  const averageScore =
    scores.length > 0
      ? (
          scores.reduce((total, item) => total + item.score, 0) /
          scores.length
        ).toFixed(1)
      : "—";

  return (
    <main className="subscriber-dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">DIGITAL.HEROES</p>
          <h1>Your dashboard</h1>
          <button onClick={() => {
            localStorage.removeItem("golfToken");
            localStorage.removeItem("golfUser");
            navigate("/login");
          }}>logout</button>
          <p>Track your game. Support a cause. Be part of the draw.</p>
        </div>

        <a href="/profile" className="profile-link">
          My Profile
        </a>
      </header>

      {error && <p className="dashboard-error">{error}</p>}

      <section className="dashboard-welcome">
        <div>
          <span className="welcome-label">YOUR JOURNEY</span>
          <h2>Every score can make a difference.</h2>
          <p>
            Keep your scores up to date and see the impact
            your subscription makes.
          </p>
        </div>

        <div className="welcome-icon">🏌️</div>
      </section>

      <section className="dashboard-stats">
        <article className="dashboard-stat">
          <span>Golf scores</span>
          <h2>{scores.length}/5</h2>
          <p>Latest scores recorded</p>
        </article>

        <article className="dashboard-stat">
          <span>Average score</span>
          <h2>{averageScore}</h2>
          <p>Across your recorded rounds</p>
        </article>

        <article className="dashboard-stat">
          <span>Charity contribution</span>
          <h2>
            {charityImpact?.charityPercentage != null
              ? `${charityImpact.charityPercentage}%`
              : "—"}
          </h2>
          <p>Of your subscription fee</p>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel scores-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-label">YOUR PERFORMANCE</span>
              <h2>Recent golf scores</h2>
            </div>
            <a href="/golf-scores">Manage scores ↗</a>
          </div>

          {scores.length === 0 ? (
            <div className="empty-state">
              <span>⛳</span>
              <h3>Your first score starts here</h3>
              <p>
                Add a Stableford score between 1 and 45,
                along with the date of your round.
              </p>
              <a href="/golf-scores" className="dashboard-button">
                Add your first score
              </a>
            </div>
          ) : (
            <div className="score-list">
              {scores.map((item) => (
                <div className="score-row" key={item._id}>
                  <div>
                    <strong>{item.score} points</strong>
                    <span>
                      {new Date(item.date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        }
                      )}
                    </span>
                  </div>
                  <span className="score-indicator">Recorded</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="dashboard-panel charity-panel">
          <span className="panel-label">YOUR IMPACT</span>
          <h2>Giving back</h2>

          {charityImpact?.charity ? (
            <>
              {charityImpact.charity.image && (
                <img
                  className="charity-image"
                  src={charityImpact.charity.image}
                  alt={charityImpact.charity.name}
                />
              )}

              <h3>{charityImpact.charity.name}</h3>
              <p>{charityImpact.charity.description}</p>

              <div className="contribution">
                <span>Estimated contribution</span>
                <strong>
                  {charityImpact.currency || "INR"}{" "}
                  {Number(
                    charityImpact.estimatedContribution || 0
                  ).toFixed(2)}
                </strong>
              </div>

              <a href="/charities" className="text-link">
                Explore charities ↗
              </a>
            </>
          ) : (
            <div className="empty-state">
              <span>💚</span>
              <p>You haven't selected a charity yet.</p>
              <a href="/charities" className="dashboard-button">
                Choose a charity
              </a>
            </div>
          )}
        </article>

        <article className="dashboard-panel subscription-panel">
          <span className="panel-label">YOUR MEMBERSHIP</span>
          <h2>Subscription</h2>

          <div className="membership-status">
            <span className="status-dot" />
            {charityImpact?.plan
              ? `${charityImpact.plan} plan`
              : "Subscription details unavailable"}
          </div>

          <p>
            Manage your plan and review your membership
            details.
          </p>

          <a href="/subscription" className="dashboard-button">
            Manage subscription
          </a>
        </article>

        <article className="dashboard-panel draw-panel">
          <span className="panel-label">MONTHLY REWARDS</span>
          <h2>The monthly draw</h2>
          <div className="draw-numbers">
            {[1, 2, 3, 4, 5].map((number) => (
              <span key={number}>?</span>
            ))}
          </div>
          <p>
            Published draw numbers, participation details,
            and prize results will appear here.
          </p>
          <span className="draw-status">Awaiting draw information</span>
        </article>
      </section>

      <footer className="dashboard-footer">
        Digital Heroes · Play with purpose.
      </footer>
    </main>
  );
}

export default SubscriberDashboard;

