import { Request, Response } from "express";
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { FormatearFecha2, FormatearHora, fechaHora } from '../../libs/settingsMail';
import AUDITORIA_CONTROLADOR from "../auditoria/auditoriaControlador";
import path from 'path';
import excel from 'xlsx';
import pool from '../../database';
import moment from "moment";

class PlanificacionHorariaControlador {

    //METODO PARA VERIFICAR LOS DATOS DE LA PLANTILLA DE PLANIFICACION HORARIA
    public async VerificarDatosPlanificacionHoraria(req: Request, res: Response) {
        const documento = req.file?.originalname;

        let separador = path.sep;
        let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
        const workbook = excel.readFile(ruta);
        const sheet_name_list = workbook.SheetNames;
        const plantillaPlanificacionHoraria: any = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        const plantillaPlanificacionHorariaHeaders: any = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { header: 1 });

        // OBTENER FECHA DE LA PLANTILLA
        const segundaColumna = plantillaPlanificacionHorariaHeaders[0][1];

        let [diaSemana, fecha] = segundaColumna.split(', ');
        let [dia, mes, ano] = fecha.split('/');
        let fechaFormateada: string = `${dia}/${mes}/${ano}`;
        let fechaInicial: string;
        let fechaFinal: string;

        try {
            let fechaEntrada = moment.utc(`${fechaFormateada}`, 'DD/MM/YYYY').toDate();

            // RESTAR 1 DIA A LA FECHA DE ENTRADA
            fechaInicial = moment.utc(fechaEntrada).subtract(1, 'days').format('YYYY-MM-DD');

            // SUMAR 1 MES A LA FECHA DE ENTRADA
            fechaFinal = moment.utc(fechaEntrada).add(1, 'months').format('YYYY-MM-DD');

        } catch (error) {
            res.json({ error: 'Fecha no valida' });
            return;
        }

        // FILTRAR PLANTILLA PLANIFICACION HORARIA PARA ELIMINAR LOS REGISTROS VACIOS
        const plantillaPlanificacionHorariaFiltrada = plantillaPlanificacionHoraria.filter((data: any) => {
            return Object.keys(data).length > 1;
        });

        // ESTRUCTURAR PLANTILLA PLANIFICACION HORARIA
        let plantillaPlanificacionHorariaEstructurada = plantillaPlanificacionHorariaFiltrada.map((data: any) => {
            let nuevoObjeto: { empleado: string, dias: { [key: string]: { horarios: { valor: string, observacion?: string }[] } } } = { empleado: data.EMPLEADO, dias: {} };

            // AGREGAR COLUMNAS DE LA PLANTILLA COMO DIAS AL HORARIO
            for (let propiedad in data) {
                if (propiedad !== 'EMPLEADO') {
                    let [diaSemana, fecha] = propiedad.split(', ');
                    let [dia, mes, ano] = fecha.split('/');
                    let fechaFormateada = `${ano}-${mes}-${dia}`;
                    nuevoObjeto.dias[fechaFormateada] = { horarios: data[propiedad].split(',').map((horario: string) => ({ codigo: horario })) };
                }
            }

            return nuevoObjeto;
        });

        // VERIFICAR EMPLEADO, HORARIOS Y SOBREPOSICION DE HORARIOS
        for (const [index, data] of plantillaPlanificacionHorariaEstructurada.entries()) {
            let { empleado: empleado } = data;

            empleado = empleado.toString();

            // VERIFICAR DATO REQUERIDO EMPLEADO
            if (!empleado) {
                data.observacion = 'Datos no registrados: EMPLEADO';
                continue;
            }

            // VERIFICAR EMPLEADO DUPLICADO
            if (plantillaPlanificacionHorariaEstructurada.filter((d: any) => d.usuario === empleado).length > 1) {
                data.observacion = 'Empleado duplicado';
                continue;
            }

            // VERIFICAR EXISTENCIA DE EMPLEADO
            const empleadoVerificado = await VerificarEmpleado(empleado);

            if (!empleadoVerificado[0]) {
                data.observacion = empleadoVerificado[2];
                data.dias = {};
                continue;
            } else {
                data.codigo_empleado = empleadoVerificado[1].codigo;
                data.id_empleado = empleadoVerificado[1].id;
                data.id_empl_cargo = empleadoVerificado[1].id_cargo;
                data.nombre_usuario = `${empleadoVerificado[1].nombre} ${empleadoVerificado[1].apellido}`;
                data.hora_trabaja = ConvertirHorasAMinutos(empleadoVerificado[1].hora_trabaja);
                data.cedula_empleado = empleadoVerificado[1].cedula;
            }

            // VERIFICAR HORARIOS
            const datosVerificacionHorarios: DatosVerificacionHorarios = {
                dias: data.dias,
                fecha_inicio: fechaInicial,
                fecha_final: fechaFinal,
                id_empleado: data.id_empleado,
                hora_trabaja: data.hora_trabaja
            };

            data.dias = await VerificarHorarios(datosVerificacionHorarios);

            // VERIFICAR SOBREPOSICION DE HORARIOS DE LA PLANTILLA
            const datosVerificacionSobreposicionHorarios: DatosVerificacionSuperposicionHorarios = {
                dias: data.dias,
                id_empleado: data.id_empleado,
                fecha_inicio: fechaInicial,
                fecha_final: fechaFinal
            };

            data.dias = await VerificarSuperposicionHorarios(datosVerificacionSobreposicionHorarios);
        }


