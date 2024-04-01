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
            let nuevoObjeto: { USUARIO: string, DIAS: { [key: string]: { HORARIOS: { valor: string, OBSERVACION?: string }[] } } } = { USUARIO: data.USUARIO, DIAS: {} };
        
            for (let propiedad in data) {
                if (propiedad !== 'USUARIO') {
                    nuevoObjeto.DIAS[propiedad] = { HORARIOS: data[propiedad].split(',').map((horario: string) => ({ CODIGO: horario })) };
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
            data.DIAS = await VerificarHorarios(data.DIAS);
            
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

async function VerificarHorarios(dias: any) {
    console.log("DIAS",dias);
    for (const [dia, { HORARIOS }] of Object.entries(dias as { [key: string]: { HORARIOS: any[] } })) {
        let horariosValidos: any[] = [];
        let horariosNoValidos: string[] = [];
        console.log("HORARIOS",HORARIOS);
        for (let i = 0; i < HORARIOS.length; i++) {
            const HORARIO = HORARIOS[i];
            const horarioVerificado = await VerificarHorario(HORARIO.CODIGO); 
            if (!horarioVerificado[0]) {
                horariosNoValidos.push(HORARIO);
                HORARIO.OBSERVACION = 'Horario no valido';
        
                // AÑADIR OBSERVACION A HORARIO
                dias[dia].HORARIOS[i].OBSERVACION = 'Horario no valido';
                
            } else {
                dias[dia].HORARIOS[i].OBSERVACION = 'OK';
                horariosValidos.push(horarioVerificado[1]);
            }
        }
        dias[dia].OBSERVACION = horariosNoValidos.length > 0 ? `Horarios no validos: ${horariosNoValidos.join(', ')}` : 'OK';

        if (horariosValidos.length > 0) {
            dias[dia].OBSERVACION = await VerificarSobreposicionHorariosPlantilla(horariosValidos) ? 'Rango de horario similares' : 'OK';
        }
    }
    return dias;
}

// FUNCION PARA VERIFICAR EXISTENCIA DE HORARIO EN LA BASE DE DATOS
async function VerificarHorario(CODIGO: any): Promise<[boolean,any]>{
    const horario = await pool.query('SELECT * FROM cg_horarios WHERE LOWER(codigo) = $1',
     [CODIGO.toLowerCase()]);

    // SI EXISTE HORARIO VERIFICAR SI horario.hora_trabajo este en formato hh:mm:ss
    const existe = horario.rowCount > 0;

    if(existe){
        const formatoHora = /^\d{2}:[0-5][0-9]:[0-5][0-9]$/;
        return [formatoHora.test(horario.rows[0].hora_trabajo), horario.rows[0]];
    }
    
    return [existe, null];
}

async function VerificarSobreposicionHorariosPlantilla(horarios: any): Promise<boolean>{
    const detallesHorarios = await pool.query(`SELECT * FROM deta_horarios WHERE id_horario IN (${horarios.map((horario: any) => horario.id).join(',')})`);
    // AÑADIR A LOS HORARIOS LOS DETALLES DE HORARIOS
    horarios.forEach((horario: any) => {
        horario.detalles = detallesHorarios.rows.filter((detalle: any) => detalle.id_horario === horario.id);
        horario.entrada = horario.detalles.find((detalle: any) => detalle.tipo_accion === 'E');
        horario.salida = horario.detalles.find((detalle: any) => detalle.tipo_accion === 'S');
    
        // Convertir las horas a minutos desde la medianoche
        horario.entrada.minutos = ConvertirHoraAMinutos(horario.entrada.hora);
        horario.salida.minutos = ConvertirHoraAMinutos(horario.salida.hora);
    });
    
    console.log("horarios",horarios);
    
    // VERIFICAR SOBREPOSICIÓN DE HORARIOS
    for (let i = 0; i < horarios.length; i++) {
        for (let j = i + 1; j < horarios.length; j++) {
            const horario1 = horarios[i];
            const horario2 = horarios[j];
    
            // Si la salida del horario1 es al día siguiente, consideramos que la salida es mayor que la entrada
            // const salida1 = horario1.salida.segundo_dia ? horario1.salida.minutos + 24 * 60 : horario1.salida.minutos;
            // const salida2 = horario2.salida.segundo_dia ? horario2.salida.minutos + 24 * 60 : horario2.salida.minutos;

            // verificar salida al tercer y segundo dia
            const salida1 = horario1.salida.tercer_dia ? horario1.salida.minutos + 48 * 60 : (horario1.salida.segundo_dia ? horario1.salida.minutos + 24 * 60 : horario1.salida.minutos);
            const salida2 = horario2.salida.tercer_dia ? horario2.salida.minutos + 48 * 60 : (horario2.salida.segundo_dia ? horario2.salida.minutos + 24 * 60 : horario2.salida.minutos);
    
            // Verificar si los horarios se Sobreponen
            if ((horario2.entrada.minutos >= horario1.entrada.minutos && horario2.entrada.minutos <= salida1)  ||
                (salida2 <= salida1 && salida2 >= horario1.entrada.minutos)
                ) {
                return true; // Existe una sobreposición
            }
        }
    }
    
    return false; // No existe ninguna sobreposición
}

// Función para convertir una hora en formato "hh:mm:ss" a minutos desde la medianoche
function ConvertirHoraAMinutos(hora: string): number {
    const partes = hora.split(':');
    const horas = parseInt(partes[0]);
    const minutos = parseInt(partes[1]);
    return horas * 60 + minutos;
}

export const PLANIFICACION_HORARIA_CONTROLADOR = new PlanificacionHorariaControlador();

export default PLANIFICACION_HORARIA_CONTROLADOR;