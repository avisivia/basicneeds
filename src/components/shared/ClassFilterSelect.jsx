"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ClassFilterSelect({ classes, value, allowAll = true }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (nextValue) => {
    const params = new URLSearchParams(searchParams);
    if (nextValue === "all") {
      params.delete("classId");
    } else {
      params.set("classId", nextValue);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const items = [
    ...(allowAll ? [{ value: "all", label: "All classes" }] : []),
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Select items={items} value={value} onValueChange={onChange}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allowAll && <SelectItem value="all">All classes</SelectItem>}
        {classes.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
