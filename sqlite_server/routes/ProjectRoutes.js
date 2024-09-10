const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const sqlite3 = require("sqlite3");
const csv = require("csv-parser");

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".sqlite", ".csv"];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only .sqlite and .csv files are allowed.")
      );
    }
  },
});

// Function to delete old files
const deleteOldFiles = () => {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  const currentTime = Date.now();
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error("Error reading uploads directory:", err);
      return;
    }
    files.forEach((file) => {
      if (file.includes("921c838c-541d-4361-8c96-70cb23abd9f5.sqlite")) {
        return; // Skip deleting '1.sqlite'
      }
      const filePath = path.join(uploadsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting file stats for ${file}:`, err);
          return;
        }
        const fileAge = currentTime - stats.mtime.getTime();
        if (fileAge > 14400000) {
          // 4 hours in milliseconds
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${file}:`, err);
            } else {
              console.log(`Deleted old file: ${file}`);
            }
          });
        }
      });
    });
  });
};

// Set up interval to run deleteOldFiles every hour
setInterval(deleteOldFiles, 3600000);

// Function to convert CSV to SQLite
const convertCsvToSqlite = (csvFilePath, sqliteFilePath) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(sqliteFilePath);
    const results = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        if (results.length === 0) {
          db.close();
          reject(new Error("CSV file is empty"));
          return;
        }

        const columns = Object.keys(results[0]);
        const tableName = "csv_data";
        const createTableQuery = `CREATE TABLE ${tableName} (${columns
          .map((col) => `"${col}" TEXT`)
          .join(", ")})`;

        db.serialize(() => {
          db.run(createTableQuery);

          const stmt = db.prepare(
            `INSERT INTO ${tableName} VALUES (${columns
              .map(() => "?")
              .join(", ")})`
          );
          results.forEach((row) => {
            stmt.run(Object.values(row));
          });
          stmt.finalize();

          db.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });
  });
};

// Endpoint for uploading .sqlite or .csv files
app.post("/upload-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUuid = uuidv4();
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let newFilePath;

    if (fileExtension === ".sqlite") {
      newFilePath = `uploads/${fileUuid}.sqlite`;
      fs.renameSync(req.file.path, newFilePath);
    } else if (fileExtension === ".csv") {
      const csvFilePath = req.file.path;
      newFilePath = `uploads/${fileUuid}.sqlite`;
      try {
        await convertCsvToSqlite(csvFilePath, newFilePath);
        fs.unlinkSync(csvFilePath); // Delete the original CSV file
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Error converting CSV to SQLite" });
      }
    }

    res.json({ uuid: fileUuid });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ error: "File upload error: " + error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint for executing SQL queries on uploaded databases
app.post("/execute-query", (req, res) => {
  const { uuid, query } = req.body;
  console.log(uuid, query);

  if (!uuid || !query) {
    return res.status(400).json({ error: "Missing uuid or query" });
  }

  const dbPath = `uploads/${uuid}.sqlite`;

  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: "Database not found" });
  }

  const db = new sqlite3.Database(dbPath);

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    const results = rows.map((row) => Object.values(row));
    res.json({ results });
  });

  db.close();
});

// Endpoint for retrieving database schema
app.get("/get-schema/:uuid", (req, res) => {
  const uuid = req.params.uuid;

  if (!uuid) {
    return res.status(400).json({ error: "Missing uuid" });
  }

  const dbPath = `uploads/${uuid}.sqlite`;

  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: "Database not found" });
  }

  const db = new sqlite3.Database(dbPath);

  db.all(
    "SELECT name, sql FROM sqlite_master WHERE type='table';",
    [],
    (err, tables) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }

      const schema = [];

      const processTable = (index) => {
        if (index >= tables.length) {
          db.close();
          return res.json({ schema: schema.join("\n") });
        }

        const { name: tableName, sql: createStatement } = tables[index];
        schema.push(`Table: ${tableName}`);
        schema.push(`CREATE statement: ${createStatement}\n`);

        db.all(`SELECT * FROM '${tableName}' LIMIT 3;`, [], (err, rows) => {
          if (err) {
            console.error(`Error fetching rows for table ${tableName}:`, err);
          } else if (rows.length > 0) {
            schema.push("Example rows:");
            rows.forEach((row) => schema.push(JSON.stringify(row)));
          }
          schema.push(""); // Add a blank line between tables
          processTable(index + 1);
        });
      };

      processTable(0);
    }
  );
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

module.exports = app;
