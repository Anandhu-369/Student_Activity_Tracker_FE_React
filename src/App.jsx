
import { useEffect, useState } from "react";
import { addActivity, getActivities, getSummary } from "./api";
import "./App.css";

const emptyForm = {
  name: "",
  activity: "",
  hours: "",
};

function App() {
  const [form, setForm] = useState(emptyForm);
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({
    total_entries: 0,
    total_hours: 0,
    most_active_user: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      setError("");

      const [activityResponse, summaryResponse] =
        await Promise.all([getActivities(), getSummary()]);

      setActivities(activityResponse.data);
      setSummary(summaryResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load data. Check that Django is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const hours = Number(form.hours);

    if (
      !form.name.trim() ||
      !form.activity.trim() ||
      form.hours === "" ||
      !Number.isInteger(hours) ||
      hours < 1
    ) {
      setError("Enter a student name, activity, and positive whole hours.");
      return;
    }

    try {
      setSaving(true);

      await addActivity({
        name: form.name.trim(),
        activity: form.activity.trim(),
        hours,
      });

      setForm(emptyForm);
      setMessage("Activity added successfully!");

      await loadData();
    } catch (err) {
      const data = err.response?.data;

      setError(
        typeof data === "object"
          ? Object.entries(data)
              .map(([field, errors]) =>
                `${field}: ${
                  Array.isArray(errors) ? errors.join(", ") : errors
                }`
              )
              .join(" | ")
          : "Failed to add activity. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <p className="eyebrow">STUDENT MANAGEMENT</p>
          <h1>Student Activity Tracker</h1>
          <p className="subtitle">
            Record activities, track hours, and review student progress.
          </p>
        </div>
      </header>

      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="alert success" role="status">
          {message}
        </div>
      )}

      <section className="summary-grid">
        <article className="summary-card">
          <p>Total Entries</p>
          <h2>{summary.total_entries}</h2>
        </article>

        <article className="summary-card">
          <p>Total Hours</p>
          <h2>{summary.total_hours}</h2>
        </article>

        <article className="summary-card">
          <p>Most Active Student</p>
          <h2 className="student-name">
            {summary.most_active_user || "—"}
          </h2>
        </article>
      </section>

      <section className="panel">
        <h2>Add Student Activity</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Student Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter student name"
                maxLength={100}
                required
              />
            </label>

            <label>
              Activity
              <input
                name="activity"
                value={form.activity}
                onChange={handleChange}
                placeholder="e.g. Coding"
                maxLength={200}
                required
              />
            </label>

            <label>
              Hours
              <input
                name="hours"
                type="number"
                min="1"
                step="1"
                value={form.hours}
                onChange={handleChange}
                placeholder="e.g. 3"
                required
              />
            </label>
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add Activity"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Activity History</h2>
            <p className="subtitle">
              All recorded student activities
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="status-message">Loading activities...</p>
        ) : activities.length === 0 ? (
          <p className="status-message">
            No activities yet. Add your first activity above.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Activity</th>
                  <th>Hours</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {activities.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.activity}</td>
                    <td>{item.hours}</td>
                    <td>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer>
        Student Activity Tracker · React + Django REST Framework
      </footer>
    </main>
  );
}

export default App;
