
export const messageTemplates = {
  payment_reminder: "Dear {studentName}, this is a friendly reminder that you have an outstanding fee balance of KSh {amount} ({percentage}% of total fees). Please make payment by {dueDate} to avoid any inconvenience. Thank you.",
  overdue_notice: "Dear {studentName}, your payment of KSh {amount} is now overdue ({percentage}% of total fees unpaid). Please settle this amount immediately to maintain your student status. Contact the finance office for assistance.",
  payment_confirmation: "Dear {studentName}, we confirm receipt of your payment of KSh {amount} for {feeType}. Your receipt number is {receiptNumber}. Thank you for your payment.",
  clearance_reminder: "Dear {studentName}, please ensure all outstanding fees are cleared before your clearance deadline. Current balance: KSh {amount} ({percentage}% unpaid). Visit the finance office for more details.",
  percentage_warning: "Dear {studentName}, you currently owe {percentage}% of your total fees (KSh {amount}). Immediate payment is required to avoid service interruption. Please visit the finance office."
};

export type MessageTemplateKey = keyof typeof messageTemplates;
