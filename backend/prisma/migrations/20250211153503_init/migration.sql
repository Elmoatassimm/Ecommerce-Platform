-- AlterTable
ALTER TABLE `Order` MODIFY `payment_method` ENUM('baridi_mob', 'cash_on_delivery') NOT NULL DEFAULT 'cash_on_delivery';
