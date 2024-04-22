ALTER TABLE `user_trade_offers` MODIFY `botId` VARCHAR(255);
ALTER TABLE `user_trade_offers` DROP FOREIGN KEY `fk_bot_id`;