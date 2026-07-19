"use server";

import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";

export async function addMember(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SECRETARY" && role !== "PRESIDENT") {
    return { error: "Unauthorized. Only Secretary or Admin can add members." };
  }

  const name = formData.get("name") as string;
  const nameBn = formData.get("nameBn") as string;
  const nameEn = formData.get("nameEn") as string;
  const mobile = formData.get("mobile") as string;
  const password = formData.get("password") as string;
  const fatherName = formData.get("fatherName") as string;
  const motherName = formData.get("motherName") as string;
  const address = formData.get("address") as string;
  const nid = formData.get("nid") as string;
  const dobStr = formData.get("dob") as string;
  const nomineeName = formData.get("nomineeName") as string;
  const nomineeNid = formData.get("nomineeNid") as string;
  const nomineeMobile = formData.get("nomineeMobile") as string;
  const nomineeAge = formData.get("nomineeAge") as string;
  const profilePicture = formData.get("profilePicture") as string;
  
  let userRole = formData.get("role") as string | undefined;
  if (role !== "ADMIN" && role !== "PRESIDENT") {
    userRole = undefined; // Force default if not authorized
  }

  if (!name || !mobile || !password) {
    return { error: "Name, mobile and password are required fields" };
  }

  let dob = undefined;
  if (dobStr) {
    dob = new Date(dobStr);
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { mobile }
    });

    if (existingUser) {
      return { error: "This mobile number is already registered." };
    }

    await prisma.user.create({
      data: {
        name,
        nameBn,
        nameEn,
        mobile,
        password, // Reminder: Hash in production
        fatherName,
        motherName,
        address,
        nid,
        dob,
        profilePicture,
        nomineeName,
        nomineeNid,
        nomineeMobile,
        nomineeAge,
        role: userRole || "MEMBER",
        activeStatus: false, // Requires President Approval
      }
    });

    revalidatePath("/dashboard/admin/members/pending");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to add member" };
  }
}

export async function approveMember(userId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT") {
    return { error: "Unauthorized. Only President can approve members." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        activeStatus: true,
        joinDate: new Date()
      }
    });

    revalidatePath("/dashboard/admin/members/pending");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to approve member" };
  }
}

export async function resetPassword(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    return { error: "Unauthorized. Only Admin can reset passwords." };
  }

  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!userId || !newPassword) {
    return { error: "Missing required fields" };
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword }
    });

    revalidatePath("/dashboard/admin/members/manage");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to reset password" };
  }
}

export async function deleteMember(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };
  
  const role = (session.user as any).role;
  const loggedInUserId = (session.user as any).id;

  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    return { error: "Unauthorized. Only Admin, President or Secretary can delete members." };
  }

  try {
    if (role === "SECRETARY") {
      const existingReq = await prisma.exitRequest.findFirst({
        where: { userId, status: "PENDING" }
      });
      if (existingReq) {
        return { error: "A deletion request is already pending for this member." };
      }
      await prisma.exitRequest.create({
        data: {
          userId,
          reason: "Secretary requested deletion",
          requestedBy: loggedInUserId
        }
      });
      return { success: true, message: "Deletion request submitted for approval." };
    } else {
      // Admin or President soft deletes the member (moves to trash)
      await prisma.user.update({
        where: { id: userId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          activeStatus: false // Deactivate them
        }
      });

      // Approve any pending exit requests for this user
      await prisma.exitRequest.updateMany({
        where: { userId, status: "PENDING" },
        data: { status: "APPROVED" }
      });

      revalidatePath("/dashboard/admin/members/manage");
      return { success: true, message: "Member moved to trash bin." };
    }
  } catch (error: any) {
    return { error: error.message || "Failed to delete member" };
  }
}

export async function restoreMember(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };
  
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT") {
    return { error: "Unauthorized. Only Admin or President can restore members." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deletedAt: true }
    });

    if (!user) {
      return { error: "সদস্য পাওয়া যায়নি!" };
    }

    if (user.deletedAt) {
      const deletedDate = new Date(user.deletedAt);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - deletedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 30) {
        return { error: "এই সদস্যটি ডিলিট করার পর ৩০ দিন পার হয়ে গেছে। ৩০ দিন পার হয়ে যাওয়া ডাটা আর রিকভার করা সম্ভব নয়।" };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: false,
        deletedAt: null,
        activeStatus: true
      }
    });
    revalidatePath("/dashboard/admin/members/manage");
    revalidatePath("/dashboard/admin/members/trash");
    return { success: true, message: "Member restored successfully." };
  } catch (error: any) {
    return { error: error.message || "Failed to restore member" };
  }
}

