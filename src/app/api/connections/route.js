
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Retrieve all bus connections
export async function GET() {
  try {
    const connections = await prisma.busConnection.findMany({
      include: {
        bus: true,
        fromHub: true,
        toHub: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({ connections });

  } catch (error) {
    console.error("GET CONNECTIONS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to retrieve bus connections." },
      { status: 500 }
    );
  }
}

// POST: Create a new bus connection
export async function POST(request) {
  try {
    const body = await request.json();

    const { busId, fromHubId, toHubId, distanceKm } = body;

    if (
      !Number.isInteger(Number(busId)) ||
      !Number.isInteger(Number(fromHubId)) ||
      !Number.isInteger(Number(toHubId)) ||
      Number(busId) <= 0 ||
      Number(fromHubId) <= 0 ||
      Number(toHubId) <= 0
    ) {
      return NextResponse.json(
        { error: "Valid bus and hub selections are required." },
        { status: 400 }
      );
    }

    if (Number(fromHubId) === Number(toHubId)) {
      return NextResponse.json(
        { error: "Starting and destination hubs must be different." },
        { status: 400 }
      );
    }

    if (
      distanceKm === "" ||
      distanceKm === null ||
      distanceKm === undefined ||
      !Number.isFinite(Number(distanceKm)) ||
      Number(distanceKm) <= 0
    ) {
      return NextResponse.json(
        { error: "Distance must be a positive number in kilometres." },
        { status: 400 }
      );
    }

    const connection = await prisma.busConnection.create({
      data: {
        busId: Number(busId),
        fromHubId: Number(fromHubId),
        toHubId: Number(toHubId),
        distanceKm: Number(distanceKm),
      },
      include: {
        bus: true,
        fromHub: true,
        toHub: true,
      },
    });

    return NextResponse.json(
      {
        message: "Bus connection created successfully.",
        connection,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("CREATE CONNECTION ERROR:", error);

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Selected bus or hub does not exist." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create bus connection." },
      { status: 500 }
    );
  }
}
