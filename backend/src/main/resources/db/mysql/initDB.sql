DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS glasses;
DROP TABLE IF EXISTS eye;
DROP TABLE IF EXISTS dispense;

CREATE TABLE eye
  (
     id         INT auto_increment PRIMARY KEY,
     sphere     FLOAT,
     cylinder   FLOAT,
     axis       INT,
     additional FLOAT
  );

CREATE TABLE dispense
  (
     id          INT auto_increment PRIMARY KEY,
     modify_date TIMESTAMP NULL DEFAULT NULL
  );

CREATE TABLE glasses
  (
     id           INT auto_increment PRIMARY KEY,
     sku          INT,
     glasses_type VARCHAR(30),
     glasses_size VARCHAR(30),
     appearance   VARCHAR(30),
     dispense_id  INT,
     location     VARCHAR(50),
     dispensed    BOOLEAN DEFAULT false,
     os_id        INT,
     od_id        INT
  );

ALTER TABLE glasses
  ADD CONSTRAINT fk_glasses_os FOREIGN KEY (os_id) REFERENCES eye(id);

ALTER TABLE glasses
  ADD CONSTRAINT fk_glasses_od FOREIGN KEY (od_id) REFERENCES eye(id);

ALTER TABLE glasses
  ADD CONSTRAINT fk_dispense FOREIGN KEY (dispense_id) REFERENCES dispense(id);

CREATE TABLE users
  (
     id       INT auto_increment PRIMARY KEY,
     password VARCHAR(120) NULL,
     username VARCHAR(20) NULL UNIQUE
  );

CREATE TABLE roles
  (
     id   INT auto_increment PRIMARY KEY,
     name VARCHAR(20) NULL
  );

CREATE TABLE user_roles
  (
     user_id INT,
     role_id INT
  );

ALTER TABLE user_roles
  ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE user_roles
  ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles (id); 
