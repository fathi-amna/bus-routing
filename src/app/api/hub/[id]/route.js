
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT: Update an existing hub
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const hubId = Number(id);

    if (!Number.isInteger(hubId) || hubId <= 0) {
      return NextResponse.json(
        { error: "Invalid hub ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, latitude, longitude } = body;

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Hub name is required." },
        { status: 400 }
      );
    }

    const hub = await prisma.hub.update({
      where: { id: hubId },
      data: {
        name: name.trim(),
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    });

    return NextResponse.json({
      message: "Hub updated successfully.",
      hub,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Hub not found." },
        { status: 404 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This hub name already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update hub." },
      { status: 500 }
    );
  }
}


// DELETE: Remove an existing hub
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const hubId = Number(id);

    if (!Number.isInteger(hubId) || hubId <= 0) {
      return NextResponse.json(
        { error: "Invalid hub ID." },
        { status: 400 }
      );
    }

    await prisma.hub.delete({
      where: { id: hubId },
    });

    return NextResponse.json({
      message: "Hub deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Hub not found." },
        { status: 404 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete this hub because it has bus connections." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete hub." },
      { status: 500 }
    );
  }
}

