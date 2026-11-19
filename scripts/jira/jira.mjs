#!/usr/bin/env node
// Zero-dependency Jira tooling for the LiveVitals backlog.
// Offline CSV building is pure and exported for ./jira.test.mjs; the network
// commands only run from the CLI.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "../..");
export const BACKLOG_PATH = join(HERE, "backlog.json");
export const STATE_PATH = join(HERE, ".state.json");
export const OUT_DIR = join(HERE, "out");
const COMMIT_URL = "https://github.com/himanishpuri/livevitals/commit/";

const BASE_COLUMNS = [
  "Issue Id",
  "Work Type",
  "Summary",
  "Description",
  "Status",
  "Resolution",
  "Created",
  "Updated",
  "Resolved",
  "Due Date",
  "Assignee",
  "Reporter",
  "Parent",
  "Sprint",
  "Story Points",
  "Original Estimate",
  "Time Spent",
];

// ---------------------------------------------------------------- pure part

export function quoteCsv(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function csvLine(values) {
  return values.map(quoteCsv).join(",");
}

export function hoursToSeconds(hours) {
  if (hours === null || hours === undefined || hours === "") return "";
  return Math.round(hours * 3600);
}

export function issueCostInr(issue, rateInrPerHour) {
  return Math.round((issue.spentH ?? 0) * rateInrPerHour * 100) / 100;
}

// Epic cost = its own work plus every descendant (children and their sub-tasks).
export function epicCostInr(ref, issues, rateInrPerHour) {
  let total = 0;
  for (const child of issues) {
    if (child.parent !== ref) continue;
    total +=
      issueCostInr(child, rateInrPerHour) +
      epicCostInr(child.ref, issues, rateInrPerHour);
  }
  return Math.round(total * 100) / 100;
}

export function orderedIssues(backlog) {
  const epics = backlog.issues.filter((issue) => issue.type === "Epic");
  const rest = backlog.issues.filter((issue) => issue.type !== "Epic");
  return [...epics, ...rest];
}

export function sprintTotals(backlog) {
  return backlog.sprints.map((sprint) => {
    const inSprint = backlog.issues.filter(
      (issue) => issue.sprint === sprint.ref,
    );
    const storyPoints = inSprint
      .filter((issue) => issue.type !== "Sub-task" && issue.status === "Done")
      .reduce((sum, issue) => sum + (issue.storyPoints ?? 0), 0);
    return { sprint: sprint.ref, issues: inSprint.length, storyPoints };
  });
}

function worklogFor(issue, accountId) {
  if (issue.status !== "Done" || !issue.resolved || !issue.spentH) return null;
  return `Work on ${issue.summary};${issue.resolved.slice(0, 10)} 11:00;${accountId};${hoursToSeconds(issue.spentH)}`;
}

function commentsFor(issue, accountId) {
  return (issue.commits ?? []).map(
    (sha) =>
      `${issue.resolved ?? ""};${accountId};Implemented in ${COMMIT_URL}${sha}`,
  );
}

// Row plan: Issue Id comes from the full backlog order, so a subset keeps the
// same ids and Parent cells still resolve inside the generated file.
export function planRows(backlog, state = {}, issueIdOverrides = null) {
  const issues = orderedIssues(backlog);
  const idByRef = new Map(issues.map((issue, index) => [issue.ref, index + 1]));
  const sprintIds = state.sprints ?? {};
  const accountId = state.accountId ?? "";
  return issues.map((issue) => ({
    issue,
    issueId: issueIdOverrides?.get(issue.ref) ?? idByRef.get(issue.ref),
    parentId: issue.parent
      ? (issueIdOverrides?.get(issue.parent) ?? idByRef.get(issue.parent) ?? "")
      : "",
    sprintId: issue.sprint ? (sprintIds[issue.sprint] ?? "") : "",
    accountId,
    cost:
      issue.type === "Epic"
        ? epicCostInr(issue.ref, issues, backlog.rateInrPerHour)
        : issueCostInr(issue, backlog.rateInrPerHour),
    worklog: worklogFor(issue, accountId),
    comments: commentsFor(issue, accountId),
  }));
}

function padGroup(values, size) {
  const out = values.slice(0, size);
  while (out.length < size) out.push("");
  return out;
}

export function buildCsv(
  backlog,
  state = {},
  refs = null,
  issueIdOverrides = null,
) {
  const rows = planRows(backlog, state, issueIdOverrides).filter(
    (row) => !refs || refs.includes(row.issue.ref),
  );
  const maxWorklogs = Math.max(1, ...rows.map((row) => (row.worklog ? 1 : 0)));
  const maxComponents = Math.max(
    2,
    ...rows.map((row) => row.issue.components.length),
  );
  const maxComments = Math.max(1, ...rows.map((row) => row.comments.length));

  const header = [...BASE_COLUMNS];
  for (let i = 0; i < maxWorklogs; i += 1) header.push("Worklog");
  for (let i = 0; i < maxComponents; i += 1) header.push("Component");
  header.push("Fix Version");
  for (let i = 0; i < maxComments; i += 1) header.push("Comment");
  header.push("Cost (INR)");

  const lines = [csvLine(header)];
  for (const row of rows) {
    const issue = row.issue;
    lines.push(
      csvLine([
        row.issueId,
        issue.type,
        issue.summary,
        issue.description,
        issue.status,
        issue.status === "Done" ? "Done" : "",
        issue.created,
        issue.resolved ?? issue.created,
        issue.resolved ?? "",
        issue.due ?? "",
        row.accountId,
        row.accountId,
        row.parentId,
        row.sprintId,
        issue.storyPoints ?? "",
        hoursToSeconds(issue.estimateH),
        hoursToSeconds(issue.spentH),
        ...padGroup(row.worklog ? [row.worklog] : [], maxWorklogs),
        ...padGroup(issue.components ?? [], maxComponents),
        issue.fixVersion ?? "",
        ...padGroup(row.comments, maxComments),
        row.cost,
      ]),
    );
  }
  return `${lines.join("\r\n")}\r\n`;
}

export function expectedKeys(backlog) {
  return planRows(backlog, {}).map((row) => ({
    issueId: row.issueId,
    ref: row.issue.ref,
    expectedKey: `LV-${row.issueId}`,
    summary: row.issue.summary,
  }));
}

// --------------------------------------------------------------- file state

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

export function loadBacklog() {
  return JSON.parse(readFileSync(BACKLOG_PATH, "utf8"));
}

function loadState() {
  return readJson(STATE_PATH, {});
}

function saveState(state) {
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

function die(message) {
  console.error(message);
  process.exit(1);
}

// ---------------------------------------------------------------- Jira REST

function jiraConfig() {
  for (const file of [".env.jira", join(REPO_ROOT, ".env.jira")]) {
    try {
      process.loadEnvFile(file);
      break;
    } catch {
      // try the next location
    }
  }
  const { JIRA_SITE, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } =
    process.env;
  if (!JIRA_SITE || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    die(
      "missing JIRA_SITE / JIRA_EMAIL / JIRA_API_TOKEN (create .env.jira in the repo root)",
    );
  }
  return {
    site: JIRA_SITE.replace(/\/+$/, ""),
    projectKey: JIRA_PROJECT_KEY ?? "LV",
    auth: `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64")}`,
  };
}

async function api(config, path, init = {}) {
  const method = init.method ?? "GET";
  const headers = {
    Authorization: config.auth,
    Accept: "application/json",
    ...(init.body ? { "Content-Type": "application/json" } : {}),
  };
  const response = await fetch(`${config.site}${path}`, {
    method,
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) die(`${method} ${path} -> ${response.status} ${text}`);
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

async function searchIssues(config, jql, fields = ["summary"]) {
  const issues = [];
  let nextPageToken;
  do {
    const body = { jql, fields, maxResults: 100 };
    if (nextPageToken) body.nextPageToken = nextPageToken;
    const page = await api(config, "/rest/api/3/search/jql", {
      method: "POST",
      body,
    });
    issues.push(...(page?.issues ?? []));
    nextPageToken = page?.nextPageToken;
  } while (nextPageToken);
  return issues;
}

function jiraTimestamp(local, timezone) {
  return `${local.replace(" ", "T")}:00.000${timezone}`;
}

// ------------------------------------------------------------------ commands

async function cmdCheck() {
  const config = jiraConfig();
  const me = await api(config, "/rest/api/3/myself");
  const project = await api(config, `/rest/api/3/project/${config.projectKey}`);
  const boards = await api(
    config,
    `/rest/agile/1.0/board?projectKeyOrId=${config.projectKey}`,
  );
  const fields = await api(config, "/rest/api/3/field");
  const board = boards?.values?.[0];
  const pointsField =
    fields.find((field) => field.name === "Story Points") ??
    fields.find((field) => field.name === "Story point estimate");
  if (!pointsField) die("no Story Points field found on this site");

  const state = loadState();
  saveState({
    ...state,
    accountId: me.accountId,
    accountName: me.displayName ?? me.emailAddress,
    projectKey: config.projectKey,
    projectId: project.id,
    boardId: board?.id ?? null,
    storyPointsFieldId: pointsField.id,
  });

  console.log(`accountId\t${me.accountId}`);
  console.log(`displayName\t${me.displayName ?? ""}`);
  console.log(`project\t${project.key}\t${project.name}`);
  console.log(`board\t${board?.id ?? "(none)"}\t${board?.name ?? ""}`);
  console.log(`storyPointsField\t${pointsField.id}\t${pointsField.name}`);
}

async function cmdPrepare() {
  const config = jiraConfig();
  const backlog = loadBacklog();
  const state = loadState();
  if (!state.boardId) die("run check first");

  const components = await api(
    config,
    `/rest/api/3/project/${config.projectKey}/components`,
  );
  const versions = await api(
    config,
    `/rest/api/3/project/${config.projectKey}/versions`,
  );
  const sprints = await api(
    config,
    `/rest/agile/1.0/board/${state.boardId}/sprint?maxResults=50`,
  );

  const componentIds = { ...(state.components ?? {}) };
  for (const name of backlog.components) {
    let component =
      components.find((item) => item.name === name) ??
      (componentIds[name] ? { id: componentIds[name], name } : null);
    if (!component) {
      component = await api(config, "/rest/api/3/component", {
        method: "POST",
        body: { name, project: config.projectKey },
      });
    }
    componentIds[name] = component.id;
  }

  const versionIds = { ...(state.versions ?? {}) };
  for (const version of backlog.versions) {
    let existing = versions.find((item) => item.name === version.name);
    if (!existing) {
      existing = await api(config, "/rest/api/3/version", {
        method: "POST",
        body: {
          name: version.name,
          description: version.description,
          project: config.projectKey,
          startDate: version.startDate,
          releaseDate: version.releaseDate,
          released: false,
        },
      });
    }
    versionIds[version.ref] = existing.id;
  }

  const sprintIds = { ...(state.sprints ?? {}) };
  for (const sprint of backlog.sprints) {
    let existing = sprints.values?.find((item) => item.name === sprint.name);
    if (!existing) {
      existing = await api(config, "/rest/agile/1.0/sprint", {
        method: "POST",
        body: {
          name: sprint.name,
          originBoardId: state.boardId,
          startDate: jiraTimestamp(sprint.startDate, sprint.timezone),
          endDate: jiraTimestamp(sprint.endDate, sprint.timezone),
          goal: sprint.goal,
        },
      });
    }
    sprintIds[sprint.ref] = existing.id;
  }

  saveState({
    ...state,
    components: componentIds,
    versions: versionIds,
    sprints: sprintIds,
  });
  console.log("components\t" + JSON.stringify(componentIds));
  console.log("versions\t" + JSON.stringify(versionIds));
  console.log("sprints\t" + JSON.stringify(sprintIds));
}

function requireCsvState(state) {
  if (!state.accountId) die("run check first");
  const backlog = loadBacklog();
  const missing = backlog.sprints.filter(
    (sprint) => !state.sprints?.[sprint.ref],
  );
  if (missing.length)
    die(
      `run prepare first (no sprint id for ${missing.map((s) => s.ref).join(", ")})`,
    );
  return backlog;
}

function writeCsvFile(name, csv) {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, name);
  writeFileSync(path, csv);
  return path;
}

function printSprintTable(backlog) {
  console.log("sprint\tissues\tstoryPoints");
  for (const row of sprintTotals(backlog)) {
    console.log(`${row.sprint}\t${row.issues}\t${row.storyPoints}`);
  }
}

function cmdCsv() {
  const state = loadState();
  const backlog = requireCsvState(state);
  const path = writeCsvFile("livevitals-import.csv", buildCsv(backlog, state));
  writeCsvFile(
    "expected-keys.json",
    `${JSON.stringify(expectedKeys(backlog), null, 2)}\n`,
  );
  console.log(`wrote ${path}`);
  printSprintTable(backlog);
}

async function cmdFinalize() {
  const config = jiraConfig();
  const backlog = loadBacklog();
  const state = loadState();
  const remote = await searchIssues(config, `project = ${config.projectKey}`, [
    "summary",
  ]);

  const keysBySummary = new Map();
  for (const issue of remote) {
    const summary = issue.fields?.summary;
    const list = keysBySummary.get(summary) ?? [];
    list.push(issue.key);
    keysBySummary.set(summary, list);
  }

  const keys = { ...(state.keys ?? {}) };
  const problems = [];
  for (const issue of backlog.issues) {
    const matches = keysBySummary.get(issue.summary) ?? [];
    if (matches.length === 1) {
      keys[issue.ref] = matches[0];
      console.log(`${issue.ref}\t${matches[0]}\t${issue.summary}`);
    } else {
      problems.push(
        `${issue.ref}\t${matches.length === 0 ? "no match" : `duplicate: ${matches.join(",")}`}\t${issue.summary}`,
      );
    }
  }
  saveState({ ...state, keys });

  for (const sprintRef of Object.keys(state.sprints ?? {}).sort()) {
    const id = state.sprints[sprintRef];
    const current = await api(config, `/rest/agile/1.0/sprint/${id}`);
    if (current.state === "closed") {
      console.log(`sprint ${sprintRef} already closed`);
      continue;
    }
    await api(config, `/rest/agile/1.0/sprint/${id}`, {
      method: "POST",
      body: { state: "active" },
    });
    await api(config, `/rest/agile/1.0/sprint/${id}`, {
      method: "POST",
      body: { state: "closed" },
    });
    console.log(`sprint ${sprintRef} closed`);
  }

  for (const [ref, id] of Object.entries(state.versions ?? {})) {
    await api(config, `/rest/api/3/version/${id}`, {
      method: "PUT",
      body: { released: true },
    });
    console.log(`version ${ref} released`);
  }

  if (problems.length) {
    console.error("unmatched issues:\n" + problems.join("\n"));
    process.exit(1);
  }
}

function cmdKeys(refs) {
  const backlog = loadBacklog();
  const state = loadState();
  const wanted = refs.length ? refs : backlog.issues.map((issue) => issue.ref);
  for (const ref of wanted) {
    const issue = backlog.issues.find((item) => item.ref === ref);
    if (!issue) die(`unknown ref ${ref}`);
    const key = state.keys?.[ref];
    if (!key) die(`no key for ${ref} (run finalize)`);
    console.log(`${ref}\t${key}\t${issue.summary}`);
  }
}

function cmdAddendum(refs) {
  if (!refs.length) die("usage: jira.mjs addendum <ref...>");
  const state = loadState();
  const backlog = requireCsvState(state);
  for (const ref of refs) {
    if (!backlog.issues.some((issue) => issue.ref === ref))
      die(`unknown ref ${ref}`);
  }
  const ids = addendumIds(backlog, refs, state.lastAddendumId);
  const path = writeCsvFile(
    "livevitals-addendum.csv",
    buildCsv(backlog, state, refs, ids),
  );
  // Each addendum must use ids no earlier import used, so remember the last one.
  saveState({ ...state, lastAddendumId: Math.max(...ids.values()) });
  console.log(`wrote ${path} (${refs.length} rows)`);
}

// The importer skips rows whose Issue Id already exists in Jira, so every
// addendum takes ids after the last one handed out. Parent cells point at the
// fresh id when the parent is in the same addendum, otherwise at its row from
// the original import.
export function addendumIds(backlog, refs, lastAddendumId = 0) {
  const base = Math.max(1000 + backlog.issues.length, lastAddendumId + 1);
  return new Map(refs.map((ref, index) => [ref, base + index]));
}

// ---------------------------------------------------------------------- CLI

const handlers = {
  check: cmdCheck,
  prepare: cmdPrepare,
  csv: cmdCsv,
  finalize: cmdFinalize,
  keys: () => cmdKeys(process.argv.slice(3)),
  addendum: () => cmdAddendum(process.argv.slice(3)),
};

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  const command = process.argv[2];
  const handler = handlers[command];
  if (!handler) {
    die(`usage: jira.mjs <${Object.keys(handlers).join("|")}>`);
  }
  Promise.resolve()
    .then(handler)
    .catch((error) => die(error?.stack ?? String(error)));
}
