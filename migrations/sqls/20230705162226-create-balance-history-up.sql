CREATE TABLE `balance_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `prev_balance` DECIMAL(10, 2) NOT NULL,
  `new_balance` DECIMAL(10, 2) NOT NULL,
  `operation` VARCHAR(255) NOT NULL,
  `extra` VARCHAR(255),
  `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (user_id) REFERENCES users(id)
);