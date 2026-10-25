-- one row per location, updated in place on every write
DROP TABLE changevalue;

CREATE TABLE changevalue (
  location varchar(255) NOT NULL PRIMARY KEY,
  hash_value varchar(255) NOT NULL
);

INSERT INTO changevalue (location, hash_value) VALUES ('sa', UUID()), ('sm', UUID());
