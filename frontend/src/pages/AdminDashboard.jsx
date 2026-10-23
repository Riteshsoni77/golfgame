
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

const API = "http://localhost:3000/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("golfToken");

        const response = await axios.get(`${API}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load dashboard"
        );
      }
    };

    fetchStats();
  }, []);

  const sections = [
    { title: "User Management", path: "/admin/users" },
    { title: "Draw Management", path: "/admin/draws" },
    { title: "Charity Management", path: "/admin/charities" },
    { title: "Winners Management", path: "/admin/winners" },
    { title: "Reports & Analytics", path: "/admin/reports" },
  ];

  return (
    <main className="admin-dashboard">
      <h1>Administrator Dashboard</h1>
      <p>Manage users, draws, charities and prize claims.</p>

      {error && <p>{error}</p>}

      <section className="admin-stats">
        {[
          ["Total Subscribers", stats?.totalUsers],
          ["Active Subscriptions", stats?.activeSubscriptions],
          ["Active Charities", stats?.activeCharities],
          ["Total Draws", stats?.totalDraws],
          ["Total Prize Pool", stats?.totalPrizePool],
          ["Total Prizes Recorded", stats?.totalWon],
        ].map(([label, value]) => (
          <article className="admin-stat-card" key={label}>
            <p>{label}</p>
            <h2>
              {value === undefined
                ? "Loading..."
                : label.includes("Pool") ||
                  label.includes("Prizes")
                ? `₹${Number(value).toLocaleString("en-IN")}`
                : value}
            </h2>
          </article>
        ))}
      </section>

      <h2>Management</h2>

      <section className="admin-sections">
        {sections.map((section) => (
          <article className="admin-section-card" key={section.path}>
            <h3>{section.title}</h3>
            <Link to={section.path}>Open section →</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
