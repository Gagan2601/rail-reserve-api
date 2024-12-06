const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken, authenticateAdmin } = require("../middlewares/auth");

router.post("/", authenticateAdmin, async (req, res) => {
  const {
    train_number,
    name,
    source,
    destination,
    total_seats,
    fare,
    schedule_time,
  } = req.body;

  try {
    const [existingTrain] = await pool.execute(
      "SELECT id FROM trains WHERE train_number = ?",
      [train_number]
    );

    if (existingTrain.length > 0) {
      return res.status(409).json({
        error: "Train number already exists",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO trains (
                train_number, name, source, destination, 
                total_seats, available_seats, fare, schedule_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        train_number,
        name,
        source,
        destination,
        total_seats,
        total_seats,
        fare,
        schedule_time,
      ]
    );

    res.status(201).json({
      message: "Train added successfully",
      trainId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: "Error adding train" });
  }
});

router.get("/availability", async (req, res) => {
  const { source, destination } = req.query;

  if (!source || !destination) {
    return res.status(400).json({
      error: "Source and destination are required",
    });
  }

  try {
    const [trains] = await pool.execute(
      `SELECT id, train_number, name, source, destination, 
            available_seats, fare, schedule_time, status 
            FROM trains 
            WHERE source = ? AND destination = ? AND status = 'active'
            AND available_seats > 0`,
      [source, destination]
    );

    res.json(trains);
  } catch (err) {
    res.status(500).json({ error: "Error fetching trains" });
  }
});

router.patch("/:trainId/status", authenticateAdmin, async (req, res) => {
  const { trainId } = req.params;
  const { status } = req.body;

  try {
    await pool.execute("UPDATE trains SET status = ? WHERE id = ?", [
      status,
      trainId,
    ]);

    res.json({ message: "Train status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error updating train status" });
  }
});

router.put("/:trainId", authenticateAdmin, async (req, res) => {
  const { trainId } = req.params;
  const { name, total_seats, fare, schedule_time } = req.body;

  try {
    await pool.execute(
      `UPDATE trains 
            SET name = ?, total_seats = ?, fare = ?, schedule_time = ?
            WHERE id = ?`,
      [name, total_seats, fare, schedule_time, trainId]
    );

    res.json({ message: "Train details updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error updating train details" });
  }
});

router.post("/book", authenticateToken, async (req, res) => {
  const { train_id, seats } = req.body;
  const user_id = req.user.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [trains] = await connection.execute(
      'SELECT * FROM trains WHERE id = ? AND status = "active" FOR UPDATE',
      [train_id]
    );

    if (trains.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Train not found or not active" });
    }

    const train = trains[0];
    if (train.available_seats < seats) {
      await connection.rollback();
      return res.status(400).json({ error: "Not enough seats available" });
    }
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 100)}`;
    const totalFare = train.fare * seats;

    await connection.execute(
      "UPDATE trains SET available_seats = available_seats - ? WHERE id = ?",
      [seats, train_id]
    );
    const [booking] = await connection.execute(
      `INSERT INTO bookings (
                booking_number, user_id, train_id, seats, total_fare
            ) VALUES (?, ?, ?, ?, ?)`,
      [bookingNumber, user_id, train_id, seats, totalFare]
    );

    await connection.commit();

    res.status(201).json({
      message: "Booking successful",
      booking_id: booking.insertId,
      booking_number: bookingNumber,
      total_fare: totalFare,
    });
  } catch (err) {
    await connection.rollback();
    console.log(err);
    res.status(500).json({ error: "Error booking tickets" });
  } finally {
    connection.release();
  }
});

router.post("/cancel/:bookingId", authenticateToken, async (req, res) => {
  const { bookingId } = req.params;
  const user_id = req.user.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [bookings] = await connection.execute(
      "SELECT * FROM bookings WHERE id = ? AND user_id = ? FOR UPDATE",
      [bookingId, user_id]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookings[0];
    if (booking.booking_status === "cancelled") {
      await connection.rollback();
      return res.status(400).json({ error: "Booking already cancelled" });
    }

    await connection.execute(
      'UPDATE bookings SET booking_status = "cancelled" WHERE id = ?',
      [bookingId]
    );

    await connection.execute(
      "UPDATE trains SET available_seats = available_seats + ? WHERE id = ?",
      [booking.seats, booking.train_id]
    );

    await connection.commit();

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: "Error cancelling booking" });
  } finally {
    connection.release();
  }
});

router.get("/bookings", authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const [bookings] = await pool.execute(
      `SELECT b.*, t.train_number, t.name as train_name, 
            t.source, t.destination, t.schedule_time
            FROM bookings b
            JOIN trains t ON b.train_id = t.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC`,
      [user_id]
    );

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Error fetching bookings" });
  }
});

module.exports = router;
