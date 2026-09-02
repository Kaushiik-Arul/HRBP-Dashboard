"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";

import { HeatmapCell } from "@/components/heatmap-cell";

const colors = {
  coral: "#f06449",
  navy: "#284b63",
  green: "#78a083",
  yellow: "#edb458",
  purple: "#7d6b91",
  grid: "#e5e3dd",
  muted: "#6f756f",
};

const axis = {
  axisLine: false,
  tickLine: false,
  tick: { fill: colors.muted, fontSize: 11 },
};

const chartColors = [colors.coral, colors.navy, colors.green, colors.yellow, colors.purple];

const joiningData = [
  { year: "2011", value: 3 },
  { year: "2012", value: 2 },
  { year: "2013", value: 5 },
  { year: "2014", value: 1 },
  { year: "2015", value: 4 },
  { year: "2016", value: 3 },
  { year: "2017", value: 1 },
  { year: "2018", value: 4 },
  { year: "2019", value: 1 },
  { year: "2020", value: 2 },
  { year: "2021", value: 3 },
  { year: "2022", value: 1 },
  { year: "2023", value: 1 },
  { year: "2025", value: 1 },
  { year: "2026", value: 1 },
];

type WorkforceChartPoint = {
  name: string;
  percentage: number;
  value: number;
};

function WorkforceChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload as WorkforceChartPoint;

  return (
    <div className="chart-tooltip">
      <p>{point.name}</p>
      <strong>{point.value} employees</strong>
      <span>{point.percentage}% of the workforce</span>
    </div>
  );
}

