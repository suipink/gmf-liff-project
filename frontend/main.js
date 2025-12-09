// ========================================
// CONFIGURATION - REPLACE THESE VALUES
// ========================================
const LIFF_ID = "2008616244-wogGrZQL";
const BACKEND_URL = "https://gmf-liff-project.vercel.app";

// ========================================
// GLOBAL VARIABLES
// ========================================
let userProfile = null;

// ========================================
// LIFF INITIALIZATION
// ========================================
window.onload = async function() {
    try {
        console.log("Initializing LIFF...");
        await liff.init({ liffId: LIFF_ID });
        console.log("LIFF initialized successfully");

        // Check if user is logged in
        if (!liff.isLoggedIn()) {
            console.log("User not logged in, redirecting to login...");
            liff.login();
            return;
        }

        // Get user profile
        console.log("Getting user profile...");
        userProfile = await liff.getProfile();
        console.log("User profile obtained:", userProfile);

        // Optional: Display user info
        displayUserInfo();

    } catch (error) {
        console.error("LIFF initialization failed:", error);
        alert("Failed to initialize LIFF. Please try again.");
    }
};

// ========================================
// DISPLAY USER INFO (OPTIONAL)
// ========================================
function displayUserInfo() {
    if (userProfile) {
        console.log(`Logged in as: ${userProfile.displayName} (${userProfile.userId})`);
        // You can optionally display the user's name in the UI here
    }
}

// ========================================
// FORM SUBMISSION HANDLER
// ========================================
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("clientForm");
    const submitBtn = document.getElementById("submitBtn");
    const loadingDiv = document.getElementById("loading");

    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        // Check if we have user profile
        if (!userProfile || !userProfile.userId) {
            alert("User profile not loaded. Please refresh and try again.");
            return;
        }

        // Disable submit button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
        loadingDiv.style.display = "block";

        // Collect form data
        const formData = {
            company: document.getElementById("company").value.trim(),
            contact: document.getElementById("contact").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            product: document.getElementById("product").value.trim(),
            quantity: parseInt(document.getElementById("quantity").value),
            budget: document.getElementById("budget").value,
            deadline: document.getElementById("deadline").value || "",
            notes: document.getElementById("notes").value.trim() || "",
            userId: userProfile.userId
        };

        try {
            console.log("Submitting form data:", formData);

            // Send data to backend
            const response = await fetch(`${BACKEND_URL}/liff-submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.ok) {
                console.log("Form submitted successfully");

                // Personalized success message with customer's name
                const customerName = userProfile?.displayName || "Valued Customer";

                // Hide loading
                loadingDiv.style.display = "none";

                // Replace form with success message
                form.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px;">
                        <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
                        <h2 style="color: #3F4443; margin-bottom: 16px; font-size: 28px;">Thank You, ${customerName}!</h2>
                        <p style="color: #555; font-size: 18px; line-height: 1.6; margin-bottom: 24px;">
                            Your inquiry has been submitted successfully.
                        </p>
                        <p style="color: #888; font-size: 16px;">
                            Our sales team will contact you shortly.
                        </p>
                    </div>
                `;

                // Try to close window after delay
                setTimeout(() => {
                    if (liff.isInClient()) {
                        // Mobile LINE app - close LIFF window
                        liff.closeWindow();
                    } else {
                        // Desktop browser - try to close tab (may not work for all cases)
                        window.close();
                        // If window.close() fails, the success message will remain visible
                    }
                }, 2000);
            } else {
                throw new Error(result.message || "Submission failed");
            }

        } catch (error) {
            console.error("Submission error:", error);
            alert("❌ Failed to submit your inquiry. Please try again or contact our sales team directly.");

            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Inquiry";
            loadingDiv.style.display = "none";
        }
    });
});
