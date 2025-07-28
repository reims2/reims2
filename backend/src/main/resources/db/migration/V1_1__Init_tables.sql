CREATE TABLE changevalue (
  hash_value varchar(255) NOT NULL PRIMARY KEY,
  location varchar(255) DEFAULT NULL
);

CREATE TABLE dispense (
  previous_sku int DEFAULT NULL,
  id serial PRIMARY KEY,
  modify_date datetime(6) DEFAULT NULL,
  dispense_reason varchar(255) DEFAULT NULL
);

CREATE TABLE eye (
  additional decimal(38,2) DEFAULT NULL,
  axis int,
  cylinder decimal(38,2) DEFAULT NULL,
  sphere decimal(38,2) DEFAULT NULL,
  id serial PRIMARY KEY
);


CREATE TABLE unsuccessful_search (
  increase_search_tolerance bit(1) DEFAULT NULL,
  id serial PRIMARY KEY,
  od_id bigint UNSIGNED DEFAULT NULL,
  os_id bigint UNSIGNED DEFAULT NULL,
  search_date datetime(6) DEFAULT NULL,
  bal_lens varchar(255) DEFAULT NULL,
  glasses_type varchar(255) DEFAULT NULL,
  location varchar(255) DEFAULT NULL,
  KEY (od_id),
  KEY (os_id),
  FOREIGN KEY (os_id) REFERENCES eye(id),
  FOREIGN KEY (od_id) REFERENCES eye(id)
);

CREATE TABLE glasses (
  dispensed bit(1) DEFAULT NULL,
  sku int DEFAULT NULL,
  creation_date datetime(6) DEFAULT NULL,
  dispense_id bigint UNSIGNED DEFAULT NULL,
  id serial PRIMARY KEY,
  od_id bigint UNSIGNED DEFAULT NULL,
  os_id bigint UNSIGNED DEFAULT NULL,
  appearance varchar(255) DEFAULT NULL,
  glasses_size varchar(255) DEFAULT NULL,
  glasses_type varchar(255) DEFAULT NULL,
  location varchar(255) DEFAULT NULL,
  UNIQUE KEY (dispense_id),
  KEY (od_id),
  KEY (os_id),
  KEY sku (sku),
  FOREIGN KEY (dispense_id) REFERENCES dispense(id),
  FOREIGN KEY (os_id) REFERENCES eye(id),
  FOREIGN KEY (od_id) REFERENCES eye(id)
);

CREATE TABLE roles (
  id serial PRIMARY KEY,
  name varchar(20) DEFAULT NULL
);

CREATE TABLE users (
  id serial PRIMARY KEY,
  username varchar(20) DEFAULT NULL,
  password varchar(120) DEFAULT NULL,
  UNIQUE KEY (username)
);


CREATE TABLE user_roles (
  role_id bigint UNSIGNED NOT NULL,
  user_id bigint UNSIGNED NOT NULL,
  PRIMARY KEY (role_id,user_id),
  KEY (user_id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
