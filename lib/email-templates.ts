/**
 * Email Templates
 * Pre-designed HTML email templates for various notifications
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const BRAND_COLOR = '#00ff88';
const BRAND_NAME = 'ISTANI';

const baseStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #0a0f1e; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #00cc66 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #0a0f1e; margin: 0; font-size: 32px; font-weight: 900; }
    .content { padding: 40px 30px; color: #333333; }
    .button { display: inline-block; padding: 16px 32px; background-color: ${BRAND_COLOR}; color: #0a0f1e; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background-color: #f5f5f5; padding: 30px; text-align: center; color: #666666; font-size: 14px; }
    .stats { background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stat-item { display: inline-block; margin: 10px 20px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: ${BRAND_COLOR}; }
    .stat-label { font-size: 12px; color: #666666; }
  </style>
`;

export class EmailTemplates {
  /**
   * Welcome email for new users
   */
  static welcome(userName: string, activationLink: string): EmailTemplate {
    return {
      subject: `Welcome to ${BRAND_NAME}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${BRAND_NAME}</h1>
            </div>
            <div class="content">
              <h2>Welcome, ${userName}!</h2>
              <p>We're excited to have you join the ${BRAND_NAME} community. Your journey to better fitness starts now!</p>
              <p>Here's what you can do next:</p>
              <ul>
                <li>Set up your fitness goals</li>
                <li>Log your first meal or workout</li>
                <li>Connect with the community</li>
                <li>Explore our AI-powered recommendations</li>
              </ul>
              <a href="${activationLink}" class="button">Activate Your Account</a>
              <p>If you didn't create this account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 ${BRAND_NAME}. All rights reserved.</p>
              <p><a href="https://istani.org/unsubscribe">Unsubscribe</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to ${BRAND_NAME}, ${userName}! Activate your account: ${activationLink}`,
    };
  }

  /**
   * Order confirmation email
   */
  static orderConfirmation(
    orderNumber: string,
    items: Array<{ name: string; quantity: number; price: number }>,
    total: number
  ): EmailTemplate {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>$${item.price.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    return {
      subject: `Order Confirmation #${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${BRAND_NAME}</h1>
            </div>
            <div class="content">
              <h2>Order Confirmed!</h2>
              <p>Thank you for your purchase. Your order #${orderNumber} has been confirmed.</p>
              <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #ddd;">
                    <th style="text-align: left; padding: 10px;">Item</th>
                    <th style="text-align: center; padding: 10px;">Qty</th>
                    <th style="text-align: right; padding: 10px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr style="border-top: 2px solid #ddd; font-weight: bold;">
                    <td colspan="2" style="text-align: right; padding: 10px;">Total:</td>
                    <td style="text-align: right; padding: 10px;">$${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <a href="https://istani.org/orders/${orderNumber}" class="button">View Order Details</a>
            </div>
            <div class="footer">
              <p>&copy; 2024 ${BRAND_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Order #${orderNumber} confirmed. Total: $${total.toFixed(2)}`,
    };
  }

  /**
   * Workout reminder email
   */
  static workoutReminder(userName: string, workoutPlan: string): EmailTemplate {
    return {
      subject: `Time for your ${workoutPlan} workout!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${BRAND_NAME}</h1>
            </div>
            <div class="content">
              <h2>Hey ${userName}, time to get moving!</h2>
              <p>Your ${workoutPlan} workout is scheduled for today. Let's crush it!</p>
              <div class="stats">
                <p><strong>💪 Today's Focus:</strong> ${workoutPlan}</p>
                <p><strong>⏱️ Estimated Time:</strong> 45-60 minutes</p>
              </div>
              <a href="https://istani.org/workouts" class="button">Start Workout</a>
              <p><small>Don't want reminders? <a href="https://istani.org/settings/notifications">Manage preferences</a></small></p>
            </div>
            <div class="footer">
              <p>&copy; 2024 ${BRAND_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Time for your ${workoutPlan} workout! Visit https://istani.org/workouts`,
    };
  }

  /**
   * Weekly progress report
   */
  static weeklyProgress(
    userName: string,
    stats: {
      workouts: number;
      calories: number;
      weightChange: number;
      streak: number;
    }
  ): EmailTemplate {
    return {
      subject: `Your Weekly Progress Report`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${BRAND_NAME}</h1>
            </div>
            <div class="content">
              <h2>Great week, ${userName}!</h2>
              <p>Here's how you performed this week:</p>
              <div class="stats">
                <div class="stat-item">
                  <div class="stat-value">${stats.workouts}</div>
                  <div class="stat-label">Workouts</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${stats.calories}</div>
                  <div class="stat-label">Avg Calories</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${stats.weightChange > 0 ? '+' : ''}${stats.weightChange.toFixed(1)} lbs</div>
                  <div class="stat-label">Weight Change</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${stats.streak} 🔥</div>
                  <div class="stat-label">Day Streak</div>
                </div>
              </div>
              <a href="https://istani.org/progress" class="button">View Full Report</a>
              <p>Keep up the amazing work! You're ${stats.streak} days into your streak.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 ${BRAND_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Weekly Progress: ${stats.workouts} workouts, ${stats.calories} avg calories, ${stats.weightChange.toFixed(1)} lbs change`,
    };
  }

  /**
   * Achievement unlocked email
   */
  static achievementUnlocked(userName: string, achievement: string, description: string): EmailTemplate {
    return {
      subject: `🏆 Achievement Unlocked: ${achievement}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${BRAND_NAME}</h1>
            </div>
            <div class="content">
              <h2 style="text-align: center; font-size: 48px; margin: 20px 0;">🏆</h2>
              <h2 style="text-align: center;">Congratulations, ${userName}!</h2>
              <p style="text-align: center; font-size: 20px; color: ${BRAND_COLOR}; font-weight: bold;">${achievement}</p>
              <p style="text-align: center;">${description}</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://istani.org/achievements" class="button">View All Achievements</a>
              </div>
              <p style="text-align: center; color: #666;">Share your achievement with the community!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 ${BRAND_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Achievement Unlocked: ${achievement}! ${description}`,
    };
  }

  /**
   * Password reset email
   */
  static passwordReset(userName: string, resetLink: string): EmailTemplate {
    return {
      subject: `Reset Your ${BRAND_NAME} Password`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${BRAND_NAME}</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hi ${userName},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 ${BRAND_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Reset your password: ${resetLink}`,
    };
  }

  /**
   * Friend request notification
   */
  static friendRequest(userName: string, friendName: string, profileLink: string): EmailTemplate {
    return {
      subject: `${friendName} sent you a friend request`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${BRAND_NAME}</h1>
            </div>
            <div class="content">
              <h2>New Friend Request</h2>
              <p>Hi ${userName},</p>
              <p><strong>${friendName}</strong> wants to connect with you on ${BRAND_NAME}!</p>
              <a href="${profileLink}" class="button">View Profile & Accept</a>
              <p>Connect with friends to share workouts, compete in challenges, and motivate each other!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 ${BRAND_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `${friendName} sent you a friend request. View: ${profileLink}`,
    };
  }

  /**
   * Challenge invitation
   */
  static challengeInvite(
    userName: string,
    challengeName: string,
    inviterName: string,
    challengeLink: string
  ): EmailTemplate {
    return {
      subject: `You've been invited to ${challengeName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${BRAND_NAME}</h1>
            </div>
            <div class="content">
              <h2>Challenge Invitation</h2>
              <p>Hi ${userName},</p>
              <p><strong>${inviterName}</strong> has invited you to join the <strong>${challengeName}</strong> challenge!</p>
              <p>Are you ready to compete and push your limits?</p>
              <a href="${challengeLink}" class="button">Accept Challenge</a>
              <p>Challenges are a great way to stay motivated and achieve your fitness goals together!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 ${BRAND_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `${inviterName} invited you to ${challengeName}. Join: ${challengeLink}`,
    };
  }
}

export default EmailTemplates;