export function FunctionBarChart({
  data,
}: {
  data: { function_name: string; employee_count: number; percentage: number }[];
}) {
  const chartData = data.map((item) => ({
    name: item.function_name,
    percentage: item.percentage,
    value: item.employee_count,
  }));

  return (
    <div className="chart-area chart-tall">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 18, bottom: 0, left: 18 }}>
          <CartesianGrid horizontal={false} stroke={colors.grid} strokeDasharray="3 5" />
          <XAxis {...axis} allowDecimals={false} domain={[0, "dataMax + 4"]} type="number" />
          <YAxis {...axis} dataKey="name" type="category" width={92} />
          <Tooltip
            content={WorkforceChartTooltip}
            cursor={{ fill: "rgba(40, 75, 99, 0.05)" }}
          />
          <Bar animationDuration={420} dataKey="value" radius={[0, 7, 7, 0]}>
            {chartData.map((entry, index) => (
              <Cell fill={chartColors[index % chartColors.length]} key={entry.name} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EmployeeGroupDonut({
  data,
}: {
  data: { employee_group: string; employee_count: number }[];
}) {
  const chartData = data.map((item, index) => ({
    name: item.employee_group,
    value: item.employee_count,
    color: chartColors[index % chartColors.length],
  }));
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="donut-chart">
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie animationDuration={420} data={chartData} dataKey="value" innerRadius="66%" outerRadius="86%" paddingAngle={1} stroke="none">
            {chartData.map((item) => <Cell fill={item.color} key={item.name} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center"><strong>{total}</strong><span>people</span></div>
    </div>
  );
}

export function JoiningCohortChart({ expanded = false }: { expanded?: boolean }) {
  const data = expanded
    ? [
        { year: "2006", value: 3 }, { year: "2007", value: 2 }, { year: "2008", value: 4 },
        { year: "2009", value: 2 }, { year: "2010", value: 3 }, ...joiningData,
      ]
    : joiningData;
  return (
    <div className="chart-area chart-medium">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 5" vertical={false} />
          <XAxis {...axis} dataKey="year" interval={expanded ? 0 : "preserveStartEnd"} />
          <YAxis {...axis} domain={[0, 8]} ticks={[0, 2, 4, 6, 8]} />
          <Line
            animationDuration={420}
            dataKey="value"
            dot={{ fill: "#fffdf8", stroke: colors.coral, strokeWidth: 2, r: 4 }}
            stroke={colors.coral}
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WorkforceStackedChart() {
  const data = [
    { name: "Sales", direct: 17, indirect: 14 },
    { name: "Manufacturing", direct: 11, indirect: 13 },
    { name: "IT", direct: 7, indirect: 11 },
    { name: "Finance", direct: 6, indirect: 10 },
    { name: "HR", direct: 3, indirect: 8 },
  ];
  return (
    <div className="chart-area chart-tall">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 5" vertical={false} />
          <XAxis {...axis} dataKey="name" />
          <YAxis {...axis} domain={[0, 32]} ticks={[0, 8, 16, 24, 32]} />
          <Bar animationDuration={420} dataKey="direct" fill={colors.coral} radius={[0, 0, 0, 0]} stackId="group" />
          <Bar animationDuration={420} dataKey="indirect" fill={colors.navy} radius={[7, 7, 0, 0]} stackId="group" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const defaultLocationData = [
    { name: "Jaipur", percentage: 26, value: 26 },
    { name: "Bengaluru", percentage: 22, value: 22 },
    { name: "Nashik", percentage: 22, value: 22 },
    { name: "Chennai", percentage: 15, value: 15 },
    { name: "Pune", percentage: 15, value: 15 },
];

export function LocationBarChart({
  data,
}: {
  data?: { location_name: string; employee_count: number; percentage?: number }[];
}) {
  const total = data?.reduce((sum, item) => sum + item.employee_count, 0) ?? 100;
  const chartData = data
    ? data.map((item) => ({
        name: item.location_name,
        percentage: item.percentage ?? Number(((item.employee_count / total) * 100).toFixed(1)),
        value: item.employee_count,
      }))
    : defaultLocationData;

  return (
    <div className="chart-area chart-tall">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 18, bottom: 0, left: 14 }}>
          <CartesianGrid horizontal={false} stroke={colors.grid} strokeDasharray="3 5" />
          <XAxis {...axis} allowDecimals={false} domain={[0, "dataMax + 4"]} type="number" />
          <YAxis {...axis} dataKey="name" type="category" width={72} />
          <Tooltip
            content={WorkforceChartTooltip}
            cursor={{ fill: "rgba(40, 75, 99, 0.05)" }}
          />
          <Bar
            animationDuration={420}
            dataKey="value"
            fill={colors.coral}
            radius={[0, 7, 7, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const ageBands = ["Under 25", "25-34", "35-44", "45-54", "55+"];
const defaultTenureBands = ["Under 2", "2-5", "6-10", "11-20", "20+"];

export function AgeTenureHeatmap({
  data,
  tenureBands = defaultTenureBands,
}: {
  data: {
    age_band: string;
    tenure_band: string;
    employee_count: number;
    percentage: number;
  }[];
  tenureBands?: string[];
}) {
  const cells = new Map(
    data.map((item) => [`${item.age_band}|${item.tenure_band}`, item]),
  );

  let maximumCount = 0;
  for (const item of data) {
    maximumCount = Math.max(maximumCount, item.employee_count);
  }

  return (
    <div className="executive-heatmap-scroll">
      <div className="executive-heatmap">
        <span />
        {ageBands.map((ageBand) => <strong key={ageBand}>{ageBand}</strong>)}
        {tenureBands.map((tenureBand) => (
          <div className="executive-heatmap-row" key={tenureBand}>
            <b>{tenureBand}</b>
            {ageBands.map((ageBand) => {
              const item = cells.get(`${ageBand}|${tenureBand}`);
              const count = item?.employee_count ?? 0;
              const intensity = count === 0 || maximumCount === 0
                ? 0
                : Math.max(1, Math.ceil((count / maximumCount) * 4));

              const label = `${ageBand} age, ${tenureBand} years of service: ${count} ${count === 1 ? "employee" : "employees"}${item ? ` (${item.percentage}% of the workforce)` : ""}`;

              return (
                <HeatmapCell
                  className={`heat-level-${intensity}`}
                  key={ageBand}
                  label={label}
                >
                  {count}
                </HeatmapCell>
              );
            })}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Lower</span><i className="heat-level-1" /><i className="heat-level-2" /><i className="heat-level-3" /><i className="heat-level-4" /><span>Higher</span>
      </div>
    </div>
  );
}

export function GenderDonut() {
  const data = [
    { name: "Male", value: 52, color: colors.coral },
    { name: "Female", value: 48, color: colors.navy },
  ];
  return (
    <div className="donut-chart gender-donut">
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie animationDuration={420} data={data} dataKey="value" innerRadius="58%" outerRadius="84%" stroke="none">
            {data.map((item) => <Cell fill={item.color} key={item.name} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center"><strong>100</strong><span>people</span></div>
    </div>
  );
}

function SimpleBarChart({ data, max, ticks }: { data: { name: string; value: number }[]; max: number; ticks: number[] }) {
  return (
    <div className="chart-area chart-compact">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 5" vertical={false} />
          <XAxis {...axis} dataKey="name" />
          <YAxis {...axis} domain={[0, max]} ticks={ticks} />
          <Bar animationDuration={420} dataKey="value" fill={colors.coral} radius={[7, 7, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AgeBandChart() {
  return <SimpleBarChart data={[{name:"Under 25",value:8},{name:"25–34",value:22},{name:"35–44",value:26},{name:"45–54",value:24},{name:"55+",value:20}]} max={28} ticks={[0,7,14,21,28]} />;
}

export function TenureBandChart() {
  return <SimpleBarChart data={[{name:"< 2 years",value:4},{name:"2–5 years",value:8},{name:"11–20 years",value:31},{name:"20+ years",value:57}]} max={60} ticks={[0,15,30,45,60]} />;
}

export function QualityDonut() {
  const data = [
    { value: 75, color: colors.green },
    { value: 25, color: colors.grid },
  ];
  return (
    <div className="quality-donut">
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie animationDuration={420} data={data} dataKey="value" innerRadius="66%" outerRadius="88%" startAngle={90} endAngle={-270} stroke="none">
            {data.map((item) => <Cell fill={item.color} key={item.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="quality-center"><strong>75</strong><span>/100</span></div>
    </div>
  );
}

export function IssueBarChart() {
  const data = [
    { name: "Joined before age 18", value: 15 },
    { name: "Joining date is in the future", value: 1 },
  ];
  return (
    <div className="chart-area chart-quality">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, bottom: 0, left: 128 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 5" horizontal={false} />
          <XAxis {...axis} domain={[0, 24]} ticks={[0, 6, 12, 18, 24]} type="number" />
          <YAxis {...axis} dataKey="name" type="category" width={128} />
          <Bar animationDuration={420} dataKey="value" fill={colors.coral} radius={[0, 7, 7, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
