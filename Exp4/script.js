function showAlert(message, type = "success") {
    const container = document.getElementById("alertContainer");
    if (!container) {
        alert(message);
        return;
    }

    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show mb-3" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
}

function searchDestination() {
    const t = document.getElementById("searchInput").value.toLowerCase().trim();
    const destinations = ["goa", "manali", "kashmir", "kerala", "jaipur", "andaman", "ladakh"];

    if (t === "") {
        showAlert("Please enter a destination to search.", "warning");
        return;
    }

    if (destinations.includes(t)) {
        showAlert("Destination found: " + t.toUpperCase() + ". Redirecting to catalogue...", "success");
        setTimeout(() => {
            window.location.href = "catalogue.html";
        }, 700);
    } else {
        showAlert("Sorry, destination not found.", "danger");
    }
}

function showMessage() {
    showAlert("Welcome to Travelease! Check our packages for great travel offers.", "info");
}

// ==========================================
// TASK 1: Product Prices, Total Bill & Discount
// ==========================================
// Array of package prices
const travelPackagePrices = [8999, 15999, 22999, 18499, 11999];

function calculateTravelBill(prices, threshold = 20000, discountPercent = 10) {
    const total = prices.reduce((acc, curr) => acc + curr, 0);
    let discount = 0;
    if (total > threshold) {
        discount = (total * discountPercent) / 100;
    }
    const finalAmount = total - discount;
    return { total, discount, finalAmount };
}

function runTask1BillCalculator() {
    const selectedCheckboxes = document.querySelectorAll('.package-checkbox:checked');
    let prices = [];
    selectedCheckboxes.forEach(cb => {
        prices.push(parseFloat(cb.value));
    });

    if (prices.length === 0) {
        prices = [8999, 15999]; // fallback default selected packages
    }

    const bill = calculateTravelBill(prices, 20000, 10);
    const resultBox = document.getElementById("billResultDisplay");
    if (resultBox) {
        resultBox.style.display = "block";
        resultBox.innerHTML = `
            <strong>Selected Packages Subtotal:</strong> ₹${bill.total.toLocaleString()}<br>
            <strong>Special Travel Discount (${bill.total > 20000 ? '10%' : '0%'}):</strong> -₹${bill.discount.toLocaleString()}<br>
            <strong class="text-success fs-5">Final Amount to Pay: ₹${bill.finalAmount.toLocaleString()}</strong>
        `;
    } else {
        showAlert(`Total: ₹${bill.total} | Discount: ₹${bill.discount} | Final Amount: ₹${bill.finalAmount}`, "success");
    }
}

// ==========================================
// TASK 2: Change Button Text Using 'this' Keyword
// ==========================================
function handleButtonClick(buttonElement) {
    // Uses JavaScript 'this' passed directly from onclick="handleButtonClick(this)"
    const originalText = buttonElement.getAttribute("data-original-text") || buttonElement.innerText;
    if (!buttonElement.getAttribute("data-original-text")) {
        buttonElement.setAttribute("data-original-text", originalText);
    }

    buttonElement.innerText = "✓ Processing (" + originalText + ")";
    buttonElement.classList.remove("btn-primary", "btn-warning", "btn-secondary", "btn-success");
    buttonElement.classList.add("btn-info");

    setTimeout(() => {
        buttonElement.innerText = "Booked!";
        buttonElement.classList.remove("btn-info");
        buttonElement.classList.add("btn-success");

        setTimeout(() => {
            buttonElement.innerText = originalText;
            buttonElement.classList.remove("btn-success");
            buttonElement.classList.add("btn-primary");
        }, 2000);
    }, 1000);
}

// ==========================================
// TASK 3: Dynamic Character Counter
// ==========================================
function updateCharCount(inputElement, displayElementId) {
    const text = inputElement.value;
    const charCount = text.length;
    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

    const displayEl = document.getElementById(displayElementId);
    if (displayEl) {
        displayEl.innerHTML = `Characters: <strong>${charCount}</strong> | Words: <strong>${wordCount}</strong>`;
    }
}

