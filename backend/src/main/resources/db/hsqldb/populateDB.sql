INSERT INTO roles VALUES(1, 'ROLE_USER');
INSERT INTO roles VALUES(2, 'ROLE_MODERATOR');
INSERT INTO roles VALUES(3, 'ROLE_ADMIN');

-- init with test and testtest, todo remove me in production (what could possibly go wrong)
INSERT INTO users VALUES(1, '$2a$10$vpFqQIbEm0Zd0eco2hLxgOTiujxoziOGvKgbX6KE1ud8hwdHJXsE2', 'test');

INSERT INTO user_roles VALUES(1, 1);
INSERT INTO user_roles VALUES(1, 2);
INSERT INTO user_roles VALUES(1, 3);

INSERT INTO eye VALUES(1, 1.75, -0.25, 26, 2.5);
INSERT INTO eye VALUES(2, 1.75, -2.25, 46, 2.5);
INSERT INTO dispense VALUES (1,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (1, 2, 'bifocal', 'medium', 'neutral', 1, 'sa', 0, '2021-09-02 15:48:19', 2, 1);

INSERT INTO eye VALUES(3, 1.75, -0.5, 95, 3.25);
INSERT INTO eye VALUES(4, 2.5, -0.75, 99, 3.25);
INSERT INTO dispense VALUES (2,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (2, 3, 'bifocal', 'medium', 'neutral', 2, 'sa', 0, '2021-09-02 15:48:19',  4, 3);

INSERT INTO eye VALUES(5, 1.75, -0.5, 59, 3.0);
INSERT INTO eye VALUES(6, 1.25, -0.5, 148, 3.0);
INSERT INTO dispense VALUES (3,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (3, 4, 'bifocal', 'small', 'neutral', 3, 'sa', 0, '2021-09-02 15:48:19',  6, 5);

INSERT INTO eye VALUES(7, 0.5, 0.0, 0, 2.75);
INSERT INTO eye VALUES(8, 1.5, -0.5, 95, 2.75);
INSERT INTO dispense VALUES (4,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (4, 5, 'bifocal', 'medium', 'neutral', 4, 'sa', 0, '2021-09-02 15:48:19', 8, 7);

INSERT INTO eye VALUES(9, 2.0, -0.25, 5, 2.0);
INSERT INTO eye VALUES(10, 2.25, -1.0, 142, 2.0);
INSERT INTO dispense VALUES (5,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (5, 7, 'bifocal', 'medium', 'feminine', 5, 'sa', 0,'2021-09-02 15:48:19', 10, 9);

INSERT INTO eye VALUES(11, 2.5, -0.75, 104, 2.5);
INSERT INTO eye VALUES(12, 2.25, -1.25, 54, 2.5);
INSERT INTO dispense VALUES (6,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (6, 8, 'bifocal', 'medium', 'neutral', 6, 'sa', 0,'2021-09-02 15:48:19', 12, 11);

INSERT INTO eye VALUES(13, 0.0, 0.0, 0, 2.0);
INSERT INTO eye VALUES(14, 2.0, -1.25, 76, 2.0);
INSERT INTO dispense VALUES (7,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (7, 9, 'bifocal', 'medium', 'neutral', 7, 'sa', 0,'2021-09-02 15:48:19', 14, 13);

INSERT INTO eye VALUES(15, 1.5, -0.5, 101, 2.0);
INSERT INTO eye VALUES(16, 2.0, -0.5, 98, 2.0);
INSERT INTO dispense VALUES (8,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (8, 10, 'bifocal', 'medium', 'neutral', 8, 'sa', 0,'2021-09-02 15:48:19', 16, 15);

INSERT INTO eye VALUES(17, 11.0, -0.5, 82, 2.0);
INSERT INTO eye VALUES(18, 11.0, -0.25, 13, 2.0);
INSERT INTO dispense VALUES (9,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (9, 11, 'bifocal', 'small', 'neutral', 9, 'sa', 0,'2021-09-02 15:48:19', 18, 17);

INSERT INTO eye VALUES(19, -2.0, -1.0, 3, 0.0);
INSERT INTO eye VALUES(20, -1.0, -2.0, 171, 0.0);
INSERT INTO dispense VALUES (10,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (10, 12, 'single', 'small', 'neutral', 10, 'sa', 0,'2021-09-02 15:48:19', 20, 19);

INSERT INTO eye VALUES(21, 0.5, -0.5, 110, 3.25);
INSERT INTO eye VALUES(22, 0.0, -0.25, 87, 3.25);
INSERT INTO dispense VALUES (11,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (11, 13, 'bifocal', 'medium', 'feminine', 11, 'sa', 0,'2021-09-02 15:48:19', 22, 21);

INSERT INTO eye VALUES(23, 4.25, 0.0, 0, 0.0);
INSERT INTO eye VALUES(24, 2.25, 0.0, 0, 0.0);
INSERT INTO dispense VALUES (12,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (12, 14, 'single', 'large', 'neutral', 12, 'sa', 0,'2021-09-02 15:48:19', 24, 23);

INSERT INTO eye VALUES(25, 5.0, -1.25, 91, 0.0);
INSERT INTO eye VALUES(26, 5.0, -1.25, 85, 0.0);
INSERT INTO dispense VALUES (13,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (13, 15, 'single', 'medium', 'neutral', 13, 'sa', 0,'2021-09-02 15:48:19', 26, 25);

INSERT INTO eye VALUES(27, 2.0, -1.5, 63, 3.0);
INSERT INTO eye VALUES(28, 2.0, -1.5, 61, 3.0);
INSERT INTO dispense VALUES (14,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (14, 16, 'bifocal', 'medium', 'neutral', 14, 'sm', 0,'2021-09-02 15:48:19', 28, 27);

INSERT INTO eye VALUES(29, 0.5, -0.5, 9, 2.0);
INSERT INTO eye VALUES(30, 2.5, -1.75, 6, 2.0);
INSERT INTO dispense VALUES (15,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (15, 17, 'bifocal', 'small', 'feminine', 15, 'sm', 0,'2021-09-02 15:48:19', 30, 29);

INSERT INTO eye VALUES(31, 2.5, -0.75, 40, 2.25);
INSERT INTO eye VALUES(32, 2.75, -0.25, 131, 2.25);
INSERT INTO dispense VALUES (16,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (16, 18, 'bifocal', 'medium', 'neutral', 16, 'sm', 0,'2021-09-02 15:48:19', 32, 31);

INSERT INTO eye VALUES(33, 2.25, -1.0, 97, 3.0);
INSERT INTO eye VALUES(34, 3.0, -1.25, 98, 3.0);
INSERT INTO dispense VALUES (17,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (17, 19, 'bifocal', 'medium', 'feminine', 17, 'sm',0,'2021-09-02 15:48:19', 34, 33);

INSERT INTO eye VALUES(35, 3.0, -0.75, 121, 0.0);
INSERT INTO eye VALUES(36, 3.25, -0.5, 73, 0.0);
INSERT INTO dispense VALUES (18,'2019-08-15 15:48:19',null);
INSERT INTO glasses VALUES (18, 20, 'single', 'medium', 'neutral', 18, 'sm', 0,'2021-09-02 15:48:19', 36, 35);
