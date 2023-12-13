let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH,DELETE,HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-with, Content-Type,Accept"
  );
  next();
});
var port = process.env.PORT || 2410;
// const port = 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

let { Client } = require("pg");
let client = new Client({
  user: "postgres",
  password: "anr(.-TmNaf5tzi",
  database: "postgres",
  port: 5432,
  host: "db.arnwpdjvjfgirpadvkbh.supabase.co",
  ssl: { rejectUnauthorized: false },
});
client.connect(function (res, error) {
  console.log(`Connected!!!`);
});

app.get("/mobs", function (req, res) {
  console.log("/mobs", req.query);
  let brandStr = req.query.brand;
  let RAM = req.query.RAM;
  let ROM = req.query.ROM;
  let query = "SELECT * FROM mobs";
  if (brandStr || RAM || ROM) {
    query += " WHERE";
    if (brandStr) {
      let brandArr = brandStr.split(",");
      query += ` brand IN ('${brandArr.join("','")}')`;
    }
    if (RAM) {
      let RAMArr = RAM.split(",");
      query += brandStr ? " AND" : "";
      query += ` RAM IN ('${RAMArr.join("','")}')`;
    }
    if (ROM) {
      let ROMArr = ROM.split(",");
      query += brandStr || RAM ? " AND" : "";
      query += ` ROM IN ('${ROMArr.join("','")}')`;
    }
  }
  client.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      res.send(result.rows);
    }
  });
});

app.get("/mobs/:name", function (req, res) {
  let name = req.params.name;

  client.query("SELECT * FROM mobs WHERE name = $1", [name], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      if (result.rows.length > 0) {
        res.send(result.rows[0]);
      } else {
        res.status(404).send("No Mobile Name found");
      }
    }
  });
});

app.get("/mobs/brand/:brandname", function (req, res) {
  let brandname = req.params.brandname;

  client.query(
    "SELECT * FROM mobs WHERE brand = $1",
    [brandname],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        res.send(result.rows);
      }
    }
  );
});

app.put("/mobs/:name", function (req, res) {
  let name = req.params.name;
  let body = req.body;

  client.query(
    "UPDATE mobs SET brand = $1, price = $2, ram = $3, rom = $4, os = $5 WHERE name = $6 RETURNING *",
    [body.brand, body.price, body.ram, body.rom, body.os, name],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        if (result.rows.length > 0) {
          res.send(result.rows[0]);
        } else {
          res.status(404).send("No Mobile Device found");
        }
      }
    }
  );
});

app.post("/mobs", function (req, res) {
  let body = req.body;

  client.query(
    "INSERT INTO mobs (name, brand, price, RAM, ROM, OS) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [body.name, body.brand, body.price, body.RAM, body.ROM, body.OS],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        res.send(result.rows[0]);
      }
    }
  );
});

app.delete("/mobs/:name", function (req, res) {
  let name = req.params.name;

  client.query(
    "DELETE FROM mobs WHERE name = $1 RETURNING *",
    [name],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        if (result.rows.length > 0) {
          res.send(result.rows[0]);
        } else {
          res.status(404).send("No Mobile Device found");
        }
      }
    }
  );
});
