import { UserListItem } from "@/types/prisma";
// import { ActivityLogWithUser } from "@/types/activity-log";

// ActivityLogWithUser[]
export function ActivityList({ users }: { users: UserListItem[] }) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-diactive p-4">
        <p>No recent activity found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-75 px-1.5 overflow-auto">
      {users.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 border-b border-primary-300 pb-3 last:border-0"
        >
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold uppercase">
            {item.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{item.name || "Unknown User"}</p>
            <p className="text-xs text-primary-300">{item.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
