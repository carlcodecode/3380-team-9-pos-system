import http from "http";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const server = http.createServer(async (req, res) => {
  if (req.url === "/api/test") {
    try {
      const [rows] = await db.query("SELECT NOW() AS time;");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Connected ✅", time: rows[0].time }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000, () => console.log("✅ Backend running on port 3000"));