        const fechaInicioMes = moment.utc(fechaInicial).add(1, 'days').format('YYYY-MM-DD');
        const fechaFinalMes = moment.utc(fechaFinal).subtract(1, 'days').format('YYYY-MM-DD');

        res.json({ planificacionHoraria: plantillaPlanificacionHorariaEstructurada, fechaInicioMes, fechaFinalMes });
    }

    //METODO PARA REGISTRAR LA PLANIFICACION HORARIA EN LA BASE DE DATOS
    public async RegistrarPlanificacionHoraria(req: Request, res: Response): Promise<Response> {

        try {
            const { planificacionHoraria, user_name, ip } = req.body;
            const datosUsuario: DatosUsuario = { user_name, ip };

            const horarioDefaultLibre = await ConsultarHorarioDefault('DEFAULT-LIBRE');
            const horarioDefaultFeriado = await ConsultarHorarioDefault('DEFAULT-FERIADO');

            let planificacionesImportadas = 0;

            // CREAR PLANIFICACION HORARIA
            for (const data of planificacionHoraria) {
                for (const [dia, { horarios }] of Object.entries(data.dias as { [key: string]: { horarios: any[] } })) {
                    for (const horario of horarios) {

                        let planificacion: Planificacion;

                        let entrada: Plan;
                        let inicioAlimentacion: Plan | null = null;
                        let finAlimentacion: Plan | null = null;
                        let salida: Plan;

                        if (horario.observacion === 'OK') {

                            const origen = horario.tipo === 'N' ? horario.tipo : (horario.tipo === 'FD' ? 'DFD' : 'DL');

                            entrada = {
                                id_empleado: data.codigo_empleado,
                                id_empl_cargo: data.id_empl_cargo,
                                id_horario: horario.id,
                                fec_horario: horario.dia,
                                fec_hora_horario: horario.entrada.fec_hora_horario,
                                tolerancia: horario.entrada.minu_espera == null ? 0 : horario.entrada.minu_espera,
                                id_det_horario: horario.entrada.id,
                                tipo_entr_salida: 'E',
                                tipo_dia: horario.tipo,
                                salida_otro_dia: horario.entrada.segundo_dia ? 1 : (horario.entrada.tercer_dia ? 2 : 0),
                                minutos_antes: horario.entrada.minutos_antes,
                                minutos_despues: horario.entrada.minutos_despues,
                                estado_origen: origen,
                                minutos_alimentacion: horario.minutos_alimentacion
                            };


                            if (horario.inicioAlimentacion) {
                                inicioAlimentacion = {
                                    id_empleado: data.id_empleado,
                                    id_empl_cargo: data.id_empl_cargo,
                                    id_horario: horario.id,
                                    fec_horario: horario.dia,
                                    fec_hora_horario: horario.inicioAlimentacion.fec_hora_horario,
                                    tolerancia: horario.inicioAlimentacion.minu_espera == null ? 0 : horario.inicioAlimentacion.minu_espera,
                                    id_det_horario: horario.inicioAlimentacion.id,
                                    tipo_entr_salida: 'I/A',
                                    tipo_dia: horario.tipo,
                                    salida_otro_dia: horario.inicioAlimentacion.segundo_dia ? 1 : (horario.inicioAlimentacion.tercer_dia ? 2 : 0),
                                    minutos_antes: horario.inicioAlimentacion.minutos_antes,
                                    minutos_despues: horario.inicioAlimentacion.minutos_despues,
                                    estado_origen: origen,
                                    minutos_alimentacion: horario.minutos_alimentacion
                                };
                            }

                            if (horario.finAlimentacion) {
                                finAlimentacion = {
                                    id_empleado: data.id_empleado,
                                    id_empl_cargo: data.id_empl_cargo,
                                    id_horario: horario.id,
                                    fec_horario: horario.dia,
                                    fec_hora_horario: horario.finAlimentacion.fec_hora_horario,
                                    tolerancia: horario.finAlimentacion.minu_espera == null ? 0 : horario.finAlimentacion.minu_espera,
                                    id_det_horario: horario.finAlimentacion.id,
                                    tipo_entr_salida: 'F/A',
                                    tipo_dia: horario.tipo,
                                    salida_otro_dia: horario.finAlimentacion.segundo_dia ? 1 : (horario.finAlimentacion.tercer_dia ? 2 : 0),
                                    minutos_antes: horario.finAlimentacion.minutos_antes,
                                    minutos_despues: horario.finAlimentacion.minutos_despues,
                                    estado_origen: origen,
                                    minutos_alimentacion: horario.minutos_alimentacion
                                };
                            }

                            salida = {
                                id_empleado: data.id_empleado,
                                id_empl_cargo: data.id_empl_cargo,
                                id_horario: horario.id,
                                fec_horario: horario.dia,
                                fec_hora_horario: horario.salida.fec_hora_horario,
                                tolerancia: horario.salida.minu_espera == null ? 0 : horario.salida.minu_espera,
                                id_det_horario: horario.salida.id,
                                tipo_entr_salida: 'S',
                                tipo_dia: horario.tipo,
                                salida_otro_dia: horario.salida.segundo_dia ? 1 : (horario.salida.tercer_dia ? 2 : 0),
                                minutos_antes: horario.salida.minutos_antes,
                                minutos_despues: horario.salida.minutos_despues,
                                estado_origen: origen,
                                minutos_alimentacion: horario.minutos_alimentacion
                            };

                            planificacion = {
                                entrada,
                                inicioAlimentacion,
                                finAlimentacion,
                                salida
                            };

                            await CrearPlanificacionHoraria(planificacion, datosUsuario);
                            planificacionesImportadas++;

                        } else if (horario.observacion === 'DEFAULT-LIBRE') {

                            // VERIFICIAR SI YA ESTA REGISTRADO EL HORARIO DEFAULT-LIBRE PARA EL EMPLEADO EN ESA FECHA
                            const horarioRegistrado = await pool.query(`
                            SELECT * FROM eu_asistencia_general WHERE id_empleado = $1 AND fecha_horario = $2 AND id_horario = $3
                        `, [data.id_empleado, horario.dia, horarioDefaultLibre.entrada.id_horario]);

                            if (horarioRegistrado.rowCount != 0) {
                                continue;
                            }


                            const fecha_horario_entrada = `${horario.dia} ${horarioDefaultLibre.entrada.hora}`;
                            const fecha_horario_salida = `${horario.dia} ${horarioDefaultLibre.salida.hora}`;

                            entrada = {
                                id_empleado: data.id_empleado,
                                id_empl_cargo: data.id_empl_cargo,
                                id_horario: horarioDefaultLibre.entrada.id_horario,
                                fec_horario: horario.dia,
                                fec_hora_horario: fecha_horario_entrada,
                                tolerancia: horarioDefaultLibre.entrada.minu_espera == null ? 0 : horarioDefaultLibre.entrada.minu_espera,
                                id_det_horario: horarioDefaultLibre.entrada.id_det_horario,
                                tipo_entr_salida: 'E',
                                tipo_dia: horarioDefaultLibre.entrada.default_,
                                salida_otro_dia: horarioDefaultLibre.entrada.segundo_dia ? 1 : (horarioDefaultLibre.entrada.tercer_dia ? 2 : 0),
                                minutos_antes: horarioDefaultLibre.entrada.minutos_antes,
                                minutos_despues: horarioDefaultLibre.entrada.minutos_despues,
                                estado_origen: 'DL',
                                minutos_alimentacion: horarioDefaultLibre.entrada.minutos_comida
                            };


                            salida = {
                                id_empleado: data.id_empleado,
                                id_empl_cargo: data.id_empl_cargo,
                                id_horario: horarioDefaultLibre.salida.id_horario,
                                fec_horario: horario.dia,
                                fec_hora_horario: fecha_horario_salida,
                                tolerancia: horarioDefaultLibre.salida.minu_espera == null ? 0 : horarioDefaultLibre.salida.minu_espera,
                                id_det_horario: horarioDefaultLibre.salida.id_det_horario,
                                tipo_entr_salida: 'S',
                                tipo_dia: horarioDefaultLibre.salida.default_,
                                salida_otro_dia: horarioDefaultLibre.salida.segundo_dia ? 1 : (horarioDefaultLibre.salida.tercer_dia ? 2 : 0),
                                minutos_antes: horarioDefaultLibre.salida.minutos_antes,
                                minutos_despues: horarioDefaultLibre.salida.minutos_despues,
                                estado_origen: 'DL',
                                minutos_alimentacion: horarioDefaultLibre.salida.minutos_comida
                            };

                            planificacion = {
                                entrada,
                                inicioAlimentacion,
                                finAlimentacion,
                                salida
                            };

                            await CrearPlanificacionHoraria(planificacion, datosUsuario);
                            planificacionesImportadas++;

                        } else if (horario.observacion === 'DEFAULT-FERIADO') {

                            // VERIFICIAR SI YA ESTA REGISTRADO EL HORARIO DEFAULT-FERIADO PARA EL EMPLEADO EN ESA FECHA
                            const horarioRegistrado = await pool.query(`
                            SELECT * FROM eu_asistencia_general WHERE id_empleado = $1 AND fecha_horario = $2 AND id_horario = $3
                        `, [data.id_emeplado, horario.dia, horarioDefaultFeriado.entrada.id_horario]);

                            if (horarioRegistrado.rowCount != 0) {
                                continue;
                            }


                            const fecha_horario_entrada = `${horario.dia} ${horarioDefaultFeriado.entrada.hora}`;
                            const fecha_horario_salida = `${horario.dia} ${horarioDefaultFeriado.salida.hora}`;

                            entrada = {
                                id_empleado: data.id_empleado,
                                id_empl_cargo: data.id_empl_cargo,
                                id_horario: horarioDefaultFeriado.entrada.id_horario,
                                fec_horario: horario.dia,
                                fec_hora_horario: fecha_horario_entrada,
                                tolerancia: horarioDefaultFeriado.entrada.minu_espera == null ? 0 : horarioDefaultFeriado.entrada.minu_espera,
                                id_det_horario: horarioDefaultFeriado.entrada.id_det_horario,
                                tipo_entr_salida: 'E',
                                tipo_dia: horarioDefaultFeriado.entrada.default_,
                                salida_otro_dia: horarioDefaultFeriado.entrada.segundo_dia ? 1 : (horarioDefaultFeriado.entrada.tercer_dia ? 2 : 0),
                                minutos_antes: horarioDefaultFeriado.entrada.minutos_antes,
                                minutos_despues: horarioDefaultFeriado.entrada.minutos_despues,
                                estado_origen: 'DFD',
                                minutos_alimentacion: horarioDefaultFeriado.entrada.minutos_comida
                            };


                            salida = {
                                id_empleado: data.id_empleado,
                                id_empl_cargo: data.id_empl_cargo,
                                id_horario: horarioDefaultFeriado.salida.id_horario,
                                fec_horario: horario.dia,
                                fec_hora_horario: fecha_horario_salida,
                                tolerancia: horarioDefaultFeriado.salida.minu_espera == null ? 0 : horarioDefaultFeriado.salida.minu_espera,
                                id_det_horario: horarioDefaultFeriado.salida.id_det_horario,
                                tipo_entr_salida: 'S',
                                tipo_dia: horarioDefaultFeriado.salida.default_,
                                salida_otro_dia: horarioDefaultFeriado.salida.segundo_dia ? 1 : (horarioDefaultFeriado.salida.tercer_dia ? 2 : 0),
                                minutos_antes: horarioDefaultFeriado.salida.minutos_antes,
                                minutos_despues: horarioDefaultFeriado.salida.minutos_despues,
                                estado_origen: 'DFD',
                                minutos_alimentacion: horarioDefaultFeriado.salida.minutos_comida
                            };

                            planificacion = {
                                entrada,
                                inicioAlimentacion,
                                finAlimentacion,
                                salida
                            };

                            await CrearPlanificacionHoraria(planificacion, datosUsuario);
                            planificacionesImportadas++;

                        }
                    }
                }
            }

            if (planificacionesImportadas === 0) {
                return res.status(200).jsonp({ message: 'No existen datos para registrar' });
            }

            return res.status(200).jsonp({ message: 'correcto' })

        } catch (error) {
            return res.status(500).jsonp({ message: error });

        }

    }

}

