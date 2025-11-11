# Mentorship Management Platform

## Project Summary
The **Mentorship Management Platform** is an internal corporate system designed to connect mentors and mentees to foster professional development and guided learning within an organization. This platform enables structured mentorship sessions, session tracking, feedback collection, notifications, and analytics to enhance mentorship effectiveness.

---

## Key Features

### Authentication & User Management
- Separate registration workflows for **mentors** and **mentees**
- Role-based access control with distinct interfaces
- Profile management with expertise areas and learning goals

### Mentor Features
- Profile editing and management
- Availability management with recurring time slots
- Session tracking and lifecycle management
- Ability to mark sessions as complete

### Mentee Features
- Browse and search mentors by name, department, or expertise
- View mentor ratings and session history
- Schedule, reschedule, or cancel sessions based on mentor availability

### Session Management
- Complete session lifecycle tracking
- Session status management (scheduled, ongoing, completed)
- Duration tracking and meeting notes capability

### Feedback System
- 5-star rating system for sessions
- Written feedback for completed sessions
- Feedback visible to both mentors and mentees

### Notification System
- Real-time notifications for session events
- Notifications for scheduled, cancelled sessions and new feedback
- Unread notification counter
- Mark notifications as read functionality

### Analytics Dashboard
- Total mentor and mentee count
- Total and completed sessions metrics
- Average rating across all sessions
- Top-performing mentors by rating and session count
- Mentor utilization percentages
- Visual progress bars and statistics

---

## Database Structure
The platform uses a secure relational database (e.g., PostgreSQL / MySQL) with **Row-Level Security** policies ensuring users can only access authorized data.  

Core tables include:
- `users` – Stores mentor and mentee profiles
- `sessions` – Tracks scheduled mentorship sessions
- `availability` – Stores mentor availability slots
- `feedback` – Stores session ratings and written feedback
- `notifications` – Tracks session notifications and alerts
- `ratings` – Aggregated session ratings per mentor

---

## Technology Stack

| Layer        | Technology                         |
| ------------ | --------------------------------- |
| Frontend     | React.js, Tailwind CSS, Lucide Icons |
| Backend      | Node.js, Express.js, JWT for authentication |
| Database     | MongoDB / PostgreSQL (with RLS)   |
| Notifications| NodeMailer / Push notifications    |
| Dev Tools    | Git, GitHub, Vite, VS Code        |

---

## System Architecture

<img width="1024" height="1024" alt="image" src="https://github.com/user-attachments/assets/5127fb0f-9fb9-4929-b78f-495096a8ed4b" />



---

## Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/gprabhat65/mentorship-platform.git
cd mentorship-platform

cd backend
npm install

cd ../frontend
npm install

cd ../backend
npm run dev

cd ../frontend
npm run dev

http://localhost:5173 (or the port your frontend runs on)

Challenges & Solutions

Role-based access: Implemented middleware to restrict mentor/mentee access to appropriate routes.

Session scheduling conflicts: Validated overlapping times and availability before confirming sessions.

Real-time notifications: Used a combination of database triggers and frontend polling for live updates.

Lessons Learned

Importance of designing a robust database schema early

Managing asynchronous operations and notifications

Implementing role-based security and data access control

Handling scheduling conflicts and session lifecycle

Future Enhancements

Integration of video conferencing for sessions

AI-based mentor recommendations

Automatic follow-up session suggestions

More detailed analytics (session duration trends, mentee progress tracking)

Usage

Sign up as a mentor or mentee

Complete your profile

Mentors: Define availability

Mentees: Browse mentors and schedule sessions

Provide ratings and feedback after sessions

View analytics dashboard for insights
