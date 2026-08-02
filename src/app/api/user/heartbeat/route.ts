import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  // DB writes for online heartbeat completely disabled as requested to maximize server speed
  return NextResponse.json({ active: true });
}