// FUNCION PARA VERIFICAR EXISTENCIA DE EMPLEADO EN LA BASE DE DATOS
async function VerificarEmpleado(cedula: string): Promise<[boolean, any, string]> {
    try {
        let observacion = '';
        let empleadoValido = false;

        const empleado = await pool.query(`
            SELECT e.*, dae.id_cargo, dae.hora_trabaja 
            FROM eu_empleados e 
            LEFT JOIN informacion_general dae ON e.cedula = dae.cedula 
            WHERE LOWER(e.cedula) = $1
        `, [cedula.toLowerCase()]);

        if (empleado.rowCount === 0) {
            observacion = 'Usuario no valido';
        } else if (empleado.rows[0].id_cargo === null) {
            observacion = 'No tiene un cargo asignado';
        } else {
            empleadoValido = true;
        }

        return [empleadoValido, empleado.rows[0], observacion];
    } catch (error) {
        throw error;
    }
}

async function VerificarHorarios(datos: DatosVerificacionHorarios): Promise<any> {

    try {
        let { dias, fecha_inicio, fecha_final, id_empleado, hora_trabaja } = datos;
        // CONSULTAR FERIADOS
        const feriados = await ConsultarFeriados(fecha_inicio, fecha_final, id_empleado);

        for (const [dia, { horarios }] of Object.entries(dias as { [key: string]: { horarios: any[] } })) {
            let horariosNoValidos: string[] = [];
            let horasTotales = 0;

            // VERIFICAR HORARIO DUPLICADO SI EXISTE PONER EN HORARIO OBSERVACION 'HORARIO DUPLICADO'
            const horariosDuplicados = horarios.filter((horario, index) => horarios.findIndex((h) => h.codigo === horario.codigo) !== index);
            if (horariosDuplicados.length > 0) {
                dias[dia].observacion = `Horarios duplicados`;
                dias[dia].observacion2 = `Códigos de horarios duplicados: ${horariosDuplicados.map((horario) => horario.codigo).join(', ')}`;
                continue;
            }

            // VERIFICAR SI LA EL DIAS[DIA] ES FERIADO
            let esFeriado = feriados ? feriados.find((feriado: any) => feriado.fecha === dia) : false;

            for (let i = 0; i < horarios.length; i++) {
                const horario = horarios[i];
                horario.codigo = horario.codigo.toString();
                const horarioVerificado = await VerificarHorario(horario.codigo);

                if (!horarioVerificado[0]) {
                    horariosNoValidos.push(horario);

                    // AÑADIR OBSERVACION A HORARIO
                    dias[dia].horarios[i].observacion = `Horario no valido`;

                } else {
                    // ANADIR PROPIEDADES DE HORARIOVERIFICADO A DIAS[DIA].HORARIOS[I]
                    dias[dia].horarios[i].id = horarioVerificado[1].id;
                    dias[dia].horarios[i].nombre = horarioVerificado[1].nombre;
                    dias[dia].horarios[i].dia = dia;
                    dias[dia].horarios[i].hora_trabaja = horarioVerificado[1].hora_trabajo;
                    dias[dia].horarios[i].tipo = horarioVerificado[1].default_;
                    dias[dia].horarios[i].minutos_alimentacion = horarioVerificado[1].minutos_comida;


                    // SI ES FERIADO Y TIPO DE HORARIO ES LABORABLE AÑADIR OBSERVACION
                    if (esFeriado && dias[dia].horarios[i].tipo === 'N') {
                        dias[dia].horarios[i].observacion = `Horario no valido para día feriado`;
                        dias[dia].observacion3 = `Este día no permite horarios laborables`;
                        dias[dia].horarios[i].default = 'DEFAULT-FERIADO';
                        horariosNoValidos.push(horario);
                    } else {
                        dias[dia].horarios[i].observacion = 'OK';
                        horasTotales += ConvertirHorasAMinutos(horarioVerificado[1].hora_trabajo);
                    }

                }
            }

            dias[dia].observacion = horariosNoValidos.length > 0 ? `Horarios no validos` : 'OK';

            // VERIFICAR HORAS TOTALES DE HORARIOS
            if (horasTotales > hora_trabaja) {
                const horas = ConvertirMinutosAHoras(horasTotales);
                dias[dia].observacion4 = `Jornada superada: ${horas} tiempo total`;
            }

        }
        return dias;
    } catch (error) {
        throw error;
    }
}

