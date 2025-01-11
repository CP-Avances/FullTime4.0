// CONEXION CON LA BASE DE DATOS POSTGRESQL
import Pool from 'pg-pool';

const pool = new Pool({
  user: 'postgres',
  host: '192.168.0.148',
  port: 5432,
  database: 'fulltime4_prueba4',
  password: '12345'
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log("Error durante la conexión", err)
  } else {
    console.log("Conexión exitosa")
  }
})

export default pool;