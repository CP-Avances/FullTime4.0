import { Request, Response } from 'express';
import { ObtenerRutaLeerPlantillas, ObtenerRutaLogos } from '../../libs/accesoCarpetas';
import path from 'path';
import pool from '../../database';
import excel from 'xlsx';
import moment from 'moment';
import fs from 'fs';
const builder = require('xmlbuilder');

class ModalidaLaboralControlador {

    /** Lectura de los datos de la platilla Modalidad_cargo */
    public async VerfificarPlantillaModalidadLaboral(req: Request, res: Response) {
        const documento = req.file?.originalname;
        let separador = path.sep;
        let ruta = ObtenerRutaLeerPlantillas() + separador + documento;

        const workbook = excel.readFile(ruta);
        const sheet_name_list = workbook.SheetNames;
        const plantilla_modalidad_laboral = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        //const plantilla_cargo = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);

        let data: any = {
            fila: '',
            modalida_laboral: '',
            observacion: ''
        };
    
        var listModalidad: any = [];
        var duplicados: any = [];
        var mensaje: string = 'correcto';

        // LECTURA DE LOS DATOS DE LA PLANTILLA
        plantilla_modalidad_laboral.forEach(async (dato: any, indice: any, array: any) => {
            var {item, modalida_laboral } = dato;
            //Verificar que el registo no tenga datos vacios
        if ((item != undefined && item != '') &&
        (modalida_laboral != undefined && modalida_laboral != '')){
          data.fila = item;
          data.modalida_laboral = modalida_laboral;
          data.observacion = 'no registrado';

          listModalidad.push(data);
        }else{
            data.fila = item;
            data.modalida_laboral = modalida_laboral;
            data.observacion = 'no registrado';
  
            if (data.fila == '' || data.fila == undefined) {
              data.fila = 'error';
              mensaje = 'error'
            }
    
            if (modalida_laboral == undefined) {
              data.modalida_laboral = 'No registrado';
              data.observacion = 'Modalidad laboral ' + data.observacion;
            }



            listModalidad.push(data);
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


        listModalidad.forEach(async(item:any) => {
            if(item.observacion == 'no registrado'){
                var VERIFICAR_MODALIDAD = await pool.query('SELECT * FROM modal_trabajo WHERE UPPER(descripcion) = $1', [item.modalida_laboral.toUpperCase()])
                if(VERIFICAR_MODALIDAD.rows[0] == undefined || VERIFICAR_MODALIDAD.rows[0] == ''){
                    item.observacion = 'ok'
                }else{
                    item.observacion = 'Ya existe en el sistema'
                }

                // Discriminación de elementos iguales
                if(duplicados.find((p: any)=> p.modalida_laboral.toLowerCase() === item.modalida_laboral.toLowerCase()) == undefined)
                {
                    duplicados.push(item);
                }else{
                    item.observacion = '1';
                }

            }
            
        });

        setTimeout(() => {
            listModalidad.sort((a: any, b: any) => {
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
      
              listModalidad.forEach(async(item:any) => {
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
                listModalidad = undefined;
              }
      
              return res.jsonp({ message: mensaje, data: listModalidad});
        
            }, 1000)

    }

    /** Registrar plantilla Modalidad_cargo **/
    public async CargarPlantilla(req: Request, res: Response){
        
    }

}

export const modalidaLaboralControlador = new ModalidaLaboralControlador();

export default modalidaLaboralControlador;