// FUNCION PARA VERIFICAR EXISTENCIA DE HORARIO EN LA BASE DE DATOS
async function VerificarHorario(codigo: any): Promise<[boolean, any]> {
    try {
        const horario = await pool.query('SELECT * FROM eh_cat_horarios WHERE LOWER(codigo) = $1',
            [codigo.toLowerCase()]);

        // SI EXISTE HORARIO VERIFICAR SI HORARIO.HORA_TRABAJO ESTE EN FORMATO HH:MM:SS
        const existe = horario.rowCount != 0;

        if (existe) {
            const formatoHora = /^\d{2}:[0-5][0-9]:[0-5][0-9]$/;
            return [formatoHora.test(horario.rows[0].hora_trabajo), horario.rows[0]];
        }

        return [existe, null];
    } catch (error) {
        throw error;
    }
}

// FUNCION PARA VERIFICAR SOBREPOSICION DE HORARIOS
async function VerificarSuperposicionHorarios(datos: DatosVerificacionSuperposicionHorarios): Promise<any> {

    try {
        let { dias, id_empleado, fecha_inicio, fecha_final } = datos;

        let horariosModificados: any[] = [];
        let horariosPlanificacion: any[] = [];
        let rangosSimilares: any = {};

        // OBTENER TODOS LOS HORARIOS DE LA PLANIFICACION HORARIA DE LA PLANTILLA QUE EN dias[dia].OBSERVACION = 'OK'
        for (const [dia, { horarios }] of Object.entries(dias as { [key: string]: { horarios: any[] } })) {
            if (dias[dia].observacion === 'OK') {
                for (let i = 0; i < horarios.length; i++) {
                    const horario = horarios[i];
                    if (horario.observacion === 'OK') {
                        const detalles = await pool.query('SELECT * FROM eh_detalle_horarios WHERE id_horario = $1', [horario.id]);
                        horario.entrada = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'E');
                        horario.salida = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'S');

                        horario.inicioAlimentacion = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'I/A');
                        horario.finAlimentacion = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'F/A');


                        let fechaEntrada = moment.utc(`${horario.dia} ${horario.entrada.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                        horario.entrada.fecha = fechaEntrada;
                        horario.entrada.fec_hora_horario = `${horario.dia} ${horario.entrada.hora}`;

                        let fechaSalida = moment.utc(`${horario.dia} ${horario.salida.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                        if (horario.salida.segundo_dia) {
                            fechaSalida = moment.utc(fechaSalida).add(1, 'days').toDate();
                        } else if (horario.salida.tercer_dia) {
                            fechaSalida = moment.utc(fechaSalida).add(2, 'days').toDate();
                        }
                        horario.salida.fecha = fechaSalida;
                        horario.salida.fec_hora_horario = `${horario.dia} ${horario.salida.hora}`;

                        if (horario.inicioAlimentacion) {
                            horario.inicioAlimentacion.fec_hora_horario = `${horario.dia} ${horario.inicioAlimentacion.hora}`;
                        }

                        if (horario.finAlimentacion) {
                            horario.finAlimentacion.fec_hora_horario = `${horario.dia} ${horario.finAlimentacion.hora}`;
                        }

                        horariosModificados.push(horario);
                    }
                }
            }
        }

        // LISTAR PLANIFICACIONES QUE TIENE REGISTRADAS EL EMPLEADO
        const planificacion = await ListarPlanificacionHoraria(id_empleado, fecha_inicio, fecha_final);

        // SI EXISTE PLANIFICACION AÑADIR A HORARIOSMODIFICADOS
        if (planificacion) {
            for (let i = 0; i < planificacion.length; i++) {
                const horario = planificacion[i];

                const detalles = await pool.query('SELECT * FROM eh_detalle_horarios WHERE id_horario = $1', [horario.id]);

                horario.entrada = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'E');
                horario.salida = detalles.rows.find((detalle: any) => detalle.tipo_accion === 'S');

                let fecha = moment.utc(horario.fecha).format('YYYY-MM-DD');
                horario.dia = fecha;

                let fechaEntrada = moment.utc(`${fecha} ${horario.entrada.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                horario.entrada.fecha = fechaEntrada;

                let fechaSalida = moment.utc(`${fecha} ${horario.salida.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                if (horario.salida.segundo_dia) {
                    fechaSalida = moment.utc(fechaSalida).add(1, 'days').toDate();
                } else if (horario.salida.tercer_dia) {
                    fechaSalida = moment.utc(fechaSalida).add(2, 'days').toDate();
                }
                horario.salida.fecha = fechaSalida;

                horario.codigo = horario.codigo_dia;

                horariosPlanificacion.push(horario);
            }
        }

        if (horariosModificados.length > 0) {
            // VERIFICAR SOBREPOSICIÓN DE HORARIOS
            for (let i = 0; i < horariosModificados.length; i++) {
                const horario1 = horariosModificados[i];

                // VERIFICAR SOBREPOSICIÓN ENTRE HORARIOSMODIFICADOS
                for (let j = i + 1; j < horariosModificados.length; j++) {
                    const horario2 = horariosModificados[j];
                    if (SeSuperponen(horario1, horario2)) {
                        ActualizarObservacionesYRangosSimilares(horario1, horario2, rangosSimilares, true);
                    }
                }

                // VERIFICAR SOBREPOSICIÓN CON HORARIOSPLANIFICACION
                for (let j = 0; j < horariosPlanificacion.length; j++) {
                    const horario2 = horariosPlanificacion[j];
                    if (SeSuperponen(horario1, horario2)) {
                        ActualizarObservacionesYRangosSimilares(horario1, horario2, rangosSimilares, false);
                    }
                }
            }

            // ACTUALIZAR DIAS[DIA].OBSERVACION
            for (const dia in rangosSimilares) {
                dias[dia].observacion = `Rangos similares`;
            }
        }

        return dias;
    } catch (error) {
        throw error;
    }
}

