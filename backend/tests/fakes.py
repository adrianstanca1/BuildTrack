"""Reusable test doubles for backend API tests."""

from copy import deepcopy
from datetime import date, datetime, timedelta, timezone
import re
import uuid


class QueryResult:
    """Minimal response object matching Supabase client's ``execute`` result."""

    def __init__(self, data):
        self.data = data


class InMemorySupabase:
    """Small in-memory Supabase replacement for backend route tests."""

    def __init__(self):
        today = date.today()
        self.tables = {
            "projects": [
                self._row(
                    {
                        "name": "Downtown Tower",
                        "location": "Denver, CO",
                        "description": "Active commercial build",
                        "budget": 500000,
                        "progress": 45,
                        "status": "active",
                        "start_date": today.isoformat(),
                        "end_date": (today + timedelta(days=120)).isoformat(),
                        "team_size": 12,
                        "latitude": None,
                        "longitude": None,
                    }
                ),
                self._row(
                    {
                        "name": "Finished Warehouse",
                        "location": "Aurora, CO",
                        "description": "Completed warehouse",
                        "budget": 250000,
                        "progress": 100,
                        "status": "completed",
                        "start_date": (today - timedelta(days=180)).isoformat(),
                        "end_date": (today - timedelta(days=10)).isoformat(),
                        "team_size": 6,
                        "latitude": None,
                        "longitude": None,
                    }
                ),
            ],
            "tasks": [
                self._row(
                    {
                        "title": "Close punch list",
                        "description": None,
                        "project_id": None,
                        "project_name": None,
                        "assigned_to": None,
                        "priority": "medium",
                        "status": "completed",
                        "due_date": (today - timedelta(days=1)).isoformat(),
                        "is_overdue": False,
                        "completed_at": datetime.now(timezone.utc).isoformat(),
                    }
                ),
                self._row(
                    {
                        "title": "Pour slab",
                        "description": None,
                        "project_id": None,
                        "project_name": None,
                        "assigned_to": None,
                        "priority": "high",
                        "status": "pending",
                        "due_date": (today + timedelta(days=7)).isoformat(),
                        "is_overdue": False,
                        "completed_at": None,
                    }
                ),
            ],
            "incidents": [
                self._row(
                    {
                        "title": "Minor scrape",
                        "project_id": None,
                        "project_name": None,
                        "description": None,
                        "severity": "low",
                        "incident_date": today.isoformat(),
                        "injuries": 0,
                        "witnesses": None,
                        "reported_by": None,
                        "photos": None,
                    }
                )
            ],
            "inspections": [
                self._row(
                    {
                        "title": "Weekly safety walk",
                        "project_id": None,
                        "project_name": None,
                        "description": None,
                        "status": "pending",
                        "inspection_date": today.isoformat(),
                        "inspector": None,
                        "findings": None,
                        "photos": None,
                    }
                )
            ],
            "workers": [
                self._row(
                    {
                        "name": "Alex Foreman",
                        "role": "foreman",
                        "status": "active",
                        "phone": None,
                        "email": None,
                        "weekly_hours": 40,
                        "certifications": None,
                        "project_assignments": None,
                        "hourly_rate": 50,
                    }
                ),
                self._row(
                    {
                        "name": "Sam Electrician",
                        "role": "electrician",
                        "status": "off-duty",
                        "phone": None,
                        "email": None,
                        "weekly_hours": 32,
                        "certifications": None,
                        "project_assignments": None,
                        "hourly_rate": 45,
                    }
                ),
            ],
        }

    def table(self, table_name):
        return InMemoryQuery(self, table_name)

    def _row(self, data):
        now = datetime.now(timezone.utc).isoformat()
        return {
            "id": str(uuid.uuid4()),
            "created_at": now,
            "updated_at": None,
            "user_id": None,
            **data,
        }


class InMemoryQuery:
    """Chainable subset of the Supabase query API used by the routers."""

    def __init__(self, db, table_name):
        self.db = db
        self.table_name = table_name
        self.filters = []
        self.searches = []
        self.ordering = None
        self.slice_bounds = None
        self.single_result = False
        self.operation = "select"
        self.payload = None

    def select(self, *_args, **_kwargs):
        self.operation = "select"
        return self

    def order(self, column, desc=False):
        self.ordering = (column, desc)
        return self

    def eq(self, column, value):
        self.filters.append((column, value))
        return self

    def ilike(self, column, pattern):
        regex = re.escape(pattern).replace("%", ".*")
        self.searches.append((column, re.compile(f"^{regex}$", re.IGNORECASE)))
        return self

    def range(self, start, end):
        self.slice_bounds = (start, end)
        return self

    def limit(self, limit):
        self.slice_bounds = (0, limit - 1)
        return self

    def single(self):
        self.single_result = True
        return self

    def insert(self, payload):
        self.operation = "insert"
        self.payload = payload
        return self

    def update(self, payload):
        self.operation = "update"
        self.payload = payload
        return self

    def delete(self):
        self.operation = "delete"
        return self

    def execute(self):
        if self.operation == "insert":
            return self._insert()
        if self.operation == "update":
            return self._update()
        if self.operation == "delete":
            return self._delete()
        return self._select()

    def _matching_rows(self):
        rows = list(self.db.tables[self.table_name])
        for column, value in self.filters:
            rows = [row for row in rows if str(row.get(column)) == str(value)]
        for column, regex in self.searches:
            rows = [row for row in rows if regex.match(str(row.get(column, "")))]
        if self.ordering:
            column, desc = self.ordering
            rows.sort(key=lambda row: str(row.get(column) or ""), reverse=desc)
        return rows

    def _select(self):
        rows = self._matching_rows()
        if self.single_result:
            return QueryResult(deepcopy(rows[0]) if rows else None)
        if self.slice_bounds:
            start, end = self.slice_bounds
            rows = rows[start : end + 1]
        return QueryResult(deepcopy(rows))

    def _insert(self):
        row = self.db._row(dict(self.payload))
        self.db.tables[self.table_name].append(row)
        return QueryResult([deepcopy(row)])

    def _update(self):
        rows = self._matching_rows()
        now = datetime.now(timezone.utc).isoformat()
        for row in rows:
            row.update(self.payload)
            row["updated_at"] = now
        return QueryResult(deepcopy(rows))

    def _delete(self):
        rows = self._matching_rows()
        ids = {row["id"] for row in rows}
        self.db.tables[self.table_name] = [
            row for row in self.db.tables[self.table_name] if row["id"] not in ids
        ]
        return QueryResult(deepcopy(rows))
