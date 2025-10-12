// test-socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3333", {
  path: "/ws/payments/socket.io",       // must match the gateway config
  query: { tenantId: "tenant-alpha" },
  transports: ["websocket"],  // force websocket transport
});

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket server with ID:", socket.id);
});

socket.on("connection_status", (data) => {
  console.log("💬 Connection Status:", data);
});

socket.on("payment_event", (data) => {
  console.log("📦 Payment Event received:", data);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("⚠️ Connection Error:", err.message);
});
