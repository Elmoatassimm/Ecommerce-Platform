/**
 * Script to enable customer service flow after database migration
 * 
 * This script updates the order processing service to use the new
 * customer service flow instead of going directly to address collection.
 * 
 * Run this after applying the database migration:
 * 1. npx prisma migrate dev --name add-customer-service-flow
 * 2. npx prisma generate
 * 3. node scripts/enable-customer-service-flow.js
 */

const fs = require('fs');
const path = require('path');

const orderProcessingServicePath = path.join(__dirname, '../src/services/order-processing.service.ts');

// Read the current file
let content = fs.readFileSync(orderProcessingServicePath, 'utf8');

// Replace the temporary address flow with customer service flow
const oldCode = `      // TODO: After migration, enable customer service flow
      // For now, proceed to address collection directly
      await this.conversationService.updateConversation(senderId, {
        temp_order_id: order.id,
        state: ConversationState.AWAITING_ADDRESS
      });

      await this.messengerService.sendTextMessage(
        senderId,
        "تم إنشاء طلبك! يرجى إدخال عنوان التوصيل الخاص بك:"
      );`;

const newCode = `      // Customer service flow enabled after migration
      await this.conversationService.updateConversation(senderId, {
        temp_order_id: order.id,
        state: ExtendedConversationState.AWAITING_CUSTOMER_NAME as ConversationState
      });

      await this.messengerService.sendTextMessage(
        senderId,
        "تم إنشاء طلبك! لإكمال الطلب، نحتاج لبعض المعلومات الإضافية.\\n\\nيرجى إدخال اسمك الكامل:"
      );`;

// Update conversation service filtering
const oldFilterCode = `      // Filter out new fields that don't exist in DB yet
      const { temp_customer_name, temp_customer_phone, temp_customer_email, ...safeData } = data;
      
      return await this.conversationRepo.update({
        psid,
        ...safeData,
      });`;

const newFilterCode = `      // All fields now supported after migration
      return await this.conversationRepo.update({
        psid,
        ...data,
      });`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  console.log('✓ Updated order confirmation to use customer service flow');
} else {
  console.log('⚠ Order confirmation flow already updated or not found');
}

// Write the updated content
fs.writeFileSync(orderProcessingServicePath, content);

// Update conversation service
const conversationServicePath = path.join(__dirname, '../src/services/conversation.service.ts');
let convContent = fs.readFileSync(conversationServicePath, 'utf8');

if (convContent.includes(oldFilterCode)) {
  convContent = convContent.replace(oldFilterCode, newFilterCode);
  
  // Also remove the filtering in createOrUpdateConversation
  const oldCreateFilterCode = `          // Filter out new fields that don't exist in DB yet
          const { temp_customer_name, temp_customer_phone, temp_customer_email, ...safeData } = data;
          if (Object.keys(safeData).length > 0) {
            return this.updateConversation(psid, safeData);
          }`;
  
  const newCreateFilterCode = `          return this.updateConversation(psid, data);`;
  
  convContent = convContent.replace(oldCreateFilterCode, newCreateFilterCode);
  
  fs.writeFileSync(conversationServicePath, convContent);
  console.log('✓ Updated conversation service to support new fields');
} else {
  console.log('⚠ Conversation service already updated or not found');
}

console.log('\n🎉 Customer service flow is now enabled!');
console.log('\nThe bot will now automatically collect customer information when orders are placed via Messenger:');
console.log('1. Customer name (required)');
console.log('2. Phone number (required)'); 
console.log('3. Email address (optional)');
console.log('4. Delivery address');
console.log('\nMake sure to restart your application to apply the changes.');