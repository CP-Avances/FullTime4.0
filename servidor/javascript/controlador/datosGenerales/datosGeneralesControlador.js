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
const database_1 = __importDefault(require("../../database"));
class DatosGeneralesControlador {
    // METODO PARA LEER DATOS DEL USUARIO      **USADO
    BuscarDataGeneral(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            let informacion = yield database_1.default.query(`
            SELECT ig.*, u.usuario
            FROM informacion_general AS ig
            LEFT JOIN eu_usuarios AS u ON ig.id = u.id_empleado
            WHERE ig.estado = $1
            ORDER BY ig.name_suc ASC;
            `, [estado]).then((result) => { return result.rows; });
            if (informacion.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(informacion);
        });
    }
    // METODO PARA BUSCAR DATOS DE USUARIOS QUE RECIBEN COMUNICADOS    **USADO
    DatosGeneralesComunicados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            let resultados = yield database_1.default.query(`
            SELECT ig.*, cn.comunicado_mail, cn.comunicado_notificacion 
            FROM informacion_general AS ig, eu_configurar_alertas AS cn 
            WHERE ig.id = cn.id_empleado AND ig.estado = $1
                AND (cn.comunicado_mail = true OR cn.comunicado_notificacion = true)                
            `, [estado]).then((result) => { return result.rows; });
            if (resultados.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(resultados);
        });
    }
    // METODO PARA LEER DATOS PERFIL **USADO
    BuscarDataGeneralRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            let informacion = yield database_1.default.query(`
                SELECT * FROM informacion_general AS ig, eu_usuario_departamento AS ud
                WHERE ig.estado = $1 AND 
	   		        ig.jefe = false AND
			        ud.id_empleado = ig.id AND
	                ud.administra = false
                ORDER BY ig.name_suc ASC
                `, [estado]).then((result) => { return result.rows; });
            if (informacion.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(informacion);
        });
    }
    // METODO DE BUSQUEDA DE DATOS ACTUALES DEL USUARIO   **USADO
    DatosActuales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { empleado_id } = req.params;
            const DATOS = yield database_1.default.query(`
            SELECT * FROM contrato_cargo_vigente WHERE id_empleado = $1
            `, [empleado_id]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    // METODO DE BUSQUEDA DE USUARIOS QUE NO HAN SIDO ASIGNADOS A UNA UBICACION    **USADO
    DatosGeneralesUbicacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            let { ubicacion } = req.body;
            console.log("ver ubicacion: ", ubicacion);
            // CONSULTA DE BUSQUEDA DE SUCURSALES
            let respuesta = yield database_1.default.query(`
            SELECT ig.*
                FROM informacion_general ig
                LEFT JOIN mg_empleado_ubicacion eu
                ON eu.id_empleado = ig.id AND eu.id_ubicacion = $2
                WHERE ig.estado = $1
                AND eu.id_empleado IS NULL
            ORDER BY ig.id ASC;
            `, [estado, ubicacion]).then((result) => { return result.rows; });
            if (respuesta.length === 0)
                return res.status(404)
                    .jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(respuesta);
        });
    }
    // METODO PARA LISTAR ID ACTUALES DE USUARIOS   **USADO
    ListarIdDatosActualesEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const DATOS = yield database_1.default.query(`
            SELECT dae.id_empleado AS id
            FROM contrato_cargo_vigente AS dae
            ORDER BY dae.id_empleado ASC
            `);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    // METODO PARA VER INFORMACION DE UN USUARIO AUTORIZA   **USADO
    ListarDatosEmpleadoAutoriza(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { empleado_id } = req.params;
            const DATOS = yield database_1.default.query(`
            SELECT (da.nombre ||' '|| da.apellido) AS fullname, da.identificacion, da.name_cargo AS cargo, 
                da.name_dep AS departamento
            FROM informacion_general AS da
            WHERE da.id = $1
            `, [empleado_id]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    // METODO PARA LISTAR DATOS ACTUALES DEL USUARIO  
    ListarDatosActualesEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const DATOS = yield database_1.default.query(`
                SELECT e_datos.id, e_datos.identificacion, e_datos.apellido, e_datos.nombre, e_datos.estado_civil, 
                    e_datos.genero, e_datos.correo, e_datos.fecha_nacimiento, e_datos.estado, 
                    e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, e_datos.imagen, 
                    e_datos.codigo, e_datos.id_contrato, e_datos.id_regimen, e_datos.name_regimen AS regimen,
                    e_datos.id_cargo, e_datos.id_cargo_ AS id_tipo_cargo, e_datos.name_cargo AS cargo, 
                    e_datos.id_depa AS id_departamento, e_datos.name_dep AS departamento, e_datos.id_suc AS id_sucursal, 
                    e_datos.name_suc AS sucursal, s.id_empresa, empre.nombre AS empresa, e_datos.id_ciudad, e_datos.ciudad, 
                    e_datos.hora_trabaja
                FROM informacion_general AS e_datos, e_sucursales AS s, e_empresa AS empre
                WHERE s.id = e_datos.id_suc AND s.id_empresa = empre.id 
                ORDER BY e_datos.nombre ASC
                `);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    // METODO PARA BUSCAR INFORMACION DE CONFIGURACIONES DE PERMISOS
    BuscarConfigEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado } = req.params;
                console.log('***************', id_empleado);
                const response = yield database_1.default.query(`
                SELECT da.id_depa,  cn.* , (da.nombre || ' ' || da.apellido) as fullname, 
                    da.identificacion, da.correo, da.codigo, da.estado, da.id_suc, 
                    da.id_contrato, 
                    da.name_dep AS ndepartamento,
                    da.name_suc AS nsucursal
                FROM informacion_general AS da, eu_configurar_alertas AS cn 
                WHERE da.id = $1 AND cn.id_empleado = da.id
                `, [id_empleado]);
                const [infoEmpleado] = response.rows;
                console.log(infoEmpleado);
                return res.status(200).jsonp(infoEmpleado);
            }
            catch (error) {
                console.log(error);
                return res.status(500)
                    .jsonp({ message: `Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec` });
            }
        });
    }
    ;
    // TODO: ESTE METODO GENERA EL ERROR AL ELIMINAR VACACIONES
    // METODO PARA BUSCAR JEFES
    BuscarJefes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { objeto, depa_user_loggin } = req.body;
            const permiso = objeto;
            const JefesDepartamentos = yield database_1.default.query(`
            SELECT da.id, da.estado, n.id_departamento as id_dep, n.id_departamento_nivel, n.departamento_nombre_nivel, 
                n.nivel, n.id_sucursal AS id_suc, n.departamento, s.nombre AS sucursal, da.id_empleado_cargo as cargo, 
                dae.id_contrato as contrato, da.id_empleado AS empleado, (dae.nombre || ' ' || dae.apellido) as fullname,
                dae.identificacion, dae.correo, c.permiso_mail, c.permiso_notificacion, c.vacacion_mail, c.vacacion_notificacion, 
                c.hora_extra_mail, c.hora_extra_notificacion, c.comida_mail, c.comida_notificacion 
            FROM ed_niveles_departamento AS n, ed_autoriza_departamento AS da, informacion_general AS dae,
                eu_configurar_alertas AS c, ed_departamentos AS cg, e_sucursales AS s
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_departamento_nivel
                AND dae.id_cargo = da.id_empleado_cargo
                AND dae.id_contrato = c.id_empleado
                AND cg.id = $1
                AND s.id = n.id_sucursal
            ORDER BY nivel ASC
            `, [depa_user_loggin]).then((result) => { return result.rows; });
            if (JefesDepartamentos.length === 0)
                return res.status(400)
                    .jsonp({
                    message: `Revisar configuración de departamento y autorización de solicitudes.`
                });
            const obj = JefesDepartamentos[JefesDepartamentos.length - 1];
            let depa_padre = obj.id_departamento_nivel;
            let JefeDepaPadre;
            if (depa_padre !== null) {
                /*JefeDepaPadre = await pool.query(
                    `
                    SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre,
                        cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal,
                        ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado,
                        (e.nombre || ' ' || e.apellido) as fullname, e.identificacion, e.correo, c.permiso_mail,
                        c.permiso_noti, c.vaca_mail, c.vaca_noti, c.hora_extra_mail,
                        c.hora_extra_noti, c.comida_mail, c.comida_noti
                    FROM ed_autoriza_departamento AS da, eu_empleado_cargos AS ecr, ed_departamentos AS cg,
                        e_sucursales AS s, eu_empleado_contratos AS ecn,empleados AS e, eu_configurar_alertas AS c
                    WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND
                        da.id_departamento = cg.id AND
                        da.estado = true AND cg.id_sucursal = s.id AND ecr.id_contrato = ecn.id AND
                        ecn.id_empleado = e.id AND e.id = c.id_empleado
                    `
                    , [depa_padre]);*/
                //JefesDepartamentos.push(JefeDepaPadre.rows[0]);
                permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                return res.status(200).jsonp(permiso);
            }
            else {
                permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                return res.status(200).jsonp(permiso);
            }
        });
    }
}
const DATOS_GENERALES_CONTROLADOR = new DatosGeneralesControlador();
exports.default = DATOS_GENERALES_CONTROLADOR;
