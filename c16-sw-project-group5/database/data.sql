--## Insert data



-- users
INSERT INTO  users(email, password)
VALUES ('enki@test.com', '1234');

--sample for users table:




-- game
INSERT INTO public.game
(user_id, media, targeted_location, hints_1, hints_2, created_at, updated_at, score_creation)
VALUES(0, '', ?, '', '', '', '', 0);

--sample for game table:


-- game_History
INSERT INTO public.game_history
(game_id, user_id, guess_location, attempts, completion, created_at, updated_at, score_completion)
VALUES(0, 0, ?, 0, false, '', '', 0);

--sample for game history:






--score
INSERT INTO public.score
(user_id, score_change, score_description, created_at, updated_at)
VALUES(0, 0, '', '', '');

--sample for score:






-- game_messages_board

-- direct_message


