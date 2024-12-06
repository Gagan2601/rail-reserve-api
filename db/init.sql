DROP DATABASE IF EXISTS railway_system;
CREATE DATABASE railway_system;
USE railway_system;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trains (
    id INT PRIMARY KEY AUTO_INCREMENT,
    train_number VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    fare DECIMAL(10,2) NOT NULL,
    schedule_time TIME NOT NULL,
    status ENUM('active', 'cancelled', 'delayed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_number VARCHAR(30) UNIQUE NOT NULL,
    user_id INT,
    train_id INT,
    seats INT NOT NULL,
    total_fare DECIMAL(10,2) NOT NULL,
    booking_status ENUM('confirmed', 'cancelled', 'waiting') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (train_id) REFERENCES trains(id)
);

CREATE INDEX idx_source_dest ON trains(source, destination);
CREATE INDEX idx_user_bookings ON bookings(user_id);
CREATE INDEX idx_train_number ON trains(train_number);
CREATE INDEX idx_booking_number ON bookings(booking_number);

--(password: admin123)
INSERT INTO users (username, password, email, role)
VALUES (
    'admin',
    '$2b$10$uC/1XwZwGLYHBIHEHF5qXuqgNaLQ76W8W9YJ8TPbcXvKAXLhzGUYq',
    'admin@railreserve.com',
    'admin'
);

INSERT INTO trains (train_number, name, source, destination, total_seats, available_seats, fare, schedule_time) 
VALUES 
('12951', 'Rajdhani Express', 'Delhi', 'Mumbai', 500, 500, 1200.00, '16:00:00'),
('12952', 'Shatabdi Express', 'Mumbai', 'Bangalore', 400, 400, 1000.00, '08:00:00'),
('12953', 'Duronto Express', 'Delhi', 'Mumbai', 450, 450, 1100.00, '20:00:00'),
('12954', 'Chennai Express', 'Mumbai', 'Chennai', 350, 350, 900.00, '10:00:00');