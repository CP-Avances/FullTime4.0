// CONEXION CON LA BASE DE DATOS POSTGRESQL
import Pool from 'pg-pool';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost', //'186.4.226.49',
  port: 5432,
  database: 'fulltime4_prueba5',
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