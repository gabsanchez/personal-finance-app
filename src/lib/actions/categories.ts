"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.category.findMany({
    where: { userId: session.user.id, archived: false },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required" };

  try {
    const existing = await prisma.category.findFirst({
      where: { userId: session.user.id, kind: "EXPENSE", name },
    });
    if (existing) return { error: "Category already exists" };

    await prisma.category.create({
      data: { name, kind: "EXPENSE", userId: session.user.id },
    });
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required" };

  try {
    const category = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!category) return { error: "Category not found" };

    const duplicate = await prisma.category.findFirst({
      where: { userId: session.user.id, kind: "EXPENSE", name, id: { not: id } },
    });
    if (duplicate) return { error: "Category already exists" };

    await prisma.category.update({
      where: { id },
      data: { name },
    });
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const category = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!category) return { error: "Category not found" };

    await prisma.category.update({
      where: { id },
      data: { archived: true },
    });
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/categories");
  return { success: true };
}
