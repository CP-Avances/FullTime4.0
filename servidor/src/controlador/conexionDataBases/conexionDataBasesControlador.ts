import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import Pool from 'pg-pool';
import pool from '../../database';

class ConexionDataBasesControlador {

  NombreDataB: any;

  constructor(){
    const db_cliente = new Pool({
      user: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'VacaOrtiz',
      password: 'fulltime'
  });
  
  db_cliente.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.log("Error durante la conexión", err)
      } else {
        console.log("Conexión exitosa Cliente")
      }
  });
    
  exports.cliente = db_cliente;
  }

  // METODO PARA OPTENER EL NOMBRE DE LA BASE DE DATOS
  public async getDatabaseName(req: Request, res: Response): Promise<any> {
    
  }


}

export const CONEXION_DATABASES_CONTROLADOR = new ConexionDataBasesControlador();

export default CONEXION_DATABASES_CONTROLADOR;