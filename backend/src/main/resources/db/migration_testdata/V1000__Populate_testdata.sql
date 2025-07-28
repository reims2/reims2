INSERT INTO users (id, password, username) VALUES(1000, '$2a$10$vpFqQIbEm0Zd0eco2hLxgOTiujxoziOGvKgbX6KE1ud8hwdHJXsE2', 'test');
INSERT INTO users (id, password, username) VALUES(1001, '$2a$10$vpFqQIbEm0Zd0eco2hLxgOTiujxoziOGvKgbX6KE1ud8hwdHJXsE2', 'test2');

INSERT INTO user_roles (user_id, role_id) VALUES(1000, 1);
INSERT INTO user_roles (user_id, role_id) VALUES(1000, 2);
INSERT INTO user_roles (user_id, role_id) VALUES(1001, 1);


INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(1, 1.75,  -0.25, 26, 2.5);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(2, 1.75,  -2.25, 46, 2.5);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (1, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (2, 'multifocal',  'medium', 'neutral', 1,  'sa', 0, '2017-05-12 00:00:00', 2, 1);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(3, 1.75,  -0.5, 95, 3.25);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(4, 2.5,  -0.75, 99, 3.25);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (2, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (3, 'multifocal',  'medium', 'neutral', 2,  'sa', 0, '2017-05-12 00:00:00', 4, 3);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(5, 1.75,  -0.5, 59, 3.0);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(6, 1.25,  -0.5, 148, 3.0);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (3, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (4, 'multifocal',  'small', 'neutral', 3,  'sa', 0, '2017-05-12 00:00:00', 6, 5);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(7, 0.5,  0.0, 0, 2.75);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(8, 1.5,  -0.5, 95, 2.75);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (4, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (5, 'multifocal',  'medium', 'neutral', 4,  'sa', 0, '2013-04-15 00:00:00', 8, 7);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(9, 2.0,  -0.25, 5, 2.0);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(10, 2.25,  -1.0, 142, 2.0);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (5, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (7, 'multifocal',  'medium', 'feminine', 5,  'sa', 0, '2009-11-13 00:00:00', 10, 9);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(11, 2.5,  -0.75, 104, 2.5);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(12, 2.25,  -1.25, 54, 2.5);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (6, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (8, 'multifocal',  'medium', 'neutral', 6,  'sa', 0, '2009-06-07 00:00:00', 12, 11);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(13, 0.0,  0.0, 0, 2.0);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(14, 2.0,  -1.25, 76, 2.0);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (7, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (9, 'multifocal',  'medium', 'neutral', 7,  'sa', 0, '2013-04-15 00:00:00', 14, 13);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(15, 1.5,  -0.5, 101, 2.0);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(16, 2.0,  -0.5, 98, 2.0);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (8, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (10, 'multifocal',  'medium', 'neutral', 8,  'sa', 0, '2018-04-20 00:00:00', 16, 15);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(17, 11.0,  -0.5, 82, 2.0);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(18, 11.0,  -0.25, 13, 2.0);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (9, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (11, 'multifocal',  'small', 'neutral', 9,  'sa', 0, '2010-05-12 00:00:00', 18, 17);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(19, -2.0,  -1.0, 3, 0.0);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(20, -1.0,  -2.0, 171, 0.0);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (10, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (12, 'single',  'small', 'neutral', 10,  'sa', 0, '2016-04-01 00:00:00', 20, 19);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(21, 0.5,  -0.5, 110, 3.25);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(22, 0.0,  -0.25, 87, 3.25);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (11, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (13, 'multifocal',  'medium', 'feminine', 11,  'sa', 0, '2014-05-04 00:00:00', 22, 21);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(23, 4.25,  0.0, 0, 0.0);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(24, 2.25,  0.0, 0, 0.0);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (12, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (14, 'single',  'large', 'neutral', 12,  'sa', 0, '2012-06-16 00:00:00', 24, 23);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(25, 5.0,  -1.25, 91, 0.0);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(26, 5.0,  -1.25, 85, 0.0);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (13, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (15, 'single',  'medium', 'neutral', 13,  'sa', 0, '2019-09-14 00:00:00', 26, 25);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(27, 2.0,  -1.5, 63, 3.0);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(28, 2.0,  -1.5, 61, 3.0);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (14, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (16, 'multifocal',  'medium', 'neutral', 14,  'sm', 0, '2010-05-12 00:00:00', 28, 27);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(29, 0.5,  -0.5, 9, 2.0);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(30, 2.5,  -1.75, 6, 2.0);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (15, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (17, 'multifocal',  'small', 'feminine', 15,  'sm', 0, '2014-05-04 00:00:00', 30, 29);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(31, 2.5,  -0.75, 40, 2.25);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(32, 2.75,  -0.25, 131, 2.25);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (16, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (18, 'multifocal',  'medium', 'neutral', 16,  'sm', 0, '2009-06-07 00:00:00', 32, 31);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(33, 2.25,  -1.0, 97, 3.0);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(34, 3.0,  -1.25, 98, 3.0);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (17, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (19, 'multifocal',  'medium', 'feminine', 17,  'sm', 0, '2015-05-05 00:00:00', 34, 33);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(35, 3.0,  -0.75, 121, 0.0);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(36, 3.25,  -0.5, 73, 0.0);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (18, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (20, 'single',  'medium', 'neutral', 18,  'sm', 0, '2012-06-16 00:00:00', 36, 35);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(37, 1.75,  -1.0, 85, 2.75);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(38, 2.75,  -1.5, 79, 2.75);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (19, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (21, 'multifocal',  'large', 'feminine', 19,  'sm', 0, '2017-05-12 00:00:00', 38, 37);

INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(39, 0.25,  -1.5, 118, 2.75);
INSERT INTO eye (id, sphere, cylinder, axis, additional) VALUES(40, 0.25,  -2.25, 42, 2.75);
INSERT INTO dispense (id, modify_date, previous_sku) VALUES (20, null, null);
INSERT INTO glasses (sku, glasses_type, glasses_size, appearance, dispense_id, location, dispensed, creation_date, os_id, od_id) VALUES (22, 'multifocal',  'small', 'neutral', 20,  'sm', 0, '2011-11-02 00:00:00', 40, 39);