// ==========================================
// TASK 4: Form Validation Before Submission
// ==========================================
function validateAndRegisterUser(e) {
    e.preventDefault();

    // Reset errors
    ["errName", "errEmail", "errPhone", "errPassword", "errConfirmPassword", "errGender", "errTerms"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = "";
    });

    const name = document.getElementById("regName") ? document.getElementById("regName").value.trim() : "";
    const email = document.getElementById("regEmail") ? document.getElementById("regEmail").value.trim() : "";
    const phone = document.getElementById("regPhone") ? document.getElementById("regPhone").value.trim() : "";
    const password = document.getElementById("regPassword") ? document.getElementById("regPassword").value : "";
    const confirmPassword = document.getElementById("regConfirmPassword") ? document.getElementById("regConfirmPassword").value : "";
    const genderSelected = document.querySelector('input[name="gender"]:checked');
    const termsChecked = document.getElementById("regTerms") ? document.getElementById("regTerms").checked : false;

    let isValid = true;

    if (name.length < 3) {
        document.getElementById("errName").innerText = "Full Name must be at least 3 characters long.";
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById("errEmail").innerText = "Please enter a valid email address.";
        isValid = false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        document.getElementById("errPhone").innerText = "Mobile number must be exactly 10 digits.";
        isValid = false;
    }

    if (password.length < 6) {
        document.getElementById("errPassword").innerText = "Password must be at least 6 characters long.";
        isValid = false;
    }

    if (password !== confirmPassword) {
        document.getElementById("errConfirmPassword").innerText = "Passwords do not match.";
        isValid = false;
    }

    if (!genderSelected) {
        document.getElementById("errGender").innerText = "Please select your gender.";
        isValid = false;
    }

    if (!termsChecked) {
        document.getElementById("errTerms").innerText = "You must agree to Terms & Conditions.";
        isValid = false;
    }

    if (isValid) {
        showAlert("Registration Successful! Welcome to Travelease, " + name + ".", "success");
        document.getElementById("registrationForm").reset();
        const counterDisp = document.getElementById("addressCharCount");
        if (counterDisp) counterDisp.innerHTML = "Characters: <strong>0</strong> | Words: <strong>0</strong>";
    } else {
        showAlert("Validation Failed! Please fix the errors highlighted below.", "danger");
    }
}

// ==========================================
// TASK 5: Nested Callbacks Simulation (Travel Meal Delivery)
// ==========================================
function selectTravelMeal(meal, callback) {
    appendLog("callbackLog", "1. Selected In-Flight Meal: " + meal);
    setTimeout(() => callback(meal), 700);
}

function confirmMealOrder(meal, callback) {
    appendLog("callbackLog", "2. Meal Order Confirmed for " + meal);
    setTimeout(() => callback(meal), 700);
}

function prepareFlightMeal(meal, callback) {
    appendLog("callbackLog", "3. Catering Kitchen Preparing " + meal + "...");
    setTimeout(() => callback(meal), 700);
}

function assignSeatAttendant(meal, callback) {
    appendLog("callbackLog", "4. Flight Attendant assigned for delivery.");
    setTimeout(() => callback(meal), 700);
}

function deliverMealToSeat(meal) {
    appendLog("callbackLog", "5. 🎉 " + meal + " served to your travel seat! Bon Appétit!");
}

function runCallbackSimulation() {
    const logBox = document.getElementById("callbackLog");
    if (logBox) logBox.innerHTML = "";

    // Nested Callback execution
    selectTravelMeal("Deluxe Travel Combo Meal", function(meal) {
        confirmMealOrder(meal, function(meal) {
            prepareFlightMeal(meal, function(meal) {
                assignSeatAttendant(meal, function(meal) {
                    deliverMealToSeat(meal);
                });
            });
        });
    });
}

// ==========================================
// TASK 6: Promise Chaining Simulation (Package Booking Flow)
// ==========================================
function selectTravelPackage(packageName) {
    return new Promise((resolve) => {
        appendLog("promiseLog", "1. Selected Package: " + packageName);
        setTimeout(() => resolve(packageName), 600);
    });
}

function checkPackageAvailability(packageName) {
    return new Promise((resolve) => {
        appendLog("promiseLog", "2. Checking availability for " + packageName + "...");
        setTimeout(() => resolve({ packageName, status: "Available" }), 600);
    });
}

