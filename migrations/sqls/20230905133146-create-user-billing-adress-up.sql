CREATE TABLE `user_billing_address` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `firstName` VARCHAR(50) NOT NULL,
    `lastName` VARCHAR(50) NOT NULL,
    `streetAddress` VARCHAR(255) NOT NULL,
    `streetAddress2` VARCHAR(255),
    `city` VARCHAR(100) NOT NULL,
    `province` VARCHAR(100),
    `zip` VARCHAR(20) NOT NULL,
    `country` VARCHAR(100) NOT NULL,
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
