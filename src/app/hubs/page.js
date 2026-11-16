
"use client";

import { useEffect, useState } from "react";

export default function HubManagementPage() {
  const [editingHub, setEditingHub] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
  });

  // Fetch hubs from PostgreSQL through API
  async function fetchHubs() {
    try {
      setLoading(true);

      const response = await fetch("/api/hub");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load hubs.");
      }

      setHubs(data.hubs);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHubs();
  }, []);

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleEdit(hub) {
  setEditingHub(hub);

  setForm({
    name: hub.name,
    latitude: hub.latitude ?? "",
    longitude: hub.longitude ?? "",
  });

  setShowForm(true);
  setError("");
  setSuccess("");
}

  async function handleDelete(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this hub?"
  );

  if (!confirmed) return;

  try {
    setDeletingId(id);
    setError("");
    setSuccess("");

    const response = await fetch(`/api/hub/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete hub.");
    }

    setSuccess("Hub deleted successfully!");
    await fetchHubs();
  } catch (err) {
    setError(err.message);
  } finally {
    setDeletingId(null);
  }
}

  // Add a new hub
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Please enter a hub name.");
      return;
    }

    const latitude =
      form.latitude.trim() === "" ? null : Number(form.latitude);

    const longitude =
      form.longitude.trim() === "" ? null : Number(form.longitude);

    if (
      (latitude !== null && !Number.isFinite(latitude)) ||
      (longitude !== null && !Number.isFinite(longitude)) ||
      (latitude !== null && (latitude < -90 || latitude > 90)) ||
      (longitude !== null && (longitude < -180 || longitude > 180))
    ) {
      setError("Please enter valid latitude and longitude values.");
      return;
    }

    try {
      setSaving(true);

      const isEditing = editingHub !== null;

const response = await fetch(
  isEditing ? `/api/hub/${editingHub.id}` : "/api/hub",
  {
    method: isEditing ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: form.name.trim(),
      latitude,
      longitude,
    }),
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create hub.");
      }

      setSuccess("Hub created successfully!");

      setForm({
        name: "",
        latitude: "",
        longitude: "",
      });

      setShowForm(false);

      await fetchHubs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Hub Management
            </h1>

            <p className="mt-2 text-base text-gray-600">
              Manage bus hubs in the BusBox routing network.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setSuccess("");
            }}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            {showForm ? "Close Form" : "+ Add New Hub"}
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Add Hub Form */}
        {showForm && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-md sm:p-8">

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingHub ? "Edit Hub" : "Add New Hub"}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Enter the details of the new bus hub.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Hub Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Hub Name <span className="text-red-600">*</span>
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter hub name"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {/* Latitude and Longitude */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="latitude"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Latitude
                    <span className="ml-1 font-normal text-gray-500">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 6.9271"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="longitude"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Longitude
                    <span className="ml-1 font-normal text-gray-500">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="e.g. 79.8612"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

              </div>

              {/* Form Buttons */}
              <div className="flex flex-wrap gap-3 pt-3">

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? "Saving..." : editingHub ? "Update Hub" : "Save Hub"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        )}

        {/* Dashboard Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">
              Total Hubs
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {hubs.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">
              Network Status
            </p>

            <p className="mt-3 text-2xl font-bold text-green-600">
              Active
            </p>
          </div>

        </div>

        {/* Hub Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-bold text-gray-900">
              All Hubs
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Hubs registered in the routing database.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-600">
              Loading hubs...
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Hub ID
                    </th>

                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Hub Name
                    </th>

                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Latitude
                    </th>

                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Longitude
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {hubs.map((hub) => (
                    <tr
                      key={hub.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-gray-700">
                        {hub.id}
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {hub.name}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {hub.latitude ?? "-"}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {hub.longitude ?? "-"}
                      </td><td className="px-6 py-4">
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(hub)}
                            className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
                                Edit
                            </button>

                            <button
                              onClick={() => handleDelete(hub.id)}
                              disabled={deletingId === hub.id}
                              className="rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {deletingId === hub.id ? "Deleting..." : "Delete"}
                            </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                  {hubs.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No hubs found. Add your first hub.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
