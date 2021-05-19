
INSERT INTO eye VALUES (1, '1', '1', '1','1');
INSERT INTO eye VALUES (2, '1', '1', '1','1');
INSERT INTO eye VALUES (3, '1', '1', '1','1');
INSERT INTO eye VALUES (4, '1', '1', '1','1');
INSERT INTO eye VALUES (5, '1', '1', '1','1');
INSERT INTO eye VALUES (6, '1', '1', '1','1');

INSERT INTO glasses VALUES (1,4,'single','small','neutral',TRUE,'San Miguel',1,2);

INSERT INTO glasses VALUES (2,1,'single','small','neutral',TRUE,'Halen',3,4);
INSERT INTO glasses VALUES (3,2,'single','small','neutral',TRUE,'San Miguel',5,6);

INSERT INTO users(username,password,enabled) VALUES ('admin','{noop}admin', true);

INSERT INTO roles (username, role) VALUES ('admin', 'ROLE_OWNER_ADMIN');
INSERT INTO roles (username, role) VALUES ('admin', 'ROLE_VET_ADMIN');
INSERT INTO roles (username, role) VALUES ('admin', 'ROLE_ADMIN');
