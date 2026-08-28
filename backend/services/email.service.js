const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendVerificationEmail = async (email, name, verificationLink) => {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = 'Verify Your Email - Event Handling System';
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Event Handling System',
      email: process.env.BREVO_SENDER_EMAIL || 'noreply@eventhandling.com',
    };
    sendSmtpEmail.to = [{ email, name }];
    sendSmtpEmail.htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">Event Handling System</h1>
          <p style="color: #a0a0b0; margin-top: 8px;">Email Verification</p>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 8px; border: 1px solid #2a2a4a;">
          <p style="margin-top: 0;">Hello <strong style="color: #7c3aed;">${name}</strong>,</p>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #a0a0b0; font-size: 14px;">This link expires in 24 hours. If you did not create an account, please ignore this email.</p>
        </div>
        <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">© Event Handling Management System</p>
      </div>
    `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return result;
  } catch (error) {
    console.error('Brevo verification email error:', error.message);
    throw new Error('Failed to send verification email');
  }
};

const sendPasswordResetEmail = async (email, name, resetLink) => {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = 'Password Reset - Event Handling System';
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Event Handling System',
      email: process.env.BREVO_SENDER_EMAIL || 'noreply@eventhandling.com',
    };
    sendSmtpEmail.to = [{ email, name }];
    sendSmtpEmail.htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">Event Handling System</h1>
          <p style="color: #a0a0b0; margin-top: 8px;">Password Reset</p>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 8px; border: 1px solid #2a2a4a;">
          <p style="margin-top: 0;">Hello <strong style="color: #7c3aed;">${name}</strong>,</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #a0a0b0; font-size: 14px;">This link expires in 1 hour. If you did not request a password reset, please ignore this email.</p>
        </div>
        <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">© Event Handling Management System</p>
      </div>
    `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return result;
  } catch (error) {
    console.error('Brevo password reset email error:', error.message);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
