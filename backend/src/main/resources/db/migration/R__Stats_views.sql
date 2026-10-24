-- read-only views for the grafana SQL dashboards, one place for the stock/dispensed/removed rules
-- repeatable: flyway re-runs this file whenever it changes, so edit the views here in place
CREATE OR REPLACE VIEW stats_glasses AS
SELECT
  g.id, g.sku, g.location, g.glasses_type, g.glasses_size, g.appearance, g.creation_date,
  -- cast, or grafana's utf8mb4_unicode_ci connection can't compare literals against it
  CAST(CASE
    WHEN g.dispensed AND d.dispense_reason = 'DISPENSED' THEN 'dispensed'
    WHEN g.dispensed THEN 'removed'
    ELSE 'in_stock'
  END AS VARCHAR(20)) AS status,
  CASE WHEN g.dispensed THEN d.dispense_reason END AS dispense_reason,
  CASE WHEN g.dispensed THEN d.modify_date END AS dispense_date,
  od.sphere AS od_sphere, od.cylinder AS od_cylinder, od.axis AS od_axis, od.additional AS od_add,
  os.sphere AS os_sphere, os.cylinder AS os_cylinder, os.axis AS os_axis, os.additional AS os_add
FROM glasses g
LEFT JOIN dispense d ON d.id = g.dispense_id
LEFT JOIN eye od ON od.id = g.od_id
LEFT JOIN eye os ON os.id = g.os_id;

CREATE OR REPLACE VIEW stats_unsuccessful_search AS
SELECT
  s.id, s.location, s.glasses_type, s.bal_lens, s.increase_search_tolerance, s.search_date,
  od.sphere AS od_sphere, od.cylinder AS od_cylinder, od.axis AS od_axis, od.additional AS od_add,
  os.sphere AS os_sphere, os.cylinder AS os_cylinder, os.axis AS os_axis, os.additional AS os_add
FROM search_log s
LEFT JOIN eye od ON od.id = s.od_id
LEFT JOIN eye os ON os.id = s.os_id
WHERE s.result_count = 0;
