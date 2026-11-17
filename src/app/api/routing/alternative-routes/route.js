
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import findAlternativeRoutes from "@/services/alternativeRoutes";

export async function POST(request) {
  try {
    const body = await request.json();
    const { pickup, destination } = body;

    // Validate input
    if (!pickup || !destination) {
      return NextResponse.json(
        { error: "Starting and destination hubs are required." },
        { status: 400 }
      );
    }

    if (pickup === destination) {
      return NextResponse.json(
        { error: "Starting and destination hubs must be different." },
        { status: 400 }
      );
    }

    // Retrieve hubs and connections from PostgreSQL
    const hubs = await prisma.hub.findMany();

    const connections = await prisma.busConnection.findMany({
      include: {
        bus: true,
        fromHub: true,
        toHub: true,
      },
    });

    // Check whether selected hubs exist
    const hubNames = hubs.map((hub) => hub.name);

    if (!hubNames.includes(pickup) || !hubNames.includes(destination)) {
      return NextResponse.json(
        { error: "Selected hub does not exist." },
        { status: 404 }
      );
    }

    // Find alternative routes using DFS
    const routes = findAlternativeRoutes(
      hubs,
      connections,
      pickup,
      destination,
      5
    );

    if (routes.length === 0) {
      return NextResponse.json(
        { error: "No routes found between the selected hubs." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Alternative routes found successfully.",
      totalRoutes: routes.length,
      shortestRoute: routes[0],
      routes,
    });

  } catch (error) {
    console.error("ALTERNATIVE ROUTES API ERROR:", error);

    return NextResponse.json(
      { error: "Failed to calculate alternative routes." },
      { status: 500 }
    );
  }
}
