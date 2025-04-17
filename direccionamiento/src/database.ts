// CONEXION CON LA BASE DE DATOS POSTGRESQL

import Pool from 'pg-pool';

const pool = new Pool({
  user: 'postgres', // postgres
  host: 'localhost',
  port: 5433,
  database: 'fulltimeDireccionar',
  password: 'KAte1234'
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log("Error durante la conexión", err);
  } else {
    console.log("Conexión exitosa");
  }
})

export default pool;