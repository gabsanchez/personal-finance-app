"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/i18n/request";

interface SignupState {
  error?: string;
}

export async function signup(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const locale = (formData.get("locale") as Locale) ?? "en";

  if (password.length < 8) {
    return { error: "passwordTooShort" };
  }

  if (password !== confirmPassword) {
    return { error: "passwordMismatch" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "emailExists" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      locale,
    },
  });

  // Set locale cookie before signing in
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  redirect("/");
}
