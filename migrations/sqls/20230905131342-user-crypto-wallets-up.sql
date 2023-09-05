CREATE TABLE `user_crypto_wallets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `wallet` VARCHAR(255) NOT NULL,
    `currency` VARCHAR(50) NOT NULL,
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);