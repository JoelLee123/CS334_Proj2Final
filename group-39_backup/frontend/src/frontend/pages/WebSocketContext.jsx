// WebSocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(null);

// Custom hook to access WebSocket
export const useWebSocket = () => useContext(WebSocketContext);
const wsUrl = process.env.NODE_ENV === 'production' ? 'wss://scribe-mark-fe6416f9cd72.herokuapp.com':'ws://localhost:3001';

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [pingInterval, setPingInterval] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket(wsUrl);
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected!");
      // Start pinging the server every 15 seconds

      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send("ping");
          console.log("Ping message sent to the server");
        }
      }, 40000); // Ping every 40 seconds
      setPingInterval(interval);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected.");

      // Stop pinging when the connection is closed
      if (pingInterval) {
        clearInterval(pingInterval);
        setPingInterval(null);
      }
    };

    return () => {
       // Clean up WebSocket connection and ping interval on unmount
      ws.close();
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};
