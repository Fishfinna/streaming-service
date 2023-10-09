const express = require("express");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql2");
const app = express();
const port = 8090;

app.use(express.static(path.join(__dirname, "/public")));

function createDBConnection() {
  const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  db.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      return;
    }
    console.log("Connected to the database");
  });

  return db;
}

setTimeout(() => {
  const db = createDBConnection();

  // this should be swapped out with a connection to the filesystem instead
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });

  const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

  app.post("/upload", upload.array("videos"), (req, res) => {
    req.files.forEach((file) => {
      const title = file.filename;
      const path = `http://localhost:8100/uploads/${title}`;

      const insertQuery = "INSERT INTO videos (title, path) VALUES (?, ?)";

      db.query(insertQuery, [title, path], (err, results) => {
        if (err) {
          console.error("Error inserting data into the database:", err);
          return res.status(500).send("Error inserting data into the database");
        }

        console.log(
          `File "${title}" inserted into the database with URL "${path}"`
        );
      });
    });

    res.sendFile(path.join(__dirname, "/public/upload.html"));
  });

  app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
  });
}, 10000); // 10 seconds timeout so that the mysql database has a chance to get going before we try to connect
