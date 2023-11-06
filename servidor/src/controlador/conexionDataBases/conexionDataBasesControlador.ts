import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import Pool from 'pg-pool';
import pool from '../../database';

class ConexionDataBasesControlador {

  // METODO PARA OPTENER EL NOMBRE DE LA BASE DE DATOS
  public async setDatabaseName(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;
    console.log('entro en conexion data base')

    const db_cliente = new Pool({
      user: 'postgres',
      host: 'localhost',
      port: 5432,
      database: nombre,
      password: '12345'
  });
  
  db_cliente.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.log("Error durante la conexión", err)
      } else {
        console.log("Conexión exitosa base: ",nombre)
      }
  });
    
  exports.cliente = db_cliente;

    return res.json(exports.cliente);
    
  }


}

export const CONEXION_DATABASES_CONTROLADOR = new ConexionDataBasesControlador();

export default CONEXION_DATABASES_CONTROLADOR;