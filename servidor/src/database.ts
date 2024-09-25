// CONEXION CON LA BASE DE DATOS POSTGRESQL

import Pool from 'pg-pool';
/*
const pool = new Pool({
  user: 'fulltime',
  host: '192.168.0.156', //'186.4.226.49',
  port: 5432,
  database: 'prueba_empresa',
  password: 'fulltime'
})
*/

const pool = new Pool({
  user: 'postgres',
  host: '192.168.0.148', //'186.4.226.49',
  port: 5432,
  database: 'prueba_empresa',
  password: 'fu11tim3'
})


pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log("Error durante la conexión", err)
  } else {
    console.log("Conexión exitosa")
  }
})

export default pool;