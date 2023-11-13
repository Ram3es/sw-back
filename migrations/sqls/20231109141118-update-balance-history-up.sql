ALTER TABLE `balance_history`
ADD `transactionId` VARCHAR(255) AFTER `userId`,
ADD `method` VARCHAR(50) NOT NULL AFTER `operation`,
ADD `status` VARCHAR(50) NOT NULL AFTER `operation`
