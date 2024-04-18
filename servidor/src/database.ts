// CONEXION CON LA BASE DE DATOS POSTGRESQL

import Pool from 'pg-pool';

const pool = new Pool({
  user: 'postgres', // postgres
  host: '192.168.0.144',
  port: 5435,
  database: 'ft_v4',
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