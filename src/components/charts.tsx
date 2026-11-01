"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatINR } from "@/lib/utils";

const tip = { background: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12, color: "#fafafa" };
const axis = { fill: "#a1a1aa", fontSize: 12 };

export function AssetsHistoryChart({ data }: { data: { label: string; lakh: number }[] }) {
  return (
    <div className="h-56 w-full" role="img" aria-label="Declared assets by election">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: -10, right: 12, top: 8 }}>
          <CartesianGrid stroke="#27272a" vertical={false} />
          <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
          <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 100).toFixed(0)}Cr`} />
          <Tooltip cursor={{ fill: "#18181b" }} contentStyle={tip} formatter={(v) => formatINR(Number(v))} />
          <Bar dataKey="lakh" fill="#fafafa" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AssetsDonut({ movable, immovable, labels }: { movable: number; immovable: number; labels: [string, string] }) {
  const data = [
    { name: labels[0], v: movable, fill: "#fafafa" },
    { name: labels[1], v: immovable, fill: "#52525b" },
  ];
  return (
    <div className="flex items-center gap-6">
      <div className="h-40 w-40 shrink-0" role="img" aria-label={`${labels[0]} ${formatINR(movable)}, ${labels[1]} ${formatINR(immovable)}`}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="v" innerRadius={48} outerRadius={70} stroke="#09090b" strokeWidth={3}>
              {data.map((d) => <Cell key={d.name} fill={d.fill} />)}
            </Pie>
            <Tooltip contentStyle={tip} formatter={(v) => formatINR(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-3 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-sm" style={{ background: d.fill }} />
            <span className="text-muted">{d.name}</span>
            <span className="font-medium">{formatINR(d.v)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