export async function hardDeleteMember(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };
  
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT") {
    return { error: "Unauthorized. Only Admin or President can permanently delete members." };
  }

  try {
    await prisma.$transaction([
      prisma.vote.deleteMany({ where: { userId } }),
      prisma.transaction.deleteMany({ where: { userId } }),
      prisma.invoice.deleteMany({ where: { userId } }),
      prisma.exitRequest.deleteMany({ where: { userId } }),
      prisma.committee.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);

    revalidatePath("/dashboard/admin/members/trash");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to permanently delete member" };
  }
}

export async function updateMember(userId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };
  
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    return { error: "Unauthorized. Only Admin, President or Secretary can edit members." };
  }

  const name = formData.get("name") as string;
  const nameBn = formData.get("nameBn") as string;
  const nameEn = formData.get("nameEn") as string;
  const mobile = formData.get("mobile") as string;
  const fatherName = formData.get("fatherName") as string;
  const motherName = formData.get("motherName") as string;
  const address = formData.get("address") as string;
  const nid = formData.get("nid") as string;
  const dobStr = formData.get("dob") as string;
  const nomineeName = formData.get("nomineeName") as string;
  const nomineeRelation = formData.get("nomineeRelation") as string;
  const nomineeNid = formData.get("nomineeNid") as string;
  const nomineeMobile = formData.get("nomineeMobile") as string;
  const nomineeAge = formData.get("nomineeAge") as string;
  const activeStatus = formData.get("activeStatus") === "true";
  const userRole = formData.get("role") as string || undefined;
  const profilePicture = formData.get("profilePicture") as string;

  if (!name || !mobile) {
    return { error: "Name and mobile are required fields" };
  }

  let dob = undefined;
  if (dobStr) {
    dob = new Date(dobStr);
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { mobile } });
    if (existingUser && existingUser.id !== userId) {
      return { error: "This mobile number is already registered to another user." };
    }

    const dataToUpdate: any = {
      name, nameBn, nameEn, mobile, fatherName, motherName, address, nid, dob,
      nomineeName, nomineeRelation, nomineeNid, nomineeMobile, nomineeAge, activeStatus
    };
    if (profilePicture) {
      dataToUpdate.profilePicture = profilePicture;
    }
    
    // Only Admin/President can change role
    if (userRole && (role === "ADMIN" || role === "PRESIDENT")) {
      dataToUpdate.role = userRole;
    }

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
    });

    revalidatePath("/dashboard/admin/members/manage");
    revalidatePath(`/dashboard/admin/members/${userId}/edit`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update member" };
  }
}

export async function approveExitRequest(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };
  
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT") {
    return { error: "Unauthorized. Only Admin or President can approve deletion requests." };
  }

  try {
    const request = await prisma.exitRequest.findUnique({ where: { id: requestId } });
    if (!request) return { error: "Request not found" };

    // Soft delete the member
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        activeStatus: false
      }
    });

    // Mark request as approved
    await prisma.exitRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" }
    });

    revalidatePath("/dashboard/admin/members/manage");
    revalidatePath("/dashboard/admin/notices");
    return { success: true, message: "Deletion request approved." };
  } catch (error: any) {
    return { error: error.message || "Failed to approve request" };
  }
}

export async function rejectExitRequest(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };
  
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT") {
    return { error: "Unauthorized. Only Admin or President can reject deletion requests." };
  }

  try {
    const request = await prisma.exitRequest.findUnique({ where: { id: requestId } });
    if (!request) return { error: "Request not found" };

    // Mark request as rejected
    await prisma.exitRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" }
    });

    revalidatePath("/dashboard/admin/members/manage");
    revalidatePath("/dashboard/admin/notices");
    return { success: true, message: "Deletion request rejected." };
  } catch (error: any) {
    return { error: error.message || "Failed to reject request" };
  }
}
