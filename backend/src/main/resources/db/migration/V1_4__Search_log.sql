-- R__Stats_views.sql recreates the view on top of search_log
DROP VIEW IF EXISTS stats_unsuccessful_search;

ALTER TABLE unsuccessful_search RENAME TO search_log;

-- every existing row is a failed search, so the default is correct for them
ALTER TABLE search_log ADD COLUMN result_count int NOT NULL DEFAULT 0;
