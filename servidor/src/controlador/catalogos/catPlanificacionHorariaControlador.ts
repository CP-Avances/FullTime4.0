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

        console.log(plantillaPlanificacionHorariaFiltrada);
        let plantillaPlanificacionHorariaEstructurada = plantillaPlanificacionHorariaFiltrada.map((data: any) => {
            let nuevoObjeto: { USUARIO: string, DIAS: { [key: string]: { HORARIOS: string[] } } } = { USUARIO: data.USUARIO, DIAS: {} };
        
            for (let propiedad in data) {
                if (propiedad !== 'USUARIO') {
                    nuevoObjeto.DIAS[propiedad] = { HORARIOS: data[propiedad].split(',') };
                }
            }
        
            return nuevoObjeto;
        });
        

        for (const [index, data] of plantillaPlanificacionHorariaEstructurada.entries() ) {
            let { USUARIO } = data;

            if (!USUARIO) {
                data.OBSERVACION = 'Datos no registrados: USUARIO';
                continue;
            }

            // VERIFICAR USUARIO DUPLICADO
            if (plantillaPlanificacionHorariaFiltrada.filter((data: any) => data.USUARIO === USUARIO).length > 1) {
                data.OBSERVACION = 'Registro duplicado dentro de la plantilla';
                continue;
            }

            // VERIFICAR EXISTENCIA DE USUARIO
            if (!VerificarUsuario(USUARIO, usuarios)) {
                data.OBSERVACION = 'Usuario no valido';
                continue;
            }

            // VERIFICAR HORARIOS
            for (const [dia, { HORARIOS }] of Object.entries(data.DIAS as { [key: string]: { HORARIOS: string[] } })) {
                let horariosNoValidos: string[] = [];
                for (const HORARIO of HORARIOS) {
                    if (!await VerificarHorario(HORARIO)) {
                        horariosNoValidos.push(HORARIO);
                        data.DIAS.HORARIOS[HORARIO].OBSERVACION = 'Horario no valido';
                    } else {
                        data.DIAS.HORARIOS[HORARIO].OBSERVACION = 'OK';
                    }
                }
                data.DIAS[dia].OBSERVACION = horariosNoValidos.length > 0 ? `Horarios no validos: ${horariosNoValidos.join(', ')}` : 'OK';
            }
        }

    
        res.json({plantillaPlanificacionHoraria: plantillaPlanificacionHorariaEstructurada});
    }

    //METODO PARA CARGAR LA PLANIFICACION HORARIA
    public CargarPlanificacionHoraria(formData: any) {
        return null;
    }

}

// FUNCION PARA VERIFICAR EXISTENCIA DE USUARIO EN LA LISTA DE USUARIOS
function VerificarUsuario(cedula: string, usuarios: any): boolean{
 let usuarioEncontrado = usuarios.find((usuario: any) => usuario.cedula === cedula);

 return usuarioEncontrado && usuarioEncontrado.id_cargo ? true : false;
}

// FUNCION PARA VERIFICAR EXISTENCIA DE HORARIO EN LA BASE DE DATOS
async function VerificarHorario(codigo: any): Promise<boolean>{
    // SELECT * FROM cg_horarios ORDER BY codigo ASC
    const horario = await pool.query('SELECT hora_trabajo FROM cg_horarios WHERE LOWER(codigo) = $1',
     [codigo.toLowerCase()]);

    // SI EXISTE HORARIO VERIFICAR SI horario.hora_trabajo este en formato hh:mm:ss
    const existe = horario.rowCount > 0;

    if(existe){
        const formatoHora = /^\d{2}:[0-5][0-9]:[0-5][0-9]$/;
        return formatoHora.test(horario.rows[0].hora_trabajo);
    }
    
    return existe;
}

export const PLANIFICACION_HORARIA_CONTROLADOR = new PlanificacionHorariaControlador();

export default PLANIFICACION_HORARIA_CONTROLADOR;