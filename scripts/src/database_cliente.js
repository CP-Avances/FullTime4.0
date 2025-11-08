var Pool = require('pg-pool');

const db_cliente = new Pool({
    user: 'postgres',
    host: '192.168.0.144',
    port: 5438,
    database: 'ft_mag',
    password: 'postgres'
});

db_cliente.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.log("Error durante la conexión", err)
    } else {
      console.log("Conexión exitosa Cliente")
    }
});
  
exports.cliente = db_cliente;