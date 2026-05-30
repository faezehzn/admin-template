import { NextResponse } from "next/server";
import { sendSystemEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const to = body?.to;
    const subject = body?.subject;
    const text = body?.text;

    if (!to || typeof to !== "string") {
      return NextResponse.json(
        { message: "Recipient email is required." },
        { status: 400 },
      );
    }

    await sendSystemEmail(to, subject, text);

    return NextResponse.json(
      { message: "This email sent successfully." },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to send email.",
      },
      { status: 500 },
    );
  }
}
