// Email notification system for user signups and plan generation
// Sends notifications to istani.store@proton.me

export interface EmailNotification {
  type: 'signup' | 'plan_generated' | 'profile_updated';
  userEmail: string;
  userName: string;
  timestamp: string;
  details: any;
}

export async function sendAdminNotification(notification: EmailNotification): Promise<void> {
  try {
    // In production, this would integrate with a service like SendGrid, Resend, or Nodemailer
    // For now, we'll use a simple API endpoint that can be connected to email service

    const emailContent = formatEmailContent(notification);

    // Store notification in database for admin dashboard
    await logNotification(notification, emailContent);

    // In production, uncomment and configure email service:
    // await sendEmail({
    //   to: 'istani.store@proton.me',
    //   subject: getEmailSubject(notification.type),
    //   text: emailContent,
    // });

  } catch (error) {
    console.error('Email notification error:', error);
    // Don't throw - email failures shouldn't break user experience
  }
}

function formatEmailContent(notification: EmailNotification): string {
  const { type, userEmail, userName, timestamp, details } = notification;

  switch (type) {
    case 'signup':
      return `
🎉 NEW USER SIGNUP - Istani Fitness

User Details:
- Name: ${userName}
- Email: ${userEmail}
- Signup Time: ${timestamp}

User can now:
✅ Generate unlimited AI workout plans
✅ Generate unlimited AI meal plans
✅ Track their fitness progress
✅ Access exercise library

Platform: istani.store
      `.trim();

    case 'plan_generated':
      return `
🤖 AI PLAN GENERATED - Istani Fitness

User: ${userName} (${userEmail})
Plan Type: ${details.planType}
Generation Time: ${timestamp}
Agent Used: ${details.agentType || 'Single Agent'}

User Profile:
- Age: ${details.age}
- Gender: ${details.gender}
- Goal: ${details.fitnessGoal}

The FREE AI successfully generated a personalized ${details.planType} plan!

Platform: istani.store
      `.trim();

    case 'profile_updated':
      return `
👤 PROFILE UPDATED - Istani Fitness

User: ${userName} (${userEmail})
Updated: ${timestamp}

Changes: ${JSON.stringify(details.updates, null, 2)}

Platform: istani.store
      `.trim();

    default:
      return `Notification from Istani Fitness: ${JSON.stringify(notification)}`;
  }
}

function getEmailSubject(type: EmailNotification['type']): string {
  switch (type) {
    case 'signup':
      return '🎉 New User Signup - Istani Fitness';
    case 'plan_generated':
      return '🤖 AI Plan Generated - Istani Fitness';
    case 'profile_updated':
      return '👤 Profile Updated - Istani Fitness';
    default:
      return 'Notification - Istani Fitness';
  }
}

async function logNotification(notification: EmailNotification, content: string): Promise<void> {
  // Store in local storage or database for admin dashboard
  try {
    const log = {
      ...notification,
      emailContent: content,
      sentAt: new Date().toISOString(),
    };

    // In production, save to database
    console.log('[EMAIL NOTIFICATION]', log);

    // Could also save to a notifications table in Supabase:
    // await supabase.from('admin_notifications').insert(log);

  } catch (error) {
    console.error('Failed to log notification:', error);
  }
}

// Send welcome email to user
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
  try {
    // This would send to the user directly in production
    const welcomeContent = `
Hi ${userName}!

Welcome to Istani Fitness - Your AI-Powered Fitness Companion! 🎉

You now have access to:
✅ Unlimited AI-generated workout plans
✅ Unlimited AI-generated meal plans
✅ Comprehensive exercise library
✅ Scientific fitness education
✅ Progress tracking

Getting Started:
1. Complete your profile in the dashboard
2. Click "Generate Workout Plan" or "Generate Meal Plan"
3. Get your personalized plan in 10-30 seconds!

Our 4-agent AI system:
🤖 Planner - Analyzes your goals
🤖 Exercise Specialist - Selects perfect exercises
🤖 Nutrition Expert - Calculates your macros
🤖 Quality Control - Ensures safety

Everything is 100% FREE and science-based!

Questions? Visit: https://istani.store
Support: https://buymeacoffee.com/istanifitn

Let's get you in the best shape of your life! 💪

The Istani Fitness Team
    `.trim();

    console.log('[WELCOME EMAIL]', { to: userEmail, content: welcomeContent });

    // In production:
    // await sendEmail({ to: userEmail, subject: 'Welcome to Istani Fitness!', text: welcomeContent });

  } catch (error) {
    console.error('Welcome email error:', error);
  }
}
