import '../css/app.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import NotFound from './pages/NotFound';

ReactDOM.createRoot(document.getElementById("app")).render(
    <React.StrictMode>
        <NotFound />
    </React.StrictMode>
);