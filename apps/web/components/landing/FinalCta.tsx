import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FinalCta() {
  return (
    <section className="py-16">
      <Card className="border-signal/20 bg-surface/80">
        <CardContent className="flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl">Ready to find the fork?</h2>
            <p className="mt-2 max-w-md text-muted">
              Sign in to run an audit. Your reports stay private to your account.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/login">Start audit</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
