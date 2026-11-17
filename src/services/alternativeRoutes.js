
function findAlternativeRoutes(
  hubs,
  connections,
  start,
  destination,
  maxRoutes = 5
) {
  const graph = {};

  // Create adjacency list
  hubs.forEach((hub) => {
    graph[hub.name] = [];
  });

  connections.forEach((connection) => {
    const from = connection.fromHub.name;
    const to = connection.toHub.name;

    graph[from].push({
      destination: to,
      distance: connection.distanceKm,
      busNumber: connection.bus.busNumber,
    });
  });

  // Store discovered routes
  const routes = [];

  // Track hubs visited in the current path
  const visited = new Set([start]);

  function dfs(current, totalDistance, path) {
    // Stop after finding the requested number of routes
    if (routes.length >= maxRoutes) {
      return;
    }

    // Destination reached
    if (current === destination) {
      routes.push({
        start,
        destination,
        totalDistanceKm: totalDistance,
        route: [...path],
      });
      return;
    }

    // Explore connected hubs
    for (const edge of graph[current] || []) {
      if (visited.has(edge.destination)) {
        continue;
      }

      visited.add(edge.destination);

      path.push({
        from: current,
        to: edge.destination,
        busNumber: edge.busNumber,
        distanceKm: edge.distance,
      });

      dfs(
        edge.destination,
        totalDistance + edge.distance,
        path
      );

      // Backtrack
      path.pop();
      visited.delete(edge.destination);

      if (routes.length >= maxRoutes) {
        return;
      }
    }
  }

  if (!graph[start] || !graph[destination]) {
    return [];
  }

  dfs(start, 0, []);

  // Sort routes from shortest to longest
  routes.sort(
    (a, b) => a.totalDistanceKm - b.totalDistanceKm
  );

  return routes;
}

export default findAlternativeRoutes;
