<div align="center">
  <img src="client/src/assets/images/logo.png" alt="Tipon Logo" width="200" />
  
  <h1>Tipon</h1>
  <p><strong>An Event Management System for University Student Organizations</strong></p>
</div>

<br />

<div align="center">
  <img src="client/src/assets/images/illustration.png" alt="Tipon Illustration" width="600" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
</div>

<br />

## 📖 Project Overview

**Tipon** is a centralized Event Management System designed specifically to address the logistical and administrative challenges faced by university organizations. The platform serves as a unified digital hub where student organizations can seamlessly publish, manage, and track attendance for campus events, while providing students with a streamlined interface to discover, register for, and engage with university activities.

Built with modern web technologies, Tipon aims to bridge the communication gap between event organizers and the student body, fostering higher engagement and simplifying administrative overhead.

---

## ✨ Key Features

### For Students (Attendees)
- **Event Discovery:** Browse upcoming events filtered by category (Academic, Cultural, Sports, Seminars, etc.).
- **Seamless Registration:** One-click registration for available events with real-time slot tracking.
- **Dynamic E-Tickets:** Automatically generated QR-code tickets for verified event entry.
- **Personalized Dashboard:** A comprehensive view of registered events, ticket statuses, and waitlisted activities.

### For Admins (Organization Officers)
- **Event Lifecycle Management:** Create, edit, and publish events with customized details, capacities, and promotional posters.
- **Attendance Tracking:** Built-in QR scanner interface to validate student tickets quickly at the venue.
- **Yield Reporting & Analytics:** Visual dashboards providing insights into registration numbers, attendance yields, and no-shows.
- **Manifest Generation:** Exportable attendee manifests based on real-time check-in data.

---

## 🛠️ Technology Stack

Tipon is built on a robust, decoupled architecture separating the client interface from the backend API logic.

### Frontend (Client)
- **Framework:** [React.js](https://reactjs.org/) (Vite)
- **Routing:** React Router DOM
- **Styling:** Custom CSS with modern Flexbox/Grid layouts
- **Components:** QR Code generation (`qrcode.react`), Charting integrations (`recharts`)

### Backend (Server)
- **Framework:** [Laravel 11](https://laravel.com/) (PHP)
- **Database:** MySQL (Relational Schema)
- **Authentication:** Laravel Sanctum (Token-based API Authentication)
- **Storage:** Laravel local storage (public symlink) for media and poster uploads.

---

## 🚀 Setup & Installation

Follow these steps to deploy the system locally for development and testing.

### Prerequisites
- Node.js (v16 or higher)
- PHP (v8.2 or higher)
- Composer
- MySQL Database

### Backend Setup (Laravel)
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Configure your environment variables by duplicating `.env.example` to `.env` and updating the database credentials.
4. Generate the application key:
   ```bash
   php artisan key:generate
   ```
5. Run the database migrations:
   ```bash
   php artisan migrate
   ```
6. Link the storage directory for image uploads:
   ```bash
   php artisan storage:link
   ```
7. Start the local server:
   ```bash
   php artisan serve
   ```
   *The server will run on `http://localhost:8000`.*

### Frontend Setup (React/Vite)
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will be accessible at `http://localhost:5173`.*

---

## 📜 Academic Context
This project was developed as part of an academic requirement to demonstrate proficiency in full-stack web development, relational database design, and software engineering principles in addressing real-world organizational needs.
