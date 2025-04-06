const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store connected users
const users = {}; 

// Test route
app.get("/", (req, res) => {
    res.send("🚀 Real-Time Communication Server is Running...");
});

// Handle Client Connections
io.on("connection", (socket) => {
    console.log(`🔵 Client connected: ${socket.id}`);

    // User Registration
    socket.on("register", ({ userId, username, role }) => {
        users[userId] = { socketId: socket.id, username, role }; // Store user without exposing socket.id
        console.log(`✅ User Registered: ${username} (${userId})`);

        // Send updated user list (without socket.id)
        io.emit("userList", Object.values(users).map(user => ({ username: user.username, role: user.role })));
    });

    // Public Chat Messaging
    socket.on("chatMessage", ({ userId, message }) => {
        if (users[userId]) {
            console.log(`📩 Message from ${users[userId].username}: ${message}`);
            io.emit("chatMessage", { username: users[userId].username, message });
        }
    });

    // Private Messaging
    socket.on("privateMessage", ({ senderId, receiverId, message }) => {
        if (users[receiverId]) {
            io.to(users[receiverId].socketId).emit("privateMessage", { sender: users[senderId].username, message });
            console.log(`📩 Private message from ${users[senderId].username} to ${users[receiverId].username}: ${message}`);
        } else {
            socket.emit("errorMessage", { message: "User not found or offline." });
        }
    });

    // Booking Confirmations & Notifications
    socket.on("confirmBooking", ({ userId, tripDetails }) => {
        if (users[userId]) {
            io.to(users[userId].socketId).emit("bookingConfirmed", tripDetails);
            console.log(`📢 Booking confirmed for ${users[userId].username}: ${tripDetails.message}`);
        }
    });

    // Trip Updates Notifications
    socket.on("tripUpdate", ({ userId, updateMessage }) => {
        if (users[userId]) {
            io.to(users[userId].socketId).emit("tripUpdate", { message: updateMessage });
            console.log(`📢 Trip update sent to ${users[userId].username}: ${updateMessage}`);
        }
    });

    // Handle Client Disconnection
    socket.on("disconnect", () => {
        let disconnectedUser;
        for (const [userId, user] of Object.entries(users)) {
            if (user.socketId === socket.id) {
                disconnectedUser = userId;
                delete users[userId];
                break;
            }
        }
        console.log(`🔴 Client disconnected: ${socket.id}`);
        
        // Update user list after disconnection
        io.emit("userList", Object.values(users).map(user => ({ username: user.username, role: user.role })));
    });
});

// Start Server
server.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
});
