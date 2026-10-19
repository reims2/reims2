-- undispense used to keep the old reason, clear it so stock rows look like newly added ones
UPDATE dispense SET dispense_reason = NULL
WHERE id IN (SELECT dispense_id FROM glasses WHERE NOT dispensed);
