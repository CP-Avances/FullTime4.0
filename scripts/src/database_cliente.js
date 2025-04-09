var Pool = require('pg-pool');

const db_cliente = new Pool({
    user: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'VacaOrtiz',
    password: 'fulltime'
});

db_cliente.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.log("Error durante la conexión", err)
    } else {
      console.log("Conexión exitosa Cliente")
    }
});
  
exports.cliente = db_cliente;