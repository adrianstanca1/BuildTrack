"""BuildTrack API integration tests.

Run: cd /root/BuildTrack/backend && python -m pytest tests/ -v
Requires: API running on localhost:8000
"""

import pytest
import httpx
import uuid
from datetime import date, timedelta

API_BASE = "http://localhost:8000"


@pytest.fixture
def client():
    """HTTP client pointing at the API."""
    with httpx.Client(base_url=API_BASE, timeout=10) as c:
        yield c


# ─── Health ───────────────────────────────────────────────────────────────────

class TestHealth:
    def test_health_returns_200(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] in ("healthy", "degraded")
        assert data["service"] == "buildtrack-api"

    def test_health_has_version(self, client):
        r = client.get("/health")
        assert "version" in r.json()


# ─── Auth check ───────────────────────────────────────────────────────────────

class TestAuth:
    def test_api_docs_accessible(self, client):
        r = client.get("/api/docs")
        assert r.status_code == 200

    def test_openapi_json(self, client):
        r = client.get("/api/openapi.json")
        assert r.status_code == 200
        spec = r.json()
        assert "paths" in spec
        assert "/api/projects" in str(spec["paths"])


# ─── Projects CRUD ────────────────────────────────────────────────────────────

class TestProjects:
    def test_list_projects(self, client):
        r = client.get("/api/projects")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_list_projects_with_status_filter(self, client):
        r = client.get("/api/projects?status=active")
        assert r.status_code == 200
        projects = r.json()
        for p in projects:
            assert p["status"] == "active"

    def test_create_and_delete_project(self, client):
        # Create
        project = {
            "name": f"Test Project {uuid.uuid4().hex[:8]}",
            "location": "Test Location",
            "description": "Pytest created",
            "budget": 100000,
            "progress": 0,
            "status": "planning",
            "start_date": str(date.today()),
            "end_date": str(date.today() + timedelta(days=30)),
            "team_size": 5,
        }
        r = client.post("/api/projects", json=project)
        assert r.status_code == 201
        created = r.json()
        assert created["name"] == project["name"]
        assert created["budget"] == 100000

        # Get by ID
        r2 = client.get(f"/api/projects/{created['id']}")
        assert r2.status_code == 200
        assert r2.json()["id"] == created["id"]

        # Update
        r3 = client.put(f"/api/projects/{created['id']}", json={"progress": 50})
        assert r3.status_code == 200
        assert r3.json()["progress"] == 50

        # Delete
        r4 = client.delete(f"/api/projects/{created['id']}")
        assert r4.status_code == 204

        # Verify gone
        r5 = client.get(f"/api/projects/{created['id']}")
        assert r5.status_code == 404

    def test_get_nonexistent_project(self, client):
        fake_id = "00000000-0000-0000-0000-000000000000"
        r = client.get(f"/api/projects/{fake_id}")
        assert r.status_code == 404

    def test_create_validation_error(self, client):
        r = client.post("/api/projects", json={"name": "No Location"})
        assert r.status_code == 422 or r.status_code == 500


# ─── Tasks CRUD ────────────────────────────────────────────────────────────────

class TestTasks:
    def test_list_tasks(self, client):
        r = client.get("/api/tasks")
        assert r.status_code == 200

    def test_tasks_filter_by_status(self, client):
        r = client.get("/api/tasks?status=completed")
        assert r.status_code == 200
        for t in r.json():
            assert t["status"] == "completed"

    def test_create_and_delete_task(self, client):
        task = {
            "title": f"Test Task {uuid.uuid4().hex[:8]}",
            "priority": "medium",
            "status": "pending",
            "due_date": str(date.today() + timedelta(days=7)),
        }
        r = client.post("/api/tasks", json=task)
        assert r.status_code == 201
        created = r.json()
        assert created["title"] == task["title"]

        # Delete
        r2 = client.delete(f"/api/tasks/{created['id']}")
        assert r2.status_code == 204


# ─── Safety ────────────────────────────────────────────────────────────────────

class TestSafety:
    def test_list_incidents(self, client):
        r = client.get("/api/safety/incidents")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_incident(self, client):
        incident = {
            "title": f"Test Incident {uuid.uuid4().hex[:8]}",
            "severity": "low",
            "incident_date": str(date.today()),
            "injuries": 0,
        }
        r = client.post("/api/safety/incidents", json=incident)
        assert r.status_code == 201
        # Cleanup
        cid = r.json()["id"]
        client.delete(f"/api/safety/incidents/{cid}")

    def test_list_inspections(self, client):
        r = client.get("/api/safety/inspections")
        assert r.status_code == 200

    def test_safety_stats(self, client):
        r = client.get("/api/safety/stats")
        assert r.status_code == 200
        stats = r.json()
        assert "total_incidents" in stats
        assert "total_inspections" in stats
        assert "incidents_by_severity" in stats


# ─── Workers ───────────────────────────────────────────────────────────────────

class TestWorkers:
    def test_list_workers(self, client):
        r = client.get("/api/workers")
        assert r.status_code == 200

    def test_list_active_workers(self, client):
        r = client.get("/api/workers?status=active")
        assert r.status_code == 200
        for w in r.json():
            assert w["status"] == "active"


# ─── Dashboard ─────────────────────────────────────────────────────────────────

class TestDashboard:
    def test_dashboard_stats(self, client):
        r = client.get("/api/dashboard/stats")
        assert r.status_code == 200
        stats = r.json()
        required = [
            "total_projects", "active_projects", "completed_projects",
            "total_budget", "total_workers", "overdue_tasks",
            "total_incidents", "pending_inspections",
        ]
        for field in required:
            assert field in stats, f"Missing field: {field}"
