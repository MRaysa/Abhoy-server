# MedAI Backend Server

A RESTful API server for MedAI healthcare application built with Express.js, MongoDB, and MVC architecture.

## Project Structure

```
server-site/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── userController.js    # User business logic
│   ├── doctorController.js  # Doctor business logic
│   ├── appointmentController.js  # Appointment business logic
│   └── medicalRecordController.js  # Medical record business logic
├── models/
│   ├── User.js              # User model
│   ├── Doctor.js            # Doctor model
│   ├── Appointment.js       # Appointment model
│   └── MedicalRecord.js     # Medical record model
├── routes/
│   ├── index.js             # Main router
│   ├── userRoutes.js        # User routes
│   ├── doctorRoutes.js      # Doctor routes
│   ├── appointmentRoutes.js # Appointment routes
│   └── medicalRecordRoutes.js  # Medical record routes
├── middleware/
│   ├── errorHandler.js      # Global error handler
│   ├── notFound.js          # 404 handler
│   ├── logger.js            # Request logger
│   └── validateRequest.js   # Request validation
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── index.js                # Application entry point
└── package.json            # Dependencies and scripts
```

## Installation

1. Clone the repository
2. Navigate to the server-site directory:
```bash
cd server-site
```

3. Install pnpm if you haven't already:
```bash
npm install -g pnpm
```

4. Install dependencies:
```bash
pnpm install
```

5. Create a `.env` file by copying `.env.example`:
```bash
cp .env.example .env
```

6. Update `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017
DB_NAME=medai_db
CLIENT_URL=http://localhost:5173
```

## Running the Server

### Development Mode (with auto-reload):
```bash
pnpm dev
```

### Production Mode:
```bash
pnpm start
```

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Health Check
- **GET** `/api/health` - Check API status

---

### Users API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (with pagination) |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

**Query Parameters for GET /api/users:**
- `page` (default: 1)
- `limit` (default: 10)

**User Object:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "patient"
}
```

---

### Doctors API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | Get all doctors (with pagination) |
| GET | `/api/doctors/:id` | Get doctor by ID |
| GET | `/api/doctors/specialization/:specialization` | Get doctors by specialization |
| POST | `/api/doctors` | Create new doctor |
| PUT | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor |

**Query Parameters for GET /api/doctors:**
- `page` (default: 1)
- `limit` (default: 10)
- `specialization` (optional filter)

**Doctor Object:**
```json
{
  "name": "Dr. Smith",
  "email": "drsmith@example.com",
  "phone": "+1234567890",
  "specialization": "Cardiologist",
  "qualification": "MD, MBBS",
  "experience": 10,
  "hospitalName": "City Hospital",
  "address": "123 Medical St, City",
  "fee": 100,
  "availableSlots": ["09:00-10:00", "10:00-11:00"]
}
```

---

### Appointments API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments (with pagination) |
| GET | `/api/appointments/:id` | Get appointment by ID |
| GET | `/api/appointments/user/:userId` | Get appointments by user ID |
| GET | `/api/appointments/doctor/:doctorId` | Get appointments by doctor ID |
| POST | `/api/appointments` | Create new appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| PATCH | `/api/appointments/:id/status` | Update appointment status |
| DELETE | `/api/appointments/:id` | Delete appointment |

**Query Parameters for GET /api/appointments:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional filter: pending, confirmed, cancelled, completed)
- `userId` (optional filter)
- `doctorId` (optional filter)

**Appointment Object:**
```json
{
  "userId": "user_id_here",
  "doctorId": "doctor_id_here",
  "appointmentDate": "2025-01-15",
  "appointmentTime": "10:00",
  "symptoms": "Fever and cough",
  "notes": "Additional notes",
  "status": "pending"
}
```

**Status Values:** `pending`, `confirmed`, `cancelled`, `completed`

---

### Medical Records API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medical-records` | Get all medical records (with pagination) |
| GET | `/api/medical-records/:id` | Get medical record by ID |
| GET | `/api/medical-records/user/:userId` | Get medical records by user ID |
| POST | `/api/medical-records` | Create new medical record |
| PUT | `/api/medical-records/:id` | Update medical record |
| DELETE | `/api/medical-records/:id` | Delete medical record |

**Query Parameters for GET /api/medical-records:**
- `page` (default: 1)
- `limit` (default: 10)

**Medical Record Object:**
```json
{
  "userId": "user_id_here",
  "doctorId": "doctor_id_here",
  "appointmentId": "appointment_id_here",
  "diagnosis": "Common cold",
  "prescription": [
    {
      "medicine": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days"
    }
  ],
  "testResults": [
    {
      "testName": "Blood Test",
      "result": "Normal",
      "date": "2025-01-15"
    }
  ],
  "notes": "Patient advised rest",
  "vitals": {
    "bloodPressure": "120/80",
    "temperature": "98.6",
    "pulse": "72"
  }
}
```

---

## Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development mode only)"
}
```

### Paginated Response:
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10,
  "data": []
}
```

## Error Handling

The API uses the following HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Middleware

1. **CORS** - Enables cross-origin requests
2. **Logger** - Logs all incoming requests
3. **Error Handler** - Global error handling
4. **Not Found** - Handles 404 errors

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **dotenv** - Environment variables
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development auto-reload

## Development

To add new features:

1. Create model in `models/`
2. Create controller in `controllers/`
3. Create routes in `routes/`
4. Register routes in `routes/index.js`

## License

ISC
