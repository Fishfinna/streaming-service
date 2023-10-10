const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 8100;

app.use(express.static(path.join(__dirname, "/uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.post("/upload", upload.array("videos"), (req, res) => {
  console.log("Uploaded: ", req.files);
  res.sendStatus(200);
});

app.get("/uploads", (req, res) => {
  const uploadDir = path.join(__dirname, "uploads");

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).send("Error reading directory");
    }

    res.json({ videos: files });
  });
});

app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
