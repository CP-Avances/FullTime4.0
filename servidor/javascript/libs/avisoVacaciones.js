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
exports.beforeTwoDays = exports.beforeFiveDays = exports.Peri_Vacacion_Automatico = void 0;
const database_1 = __importDefault(require("../database"));
const settingsMail_1 = require("./settingsMail");
const HORA_ENVIO_VACACION_AUTOMATICO = 23;
const HORA_ENVIO_AVISO_CINCO_DIAS = 0;
const HORA_ENVIO_AVISO_DOS_DIAS = 1;
function sumaDias(fecha, dias) {
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
}
function sumaYear(fecha, anio) {
    fecha.setFullYear(fecha.getFullYear() + anio);
    return fecha;
}
function DescripcionPeriodo() {
    var f = new Date();
    let peri = 'Periodo ' + f.getFullYear() + ' - ' + (f.getFullYear() + 1);
    return peri;
}
function RegimenEmpleado(idRegimen) {
    return __awaiter(this, void 0, void 0, function* () {
        let consulta = yield database_1.default.query('SELECT * FROM cg_regimenes WHERE id = $1', [idRegimen]);
        return consulta.rows[0];
    });
}
// funcion para calcular cuantos años lleva esa persona trabajando en la empresa
function AniosEmpleado(idEmpleado) {
    return __awaiter(this, void 0, void 0, function* () {
        var f = new Date();
        f.setUTCHours(f.getHours());
        let anioHoy = f.toJSON().split("-")[0];
        let anioInicio = yield database_1.default.query(`SELECT pv.fec_inicio FROM empl_contratos co, peri_vacaciones pv 
    WHERE co.id_empleado = $1 AND pv.id_empl_contrato = co.id ORDER BY pv.fec_inicio ASC limit 1`, [idEmpleado]).then((result) => {
            return JSON.stringify(result.rows[0].fec_inicio);
        });
        let anioPresente = yield database_1.default.query(`SELECT pv.fec_final FROM empl_contratos co, peri_vacaciones pv 
        WHERE co.id_empleado = $1 AND pv.id_empl_contrato = co.id AND 
        CAST(pv.fec_final AS VARCHAR) like $2 || \'%\'`, [idEmpleado, anioHoy]).then((result) => {
            return JSON.stringify(result.rows[0].fec_final);
        });
        const total = parseInt(anioPresente.slice(1, 5)) - parseInt(anioInicio.slice(1, 5));
        return total;
    });
}
function ObtenerIdEmpleado(idContrato) {
    return __awaiter(this, void 0, void 0, function* () {
        let id_empleado = yield database_1.default.query('SELECT e.id FROM empl_contratos co, empleados e WHERE co.id = $1 AND co.id_empleado = e.id AND e.estado = 1 LIMIT 1', [idContrato])
            .then((result) => __awaiter(this, void 0, void 0, function* () {
            let id = yield result.rows.map((obj) => { return obj.id; });
            return id[0];
        }));
        return id_empleado;
    });
}
// CREA los nuevos peridodos automaticamente modelando los datos necesarios
function CrearNuevoPeriodo(Obj, descripcion, dia, anio) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(Obj);
        var id_empleado = yield ObtenerIdEmpleado(Obj.id_empl_contrato);
        // console.log('id_empleado ===>', id_empleado);
        var regimen = yield RegimenEmpleado(Obj.id_regimen);
        // console.log('DataRegimen ===>', regimen);
        var year = yield AniosEmpleado(id_empleado);
        // console.log('Calculos años ===>', year);
        var antiguedad = 0;
        if (year >= regimen.anio_antiguedad) {
            antiguedad = regimen.dia_incr_antiguedad;
        }
        // console.log(nuevo);
        yield database_1.default.query('INSERT INTO peri_vacaciones(id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )', [Obj.id_empl_contrato, descripcion, regimen.dia_anio_vacacion, antiguedad, 1, dia, anio, Obj.dia_perdido, Obj.horas_vacaciones, Obj.min_vacaciones])
            .then(() => {
            console.log('Registros insertados');
        }).catch((err) => {
            console.log('Error al insertar registro ===>', err);
        });
    });
}
function PeriVacacionHoy(fechaHoy) {
    return __awaiter(this, void 0, void 0, function* () {
        // consulta para q devuelva los periodos de vacaciones q finalizan el dia de hoy ******* y si esta o no activo el empleado ===> Activo = 1; Inactivo = 2;
        // let expira_peri_hoy = await pool.query('select pv.id, pv.id_empl_contrato, pv.dia_vacacion, pv.dia_antiguedad, pv.fec_inicio, pv.fec_final, pv.dia_perdido, pv.horas_vacaciones, pv.min_vacaciones, co.id_regimen from peri_vacaciones pv, empl_contratos co, empleados e where CAST(pv.fec_final AS VARCHAR) like $1 || \'%\' AND pv.estado = 1 AND co.id = pv.id_empl_contrato AND co.id_empleado = e.id AND e.estado = 1', [fechaHoy]);    
        let expira_peri_hoy = yield database_1.default.query(`SELECT pv.id, pv.id_empl_contrato, pv.dia_vacacion, pv.dia_antiguedad, pv.fec_final, pv.dia_perdido, 
    pv.horas_vacaciones, pv.min_vacaciones, co.id_regimen 
    FROM peri_vacaciones pv, empl_contratos co, empleados e 
    WHERE CAST(pv.fec_final AS VARCHAR) like $1 || \'%\' AND co.id = pv.id_empl_contrato AND 
    co.id_empleado = e.id AND e.estado = 1`, [fechaHoy]);
        return expira_peri_hoy.rows;
    });
}
// METODO PARA VERIFICAR SI FINALIZO SU PERIODO DE VACACIONES Y CREAR UN NUEVO PERIODO AUTOMATICAMENTE.
const Peri_Vacacion_Automatico = function () {
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        var f = new Date();
        console.log(f.getHours());
        if (f.getHours() === HORA_ENVIO_VACACION_AUTOMATICO) {
            f.setUTCHours(f.getHours()); //para igualar la zona horaria al imprimir la fecha en formato JSON
            var fechaHoy = f.toJSON().split("T")[0];
            let periodos = yield PeriVacacionHoy(fechaHoy);
            if (periodos.length > 0) {
                var descripcion = DescripcionPeriodo();
                var diaIncrementado = sumaDias(f, 1);
                var f1 = new Date();
                f1.setUTCHours(f1.getHours());
                var d1 = sumaDias(f1, 1);
                var yearIncrementado = sumaYear(d1, 1);
                periodos.forEach((obj) => {
                    CrearNuevoPeriodo(obj, descripcion, diaIncrementado, yearIncrementado);
                });
            }
        }
    }), 3600000);
};
exports.Peri_Vacacion_Automatico = Peri_Vacacion_Automatico;
// Metodo para verificar si debe tomar vacaciones. y enviar un aviso al correo electrónico.  Tiempo de aviso 5 dias antes. 
const beforeFiveDays = function () {
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        const date = new Date();
        console.log(date.toLocaleDateString());
        console.log(date.toLocaleTimeString());
        const hora = date.getHours();
        console.log(hora);
        const diaIncrementado = sumaDias(date, 5).toLocaleDateString().split("T")[0];
        console.log(diaIncrementado);
        if (hora === HORA_ENVIO_AVISO_CINCO_DIAS) {
            const avisoVacacion = yield database_1.default.query(`SELECT pv.fec_inicio, pv.fec_final, e.nombre, e.apellido, e.correo 
            FROM peri_vacaciones AS pv, empl_contratos AS ec, empleados AS e 
            WHERE pv.id_empl_contrato = ec.id AND ec.id_empleado = e.id AND 
            pv.fec_inicio = $1`, [diaIncrementado]);
            console.log(avisoVacacion.rows);
            if (avisoVacacion.rowCount > 0) {
                // Enviar mail a todos los que nacieron en la fecha seleccionada
                avisoVacacion.rows.forEach((obj) => {
                    (0, settingsMail_1.Credenciales)(0);
                    let data = {
                        to: obj.correo,
                        from: settingsMail_1.email,
                        subject: 'Aviso toma de vacaciones',
                        html: `
                        <h2> <b> ¡Tienes 5 días para tomar vacaciones! </b> </h2>
                        <p> <b>${obj.nombre.split(" ")[0]} ${obj.apellido.split(" ")[0]}</b> se le da un aviso de que en 5 días, usted debe
                        tomar vacaciones como esta prestablecido desde el dia <b> ${obj.fec_inicio.toLocaleDateString().split("T")[0]} </b>
                        hasta el dia <b>${obj.fec_final.toLocaleDateString().split("T")[0]}</b>.</p>
                        `
                    };
                    console.log(data);
                    let port = 465;
                    if (settingsMail_1.puerto != null && settingsMail_1.puerto != '') {
                        port = parseInt(settingsMail_1.puerto);
                    }
                    (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, port);
                });
            }
        }
    }), 3600000);
};
exports.beforeFiveDays = beforeFiveDays;
// Metodo para verificar si debe tomar vacaciones. y enviar un aviso al correo electrónico.  Tiempo de aviso 2 dias antes. 
const beforeTwoDays = function () {
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        const date = new Date();
        const hora = date.getHours();
        const diaIncrementado = sumaDias(date, 2).toLocaleDateString().split("T")[0];
        if (hora === HORA_ENVIO_AVISO_DOS_DIAS) {
            const avisoVacacion = yield database_1.default.query(`SELECT pv.fec_inicio, pv.fec_final, e.nombre, e.apellido, e.correo 
                FROM peri_vacaciones AS pv, empl_contratos AS ec, empleados AS e 
                WHERE pv.id_empl_contrato = ec.id AND ec.id_empleado = e.id AND 
                pv.fec_inicio = $1`, [diaIncrementado]);
            console.log(avisoVacacion.rows);
            if (avisoVacacion.rowCount > 0) {
                // Enviar mail a todos los que nacieron en la fecha seleccionada
                avisoVacacion.rows.forEach((obj) => {
                    (0, settingsMail_1.Credenciales)(0);
                    let data = {
                        to: obj.correo,
                        from: settingsMail_1.email,
                        subject: 'Aviso toma de vacaciones',
                        html: `
                        <h2> <b> ¡Tienes 2 días para tomar vacaciones! </b> </h2>
                        <p> <b>${obj.nombre.split(" ")[0]} ${obj.apellido.split(" ")[0]}</b> se le da un aviso de que en 2 días, usted debe
                        tomar vacaciones como esta prestablecido desde el dia <b> ${obj.fec_inicio.toLocaleDateString().split("T")[0]} </b>
                        hasta el dia <b>${obj.fec_final.toLocaleDateString().split("T")[0]}</b>.</p>
                        `
                    };
                    console.log(data);
                    let port = 465;
                    if (settingsMail_1.puerto != null && settingsMail_1.puerto != '') {
                        port = parseInt(settingsMail_1.puerto);
                    }
                    (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, port);
                });
            }
        }
    }), 3600000);
};
exports.beforeTwoDays = beforeTwoDays;
