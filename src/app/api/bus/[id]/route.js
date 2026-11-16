
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT: Update an existing bus
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const busId = Number(id);

    if (!Number.isInteger(busId) || busId <= 0) {
      return NextResponse.json(
        { error: "Invalid bus ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { busNumber } = body;

    if (
      typeof busNumber !== "string" ||
      !busNumber.trim()
    ) {
      return NextResponse.json(
        { error: "Bus number is required." },
        { status: 400 }
      );
    }

    const bus = await prisma.bus.update({
      where: { id: busId },
      data: {
        busNumber: busNumber.trim(),
      },
    });

    return NextResponse.json({
      message: "Bus updated successfully.",
      bus,
    });

  } catch (error) {
    console.error("UPDATE BUS ERROR:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Bus not found." },
        { status: 404 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This bus number already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update bus." },
      { status: 500 }
    );
  }
}


// DELETE: Remove an existing bus
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const busId = Number(id);

    if (!Number.isInteger(busId) || busId <= 0) {
      return NextResponse.json(
        { error: "Invalid bus ID." },
        { status: 400 }
      );
    }

    await prisma.bus.delete({
      where: { id: busId },
    });

    return NextResponse.json({
      message: "Bus deleted successfully.",
    });

  } catch (error) {
    console.error("DELETE BUS ERROR:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Bus not found." },
        { status: 404 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete this bus because it has existing connections." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete bus." },
      { status: 500 }
    );
  }
}
