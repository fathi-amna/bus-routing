
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import dijkstra from "@/services/dijkstra";

export async function POST(request) {

  try {

    const body = await request.json();

    const { pickup, destination } = body;

    // Validate input
    if (!pickup || !destination) {
      return NextResponse.json(
        { error: "Pickup and destination are required." },
        { status: 400 }
      );
    }

    if (pickup === destination) {
      return NextResponse.json(
        { error: "Pickup and destination must be different." },
        { status: 400 }
      );
    }

    // Retrieve hubs
    const hubs = await prisma.hub.findMany();

    // Check whether selected hubs exist
    const pickupHub = hubs.find(hub => hub.name === pickup);
    const destinationHub = hubs.find(
      hub => hub.name === destination
    );

    if (!pickupHub || !destinationHub) {
      return NextResponse.json(
        { error: "Invalid pickup or destination hub." },
        { status: 400 }
      );
    }

    // Retrieve all bus connections
    const connections = await prisma.busConnection.findMany({
      include: {
        bus: true,
        fromHub: true,
        toHub: true
      }
    });

    // Apply Dijkstra's Algorithm
    const result = dijkstra(
      hubs,
      connections,
      pickup,
      destination
    );

    if (!result) {
      return NextResponse.json(
        { error: "No route available between selected hubs." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Shortest route found successfully.",
      ...result
    });

  } catch (error) {

    console.error("ROUTING ERROR:", error);

    return NextResponse.json(
      { error: "Failed to calculate route." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const hubs = await prisma.hub.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ hubs });

  } catch (error) {
    console.error("HUB FETCH ERROR:", error);

    return NextResponse.json(
      { error: "Failed to retrieve hubs." },
      { status: 500 }
    );
  }
}