import { AlertTriangle, Network } from "lucide-react";
import Link from "next/link";

import { LocationBarChart } from "@/components/charts";
import { HeatmapCell } from "@/components/heatmap-cell";
import {
  HrbpWorkloadChart,
  HrbpWorkloadDistributionChart,
} from "@/components/organization-charts";
import { MetricCard, PageHeader, Panel } from "@/components/ui";
import { demoOrganization } from "@/lib/demo-data";

type OrganizationOverview = {
  applied_filters: {
    function: string | null;
    location: string | null;
  };
  filter_options: {
    functions: string[];
    locations: string[];
  };
  record_counts: {
    filtered_records: number;
    total_records: number;
  };
  kpis: {
    assignment_gaps: number;
    average_primary_hrbp_workload: number | null;
    locations: number;
    multi_function_hrbps: number;
    multi_location_hrbps: number;
    organizational_units: number;
    primary_hrbps: number;
    secondary_hrbps: number;
    unique_hrbp_pairs: number;
  };
  workload_statistics: {
    average: number | null;
    coefficient_of_variation: number | null;
    maximum: number | null;
    median: number | null;
    minimum: number | null;
  };
  location_distribution: {
    employee_count: number;
    location_name: string;
    percentage: number;
  }[];
  function_location_matrix: {
    employee_count: number;
    function_name: string;
    function_percentage: number;
    location_name: string;
    location_percentage: number;
  }[];
  hrbp_workload: {
    employee_count: number;
    hrbp_label: string;
  }[];
  hrbp_workload_distribution: {
    display_order: number;
    employee_count: number;
    hrbp_count: number;
    hrbp_percentage: number;
    workload_band: string;
  }[];
  hrbp_breadth: {
    employee_count: number;
    function_count: number;
    hrbp_label: string;
    location_count: number;
  }[];
  organization_fragmentation: {
    distinct_values: number;
    field_name: string;
    fragmentation_percentage: number;
  }[];
  insights: {
    assignment_gaps: number;
    broadest_hrbp: {
      employee_count: number;
      function_count: number;
      hrbp_label: string;
      location_count: number;
    } | null;
    hrbp_workload: {
      average: number | null;
      maximum: number | null;
      median: number | null;
      minimum: number | null;
    };
    largest_location: {
      employee_count: number;
      location_name: string;
      percentage: number;
    } | null;
    strongest_site_specialization: {
      employee_count: number;
      function_name: string;
      location_name: string;
      location_total: number;
      percentage: number;
    } | null;
  };
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function heatTone(value: number, maximum: number) {
  if (value === 0 || maximum === 0) return "heat-level-0";
  const ratio = value / maximum;
  if (ratio <= 0.25) return "heat-level-1";
  if (ratio <= 0.5) return "heat-level-2";
  if (ratio <= 0.75) return "heat-level-3";
  return "heat-level-4";
}

export default async function OrganizationPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = {
    functionName: firstValue(params.function),
    location: firstValue(params.location),
  };

  const organization: OrganizationOverview = {
    ...demoOrganization,
    applied_filters: { function: filters.functionName, location: filters.location },
  };
  const { insights, kpis, record_counts: counts } = organization;
  const activeFilters = Object.entries(organization.applied_filters).filter(([, value]) => value);
  const matrixFunctions = [...new Set(organization.function_location_matrix.map((item) => item.function_name))];
  const matrixLocations = [...new Set(organization.function_location_matrix.map((item) => item.location_name))];
  const matrix = new Map(
    organization.function_location_matrix.map((item) => [
      `${item.function_name}::${item.location_name}`,
      item,
    ]),
  );
  const maximumMatrixCount = Math.max(
    0,
    ...organization.function_location_matrix.map((item) => item.employee_count),
  );

  return (
    <>
      <PageHeader
        action={
          <div className="live-pill">
            <span />
            {counts.filtered_records} of {counts.total_records} employees
          </div>
        }
        description="Understand geographic concentration, organization-code fragmentation, and the shape of HRBP support assignments."
        eyebrow="Organization & location"
        title="Where the workforce sits"
      />

      <form className="workforce-filter-form" method="get">
        <div className="workforce-filter-heading">
          <div>
            <strong>Refine this view</strong>
            <span>Both filters update every metric and visual on this page.</span>
          </div>
          <p><strong>{counts.filtered_records}</strong> of {counts.total_records} records</p>
        </div>
        <div className="organization-filter-grid">
          <label className="workforce-filter-control">
            <span>Function</span>
            <select aria-label="Function" defaultValue={filters.functionName ?? ""} name="function">
              <option value="">All</option>
              {organization.filter_options.functions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="workforce-filter-control">
            <span>Location</span>
            <select aria-label="Location" defaultValue={filters.location ?? ""} name="location">
              <option value="">All</option>
              {organization.filter_options.locations.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <div className="workforce-filter-actions">
            <button className="action-button primary" type="submit">Apply filters</button>
            <Link className="action-button" href="/organization">Reset</Link>
          </div>
        </div>
        {activeFilters.length > 0 ? (
          <div className="workforce-active-filters">
            <span>Active</span>
            {activeFilters.map(([key, value]) => <b key={key}>{key}: {value}</b>)}
          </div>
        ) : null}
        <p className="organization-scope-summary">
          Showing <strong>{counts.filtered_records}</strong> employees
          {filters.functionName ? <> in <strong>{filters.functionName}</strong></> : null}
          {filters.location ? <> at <strong>{filters.location}</strong></> : <> across <strong>{kpis.locations}</strong> locations</>}.
        </p>
      </form>

      <section className="organization-kpi-bento organization-metrics">
        <MetricCard label="Locations" note="Locations represented in this view" value={String(kpis.locations)} />
        <MetricCard
          label="Organizational units"
          note={`${kpis.organizational_units} distinct source codes`}
          tone="coral"
          value={String(kpis.organizational_units)}
        />
        <MetricCard
          label="Primary HRBPs"
          note="Distinct masked primary assignments"
          tone="green"
          value={String(kpis.primary_hrbps)}
        />
        <MetricCard
          label="Average primary workload"
          note="Employees per primary HRBP"
          tone="yellow"
          value={kpis.average_primary_hrbp_workload?.toFixed(1) ?? "—"}
        />
        <MetricCard
          label="Unique HRBP pairs"
          note={`${kpis.secondary_hrbps} secondary HRBPs represented`}
          tone="green"
          value={String(kpis.unique_hrbp_pairs)}
        />
        <MetricCard
          label="Assignment gaps"
          note="Employees missing either HRBP assignment"
          tone={kpis.assignment_gaps > 0 ? "coral" : "navy"}
          value={String(kpis.assignment_gaps)}
        />
      </section>

      <section className="organization-primary-grid">
        <Panel
          badge={`${kpis.locations} locations`}
          subtitle="Distinct employees grouped by location"
          title="Workforce by location"
        >
          <LocationBarChart
            data={organization.location_distribution}
            filterFunction={filters.functionName}
            interactive
          />
          <p className="chart-interaction-hint">Select a bar to filter the page to that location.</p>
        </Panel>

        <Panel
          badge="Count in each cell"
          subtitle="Read across a function or down a location to spot concentration"
          title="Function × location footprint"
        >
          {matrixFunctions.length > 0 && matrixLocations.length > 0 ? (
            <>
              <div className="heatmap-scroll">
                <div
                  className="location-heatmap"
                  style={{
                    gridTemplateColumns: `100px repeat(${matrixLocations.length}, minmax(62px, 1fr))`,
                    minWidth: `${100 + matrixLocations.length * 74}px`,
                  }}
                >
                  <strong />
                  {matrixLocations.map((location) => <strong key={location}>{location}</strong>)}
                  {matrixFunctions.map((functionName) => (
                    <div className="heatmap-row" key={functionName}>
                      <b>{functionName}</b>
                      {matrixLocations.map((location) => {
                        const item = matrix.get(`${functionName}::${location}`);
                        const count = item?.employee_count ?? 0;
                        const label = `${functionName} in ${location}: ${count} employees · ${item?.function_percentage ?? 0}% of function · ${item?.location_percentage ?? 0}% of location`;

                        return (
                          <HeatmapCell
                            ariaLabel={count > 0
                              ? `Filter to ${functionName} in ${location}, ${count} employees`
                              : `${functionName} in ${location}, no employees`}
                            className={`${heatTone(count, maximumMatrixCount)}${count > 0 ? " interactive-heat-cell" : ""}`}
                            href={count > 0 ? `/organization?function=${encodeURIComponent(functionName)}&location=${encodeURIComponent(location)}` : undefined}
                            key={location}
                            label={label}
                          >
                            {count}
                          </HeatmapCell>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="heatmap-legend">
                <span>Lower</span><i className="heat-level-1" /><i className="heat-level-2" />
                <i className="heat-level-3" /><i className="heat-level-4" /><span>Higher</span>
              </div>
              <p className="chart-interaction-hint">Select a filled cell to filter by its function and location.</p>
            </>
          ) : <div className="chart-empty-state">No location intersections match these filters.</div>}
        </Panel>
      </section>

      <section className="organization-detail-bento">
        <div className="organization-detail-column">
          <Panel
            badge={`Average ${organization.workload_statistics.average ?? "—"}`}
            subtitle="The 12 busiest masked primary assignments"
            title="Primary HRBP workload"
          >
            <HrbpWorkloadChart average={organization.workload_statistics.average} data={organization.hrbp_workload} />
            <p className="table-note">The dashed line is the overall average: filtered employees ÷ primary HRBPs. This measures coverage, not performance.</p>
          </Panel>

          <Panel
            badge={`${kpis.primary_hrbps} primary HRBPs`}
            subtitle="How assignment volume and organizational reach are distributed"
            title="HRBP coverage pattern"
          >
            <div className="organization-coverage-summary">
              <article>
                <span>Multi-function HRBPs</span>
                <strong>{kpis.multi_function_hrbps}<small>{kpis.primary_hrbps > 0 ? `${((kpis.multi_function_hrbps / kpis.primary_hrbps) * 100).toFixed(1)}%` : "0%"}</small></strong>
                <p>Support employees across more than one function</p>
              </article>
              <article>
                <span>Multi-location HRBPs</span>
                <strong>{kpis.multi_location_hrbps}<small>{kpis.primary_hrbps > 0 ? `${((kpis.multi_location_hrbps / kpis.primary_hrbps) * 100).toFixed(1)}%` : "0%"}</small></strong>
                <p>Support employees across more than one location</p>
              </article>
            </div>
            <HrbpWorkloadDistributionChart data={organization.hrbp_workload_distribution} />
            <p className="table-note">Bands count primary HRBPs by assigned employees in the current filter context.</p>
          </Panel>

          <Panel
            className="fragmentation-panel"
            subtitle="High uniqueness makes these fields poor executive grouping dimensions"
            title="Organization-code fragmentation"
          >
            <div className="fragmentation-grid">
              {organization.organization_fragmentation.map((item) => (
                <article key={item.field_name}>
                  <div><Network size={16} /><span>{item.field_name}</span></div>
                  <strong>{item.fragmentation_percentage}<small>% unique</small></strong>
                  <span className="fragment-track"><i style={{ width: `${item.fragmentation_percentage}%` }} /></span>
                  <p>{item.distinct_values} distinct values across {counts.filtered_records} records</p>
                </article>
              ))}
            </div>
            <div className="governance-note">
              <AlertTriangle size={16} />
              <p><strong>Interpret carefully</strong>These are source-code fragmentation measures, not a confirmed reporting hierarchy.</p>
            </div>
          </Panel>
        </div>

        <div className="organization-detail-column">
          <Panel
            badge="Top 12"
            subtitle="How widely each masked primary HRBP spans the organization"
            title="HRBP support breadth"
          >
            <div className="table-scroll organization-table-scroll">
              <table className="data-table organization-hrbp-table">
                <thead><tr><th>HRBP</th><th>Employees</th><th>Functions</th><th>Locations</th></tr></thead>
                <tbody>
                  {organization.hrbp_breadth.map((item) => (
                    <tr key={item.hrbp_label}>
                      <td><strong>{item.hrbp_label}</strong></td>
                      <td>{item.employee_count}</td>
                      <td>{item.function_count}</td>
                      <td>{item.location_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="table-note">Labels are generated inside the database so source HRBP identifiers are not exposed.</p>
          </Panel>

          <article className="insight-brief-card organization-insight-brief">
            <p className="page-eyebrow">Organization note</p>
            <h2>{insights.largest_location ? `${insights.largest_location.location_name} is the largest location` : "No location concentration available"}</h2>
            <div className="organization-insight-copy">
              {insights.largest_location ? (
                <p><strong>{insights.largest_location.employee_count} employees ({insights.largest_location.percentage}%)</strong> are based in {insights.largest_location.location_name}.</p>
              ) : null}
              {insights.strongest_site_specialization ? (
                <p><strong>{insights.strongest_site_specialization.function_name}</strong> is the strongest local specialization in {insights.strongest_site_specialization.location_name}, accounting for <strong>{insights.strongest_site_specialization.percentage}%</strong> of that site.</p>
              ) : null}
              {insights.broadest_hrbp ? (
                <p><strong>{insights.broadest_hrbp.hrbp_label}</strong> has the broadest support footprint: {insights.broadest_hrbp.employee_count} employees across {insights.broadest_hrbp.function_count} functions and {insights.broadest_hrbp.location_count} locations.</p>
              ) : null}
              <p>Primary workload ranges from <strong>{insights.hrbp_workload.minimum ?? "—"}</strong> to <strong>{insights.hrbp_workload.maximum ?? "—"}</strong> employees, with an average of <strong>{insights.hrbp_workload.average ?? "—"}</strong>. <strong>{insights.assignment_gaps}</strong> records have an HRBP assignment gap.</p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
