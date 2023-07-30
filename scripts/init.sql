SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

CREATE TABLE IF NOT EXISTS t_result_easy (
  id BINARY(16) PRIMARY KEY,
  userId VARCHAR(24) NOT NULL,
  time INT UNSIGNED NOT NULL,
  clicks SMALLINT UNSIGNED NOT NULL,
  level VARCHAR(16) NOT NULL,
  tweeted BOOLEAN NOT NULL,
  createdAt INT UNSIGNED NOT NULL
);

CREATE OR REPLACE VIEW result_easy AS 
SELECT BIN_TO_UUID(id) as id, userId, clicks, time, level, tweeted, createdAt 
FROM db.t_result_easy;

CREATE TABLE IF NOT EXISTS t_result_medium (
  id BINARY(16) PRIMARY KEY,
  userId VARCHAR(24) NOT NULL,
  time INT UNSIGNED NOT NULL,
  clicks SMALLINT UNSIGNED NOT NULL,
  level VARCHAR(16) NOT NULL,
  tweeted BOOLEAN NOT NULL,
  createdAt INT UNSIGNED NOT NULL
);

CREATE OR REPLACE VIEW result_medium AS
SELECT BIN_TO_UUID(id) as id, userId, clicks, time, level, tweeted, createdAt
FROM t_result_medium

CREATE TABLE IF NOT EXISTS t_result_hard (
  id BINARY(16) PRIMARY KEY,
  userId VARCHAR(24) NOT NULL,
  time INT UNSIGNED NOT NULL,
  clicks SMALLINT UNSIGNED NOT NULL,
  level VARCHAR(16) NOT NULL,
  tweeted BOOLEAN NOT NULL,
  createdAt INT UNSIGNED NOT NULL
);

CREATE OR REPLACE VIEW result_hard AS
SELECT BIN_TO_UUID(id) as id, userId, clicks, time, level, tweeted, createdAt
FROM t_result_hard

CREATE TABLE IF NOT EXISTS t_result_legendary (
  id BINARY(16) PRIMARY KEY,
  userId VARCHAR(24) NOT NULL,
  time INT UNSIGNED NOT NULL,
  clicks SMALLINT UNSIGNED NOT NULL,
  level VARCHAR(16) NOT NULL,
  tweeted BOOLEAN NOT NULL,
  createdAt INT UNSIGNED NOT NULL
);

CREATE OR REPLACE VIEW result_legendary AS
SELECT BIN_TO_UUID(id) as id, userId, clicks, time, level, tweeted, createdAt
FROM t_result_legendary