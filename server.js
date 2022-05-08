const db = require("./db/connection");
const express = require("express");
const runProgram = require("./app");
const PORT = process.env.PORT || 3001;
const app = express();

// express middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use((req, res) => {
  res.status(404).end();
});

// Start connection
db.connect(err => {
  if (err) throw err;
  console.log('Connection established');
  app.listen(PORT, () => {
    console.log(`https://localhost:${PORT}`);
    runProgram();
  });
});
