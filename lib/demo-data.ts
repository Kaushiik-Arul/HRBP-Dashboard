import type {
  LifecycleOverviewData,
  OrganizationOverviewData,
  WorkforceCompositionData,
} from "@/lib/dashboard-types";

const functions = ["Engineering", "Operations", "Sales", "People"];
const locations = ["London", "Manchester", "Bristol"];

export const demoEmployees = [
  { id: "demo-1", personnel_number: "1001", employee_group: "Permanent", function_name: "Engineering", location_name: "London", gender_key: "F", birth_date: "1990-04-12", joining_date: "2018-06-04", retirement_date: "2057-04-12", designation: "Software Engineer" },
  { id: "demo-2", personnel_number: "1002", employee_group: "Permanent", function_name: "Operations", location_name: "Manchester", gender_key: "M", birth_date: "1984-09-23", joining_date: "2012-02-13", retirement_date: "2051-09-23", designation: "Operations Manager" },
  { id: "demo-3", personnel_number: "1003", employee_group: "Contract", function_name: "Sales", location_name: "London", gender_key: "F", birth_date: "1995-01-17", joining_date: "2024-03-18", retirement_date: "2062-01-17", designation: "Account Executive" },
  { id: "demo-4", personnel_number: "1004", employee_group: "Permanent", function_name: "People", location_name: "Bristol", gender_key: "F", birth_date: "1978-07-08", joining_date: "2008-11-10", retirement_date: "2045-07-08", designation: "HR Business Partner" },
  { id: "demo-5", personnel_number: "1005", employee_group: "Permanent", function_name: "Engineering", location_name: "Manchester", gender_key: "M", birth_date: "1988-12-01", joining_date: "2016-08-22", retirement_date: "2055-12-01", designation: "Engineering Lead" },
  { id: "demo-6", personnel_number: "1006", employee_group: "Contract", function_name: "Operations", location_name: "Bristol", gender_key: "M", birth_date: "1992-05-30", joining_date: "2023-01-09", retirement_date: "2059-05-30", designation: "Operations Analyst" },
];

export const demoWorkforce: WorkforceCompositionData & {
  applied_filters: Record<string, string | null>;
  filter_options: { designations: string[]; employee_groups: string[]; functions: string[]; genders: string[]; locations: string[] };
  composition_completeness: { field_name: string; missing_count: number; percentage: number }[];
} = {
  as_of_date: "2026-08-31",
  applied_filters: { designation: null, employee_group: null, function: null, gender: null, location: null },
  filter_options: { designations: ["Account Executive", "Engineering Lead", "HR Business Partner", "Operations Analyst", "Operations Manager", "Software Engineer"], employee_groups: ["Contract", "Permanent"], functions, genders: ["F", "M"], locations },
  record_counts: { filtered_records: 6, total_records: 6 },
  kpis: {
    distinct_designations: 6,
    employee_group_mix: [{ employee_group: "Permanent", employee_count: 4, percentage: 66.7 }, { employee_group: "Contract", employee_count: 2, percentage: 33.3 }],
    functions_represented: 4,
    gender_representation: [{ gender_key: "F", employee_count: 3, percentage: 50 }, { gender_key: "M", employee_count: 3, percentage: 50 }],
    largest_designation: { designation: "Software Engineer", employee_count: 1, percentage: 16.7 },
    largest_function: { function_name: "Engineering", employee_count: 2, percentage: 33.3 },
    unclassified_records: 0,
  },
  function_distribution: [
    { function_name: "Engineering", employee_count: 2, percentage: 33.3 },
    { function_name: "Operations", employee_count: 2, percentage: 33.3 },
    { function_name: "Sales", employee_count: 1, percentage: 16.7 },
    { function_name: "People", employee_count: 1, percentage: 16.7 },
  ],
  designation_mix: [
    "Software Engineer", "Operations Manager", "Account Executive", "HR Business Partner", "Engineering Lead", "Operations Analyst",
  ].map((designation) => ({ designation, employee_count: 1, percentage: 16.7 })),
  gender_by_function: functions.flatMap((function_name) => [
    { function_name, function_total: function_name === "Engineering" || function_name === "Operations" ? 2 : 1, gender_key: "F", employee_count: function_name === "Engineering" || function_name === "Sales" || function_name === "People" ? 1 : 0, percentage: function_name === "Engineering" ? 50 : function_name === "Operations" ? 0 : 100 },
    { function_name, function_total: function_name === "Engineering" || function_name === "Operations" ? 2 : 1, gender_key: "M", employee_count: function_name === "Engineering" ? 1 : function_name === "Operations" ? 2 : 0, percentage: function_name === "Engineering" ? 50 : function_name === "Operations" ? 100 : 0 },
  ]),
  employee_group_by_function: functions.flatMap((function_name) => [
    { employee_group: "Permanent", function_name, function_total: function_name === "Engineering" || function_name === "Operations" ? 2 : 1, employee_count: function_name === "Engineering" ? 2 : function_name === "Operations" ? 1 : function_name === "People" ? 1 : 0, percentage: function_name === "Engineering" || function_name === "People" ? 100 : function_name === "Operations" ? 50 : 0 },
    { employee_group: "Contract", function_name, function_total: function_name === "Engineering" || function_name === "Operations" ? 2 : 1, employee_count: function_name === "Operations" || function_name === "Sales" ? 1 : 0, percentage: function_name === "Operations" ? 50 : function_name === "Sales" ? 100 : 0 },
  ]),
  role_breadth_by_function: functions.map((function_name) => ({ distinct_designations: function_name === "Engineering" || function_name === "Operations" ? 2 : 1, dominant_designation: function_name === "Engineering" ? "Software Engineer" : function_name === "Operations" ? "Operations Manager" : function_name === "Sales" ? "Account Executive" : "HR Business Partner", dominant_designation_count: 1, dominant_designation_percentage: function_name === "Engineering" || function_name === "Operations" ? 50 : 100, employee_count: function_name === "Engineering" || function_name === "Operations" ? 2 : 1, function_name })),
  composition_completeness: ["Function", "Location", "Gender", "Designation"].map((field_name) => ({ field_name, missing_count: 0, percentage: 100 })),
  insights: {
    highest_direct_share: { function_name: "Engineering", function_total: 2, employee_count: 2, percentage: 100 },
    highest_role_concentration: { dominant_designation: "Account Executive", dominant_designation_count: 1, dominant_designation_percentage: 100, function_name: "Sales" },
    largest_gender_variance: { difference_percentage_points: 50, f_employee_count: 0, f_percentage: 0, function_name: "Operations", function_total: 2, overall_f_percentage: 50 },
    top_three_function_concentration: { employee_count: 5, percentage: 83.3, function_names: ["Engineering", "Operations", "Sales"] },
    unclassified_records: { employee_count: 0, percentage: 0 },
  },
};

