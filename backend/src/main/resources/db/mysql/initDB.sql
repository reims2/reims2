DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS eye;
DROP TABLE IF EXISTS glasses;
DROP TABLE IF EXISTS dispense;

CREATE TABLE eye (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  sphere VARCHAR(30),
  cylinder VARCHAR(30),
  axis VARCHAR(30),
  additional  VARCHAR(30)
);

CREATE TABLE dispense (
      id         BIGINT AUTO_INCREMENT PRIMARY KEY,
      modify_date TIMESTAMP NULL DEFAULT NULL
);
CREATE TABLE glasses (
     id         BIGINT AUTO_INCREMENT PRIMARY KEY,
     SKU BIGINT,
     glasses_type VARCHAR(30),
     glasses_size VARCHAR(30),
     appearance  VARCHAR(30),
     dispense_id   BIGINT,
     location VARCHAR(50),
     dispensed   BOOLEAN DEFAULT FALSE,
     OS_ID BIGINT,
     OD_ID BIGINT
);
ALTER TABLE glasses ADD CONSTRAINT fk_glasses_OS FOREIGN KEY (OS_ID) REFERENCES eye(id);
ALTER TABLE glasses ADD CONSTRAINT fk_glasses_OD FOREIGN KEY (OD_ID) REFERENCES eye(id);
ALTER TABLE glasses ADD CONSTRAINT fk_dispense FOREIGN KEY (dispense_id) REFERENCES dispense(id);

CREATE  TABLE users (
  username    VARCHAR(20) NOT NULL ,
  password    VARCHAR(20) NOT NULL ,
  enabled     BOOLEAN DEFAULT TRUE NOT NULL ,
  PRIMARY KEY (username)
);

CREATE TABLE roles (
  id              INTEGER AUTO_INCREMENT PRIMARY KEY,
  username        VARCHAR(20) NOT NULL,
  role            VARCHAR(20) NOT NULL
);
ALTER TABLE roles ADD CONSTRAINT fk_username FOREIGN KEY (username) REFERENCES users (username);
CREATE INDEX fk_username_idx ON roles (username);

