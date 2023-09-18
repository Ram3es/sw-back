CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `steamId` VARCHAR(255) NOT NULL,
  `steamUsername` VARCHAR(255) NOT NULL,
  `avatarUrl` VARCHAR(255) NOT NULL,
  `profileUrl` VARCHAR(255) NOT NULL,
  `payout` INT NOT NULL DEFAULT 1,
  `banned` INT NOT NULL DEFAULT 0,
  `balance` INT NOT NULL DEFAULT 0,
  `transactionsTotal` INT NOT NULL DEFAULT 0,
  `tradeUrl` VARCHAR(255),
  `notifications` INT NOT NULL DEFAULT 1,
  `active` INT NOT NULL DEFAULT 1,
  `email` VARCHAR(255),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_steam_id` (`steamId`),
  INDEX `idx_steam_id` (`steamId`)
);

