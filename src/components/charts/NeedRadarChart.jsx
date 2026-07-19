"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export function NeedRadarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <PolarRadiusAxis
          domain={[0, 5]}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
        />
        <Radar
          dataKey="avg"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.35}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--border)",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
