const socket = io("http://localhost:5000");
let username = "";
let role = "";

function registerUser(userRole) {
    const usernameInput = document.getElementById("username").value.trim();

    if (usernameInput === "") {
        alert("Please enter a username!");
        return;
    }

    username = usernameInput; // Store username globally
    role = userRole; // Store role globally

    // Send username and role to the backend
    socket.emit("register", { username, role });

    document.querySelector(".user-input").classList.add("hidden");
    document.getElementById("chat-box").classList.remove("hidden");

    if (role === "agency") {
        document.getElementById("reply-box").classList.remove("hidden");
    }
}

  
function sendMessage() {
    const message = document.getElementById("message").value.trim();
    if (message !== "" && username !== "") {
        socket.emit("chatMessage", { username, message });
        document.getElementById("message").value = "";
    }
}

socket.on("chatMessage", (data) => {
    displayMessage(`${data.username}: ${data.message}`);
});

socket.on("serverMessage", (data) => {
    displayMessage(`Server: ${data.message}`, "server-message");
});

function displayMessage(message, className = "") {
    const messagesDiv = document.getElementById("messages");
    const msgElement = document.createElement("p");

    if (className) msgElement.classList.add(className);
    msgElement.textContent = message;
    messagesDiv.appendChild(msgElement);

    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll
}

// Agency Reply
function sendAgencyReply() {
    const customerId = document.getElementById("customer-id").value.trim();
    const message = document.getElementById("agency-reply").value.trim();

    if (customerId !== "" && message !== "") {
        socket.emit("agencyReply", { customerId, message });
        document.getElementById("agency-reply").value = "";
    }
}

// Update user list
socket.on("userList", (userList) => {
    const userListDiv = document.getElementById("user-list");
    userListDiv.innerHTML = "<h3>Connected Users:</h3>";
    userList.forEach(user => {
        userListDiv.innerHTML += `<p>${user.username} (${user.role}) - ID: ${user.id}</p>`;
    });
}); // Listen for booking confirmation notifications
socket.on("bookingConfirmed", (tripDetails) => {
    alert(`📢 Booking Confirmed: ${tripDetails.message}`);
});

