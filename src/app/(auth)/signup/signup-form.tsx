"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function SignupForm() {
  const t = useTranslations("auth.signup");
  const tErrors = useTranslations("auth.errors");
  const tLang = useTranslations("languages");

  const [state, action, pending] = useActionState(signup, {});

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>
          {t("hasAccount")}{" "}
          <Link href="/signin" className="text-primary underline">
            {t("signIn")}
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" name="name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locale">{t("language")}</Label>
            <Select name="locale" defaultValue="en">
              <SelectTrigger id="locale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{tLang("en")}</SelectItem>
                <SelectItem value="es">{tLang("es")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{tErrors(state.error)}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {t("submit")}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground">
            {t("continueWith")}
          </span>
          <Separator className="flex-1" />
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          {t("google")}
        </Button>
      </CardContent>
    </Card>
  );
}
