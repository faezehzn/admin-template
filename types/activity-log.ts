import { Prisma } from "@prisma/client";

export type ActivityLogWithUser = Prisma.ActivityLogGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        email: true;
        name: true;
        status: true;
        avatar: true;
      };
    };
  };
}>;
