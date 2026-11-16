
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Retrieve all buses
export async function GET() {
  try {
    const buses = await prisma.bus.findMany({
      orderBy: { busNumber: "asc" },
    });

    return NextResponse.json({ buses });
  } catch (error) {
    console.error("GET BUSES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to retrieve buses." },
      { status: 500 }
    );
  }
}

// POST: Register a new bus
export async function POST(request) {
  try {
    const body = await request.json();
    const { busNumber } = body;

    if (typeof busNumber !== "string" || !busNumber.trim()) {
      return NextResponse.json(
        { error: "Bus number is required." },
        { status: 400 }
      );
    }

    const bus = await prisma.bus.create({
      data: {
        busNumber: busNumber.trim(),
      },
    });

    return NextResponse.json(
      {
        message: "Bus registered successfully.",
        bus,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE BUS ERROR:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This bus number already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to register bus." },
      { status: 500 }
    );
  }
}
