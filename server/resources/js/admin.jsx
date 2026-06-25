import React from "react";
import ReactDOM from "react-dom/client";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";


import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import AdminLayout from "./components/AdminLayout";

import AdminDashboard from "./pages/AdminDashboard";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import AttendanceScanner from "./pages/AttendanceScanner";
import EventReport from "./pages/EventReport";


ReactDOM.createRoot(document.getElementById("app")).render(
    <BrowserRouter>
        <Routes>

            <Route element={<AdminLayout />}>

                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/admin/events/create"
                    element={<CreateEvent />}
                />

                <Route
                    path="/admin/events/:id/scan"
                    element={<AttendanceScanner />}
                />

                <Route
                    path="/admin/events/:id/report"
                    element={<EventReport />}
                />

                <Route
                    path="/admin/events/:id/edit"
                    element={<EditEvent />}
                />

            </Route>

            <Route
                path="*"
                element={<Navigate to="/admin/dashboard" />}
            />

        </Routes>
    </BrowserRouter>
);