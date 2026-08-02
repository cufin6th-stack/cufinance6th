import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { Btn, Spinner } from "@/components/ui";

/** Members-only gate: renders a courteous screen instead of redirecting. */
export function MemberOnly({
  children,
  what = "This section",
  requireApproval = true,
}: {
  children: ReactNode;
  what?: string;
  requireApproval?: boolean;
}) {
  const { loading, user, isApproved, isStaff } = useAuth();

  if (loading) return <Spinner />;

  if (!user) {
    return (
      <Gate
        title={`${what} is for batchmates only`}
        body="To keep our phone numbers and workplaces out of public reach, contact details and member activity are visible only after you sign in."
        cta={
          <>
            <Link to="/auth" search={{ mode: "signin" }} className="contents">
              <Btn>Sign in</Btn>
            </Link>
            <Link to="/auth" search={{ mode: "signup" }} className="contents">
              <Btn variant="ghost">Request access</Btn>
            </Link>
          </>
        }
      />
    );
  }

  if (requireApproval && !isApproved && !isStaff) {
    return (
      <Gate
        title="Your membership is awaiting approval"
        body="An admin verifies every new account against the batch list. You will get access to the full directory and the fund ledger as soon as that is done."
        cta={
          <Link to="/profile" className="contents">
            <Btn variant="ghost">Complete your profile</Btn>
          </Link>
        }
      />
    );
  }

  return <>{children}</>;
}

export function AdminOnly({ children }: { children: ReactNode }) {
  const { loading, user, isStaff } = useAuth();
  if (loading) return <Spinner />;
  if (!user)
    return (
      <Gate
        title="Admin sign-in required"
        body="This panel is limited to the batch admins and moderators."
        cta={
          <Link to="/auth" search={{ mode: "signin" }} className="contents">
            <Btn>Sign in</Btn>
          </Link>
        }
      />
    );
  if (!isStaff)
    return (
      <Gate
        title="You do not have panel access"
        body="Only admins and moderators can open the admin panel. Ask an admin if you believe this is a mistake."
        cta={
          <Link to="/" className="contents">
            <Btn variant="ghost">Back to the site</Btn>
          </Link>
        }
      />
    );
  return <>{children}</>;
}

function Gate({ title, body, cta }: { title: string; body: string; cta: ReactNode }) {
  return (
    <div className="wrap py-20">
      <div className="mx-auto max-w-[54ch] rounded-md border border-border bg-card px-8 py-12 text-center">
        <span className="kicker text-faint">Members only</span>
        <h1 className="mt-3 text-[26px]">{title}</h1>
        <p className="mx-auto mt-3 text-[14.5px] text-muted-foreground">{body}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">{cta}</div>
      </div>
    </div>
  );
}
