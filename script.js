console.log("Mafiya Holidays: script.js is loading...");

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("Mafiya Holidays: DOM is ready.");

    // --- CONFIGURATION ---
    
    // 1. Supabase Config
    const SUPABASE_URL = "https://ozxkhbjjjihnwekzgegg.supabase.co"; 
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96eGtoYmpqamlobndla3pnZWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTA2NTUsImV4cCI6MjA4Njk2NjY1NX0.iR9z1GN5p0P4nAkdimOs98wAhYJZlRJN0nr6T_pQtks"

    // 2. EmailJS Config
    const EMAILJS_PUBLIC_KEY = "GDIrenLc4UuVvXCTZ"; 
    const EMAILJS_SERVICE_ID = "service_1d8o2za"; 
    const EMAILJS_TEMPLATE_ID = "template_x1e7zys"; 

    // Initialize EmailJS
    if (window.emailjs) {
        emailjs.init({
            publicKey: EMAILJS_PUBLIC_KEY,
        });
        console.log("Mafiya Holidays: EmailJS Initialized.");
    }

    // --- FORM HANDLING ---
    const tripForm = document.getElementById("tripForm");
    if (!tripForm) {
        console.error("Mafiya Holidays Error: Could not find #tripForm!");
        return;
    }

    tripForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("Mafiya Holidays: Form submit intercepted.");

        // Check Libraries
        if (!window.supabase || !window.emailjs) {
            alert("Error: Required libraries not found! Check your connection.");
            return;
        }

        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const submitBtn = tripForm.querySelector(".submit-btn");
        const originalBtnText = submitBtn.innerText;
        
        // Collect Data
        const formData = {
            group_name: document.getElementById("groupName").value,
            college_name: document.getElementById("collegeName").value,
            email: document.getElementById("userEmail").value,
            user_name: document.getElementById("userName").value,
            from_location: document.getElementById("fromLocation").value,
            to_location: document.getElementById("toLocation").value,
            trip_type: document.getElementById("tripType").value,
            members_count: parseInt(document.getElementById("membersCount").value),
            staff_count: parseInt(document.getElementById("staffCount").value),
            duration_days: parseInt(document.getElementById("durationDays").value),
            mobile_number: document.getElementById("mobileNumber").value,
            created_at: new Date().toISOString()
        };

        try {
            submitBtn.innerText = "SENDING...";
            submitBtn.disabled = true;

            // 1. Save to Supabase
            console.log("Mafiya Holidays: Saving to Supabase...");
            const { error: dbError } = await supabaseClient.from("trips").insert([formData]);
            
            if (dbError) {
                console.error("Supabase Error Details:", dbError);
                throw new Error("Supabase Database Error: " + dbError.message);
            }
            console.log("Mafiya Holidays: Saved to Supabase successfully.");

            // 2. Send via EmailJS (if configured)
            if (EMAILJS_PUBLIC_KEY !== "") {
                console.log("Mafiya Holidays: Sending EmailJS notification...");
                const emailParams = {
                    group_name: formData.group_name,
                    college_name: formData.college_name,
                    email: formData.email,
                    user_name: formData.user_name,
                    from_location: formData.from_location,
                    to_location: formData.to_location,
                    trip_type: formData.trip_type,
                    members_count: formData.members_count,
                    staff_count: formData.staff_count,
                    duration_days: formData.duration_days,
                    mobile_number: formData.mobile_number
                };

                try {
                    const emailResponse = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams);
                    console.log("Mafiya Holidays: Email successfully sent!", emailResponse.status, emailResponse.text);
                } catch (emailErr) {
                    console.error("Detailed EmailJS Error:", emailErr);
                    // Extract the specific error message from EmailJS
                    const errorText = emailErr?.text || emailErr?.message || "Unknown EmailJS Error";
                    alert("⚠️ Data saved to Database, but Email failed: " + errorText + " (Check Service ID: " + EMAILJS_SERVICE_ID + ")");
                }
            }

            // 3. Celebration
            if (window.confetti) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#f5b041', '#1a5276', '#ffffff']
                });
            }

            alert("✅ Trip registration submitted successfully!");
            tripForm.reset();

        } catch (err) {
            console.error("Critical Submission Failure:", err);
            alert("❌ Database Error: " + err.message);
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    console.log("Mafiya Holidays: Setup complete.");
});