export const demoOrganization: OrganizationOverviewData & {
  applied_filters: Record<string, string | null>;
  filter_options: { functions: string[]; locations: string[] };
} = {
  applied_filters: { function: null, location: null },
  filter_options: { functions, locations },
  record_counts: { filtered_records: 6, total_records: 6 },
  kpis: { assignment_gaps: 0, average_primary_hrbp_workload: 3, locations: 3, multi_function_hrbps: 2, multi_location_hrbps: 2, organizational_units: 4, primary_hrbps: 2, secondary_hrbps: 1, unique_hrbp_pairs: 2 },
  workload_statistics: { average: 3, coefficient_of_variation: 0, maximum: 3, median: 3, minimum: 3 },
  location_distribution: [{ location_name: "London", employee_count: 2, percentage: 33.3 }, { location_name: "Manchester", employee_count: 2, percentage: 33.3 }, { location_name: "Bristol", employee_count: 2, percentage: 33.3 }],
  function_location_matrix: functions.flatMap((function_name) => locations.map((location_name) => { const employee_count = demoEmployees.filter((employee) => employee.function_name === function_name && employee.location_name === location_name).length; return { employee_count, function_name, function_percentage: employee_count * 50, location_name, location_percentage: employee_count * 50 }; })),
  hrbp_workload: [{ hrbp_label: "Jordan Lee", employee_count: 3 }, { hrbp_label: "Morgan Shah", employee_count: 3 }],
  hrbp_workload_distribution: [{ display_order: 1, employee_count: 6, hrbp_count: 2, hrbp_percentage: 100, workload_band: "1-50" }],
  hrbp_breadth: [{ employee_count: 3, function_count: 3, hrbp_label: "Jordan Lee", location_count: 2 }, { employee_count: 3, function_count: 3, hrbp_label: "Morgan Shah", location_count: 2 }],
  organization_fragmentation: [{ distinct_values: 4, field_name: "Function", fragmentation_percentage: 66.7 }, { distinct_values: 3, field_name: "Location", fragmentation_percentage: 50 }],
  insights: { assignment_gaps: 0, broadest_hrbp: { employee_count: 3, function_count: 3, hrbp_label: "Jordan Lee", location_count: 2 }, hrbp_workload: { average: 3, maximum: 3, median: 3, minimum: 3 }, largest_location: { employee_count: 2, location_name: "London", percentage: 33.3 }, strongest_site_specialization: { employee_count: 1, function_name: "People", location_name: "Bristol", location_total: 2, percentage: 50 } },
};

