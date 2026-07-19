import { NEED_ICONS } from "./need-icons";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "size-8",
  default: "size-11",
  lg: "size-20",
};

const ICON_SIZE_CLASSES = {
  sm: "size-4",
  default: "size-5",
  lg: "size-9",
};

export function NeedIcon({ need, size = "default", className }) {
  if (!need) return null;
  const Icon = NEED_ICONS[need.key];
  if (!Icon) return null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        SIZE_CLASSES[size],
        className
      )}
      style={{ backgroundColor: `${need.color}1f`, color: need.color }}
    >
      <Icon className={ICON_SIZE_CLASSES[size]} strokeWidth={2} />
    </div>
  );
}
