CREATE TABLE `bot_accounts` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `botSteamId` VARCHAR(255) NOT NULL ,
  `name` VARCHAR(255) NOT NULL,
  `avatarHash` VARCHAR(255) NOT NULL,
  `memberSince` DATETIME NOT NULL,
  `level` INT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_bot_id` (`botSteamId`)
);