export const demoLifecycle: LifecycleOverviewData & {
  anomaly_summary: { anomaly_records: number; joining_age_below_18: number; missing_lifecycle_dates: number; past_retirement_dates: number };
  applied_filters: Record<string, string | null>;
  experience_at_risk_by_function: { average_tenure_years: number; exposed_count: number; function_name: string; total_tenure_years: number }[];
  filter_options: { designations: string[]; employee_groups: string[]; functions: string[]; genders: string[]; locations: string[] };
} = {
  age_distribution: [{ age_band: "25-34", employee_count: 2, percentage: 33.3 }, { age_band: "35-44", employee_count: 2, percentage: 33.3 }, { age_band: "45-54", employee_count: 2, percentage: 33.3 }],
  age_tenure_matrix: [{ age_band: "25-34", tenure_band: "0-4", employee_count: 2 }, { age_band: "35-44", tenure_band: "5-9", employee_count: 2 }, { age_band: "45-54", tenure_band: "15-19", employee_count: 2 }],
  anniversary_summary: [{ employee_count: 1, milestone_years: 10 }, { employee_count: 1, milestone_years: 20 }],
  anomaly_summary: { anomaly_records: 0, joining_age_below_18: 0, missing_lifecycle_dates: 0, past_retirement_dates: 0 },
  applied_filters: { designation: null, employee_group: null, function: null, gender: null, location: null },
  as_of_date: "2026-08-31",
  employee_lists: { lifecycle_anomalies: [], retirement_exposed: [{ designation: "HR Business Partner", function_name: "People", location_name: "Bristol", personnel_number: "1004", retirement_date: "2045-07-08", tenure_years: 17 }], service_anniversaries: [{ designation: "Engineering Lead", function_name: "Engineering", location_name: "Manchester", personnel_number: "1005", anniversary_date: "2026-08-22", milestone_years: 10 }] },
  experience_at_risk_by_function: [{ average_tenure_years: 17, exposed_count: 1, function_name: "People", total_tenure_years: 17 }],
  filter_options: { designations: demoWorkforce.filter_options.designations, employee_groups: ["Contract", "Permanent"], functions, genders: ["F", "M"], locations },
  insights: { highest_exposure_rate_function: { function_name: "People", employee_count: 1, exposed_count: 1, exposed_rate: 100 }, largest_exposed_function: { function_name: "People", employee_count: 1, exposed_count: 1, exposed_rate: 100 }, largest_joining_cohort: { employee_count: 1, joining_year: 2024 } },
  joining_cohorts: [{ employee_count: 1, joining_year: 2008 }, { employee_count: 1, joining_year: 2012 }, { employee_count: 1, joining_year: 2016 }, { employee_count: 1, joining_year: 2018 }, { employee_count: 1, joining_year: 2023 }, { employee_count: 1, joining_year: 2024 }],
  kpis: { average_age: 40.7, average_age_at_joining: 29.8, average_expected_retirement_age: 67, average_tenure: 9.2, lifecycle_anomaly_records: 0, retirement_exposure_1_year: 0, retirement_exposure_3_years: 0, retirement_exposure_5_years: 0, retirement_exposure_10_years: 0, retirement_exposure_15_years: 1, service_milestones: 1, valid_joining_age_records: 6 },
  record_counts: { filtered_records: 6, total_records: 6 },
  retirement_by_designation: [{ designation: "HR Business Partner", employee_count: 1, exposed_count: 1, exposed_rate: 100 }],
  retirement_by_function: functions.map((function_name) => ({ function_name, employee_count: function_name === "Engineering" || function_name === "Operations" ? 2 : 1, exposed_count: function_name === "People" ? 1 : 0, exposed_rate: function_name === "People" ? 100 : 0 })),
  retirement_by_location: locations.map((location_name) => ({ location_name, employee_count: 2, exposed_count: location_name === "Bristol" ? 1 : 0, exposed_rate: location_name === "Bristol" ? 50 : 0 })),
  retirement_pipeline: [{ employee_count: 0, horizon_band: "0-5 years", percentage: 0 }, { employee_count: 0, horizon_band: "6-10 years", percentage: 0 }, { employee_count: 1, horizon_band: "11-15 years", percentage: 16.7 }],
  selected_retirement_horizon: 15,
  selected_year: 2026,
  tenure_distribution: [{ tenure_band: "0-4", employee_count: 2, percentage: 33.3 }, { tenure_band: "5-9", employee_count: 2, percentage: 33.3 }, { tenure_band: "10-19", employee_count: 2, percentage: 33.3 }],
};

export const demoOverview = {
  as_of_date: "2026-08-31",
  kpis: { employee_records: 6, function_count: 4, location_count: 3, average_age: 40.7, average_tenure: 9.2, retirement_exposure_5_years: 0, quality_issue_records: 0 },
  workforce_by_function: demoWorkforce.function_distribution,
  workforce_by_location: demoOrganization.location_distribution,
  employee_group_mix: demoWorkforce.kpis.employee_group_mix,
  age_tenure_matrix: demoLifecycle.age_tenure_matrix.map((item) => ({ ...item, percentage: 33.3 })),
  insights: { largest_function: demoWorkforce.kpis.largest_function!, largest_location: demoOrganization.insights.largest_location!, majority_employee_group: demoWorkforce.kpis.employee_group_mix[0], experienced_workforce: { employee_count: 2, percentage: 33.3 }, trust_qualifier: { quality_issue_records: 0, quality_issue_rate: 0 } },
};

export const demoSupplement = {
  as_of_date: "2026-08-31",
  gender_balance: demoWorkforce.kpis.gender_representation,
  recent_joiners: { percentage: 33.3, employee_count: 2 },
  retirement_exposure_10_years: { percentage: 0, employee_count: 0 },
  top_three_function_concentration: demoWorkforce.insights.top_three_function_concentration,
};