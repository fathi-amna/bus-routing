
"use client";

import { useEffect, useState } from "react";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [buses, setBuses] = useState([]);
  const [hubs, setHubs] = useState([]);

  const [form, setForm] = useState({
    busId: "",
    fromHubId: "",
    toHubId: "",
    distanceKm: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [connectionRes, busRes, hubRes] = await Promise.all([
        fetch("/api/connections"),
        fetch("/api/bus"),
        fetch("/api/hub"),
      ]);

      const [connectionData, busData, hubData] = await Promise.all([
        connectionRes.json(),
        busRes.json(),
        hubRes.json(),
      ]);

      if (!connectionRes.ok) {
        throw new Error(connectionData.error || "Failed to load connections.");
      }

      if (!busRes.ok) {
        throw new Error(busData.error || "Failed to load buses.");
      }

      if (!hubRes.ok) {
        throw new Error(hubData.error || "Failed to load hubs.");
      }

      setConnections(connectionData.connections || []);
      setBuses(busData.buses || []);
      setHubs(hubData.hubs || []);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function resetForm() {
    setForm({
      busId: "",
      fromHubId: "",
      toHubId: "",
      distanceKm: "",
    });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (Number(form.fromHubId) === Number(form.toHubId)) {
      setError("Starting and destination hubs must be different.");
      return;
    }

    if (
      !form.busId ||
      !form.fromHubId ||
      !form.toHubId ||
      !form.distanceKm ||
      Number(form.distanceKm) <= 0
    ) {
      setError("Please complete all fields with valid values.");
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `/api/connections/${editingId}`
        : "/api/connections";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: Number(form.busId),
          fromHubId: Number(form.fromHubId),
          toHubId: Number(form.toHubId),
          distanceKm: Number(form.distanceKm),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Operation failed.");
      }

      setMessage(data.message);
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(connection) {
    setEditingId(connection.id);

    setForm({
      busId: String(connection.busId),
      fromHubId: String(connection.fromHubId),
      toHubId: String(connection.toHubId),
      distanceKm: String(connection.distanceKm),
    });

    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bus connection?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/connections/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete connection.");
      }

      if (editingId === id) resetForm();

      setMessage(data.message);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to delete connection.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-red-600">
              BusBox Administration
            </p>
            <h1 className="text-3xl font-bold">
              Connections Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage bus routes and distances between hubs.
            </p>
          </div>

          <a
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium hover:bg-gray-100"
          >
            Back to Routing
          </a>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Connections</p>
            <h2 className="mt-2 text-3xl font-bold">
              {connections.length}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Registered Buses</p>
            <h2 className="mt-2 text-3xl font-bold">
              {buses.length}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Registered Hubs</p>
            <h2 className="mt-2 text-3xl font-bold">
              {hubs.length}
            </h2>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Add / Edit Form */}
        <section className="mb-10 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold">
            {editingId ? "Edit Bus Connection" : "Add New Bus Connection"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Select Bus
                </label>
                <select
                  name="busId"
                  value={form.busId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="">Choose a bus</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      Bus {bus.busNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Starting Hub
                </label>
                <select
                  name="fromHubId"
                  value={form.fromHubId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="">Choose starting hub</option>
                  {hubs.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Destination Hub
                </label>
                <select
                  name="toHubId"
                  value={form.toHubId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="">Choose destination hub</option>
                  {hubs.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Distance (KM)
                </label>
                <input
                  type="number"
                  name="distanceKm"
                  value={form.distanceKm}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Enter distance in kilometres"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Connection"
                    : "Add Connection"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-100"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Connections Table */}
        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-6">
            <div>
              <h2 className="text-xl font-bold">All Bus Connections</h2>
              <p className="mt-1 text-sm text-gray-500">
                View and manage registered routes.
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="p-8 text-center text-gray-500">
              Loading connections...
            </p>
          ) : connections.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              No bus connections found. Add your first connection above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Bus</th>
                    <th className="px-5 py-4">From Hub</th>
                    <th className="px-5 py-4">To Hub</th>
                    <th className="px-5 py-4">Distance</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {connections.map((connection) => (
                    <tr key={connection.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium">
                        {connection.id}
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {connection.bus?.busNumber || "N/A"}
                      </td>
                      <td className="px-5 py-4">
                        {connection.fromHub?.name || "N/A"}
                      </td>
                      <td className="px-5 py-4">
                        {connection.toHub?.name || "N/A"}
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {connection.distanceKm} km
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(connection)}
                            className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(connection.id)}
                            className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