function addPackageToCart(data) {
    return new Promise((resolve) => {
        appendLog("promiseLog", "3. Package '" + data.packageName + "' added to Travel Cart.");
        setTimeout(() => resolve(data.packageName), 600);
    });
}

function processTravelPayment(packageName) {
    return new Promise((resolve) => {
        appendLog("promiseLog", "4. Payment of ₹15,999 processed for " + packageName + ".");
        setTimeout(() => resolve({ packageName, bookingRef: "TRV-" + Math.floor(10000 + Math.random() * 90000) }), 600);
    });
}

function generateBookingConfirmation(details) {
    return new Promise((resolve) => {
        appendLog("promiseLog", "5. Booking Confirmed! Ref No: " + details.bookingRef);
        setTimeout(() => resolve(details), 600);
    });
}

function runPromiseChainingSimulation() {
    const logBox = document.getElementById("promiseLog");
    if (logBox) logBox.innerHTML = "";

    selectTravelPackage("Manali Adventure Package")
        .then((pkg) => checkPackageAvailability(pkg))
        .then((data) => addPackageToCart(data))
        .then((pkg) => processTravelPayment(pkg))
        .then((details) => generateBookingConfirmation(details))
        .then(() => {
            appendLog("promiseLog", ">>> ✅ Promise Chaining Execution Completed Successfully!");
        })
        .catch((err) => {
            appendLog("promiseLog", "❌ Error in Promise Chain: " + err);
        });
}

// ==========================================
// TASK 7: Async/Await & Try...Catch (Transport Seat Booking)
// ==========================================
function selectTripDestination(dest) {
    return new Promise((resolve) => setTimeout(() => resolve(dest), 500));
}

function checkTransportSeats(dest) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (dest.includes("Full")) {
                reject(new Error("No seats available for " + dest));
            } else {
                resolve({ dest, seats: ["Seat 12A", "Seat 12B"] });
            }
        }, 500);
    });
}

function reserveTravelSeat(resData) {
    return new Promise((resolve) => setTimeout(() => resolve({ ...resData, reserved: true }), 500));
}

function processSeatPayment(resData) {
    return new Promise((resolve) => setTimeout(() => resolve({ ...resData, amount: 2500, paid: true }), 500));
}

function generateTravelTicket(paymentData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                ticketNo: "TKT-TRV-" + Math.floor(100000 + Math.random() * 900000),
                dest: paymentData.dest,
                seats: paymentData.seats.join(", ")
            });
        }, 500);
    });
}

async function runAsyncTicketBooking() {
    const logBox = document.getElementById("asyncLog");
    if (logBox) logBox.innerHTML = "";

    const selectedDest = document.getElementById("destSelect") ? document.getElementById("destSelect").value : "Goa Luxury Express";

    try {
        appendLog("asyncLog", "Step 1: Selected Transport -> " + selectedDest);
        const dest = await selectTripDestination(selectedDest);

        appendLog("asyncLog", "Step 2: Checking seat availability for " + dest + "...");
        const seatInfo = await checkTransportSeats(dest);

        appendLog("asyncLog", "Step 3: Reserving seats [" + seatInfo.seats.join(", ") + "]...");
        const reserved = await reserveTravelSeat(seatInfo);

        appendLog("asyncLog", "Step 4: Processing payment of ₹2,500...");
        const paid = await processSeatPayment(reserved);

        appendLog("asyncLog", "Step 5: Generating Travel Ticket...");
        const ticket = await generateTravelTicket(paid);

        appendLog("asyncLog", `🎫 TICKET GENERATED! Ticket ID: ${ticket.ticketNo} | Trip: ${ticket.dest} | Seats: ${ticket.seats}`);
        showAlert("Travel Ticket Booked Successfully! Ticket ID: " + ticket.ticketNo, "success");

    } catch (error) {
        appendLog("asyncLog", "❌ ERROR CAUGHT (try...catch): " + error.message);
        showAlert("Booking Failed: " + error.message, "danger");
    }
}

// Utility helper for logging tasks
function appendLog(elementId, text) {
    const logBox = document.getElementById(elementId);
    if (logBox) {
        logBox.innerHTML += text + "<br>";
        logBox.scrollTop = logBox.scrollHeight;
    }
}


