// ========================================
// GMF LIFF BACKEND SERVER - PRODUCTION READY
// ========================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const validator = require("validator");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// SENTRY ERROR MONITORING (Optional)
// ========================================
// Only initialize if SENTRY_DSN is provided
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
            new Sentry.Integrations.Http({ tracing: true }),
            new Sentry.Integrations.Express({ app }),
            new ProfilingIntegration(),
        ],
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
    });
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    console.log("✅ Sentry error monitoring enabled");
} else {
    console.log("⚠️  Sentry disabled (SENTRY_DSN not set)");
}

// ========================================
// DATABASE CONNECTION (Optional)
// ========================================
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err.message));
} else {
    console.log("⚠️  Database disabled (MONGODB_URI not set)");
}

// Database Schema
const inquirySchema = new mongoose.Schema({
    company: { type: String, required: true },
    contact: { type: String, required: true },
    phone: { type: String, required: true },
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
    budget: { type: String, required: true },
    deadline: { type: String, required: true },
    notes: { type: String, default: "" },
    userId: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String },
});

const Inquiry = mongoose.model("Inquiry", inquirySchema);

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors({
    origin: true, // Allow all origins for LIFF compatibility
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS']
}));
app.use(express.json({ limit: '10mb' })); // Limit payload size

// Rate Limiting - Prevent spam/abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 submissions per 15 minutes per IP
    message: {
        ok: false,
        message: "Too many submissions. Please try again in 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

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
        timestamp: new Date().toISOString(),
        database: MONGODB_URI ? "connected" : "disabled",
        monitoring: process.env.SENTRY_DSN ? "enabled" : "disabled"
    });
});

// ========================================
// VALIDATION HELPERS
// ========================================
function validatePhone(phone) {
    // Remove spaces and formatting
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    // Must have at least 9 digits and max 15 digits
    if (cleanPhone.length < 9 || cleanPhone.length > 15) {
        return false;
    }
    // Must contain only valid phone characters
    return /^[\d\+]+$/.test(cleanPhone);
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    // Just trim whitespace - no HTML escaping needed for plain text LINE messages
    return validator.trim(input);
}

// ========================================
// LIFF FORM SUBMISSION ENDPOINT
// ========================================
app.post("/liff-submit", limiter, async (req, res) => {
    try {
        console.log("📥 Received form submission");

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
                message: "Please fill in all required fields (marked with *)"
            });
        }

        // Sanitize inputs
        const sanitizedData = {
            company: sanitizeInput(company),
            contact: sanitizeInput(contact),
            phone: sanitizeInput(phone),
            product: sanitizeInput(product),
            quantity: parseInt(quantity),
            budget: sanitizeInput(budget),
            deadline: sanitizeInput(deadline),
            notes: sanitizeInput(notes || ""),
            userId: sanitizeInput(userId)
        };

        // Validate phone number
        if (!validatePhone(sanitizedData.phone)) {
            return res.status(400).json({
                ok: false,
                message: "Please enter a valid phone number (9-15 digits)"
            });
        }

        // Validate quantity
        if (sanitizedData.quantity < 100 || sanitizedData.quantity > 1000000) {
            return res.status(400).json({
                ok: false,
                message: "Quantity must be between 100 and 1,000,000 pieces"
            });
        }

        // Validate deadline is not in the past
        const deadlineDate = new Date(sanitizedData.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadlineDate < today) {
            return res.status(400).json({
                ok: false,
                message: "Target delivery date cannot be in the past"
            });
        }

        // Save to database (if enabled)
        let savedInquiry = null;
        if (MONGODB_URI) {
            try {
                savedInquiry = await Inquiry.create({
                    ...sanitizedData,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent')
                });
                console.log("💾 Saved to database:", savedInquiry._id);
            } catch (dbError) {
                console.error("⚠️  Database save failed:", dbError.message);
                // Continue even if database fails - still send LINE message
            }
        }

        // Format the message for LINE OA
        const message = formatClientMessage(sanitizedData);

        console.log("📤 Sending message to LINE user:", sanitizedData.userId);

        // Send message via LINE Messaging API
        try {
            await axios.post(
                LINE_MESSAGING_API_URL,
                {
                    to: sanitizedData.userId,
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
                    },
                    timeout: 5000 // 5 second timeout
                }
            );

            console.log("✅ Message sent successfully to LINE");

            // Return success response
            res.json({
                ok: true,
                message: "Inquiry submitted successfully",
                inquiryId: savedInquiry?._id
            });

        } catch (lineError) {
            console.error("❌ LINE API error:", lineError.message);

            // Even if LINE fails, we saved to database, so it's not a total failure
            if (savedInquiry) {
                return res.status(500).json({
                    ok: false,
                    message: "Inquiry saved but notification failed. Our team will contact you soon.",
                    inquiryId: savedInquiry._id
                });
            }

            // If both LINE and database failed
            throw new Error("Failed to send notification via LINE");
        }

    } catch (error) {
        console.error("❌ Error processing form submission:", error.message);

        // Log to Sentry if enabled
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(error);
        }

        // Return user-friendly error
        res.status(500).json({
            ok: false,
            message: "Unable to submit inquiry. Please try again or contact us directly."
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
        notes
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
📝 ${submittedDateTime}
━━━━━━━━━━━━━
${company}
${contact}
📞 ${phone}
━━━━━━━━━━━━━
- Product: ${product}
- Quantity: ${quantity}
- Budget: ${budget}
🗓️ Target Date: ${formattedDeadline}
━━━━━━━━━━━━━
🗒️ NOTES
${notes || "-"}`;

    return message;
}

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================
// Sentry error handler (must be before other error handlers)
if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
}

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
