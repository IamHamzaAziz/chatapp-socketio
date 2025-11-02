# Chat Application with MERN and Socket.IO

This is a full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. It allows users to register, log in and chat with each other in real time.

## Features

-   **User Authentication**: Secure user registration and login with JWT (JSON Web Tokens).
-   **Real-time Messaging**: Instant messaging between users with Socket.IO.
-   **Online Status**: See which users are currently online.
-   **Private Messaging**: Send and receive private messages.
-   **Typing Indicators**: See when a user is typing a message.
-   **Message History**: Chat history is saved to a MongoDB database.

## Tech Stack

### Backend

-   **Node.js**: JavaScript runtime environment.
-   **Express**: Web framework for Node.js.
-   **MongoDB**: NoSQL database for storing user and message data.
-   **Mongoose**: ODM for MongoDB.
-   **Socket.IO**: For real-time, bidirectional communication.
-   **JWT**: For secure user authentication.
-   **bcryptjs**: For hashing passwords.
-   **TypeScript**: For type-safe code.

### Frontend

-   **React**: JavaScript library for building user interfaces.
-   **Vite**: Fast build tool for modern web development.
-   **Socket.IO Client**: For connecting to the Socket.IO server.
-   **Axios**: For making HTTP requests to the backend.
-   **Tailwind CSS**: For styling the user interface.
-   **TypeScript**: For type-safe code.


## Key Implementation Details

### Socket.IO Integration

-   **Server-side**: Socket.IO is initialized in `server/src/index.ts`. It handles user connections, disconnections, and real-time events.
-   **Client-side**: The React application connects to the Socket.IO server using the `socket.io-client` library. This is managed in a custom hook or context for easy access throughout the application.

### Authentication

-   User registration and login are handled through REST API endpoints.
-   Upon successful login, a JWT is generated and sent to the client.
-   The JWT is stored on the client and sent with subsequent requests to authenticate the user.
-   Socket.IO connections are authenticated using a middleware that verifies the JWT.

### Real-time Communication

-   **Private Messages**: When a user sends a private message, the server emits a `receive-private-message` event to the recipient's socket.
-   **Online Status**: The server maintains a list of online users. When a user connects or disconnects, the server broadcasts the updated list to all clients.
-   **Typing Indicators**: When a user starts or stops typing, a `typing` event is emitted to the other user in the chat.
