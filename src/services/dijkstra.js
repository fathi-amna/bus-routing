
function dijkstra(hubs, connections, start, destination) {

  // Create an adjacency list
  const graph = {};

  hubs.forEach(hub => {
    graph[hub.name] = [];
  });

  connections.forEach(connection => {
    graph[connection.fromHub.name].push({
      destination: connection.toHub.name,
      distance: connection.distanceKm,
      busNumber: connection.bus.busNumber
    });
  });

  // Initialize distances
  const distances = {};
  const previous = {};
  const visited = new Set();

  hubs.forEach(hub => {
    distances[hub.name] = Infinity;
  });

  distances[start] = 0;

  // Main Dijkstra loop
  while (visited.size < hubs.length) {

    let current = null;

    // Find the unvisited hub with minimum distance
    for (const hub of hubs) {

      if (
        !visited.has(hub.name) &&
        (
          current === null ||
          distances[hub.name] < distances[current]
        )
      ) {
        current = hub.name;
      }
    }

    // Stop if no reachable hub remains
    if (
      current === null ||
      distances[current] === Infinity
    ) {
      break;
    }

    // Destination reached
    if (current === destination) {
      break;
    }

    visited.add(current);

    // Examine connected hubs
    for (const edge of graph[current]) {

      if (visited.has(edge.destination)) {
        continue;
      }

      const newDistance =
        distances[current] + edge.distance;

      if (newDistance < distances[edge.destination]) {

        distances[edge.destination] = newDistance;

        previous[edge.destination] = {
          from: current,
          busNumber: edge.busNumber,
          distance: edge.distance
        };
      }
    }
  }

  // Check whether a route exists
  if (distances[destination] === Infinity) {
    return null;
  }

  // Reconstruct the shortest route
  const route = [];
  let current = destination;

  while (current !== start) {

    const step = previous[current];

    if (!step) {
      return null;
    }

    route.unshift({
      from: step.from,
      to: current,
      busNumber: step.busNumber,
      distanceKm: step.distance
    });

    current = step.from;
  }

  return {
    start,
    destination,
    totalDistanceKm: distances[destination],
    route
  };
}

export default dijkstra;
