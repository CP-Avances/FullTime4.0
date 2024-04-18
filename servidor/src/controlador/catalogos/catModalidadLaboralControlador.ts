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
        const plantilla_cargo = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);

        console.log('plantilla_modalidad_laboral: ',plantilla_modalidad_laboral);
        console.log('plantilla_cargo: ',plantilla_cargo);

    }

    /** Registrar plantilla Modalidad_cargo **/
    public async CargarPlantilla(req: Request, res: Response){
        
    }

}

export const modalidaLaboralControlador = new ModalidaLaboralControlador();

export default modalidaLaboralControlador;