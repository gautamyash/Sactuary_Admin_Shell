import { cn } from "@/lib/utils";

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  src,
  className,
}: {
  name?: string;
  /** Optional image URL. Falls back to initials when omitted or when it fails to load. */
  src?: string;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        aria-hidden
        className={cn("size-10 shrink-0 rounded-full object-cover", className)}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
