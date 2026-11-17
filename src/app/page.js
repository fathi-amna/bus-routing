
"use client";

import dynamic from "next/dynamic";

const RouteMap = dynamic(
  () => import("@/components/RouteMap"),
  { ssr: false }
);

import { useState, useEffect } from "react";

export default function Home() {
  const [hubs, setHubs] = useState([]);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const [result, setResult] = useState(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadHubs() {
      try {
        const response = await fetch("/api/hub");

        if (!response.ok) {
          throw new Error("Failed to load hubs.");
        }

        const data = await response.json();
        setHubs(data.hubs || []);

      } catch (err) {
        setError(err.message);
      }
    }

    loadHubs();
  }, []);

  async function findRoute() {
    setError("");
    setResult(null);
    setAlternativeRoutes([]);

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

      // Call Dijkstra and alternative routes APIs
      const [shortestResponse, alternativeResponse] =
        await Promise.all([
          fetch("/api/routing/find-route", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pickup,
              destination,
            }),
          }),

          fetch("/api/routing/alternative-routes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pickup,
              destination,
            }),
          }),
        ]);

      const [shortestData, alternativeData] =
        await Promise.all([
          shortestResponse.json(),
          alternativeResponse.json(),
        ]);

      if (!shortestResponse.ok) {
        throw new Error(
          shortestData.error || "Shortest route calculation failed."
        );
      }

      if (!alternativeResponse.ok) {
        throw new Error(
          alternativeData.error || "Alternative route calculation failed."
        );
      }

      setResult(shortestData);
      setAlternativeRoutes(alternativeData.routes || []);

    } catch (err) {
      setError(err.message || "Route calculation failed.");
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

        {/* Page Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Find the Best Route
          </h2>

          <p className="text-gray-500 mt-2">
            Compare possible bus routes and find the minimum
            travel distance between hubs.
          </p>
        </div>

        {/* Route Search Form */}
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
            {loading ? "Calculating Routes..." : "Compare Routes"}
          </button>

          {error && (
            <p className="mt-5 text-red-600">
              {error}
            </p>
          )}

        </div>

        {/* Shortest Route Summary */}
        {result && (
          <div className="mt-8">

            <div className="mb-6">
              <h3 className="text-2xl font-bold">
                Route Comparison Results
              </h3>

              <p className="text-gray-500 mt-2">
                {result.start} to {result.destination}
              </p>
            </div>

            {/* Shortest Route Highlight */}
            <div className="bg-green-50 border border-green-200
              rounded-xl p-6 mb-6">

              <div className="flex flex-wrap justify-between
                items-center gap-3">

                <div>
                  <p className="text-green-700 font-semibold">
                    Recommended Shortest Route
                  </p>

                  <p className="text-gray-600 text-sm mt-1">
                    Calculated using Dijkstra's Algorithm
                  </p>
                </div>

                <span className="bg-green-100 text-green-700
                  px-3 py-1 rounded-full text-sm font-semibold">
                  Shortest
                </span>

              </div>

              <p className="text-4xl font-bold text-green-700 mt-5">
                {result.totalDistanceKm} km
              </p>

              <p className="text-gray-700 mt-3 font-medium">
                {result.start} → {result.route
                  .map((step) => step.to)
                  .join(" → ")}
              </p>

            </div>

            {/* All Routes */}
            <div className="grid gap-6">

              {alternativeRoutes.map((route, index) => {

                const isShortest =
                  route.totalDistanceKm === result.totalDistanceKm &&
                  JSON.stringify(route.route) ===
                  JSON.stringify(result.route);

                return (
                  <div
                    key={index}
                    className={`bg-white rounded-xl border shadow-sm
                      p-6 ${
                        isShortest
                          ? "border-green-400 border-2"
                          : "border-gray-200"
                      }`}
                  >

                    {/* Route Header */}
                    <div className="flex flex-wrap justify-between
                      items-center gap-3 mb-5">

                      <div>
                        <h4 className="text-xl font-bold">
                          Route {index + 1}
                        </h4>

                        <p className="text-sm text-gray-500 mt-1">
                          {isShortest
                            ? "Minimum distance journey"
                            : "Alternative journey"}
                        </p>
                      </div>

                      {isShortest && (
                        <span className="bg-green-100 text-green-700
                          px-3 py-1 rounded-full text-sm font-semibold">
                          Shortest Route
                        </span>
                      )}

                    </div>

                    {/* Distance */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-500">
                        Total Distance
                      </p>

                      <p className={`text-3xl font-bold mt-1 ${
                        isShortest
                          ? "text-green-700"
                          : "text-red-700"
                      }`}>
                        {route.totalDistanceKm} km
                      </p>
                    </div>

                    {/* Journey Segments */}
                    <div className="space-y-4">

                      {route.route.map((step, stepIndex) => (
                        <div
                          key={stepIndex}
                          className={`border-l-4 pl-5 py-2 ${
                            isShortest
                              ? "border-green-600"
                              : "border-red-600"
                          }`}
                        >

                          <p className="font-bold">
                            {step.from} → {step.to}
                          </p>

                          <p className="text-gray-500 text-sm mt-1">
                            Bus {step.busNumber}
                          </p>

                          <p className="text-gray-700 text-sm mt-1">
                            Distance: {step.distanceKm} km
                          </p>

                        </div>
                      ))}

                    </div>

                    <div className="mt-5 pt-4 border-t">
                      <p className="text-green-700 font-semibold">
                        Destination reached: {route.destination}
                      </p>
                    </div>

                  </div>
                );
              })}

            </div>

            {/* Comparison Summary */}
            <div className="mt-8 bg-white border rounded-xl p-6">

              <h3 className="text-xl font-bold mb-4">
                Distance Comparison
              </h3>

              {alternativeRoutes.map((route, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center
                    border-b last:border-0 py-3 gap-4"
                >
                  <span className="text-gray-700">
                    Route {index + 1}
                  </span>

                  <span className="font-bold">
                    {route.totalDistanceKm} km
                  </span>
                </div>
              ))}

            </div>

            
            {/* Interactive Route Map */}
            <div className="mt-8">
              <RouteMap
                hubs={hubs}
                routes={alternativeRoutes}
                shortestRoute={result}
              />
            </div>


          </div>
        )}

      </section>

    </main>
  );
}
