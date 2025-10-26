// CONEXION CON LA BASE DE DATOS POSTGRESQL
import Pool from 'pg-pool';
const pool = new Pool({

  user: 'postgres',
  host: 'localhost',
  port: 5434,
  database: 'pruebas_marcacion',
  password: 'KAte1727.'

})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log("Error durante la conexión", err)
  } else {
    console.log("Conexión exitosa")
  }
})

export default pool;