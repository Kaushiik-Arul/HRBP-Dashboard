import Link from "next/link";

import {
  DesignationBarChart,
  EmployeeGroupByFunctionChart,
  FunctionDistributionBarChart,
  GenderByFunctionChart,
} from "@/components/workforce-charts";
import { MetricCard, PageHeader, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";
import { demoWorkforce } from "@/lib/demo-data";

type CountShare = {
  employee_count: number;
  percentage: number;
};

type WorkforceComposition = {
  as_of_date: string;
  applied_filters: {
    designation: string | null;
    employee_group: string | null;
    function: string | null;
    gender: string | null;
    location: string | null;
  };
  record_counts: {
    filtered_records: number;
    total_records: number;
  };
  filter_options: {
    designations: string[];
    employee_groups: string[];
    functions: string[];
    genders: string[];
    locations: string[];
  };
  kpis: {
    distinct_designations: number;
    employee_group_mix: (CountShare & { employee_group: string })[];
    functions_represented: number;
    gender_representation: (CountShare & { gender_key: string })[];
    largest_designation: (CountShare & { designation: string }) | null;
    largest_function: (CountShare & { function_name: string }) | null;
    unclassified_records: number;
  };
  function_distribution: (CountShare & { function_name: string })[];
  designation_mix: (CountShare & { designation: string })[];
  gender_by_function: (CountShare & {
    function_name: string;
    function_total: number;
    gender_key: string;
  })[];
  employee_group_by_function: (CountShare & {
    employee_group: string;
    function_name: string;
    function_total: number;
  })[];
  role_breadth_by_function: {
    distinct_designations: number;
    dominant_designation: string;
    dominant_designation_count: number;
    dominant_designation_percentage: number;
    employee_count: number;
    function_name: string;
  }[];
  composition_completeness: {
    field_name: string;
    missing_count: number;
    percentage: number;
  }[];
  insights: {
    highest_direct_share: (CountShare & {
      function_name: string;
      function_total: number;
    }) | null;
    highest_role_concentration: {
      dominant_designation: string;
      dominant_designation_count: number;
      dominant_designation_percentage: number;
      function_name: string;
    } | null;
    largest_gender_variance: {
      difference_percentage_points: number;
      f_employee_count: number;
      f_percentage: number;
      function_name: string;
      function_total: number;
      overall_f_percentage: number;
    } | null;
    top_three_function_concentration: CountShare & {
      function_names: string[];
    };
    unclassified_records: CountShare;
  };
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const filterDefinitions = [
  { key: "function", label: "Function", optionKey: "functions" },
  { key: "location", label: "Location", optionKey: "locations" },
  { key: "employee_group", label: "Employee group", optionKey: "employee_groups" },
  { key: "gender", label: "Gender", optionKey: "genders" },
  { key: "designation", label: "Designation", optionKey: "designations" },
] as const;

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function formatAsOfDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function WorkforcePage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser();
  const params = await searchParams;
  const filters = {
    designation: firstValue(params.designation),
    employeeGroup: firstValue(params.employee_group),
    functionName: firstValue(params.function),
    gender: firstValue(params.gender),
    location: firstValue(params.location),
  };

  const workforce: WorkforceComposition = {
    ...demoWorkforce,
    applied_filters: {
      designation: filters.designation,
      employee_group: filters.employeeGroup,
      function: filters.functionName,
      gender: filters.gender,
      location: filters.location,
    },
  };
  const { insights, kpis, record_counts: counts } = workforce;
  const activeFilters = Object.entries(workforce.applied_filters).filter(([, value]) => value);
  const female = kpis.gender_representation.find((item) => item.gender_key === "F");
  const male = kpis.gender_representation.find((item) => item.gender_key === "M");
  const leadingGroup = kpis.employee_group_mix[0];
  return (
    <>
      <PageHeader
        action={
          <div className="live-pill">
            <span />
            {counts.filtered_records} of {counts.total_records} employees
          </div>
        }
        description="Compare representation, work classification, roles, and organizational spread across the employee master."
        eyebrow="Workforce composition"
        title="Who makes up the workforce"
      />

      <form className="workforce-filter-form" method="get">
        <div className="workforce-filter-heading">
          <div>
            <strong>Refine this view</strong>
            <span>Every metric and visual below uses the same selected population.</span>
          </div>
          <p>
            <strong>{counts.filtered_records}</strong> of {counts.total_records} records
          </p>
        </div>
        <div className="workforce-filter-grid">
          {filterDefinitions.map((filter) => {
            const currentValue =
              filter.key === "employee_group"
                ? filters.employeeGroup
                : filter.key === "function"
                  ? filters.functionName
                  : filters[filter.key];

            return (
              <label className="workforce-filter-control" key={filter.key}>
                <span>{filter.label}</span>
                <select aria-label={filter.label} defaultValue={currentValue ?? ""} name={filter.key}>
                  <option value="">All</option>
                  {workforce.filter_options[filter.optionKey].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
          <div className="workforce-filter-actions">
            <button className="action-button primary" type="submit">
              Apply filters
            </button>
            <Link className="action-button" href="/workforce">
              Reset
            </Link>
          </div>
        </div>
        {activeFilters.length > 0 ? (
          <div className="workforce-active-filters">
            <span>Active</span>
            {activeFilters.map(([key, value]) => (
              <b key={key}>{key.replaceAll("_", " ")}: {value}</b>
            ))}
          </div>
        ) : null}
      </form>

      <section className="workforce-kpi-bento workforce-metrics">
        <MetricCard
          label="Largest function"
          note={kpis.largest_function ? `${kpis.largest_function.employee_count} employees in this view` : "No classified records"}
          tone="coral"
          value={kpis.largest_function ? `${kpis.largest_function.function_name} · ${kpis.largest_function.percentage}%` : "—"}
        />
        <MetricCard
          label="Largest designation"
          note={kpis.largest_designation ? `${kpis.largest_designation.employee_count} employees share this role` : "No classified records"}
          tone="green"
          value={kpis.largest_designation ? `${kpis.largest_designation.designation} · ${kpis.largest_designation.percentage}%` : "—"}
        />
        <MetricCard
          label="Gender representation"
          note={`${female?.employee_count ?? 0} F · ${male?.employee_count ?? 0} M`}
          tone="yellow"
          value={female ? `${female.percentage}% F` : "—"}
        />
        <MetricCard
          label="Employee group mix"
          note={kpis.employee_group_mix.map((item) => `${item.employee_count} ${item.employee_group}`).join(" · ")}
          tone="coral"
          value={leadingGroup ? `${leadingGroup.percentage}% ${leadingGroup.employee_group}` : "—"}
        />
        <MetricCard
          label="Distinct designations"
          note="Nonblank roles represented in this view"
          tone="green"
          value={String(kpis.distinct_designations)}
        />
        <MetricCard
          label="Functions represented"
          note="Functions remaining after filters"
          value={String(kpis.functions_represented)}
        />
      </section>

      <section className="workforce-primary-grid workforce-bento-row">
        <Panel
          badge="100% within function"
          subtitle="F and M source codes shown as a share of each function"
          title="Gender representation by function"
        >
          <GenderByFunctionChart data={workforce.gender_by_function} />
        </Panel>
        <Panel
          badge="100% within function"
          subtitle="Direct and Indirect classification within each function"
          title="Employee group by function"
        >
          <EmployeeGroupByFunctionChart data={workforce.employee_group_by_function} />
        </Panel>
      </section>

      <section className="workforce-secondary-grid workforce-bento-row">
        <Panel
          badge={`${kpis.functions_represented} functions`}
          subtitle="Employee count and share of the current population"
          title="Function distribution"
        >
          <FunctionDistributionBarChart data={workforce.function_distribution} />
        </Panel>
        <Panel
          badge={`${kpis.distinct_designations} roles`}
          subtitle="Ranked designation mix in the current population"
          title="Designation distribution"
        >
          <DesignationBarChart data={workforce.designation_mix} />
        </Panel>
      </section>

      <section className="workforce-detail-grid">
        <Panel
          subtitle="Role variety and the leading designation within each function"
          title="Role breadth by function"
        >
          <div className="table-scroll">
            <table className="data-table workforce-role-table">
              <thead>
                <tr>
                  <th>Function</th>
                  <th>Employees</th>
                  <th>Roles</th>
                  <th>Largest role</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {workforce.role_breadth_by_function.map((item) => (
                  <tr key={item.function_name}>
                    <td><strong>{item.function_name}</strong></td>
                    <td>{item.employee_count}</td>
                    <td>{item.distinct_designations}</td>
                    <td>{item.dominant_designation} ({item.dominant_designation_count})</td>
                    <td>{item.dominant_designation_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <section className="insight-brief-card workforce-insight-brief">
          <div className="insight-brief-header">
            <p>Composition note</p>
            <span>As of {formatAsOfDate(workforce.as_of_date)}</span>
          </div>
          <div className="workforce-insight-copy">
            {insights.highest_direct_share ? (
              <p>
                <strong>{insights.highest_direct_share.function_name}</strong> has the highest Direct share at{" "}
                <strong>{insights.highest_direct_share.percentage}%</strong> ({insights.highest_direct_share.employee_count} of {insights.highest_direct_share.function_total}).
              </p>
            ) : null}
            {insights.largest_gender_variance ? (
              <p>
                <strong>{insights.largest_gender_variance.function_name}</strong> has the largest F-code variance: <strong>{insights.largest_gender_variance.f_percentage}%</strong>, {insights.largest_gender_variance.difference_percentage_points} points from the filtered average.
              </p>
            ) : null}
            {insights.highest_role_concentration ? (
              <p>
                Role concentration is highest in <strong>{insights.highest_role_concentration.function_name}</strong>, where <strong>{insights.highest_role_concentration.dominant_designation}</strong> represents {insights.highest_role_concentration.dominant_designation_percentage}%.
              </p>
            ) : null}
            <p>
              The top three functions account for <strong>{insights.top_three_function_concentration.percentage}%</strong> of employees, while <strong>{insights.unclassified_records.employee_count}</strong> records are unclassified.
            </p>
          </div>
        </section>
      </section>

    </>
  );
}
