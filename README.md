# HR Workforce Intelligence

[![Next.js](https://img.shields.io/badge/Next.js-16-172028?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)](https://workforce-intelligence-three.vercel.app/)

An interactive HR workforce analytics and employee-data management proof of concept built from a 100-row employee master workbook.

The application turns static spreadsheet data into governed workforce metrics, responsive visualizations, lifecycle analysis, employee CRUD workflows, and validated Excel/CSV imports.

**[View the live demo](https://workforce-intelligence-three.vercel.app/)** 

## Why this project exists

Employee master spreadsheets are useful for storing records, but they make it difficult for HR leaders to quickly answer questions such as:

- Who makes up the workforce?
- Where are employees positioned?
- How experienced is the workforce?
- Which functions or locations have future retirement exposure?
- Which employee records support a dashboard result?
- Can a new Excel or CSV file be checked before it is connected to a data source?

This PoC connects those questions through six focused application areas instead of presenting a collection of unrelated charts.

## Product capabilities

### Customizable Executive Overview

- Select widgets from Overview, Workforce, Organization, Lifecycle, and Operations
- Drag and rearrange widgets
- Increase or decrease supported widget sizes
- Save the dashboard layout in browser storage
- Explore charts and accessible heatmap tooltips
- Present leadership-level workforce, experience, movement, and concentration signals

The widget catalogue currently contains **41 widgets**, verified across **112 supported size combinations** and **142 resize transitions**.

### Workforce Composition

- Function and designation distribution
- Direct and Indirect employee-group mix
- Gender representation by function
- Employee group by function
- Role breadth and leading designation within each function

### Organization and Location

- Workforce distribution by location
- Interactive function-by-location heatmap
- Organizational-unit and HRBP coverage measures
- Primary HRBP workload and workload distribution
- Multi-function and multi-location HRBP reach
- Organization-code fragmentation and support breadth

### Lifecycle and Retirement

- Average age, tenure, joining age, and expected retirement age
- Age and tenure distributions
- Joining cohorts and service anniversaries
- Retirement pipeline and planning horizons
- Retirement exposure by function, location, and designation
- Age-by-tenure heatmap
- Employee-level retirement, milestone, and lifecycle-anomaly lists

### Employee Explorer

- Search and filter the employee master
- Client-side pagination for the current PoC dataset
- Add, inspect, update, and delete employee records for the current browser session
- Export the filtered employee list

### Data Hub

- Upload `.xlsx` and `.csv` employee files
- Normalize supported source-header aliases
- Parse Excel serial dates and common text date formats
- Validate required fields and identify invalid rows
- Detect duplicate personnel numbers inside an uploaded file
- Preview up to 5,000 records locally without persistence

## Dataset understanding

The supplied workbook contains:

| Sheet    |                       Contents | Purpose                                           |
| -------- | -----------------------------: | ------------------------------------------------- |
| `Sheet`  | 100 employee rows × 27 columns | Employee master and analytical source             |
| `Sheet2` |            45 rows × 9 columns | Provisional field meanings and dashboard guidance |

The most reliable analytical dimensions are Personnel Number, Employee Group, Function, Location, Gender Key, lifecycle dates, and Designation Text.

Several fields—such as LP, ESgrp, PS Group, PA, Range, and organizational codes—are retained as source codes because their full business definitions require HR confirmation.

The dataset does **not** contain active/inactive status, salary, reporting hierarchy, skills, performance, attrition history, vacancies, or succession readiness. The dashboard therefore reports **employee records**, not guaranteed active headcount, and avoids unsupported workforce claims.

### Verified baseline

The following values are used as the initial verification baseline with an as-of date of **8 August 2026**:

| Measure                             |                    Result |
| ----------------------------------- | ------------------------: |
| Employee records                    |                       100 |
| Functions                           |                         5 |
| Locations                           |                         5 |
| Largest function                    |        Sales — 31 records |
| Largest location                    |       Jaipur — 26 records |
| Employee group mix                  | 56% Indirect · 44% Direct |
| Gender representation               |             57% F · 43% M |
| Average age                         |                34.2 years |
| Average tenure                      |                 9.4 years |
| Retirement exposure within 10 years |                 3 records |
| Retirement exposure within 15 years |                18 records |

The current frontend demo uses the smaller sample dataset in `lib/demo-data.ts`.

## Architecture

Next.js renders the application from typed local demo data. Employee edits and import previews remain in browser memory and reset on refresh.

```mermaid
flowchart LR
    Browser[Browser UI]
    Next[Next.js App Router]
    Components[React Components]
    Demo[Typed Demo Data]
    State[Browser Session State]

    Browser --> Next
    Next --> Components
    Demo --> Components
    Browser --> State
    State --> Components
```

### Analytical data flow

```text
Browser request
  → Next.js page
  → typed local demo data
  → React widget or Recharts visualization
```

The Executive Overview receives the same typed domain contracts as the other dashboards, keeping a future data-source integration isolated from chart components.

### Employee mutation flow

```text
Employee Explorer
  → React state
  → create, update, or delete for the current session
```

### Import flow

```text
Excel or CSV file
  → browser parsing and preview
  → local validation and duplicate checks
  → non-persistent import confirmation
```

## Technology stack

| Area                  | Technology                              |
| --------------------- | --------------------------------------- |
| Application framework | Next.js 16 App Router                   |
| UI runtime            | React 19                                |
| Language              | TypeScript 6                            |
| Demo data             | Typed local TypeScript fixtures         |
| Charts                | Recharts                                |
| Widget customization  | DnD Kit                                 |
| Validation            | Zod                                     |
| Spreadsheet parsing   | read-excel-file and csv-parse           |
| Icons                 | Lucide React                            |
| Styling               | Custom CSS design tokens and CSS Grid   |
| Typography            | Manrope and DM Sans through `next/font` |
| Testing               | Vitest and Playwright                   |
| Code quality          | ESLint                                  |
| Deployment            | Vercel                                  |

## Routes

| Route           | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `/`             | Customizable Executive Overview                        |
| `/workforce`    | Workforce composition and role distribution            |
| `/organization` | Location, organization-code, and HRBP analysis         |
| `/lifecycle`    | Age, tenure, milestones, and retirement exposure       |
| `/employees`    | Employee search, CRUD, filters, pagination, and export |
| `/data-hub`     | Excel/CSV validation, preview, and import              |

## Local development

### Prerequisites

- Node.js 20 or newer
- npm

### Installation

```bash
git clone https://github.com/Kaushiik-13/WorkforceIntelligence.git
cd WorkforceIntelligence
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation commands

```bash
npm run lint
npm run test
npm run build
```

The latest dashboard audit also verifies:

- Every supported widget size
- Resize controls in both directions
- Heatmap hover and keyboard-focus behavior
- Chart rendering and containment
- Desktop, tablet, and mobile page widths
- Next.js error-overlay and browser runtime errors

## Current PoC boundaries

- Authentication and authorization are not implemented
- Employee API routes are not protected by user roles
- Employee changes and imports are frontend-only and reset on refresh
- Dashboard layouts are stored per browser rather than per user
- The as-of date is fixed in parts of the current implementation
- Historical employee snapshots and workforce trends are not available
- Data Quality and Field Guide routes are deferred from the active PoC

## Production roadmap

The next production-focused phase should prioritize governance and security before adding more visualizations:

1. Choose a production data source and add role-based authorization
2. Add row-level access controls and PII masking
3. Normalize source columns into a governed snake_case employee model
4. Introduce raw, staging, core, history, and analytics data layers
5. Process large imports through private storage, a queue, and background workers
6. Add transactional merge, rollback, import history, and audit events
7. Move employee search, filtering, and pagination to the server
8. Store customizable dashboard layouts per authenticated user
9. Add materialized views, indexes, caching, monitoring, and broader automated tests

## Design approach

The interface uses a warm editorial dashboard style rather than a default enterprise-admin theme:

- Cream canvas and off-white surfaces
- Deep navy structure and coral emphasis
- Manrope headings with compact DM Sans interface text
- Rounded cards, restrained shadows, and subtle borders
- Consistent semantic chart colors
- Responsive bento-style layouts
- Accessible tooltips and keyboard-focus states
- Reduced-motion-aware transitions

## Author

Developed by [Kaushiik](https://github.com/Kaushiik-13) as an HR workforce analytics and full-stack engineering proof of concept.
