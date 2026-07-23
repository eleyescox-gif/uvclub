"use server";

import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { processExit } from "./exit"; // to trigger exit if passed

export async function createPoll(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY" && role !== "CONTROLLER") {
    return { error: "Unauthorized. Only President/Secretary can create polls." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as string; // MEMBER_EXIT, GENERAL, COMMITTEE_ELECTION
  const targetId = formData.get("targetId") as string; 
  const optionsString = formData.get("options") as string; // Comma separated for GENERAL
  const deadlineString = formData.get("deadline") as string;

  if (!title || !description) return { error: "Title and description are required" };

  let pollOptions: { text: string; candidateId?: string }[] = [];
  if (type === "MEMBER_EXIT") {
    pollOptions = [{ text: "হ্যাঁ (Yes)" }, { text: "না (No)" }];
  } else if (type === "COMMITTEE_ELECTION") {
    const candidateIds = formData.getAll("candidateIds") as string[];
    if (candidateIds && candidateIds.length > 0) {
      const candidates = await prisma.user.findMany({
        where: { id: { in: candidateIds } },
        select: { id: true, name: true, nameBn: true }
      });
      pollOptions = candidates.map(c => ({
        text: c.nameBn || c.name,
        candidateId: c.id
      }));
    }
  } else if (optionsString) {
    pollOptions = optionsString.split(",").map(opt => ({ text: opt.trim() })).filter(opt => opt.text !== "");
  }

  if (pollOptions.length < 2) {
    return { error: "At least 2 options are required" };
  }
  
  let deadlineDate = null;
  if (deadlineString) {
    deadlineDate = new Date(deadlineString);
  }

  try {
    const poll = await prisma.votingEvent.create({
      data: {
        title,
        description,
        type: type || "GENERAL",
        targetId: targetId || null,
        status: "OPEN",
        threshold: 75.0,
        deadline: deadlineDate,
        createdBy: (session.user as any).id,
        options: {
          create: pollOptions
        }
      }
    });

    if (type === "MEMBER_EXIT" && targetId) {
      await prisma.exitRequest.update({
        where: { id: targetId },
        data: { status: "POLL_CREATED" }
      });
    }

    revalidatePath("/dashboard/voting");
    revalidatePath("/dashboard/admin/exit-requests");
    
    return { success: true, pollId: poll.id };
  } catch (error: any) {
    return { error: error.message || "Failed to create poll" };
  }
}

export async function castVote(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const userId = (session.user as any).id;
  const pollId = formData.get("pollId") as string;
  const optionId = formData.get("optionId") as string;

  if (!pollId || !optionId) return { error: "Missing required fields" };

  try {
    const poll = await prisma.votingEvent.findUnique({ where: { id: pollId } });
    if (!poll || poll.status !== "OPEN") return { error: "Poll is not open for voting" };

    const existingVote = await prisma.vote.findUnique({
      where: { userId_votingEventId: { userId, votingEventId: pollId } }
    });

    if (existingVote) return { error: "You have already voted on this poll" };

    await prisma.vote.create({
      data: {
        userId,
        votingEventId: pollId,
        pollOptionId: optionId
      }
    });

    revalidatePath("/dashboard/voting");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to cast vote" };
  }
}

export async function closePoll(pollId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT") return { error: "Unauthorized" };

  try {
    const poll = await prisma.votingEvent.findUnique({ 
      where: { id: pollId },
      include: { 
        options: { include: { votes: true } }
      }
    });

    if (!poll) return { error: "Poll not found" };

    // Calculate winner
    let maxVotes = -1;
    let winnerOptionId = null;
    let winnerText = null;

    poll.options.forEach(opt => {
      if (opt.votes.length > maxVotes) {
        maxVotes = opt.votes.length;
        winnerOptionId = opt.id;
        winnerText = opt.text;
      }
    });

    let resultStatus = "PASSED"; 
    // If MEMBER_EXIT, check if "Yes" got 75% of total active members
    if (poll.type === "MEMBER_EXIT") {
      const yesOption = poll.options.find(o => o.text.includes("Yes"));
      const yesVotes = yesOption ? yesOption.votes.length : 0;
      const totalMembers = await prisma.user.count({ where: { activeStatus: true } });
      const percentage = totalMembers > 0 ? (yesVotes / totalMembers) * 100 : 0;
      
      resultStatus = percentage >= poll.threshold ? "PASSED" : "FAILED";

      if (poll.targetId && resultStatus === "PASSED") {
        await processExit(poll.targetId);
      } else if (poll.targetId && resultStatus === "FAILED") {
        await prisma.exitRequest.update({
          where: { id: poll.targetId },
          data: { status: "REJECTED" }
        });
      }
    }

    // For general polls, "PASSED" just means it's closed and the highest vote option is the winner.
    // Store winner in targetId if general to display banner? Or we can just calculate on the fly when showing.
    // Let's just set status to PASSED (or CLOSED).
    if (poll.type === "GENERAL") {
      resultStatus = "CLOSED";
      // We can optionally save the winner somewhere, or UI can calculate it easily since votes are kept.
    }

    await prisma.votingEvent.update({
      where: { id: pollId },
      data: { status: resultStatus }
    });

    revalidatePath("/dashboard/voting");
    return { success: true, status: resultStatus };
  } catch (error: any) {
    return { error: error.message || "Failed to close poll" };
  }
}

export async function deletePoll(pollId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY" && role !== "CONTROLLER") {
    return { error: "Unauthorized. Only President or Admin can delete polls." };
  }

  try {
    const poll = await prisma.votingEvent.findUnique({
      where: { id: pollId },
      select: { targetId: true, type: true }
    });

    if (!poll) return { error: "Poll not found" };

    // Cascade deletes options and votes because of relation cascade config
    await prisma.votingEvent.delete({
      where: { id: pollId }
    });

    // If it was a MEMBER_EXIT poll, reset the exit request status
    if (poll.type === "MEMBER_EXIT" && poll.targetId) {
      await prisma.exitRequest.update({
        where: { id: poll.targetId },
        data: { status: "PENDING" }
      }).catch(() => {});
    }

    revalidatePath("/dashboard/voting");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete poll" };
  }
}

