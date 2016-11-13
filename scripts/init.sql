CREATE TABLE sensor_group (
    id SERIAL NOT NULL PRIMARY KEY,
    name text
);

CREATE TABLE sensor (
    id text NOT NULL PRIMARY KEY,
    name text,
    unit text DEFAULT '' NOT NULL,
    group_id integer REFERENCES sensor_group (id)  
);

CREATE TABLE value (
    id text NOT NULL,
    "time" timestamp NOT NULL,
    value real,
    primary key(id,time)
);

