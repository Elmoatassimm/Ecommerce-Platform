// Extended conversation states for customer service flow
// These will be added to Prisma schema after migration

export const ExtendedConversationState = {
  AWAITING_CUSTOMER_NAME: "AWAITING_CUSTOMER_NAME",
  AWAITING_CUSTOMER_PHONE: "AWAITING_CUSTOMER_PHONE", 
  AWAITING_CUSTOMER_EMAIL: "AWAITING_CUSTOMER_EMAIL"
} as const;

export type ExtendedConversationStateType = typeof ExtendedConversationState[keyof typeof ExtendedConversationState];