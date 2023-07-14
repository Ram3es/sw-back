CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `steam_id` VARCHAR(255) NOT NULL,
  `steam_username` VARCHAR(255) NOT NULL,
  `avatar_url` VARCHAR(255) NOT NULL,
  `profile_url` VARCHAR(255) NOT NULL,
  `payout_ok` INT NOT NULL DEFAULT 1,
  `banned` INT NOT NULL DEFAULT 0,
  `balance` INT NOT NULL DEFAULT 0,
  `transactions_total` INT NOT NULL DEFAULT 0,
  `trade_url` VARCHAR(255),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_steam_id` (`steam_id`),
  INDEX `idx_steam_id` (`steam_id`)
);