CREATE TABLE sensor (
    id text NOT NULL PRIMARY KEY,
    name text,
    unit text DEFAULT '' NOT NULL
);

CREATE TABLE value (
    id text NOT NULL,
    "time" timestamp NOT NULL,
    value real,
    primary key(id,time)
);

