import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { generateExcelOutput } from "@/lib/gemini";
import { generateSchema } from "@/lib/zod-schemas";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { input, outputType } = generateSchema.parse(body);

    // Explicit trial limit check
    if (profile.trialUses >= 2 && (!profile.subscription || profile.subscription !== "active")) {
      return new NextResponse("Trial limit reached. Please subscribe.", { status: 403 });
    }

    const output = await generateExcelOutput(input, outputType);

    const query = await db.query.create({
      data: {
        profileId: profile.id,
        input,
        output,
        outputType,
      },
    });

    // Increment trialUses only for non-subscribed users within limit
    if (profile.trialUses < 2 && (!profile.subscription || profile.subscription !== "active")) {
      await db.profile.update({
        where: { id: profile.id },
        data: { trialUses: profile.trialUses + 1 },
      });
    }

    return NextResponse.json(query);
  } catch (error: any) {
    console.error("Generation error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}