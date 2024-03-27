import { Request, Response } from "express";
import path from 'path';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import excel from 'xlsx';
import pool from '../../database';

class PlanificacionHorariaControlador {

    //METODO PARA VERIFICAR LOS DATOS DE LA PLANTILLA DE PLANIFICACION HORARIA
    public async VerificarDatosPlanificacionHoraria(req: Request, res: Response) {
        const documento = req.file?.originalname;
        const usuarios = JSON.parse(req.body.usuarios);
        console.log(usuarios);
        let separador = path.sep;
        let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
        const workbook = excel.readFile(ruta);
        const sheet_name_list = workbook.SheetNames;
        const plantillaPlanificacionHoraria: any = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
         
        const plantillaPlanificacionHorariaFiltrada = plantillaPlanificacionHoraria.filter((data: any) => {
            return Object.keys(data).length > 1;
        });

        for (const [index, data] of plantillaPlanificacionHorariaFiltrada.entries()) {
            let { USUARIO } = data;

            if (!USUARIO) {
                data.OBSERVACION = 'Datos no registrados: USUARIO';
                continue;
            }

            // VERIFICAR EXISTENCIA DE USUARIO
            if (!await VerificarUsuario(USUARIO)) {
                data.OBSERVACION = 'Usuario no registrado en la base de datos';
                continue;
            }

            // VERIFICAR USUARIO DUPLICADO
            if (plantillaPlanificacionHorariaFiltrada.filter((data: any) => data.USUARIO === USUARIO).length > 1) {
                data.OBSERVACION = 'Registro duplicado dentro de la plantilla';
                continue;
            }
        }
    
        res.json({plantillaPlanificacionHoraria: plantillaPlanificacionHorariaFiltrada});
    }

    //METODO PARA CARGAR LA PLANIFICACION HORARIA
    public CargarPlanificacionHoraria(formData: any) {
        return null;
    }

}

// FUNCION PARA VERIFICAR EXISTENCIA DE USUARIO EN LA BASE DE DATOS
async function VerificarUsuario(usuario: string): Promise<boolean>{
    const result = await pool.query('SELECT * FROM USUARIOS WHERE USUARIO = ?', [usuario]);
    return result.rowCount > 0;

}

export const PLANIFICACION_HORARIA_CONTROLADOR = new PlanificacionHorariaControlador();

export default PLANIFICACION_HORARIA_CONTROLADOR;