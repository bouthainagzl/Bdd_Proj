const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express(); // إنشاء تطبيق Express
const server = http.createServer(app); // إنشاء خادم HTTP

// ✅ تمكين CORS ليسمح لجميع الاتصالات
app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "*", // يسمح لجميع المصادر بالاتصال
        methods: ["GET", "POST"]
    }
});

// ✅ استقبال اتصالات WebSocket
io.on("connection", (socket) => {
    console.log("✅ مستخدم متصل");

    socket.on("message", (msg) => {
        console.log("📩 رسالة مستلمة:", msg);
        io.emit("message", `📢 بث عام: ${msg}`); // إرسال الرسالة لجميع العملاء
    });

    socket.on("disconnect", () => {
        console.log("❌ مستخدم قطع الاتصال");
    });
});

// ✅ تشغيل الخادم على المنفذ 5000
server.listen(5000, () => {
    console.log("🚀 الخادم يعمل على http://localhost:5000");
});
