const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const app = express();
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const upload = multer();
const port = 8090;
const fileSystemURL = process.env.FILESYSTEM_URL || "http://localhost:8100";
app.use(express.static(path.join(__dirname, "/public")));

// database connection
function createDBConnection() {
  const maxRetries = 20;
  let retries = 0;
  const retryInterval = 2000;

  const connectWithRetry = () => {
    const db = mysql.createPool({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: 50,
    });
    db.getConnection((err) => {
      if (err) {
        if (retries < maxRetries) {
          retries++;
          console.error(
            `Error connecting to the database, attempting to reconnect... (Retry ${retries})`
          );
          setTimeout(connectWithRetry, retryInterval);
        } else {
          console.error(
            "Max retries reached. Unable to connect to the database."
          );
          return;
        }
      } else {
        console.log("Connected to the database");
      }
    });
    return db;
  };

  return connectWithRetry();
}

const db = createDBConnection();

app.post("/upload", upload.array("videos"), async (req, res) => {
  const insertQueries = req.files.map((file) => {
    const title = file.originalname;
    const path = `http://localhost:8100/uploads/${title}`;

    const insertQuery = "INSERT INTO videos (title, path) VALUES (?, ?)";
    const insertValues = [title, path];

    return { query: insertQuery, values: insertValues };
  });

  // forward to the filesystem
  try {
    for (const file of req.files) {
      const formData = new FormData();
      console.log({ file: file.originalname });
      formData.append("videos", file.buffer, {
        filename: file.originalname,
      });

      await axios.post(`${fileSystemURL}/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
    }

    console.log("Files forwarded to the second application.");
  } catch (error) {
    console.error("Error forwarding files:", error);
    return res
      .status(500)
      .send("Error forwarding files to the second application");
  }

  // write to the database
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).send("Error getting database connection");
    }

    Promise.all(
      insertQueries.map(({ query, values }) => {
        return new Promise((resolve, reject) => {
          connection.query(query, values, (queryErr, results) => {
            if (queryErr) {
              console.error(
                "Error inserting data into the database:",
                queryErr
              );
              reject(queryErr);
            } else {
              resolve(results);
            }
          });
        });
      })
    )
      .then(() => {
        connection.release();
        console.log("Files inserted into the database.");
        res.sendFile(path.join(__dirname, "/public/upload.html"));
      })
      .catch((error) => {
        connection.release();
        console.error("Error inserting data into the database:", error);
        res.status(500).send("Error inserting data into the database");
      });
  });
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
