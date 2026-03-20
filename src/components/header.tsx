import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Header() {
  const session = await auth();

  if (!session) return null;

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <span className="text-lg font-semibold">Pocket Detective</span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/signin" });
        }}
      >
        <Button variant="link" size="sm" type="submit">
          Sign out
        </Button>
      </form>
    </header>
  );
}
