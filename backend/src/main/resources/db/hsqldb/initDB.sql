DROP TABLE roles IF EXISTS;
DROP TABLE users IF EXISTS;
DROP TABLE eye IF EXISTS;
DROP TABLE glasses IF EXISTS;


CREATE TABLE eye (
  id         BIGINT IDENTITY PRIMARY KEY,
  sphere VARCHAR(30),
  cylinder VARCHAR(30),
  axis VARCHAR(30),
  add  VARCHAR(30)
);
CREATE TABLE glasses (
     id         BIGINT IDENTITY PRIMARY KEY,
     SKU BIGINT,
     glasses_type VARCHAR(30),
     glasses_size VARCHAR(30),
     appearance  VARCHAR(30),
     dispensed   BOOLEAN DEFAULT FALSE NOT NULL,
     location VARCHAR(50),
     OS_ID INTEGER,
     OD_ID INTEGER
);
ALTER TABLE glasses ADD CONSTRAINT fk_glasses_OS FOREIGN KEY (OS_ID) REFERENCES eye (id);
ALTER TABLE glasses ADD CONSTRAINT fk_glasses_OD FOREIGN KEY (OD_ID) REFERENCES eye (id);

CREATE  TABLE users (
  username    VARCHAR(20) NOT NULL ,
  password    VARCHAR(20) NOT NULL ,
  enabled     BOOLEAN DEFAULT TRUE NOT NULL ,
  PRIMARY KEY (username)
);

CREATE TABLE roles (
  id              INTEGER IDENTITY PRIMARY KEY,
  username        VARCHAR(20) NOT NULL,
  role            VARCHAR(20) NOT NULL
);
ALTER TABLE roles ADD CONSTRAINT fk_username FOREIGN KEY (username) REFERENCES users (username);
CREATE INDEX fk_username_idx ON roles (username);

