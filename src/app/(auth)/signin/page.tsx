import { auth, signIn } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/site-header";

export default async function SignInPage() {
  const session = await auth();

  return (
    <>
      <SiteHeader variant="internal" />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Sign in to your PlanOne Media account</CardDescription>
          </CardHeader>
          <CardContent>
            {session?.user ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Signed in as <strong>{session.user.email}</strong>
                </p>
                <form
                  action={async () => {
                    "use server";
                    const { signOut } = await import("@/lib/auth");
                    await signOut();
                  }}
                >
                  <Button type="submit" variant="outline" className="w-full">
                    Sign Out
                  </Button>
                </form>
                <div className="text-center">
                  <a href="/" className="text-sm text-blue-600 underline underline-offset-2 hover:text-blue-700">
                    Go to Home →
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const email = formData.get("email") as string;
                    const password = formData.get("password") as string;
                    await signIn("credentials", { email, password, redirectTo: "/supplier/dashboard" });
                  }}
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">
                      Sign In
                    </Button>
                  </div>
                </form>
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
                    Sign Up
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
