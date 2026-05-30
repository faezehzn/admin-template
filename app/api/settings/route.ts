import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await prisma.setting.findMany();
  
  const settingsMap = settings.reduce((acc, curr) => ({
    ...acc, [curr.key]: curr.value
  }), {});
  return NextResponse.json(settingsMap);
}

export async function PATCH(req: Request) {
  const body = await req.json(); // { key: string, value: string }
  
  const setting = await prisma.setting.upsert({
    where: { key: body.key },
    update: { value: body.value.toString() },
    create: { key: body.key, value: body.value.toString() },
  });

  return NextResponse.json(setting);
}
