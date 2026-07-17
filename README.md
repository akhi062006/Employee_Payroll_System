# Employee Payroll Management System

A modern, full-stack Employee Payroll Management System designed with a layered MVC architecture. It utilizes a **Java Spring Boot 3.x** backend, a **SQLite** database, and a **React.js (Vite)** frontend styled with a premium slate-dark and teal themed custom Bootstrap user interface.

---

## Technical Stack

### Backend
* **Language**: Java 17 / 21
* **Framework**: Spring Boot 3.3.1 (Spring Web, Spring Data JPA, Spring Security)
* **Security**: JWT Authentication (using JJWT 0.12) & BCrypt Password Encryption
* **Database**: SQLite Database Engine (integrated natively via JDBC)
* **PDF Engine**: OpenPDF (LibrePDF) for salary slip exports
* **Excel Engine**: Apache POI for report generations
* **Documentation**: Springdoc Swagger-UI OpenAPI 3.0

### Frontend
* **Build Tool**: Vite
* **UI styling**: Bootstrap 5 + Bootstrap Icons (with custom themed glassmorphic elements)
* **API Client**: Axios (configured with token attachment/expired session interceptors)
* **Charts**: Chart.js & React-Chartjs-2
* **Notifications**: React Toastify

---

## Project Folder Structure

```text
Employee/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/employee/payroll/
│   │   │   │   ├── config/          # CORS, Dialects, Seeder & Web configuration
│   │   │   │   ├── controller/      # REST API Controllers
│   │   │   │   ├── dto/             # Data Transfer Objects (Request/Response)
│   │   │   │   ├── entity/          # JPA Entity mappings (SQLite schemas)
│   │   │   │   ├── exception/       # Exception handlers & Global JSON advice
│   │   │   │   ├── repository/      # JPA Data repositories
│   │   │   │   ├── security/        # JWT Authentication providers & filters
│   │   │   │   └── service/         # Business services (calculators, exports)
│   │   │   └── resources/
│   │   │       └── application.properties # Server port, JDBC URL & JWT keys
│   │   └── test/                    # Context boot validation tests
│   └── pom.xml                      # Maven dependency script
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Shared elements (Sidebars, Route guards)
│   │   ├── context/                 # State management (Authentication context)
│   │   ├── pages/                   # Views (Dashboard, Forms, Profiles, Slips)
│   │   ├── services/                # Backend API connections (Axios)
│   │   ├── App.jsx                  # Main router paths
│   │   ├── index.css                # Custom premium layout styling
│   │   └── main.jsx                 # Client entry point
│   ├── package.json                 # Node dependencies configuration
│   └── vite.config.js               # Vite configurations
```

---

## Setup & Running Guide

### Prerequisites
* **Java Development Kit (JDK)**: Java 17 or higher installed.
* **Maven**: Build tool installed (or use wrapped system build tools).
* **Node.js**: v18.x or higher installed.

---

### Step 1: Run the Backend Server

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Build and compile the codebase:
   ```bash
   mvn clean install
   ```
3. Start the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
4. The server will boot on `http://localhost:8080`.
5. Swagger API documentation is available at `http://localhost:8080/swagger-ui.html`.

*Note: On first startup, the database file `employee_payroll.db` will be auto-generated in the `backend/` directory and populated with seed data.*

---

### Step 2: Run the Frontend Server

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
4. The React application will load on `http://localhost:5173`. Open this URL in your web browser.

---

## Seed Accounts (For Testing)

Upon first run, the database seeder automatically creates the following default login accounts:

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| **admin** | `admin123` | **ADMIN** | Executive access. Can run payroll, CRUD employees, edit units, download reports. |
| **john** | `john123` | **EMPLOYEE** | Linked to Senior Developer profile. Can view personal files & download monthly slips. |
| **jane** | `jane123` | **EMPLOYEE** | Linked to HR Lead profile. Can view personal profile & download monthly slips. |

---

## Mapped REST APIs

### 1. Authentication
* `POST /api/auth/login` - Authenticate credentials and return JWT token.
* `POST /api/auth/register` - Create user profile (links to Employee profile if role is `EMPLOYEE`).
* `POST /api/auth/change-password` - Update current logged-in password.
* `GET /api/auth/profile` - Retrieve credentials and employee profile of current user.

### 2. Employees (Admin Only)
* `GET /api/employees` - Paginated employee listings (supports text search, department & status filter, sorting).
* `GET /api/employees/{id}` - Retrieve details of a specific employee.
* `POST /api/employees` - Register employee profiles (supports profile photo attachments).
* `PUT /api/employees/{id}` - Modify employee fields and update profile photos.
* `DELETE /api/employees/{id}` - Remove employee profile and associated photo files.

### 3. Departments
* `GET /api/departments` - Fetch list of active departments.
* `GET /api/departments/{id}` - Retrieve department details.
* `POST /api/departments` - Add new department *(Admin Only)*.
* `PUT /api/departments/{id}` - Modify department name and description *(Admin Only)*.
* `DELETE /api/departments/{id}` - Delete department *(Admin Only, blocked if active employees are assigned)*.

### 4. Payroll
* `POST /api/payroll/generate` - Process and calculate monthly payroll for active employees *(Admin Only)*.
* `POST /api/payroll` - Submit manually adjusted payroll records *(Admin Only)*.
* `GET /api/payroll` - Fetch all payroll histories (employees see only their own history).
* `GET /api/payroll/employee/{employeeId}` - Fetch payroll slips of a specific employee.
* `GET /api/payroll/slip/{id}` - Download printable PDF salary slip.
* `DELETE /api/payroll/{id}` - Remove a specific payroll log *(Admin Only)*.

### 5. Reports (Admin Only)
* `GET /api/reports/employees/excel` - Export full employee directory sheet in Excel.
* `GET /api/reports/employees/csv` - Export full employee directory sheet in CSV.
* `GET /api/reports/payroll/excel` - Export computed payroll sheets in Excel.
* `GET /api/reports/payroll/csv` - Export computed payroll sheets in CSV.

### 6. Dashboard (Admin Only)
* `GET /api/dashboard/stats` - Fetch overall aggregates (total headcounts, monthly commitment sum, headcount graphs, salary distributions, and monthly expenses trend)
