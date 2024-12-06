# Rail Reserve API

A comprehensive Railway Reservation System API built with Node.js, Express, and MySQL.

## Features

- User Authentication and Authorization
- Train Management System
- Real-time Seat Availability
- Secure Booking System
- Schedule Management
- Race Condition Handling
- API Key Protection

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository
```bash
git clone https://github.com/Gagan2601/rail-reserve-api.git
cd rail-reserve-api
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables\
Create a `.env` file in the root directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=railway_system
JWT_SECRET=your_jwt_secret_key
ADMIN_API_KEY=your_admin_api_key
```

4. Set up the database
- Open MySQL Workbench
- Connect to your MySQL server
- Create a new query tab
- Copy and paste the contents of `db/init.sql`
- Execute the script

## API Documentation

### Authentication APIs

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
    "username": "string",
    "password": "string",
    "email": "string",
    "phone": "string"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
    "username": "string",
    "password": "string"
}
```

### Train Management APIs

#### Add New Train (Admin)
```
POST /api/trains
Headers: X-API-Key: your_admin_api_key
Content-Type: application/json

{
    "train_number": "string",
    "name": "string",
    "source": "string",
    "destination": "string",
    "departure_time": "HH:mm",
    "arrival_time": "HH:mm",
    "total_seats": number,
    "fare": number
}
```

#### Update Train Schedule (Admin)
```
PUT /api/trains/:trainId/schedule
Headers: X-API-Key: your_admin_api_key
Content-Type: application/json

{
    "departure_time": "HH:mm",
    "arrival_time": "HH:mm",
    "reason": "string"
}
```

#### Check Train Availability
```
GET /api/trains/availability?source=string&destination=string
```

#### Get Train Details
```
GET /api/trains/:trainNumber
```

### Booking APIs

#### Create Booking
```
POST /api/trains/book
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
    "train_id": number,
    "seats": number
}
```

#### Get Booking Details
```
GET /api/trains/bookings/:bookingNumber
Headers: Authorization: Bearer <token>
```

#### Cancel Booking
```
PUT /api/trains/bookings/cancel/:bookingId
Headers: Authorization: Bearer <token>
```

## Error Handling

The API uses standard HTTP response codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Security Features

1. JWT Authentication
2. API Key Protection for Admin Routes
3. Password Hashing
4. Rate Limiting
5. SQL Injection Protection
6. Race Condition Handling

## Best Practices

1. Connection Pooling
2. Proper Error Handling
3. Input Validation
4. Transaction Management
5. Proper Indexing
6. Secure Password Storage

## Development

To start the server:
```bash
node index.js
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
