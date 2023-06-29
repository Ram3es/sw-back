CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `steam_id` VARCHAR(255) NOT NULL,
  `steam_username` VARCHAR(255) NOT NULL,
  `avatar_url` VARCHAR(255) NOT NULL,
  `profile_url` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_steam_id` (`steam_id`)
);