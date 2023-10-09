const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();
const port = 8090;

app.use(express.static(path.join(__dirname, "/public")));

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

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.post("/upload", upload.array("videos", 5), (req, res) => {
  console.log("Uploaded Files:", req.files);
  res.sendFile(path.join(__dirname, "/public/upload.html"));
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
