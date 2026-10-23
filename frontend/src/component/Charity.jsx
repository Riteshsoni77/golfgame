
import { useEffect, useState } from "react";
import axios from "axios";

function Charity({ onSkip }) {
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [percentage, setPercentage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchCharities() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/charity"
        );

        setCharities(response.data.charities || []);
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Failed to load charities"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCharities();
  }, []);

  async function handleConfirm() {
    if (!selectedCharity) {
      alert("Please select a charity");
      return;
    }

    if (percentage < 10 || percentage > 100) {
      alert("Contribution must be between 10% and 100%");
      return;
    }

    const token = localStorage.getItem("golfToken");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      setSaving(true);

      const response = await axios.patch(
        "http://localhost:3000/api/charity/select",
        {
          charityId: selectedCharity,
          charityPercentage: Number(percentage),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message || "Charity saved successfully");
      onSkip();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to save charity"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading charities...</p>;
  }

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1>Choose Your Charity</h1>
        <p>
          Select a cause to support with your subscription.
          You can also skip this step.
        </p>
      </div>

      {charities.length === 0 ? (
        <p>No active charities are available.</p>
      ) : (
        <div className="subscription-plans">
          {charities.map((charity) => (
            <div
              key={charity._id}
              className={`subscription-card ${
                selectedCharity === charity._id
                  ? "selected"
                  : ""
              }`}
              onClick={() => setSelectedCharity(charity._id)}
            >
              {charity.image && (
                <img
                  src={charity.image}
                  alt={charity.name}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                  }}
                />
              )}

              <h2>{charity.name}</h2>
              <p>{charity.description}</p>

              <button
                type="button"
                className={
                  selectedCharity === charity._id
                    ? "plan-button active-button"
                    : "plan-button"
                }
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedCharity(charity._id);
                }}
              >
                {selectedCharity === charity._id
                  ? "Selected"
                  : "Choose Charity"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="subscribe-action">
        <label htmlFor="charity-percentage">
          Contribution percentage (10% minimum)
        </label>

        <input
          id="charity-percentage"
          type="number"
          min="10"
          max="100"
          value={percentage}
          onChange={(event) =>
            setPercentage(event.target.value)
          }
        />

        <button
          type="button"
          className="subscribe-button"
          onClick={handleConfirm}
          disabled={saving || charities.length === 0}
        >
          {saving ? "Saving..." : "Confirm Charity"}
        </button>

        <button
          type="button"
          className="plan-button"
          onClick={onSkip}
          disabled={saving}
        >
          Skip for Now
        </button>

        
      </div>
    </div>
  );
}

export default Charity;