// FUNCIÓN PARA VERIFICAR SI DOS HORARIOS SE SOBREPONEN
function SeSuperponen(horario1: any, horario2: any) {
    return (horario2.entrada.fecha >= horario1.entrada.fecha && horario2.entrada.fecha <= horario1.salida.fecha) ||
        (horario2.salida.fecha <= horario1.salida.fecha && horario2.salida.fecha >= horario1.entrada.fecha) ||
        (horario1.entrada.fecha >= horario2.entrada.fecha && horario1.entrada.fecha <= horario2.salida.fecha) ||
        (horario1.salida.fecha <= horario2.salida.fecha && horario1.salida.fecha >= horario2.entrada.fecha);
}

// FUNCIÓN PARA ACTUALIZAR OBSERVACIONES Y RANGOS SIMILARES
function ActualizarObservacionesYRangosSimilares(horario1: any, horario2: any, rangosSimilares: any, horariosModificados: boolean) {
    if (horario1.dia === horario2.dia && horario1.codigo === horario2.codigo) {
        horario1.observacion = `Ya existe planificación`;
    } else {
        horario1.observacion = `Se superpone con el horario ${horario2.codigo} del dia ${horario1.dia}`;
    }
    rangosSimilares[horario1.dia] = rangosSimilares[horario1.dias] ? [...rangosSimilares[horario1.dia], horario1.codigo, horario2.codigo] : [horario1.codigo, horario2.codigo];
    if (horariosModificados) {
        horario2.observacion = `Se superpone con el horario ${horario1.codigo} del dia ${horario1.dia}`;
        rangosSimilares[horario2.dia] = rangosSimilares[horario2.dias] ? [...rangosSimilares[horario2.dia], horario1.codigo, horario2.codigo] : [horario1.codigo, horario2.codigo];
    }

}


