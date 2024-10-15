import React, { createContext, useContext, useEffect, useState } from "react";

// Create a WebSocket context to be used across the application
const WebSocketContext = createContext(null);

// Custom hook to provide access to the WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);

// WebSocket URL - changes depending on the environment (production or development)
const wsUrl = process.env.NODE_ENV === 'production' 
  ? 'wss://scribe-mark-fe6416f9cd72.herokuapp.com' // Production WebSocket server URL
  : 'ws://localhost:3001'; // Local WebSocket server URL for development

/**
 * WebSocketProvider component that establishes and manages a WebSocket connection.
 * It provides the WebSocket object via context to its child components.
 *
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - The child components that will use the WebSocket context.
 * @returns {JSX.Element} The WebSocketContext.Provider component wrapping the children.
 */
export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null); // State to hold the WebSocket instance
  const [pingInterval, setPingInterval] = useState(null); // State to track the ping interval ID

  useEffect(() => {
    // Initialize WebSocket connection when the component mounts
    const ws = new WebSocket(wsUrl); // Create a new WebSocket instance
    setSocket(ws); // Set the WebSocket instance in state

    // WebSocket open event handler
    ws.onopen = () => {
      console.log("WebSocket connected!"); // Log connection establishment
      
      // Start pinging the server every 40 seconds to keep the connection alive
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send("ping"); // Send a "ping" message to the server
          console.log("Ping message sent to the server"); // Log the ping
        }
      }, 40000); // Ping interval set to 40 seconds
      setPingInterval(interval); // Store the interval ID in state
    };

    // WebSocket close event handler
    ws.onclose = () => {
      console.log("WebSocket disconnected."); // Log disconnection

      // Clear the ping interval when the connection is closed
      if (pingInterval) {
        clearInterval(pingInterval); // Stop the pinging
        setPingInterval(null); // Reset the interval state
      }
    };

    // Cleanup function to close the WebSocket connection and clear the interval when the component unmounts
    return () => {
      ws.close(); // Close the WebSocket connection
      if (pingInterval) {
        clearInterval(pingInterval); // Clear the ping interval if set
      }
    };
  }, []); // Empty dependency array ensures this effect runs once on mount and cleanup on unmount

  // Provide the WebSocket object to the context consumers
  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};
