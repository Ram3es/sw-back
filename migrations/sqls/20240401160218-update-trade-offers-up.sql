ALTER TABLE `user_trade_offers` MODIFY `botId` INT;
ALTER TABLE `user_trade_offers` ADD CONSTRAINT `fk_bot_id` FOREIGN KEY (`botId`) REFERENCES `bot_accounts` (`id`);