// METODO PARA LISTAR LAS PLANIFICACIONES QUE TIENE REGISTRADAS EL EMPLEADO   --**VERIFICADO
async function ListarPlanificacionHoraria(id_empleado: number, fecha_inicio: string, fecha_final: string): Promise<any> {

    try {

        const horario = await pool.query(`
            SELECT p_g.id_empleado AS id_e, fecha_horario AS fecha, id_horario AS id, 
            horario.codigo AS codigo_dia 
            FROM eu_asistencia_general p_g 
            INNER JOIN eu_empleados empleado ON empleado.id = p_g.id_empleado AND p_g.id_empleado = $3 
            INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario 
            WHERE fecha_horario BETWEEN $1 AND $2 
            GROUP BY id_e, fecha, codigo_dia, p_g.id_horario 
            ORDER BY p_g.id_empleado, fecha, p_g.id_horario
        `, [fecha_inicio, fecha_final, id_empleado]);

        if (horario.rowCount != 0) {
            return horario.rows;
        }
        else {
            return null;
        }
    }
    catch (error) {
        throw error;
    }
}

// FUNCION PARA CONSULTAR FERIADOS
async function ConsultarFeriados(fecha_inicio: string, fecha_final: string, id_usuario: number): Promise<any> {
    try {

        const FERIADO = await pool.query(
            `
            SELECT TO_CHAR(f.fecha, 'YYYY-MM-DD') AS fecha, cf.id_ciudad, c.descripcion, s.nombre
            FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s, 
                informacion_general AS de
            WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                AND s.id_ciudad = cf.id_ciudad AND de.id_sucursal = s.id AND de.id = $3
            `
            , [fecha_inicio, fecha_final, id_usuario]);

        if (FERIADO.rowCount != 0) {
            return FERIADO.rows;
        }
        else {
            null
        }
    }
    catch (error) {
        throw error;
    }
}

