import React from 'react';
import { createRoot } from 'react-dom/client';  // Import createRoot
import App from './App';
import { UserProvider } from './UserContext';  // Import UserProvider

const container = document.getElementById('root'); // Get the container to mount your app
const root = createRoot(container); // Create a root

root.render(
    <React.StrictMode>
        <UserProvider>
            <App />
        </UserProvider>
    </React.StrictMode>
);
