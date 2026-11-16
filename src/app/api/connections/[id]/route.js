
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// UPDATE a bus connection
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const connectionId = Number(id);

    if (!Number.isInteger(connectionId) || connectionId <= 0) {
      return NextResponse.json(
        { error: "Invalid connection ID." },
        { status: 400 }
      );
    }

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

    const connection = await prisma.busConnection.update({
      where: { id: connectionId },
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

    return NextResponse.json({
      message: "Bus connection updated successfully.",
      connection,
    });
  } catch (error) {
    console.error("UPDATE CONNECTION ERROR:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Connection not found." },
        { status: 404 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Selected bus or hub does not exist." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update bus connection." },
      { status: 500 }
    );
  }
}

// DELETE a bus connection
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const connectionId = Number(id);

    if (!Number.isInteger(connectionId) || connectionId <= 0) {
      return NextResponse.json(
        { error: "Invalid connection ID." },
        { status: 400 }
      );
    }

    await prisma.busConnection.delete({
      where: { id: connectionId },
    });

    return NextResponse.json({
      message: "Bus connection deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE CONNECTION ERROR:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Connection not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete bus connection." },
      { status: 500 }
    );
  }
}
