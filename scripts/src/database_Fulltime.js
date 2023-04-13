var Pool = require('pg-pool');

const db_fulltime = new Pool({
    user: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'BDD_Fulltime_prueba',
    password: 'fulltime'
});

db_fulltime.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.log("Error durante la conexión", err)
    } else {
      console.log("Conexión exitosa Fulltime")
    }
});
  
exports.fulltime = db_fulltime;