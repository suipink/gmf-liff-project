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
// OFFLINE/ONLINE DETECTION
// ========================================
window.addEventListener('offline', () => {
    showNotification('⚠️ No internet connection. Please check your network.', 'warning');
});

window.addEventListener('online', () => {
    showNotification('✅ Connection restored!', 'success');
});

// ========================================
// NOTIFICATION HELPER
// ========================================
function showNotification(message, type = 'info') {
    // Simple alert for now - could be upgraded to toast notifications
    if (type === 'error' || type === 'warning') {
        alert(message);
    } else {
        console.log(message);
    }
}

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
        console.log("User profile obtained:", userProfile.displayName);

        // Optional: Display user info
        displayUserInfo();

    } catch (error) {
        console.error("LIFF initialization failed:", error);

        // Show user-friendly error page
        document.body.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; font-family: 'Poppins', sans-serif;">
                <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                <h2 style="color: #3F4443; margin-bottom: 16px;">Unable to Load Form</h2>
                <p style="color: #666; font-size: 16px; margin-bottom: 24px;">
                    Please open this form from the LINE app
                </p>
                <p style="color: #aaa; font-size: 12px;">
                    Error: ${error.message || 'LIFF initialization failed'}
                </p>
            </div>
        `;
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

    // Set minimum date to today for the deadline field
    const deadlineInput = document.getElementById("deadline");
    if (deadlineInput) {
        const today = new Date().toISOString().split('T')[0];
        deadlineInput.setAttribute('min', today);
    }

    // Validation helper function
    function validateForm() {
        let isValid = true;
        const fields = [
            { id: 'company', required: true },
            { id: 'contact', required: true },
            { id: 'phone', required: true },
            { id: 'product', required: true },
            { id: 'quantity', required: true },
            { id: 'budget', required: true },
            { id: 'deadline', required: true },
            { id: 'notes', required: false }
        ];

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!input) return;

            // Remove previous validation classes
            input.classList.remove('error', 'success');

            // Get value handling different input types
            const value = input.value;
            const isEmpty = !value || (typeof value === 'string' && value.trim() === '');

            // Check if field is valid
            if (field.required && isEmpty) {
                input.classList.add('error');
                isValid = false;
            } else if (!input.checkValidity()) {
                // Use HTML5 validation for format checks
                input.classList.add('error');
                isValid = false;
            } else if (field.required && !isEmpty) {
                // Only show success for required fields that are filled
                input.classList.add('success');
            }
        });

        return isValid;
    }

    // Add real-time validation removal (remove error when user starts fixing)
    const allInputs = form.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove error class when user starts typing
            if (this.classList.contains('error')) {
                this.classList.remove('error');
            }
        });
    });

    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        // Validate form first
        if (!validateForm()) {
            // Scroll to first error
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            alert("⚠️ Please fill in all required fields correctly.");
            return;
        }

        // Check if we have user profile
        if (!userProfile || !userProfile.userId) {
            alert("⚠️ User profile not loaded. Please refresh the page and try again.");
            return;
        }

        // Check if online
        if (!navigator.onLine) {
            alert("⚠️ No internet connection. Please check your network and try again.");
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

        // Setup timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            console.log("Submitting form data...");

            // Send data to backend with timeout
            const response = await fetch(`${BACKEND_URL}/liff-submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

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
                        <img src="NongGiftSticker_Set2-07.png" alt="Success" style="width: 150px; height: auto; margin: 0 auto 20px; display: block;">
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
                        // Desktop browser - try to close tab
                        window.close();
                        // If window.close() fails, the success message will remain visible
                    }
                }, 1000);

            } else {
                // Backend returned an error
                throw new Error(result.message || "Submission failed");
            }

        } catch (error) {
            console.error("Submission error:", error);

            let errorMessage = "❌ Failed to submit your inquiry.";

            // Provide specific error messages
            if (error.name === 'AbortError') {
                errorMessage = "⏱️ Request timed out. Please check your internet connection and try again.";
            } else if (error.message.includes("network") || error.message.includes("fetch")) {
                errorMessage = "🌐 Network error. Please check your internet connection and try again.";
            } else if (error.message.includes("Too many submissions")) {
                errorMessage = "⚠️ Too many submissions. Please wait 15 minutes before trying again.";
            } else if (error.message.includes("phone")) {
                errorMessage = "📞 " + error.message;
            } else if (error.message.includes("quantity")) {
                errorMessage = "🔢 " + error.message;
            } else if (error.message.includes("delivery date")) {
                errorMessage = "📅 " + error.message;
            } else if (error.message) {
                errorMessage = "❌ " + error.message;
            }

            errorMessage += "\n\nPlease try again or contact our sales team directly.";

            alert(errorMessage);

            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Inquiry";
            loadingDiv.style.display = "none";
        }
    });
});
