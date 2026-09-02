"use client";

import { ArrowUpRight, Database, UsersRound } from "lucide-react";
import Link from "next/link";

export type WidgetSize = "small" | "medium" | "wide" | "large";
export type WidgetSource = "Overview" | "Operations";
export type WidgetKind = "metric" | "chart" | "story" | "table" | "action";
export type WidgetDefinition = {
  title: string;
  subtitle: string;
  kind: WidgetKind;
  sizes: WidgetSize[];
  defaultSize: WidgetSize;
  source: WidgetSource;
};

export const crossPageWidgetDefinitions = {
  "employees-directory": {
    title: "Employee directory",
    subtitle: "Search, inspect and maintain employee records",
    kind: "action",
    sizes: ["small", "medium"],
    defaultSize: "small",
    source: "Operations",
  },
  "data-hub": {
    title: "Data Hub",
    subtitle: "Validate and import Excel or CSV files",
    kind: "action",
    sizes: ["small", "medium"],
    defaultSize: "small",
    source: "Operations",
  },
} as const satisfies Record<string, WidgetDefinition>;

export type CrossPageWidgetId = keyof typeof crossPageWidgetDefinitions;

type CrossPageWidgetContentProps = {
  id: CrossPageWidgetId;
};

function OperationalWidget({
  description,
  href,
  icon,
  label,
}: {
  description: string;
  href: string;
  icon: "employees" | "data";
  label: string;
}) {
  return (
    <div className="cross-widget-operation">
      <div>{icon === "employees" ? <UsersRound size={22} /> : <Database size={22} />}</div>
      <p>{description}</p>
      <Link href={href}>
        {label}
        <ArrowUpRight aria-hidden="true" size={14} />
      </Link>
    </div>
  );
}

export function CrossPageWidgetContent({ id }: CrossPageWidgetContentProps) {
  switch (id) {
    case "employees-directory":
      return <OperationalWidget description="Open the searchable employee master to add, edit, export or inspect records." href="/employees" icon="employees" label="Open employees" />;
    case "data-hub":
      return <OperationalWidget description="Upload an Excel or CSV file, validate every row, preview the result and import valid employees." href="/data-hub" icon="data" label="Open Data Hub" />;
  }
}
