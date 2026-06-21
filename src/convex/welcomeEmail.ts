import { v } from "convex/values";
import { internalAction } from "./_generated/server";

export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const { email, name } = args;
    const displayName = name || email.split("@")[0];

    const subject = "Welcome to Pro-Vision!";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin-bottom: 8px;">Welcome to Pro-Vision!</h1>
          <p style="color: #666; font-size: 16px;">Your all-in-one life management platform</p>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #1e293b;">Hi ${displayName},</h2>
          <p style="color: #475569; line-height: 1.6;">
            Thank you for joining Pro-Vision! Here's what you can do:
          </p>
          <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
            <li><strong>Track Tasks & Habits</strong> — Stay organized with daily to-dos and habit tracking</li>
            <li><strong>Manage Finances</strong> — Log expenses, set savings goals, and monitor budgets</li>
            <li><strong>Monitor Wellbeing</strong> — Track mood, sleep, nutrition, and exercise</li>
            <li><strong>Set Goals</strong> — Define and track personal and professional goals</li>
            <li><strong>Get Insights</strong> — AI-powered recommendations based on your data</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${typeof window !== "undefined" ? window.location.origin : "https://pro-vision.app"}/dashboard"
             style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 40px;">
          Questions? Just reply to this email — we're here to help!
        </p>
      </div>
    `;

    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.WEEKLY_REPORT_FROM_EMAIL;

    if (!apiKey || !fromAddress) {
      console.error(
        "[welcomeEmail] Email not sent: set RESEND_API_KEY and WEEKLY_REPORT_FROM_EMAIL " +
          "as Convex environment variables to enable welcome emails.",
      );
      return;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: email,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `[welcomeEmail] Resend API error (${res.status}): ${errText}`,
      );
    }
  },
});
