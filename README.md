![Screenshot 2025-05-27 151402](https://github.com/user-attachments/assets/0b9473ae-2c7b-4886-bf53-e82b40387746)![Screenshot 2025-05-27 142111](https://github.com/user-attachments/assets/fe06705f-2c8b-463c-9fe3-13843f7dedf3)
![Screenshot 2025-05-27 151337](https://github.com/user-attachments/assets/abba0c45-2b44-4876-8fa3-99829174e804)
![Screenshot 2025-05-27 144503](https://github.com/user-attachments/assets/b926b27e-456e-40b7-965a-4cd784906597)![Screenshot 2025-05-27 144405](https://github.com/user-attachments/assets/64fcf9f6-b9e4-439f-a25e-a76af64e01e8)
![Screenshot 2025-05-27 141944](https://github.com/user-attachments/assets/88fd4834-bfcc-431a-9d52-f3cdb33d5967)
![Screenshot 2025-05-27 142014](https://github.com/user-attachments/assets/8e3e5b0d-eb08-4523-8958-c46fb6467f95)
![Screenshot 2025-05-27 142111](https://github.com/user-attachments/assets/912581d1-4791-4477-af84-07b2a0b250d0)
![Screenshot 2025-05-27 144350](https://github.com/user-attachments/assets/52bd67d5-55c0-40f0-96f1-5aaad6bf7d7e)


![Screenshot 2025-05-27 151252](https://github.com/user-attachments/assets/4766e9bf-ab47-4544-8c34-bcd6072ea8a0)
![Screenshot 2025-05-27 151224](https://github.com/user-attachments/assets/34749a43-4905-41d2-b677-0386b106fbf5)
![Screenshot 2025-05-27 151154](https://github.com/user-attachments/assets/0c5ff498-c41d-4f5b-8e7c-585a4ada909c)
![Screenshot 2025-05-24 213352](https://github.com/user-attachments/assets/ac0818f6-1fef-47cb-8474-ac236c205c60)
![Screenshot 2025-05-27 141809](https://github.com/user-attachments/assets/f47ac080-aae2-49ab-b7e2-94f54fe3ec4a)


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

