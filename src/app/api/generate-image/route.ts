import { NextResponse } from "next/server";

const MODAL_API_URL = "https://pentagram.modal.run/generate";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Sending prompt to Modal:", prompt); // Debug log

    const response = await fetch(MODAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Modal API error:", errorText); // Debug log
      throw new Error(`Failed to generate image: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ imageUrl: data.imageUrl });

  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
