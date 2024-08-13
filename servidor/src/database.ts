// CONEXION CON LA BASE DE DATOS POSTGRESQL

import Pool from 'pg-pool';

const pool = new Pool({
    user: 'fulltime',
    host: '192.168.0.156', //186.4.226.49
    password: 'fulltime',
    database: 'prueba_empresa',
    port: 5432
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log("Error durante la conexión", err)
  } else {
    console.log("Conexión exitosa")
  }
})

export default pool;