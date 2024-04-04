"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLANIFICACION_HORARIA_CONTROLADOR = void 0;
const path_1 = __importDefault(require("path"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const xlsx_1 = __importDefault(require("xlsx"));
const database_1 = __importDefault(require("../../database"));
const moment_1 = __importDefault(require("moment"));
class PlanificacionHorariaControlador {
    //METODO PARA VERIFICAR LOS DATOS DE LA PLANTILLA DE PLANIFICACION HORARIA
    VerificarDatosPlanificacionHoraria(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantillaPlanificacionHoraria = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            const plantillaPlanificacionHorariaHeaders = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { header: 1 });
            // OBTENER FECHA DE LA PLANTILLA
            const segundaColumna = plantillaPlanificacionHorariaHeaders[0][1];
            let [diaSemana, fecha] = segundaColumna.split(', ');
            let [dia, mes, ano] = fecha.split('/');
            let fechaFormateada = `${dia}/${mes}/${ano}`;
            let fechaInicial;
            let fechaFinal;
            try {
                let fechaEntrada = (0, moment_1.default)(`${fechaFormateada}`, 'DD/MM/YYYY').toDate();
                // RESTAR 1 DIA A LA FECHA DE ENTRADA
                fechaInicial = (0, moment_1.default)(fechaEntrada).subtract(1, 'days').format('YYYY-MM-DD');
                // SUMAR 1 MES A LA FECHA DE ENTRADA
                fechaFinal = (0, moment_1.default)(fechaEntrada).add(1, 'months').format('YYYY-MM-DD');
            }
            catch (error) {
                res.json({ error: 'Fecha no valida' });
                return;
            }
            // FILTRAR PLANTILLA PLANIFICACION HORARIA PARA ELIMINAR LOS REGISTROS VACIOS
            const plantillaPlanificacionHorariaFiltrada = plantillaPlanificacionHoraria.filter((data) => {
                return Object.keys(data).length > 1;
            });
            // ESTRUCTURAR PLANTILLA PLANIFICACION HORARIA
            let plantillaPlanificacionHorariaEstructurada = plantillaPlanificacionHorariaFiltrada.map((data) => {
                let nuevoObjeto = { usuario: data.USUARIO, dias: {} };
                // AGREGAR COLUMNAS DE LA PLANTILLA COMO DIAS AL HORARIO
                for (let propiedad in data) {
                    if (propiedad !== 'USUARIO') {
                        let [diaSemana, fecha] = propiedad.split(', ');
                        let [dia, mes, ano] = fecha.split('/');
                        let fechaFormateada = `${ano}-${mes}-${dia}`;
                        nuevoObjeto.dias[fechaFormateada] = { horarios: data[propiedad].split(',').map((horario) => ({ codigo: horario })) };
                    }
                }
                return nuevoObjeto;
            });
            // VERIFICAR USUARIO, HORARIOS Y SOBREPOSICION DE HORARIOS
            for (const [index, data] of plantillaPlanificacionHorariaEstructurada.entries()) {
                let { usuario } = data;
                // VERIFICAR DATO REQUERIDO USUARIO
                if (!usuario) {
                    data.observacion = 'Datos no registrados: USUARIO';
                    continue;
                }
                // VERIFICAR USUARIO DUPLICADO
                if (plantillaPlanificacionHorariaEstructurada.filter((d) => d.usuario === usuario).length > 1) {
                    data.observacion = 'Usuario duplicado';
                    continue;
                }
                // VERIFICAR EXISTENCIA DE USUARIO
                const usuarioVerificado = yield VerificarUsuario(usuario);
                if (!usuarioVerificado[0]) {
                    data.observacion = usuarioVerificado[2];
                    continue;
                }
                else {
                    console.log('usuarioVerificado', usuarioVerificado);
                    data.codigo_usuario = usuarioVerificado[1].codigo;
                    data.id_usuario = usuarioVerificado[1].id;
                }
                // VERIFICAR HORARIOS
                data.dias = yield VerificarHorarios(data.dias, fechaInicial, fechaFinal, data.id_usuario);
                // VERIFICAR SOBREPOSICION DE HORARIOS DE LA PLANTILLA
                yield VerificarSobreposicionHorarios(data.dias, data.codigo_usuario, fechaInicial, fechaFinal);
            }
            res.json({ plantillaPlanificacionHoraria: plantillaPlanificacionHorariaEstructurada });
        });
    }
    //METODO PARA CARGAR LA PLANIFICACION HORARIA
    CargarPlanificacionHoraria(formData) {
        return null;
    }
}
// FUNCION PARA VERIFICAR EXISTENCIA DE USUARIO EN LA BASE DE DATOS
function VerificarUsuario(cedula) {
    return __awaiter(this, void 0, void 0, function* () {
        let observacion = '';
        let usuarioValido = false;
        const usuario = yield database_1.default.query(`
        SELECT e.*, dae.id_cargo, ec.hora_trabaja 
        FROM empleados e 
        LEFT JOIN datos_actuales_empleado dae ON e.cedula = dae.cedula 
        LEFT JOIN empl_cargos ec ON dae.id_cargo = ec.id 
        WHERE LOWER(e.cedula) = $1
    `, [cedula.toLowerCase()]);
        if (usuario.rowCount === 0) {
            observacion = 'Usuario no valido';
        }
        else if (usuario.rows[0].id_cargo === null) {
            observacion = 'No tiene un cargo asignado';
        }
        else {
            usuarioValido = true;
        }
        return [usuarioValido, usuario.rows[0], observacion];
    });
}
function VerificarHorarios(dias, fecha_inicio, fecha_final, id_usuario) {
    return __awaiter(this, void 0, void 0, function* () {
        // CONSULTAR FERIADOS
        const feriados = yield ConsultarFeriados(fecha_inicio, fecha_final, id_usuario);
        for (const [dia, { horarios }] of Object.entries(dias)) {
            let horariosNoValidos = [];
            // VERIFICAR HORARIO DUPLICADO SI EXISTE PONER EN HORARIO OBSERVACION 'HORARIO DUPLICADO'
            const horariosDuplicados = horarios.filter((horario, index) => horarios.findIndex((h) => h.codigo === horario.codigo) !== index);
            if (horariosDuplicados.length > 0) {
                horariosDuplicados.forEach((horario) => horario.observacion = 'Horario duplicado');
                dias[dia].observacion = `Horarios duplicados: ${horariosDuplicados.map(horario => horario.codigo).join(', ')}`;
                continue;
            }
            // VERIFICAR SI LA EL DIAS[DIA] ES FERIADO
            let esFeriado = feriados ? feriados.find((feriado) => feriado.fecha === dia) : false;
            for (let i = 0; i < horarios.length; i++) {
                const horario = horarios[i];
                const horarioVerificado = yield VerificarHorario(horario.codigo);
                if (!horarioVerificado[0]) {
                    horariosNoValidos.push(horario);
                    horario.observacion = 'Horario no valido';
                    // AÑADIR OBSERVACION A HORARIO
                    dias[dia].horarios[i].observacion = 'Horario no valido';
                }
                else {
                    // ANADIR PROPIEDADES DE HORARIOVERIFICADO A DIAS[DIA].HORARIOS[I]
                    dias[dia].horarios[i].id = horarioVerificado[1].id;
                    dias[dia].horarios[i].nombre = horarioVerificado[1].nombre;
                    dias[dia].horarios[i].dia = dia;
                    dias[dia].horarios[i].hora_trabaja = horarioVerificado[1].hora_trabajo;
                    dias[dia].horarios[i].tipo = horarioVerificado[1].default_;
                    // SI ES FERIADO Y TIPO DE HORARIO ES LABORABLE AÑADIR OBSERVACION
                    if (esFeriado && dias[dia].horarios[i].tipo === 'N') {
                        dias[dia].horarios[i].observacion = `Este día no permite horarios laborables`;
                        dias[dia].horarios[i].default = 'DEFAULT_FERIADO';
                        horariosNoValidos.push(horario);
                    }
                    dias[dia].horarios[i].observacion = 'OK';
                }
            }
            dias[dia].observacion = horariosNoValidos.length > 0 ? `Horarios no validos: ${horariosNoValidos.join(', ')}` : 'OK';
        }
        return dias;
    });
}
// FUNCION PARA VERIFICAR EXISTENCIA DE HORARIO EN LA BASE DE DATOS
function VerificarHorario(codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        const horario = yield database_1.default.query('SELECT * FROM cg_horarios WHERE LOWER(codigo) = $1', [codigo.toLowerCase()]);
        // SI EXISTE HORARIO VERIFICAR SI horario.hora_trabajo este en formato hh:mm:ss
        const existe = horario.rowCount > 0;
        if (existe) {
            const formatoHora = /^\d{2}:[0-5][0-9]:[0-5][0-9]$/;
            return [formatoHora.test(horario.rows[0].hora_trabajo), horario.rows[0]];
        }
        return [existe, null];
    });
}
// FUNCION PARA VERIFICAR SOBREPOSICION DE HORARIOS
function VerificarSobreposicionHorarios(dias, codigo, fecha_inicio, fecha_final) {
    return __awaiter(this, void 0, void 0, function* () {
        let horariosModificados = [];
        let rangosSimilares = {};
        // OBTENER TODOS LOS HORARIOS DE LA PLANIFICACION HORARIA DE LA PLANTILLA QUE EN dias[dia].OBSERVACION = 'OK'
        for (const [dia, { horarios }] of Object.entries(dias)) {
            if (dias[dia].observacion === 'OK') {
                for (let i = 0; i < horarios.length; i++) {
                    const horario = horarios[i];
                    if (horario.observacion === 'OK') {
                        const detalles = yield database_1.default.query('SELECT * FROM deta_horarios WHERE id_horario = $1', [horario.id]);
                        horario.entrada = detalles.rows.find((detalle) => detalle.tipo_accion === 'E');
                        horario.salida = detalles.rows.find((detalle) => detalle.tipo_accion === 'S');
                        let fechaEntrada = (0, moment_1.default)(`${horario.dia} ${horario.entrada.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                        horario.entrada.fecha = fechaEntrada;
                        let fechaSalida = (0, moment_1.default)(`${horario.dia} ${horario.salida.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                        if (horario.salida.segundo_dia) {
                            fechaSalida = (0, moment_1.default)(fechaSalida).add(1, 'days').toDate();
                        }
                        else if (horario.salida.tercer_dia) {
                            fechaSalida = (0, moment_1.default)(fechaSalida).add(2, 'days').toDate();
                        }
                        horario.salida.fecha = fechaSalida;
                        horariosModificados.push(horario);
                    }
                }
            }
        }
        // LISTAR PLANIFICACIONES QUE TIENE REGISTRADAS EL USUARIO
        const planificacion = yield ListarPlanificacionHoraria(codigo, fecha_inicio, fecha_final);
        // SI EXISTE PLANIFICACION AÑADIR A HORARIOSMODIFICADOS
        if (planificacion) {
            for (let i = 0; i < planificacion.length; i++) {
                const horario = planificacion[i];
                const detalles = yield database_1.default.query('SELECT * FROM deta_horarios WHERE id_horario = $1', [horario.id]);
                horario.entrada = detalles.rows.find((detalle) => detalle.tipo_accion === 'E');
                horario.salida = detalles.rows.find((detalle) => detalle.tipo_accion === 'S');
                let fecha = (0, moment_1.default)(horario.fecha).format('YYYY-MM-DD');
                horario.dia = fecha;
                let fechaEntrada = (0, moment_1.default)(`${fecha} ${horario.entrada.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                horario.entrada = fechaEntrada;
                let fechaSalida = (0, moment_1.default)(`${fecha} ${horario.salida.hora}`, 'YYYY-MM-DD HH:mm:ss').toDate();
                if (horario.salida.segundo_dia) {
                    fechaSalida = (0, moment_1.default)(fechaSalida).add(1, 'days').toDate();
                }
                else if (horario.salida.tercer_dia) {
                    fechaSalida = (0, moment_1.default)(fechaSalida).add(2, 'days').toDate();
                }
                horario.salida = fechaSalida;
                horario.codigo = horario.codigo_dia;
                horariosModificados.push(horario);
            }
        }
        if (horariosModificados.length > 0) {
            // VERIFICAR SOBREPOSICIÓN DE HORARIOS
            for (let i = 0; i < horariosModificados.length; i++) {
                for (let j = i + 1; j < horariosModificados.length; j++) {
                    const horario1 = horariosModificados[i];
                    const horario2 = horariosModificados[j];
                    if ((horario2.entrada.fecha >= horario1.entrada.fecha && horario2.entrada.fecha <= horario1.salida.fecha) ||
                        (horario2.salida.fecha <= horario1.salida.fecha && horario2.salida.fecha >= horario1.entrada.fecha)) {
                        horario1.observacion = `Se sobrepone con el horario ${horario2.codigo} dia ${horario2.dia}`;
                        horario2.observacion = `Se sobrepone con el horario ${horario1.codigo} dia ${horario1.dia}`; // Existe una sobreposición
                        rangosSimilares[horario1.dia] = rangosSimilares[horario1.dias] ? [...rangosSimilares[horario1.dia], horario1.codigo, horario2.codigo] : [horario1.codigo, horario2.codigo];
                    }
                }
            }
            // ACTUALIZAR DIAS[DIA].OBSERVACION
            for (const dia in rangosSimilares) {
                dias[dia].observacion = `Rangos similares: ${[...new Set(rangosSimilares[dia])].join(', ')}`;
            }
        }
        return dias;
    });
}
// METODO PARA LISTAR LAS PLANIFICACIONES QUE TIENE REGISTRADAS EL USUARIO   --**VERIFICADO
function ListarPlanificacionHoraria(codigo, fecha_inicio, fecha_final) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const horario = yield database_1.default.query(`
            SELECT p_g.codigo AS codigo_e, fec_horario AS fecha, id_horario AS id, 
            CASE WHEN ((tipo_dia = 'L' OR tipo_dia = 'FD') AND (NOT estado_origen = 'HL' AND NOT estado_origen = 'HFD')) THEN tipo_dia ELSE horario.codigo END AS codigo_dia 
            FROM plan_general p_g 
            INNER JOIN empleados empleado ON empleado.codigo = p_g.codigo AND p_g.codigo = $3 
            INNER JOIN cg_horarios horario ON horario.id = p_g.id_horario 
            WHERE fec_horario BETWEEN $1 AND $2 
            GROUP BY codigo_e, fecha, codigo_dia, p_g.id_horario 
            ORDER BY p_g.codigo, fecha, p_g.id_horario
        `, [fecha_inicio, fecha_final, codigo]);
            if (horario.rowCount > 0) {
                return horario.rows;
            }
            else {
                return null;
            }
        }
        catch (error) {
            return null;
        }
    });
}
// FUNCION PARA CONSULTAR FERIADOS
function ConsultarFeriados(fecha_inicio, fecha_final, id_usuario) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const FERIADO = yield database_1.default.query(`
            SELECT TO_CHAR(f.fecha, 'YYYY-MM-DD') AS fecha, cf.id_ciudad, c.descripcion, s.nombre
            FROM cg_feriados AS f, ciud_feriados AS cf, ciudades AS c, sucursales AS s, datos_actuales_empleado AS de
            WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                AND s.id_ciudad = cf.id_ciudad AND de.id_sucursal = s.id AND de.id = $3
            `, [fecha_inicio, fecha_final, id_usuario]);
            if (FERIADO.rowCount > 0) {
                return FERIADO.rows;
            }
            else {
                null;
            }
        }
        catch (error) {
            return null;
        }
    });
}
exports.PLANIFICACION_HORARIA_CONTROLADOR = new PlanificacionHorariaControlador();
exports.default = exports.PLANIFICACION_HORARIA_CONTROLADOR;
