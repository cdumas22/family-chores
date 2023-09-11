import { type LoaderArgs, redirect } from "@remix-run/node";
import prisma from "~/lib/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  let group = await prisma.group.findFirst({
    where: { userId, isDefault: true },
  });

  if (!group) {
    group = await prisma.group.findFirst({
      where: { userId },
    });
  }

  if (!group) {
    return redirect(`/group/create`);
  }

  return redirect(`/group/${group?.id}`);
};
