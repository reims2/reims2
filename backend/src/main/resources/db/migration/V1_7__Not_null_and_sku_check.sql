-- only increase_search_tolerance has NULLs in prod, from search logs older than that option
ALTER TABLE glasses
  MODIFY dispensed bit(1) NOT NULL,
  MODIFY creation_date datetime(6) NOT NULL,
  MODIFY dispense_id bigint UNSIGNED NOT NULL,
  MODIFY od_id bigint UNSIGNED NOT NULL,
  MODIFY os_id bigint UNSIGNED NOT NULL,
  MODIFY appearance varchar(255) NOT NULL,
  MODIFY glasses_size varchar(255) NOT NULL,
  MODIFY glasses_type varchar(255) NOT NULL,
  MODIFY location varchar(255) NOT NULL,
  ADD CONSTRAINT glasses_sku_only_in_stock CHECK (dispensed = (sku IS NULL));

ALTER TABLE eye
  MODIFY sphere decimal(38,2) NOT NULL,
  MODIFY cylinder decimal(38,2) NOT NULL,
  MODIFY axis int NOT NULL,
  MODIFY additional decimal(38,2) NOT NULL;

ALTER TABLE search_log
  MODIFY glasses_type varchar(255) NOT NULL,
  MODIFY location varchar(255) NOT NULL,
  MODIFY search_date datetime(6) NOT NULL,
  MODIFY bal_lens varchar(255) NOT NULL,
  MODIFY od_id bigint UNSIGNED NOT NULL,
  MODIFY os_id bigint UNSIGNED NOT NULL;

ALTER TABLE users
  MODIFY username varchar(20) NOT NULL,
  MODIFY password varchar(120) NOT NULL;

ALTER TABLE roles MODIFY name varchar(20) NOT NULL;

-- left behind by a restore with foreign key checks off
DELETE FROM user_roles WHERE user_id NOT IN (SELECT id FROM users);
