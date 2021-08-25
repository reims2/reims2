DROP TABLE roles IF EXISTS;
DROP TABLE users IF EXISTS;
DROP TABLE user_roles IF EXISTS;
DROP TABLE eye IF EXISTS;
DROP TABLE glasses IF EXISTS;
DROP TABLE dispense IF EXISTS;

CREATE TABLE eye
  (
     id         INTEGER IDENTITY PRIMARY KEY,
     sphere     FLOAT,
     cylinder   FLOAT,
     axis       INTEGER,
     additional FLOAT
  );

CREATE TABLE dispense
  (
     id          INTEGER IDENTITY PRIMARY KEY,
     modify_date TIMESTAMP DEFAULT NULL
  );

CREATE TABLE glasses
  (
     id           INTEGER IDENTITY PRIMARY KEY,
     sku          INTEGER,
     glasses_type VARCHAR(30),
     glasses_size VARCHAR(30),
     appearance   VARCHAR(30),
     dispense_id  INTEGER,
     location     VARCHAR(50),
     dispensed    BOOLEAN DEFAULT false,
     os_id        INTEGER,
     od_id        INTEGER
  );

ALTER TABLE glasses
  ADD CONSTRAINT fk_glasses_os FOREIGN KEY (os_id) REFERENCES eye (id);

ALTER TABLE glasses
  ADD CONSTRAINT fk_glasses_od FOREIGN KEY (od_id) REFERENCES eye (id);

ALTER TABLE glasses
  ADD CONSTRAINT fk_dispense FOREIGN KEY (dispense_id) REFERENCES dispense (id);

CREATE TABLE users
  (
     id       INTEGER IDENTITY PRIMARY KEY,
     password VARCHAR(120) NULL,
     username VARCHAR(20) NULL UNIQUE
  );

CREATE TABLE roles
  (
     id   INTEGER IDENTITY PRIMARY KEY,
     NAME VARCHAR(20) NULL
  );

CREATE TABLE user_roles
  (
     user_id INTEGER,
     role_id INTEGER
  );

ALTER TABLE user_roles
  ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE user_roles
  ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles (id); 

