
import { useEffect, useState } from "react";
import axios from "axios";
import "./GolfScores.css";
import { useNavigate } from "react-router";

const API_URL = "http://localhost:3000/api/golf-scores";

function GolfScores() {
  const [scores, setScores] = useState([]);
  const [score, setScore] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("golfToken");
  const navigate = useNavigate();

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  async function fetchScores() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, config);
      setScores(response.data.scores || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load golf scores."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchScores();
    // Load scores when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setScore("");
    setDate("");
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const numericScore = Number(score);

    if (!Number.isInteger(numericScore) ||
        numericScore < 1 ||
        numericScore > 45) {
      setError("Enter a whole-number score between 1 and 45.");
      return;
    }

    if (!date) {
      setError("Please select the date of your golf round.");
      return;
    }

    try {
      setSaving(true);

      const body = {
        score: numericScore,
        date,
      };

      if (editingId) {
        await axios.patch(
          `${API_URL}/${editingId}`,
          body,
          config
        );
        setSuccess("Golf score updated successfully.");
      } else {
        await axios.post(API_URL, body, config);
        setSuccess("Golf score added successfully.");
      }

      resetForm();
      await fetchScores();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save golf score."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item) {
    setEditingId(item._id);
    setScore(String(item.score));

    const formattedDate = new Date(item.date)
      .toISOString()
      .slice(0, 10);

    setDate(formattedDate);
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this golf score?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await axios.delete(`${API_URL}/${id}`, config);
      setSuccess("Golf score deleted successfully.");
      await fetchScores();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete golf score."
      );
    }
  }

  const averageScore = scores.length
    ? (
        scores.reduce((total, item) => total + item.score, 0) /
        scores.length
      ).toFixed(1)
    : "—";

  if (loading) {
    return <div className="golf-loading">Loading your scores...</div>;
  }

  return (
    <main className="golf-scores-page">
      <header className="golf-page-header">
        <div>
          <span className="golf-eyebrow">YOUR PERFORMANCE</span>
          <h1>Golf Scores</h1>
          <p>
            Record your Stableford points and keep track of your
            latest five rounds.
          </p>
        </div>

        <div className="golf-count">
          <strong>{scores.length}/5</strong>
          <span>Scores recorded</span>
        </div>
      </header>

      <section className="golf-summary">
        <div>
          <span>Rounds recorded</span>
          <strong>{scores.length} of 5</strong>
        </div>
        <div>
          <span>Average points</span>
          <strong>{averageScore}</strong>
        </div>
        <div>
          <span>Scoring format</span>
          <strong>Stableford</strong>
        </div>
      </section>

      <section className="golf-content">
        <form className="golf-form" onSubmit={handleSubmit}>
          <span className="golf-eyebrow">
            {editingId ? "EDIT ROUND" : "RECORD A ROUND"}
          </span>

          <h2>
            {editingId ? "Update your score" : "Add golf score"}
          </h2>

          <label htmlFor="golf-score">Stableford points</label>
          <input
            id="golf-score"
            type="number"
            min="1"
            max="45"
            step="1"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            placeholder="Enter score from 1 to 45"
            required
          />

          <label htmlFor="golf-date">Round date</label>
          <input
            id="golf-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />

          {error && <p className="golf-error">{error}</p>}
          {success && <p className="golf-success">{success}</p>}

          <button
            className="golf-primary-button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Update score"
              : "Save score"}
          </button>
         

          {editingId && (
            <button
              className="golf-secondary-button"
              type="button"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel editing
            </button>
          )}

          <p className="golf-form-note">
            One score per date. Scores must be between 1 and 45.
          </p>
        </form>

        <section className="golf-history">
          <div className="golf-history-heading">
            <div>
              <span className="golf-eyebrow">YOUR HISTORY</span>
              <h2>Recent rounds</h2>
            </div>
            <span>{scores.length} / 5</span>
          </div>

          {scores.length === 0 ? (
            <div className="golf-empty">
              <span>⛳</span>
              <h3>No scores yet</h3>
              <p>Add your first golf round using the form.</p>
            </div>
          ) : (
            <div className="golf-score-list">
              {scores.map((item, index) => (
                <article className="golf-score-item" key={item._id}>
                  <div className="golf-score-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="golf-score-details">
                    <strong>{item.score} points</strong>
                    <span>
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </span>
                  </div>

                  <div className="golf-score-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      aria-label={`Edit score from ${item.date}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      aria-label={`Delete score from ${item.date}`}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="golf-history-note">
            Your five most recent rounds are retained. Adding a
            sixth round automatically removes the oldest score.
          </p>

         <button
  type="button"
  onClick={() => navigate("/dashboard")}
  className="back-button"
>
  ← Back to Dashboard
</button>
        </section>
      </section>
    </main>
  );
}

export default GolfScores;
