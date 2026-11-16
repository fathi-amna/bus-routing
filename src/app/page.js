
"use client";

import { useState, useEffect } from "react";


export default function Home() {
  const [hubs, setHubs] = useState([]);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  async function loadHubs() {
    try {
      const response = await fetch("/api/routing/find-route");

      if (!response.ok) {
        throw new Error("Failed to load hubs");
      }

      const data = await response.json();
      setHubs(data.hubs);

    } catch (error) {
      setError(error.message);
    }
  }

  loadHubs();
}, []);

  async function findRoute() {
    setError("");
    setResult(null);

    if (!pickup || !destination) {
      setError("Please select both hubs.");
      return;
    }

    if (pickup === destination) {
      setError("Pickup and destination must be different.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/routing/find-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pickup,
          destination,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Route calculation failed.");
      }

      setResult(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Header */}
      <header className="bg-red-700 text-white px-8 py-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">BusBox</h1>
          <p className="text-red-100 text-sm">
            Smart Bus Route Optimization System
          </p>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12">

        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Find the Shortest Route
          </h2>
          <p className="text-gray-500 mt-2">
            Calculate the minimum travel distance between bus hubs.
          </p>
        </div>

        {/* Route Form */}
        <div className="bg-white rounded-xl shadow-sm border p-8">

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block font-semibold mb-2">
                Pickup Hub
              </label>

              <select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full border rounded-lg p-3 bg-white"
              >
                <option value="">Select pickup hub</option>

                {hubs.map((hub) => (
                  <option key={hub.id} value={hub.name}>
                    {hub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Destination Hub
              </label>

              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full border rounded-lg p-3 bg-white"
              >
                <option value="">Select destination hub</option>

                {hubs.map((hub) => (
                  <option key={hub.id} value={hub.name}>
                    {hub.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <button
            onClick={findRoute}
            disabled={loading}
            className="mt-7 bg-red-700 hover:bg-red-800
              disabled:opacity-50 text-white font-semibold
              px-8 py-3 rounded-lg"
          >
            {loading ? "Calculating..." : "Find Shortest Route"}
          </button>

          {error && (
            <p className="mt-5 text-red-600">
              {error}
            </p>
          )}

        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-white rounded-xl border shadow-sm p-8">

            <h3 className="text-2xl font-bold mb-6">
              Shortest Route Result
            </h3>

            <div className="bg-red-50 rounded-lg p-5 mb-6">
              <p className="text-gray-500 text-sm">
                Total Distance
              </p>

              <p className="text-4xl font-bold text-red-700">
                {result.totalDistanceKm} km
              </p>
            </div>

            <h4 className="font-semibold mb-4">
              Selected Journey
            </h4>

            <div className="space-y-4">

              {result.route.map((step, index) => (
                <div
                  key={index}
                  className="border-l-4 border-red-600 pl-5 py-2"
                >
                  <p className="font-bold">
                    {step.from} → {step.to}
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    Bus {step.busNumber}
                  </p>

                  <p className="text-red-700 text-sm">
                    {step.distanceKm} km
                  </p>
                </div>
              ))}

              <div className="font-bold text-green-700 pt-2">
                Destination reached: {result.destination}
              </div>

            </div>

          </div>
        )}

      </section>

    </main>
  );
}
