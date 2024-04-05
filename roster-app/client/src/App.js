import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LogInPage from './LogIn';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LogInPage />} />
                {/* Add more Route components here for additional pages */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
