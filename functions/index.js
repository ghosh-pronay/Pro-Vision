const { initializeApp } = require("firebase-admin/app");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");

initializeApp();

exports.geminiProxy = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const apiKey =
      functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res
        .status(500)
        .json({ error: "Gemini API key not configured on server" });
      return;
    }

    try {
      const { contents, systemInstruction, generationConfig } = req.body;

      const payload = {
        contents,
        generationConfig: generationConfig || {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      };
      if (systemInstruction) {
        payload.systemInstruction = systemInstruction;
      }

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        res.status(response.status).json(data);
        return;
      }

      res.json(data);
    } catch (error) {
      console.error("[geminiProxy] Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

exports.sendWelcomeEmail = onDocumentUpdated(
  "users/{userId}",
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    if (!after?.email) return;
    if (before?.emailVerified && after?.emailVerified) return;
    if (!after?.emailVerified) return;

    const { getFirestore } = require("firebase-admin/firestore");
    const db = getFirestore();

    const name = after.email.split("@")[0];

    await db.collection("mail").add({
      to: after.email,
      message: {
        subject: "Welcome to Pro-Vision!",
        html: `
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
        `,
      },
    });

    console.log(`[welcomeEmail] Queued welcome email to ${after.email}`);
  },
);
