// Mock email service - replace with actual email provider
export async function sendOrderConfirmation(order: any) {
  const emailContent = `
    Dear Customer,

    Thank you for your order!

    Order ID: ${order.internal_ref}
    Total: $${order.total.toFixed(2)}
    Payment Method: Paid via PayPal

    Items:
    ${order.items.map((item: any) => `- ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

    Your order will be processed shortly.

    Best regards,
    Petale Team
  `;

  console.log('Sending email to:', order.customer_email);
  console.log('Email content:', emailContent);

  // In production, integrate with email service like SendGrid, Mailgun, etc.
  // For now, just log the email
}