function showAlert(message, type = "success") {
    const container = document.getElementById("alertContainer");
    if (!container) {
        alert(message);
        return;
    }

    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
}

function searchDestination() {
    const t = document.getElementById("searchInput").value.toLowerCase().trim();
    const destinations = ["goa", "manali", "kerala", "jaipur", "kashmir", "ladakh", "andaman"];

    if (t === "") {
        showAlert("Please enter a destination to search.", "warning");
        return;
    }

    if (destinations.includes(t)) {
        showAlert("Destination found: " + t.toUpperCase(), "success");
        setTimeout(() => {
            window.location.href = "catalogue.html";
        }, 700);
    } else {
        showAlert("Sorry, destination not found.", "danger");
    }
}

function bookTrip(destination) {
    showAlert("Thank you! You selected a trip to " + destination + ".", "success");
}

function showMessage() {
    showAlert("Welcome to Travelease! Check our packages for great travel offers.", "info");
}

function registerUser(e) {
    e.preventDefault();
    const name = document.getElementById("regName").value;
    showAlert("Welcome to Travelease, " + name + "! Registration successful.", "success");
    e.target.reset();
}
