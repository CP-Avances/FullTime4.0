import { Request, Response } from 'express';
import { ObtenerRutaLeerPlantillas, ObtenerRutaLogos } from '../../libs/accesoCarpetas';
import path from 'path';
import pool from '../../database';
import excel from 'xlsx';
import moment from 'moment';
import fs from 'fs';
import { QueryResult } from 'pg';
const builder = require('xmlbuilder');

class TiposCargosControlador {
    public async listaTipoCargos(req: Request, res: Response){
        try{
            const TIPO_CARGO = await pool.query(
                `
                SELECT * FROM tipo_cargo ORDER BY cargo ASC
                `
            );
            if (TIPO_CARGO.rowCount > 0) {
                return res.jsonp(TIPO_CARGO.rows)
            }else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        }catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    public async CrearCargo(req: Request, res: Response){
        try {
            const cargo = req.params.cargo;
            await pool.query(
              `
              INSERT INTO tipo_cargo (descripcion) VALUES ($1)
              `
              , [cargo]);
      
            res.jsonp({ message: 'Registro guardado.' });
          }
          catch (error) {
            return res.jsonp({ message: 'error' });
          }
    }

    public async EditarCargo(req: Request, res: Response){
        try {
            const { id, cargo } = req.body;
            await pool.query(
                `
                UPDATE tipo_cargo SET cargo = $2
                WHERE id = $1
                `
                , [id, cargo]);
            res.jsonp({ message: 'Registro actualizado.' });
        }
        catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    public async eliminarRegistro(req: Request, res: Response){
        try{
            const id = req.params.id;
            console.log('id: ',id)
            await pool.query(
            `
                DELETE FROM tipo_cargo WHERE id = $1
            `
            , [id]);
            res.jsonp({ message: 'Registro eliminado.' });

        }catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    /** Lectura de los datos de la platilla Modalidad_cargo */
    public async VerfificarPlantillaTipoCargos(req: Request, res: Response) {
        try{
            const documento = req.file?.originalname;
            let separador = path.sep;
            let ruta = ObtenerRutaLeerPlantillas() + separador + documento;

            const workbook = excel.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla_cargo = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);

            let data: any = {
                fila: '',
                tipo_cargo: '',
                observacion: ''
            };
    
            var listCargos: any = [];
            var duplicados: any = [];
            var mensaje: string = 'correcto';

            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla_cargo.forEach(async (dato: any, indice: any, array: any) => {
                var {item, cargo } = dato;
                //Verificar que el registo no tenga datos vacios
                if ((item != undefined && item != '') &&
                (cargo != undefined && cargo != '')){
                    data.fila = item;
                    data.tipo_cargo = cargo;
                    data.observacion = 'no registrado';

                    listCargos.push(data);
                }else{
                    data.fila = item;
                    data.tipo_cargo = cargo;
                    data.observacion = 'no registrado';
  
                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error'
                    }
    
                    if (data.tipo_cargo == undefined) {
                        data.tipo_cargo = 'No registrado';
                        data.observacion = 'Cargo ' + data.observacion;
                    }

                    listCargos.push(data);
                }
                data = {};
            
            });

            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs.access(ruta, fs.constants.F_OK, (err) => {
                if (err) {
                } else {
                    // ELIMINAR DEL SERVIDOR
                    fs.unlinkSync(ruta);
                }
            });

            listCargos.forEach(async(item:any) => {
            if(item.observacion == 'no registrado'){
                var VERIFICAR_CARGOS = await pool.query('SELECT * FROM tipo_cargo WHERE UPPER(cargo) = $1', [item.tipo_cargo.toUpperCase()])
                if(VERIFICAR_CARGOS.rows[0] == undefined || VERIFICAR_CARGOS.rows[0] == ''){
                    item.observacion = 'ok'
                }else{
                    item.observacion = 'Ya existe en el sistema'
                }

                // Discriminación de elementos iguales
                if(duplicados.find((p: any)=> p.tipo_cargo.toLowerCase() === item.tipo_cargo.toLowerCase()) == undefined)
                {
                    duplicados.push(item);
                }else{
                    item.observacion = '1';
                }

            }
            
            });

            setTimeout(() => {
            listCargos.sort((a: any, b: any) => {
                  // Compara los números de los objetos
                  if (a.fila < b.fila) {
                      return -1;
                  }
                  if (a.fila > b.fila) {
                      return 1;
                  }
                  return 0; // Son iguales
              });
      
              var filaDuplicada: number = 0;
      
              listCargos.forEach(async(item:any) => {
                if(item.observacion == '1') {
                  item.observacion = 'Registro duplicado'
                }
      
                  //Valida si los datos de la columna N son numeros.
                  if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                  //Condicion para validar si en la numeracion existe un numero que se repite dara error.
                      if(item.fila == filaDuplicada){
                          mensaje = 'error';
                      }
                  }else{
                      return mensaje = 'error';
                  } 
      
                  filaDuplicada = item.fila;
      
              });
      
              if(mensaje == 'error'){
                listCargos = undefined;
              }
      
              return res.jsonp({ message: mensaje, data: listCargos});
        
            }, 1000)

        }catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    /** Registrar plantilla Modalidad_cargo **/
    public async CargarPlantilla(req: Request, res: Response){
        try{
            const plantilla = req.body;
            console.log('datos Tipo Cargos: ', plantilla);
            var contador = 1; 
            var respuesta: any

            plantilla.forEach(async (data: any) => {
                // Datos que se guardaran de la plantilla ingresada
                const {item, tipo_cargo, observacion} = data;
                const cargo = tipo_cargo.charAt(0).toUpperCase() + tipo_cargo.slice(1).toLowerCase();

                // Registro de los datos de contratos
                const response: QueryResult = await pool.query(
                `INSERT INTO tipo_cargo (cargo) VALUES ($1) RETURNING *
                `,[cargo]);
  
                const [cargos] = response.rows;

                if (contador === plantilla.length) {
                    if (cargos) {
                      return respuesta = res.status(200).jsonp({message: 'ok'})
                    }else {
                      return respuesta = res.status(404).jsonp({ message: 'error' })
                    }
                  }
          
                  contador = contador + 1;

            });


        }catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }
}

export const tiposCargosControlador = new TiposCargosControlador();
export default tiposCargosControlador;