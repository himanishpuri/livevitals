import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildCsv,
  csvLine,
  epicCostInr,
  expectedKeys,
  hoursToSeconds,
  orderedIssues,
  planRows,
  quoteCsv,
  sprintTotals,
} from "./jira.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const backlog = JSON.parse(readFileSync(join(HERE, "backlog.json"), "utf8"));
const state = {
  accountId: "acc-1",
  sprints: Object.fromEntries(backlog.sprints.map((sprint, index) => [sprint.ref, 900 + index])),
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\r") {
      // line endings are CRLF
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const rows = planRows(backlog, state);
const rowByRef = new Map(rows.map((row) => [row.issue.ref, row]));
const csv = parseCsv(buildCsv(backlog, state));
const header = csv[0];
const body = csv.slice(1);
const column = (name) => header.indexOf(name);
const cell = (ref, name) => body[rowByRef.get(ref).issueId - 1][column(name)];

test("csv quoting escapes commas, quotes and newlines", () => {
  assert.equal(quoteCsv("plain"), "plain");
  assert.equal(quoteCsv("a,b"), '"a,b"');
  assert.equal(quoteCsv('say "hi"'), '"say ""hi"""');
  assert.equal(quoteCsv("line1\nline2"), '"line1\nline2"');
  assert.equal(csvLine(["a", "b,c"]), 'a,"b,c"');
});

test("hours convert to Jira seconds", () => {
  assert.equal(hoursToSeconds(0.5), 1800);
  assert.equal(hoursToSeconds(1), 3600);
  assert.equal(hoursToSeconds(1.25), 4500);
  assert.equal(hoursToSeconds(12), 43200);
  assert.equal(hoursToSeconds(null), "");
});

test("epic cost rolls up every descendant", () => {
  const fixture = [
    { ref: "E", type: "Epic", parent: null, spentH: null },
    { ref: "S", type: "Story", parent: "E", spentH: 2 },
    { ref: "T", type: "Sub-task", parent: "S", spentH: 1 },
    { ref: "U", type: "Task", parent: "E", spentH: 0.5 },
  ];
  assert.equal(epicCostInr("E", fixture, 500), 1750);
  assert.equal(rowByRef.get("E6").cost, 5000);
  assert.equal(rowByRef.get("E8").cost, 6000);
});

test("csv cost column matches the roll-up", () => {
  for (const epic of backlog.issues.filter((issue) => issue.type === "Epic")) {
    assert.equal(
      cell(epic.ref, "Cost (INR)"),
      String(rowByRef.get(epic.ref).cost),
      `${epic.ref} cost`,
    );
    assert.equal(cell(epic.ref, "Story Points"), "");
    assert.equal(cell(epic.ref, "Original Estimate"), "");
    assert.equal(cell(epic.ref, "Time Spent"), "");
  }
});

test("parent cell is the issue id of the parent row", () => {
  assert.equal(cell("H7", "Parent"), String(rowByRef.get("H6").issueId));
  assert.equal(cell("H12", "Parent"), String(rowByRef.get("H11").issueId));
  assert.equal(cell("H31", "Parent"), String(rowByRef.get("H27").issueId));
  assert.equal(cell("H39", "Parent"), String(rowByRef.get("H38").issueId));
  assert.equal(cell("H40", "Parent"), String(rowByRef.get("H38").issueId));
  assert.equal(cell("H38", "Parent"), String(rowByRef.get("E6").issueId));
  assert.equal(cell("O1", "Parent"), String(rowByRef.get("E9").issueId));
  assert.equal(cell("F1", "Parent"), String(rowByRef.get("E12").issueId));
});

test("epics come first and parents precede children", () => {
  const ordered = orderedIssues(backlog);
  const epicCount = ordered.filter((issue) => issue.type === "Epic").length;
  assert.ok(ordered.slice(0, epicCount).every((issue) => issue.type === "Epic"));
  assert.ok(ordered.slice(epicCount).every((issue) => issue.type !== "Epic"));
  const position = new Map(ordered.map((issue, index) => [issue.ref, index]));
  for (const issue of ordered) {
    if (!issue.parent) continue;
    assert.ok(position.get(issue.parent) < position.get(issue.ref), `${issue.ref} after its parent`);
  }
  assert.equal(body.length, backlog.issues.length);
  assert.equal(body[0][0], "1");
});

test("every summary is unique", () => {
  const summaries = backlog.issues.map((issue) => issue.summary);
  assert.equal(new Set(summaries).size, summaries.length);
});

test("every parent and sprint ref exists", () => {
  const refs = new Set(backlog.issues.map((issue) => issue.ref));
  const sprintRefs = new Set(backlog.sprints.map((sprint) => sprint.ref));
  const versionRefs = new Set(backlog.versions.map((version) => version.ref));
  const components = new Set(backlog.components);
  for (const issue of backlog.issues) {
    if (issue.parent) {
      assert.ok(refs.has(issue.parent), `${issue.ref} parent ${issue.parent}`);
      if (issue.type === "Sub-task") {
        assert.notEqual(backlog.issues.find((item) => item.ref === issue.parent).type, "Epic",
          `${issue.ref} must not hang off an epic`);
      }
    }
    if (issue.sprint) assert.ok(sprintRefs.has(issue.sprint), `${issue.ref} sprint`);
    if (issue.fixVersion) assert.ok(versionRefs.has(issue.fixVersion), `${issue.ref} fixVersion`);
    for (const component of issue.components) assert.ok(components.has(component), `${issue.ref} component`);
  }
});

test("sub-tasks are the only rows with an issue parent", () => {
  for (const issue of backlog.issues) {
    if (issue.type === "Sub-task") {
      assert.ok(issue.parent, `${issue.ref} needs a parent`);
    } else if (issue.type !== "Epic") {
      assert.ok(issue.parent, `${issue.ref} needs an epic`);
    }
  }
});

test("sprint table matches the backlog sums", () => {
  const expected = {
    S1: [22, 48], S2: [10, 26], S3: [14, 32], S4: [7, 16], S5: [14, 24],
    S6: [15, 29], S7: [9, 27], S8: [5, 15], S9: [3, 5],
  };
  const totals = sprintTotals(backlog);
  assert.equal(totals.length, 9);
  for (const row of totals) {
    assert.deepEqual([row.issues, row.storyPoints], expected[row.sprint], row.sprint);
  }
  const sprintsPoints = totals.reduce((sum, row) => sum + row.storyPoints, 0);
  const manual = backlog.issues
    .filter((issue) => issue.sprint && issue.type !== "Sub-task" && issue.status === "Done")
    .reduce((sum, issue) => sum + issue.storyPoints, 0);
  assert.equal(sprintsPoints, manual);
  assert.equal(backlog.issues.length, 117);
});

test("csv repeats multi-value headers and keeps columns aligned", () => {
  assert.equal(header.filter((name) => name === "Component").length, 2);
  assert.equal(header.filter((name) => name === "Fix Version").length, 1);
  assert.ok(header.includes("Cost (INR)"));
  for (const row of csv) assert.equal(row.length, header.length);
});

test("history rows carry worklog and commit comment cells", () => {
  assert.equal(cell("H1", "Worklog"), "Work on Set up Next.js 15 + Tailwind v4 + ESLint project scaffold;2025-05-01 11:00;acc-1;36000");
  assert.equal(cell("H1", "Comment"), "2025-05-01 18:00;acc-1;Implemented in https://github.com/himanishpuri/livevitals/commit/f35c147");
  assert.equal(cell("H10", "Time Spent"), "1800");
  assert.equal(cell("H1", "Sprint"), String(state.sprints.S1));
  assert.equal(cell("H1", "Updated"), "2025-05-01 18:00");
});

test("future backlog is open with no sprint or worklog", () => {
  for (const ref of ["F1", "F2", "F3"]) {
    assert.equal(cell(ref, "Status"), "To Do");
    assert.equal(cell(ref, "Resolution"), "");
    assert.equal(cell(ref, "Sprint"), "");
    assert.equal(cell(ref, "Fix Version"), "");
    assert.equal(cell(ref, "Resolved"), "");
    assert.equal(cell(ref, "Worklog"), "");
    assert.equal(cell(ref, "Time Spent"), "");
    assert.equal(cell(ref, "Cost (INR)"), "0");
  }
});

test("promoted history bugs take the overhaul sprint", () => {
  for (const ref of ["B1", "B2", "B5", "B7"]) {
    assert.equal(cell(ref, "Fix Version"), "v1.0.0");
    assert.ok(cell(ref, "Sprint"));
  }
  assert.equal(cell("B3", "Fix Version"), "v0.1.0");
  assert.equal(cell("B3", "Sprint"), String(state.sprints.S3));
});

test("expected keys follow row order", () => {
  const keys = expectedKeys(backlog);
  assert.equal(keys.length, backlog.issues.length);
  assert.deepEqual(keys[0], { issueId: 1, ref: "E1", expectedKey: "LV-1", summary: backlog.issues[0].summary });
  assert.equal(keys.at(-1).expectedKey, `LV-${keys.length}`);
});

test("addendum keeps ids and limits the rows", () => {
  const subset = parseCsv(buildCsv(backlog, state, ["OB18", "O21"]));
  assert.equal(subset.length, 3);
  assert.equal(subset[1][0], String(rowByRef.get("O21").issueId));
  assert.equal(subset[2][0], String(rowByRef.get("OB18").issueId));
});

test("addendum rows get fresh issue ids but keep parent ids from the backlog", () => {
  const overrides = new Map([["O31", 1000]]);
  const rows = planRows(backlog, state, overrides).filter((row) => row.issue.ref === "O31");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].issueId, 1000);
  assert.equal(rows[0].parentId, 13); // E13 keeps its original row id
});
