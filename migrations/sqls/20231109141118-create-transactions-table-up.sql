CREATE TABLE `user_transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `transactionId` VARCHAR(255) UNIQUE NOT NULL,
  `type`  VARCHAR(50) NOT NULL,
  `amount` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `method` VARCHAR(50) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_transaction_id` (`transactionId`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);