CREATE TABLE `user_trade_offers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `steamId` VARCHAR(255) NOT NULL,
  `tradeId` VARCHAR(255) UNIQUE NOT NULL,
  `tradeOfferId` VARCHAR(50) NOT NULL,
  `state` VARCHAR(50) NOT NULL,
  `type`  VARCHAR(50),
  `extra` VARCHAR(50),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_trade_id` (`tradeId`),
  FOREIGN KEY (`steamId`) REFERENCES `users`(`steamId`) ON DELETE CASCADE
);
