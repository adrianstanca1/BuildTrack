-- ============================================================================
-- BuildTrack: Seed Data (Supplemental)
-- Adds photos and notifications to the demo data already inserted by migration.
-- Migration 20260508140000_init_schema.sql already creates projects, tasks,
-- incidents, inspections, and workers.
-- ============================================================================

-- Photos
INSERT INTO photos (id, project_id, url, caption, category, user_id) VALUES
('e5f6a7b8-c9d0-1234-efab-123456789034', '11111111-1111-1111-1111-111111111111', 'https://example.com/site-overview.jpg', 'Site overview photo', 'site', NULL),
('f6a7b8c9-d0e1-2345-fabc-123456789045', '22222222-2222-2222-2222-222222222222', 'https://example.com/progress-week12.jpg', 'Week 12 progress shot', 'progress', NULL),
('a7b8c9d0-e1f2-3456-abcd-123456789056', '11111111-1111-1111-1111-111111111111', 'https://example.com/incident-slip.jpg', 'Slip and fall incident photo', 'incident', NULL);

-- Notifications
INSERT INTO notifications (id, title, body, type, related_id, read, user_id) VALUES
('b8c9d0e1-f2a3-4567-bcde-123456789067', 'Safety Inspection Due', 'Skyline Tower project needs inspection by Friday.', 'safety', '11111111-1111-1111-1111-111111111111', FALSE, NULL),
('c9d0e1f2-a3b4-5678-cdef-123456789078', 'Task Completed', 'Foundation pour completed at Riverside Apartments.', 'task', '22222222-2222-2222-2222-222222222222', FALSE, NULL),
('d0e1f2a3-b4c5-6789-defa-123456789089', 'Incident Reported', 'Minor incident at Community Center — slip and fall near entrance.', 'safety', '33333333-3333-3333-3333-333333333333', FALSE, NULL),
('e1f2a3b4-c5d6-7890-efab-123456789090', 'Certification Expiring', 'John Martinez forklift certification expires next month.', 'general', NULL, TRUE, NULL),
('f2a3b4c5-d6e7-8901-fabc-123456789101', 'Budget Alert', 'Highway Overpass project has exceeded 90% of allocated budget.', 'project', NULL, FALSE, NULL),
('a3b4c5d6-e7f8-9012-abcd-123456789112', 'Project Update', 'City Mall renovation is now 75% complete and on schedule.', 'project', 'e5f6a7b8-c9d0-1234-efab-123456789034', TRUE, NULL),
('b4c5d6e7-f8a9-0123-bcde-123456789123', 'Worker Added', 'Maria Rodriguez has been added to the Riverside Apartments team.', 'team', '22222222-2222-2222-2222-222222222222', TRUE, NULL),
('c5d6e7f8-a9b0-1234-cdef-123456789134', 'Task Reminder', 'Review structural plans for the Bridge Project — due tomorrow.', 'task', NULL, FALSE, NULL),
('d6e7f8a9-b0c1-2345-defa-123456789145', 'Inspection Failed', 'Electrical rough-in at Skyline Tower failed inspection. Corrections needed.', 'safety', '11111111-1111-1111-1111-111111111111', FALSE, NULL),
('e7f8a9b0-c1d2-3456-efab-123456789156', 'Weekly Report Ready', 'Your weekly project summary is ready for review.', 'general', NULL, TRUE, NULL);
