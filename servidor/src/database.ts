// CONEXION CON LA BASE DE DATOS POSTGRESQL

import Pool from 'pg-pool';

const pool = new Pool({
  user: 'postgres', // postgres
  host: '192.168.0.145', //'186.4.226.49',
  port: 5433,
  database: 'fulltime4_actual2',
  password: 'postgres'
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log("Error durante la conexión", err)
  } else {
    console.log("Conexión exitosa")
  }
})

export default pool;