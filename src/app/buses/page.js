
"use client";

import { useEffect, useState } from "react";

export default function BusManagementPage() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [busNumber, setBusNumber] = useState("");

  // Fetch all buses
  async function fetchBuses() {
    try {
      setLoading(true);

      const response = await fetch("/api/bus");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load buses.");
      }

      setBuses(data.buses);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBuses();
  }, []);

  // Reset form
  function resetForm() {
    setBusNumber("");
    setEditingBus(null);
    setShowForm(false);
  }

  // Open edit form
  function handleEdit(bus) {
    setEditingBus(bus);
    setBusNumber(bus.busNumber);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  // Add or update bus
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!busNumber.trim()) {
      setError("Please enter a bus number.");
      return;
    }

    try {
      setSaving(true);

      const isEditing = editingBus !== null;

      const response = await fetch(
        isEditing ? `/api/bus/${editingBus.id}` : "/api/bus",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            busNumber: busNumber.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save bus.");
      }

      setSuccess(
        isEditing
          ? "Bus updated successfully!"
          : "Bus registered successfully!"
      );

      resetForm();
      await fetchBuses();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Delete bus
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bus?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/bus/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete bus.");
      }

      setSuccess("Bus deleted successfully!");
      await fetchBuses();

    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bus Management
            </h1>

            <p className="mt-2 text-base text-gray-600">
              Register and manage buses in the BusBox routing network.
            </p>
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setSuccess("");

              if (showForm) {
                resetForm();
              } else {
                setEditingBus(null);
                setBusNumber("");
              }
            }}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            {showForm ? "Close Form" : "+ Add New Bus"}
          </button>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-md sm:p-8">

            <h2 className="mb-6 text-xl font-bold text-gray-900">
              {editingBus ? "Edit Bus" : "Register New Bus"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label
                  htmlFor="busNumber"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Bus Number *
                </label>

                <input
                  id="busNumber"
                  type="text"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  placeholder="Enter bus number"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingBus
                      ? "Update Bus"
                      : "Register Bus"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

              </div>
            </form>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">
              Total Registered Buses
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {buses.length}
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

        {/* Bus Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-bold text-gray-900">
              All Registered Buses
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Buses available in the routing database.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-600">
              Loading buses...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">

                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Bus ID
                    </th>

                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Bus Number
                    </th>

                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Registered Date
                    </th>

                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {buses.map((bus) => (
                    <tr
                      key={bus.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-gray-700">
                        {bus.id}
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {bus.busNumber}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {new Date(bus.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">

                          <button
                            onClick={() => handleEdit(bus)}
                            className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(bus.id)}
                            disabled={deletingId === bus.id}
                            className="rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingId === bus.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}

                  {buses.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No buses found. Register your first bus.
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
