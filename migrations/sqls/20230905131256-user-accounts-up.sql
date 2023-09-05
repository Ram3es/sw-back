CREATE TABLE `user_accounts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `accountType` VARCHAR(255) NOT NULL,
    `accountNumber` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);