// FUNCION PARA CONSULTAR HORARIOS DEFAULT Y SUS DETALLES
async function ConsultarHorarioDefault(codigo: string): Promise<any> {
    try {
        const horario: any = await pool.query(
        `
        SELECT h.id AS id_horario, h.nombre, h.hora_trabajo, h.default_, h.minutos_comida, d.id AS id_det_horario, d.*
        FROM eh_cat_horarios AS h
        INNER JOIN eh_detalle_horarios AS d ON h.id = d.id_horario
        WHERE h.codigo = $1
        `, [codigo]
        );

        if (horario.rowCount != 0) {
            //SEPARAR LOS TIPOS DE ACCIONES DE LOS HORARIOS
            let horarioEstructurado: any;
            const entrada = horario.rows.find((o: any) => o.tipo_accion === 'E');
            const salida = horario.rows.find((o: any) => o.tipo_accion === 'S');

            horarioEstructurado = {
                entrada: { ...entrada },
                salida: { ...salida }
            };

            return horarioEstructurado;

        }
        else {
            return null;
        }

    } catch (error) {
        throw error;
    }
}

// FUNCION PARA CREAR PLANIFICACION HORARIA
async function CrearPlanificacionHoraria(planificacionHoraria: Planificacion, datosUsuario: DatosUsuario): Promise<any> {
    try {

        // DESESCTRUCTURAR PLANIFICACION HORARIA
        let {
            entrada,
            inicioAlimentacion,
            finAlimentacion,
            salida
        } = planificacionHoraria;

        // DESESTRUCTURAR DATOS EMPLEADO
        let { user_name, ip } = datosUsuario;

        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        // CREAR ENTRADA
        const registroEntrada = await pool.query(
            `
            INSERT INTO eu_asistencia_general (id_empleado, id_empleado_cargo, id_horario, fecha_horario, fecha_hora_horario, 
                tolerancia, id_detalle_horario, tipo_accion, tipo_dia, salida_otro_dia, minutos_antes, minutos_despues, 
                estado_origen, minutos_alimentacion)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
            `, [entrada.id_empleado, entrada.id_empl_cargo, entrada.id_horario, entrada.fec_horario, entrada.fec_hora_horario, entrada.tolerancia,
        entrada.id_det_horario, entrada.tipo_entr_salida, entrada.tipo_dia, entrada.salida_otro_dia, entrada.minutos_antes, entrada.minutos_despues,
        entrada.estado_origen, entrada.minutos_alimentacion]
        );

        const [datosNuevosEntrada] = registroEntrada.rows;

        const horaEntrada = await FormatearHora(entrada.fec_hora_horario.split(' ')[1]);
        const fechaEntrada = await FormatearFecha2(entrada.fec_hora_horario, 'ddd');
        const fechaHoraEntrada = `${fechaEntrada} ${horaEntrada}`;

        const fechaHorarioEntrada = await FormatearFecha2(entrada.fec_horario, 'ddd');        

        datosNuevosEntrada.fecha_hora_horario = fechaHoraEntrada;
        datosNuevosEntrada.fecha_horario = fechaHorarioEntrada;

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_asistencia_general',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: JSON.stringify(datosNuevosEntrada),
            ip,
            observacion: null
        });

        // CREAR INICIO ALIMENTACION
        if (inicioAlimentacion) {
            const registroInicioAlimentacion = await pool.query(
                `
                INSERT INTO eu_asistencia_general (id_empleado, id_empleado_cargo, id_horario, fecha_horario, fecha_hora_horario, 
                    tolerancia, id_detalle_horario, tipo_accion, tipo_dia, salida_otro_dia, minutos_antes, minutos_despues, 
                    estado_origen, minutos_alimentacion)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
                `, [inicioAlimentacion.id_empleado, inicioAlimentacion.id_empl_cargo, inicioAlimentacion.id_horario, inicioAlimentacion.fec_horario, inicioAlimentacion.fec_hora_horario, inicioAlimentacion.tolerancia,
            inicioAlimentacion.id_det_horario, inicioAlimentacion.tipo_entr_salida, inicioAlimentacion.tipo_dia, inicioAlimentacion.salida_otro_dia, inicioAlimentacion.minutos_antes, inicioAlimentacion.minutos_despues,
            inicioAlimentacion.estado_origen, inicioAlimentacion.minutos_alimentacion]
            );

            const [datosNuevosInicioAlimentacion] = registroInicioAlimentacion.rows;

            const horaInicioAlimentacion = await FormatearHora(inicioAlimentacion.fec_hora_horario.split(' ')[1]);
            const fechaInicioAlimentacion = await FormatearFecha2(inicioAlimentacion.fec_hora_horario, 'ddd');
            const fechaHoraInicioAlimentacion = `${fechaInicioAlimentacion} ${horaInicioAlimentacion}`;

            const fechaHorarioInicioAlimentacion = await FormatearFecha2(inicioAlimentacion.fec_horario, 'ddd');

            datosNuevosInicioAlimentacion.fecha_hora_horario = fechaHoraInicioAlimentacion;
            datosNuevosInicioAlimentacion.fecha_horario = fechaHorarioInicioAlimentacion;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_asistencia_general',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(datosNuevosInicioAlimentacion),
                ip,
                observacion: null
            });
        }

        // CREAR FIN ALIMENTACION
        if (finAlimentacion) {
            const registroFinAlimentacion = await pool.query(
                `
                INSERT INTO eu_asistencia_general (id_empleado, id_empleado_cargo, id_horario, fecha_horario, fecha_hora_horario, 
                    tolerancia, id_detalle_horario, tipo_accion, tipo_dia, salida_otro_dia, minutos_antes, minutos_despues, 
                    estado_origen, minutos_alimentacion)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
                `, [finAlimentacion.id_empleado, finAlimentacion.id_empl_cargo, finAlimentacion.id_horario, finAlimentacion.fec_horario, finAlimentacion.fec_hora_horario, finAlimentacion.tolerancia,
            finAlimentacion.id_det_horario, finAlimentacion.tipo_entr_salida, finAlimentacion.tipo_dia, finAlimentacion.salida_otro_dia, finAlimentacion.minutos_antes, finAlimentacion.minutos_despues,
            finAlimentacion.estado_origen, finAlimentacion.minutos_alimentacion]
            );

            const [datosNuevosFinAlimentacion] = registroFinAlimentacion.rows;

            const horaFinAlimentacion = await FormatearHora(finAlimentacion.fec_hora_horario.split(' ')[1]);
            const fechaFinAlimentacion = await FormatearFecha2(finAlimentacion.fec_hora_horario, 'ddd');
            const fechaHoraFinAlimentacion = `${fechaFinAlimentacion} ${horaFinAlimentacion}`;

            const fechaHorarioFinAlimentacion = await FormatearFecha2(finAlimentacion.fec_horario, 'ddd');

            datosNuevosFinAlimentacion.fecha_hora_horario = fechaHoraFinAlimentacion;
            datosNuevosFinAlimentacion.fecha_horario = fechaHorarioFinAlimentacion;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'eu_asistencia_general',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(datosNuevosFinAlimentacion),
                ip,
                observacion: null
            });
        }

        // CREAR SALIDA
        const registroSalida = await pool.query(
            `
            INSERT INTO eu_asistencia_general (id_empleado, id_empleado_cargo, id_horario, fecha_horario, fecha_hora_horario, 
                tolerancia, id_detalle_horario, tipo_accion, tipo_dia, salida_otro_dia, minutos_antes, minutos_despues, 
                estado_origen, minutos_alimentacion)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
            `, [salida.id_empleado, salida.id_empl_cargo, salida.id_horario, salida.fec_horario, salida.fec_hora_horario, salida.tolerancia,
        salida.id_det_horario, salida.tipo_entr_salida, salida.tipo_dia, salida.salida_otro_dia, salida.minutos_antes, salida.minutos_despues,
        salida.estado_origen, salida.minutos_alimentacion]
        );

        const [datosNuevosSalida] = registroSalida.rows;

        const horaSalida = await FormatearHora(salida.fec_hora_horario.split(' ')[1]);
        const fechaSalida = await FormatearFecha2(salida.fec_hora_horario, 'ddd');
        const fechaHoraSalida = `${fechaSalida} ${horaSalida}`;

        const fechaHorarioSalida = await FormatearFecha2(salida.fec_horario, 'ddd');

        datosNuevosSalida.fecha_hora_horario = fechaHoraSalida;
        datosNuevosSalida.fecha_horario = fechaHorarioSalida;

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_asistencia_general',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: JSON.stringify(datosNuevosSalida),
            ip,
            observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
}

