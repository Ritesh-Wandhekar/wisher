import { cn } from "@/lib/utils";

export function EventBadge({ type }: { type: "birthday" | "anniversary" | "custom" }) {
  const cls =
    type === "birthday"
      ? "bg-purple-100 text-purple-700"
      : type === "anniversary"
        ? "bg-pink-100 text-pink-700"
        : "bg-blue-100 text-blue-700";

  const label =
    type === "birthday" ? "Birthday" : type === "anniversary" ? "Anniversary" : "Custom";

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", cls)}>
      {label}
    </span>
  );
}

