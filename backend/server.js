// ========================================
// GMF LIFF BACKEND SERVER
// ========================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors({
    origin: true, // Allow all origins for LIFF compatibility
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS']
})); // Allow cross-origin requests from LIFF frontend
app.use(express.json()); // Parse JSON request bodies

// ========================================
// CONFIGURATION
// ========================================
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;
const LINE_MESSAGING_API_URL = "https://api.line.me/v2/bot/message/push";

// Validate environment variables
if (!CHANNEL_ACCESS_TOKEN) {
    console.error("❌ ERROR: CHANNEL_ACCESS_TOKEN is not set in .env file");
    process.exit(1);
}

// ========================================
// HEALTH CHECK ENDPOINT
// ========================================
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "GMF LIFF Backend is running",
        timestamp: new Date().toISOString()
    });
});

// ========================================
// LIFF FORM SUBMISSION ENDPOINT
// ========================================
app.post("/liff-submit", async (req, res) => {
    try {
        console.log("📥 Received form submission:", req.body);

        // Extract form data
        const {
            company,
            contact,
            phone,
            product,
            quantity,
            budget,
            deadline,
            notes,
            userId
        } = req.body;

        // Validate required fields
        if (!company || !contact || !phone || !product || !quantity || !budget || !deadline || !userId) {
            console.error("❌ Validation error: Missing required fields");
            return res.status(400).json({
                ok: false,
                message: "Missing required fields"
            });
        }

        // Format the message for LINE OA
        const message = formatClientMessage({
            company,
            contact,
            phone,
            product,
            quantity,
            budget,
            deadline,
            notes,
            userId
        });

        console.log("📤 Sending message to LINE user:", userId);

        // Send message via LINE Messaging API
        const response = await axios.post(
            LINE_MESSAGING_API_URL,
            {
                to: userId,
                messages: [
                    {
                        type: "text",
                        text: message
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
                }
            }
        );

        console.log("✅ Message sent successfully to LINE");

        // Return success response
        res.json({
            ok: true,
            message: "Form submitted successfully"
        });

    } catch (error) {
        console.error("❌ Error processing form submission:", error.message);

        if (error.response) {
            // LINE API error
            console.error("LINE API Error:", error.response.data);
            return res.status(error.response.status).json({
                ok: false,
                message: "Failed to send message via LINE API",
                error: error.response.data
            });
        }

        // General server error
        res.status(500).json({
            ok: false,
            message: "Internal server error"
        });
    }
});

// ========================================
// MESSAGE FORMATTER
// ========================================
function formatClientMessage(data) {
    const {
        company,
        contact,
        phone,
        product,
        quantity,
        budget,
        deadline,
        notes,
        userId
    } = data;

    // Format deadline for better readability and calculate days
    let formattedDeadline = "-";
    if (deadline) {
        try {
            const deadlineDate = new Date(deadline);
            const today = new Date();

            // Reset time to midnight for accurate day calculation
            today.setHours(0, 0, 0, 0);
            deadlineDate.setHours(0, 0, 0, 0);

            // Calculate difference in days
            const diffTime = deadlineDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Format the date
            const dateString = deadlineDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });

            // Add days count if deadline is set
            if (diffDays > 0) {
                formattedDeadline = `${dateString} (${diffDays} days)`;
            } else if (diffDays === 0) {
                formattedDeadline = `${dateString} (Today)`;
            } else {
                formattedDeadline = `${dateString} (${Math.abs(diffDays)} days ago)`;
            }
        } catch (e) {
            formattedDeadline = deadline;
        }
    }

    // Get submission timestamp
    const now = new Date();
    const submittedDateTime = now.toLocaleString('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    // Build the message
    const message = `📌 Client Inquiry
━━━━━━━━━━━━━
⏰ Submitted: ${submittedDateTime}

━━━━━━━━━━━━━
🏢 ${company}
👤 ${contact}
📞 ${phone}

━━━━━━━━━━━━━
📦 Product: ${product}
🔢 Quantity: ${quantity}
💰 Budget: ${budget}
📅 Target Date: ${formattedDeadline}

━━━━━━━━━━━━━
📝 NOTES
${notes || "-"}`;

    return message;
}

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        ok: false,
        message: "An unexpected error occurred"
    });
});

// ========================================
// START SERVER
// ========================================
// Only start server if running directly (not on Vercel)
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log("🚀 GMF LIFF Backend Server started");
        console.log(`📍 Running on port: ${PORT}`);
        console.log(`🌐 Health check: http://localhost:${PORT}/`);
        console.log("✅ Ready to receive form submissions");
    });
}

// Export for Vercel serverless
module.exports = app;
