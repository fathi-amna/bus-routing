
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Retrieve all hubs
export async function GET() {
  try {
    const hubs = await prisma.hub.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ hubs });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to retrieve hubs." },
      { status: 500 }
    );
  }
}

// POST: Add a new hub
export async function POST(request) {
  try {
    const body = await request.json();

    const { name, latitude, longitude } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Hub name is required." },
        { status: 400 }
      );
    }

    const hub = await prisma.hub.create({
      data: {
        name: name.trim(),
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    });

    return NextResponse.json(
      {
        message: "Hub created successfully.",
        hub,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This hub already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create hub." },
      { status: 500 }
    );
  }
}

