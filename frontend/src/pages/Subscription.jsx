

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Charity from "../component/Charity.jsx";
import "./Subscription.css";
import server from "../../environment.js";

function Subscription() {
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCharity, setShowCharity] = useState(false);

  const plans = [
    {
      name: "Monthly",
      value: "monthly",
      price: 499,
      duration: "per month",
    },
    {
      name: "Yearly",
      value: "yearly",
      price: 4999,
      duration: "per year",
      popular: true,
    },
  ];

  useEffect(() => {
    async function checkSubscription() {
      const token = localStorage.getItem("golfToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await axios.get(
          `${server}/api/subscription`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const subscription = response.data.subscription;

        if (
          subscription?.status === "active" &&
          subscription?.renewalDate &&
          new Date(subscription.renewalDate) > new Date()
        ) {
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("golfToken");
          localStorage.removeItem("golfUser");
          navigate("/login", { replace: true });
          return;
        }

        if (error.response?.status !== 404) {
          alert(
            error.response?.data?.message ||
              "Could not check subscription"
          );
        }
      } finally {
        setIsChecking(false);
      }
    }

    checkSubscription();
  }, [navigate]);

  async function handleSubscribe() {
    const token = localStorage.getItem("golfToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      await axios.post(
        `${server}/api/subscription`,
        { plan: selectedPlan },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Subscription created. Now show the Charity component.
      setShowCharity(true);
    } catch (error) {
      if (error.response?.status === 409) {
        // An existing active subscription may already exist.
        navigate("/dashboard", { replace: true });
        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to subscribe. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isChecking) {
    return <p>Checking subscription...</p>;
  }

  if (showCharity) {
    return (
      <Charity
        onSkip={() =>
          navigate("/dashboard", { replace: true })
        }
      />
    );
  }

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1>Choose Your Plan</h1>
        <p>
          Improve your golf performance and support the causes
          you care about.
        </p>
      </div>

      <div className="subscription-plans">
        {plans.map((plan) => (
          <div
            key={plan.value}
            className={`subscription-card ${
              selectedPlan === plan.value ? "selected" : ""
            }`}
            onClick={() => setSelectedPlan(plan.value)}
          >
            {plan.popular && (
              <span className="popular-badge">Best Value</span>
            )}

            <h2>{plan.name}</h2>

            <div className="plan-price">
              <span>
                ₹{plan.price.toLocaleString("en-IN")}
              </span>
            </div>

            <p className="plan-duration">{plan.duration}</p>

            <ul>
              <li>Access to your golf dashboard</li>
              <li>Track your golf performance</li>
              <li>Support your chosen charity</li>
              <li>Participate in eligible platform draws</li>
            </ul>

            <button
              type="button"
              className={
                selectedPlan === plan.value
                  ? "plan-button active-button"
                  : "plan-button"
              }
              onClick={(event) => {
                event.stopPropagation();
                setSelectedPlan(plan.value);
              }}
            >
              {selectedPlan === plan.value
                ? "Selected"
                : "Choose Plan"}
            </button>
          </div>
        ))}
      </div>

      <div className="subscribe-action">
        <p>
          Selected plan:{" "}
          <strong>
            {selectedPlan === "monthly" ? "Monthly" : "Yearly"}
          </strong>
        </p>

        <button
          type="button"
          className="subscribe-button"
          onClick={handleSubscribe}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Subscribe Now"}
        </button>

        <p className="payment-note">
          Demo subscription flow. Online payment is not integrated yet.
        </p>
       
      </div>
       
    </div>
   
  );
}

export default Subscription;
