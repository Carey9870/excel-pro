import { Profile } from "@/lib/generated/prisma";

interface TrialCounterProps {
  profile: Profile | null;
}

export function TrialCounter({ profile }: TrialCounterProps) {
  if (!profile || profile.subscription === "active") return null;

  const trialsLeft = 2 - profile.trialUses;

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Trials left: {trialsLeft}/2
      </p>
    </>
  );
}
