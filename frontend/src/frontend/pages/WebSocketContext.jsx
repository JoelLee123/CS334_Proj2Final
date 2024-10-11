// WebSocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(null);

// Custom hook to access WebSocket
export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket("ws://localhost:3001");
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected!");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected.");
    };

    return () => {
      ws.close(); // Clean up WebSocket connection on unmount
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};
