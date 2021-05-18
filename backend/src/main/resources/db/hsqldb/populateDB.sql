
INSERT INTO eye VALUES (1, '1', '1', '1','1');
INSERT INTO eye VALUES (2, '1', '1', '1','1');

INSERT INTO glasses VALUES (1,'500','single','small','neutral','metal',TRUE,1,2);

INSERT INTO users(username,password,enabled) VALUES ('admin','{noop}admin', true);

INSERT INTO roles (username, role) VALUES ('admin', 'ROLE_OWNER_ADMIN');
INSERT INTO roles (username, role) VALUES ('admin', 'ROLE_VET_ADMIN');
INSERT INTO roles (username, role) VALUES ('admin', 'ROLE_ADMIN');
