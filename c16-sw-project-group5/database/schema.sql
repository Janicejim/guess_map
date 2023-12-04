-- Create user   ##用住自已果個user先
-- create user mapPickerAdmin with password 'mapPickerAdmin' superuser;
-- create db command
create database "map-picker";
-- 起完db 先進dq 再create table
\ c map - picker;
--##Create Table List
-- Drop t
-- DROP TABLE public.users;

CREATE TABLE users (
	id serial primary KEY,
	name varchar(255) NULL,
	email varchar(255) NOT NULL,
	password varchar(255) NOT NULL,
	profile_image varchar(255) NULL,
	description text NULL,
	total_score BIGINT NULL,
	level integer NULL,
	role integer NULL,
	created_at timestamp NULL,
	updated_at timestamp NULL
);

-- Game
CREATE TABLE game (
	id serial primary KEY,
	user_id INTEGER,
	media varchar(255) NOT NULL,
	targeted_location point NOT NULL,
	hints_1 varchar(255) NOT NULL,
	hints_2 varchar(255) NOT NULL,
	created_at timestamp NULL,
	updated_at timestamp NULL
);


CREATE TABLE likes (
	id serial primary key,
	game_id INTEGER,
	FOREIGN KEY (game_id) REFERENCES game(id),
	user_id INTEGER,
	FOREIGN KEY (user_id) REFERENCES users(id),
	created_at timestamp NULL,
	updated_at timestamp NULL,
	like_change int8 NULL
);

CREATE TABLE dislikes (
	id serial primary key,
	game_id INTEGER,
	FOREIGN KEY (game_id) REFERENCES game(id),
	user_id INTEGER,
	FOREIGN KEY (user_id) REFERENCES users(id),
	created_at timestamp NULL,
	updated_at timestamp NULL,
	dislike_change int8 NULL
);



CREATE TABLE game_history (
	id serial primary KEY,
	game_id INTEGER,
	FOREIGN KEY (game_id) REFERENCES game(id),
	user_id INTEGER,
	FOREIGN KEY (user_id) REFERENCES users(id),
	guess_location point,
	attempts INTEGER,
	completion boolean,
	created_at timestamp NULL,
	updated_at timestamp NULL
);
CREATE TABLE score(
id serial primary KEY,
user_id INTEGER,
FOREIGN KEY (user_id) REFERENCES users(id),
score_change int8 NULL,
score_description varchar(255) NOT NULL,
created_at timestamp NULL,
updated_at timestamp NULL
);

-- sore_description include: upload game, win game,dislike by other, like by other


-- Game_History ##many to many
-- Game_Messages_Board
-- Direct Message