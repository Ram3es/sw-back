CREATE TABLE `trade_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tradeId` VARCHAR(255) NOT NULL,
  `appId` INT NOT NULL,
  `assetId` VARCHAR(50) NOT NULL,
  `amount` INT NOT NULL,
  `name`  VARCHAR(255),
  `iconUrl`  VARCHAR(255),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_trade_id` (`tradeId`),
  FOREIGN KEY (`tradeId`) REFERENCES `user_trade_offers`(`tradeId`) ON DELETE CASCADE
);