const { initializeApp } = require("firebase-admin/app");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");

initializeApp();

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const FROM_EMAIL = defineSecret("FROM_EMAIL");

exports.sendWelcomeEmail = onDocumentUpdated(
  {
    document: "users/{userId}",
    secrets: [RESEND_API_KEY, FROM_EMAIL],
  },
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    if (!after?.email) return;
    if (before?.emailVerified && after?.emailVerified) return;
    if (!after?.emailVerified) return;

    const apiKey = RESEND_API_KEY.value();
    const fromAddress = FROM_EMAIL.value();

    if (!apiKey || !fromAddress) {
      console.error("[welcomeEmail] Missing RESEND_API_KEY or FROM_EMAIL");
      return;
    }

    const name = after.email.split("@")[0];

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1A6FB5; margin-bottom: 8px;">Welcome to Pro-Vision!</h1>
          <p style="color: #666; font-size: 16px;">Plan · Focus · Achieve</p>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #1e293b;">Hi ${name},</h2>
          <p style="color: #475569; line-height: 1.6;">
            Your email has been verified! Welcome aboard. Here's what you can do:
          </p>
          <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
            <li><strong>Track Tasks &amp; Habits</strong> — Stay organized with daily to-dos and habit tracking</li>
            <li><strong>Manage Finances</strong> — Log expenses, set savings goals, and monitor budgets</li>
            <li><strong>Monitor Wellbeing</strong> — Track mood, sleep, nutrition, and exercise</li>
            <li><strong>Set Goals</strong> — Define and track personal and professional goals</li>
            <li><strong>Get Insights</strong> — AI-powered recommendations based on your data</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://pro-visions.web.app/dashboard"
             style="background: linear-gradient(135deg, #1A6FB5, #155a94); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 40px;">
          Questions? Just reply to this email — we're here to help!
        </p>
      </div>
    `;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: after.email,
          subject: "Welcome to Pro-Vision!",
          html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(
          `[welcomeEmail] Resend error (${res.status}): ${errText}`,
        );
      } else {
        console.log(`[welcomeEmail] Welcome email sent to ${after.email}`);
      }
    } catch (err) {
      console.error("[welcomeEmail] Failed:", err);
    }
  },
);
