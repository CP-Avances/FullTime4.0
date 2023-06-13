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
exports.PERMISOS_CONTROLADOR = void 0;
const settingsMail_1 = require("../../libs/settingsMail");
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const builder = require('xmlbuilder');
class PermisosControlador {
    // METODO PARA BUSCAR NUEMRO DE PERMISO
    ObtenerNumPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const NUMERO_PERMISO = yield database_1.default.query(`
            SELECT MAX(p.num_permiso) FROM permisos AS p, empleados AS e 
            WHERE p.codigo::varchar = e.codigo AND e.id = $1
            `, [id_empleado]);
            if (NUMERO_PERMISO.rowCount > 0) {
                return res.jsonp(NUMERO_PERMISO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' }).end;
            }
        });
    }
    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS
    BuscarPermisosTotales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, codigo } = req.body;
                const PERMISO = yield database_1.default.query(`
                    SELECT id FROM permisos 
                        WHERE ((fec_inicio::date BETWEEN $1 AND $2) OR (fec_final::date BETWEEN $1 AND $2)) 
                        AND codigo::varchar = $3
                        AND (estado = 2 OR estado = 3 OR estado = 1)
                    `, [fec_inicio, fec_final, codigo]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS
    BuscarPermisosDias(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, codigo } = req.body;
                const PERMISO = yield database_1.default.query(`
                SELECT id FROM permisos 
                    WHERE ((fec_inicio::date BETWEEN $1 AND $2) OR (fec_final::date BETWEEN $1 AND $2)) 
                    AND codigo::varchar = $3 AND dia != 0
                    AND (estado = 2 OR estado = 3 OR estado = 1)
                `, [fec_inicio, fec_final, codigo]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS
    BuscarPermisosHoras(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, hora_inicio, hora_final, codigo } = req.body;
                console.log('ver data ', fec_inicio, fec_final, hora_inicio, hora_final, codigo);
                const PERMISO = yield database_1.default.query(`
                SELECT id FROM permisos 
                WHERE (($1 BETWEEN fec_inicio::date AND fec_final::date) 
                    OR ($2 BETWEEN fec_inicio::date AND fec_final::date )) 
                    AND codigo::varchar = $5 
                    AND dia = 0
                    AND (($3 BETWEEN hora_salida AND hora_ingreso) OR ($4 BETWEEN hora_salida AND hora_ingreso)) 
                    AND (estado = 2 OR estado = 3 OR estado = 1)
                `, [fec_inicio, fec_final, hora_inicio, hora_final, codigo]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS - ACTUALIZACION
    BuscarPermisosTotalesEditar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, codigo, id } = req.body;
                const PERMISO = yield database_1.default.query(`
                    SELECT id FROM permisos 
                        WHERE ((fec_inicio::date BETWEEN $1 AND $2) OR (fec_final::date BETWEEN $1 AND $2)) 
                        AND codigo::varchar = $3
                        AND (estado = 2 OR estado = 3 OR estado = 1) AND NOT id = $4
                    `, [fec_inicio, fec_final, codigo, id]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS - ACTUALIZACION
    BuscarPermisosDiasEditar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, codigo, id } = req.body;
                const PERMISO = yield database_1.default.query(`
                SELECT id FROM permisos 
                    WHERE ((fec_inicio::date BETWEEN $1 AND $2) OR (fec_final::date BETWEEN $1 AND $2)) 
                    AND codigo::varchar = $3 AND dia != 0
                    AND (estado = 2 OR estado = 3 OR estado = 1) AND NOT id = $4
                `, [fec_inicio, fec_final, codigo, id]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS
    BuscarPermisosHorasEditar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, hora_inicio, hora_final, codigo, id } = req.body;
                const PERMISO = yield database_1.default.query(`
                SELECT id FROM permisos 
                WHERE (($1 BETWEEN fec_inicio::date AND fec_final::date) 
                    OR ($2 BETWEEN fec_inicio::date AND fec_final::date )) 
                    AND codigo::varchar = $5 
                    AND dia = 0
                    AND (($3 BETWEEN hora_salida AND hora_ingreso) OR ($4 BETWEEN hora_salida AND hora_ingreso)) 
                    AND (estado = 2 OR estado = 3 OR estado = 1) AND NOT id = $6
                `, [fec_inicio, fec_final, hora_inicio, hora_final, codigo, id]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA CREAR PERMISOS
    CrearPermisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre, id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso, estado, id_empl_cargo, hora_salida, hora_ingreso, codigo, depa_user_loggin } = req.body;
            const response = yield database_1.default.query(`
            INSERT INTO permisos (fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, 
                dia_libre, id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso, 
                estado, id_empl_cargo, hora_salida, hora_ingreso, codigo) 
            VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17 ) 
                RETURNING * 
            `, [fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre,
                id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso,
                estado, id_empl_cargo, hora_salida, hora_ingreso, codigo]);
            const [objetoPermiso] = response.rows;
            if (!objetoPermiso)
                return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
            const permiso = objetoPermiso;
            const JefesDepartamentos = yield database_1.default.query(`
            SELECT n.id_departamento, cg.nombre, n.id_dep_nivel, n.dep_nivel_nombre, n.nivel,
                da.estado, dae.id_contrato, da.id_empl_cargo, (dae.nombre || ' ' || dae.apellido) as fullname,
                dae.cedula, dae.correo, c.permiso_mail, c.permiso_noti 
            FROM nivel_jerarquicodep AS n, depa_autorizaciones AS da, datos_actuales_empleado AS dae,
                config_noti AS c, cg_departamentos AS cg
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_dep_nivel
                AND dae.id_cargo = da.id_empl_cargo
                AND dae.id_contrato = c.id_empleado
                AND cg.id = $1
            ORDER BY nivel ASC
            `, [depa_user_loggin]).then((result) => { return result.rows; });
            if (JefesDepartamentos.length === 0)
                return res.status(400)
                    .jsonp({
                    message: `Ups!!! algo salio mal. 
            Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.`
                });
            const obj = JefesDepartamentos[JefesDepartamentos.length - 1];
            let depa_padre = obj.id_dep_nivel;
            console.log('obj: ', obj);
            console.log('depa_padre: ', depa_padre);
            var JefeDepaPadre = [];
            if (depa_padre !== null) {
                JefesDepartamentos.filter((item) => {
                    JefeDepaPadre.push(item);
                    permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                });
                return res.status(200).jsonp(permiso);
            }
            else {
                permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                return res.status(200).jsonp(permiso);
            }
        });
    }
    // METODO PARA EDITAR SOLICITUD DE PERMISOS
    EditarPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero, num_permiso, hora_salida, hora_ingreso, depa_user_loggin } = req.body;
            console.log('entra ver permiso');
            const response = yield database_1.default.query(`
                    UPDATE permisos SET descripcion = $1, fec_inicio = $2, fec_final = $3, dia = $4, dia_libre = $5, 
                    id_tipo_permiso = $6, hora_numero = $7, num_permiso = $8, hora_salida = $9, hora_ingreso = $10 
                    WHERE id = $11 RETURNING *
                `, [descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero, num_permiso,
                hora_salida, hora_ingreso, id]);
            const [objetoPermiso] = response.rows;
            if (!objetoPermiso)
                return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
            const permiso = objetoPermiso;
            console.log(permiso);
            console.log(req.query);
            const JefesDepartamentos = yield database_1.default.query(`
            SELECT n.id_departamento, cg.nombre, n.id_dep_nivel, n.dep_nivel_nombre, n.nivel,
                da.estado, dae.id_contrato, da.id_empl_cargo, (dae.nombre || ' ' || dae.apellido) as fullname,
                dae.cedula, dae.correo, c.permiso_mail, c.permiso_noti 
            FROM nivel_jerarquicodep AS n, depa_autorizaciones AS da, datos_actuales_empleado AS dae,
                config_noti AS c, cg_departamentos AS cg 
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_dep_nivel
                AND dae.id_cargo = da.id_empl_cargo
                AND dae.id_contrato = c.id_empleado
                AND cg.id = $1
            ORDER BY nivel ASC
            `, [depa_user_loggin]).then((result) => { return result.rows; });
            if (JefesDepartamentos.length === 0)
                return res.status(400)
                    .jsonp({
                    message: `Ups!!! algo salio mal. 
            Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.`
                });
            const [obj] = JefesDepartamentos;
            let depa_padre = obj.depa_padre;
            let JefeDepaPadre;
            if (depa_padre !== null) {
                do {
                    JefeDepaPadre = yield database_1.default.query(`
                    SELECT da.id AS id_depa_auto, n.id_departamento, n.departamento, n.id_dep_nivel, n.dep_nivel_nombre, n.nivel, 
                        n.id_establecimiento AS id_sucursal, s.nombre AS sucursal, 
                        dae.id_cargo AS cargo, dae.id_contrato AS contrato, dae.id AS empleado, 
                        (dae.nombre || ' ' || dae.apellido) as fullname, dae.cedula, dae.correo, 
                        c.permiso_mail, c.permiso_noti 
                    FROM depa_autorizaciones AS da, 
                        nivel_jerarquicodep AS n, sucursales AS s, 
                        datos_actuales_empleado AS dae, config_noti AS c, cg_departamentos AS cg 
                    WHERE n.id_departamento = 9 
                        AND cg.id = n.id_departamento 
                        AND n.nivel = cg.nivel
                        AND da.id_departamento = n.id_dep_nivel 
                        AND s.id = n.id_establecimiento  
                        AND dae.id = da.id_empleado 
                        AND c.id_empleado = da.id_empleado
                    `, [depa_padre]);
                    depa_padre = JefeDepaPadre.rows[0].depa_padre;
                    JefesDepartamentos.push(JefeDepaPadre.rows[0]);
                } while (depa_padre !== null);
                permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                return res.status(200).jsonp(permiso);
            }
            else {
                permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                return res.status(200).jsonp(permiso);
            }
        });
    }
    // REGISTRAR DOCUMENTO DE RESPALDO DE PERMISO  
    GuardarDocumentoPermiso(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // LEER DATOS DE IMAGEN
            let doc = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let { archivo } = req.params;
            let { documento } = req.params;
            let id = req.params.id;
            // ACTUALIZAR REGISTRO
            yield database_1.default.query(`
            UPDATE permisos SET documento = $2, docu_nombre = $3 WHERE id = $1
            `, [id, doc, documento]);
            res.jsonp({ message: 'Documento Actualizado' });
            if (archivo != 'null' && archivo != '' && archivo != null) {
                if (archivo != doc) {
                    let filePath = `servidor\\permisos\\${archivo}`;
                    let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                    fs_1.default.unlinkSync(direccionCompleta);
                }
            }
        });
    }
    // ELIMINAR DOCUMENTO DE RESPALDO DE PERMISO  
    EliminarDocumentoPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, archivo } = req.body;
            // ACTUALIZAR REGISTRO
            yield database_1.default.query(`
            UPDATE permisos SET documento = null, docu_nombre = null WHERE id = $1
            `, [id]);
            res.jsonp({ message: 'Documento eliminado.' });
            if (archivo != 'null' && archivo != '' && archivo != null) {
                let filePath = `servidor\\permisos\\${archivo}`;
                let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                fs_1.default.unlinkSync(direccionCompleta);
            }
        });
    }
    // METODO DE BUSQUEDA DE PERMISOS POR ID DE EMPLEADO
    ObtenerPermisoEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado } = req.params;
                const PERMISO = yield database_1.default.query(`
                SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio,
                    p.fec_final, p.dia, p.hora_numero, p.legalizado, p.estado, p.dia_libre, 
                    p.id_tipo_permiso, p.id_empl_contrato, p.id_peri_vacacion, p.num_permiso, 
                    p.documento, p.docu_nombre, p.hora_salida, p.hora_ingreso, p.codigo, 
                    t.descripcion AS nom_permiso, t.tipo_descuento 
                FROM permisos AS p, cg_tipo_permisos AS t, empleados AS e
                WHERE p.id_tipo_permiso = t.id AND p.codigo::varchar = e.codigo AND e.id = $1 
                ORDER BY p.num_permiso DESC
                    `, [id_empleado]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp(null);
            }
        });
    }
    // METODO PARA OBTENER INFORMACION DE UN PERMISO
    InformarUnPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_permiso;
            const PERMISOS = yield database_1.default.query(`
            SELECT p.*, tp.descripcion AS tipo_permiso, cr.descripcion AS regimen, da.nombre, da.apellido,
                da.cedula, s.nombre AS sucursal, c.descripcion AS ciudad, e.nombre AS empresa, tc.cargo
            FROM permisos AS p, cg_tipo_permisos AS tp, empl_contratos AS ec, cg_regimenes AS cr,
                datos_actuales_empleado AS da, empl_cargos AS ce, sucursales AS s, ciudades AS c, cg_empresa AS e,
				tipo_cargo AS tc
            WHERE p.id_tipo_permiso = tp.id AND ec.id = p.id_empl_contrato AND cr.id = ec.id_regimen
                AND da.codigo = p.codigo::varchar AND ce.id_empl_contrato = p.id_empl_contrato
                AND s.id = ce.id_sucursal AND s.id_ciudad = c.id AND s.id_empresa = e.id AND tc.id = ce.cargo
                AND p.id = $1
            `, [id]);
            if (PERMISOS.rowCount > 0) {
                return res.json(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR PERMISO
    EliminarPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id_permiso, doc } = req.params;
            yield database_1.default.query(`
            DELETE FROM realtime_noti where id_permiso = $1
            `, [id_permiso]);
            yield database_1.default.query(`
            DELETE FROM autorizaciones WHERE id_permiso = $1
            `, [id_permiso]);
            const response = yield database_1.default.query(`
            DELETE FROM permisos WHERE id = $1 RETURNING *
            `, [id_permiso]);
            if (doc != 'null' && doc != '' && doc != null) {
                console.log(id_permiso, doc, ' entra ');
                let filePath = `servidor\\permisos\\${doc}`;
                let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                fs_1.default.unlinkSync(direccionCompleta);
            }
            const [objetoPermiso] = response.rows;
            if (objetoPermiso) {
                return res.status(200).jsonp(objetoPermiso);
            }
            else {
                return res.status(404).jsonp({ message: 'Solicitud no eliminada.' });
            }
        });
    }
    // METODO PARA CREAR ARCHIVO XML
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            console.log(req.body.userName);
            let filename = "Permisos-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
            fs_1.default.writeFile(`xmlDownload/${filename}`, xml, function (err) {
            });
            res.jsonp({ text: 'XML creado', name: filename });
        });
    }
    // METODO PARA DESCARGAR ARCHIVO XML
    downloadXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = req.params.nameXML;
            let filePath = `servidor\\xmlDownload\\${name}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    // BUSQUEDA DE DOCUMENTO PERMISO
    ObtenerDocumentoPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = req.params.docs;
            let filePath = `servidor\\permisos\\${docs}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    /** ********************************************************************************************* **
     ** *         METODO PARA ENVIO DE CORREO ELECTRONICO DE SOLICITUDES DE PERMISOS                * **
     ** ********************************************************************************************* **/
    // METODO PARA ENVIAR CORREO ELECTRÓNICO DESDE APLICACIÓN WEB
    EnviarCorreoWeb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos === 'ok') {
                const { id_empl_contrato, id_dep, correo, id_suc, desde, hasta, h_inicio, h_fin, observacion, estado_p, solicitud, tipo_permiso, dias_permiso, horas_permiso, solicitado_por, id, asunto, tipo_solicitud, proceso } = req.body;
                const correoInfoPidePermiso = yield database_1.default.query(`
                SELECT e.id, e.correo, e.nombre, e.apellido, 
                    e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
                    d.nombre AS departamento 
                FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, 
                    cg_departamentos AS d 
                WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
                    (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id ) = ecr.id 
                    AND tc.id = ecr.cargo AND d.id = ecr.id_departamento ORDER BY cargo DESC
                `, [id_empl_contrato]);
                // codigo para enviar notificacion o correo al jefe de su propio departamento, independientemente del nivel.
                // && obj.id_dep === correoInfoPidePermiso.rows[0].id_departamento && obj.id_suc === correoInfoPidePermiso.rows[0].id_sucursal
                var url = `${process.env.URL_DOMAIN}/ver-permiso`;
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
                        <body>
                            <div style="text-align: center;">
                                <img width="25%" height="25%" src="cid:cabeceraf"/>
                            </div>
                            <br>
                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                            </p>
                            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
                                <b>Asunto:</b> ${asunto} <br> 
                                <b>Colaborador que envía:</b> ${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido} <br>
                                <b>Número de Cédula:</b> ${correoInfoPidePermiso.rows[0].cedula} <br>
                                <b>Cargo:</b> ${correoInfoPidePermiso.rows[0].tipo_cargo} <br>
                                <b>Departamento:</b> ${correoInfoPidePermiso.rows[0].departamento} <br>
                                <b>Generado mediante:</b> Aplicación Web <br>
                                <b>Fecha de envío:</b> ${fecha} <br> 
                                <b>Hora de envío:</b> ${hora} <br><br> 
                            </p>
                            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                                <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                    <b>Motivo:</b> ${tipo_permiso} <br>   
                                    <b>Fecha de Solicitud:</b> ${solicitud} <br> 
                                    <b>Desde:</b> ${desde} ${h_inicio} <br>
                                    <b>Hasta:</b> ${hasta} ${h_fin} <br>
                                    <b>Observación:</b> ${observacion} <br>
                                    <b>Días permiso:</b> ${dias_permiso} <br>
                                    <b>Horas permiso:</b> ${horas_permiso} <br>
                                    <b>Estado:</b> ${estado_p} <br><br>
                                    <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
                                    <a href="${url}/${id}">Dar clic en el siguiente enlace para revisar solicitud de permiso.</a> <br><br>
                                </p>
                                <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                                    <b>Gracias por la atención</b><br>
                                    <b>Saludos cordiales,</b> <br><br>
                                </p>
                                <img src="cid:pief" width="50%" height="50%"/>
                        </body>
                    `,
                    attachments: [
                        {
                            filename: 'cabecera_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        console.log('Email error: ' + error);
                        corr.close();
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                        corr.close();
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
    ListarPermisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PERMISOS = yield database_1.default.query('SELECT * FROM permisos');
            if (PERMISOS.rowCount > 0) {
                return res.jsonp(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarEstadosPermisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PERMISOS = yield database_1.default.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                'p.documento, p.docu_nombre, p.fec_final, p.estado, p.id_empl_cargo, e.id AS id_emple_solicita, e.nombre, e.apellido, ' +
                'e.cedula, cp.descripcion AS nom_permiso, ec.id AS id_contrato, da.id_departamento AS id_depa FROM permisos AS p, ' +
                'empl_contratos AS ec, empleados AS e, cg_tipo_permisos AS cp, datos_actuales_empleado AS da ' +
                'WHERE p.id_empl_contrato = ec.id AND ' +
                'ec.id_empleado = e.id AND p.id_tipo_permiso = cp.id AND da.id_contrato = ec.id AND (p.estado = 1 OR p.estado = 2) ' +
                'ORDER BY estado DESC, fec_creacion DESC');
            if (PERMISOS.rowCount > 0) {
                return res.jsonp(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ message: 'Resource not found' }).end();
            }
        });
    }
    ListarPermisosAutorizados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PERMISOS = yield database_1.default.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                'p.documento, p.docu_nombre, p.fec_final, p.estado, p.id_empl_cargo, e.id AS id_emple_solicita, e.nombre, e.apellido, ' +
                'e.cedula, cp.descripcion AS nom_permiso, ec.id AS id_contrato FROM permisos AS p, ' +
                'empl_contratos AS ec, empleados AS e, cg_tipo_permisos AS cp WHERE p.id_empl_contrato = ec.id AND ' +
                'ec.id_empleado = e.id AND p.id_tipo_permiso = cp.id  AND (p.estado = 3 OR p.estado = 4) ' +
                'ORDER BY estado ASC, fec_creacion DESC');
            if (PERMISOS.rowCount > 0) {
                return res.jsonp(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerUnPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const PERMISOS = yield database_1.default.query('SELECT * FROM permisos WHERE id = $1', [id]);
            if (PERMISOS.rowCount > 0) {
                return res.jsonp(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerPermisoContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empl_contrato } = req.params;
                const PERMISO = yield database_1.default.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                    'p.fec_final, p.dia, p.hora_numero, p.legalizado, p.estado, p.dia_libre, p.id_tipo_permiso, ' +
                    'p.id_empl_contrato, p.id_peri_vacacion, p.num_permiso, p.documento, p.docu_nombre, ' +
                    't.descripcion AS nom_permiso FROM permisos AS p, cg_tipo_permisos AS t ' +
                    'WHERE p.id_tipo_permiso = t.id AND p.id_empl_contrato = $1', [id_empl_contrato]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp(null);
            }
        });
    }
    ObtenerPermisoEditar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const PERMISO = yield database_1.default.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                    'p.fec_final, p.dia, p.hora_numero, p.legalizado, p.estado, p.dia_libre, p.id_tipo_permiso, ' +
                    'p.id_empl_contrato, p.id_peri_vacacion, p.num_permiso, p.documento, p.docu_nombre, ' +
                    'p.hora_salida, p.hora_ingreso, p.codigo, ' +
                    't.descripcion AS nom_permiso FROM permisos AS p, cg_tipo_permisos AS t ' +
                    'WHERE p.id_tipo_permiso = t.id AND p.id = $1 ORDER BY p.num_permiso DESC', [id]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp(null);
            }
        });
    }
    ObtenerDatosSolicitud(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_emple_permiso;
            console.log('dato id emple permiso: ', id);
            const SOLICITUD = yield database_1.default.query('SELECT * FROM vista_datos_solicitud_permiso WHERE id_emple_permiso = $1', [id]);
            if (SOLICITUD.rowCount > 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerDatosAutorizacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_permiso;
            const SOLICITUD = yield database_1.default.query('SELECT a.id AS id_autorizacion, a.id_documento AS empleado_estado, ' +
                'p.id AS permiso_id FROM autorizaciones AS a, permisos AS p ' +
                'WHERE p.id = a.id_permiso AND p.id = $1', [id]);
            if (SOLICITUD.rowCount > 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerFechasPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const codigo = req.params.codigo;
            const { fec_inicio, fec_final } = req.body;
            const PERMISOS = yield database_1.default.query('SELECT pg.fec_hora_horario::date AS fecha, pg.fec_hora_horario::time AS hora, ' +
                'pg.tipo_entr_salida FROM plan_general AS pg WHERE(pg.tipo_entr_salida = \'E\' OR pg.tipo_entr_salida = \'S\') ' +
                'AND pg.codigo = $3 AND(pg.fec_hora_horario:: date = $1 OR pg.fec_hora_horario:: date = $2)', [fec_inicio, fec_final, codigo]);
            if (PERMISOS.rowCount > 0) {
                return res.jsonp(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    /** ************************************************************************************************* **
     ** **                             METODOS PARA REGISTRO DE PERMISOS                               ** **
     ** ************************************************************************************************* **/
    // ELIMINAR DOCUMENTO DE PERMISO DESDE APLICACION MOVIL
    EliminarPermisoMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento } = req.params;
            if (documento != 'null' && documento != '' && documento != null) {
                let filePath = `servidor\\permisos\\${documento}`;
                let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                fs_1.default.unlinkSync(direccionCompleta);
            }
            res.jsonp({ message: 'ok' });
        });
    }
    // METODO PARA ACTUALIZAR ESTADO DEL PERMISO
    ActualizarEstado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { estado } = req.body;
            yield database_1.default.query(`
            UPDATE permisos SET estado = $1 WHERE id = $2
            `, [estado, id]);
        });
    }
    // METODO PARA OBTENER INFORMACION DE UN PERMISO
    ListarUnPermisoInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_permiso;
            const PERMISOS = yield database_1.default.query(`
            SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, p.dia, p.hora_salida, p.hora_ingreso, 
            p.hora_numero, p.documento, p.docu_nombre, p.fec_final, p.estado, p.id_empl_cargo, e.nombre, 
            e.apellido, e.cedula, e.id AS id_empleado, cp.id AS id_tipo_permiso, 
            cp.descripcion AS nom_permiso, ec.id AS id_contrato 
            FROM permisos AS p, empl_contratos AS ec, empleados AS e, cg_tipo_permisos AS cp 
            WHERE p.id = $1 AND p.id_empl_contrato = ec.id AND ec.id_empleado = e.id AND 
            p.id_tipo_permiso = cp.id
            `, [id]);
            if (PERMISOS.rowCount > 0) {
                return res.json(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // ENVIO DE CORREO AL CREAR UN PERMISO MEDIANTE APLICACIÓN MÓVIL
    EnviarCorreoPermisoMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            if (datos === 'ok') {
                const { id_empl_contrato, id_dep, correo, id_suc, desde, hasta, h_inicio, h_fin, observacion, estado_p, solicitud, tipo_permiso, dias_permiso, horas_permiso, solicitado_por, asunto, tipo_solicitud, proceso } = req.body;
                const correoInfoPidePermiso = yield database_1.default.query('SELECT e.id, e.correo, e.nombre, e.apellido, ' +
                    'e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, ' +
                    'd.nombre AS departamento ' +
                    'FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, ' +
                    'cg_departamentos AS d ' +
                    'WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND ' +
                    '(SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id ) = ecr.id ' +
                    'AND tc.id = ecr.cargo AND d.id = ecr.id_departamento ORDER BY cargo DESC', [id_empl_contrato]);
                // codigo para enviar notificacion o correo al jefe de su propio departamento, independientemente del nivel.
                // && obj.id_dep === correoInfoPidePermiso.rows[0].id_departamento && obj.id_suc === correoInfoPidePermiso.rows[0].id_sucursal
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
                           <body>
                               <div style="text-align: center;">
                                   <img width="25%" height="25%" src="cid:cabeceraf"/>
                               </div>
                               <br>
                               <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                   El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                               </p>
                               <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                               <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                   <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
                                   <b>Asunto:</b> ${asunto} <br> 
                                   <b>Colaborador que envía:</b> ${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido} <br>
                                   <b>Número de Cédula:</b> ${correoInfoPidePermiso.rows[0].cedula} <br>
                                   <b>Cargo:</b> ${correoInfoPidePermiso.rows[0].tipo_cargo} <br>
                                   <b>Departamento:</b> ${correoInfoPidePermiso.rows[0].departamento} <br>
                                   <b>Generado mediante:</b> Aplicación Móvil <br>
                                   <b>Fecha de envío:</b> ${fecha} <br> 
                                   <b>Hora de envío:</b> ${hora} <br><br> 
                               </p>
                               <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                               <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                   <b>Motivo:</b> ${tipo_permiso} <br>   
                                   <b>Fecha de Solicitud:</b> ${solicitud} <br> 
                                   <b>Desde:</b> ${desde} ${h_inicio} <br>
                                   <b>Hasta:</b> ${hasta} ${h_fin} <br>
                                   <b>Observación:</b> ${observacion} <br>
                                   <b>Días permiso:</b> ${dias_permiso} <br>
                                   <b>Horas permiso:</b> ${horas_permiso} <br>
                                   <b>Estado:</b> ${estado_p} <br><br>
                                   <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
                               </p>
                               <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                                   <b>Gracias por la atención</b><br>
                                   <b>Saludos cordiales,</b> <br><br>
                               </p>
                               <img src="cid:pief" width="50%" height="50%"/>
                            </body>
                        `,
                    attachments: [
                        {
                            filename: 'cabecera_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        corr.close();
                        console.log('Email error: ' + error);
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        corr.close();
                        console.log('Email sent: ' + info.response);
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' + datos });
            }
        });
    }
}
exports.PERMISOS_CONTROLADOR = new PermisosControlador();
exports.default = exports.PERMISOS_CONTROLADOR;
