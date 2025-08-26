import { auth } from "@clerk/nextjs/server";

import db from "@/lib/db";

export const currentProfile = async () => {
  const authResult = await auth();
  const { userId } = authResult;

  if (!userId) {
    return (await auth()).redirectToSignIn();
  }

  const profile = await db.profile.findUnique({
    where: { userId },
  });

  return profile;
};
