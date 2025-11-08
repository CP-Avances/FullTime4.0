var Pool = require("pg-pool");

const db_fulltime = new Pool({
  user: "postgres",
  host: "192.168.0.148",
  port: 5432,
  database: "pruebas_reportes",
  password: "fu11tim3",
});

db_fulltime.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.log("Error durante la conexión", err);
  } else {
    console.log("Conexión exitosa Fulltime");
  }
});

exports.fulltime = db_fulltime;
