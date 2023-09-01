//Conexión con la base de datos PostgreSQL

import Pool from 'pg-pool';

const pool = new Pool({
  user: 'fulltime',
  host: '186.4.226.49',
  port: 9192,
  database: 'fulltime4',
  password: 'fulltime'
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log("Error durante la conexión", err)
  } else {
    console.log("Conexión exitosa")
  }
})

export default pool;