function ConvertirHorasAMinutos(hora: string): number {
    const partes = hora.split(':');
    const horas = parseInt(partes[0], 10);
    const minutos = parseInt(partes[1], 10);
    return horas * 60 + minutos;
}

function ConvertirMinutosAHoras(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas}:${minutosRestantes < 10 ? '0' + minutosRestantes : minutosRestantes}:00`;
}

interface DatosVerificacionHorarios {
    dias: any,
    fecha_inicio: string,
    fecha_final: string,
    id_empleado: number,
    hora_trabaja: number
}

interface DatosVerificacionSuperposicionHorarios {
    dias: any,
    id_empleado: number,
    fecha_inicio: string,
    fecha_final: string
}

interface Plan {
    id_empleado: number,
    id_empl_cargo: number,
    id_horario: number,
    fec_horario: string,
    fec_hora_horario: string,
    tolerancia: number,
    id_det_horario: number,
    tipo_entr_salida: string,
    tipo_dia: string,
    salida_otro_dia: number,
    minutos_antes: number,
    minutos_despues: number,
    estado_origen: string,
    minutos_alimentacion: number
}

interface Planificacion {
    entrada: Plan,
    inicioAlimentacion: Plan | null,
    finAlimentacion: Plan | null,
    salida: Plan
}

interface DatosUsuario {
    user_name: string,
    ip: string,
}

export const PLANIFICACION_HORARIA_CONTROLADOR = new PlanificacionHorariaControlador();

export default PLANIFICACION_HORARIA_CONTROLADOR;