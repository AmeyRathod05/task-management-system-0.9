Task Management App
A feature-rich Task Management application built with Next.js and powered by a Laravel API backend, designed to manage projects, clients, and tasks with multiple interactive views like List, Table, Kanban, and Gantt. It includes advanced functionalities such as editable cells, configurable columns, and high-performance datatables.

🚀 Features
CRUD operations for Projects, Clients, and Tasks via Laravel API

Multiple task views:

List View

Table View with editable cells & configurable columns

Kanban Board

Gantt Chart

Fast and responsive UI using high-performance data tables

Modern UI with support for in-place editing and customization

🛠️ Tech Stack
Frontend: Next.js

Backend API: Laravel 12

UI Libraries: Tailwind CSS, React Libraries for Gantt/Kanban

Data Handling: Axios or Fetch for API requests

📦 Installation
bash
Copy
Edit
# Clone the repository
git clone https://github.com/yourusername/task-management-app.git

# Navigate to project folder
cd task-management-app

# Install dependencies
npm install

# Start the development server
npm run dev
📂 Folder Structure (Frontend)
bash
Copy
Edit
/components       # Reusable UI components
/app           # Next.js app router (Routes)
/views            # List, Table, Kanban, Gantt view components
/utils            # API handlers, config, helpers
🔗 API Integration
The app connects to a Laravel API backend to handle:

GET /projects, POST /projects (Project CRUD)

GET /clients, POST /clients (Client CRUD)

GET /tasks, POST /tasks (Task CRUD)

Update the base URL in your environment config:

env
Copy
Edit
NEXT_PUBLIC_API_BASE_URL=http://your-laravel-api.test/api
🧭 Usage Guide
Install dependencies: npm install

Run development server: npm run dev

Connect to Laravel API: Make sure your Laravel backend is running and accessible.

Navigate through views:

Use the sidebar or top menu to switch between List, Table, Kanban, and Gantt views.

Edit and manage tasks directly from the table with inline editing.

Customize columns visibility and layout as needed.

📌 Future Improvements
Role-based access control

Real-time updates via WebSockets

Notifications and reminders

Task dependencies and timelines

