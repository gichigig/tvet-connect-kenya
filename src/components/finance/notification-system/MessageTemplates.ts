// Message templates for notifications

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export type MessageTemplateKey = '1' | '2';

export const defaultTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Fee Due Reminder',
    subject: 'Fee Payment Due - {studentName}',
    body: 'Dear {studentName}, your fee payment of {amount} is due on {dueDate}.',
    variables: ['studentName', 'amount', 'dueDate']
  },
  {
    id: '2',
    name: 'Payment Confirmation',
    subject: 'Payment Received - {studentName}',
    body: 'Thank you {studentName}, we have received your payment of {amount}.',
    variables: ['studentName', 'amount']
  }
];

export const messageTemplates = defaultTemplates;

export const getTemplate = (id: string): MessageTemplate | undefined => {
  return defaultTemplates.find(template => template.id === id);
};