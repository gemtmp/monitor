--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

--
-- Data for Name: sensor_group; Type: TABLE DATA; Schema: public; Owner: www
--

COPY sensor_group (id, name) FROM stdin;
1	Отопление
2	Вентиляция
3	Устройства
4	Электричество
5	Other
\.


--
-- Data for Name: sensor; Type: TABLE DATA; Schema: public; Owner: www
--

COPY sensor (id, name, unit, group_id) FROM stdin;
Humidity	Влажность	 % 	2
280000058da27e	Коробка	 °C	2
280000058de0c3	Vent out	 °C	2
280000058de5a9	Vent in	 °C	2
28000003d606f2	Vent home in	 °C	2
280000058df288	3 floor	 °C	2
HumTemp	Vent home out	 °C	2
AC	AC	V	4
DC	DC	V	4
UPS load	UPS load	%	4
UPS	UPS	°C	4
Charge	Charge	%	4
online 0016e6dfd3ff	компьютер		3
router CPU temp	router CPU	°C	5
router /ext	место на router	Gb	5
online 0022f417241e	Планшет		3
router CPU fan	router CPU fan		5
online 000a3bf01670	Yota Modem		3
28409B8D050000DD	Вода	 °C	5
online 002376248445	HTC HD2		3
online f0def17574e0	T420s		3
280AFBD503000063	Улица	 °C	1
10A17B0F0208002E	Подача	 °C	1
281CE9D503000075	Тёплый пол	 °C	1
28C3E0D503000066	Кухня	 °C	1
TC	Выхлоп	°C	1
online a46706b2abf0	iPad		3
online 1887961e0a41	nata phone		3
online 94de800ef6ed	max comp		3
online d022bececd71	note3		3
internet online	internet		3
284C9E8D05000072	ТА-	 °C	1
105A970F0208005F	ТА+	 °C	1
28D9F8D5030000B0	Батареи+	 °C	1
28F6D68D0500006D	Батареи-	 °C	1
288D2E8E0500001D	Котёл+	 °C	1
285005D60300000E	Котёл-	 °C	1
boilerValve	Котёл клапан		1
pump	Котёл насос	 	1
radiatorValve	Батареи клапан	 	1
fails	Errors		5
\.


--
-- Name: sensor_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: www
--

SELECT pg_catalog.setval('sensor_group_id_seq', 5, true);


--
-- PostgreSQL database dump complete
--

