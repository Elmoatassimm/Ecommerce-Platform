#!/usr/bin/env node

/**
 * Order Status Update Utility
 * 
 * This script updates the status of an order and sends a notification via Messenger.
 * It's useful for testing the order status notification system.
 * 
 * Usage: node scripts/update-order-status.js <orderId> <status>
 * 
 * Example: node scripts/update-order-status.js abc123 processing
 */

require('dotenv').config();
const { container } = require('../src/config/container');
const OrderService = require('../src/services/order.service').default;

// Get the order service from the container
const orderService = container.resolve(OrderService);

// Parse command line arguments
const orderId = process.argv[2];
const status = process.argv[3];

// Validate arguments
if (!orderId || !status) {
  console.error('❌ Missing required arguments');
  console.error('Usage: node scripts/update-order-status.js <orderId> <status>');
  console.error('Valid statuses: pending, processing, shipped, delivered, cancelled');
  process.exit(1);
}

// Validate status
const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
if (!validStatuses.includes(status)) {
  console.error(`❌ Invalid status: ${status}`);
  console.error(`Valid statuses: ${validStatuses.join(', ')}`);
  process.exit(1);
}

// Update the order status
console.log(`🔄 Updating order ${orderId} status to ${status}...`);

orderService.updateOrderStatusWithNotification(orderId, status)
  .then(updatedOrder => {
    console.log(`✅ Order status updated successfully`);
    console.log(`Order ID: ${updatedOrder.id}`);
    console.log(`New Status: ${updatedOrder.status}`);
    console.log(`Updated At: ${updatedOrder.updated_at}`);
    
    if (updatedOrder.customer_messenger_id) {
      console.log(`✅ Notification sent to Messenger ID: ${updatedOrder.customer_messenger_id}`);
    } else {
      console.log(`⚠️ No Messenger ID associated with this order. No notification sent.`);
    }
    
    process.exit(0);
  })
  .catch(error => {
    console.error(`❌ Failed to update order status: ${error.message}`);
    process.exit(1);
  });
