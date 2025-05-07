import SignupForm from "@/components/signup-form";
import PageWrapper from "@/components/PageWrapper";
import { Activity } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  return (
    <PageWrapper>
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold">LiveVitals</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Create Your Account
            </h1>
            <p className="text-muted-foreground">
              Join LiveVitals to start your wellness journey today
            </p>
          </div>

          <SignupForm />
        </div>
      </main>
    </PageWrapper>
  );
}
