-- edits used to insert new eye rows instead of updating them, the replaced rows are referenced by nothing
DELETE FROM eye
WHERE id NOT IN (SELECT od_id FROM glasses WHERE od_id IS NOT NULL)
  AND id NOT IN (SELECT os_id FROM glasses WHERE os_id IS NOT NULL)
  AND id NOT IN (SELECT od_id FROM search_log WHERE od_id IS NOT NULL)
  AND id NOT IN (SELECT os_id FROM search_log WHERE os_id IS NOT NULL);

-- dispensed glasses have no SKU, unique indexes allow any number of NULLs
CREATE UNIQUE INDEX glasses_sku_unique ON glasses (sku);
DROP INDEX sku ON glasses;
