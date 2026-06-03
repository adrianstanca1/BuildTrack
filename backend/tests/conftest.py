"""Shared API test fixtures."""

import pytest
from fastapi.testclient import TestClient

from app import services
from app.main import app
from app.routers import dashboard, projects, safety, tasks, workers

from .fakes import InMemorySupabase


@pytest.fixture
def supabase(monkeypatch):
    """Patch all imported Supabase accessors to return a fresh fake per test."""

    fake = InMemorySupabase()
    for module in (services, projects, tasks, safety, workers, dashboard):
        monkeypatch.setattr(module, "get_supabase", lambda fake=fake: fake)
    return fake


@pytest.fixture
def client(supabase):
    """HTTP client pointing at the in-process API."""

    with TestClient(app) as c:
        yield c
