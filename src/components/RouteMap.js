
"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect, useState } from "react";

// Fix default Leaflet marker icons in Next.js
const hubIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


// Starting hub marker - Green
const startIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    background:#16a34a;
    width:32px;
    height:32px;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 6px #555;
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Destination hub marker - Red
const destinationIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    background:#dc2626;
    width:32px;
    height:32px;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 6px #555;
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Intermediate hub marker - Blue
const intermediateIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    background:#2563eb;
    width:24px;
    height:24px;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 6px #555;
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});



function MapUpdater({ positions, fallbackCenter }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions);

      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 11,
        animate: true,
      });
    } else {
      map.setView(fallbackCenter, 7);
    }
  }, [positions, fallbackCenter, map]);

  return null;
}


export default function RouteMap({
  hubs = [],
  routes = [],
  shortestRoute = null,
}) {
    const [roadRoutes, setRoadRoutes] = useState([]);
    const [mapLoading, setMapLoading] = useState(false);
  const validHubs = hubs.filter(
    (hub) =>
      Number.isFinite(Number(hub.latitude)) &&
      Number.isFinite(Number(hub.longitude)) &&
      hub.latitude !== null &&
      hub.longitude !== null
  );

  const defaultCenter = [7.8731, 80.7718];

  const center =
    validHubs.length > 0
      ? [validHubs[0].latitude, validHubs[0].longitude]
      : defaultCenter;

  function getCoordinates(route) {
    const hubNames = [
      route.start,
      ...route.route.map((step) => step.to),
    ];

    return hubNames
      .map((name) => {
        const hub = validHubs.find((item) => item.name === name);

        return hub
          ? [hub.latitude, hub.longitude]
          : null;
      })
      .filter(Boolean);
  }


useEffect(() => {
  async function loadRoadRoutes() {
    if (!routes.length || !validHubs.length) {
      setRoadRoutes([]);
      return;
    }

    setMapLoading(true);

    try {
      const results = await Promise.all(
        routes.map(async (route) => {
          const hubNames = [
            route.start,
            ...route.route.map((step) => step.to),
          ];

          const coordinates = hubNames.map((name) => {
            const hub = validHubs.find(
              (item) => item.name === name
            );

            if (!hub) return null;

            // OSRM expects longitude,latitude
            return `${hub.longitude},${hub.latitude}`;
          });

          if (coordinates.some((item) => item === null)) {
            return { route, positions: [] };
          }

          const coordinateString = coordinates.join(";");

          const url =
            `https://router.project-osrm.org/route/v1/driving/${coordinateString}` +
            "?overview=full&geometries=geojson";

          const response = await fetch(url);

          if (!response.ok) {
            throw new Error("Road geometry request failed.");
          }

          const data = await response.json();

          if (data.code !== "Ok" || !data.routes.length) {
            throw new Error("No road route found.");
          }

          const positions =
            data.routes[0].geometry.coordinates.map(
              ([longitude, latitude]) => [
                latitude,
                longitude,
              ]
            );

          return { route, positions };
        })
      );

      setRoadRoutes(results);
    } catch (error) {
      console.error("ROAD GEOMETRY ERROR:", error);
      setRoadRoutes([]);
    } finally {
      setMapLoading(false);
    }
  }

  loadRoadRoutes();
}, [routes, hubs]);


  function isSameRoute(routeA, routeB) {
    if (!routeA || !routeB) return false;

    return (
      routeA.route.length === routeB.route.length &&
      routeA.route.every(
        (step, index) =>
          step.from === routeB.route[index].from &&
          step.to === routeB.route[index].to
      )
    );
  }

    const routePaths = routes
    .map((route) => ({
      route,
      positions: getCoordinates(route),
    }))
    .filter((item) => item.positions.length >= 2);
  
  const allRoutePositions = roadRoutes.flatMap(
    (item) => item.positions
  );

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">

      <div className="bg-white p-5 border-b">
        <h3 className="text-xl font-bold">
          Bus Route Map
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Visual representation of available bus routes.
        </p>
      </div>

      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: "500px", width: "100%" }}
      >

        <MapUpdater
          positions={allRoutePositions}
          fallbackCenter={defaultCenter}
        />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        

{/* Display relevant hub markers */}

{routes.length > 0 &&
  validHubs
    .filter((hub) => {
      const routeHubNames = routes.flatMap((route) => [
        route.start,
        ...route.route.map((step) => step.to),
      ]);

      return routeHubNames.includes(hub.name);
    })
    .map((hub) => {
      const startHub = shortestRoute?.start;
      const destinationHub = shortestRoute?.destination;

      const isStart = hub.name === startHub;
      const isDestination = hub.name === destinationHub;

      const markerIcon = isStart
        ? startIcon
        : isDestination
          ? destinationIcon
          : intermediateIcon;

      return (
        <Marker
          key={hub.id}
          position={[
            Number(hub.latitude),
            Number(hub.longitude),
          ]}
          icon={markerIcon}
          zIndexOffset={1000}
        >
          <Popup>
            <strong>{hub.name}</strong>
            <br />
            {isStart
              ? "Starting Hub"
              : isDestination
                ? "Destination Hub"
                : "Intermediate Hub"}
          </Popup>
        </Marker>
      );
    })}



        
{/* Road-following route lines */}
{roadRoutes.map(({ route, positions }, index) => {
  const isShortest = isSameRoute(route, shortestRoute);

  if (!positions || positions.length < 2) {
    return null;
  }

  return (
    <Polyline
      key={index}
      positions={positions}
      pathOptions={{
        color: isShortest ? "green" : "red",
        weight: isShortest ? 6 : 4,
        opacity: isShortest ? 0.9 : 0.7,
      }}
    >
      <Popup>
        <strong>
          {isShortest ? "Shortest Route" : "Alternative Route"}
        </strong>
        <br />
        Journey: {route.start} → {route.destination}
        <br />
        Distance: {route.totalDistanceKm} km
      </Popup>
    </Polyline>
  );
})}

    
      </MapContainer>

      {mapLoading && (
        <div className="bg-blue-50 px-4 py-3 text-sm text-blue-700">
        Loading road-following routes...
       </div>
    )}

      <div className="flex flex-wrap gap-6 bg-white p-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-1 w-8 bg-green-600 rounded" />
          Shortest Route
        </div>

        <div className="flex items-center gap-2">
          <span className="h-1 w-8 bg-red-600 rounded" />
          Alternative Routes
        </div>
      </div>

      <div className="flex flex-wrap gap-5 bg-white px-4 pb-4 text-sm">
        <span>🟢 Starting Hub</span>
        <span>🔴 Destination Hub</span>
        <span>🔵 Intermediate Hub</span>
    </div>

      {validHubs.length === 0 && (
        <p className="bg-yellow-50 p-3 text-sm text-yellow-800">
          Add valid latitude and longitude coordinates
          to your hubs to display them on the map.
        </p>
      )}

    </div>
  );
}
