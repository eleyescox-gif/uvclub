import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/report-requests - Fetch report requests
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "অনুমোদিত নয়" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const isAdmin = role === "ADMIN" || role === "PRESIDENT" || role === "SECRETARY" || role === "CASHIER";

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope");

    if (scope === "admin" && isAdmin) {
      const requests = await prisma.reportRequest.findMany({
        include: {
          user: {
            select: { id: true, name: true, nameBn: true, mobile: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ requests });
    } else {
      const requests = await prisma.reportRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ requests });
    }
  } catch (error) {
    console.error("GET /api/report-requests error:", error);
    return NextResponse.json({ error: "সার্ভার ত্রুটি ঘটেছে" }, { status: 500 });
  }
}

// POST /api/report-requests - Submit new report request by member
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "অনুমোদিত নয়" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { reportType, dateFrom, dateTo, note } = await req.json();

    if (!dateFrom || !dateTo) {
      return NextResponse.json({ error: "তারিখ প্রদান করা আবশ্যক" }, { status: 400 });
    }

    const newRequest = await prisma.reportRequest.create({
      data: {
        userId,
        reportType: reportType || "LEDGER",
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        note: note || "",
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error("POST /api/report-requests error:", error);
    return NextResponse.json({ error: "আবেদন পাঠাতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

// PATCH /api/report-requests - Approve / Reject report request by Secretary/Admin
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "অনুমোদিত নয়" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "SECRETARY" && role !== "PRESIDENT" && role !== "CASHIER") {
      return NextResponse.json({ error: "কেবল সাধারণ সম্পাদক বা অ্যাডমিন অনুমোদন করতে পারবেন" }, { status: 403 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "আইডি ও স্ট্যাটাস প্রদান করা আবশ্যক" }, { status: 400 });
    }

    const updated = await prisma.reportRequest.update({
      where: { id },
      data: {
        status,
        approvedBy: (session.user as any).id
      },
      include: {
        user: {
          select: { id: true, name: true, nameBn: true, mobile: true }
        }
      }
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("PATCH /api/report-requests error:", error);
    return NextResponse.json({ error: "স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
