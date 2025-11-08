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
exports.rolPermisosControlador = void 0;
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
class RolPermisosControlador {
    // METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS  **USADO
    ListarMenuRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tipo } = req.params;
            const Roles = yield database_1.default.query(`
      SELECT * FROM es_paginas WHERE modulo = false AND movil = $1
      `, [tipo]);
            if (Roles.rowCount != 0) {
                return res.jsonp(Roles.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA ENLISTAR PAGINAS SEAN MODULOS  **USADO
    ListarMenuModulosRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tipo } = req.params;
            const Roles = yield database_1.default.query(`
      SELECT * FROM es_paginas WHERE modulo = true AND movil = $1
      `, [tipo]);
            if (Roles.rowCount != 0) {
                return res.jsonp(Roles.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA ENLISTAR PAGINAS QUE SON MODULOS, CLASIFICANDOLAS POR EL NOMBRE DEL MODULO  **USADO
    ListarModuloPorNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre_modulo, tipo } = req.body;
            const Roles = yield database_1.default.query(`
      SELECT * FROM es_paginas WHERE nombre_modulo = $1 AND movil = $2
      `, [nombre_modulo, tipo]);
            if (Roles.rowCount != 0) {
                return res.jsonp(Roles.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA BUSCAR LAS PAGINAS POR EL ID DEL ROL  **USADO
    ObtenerPaginasRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_rol, tipo } = req.body;
                const PAGINA_ROL = yield database_1.default.query(`
        SELECT * FROM ero_rol_permisos WHERE id_rol = $1 AND movil = $2 ORDER BY 3,5
        `, [id_rol, tipo]);
                return res.jsonp(PAGINA_ROL.rows);
            }
            catch (error) {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA BUSCAR TODAS LAS PAGINAS QUE TIENE EL ROL CON EL MENU LATERAL   **USADO
    ObtenerPaginasMenuRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_rol } = req.body;
            const PAGINA_ROL = yield database_1.default.query(`
        SELECT 
          rp.id, 
          rp.pagina AS funcion, 
          rp.link, 
          rp.id_rol, 
          rp.id_accion, 
          ap.id_pagina AS id_funcion, 
          ap.accion  
        FROM ero_rol_permisos rp
        LEFT JOIN es_acciones_paginas ap 
          ON ap.id = rp.id_accion 
        WHERE rp.id_rol = $1
        ORDER BY ap.id_pagina, rp.id_accion;
      `, [id_rol]);
            if (PAGINA_ROL.rowCount != 0) {
                return res.jsonp(PAGINA_ROL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA ASIGNAR ACCIONES AL ROL   **USADO
    AsignarAccionesRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const arrayAccionesSeleccionadas = req.body.acciones;
            if (!Array.isArray(arrayAccionesSeleccionadas) || arrayAccionesSeleccionadas.length === 0) {
                return res.status(400).jsonp({ message: 'No se proporcionaron acciones para asignar.' });
            }
            try {
                const accionesNoExistentes = yield filtrarAccionesSeleccionadasNoExistentes(arrayAccionesSeleccionadas);
                if (accionesNoExistentes.length === 0) {
                    return res.status(200).jsonp({ message: 'Todas las acciones ya existen.' });
                }
                yield insertarAccionesSeleccionadas(accionesNoExistentes);
                return res.status(200).jsonp({ message: 'Acciones asignadas correctamente.' });
            }
            catch (error) {
                console.error('Error al asignar acciones:', error);
                return res.status(500).jsonp({ message: 'Error al asignar acciones.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO  **USADO
    EliminarPaginasRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ids, user_name, ip, ip_local } = req.body;
                if (!Array.isArray(ids) || ids.length === 0) {
                    return res.status(400).jsonp({ message: 'No se proporcionaron IDs para eliminar.' });
                }
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const roles = yield database_1.default.query('SELECT * FROM ero_rol_permisos WHERE id = ANY($1)', [ids]);
                const datosOriginales = roles.rows;
                if (datosOriginales.length === 0) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ero_rol_permisos',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar los permisos. Registros no encontrados.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al eliminar los registros.' });
                }
                // ELIMINAR REGISTROS
                yield database_1.default.query('DELETE FROM ero_rol_permisos WHERE id = ANY($1)', [ids]);
                // AUDITORÍA MASIVA
                const valuesAuditoria = [];
                const paramsAuditoria = [];
                let i = 1;
                for (const original of datosOriginales) {
                    valuesAuditoria.push(`($${i++}, $${i++}, $${i++}, now(), $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
                    paramsAuditoria.push("APLICACION WEB", 'ero_rol_permisos', user_name, 'D', JSON.stringify(original), '', ip, null, ip_local);
                }
                const queryAuditoria = `
          INSERT INTO audit.auditoria (plataforma, table_name, user_name, fecha_hora,
            action, original_data, new_data, ip_address, observacion, ip_address_local)
          VALUES ${valuesAuditoria.join(', ')}
        `;
                yield database_1.default.query(queryAuditoria, paramsAuditoria);
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registros eliminados.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA BUSCAR LAS ACCIONES POR CADA PAGINA  **USADO
    ObtenerAccionesPaginas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_funcion, tipo } = req.body;
            const PAGINA_ROL = yield database_1.default.query(`
      SELECT * FROM es_acciones_paginas AS ap, es_paginas AS p 
      WHERE ap.id_pagina = $1 AND p.id = ap.id_pagina AND p.movil = $2
      `, [id_funcion, tipo]);
            if (PAGINA_ROL.rowCount != 0) {
                return res.jsonp(PAGINA_ROL.rows);
            }
            else {
                return res.jsonp([]);
            }
        });
    }
    // METODO PARA ENLISTAR ACCIONES SEGUN LA PAGINA  **USADO
    ObtenerAccionesPaginasExistentes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_funcion } = req.body;
            const PAGINA_ROL = yield database_1.default.query(`
        SELECT * FROM es_acciones_paginas WHERE id_pagina = $1 
      `, [id_funcion]);
            if (PAGINA_ROL.rowCount != 0) {
                return res.jsonp(PAGINA_ROL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA ENLISTAR ACCIONES  **USADO
    ListarAcciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const Roles = yield database_1.default.query(`
      SELECT * FROM es_acciones_paginas
      `);
            if (Roles.rowCount != 0) {
                return res.jsonp(Roles.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA LISTAR ROLES DEL SISTEMA  **USADO
    BuscarFuncionesRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const CON_ACCIONES = yield database_1.default.query(`
      SELECT pr.id_rol, p.id AS id_pagina, pr.pagina, a.accion, pr.movil, p.nombre_modulo
      FROM ero_rol_permisos AS pr
      JOIN es_acciones_paginas AS a ON a.id = pr.id_accion
      JOIN es_paginas AS p ON p.nombre = pr.pagina
      `);
            console.log('con acciones ', CON_ACCIONES.rowCount);
            const SIN_ACCIONES = yield database_1.default.query(`
      SELECT pr.id_rol, p.id AS id_pagina, pr.pagina, pr.id_accion AS accion, pr.movil, p.nombre_modulo
      FROM ero_rol_permisos AS pr
      JOIN es_paginas AS p ON p.nombre = pr.pagina AND pr.id_accion IS NULL
      `);
            console.log('sin acciones ', SIN_ACCIONES.rowCount);
            var respuesta = [];
            if (SIN_ACCIONES.rowCount != 0 && CON_ACCIONES.rowCount != 0) {
                SIN_ACCIONES.rows.forEach((obj) => {
                    CON_ACCIONES.rows.push(obj);
                });
                respuesta = CON_ACCIONES.rows;
            }
            else if (CON_ACCIONES.rowCount != 0) {
                respuesta = CON_ACCIONES.rows;
            }
            else if (SIN_ACCIONES.rowCount != 0) {
                respuesta = SIN_ACCIONES.rows;
            }
            if (respuesta.length != 0) {
                return res.jsonp(respuesta);
            }
            else {
                res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
}
// FUNCION UTIL PARA FILTRAR LAS ACCIONES SELECCIONADAS  **USADO
function filtrarAccionesSeleccionadasNoExistentes(arrayAccionesSeleccionadas) {
    return __awaiter(this, void 0, void 0, function* () {
        if (arrayAccionesSeleccionadas.length === 0)
            return [];
        // FILTROS DINAMICOS PARA COMPROBAR EXISTENCIA
        const conditions = [];
        const values = [];
        let i = 1;
        for (const accion of arrayAccionesSeleccionadas) {
            const { id_rol, id_accion, funcion } = accion;
            if (id_accion) {
                conditions.push(`(pagina = $${i++} AND id_rol = $${i++} AND id_accion = $${i++})`);
                values.push(funcion, id_rol, id_accion);
            }
            else {
                conditions.push(`(pagina = $${i++} AND id_rol = $${i++})`);
                values.push(funcion, id_rol);
            }
        }
        const query = `
      SELECT pagina, id_rol, id_accion FROM ero_rol_permisos
      WHERE ${conditions.join(' OR ')}
    `;
        const result = yield database_1.default.query(query, values);
        // CONVERTIMOS LOS REGISTROS EXISTENTES A UN SET DE CLAVES PARA COMPARAR RÁPIDO
        const clavesExistentes = new Set(result.rows.map(r => { var _a; return `${r.pagina}|${r.id_rol}|${(_a = r.id_accion) !== null && _a !== void 0 ? _a : 'null'}`; }));
        // FILTRAMOS LOS QUE NO EXISTEN
        return arrayAccionesSeleccionadas.filter(({ funcion, id_rol, id_accion }) => {
            const clave = `${funcion}|${id_rol}|${id_accion !== null && id_accion !== void 0 ? id_accion : 'null'}`;
            return !clavesExistentes.has(clave);
        });
    });
}
// FUNCION PARA INSERTAR EN LA BASE DE DATOS LAS ACCIONES SELECCIONADAS   **USADO
function insertarAccionesSeleccionadas(arrayAccionesSeleccionadas) {
    return __awaiter(this, void 0, void 0, function* () {
        if (arrayAccionesSeleccionadas.length === 0)
            return;
        // CONSTRUIMOS LA CONSULTA DE INSERCION
        const values = [];
        const params = [];
        let i = 1;
        const valuesAuditoria = [];
        const paramsAuditoria = [];
        let j = 1;
        for (const accion of arrayAccionesSeleccionadas) {
            const { funcion, link, id_rol, id_accion, movil, user_name, ip, ip_local } = accion;
            if (id_accion) {
                values.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
                params.push(funcion, link, id_rol, id_accion, movil);
            }
            else {
                values.push(`($${i++}, $${i++}, $${i++}, NULL, $${i++})`);
                params.push(funcion, link, id_rol, movil);
            }
            // PREPARAR DATOS PARA AUDITORIA
            valuesAuditoria.push(`($${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++})`);
            paramsAuditoria.push("APLICACION WEB", 'ero_rol_permisos', user_name, 'now()', 'I', '', JSON.stringify({ pagina: funcion, link, id_rol, id_accion, movil }), ip, null, ip_local);
        }
        const query = `
      INSERT INTO ero_rol_permisos (pagina, link, id_rol, id_accion, movil)
      VALUES ${values.join(', ')}
    `;
        const queryAuditoria = `
      INSERT INTO audit.auditoria (plataforma, table_name, user_name, fecha_hora,
        action, original_data, new_data, ip_address, observacion, ip_address_local)
      VALUES ${valuesAuditoria.join(', ')}
    `;
        // AÑADIR TRANSACCION
        yield database_1.default.query('BEGIN');
        yield database_1.default
            .query(query, params)
            .catch((error) => {
            console.error('Error al insertar acciones seleccionadas:', error);
            // REVERTIR TRANSACCIÓN EN CASO DE ERROR
            return database_1.default.query('ROLLBACK')
                .then(() => {
                throw new Error('Error al insertar acciones seleccionadas: ' + error.message);
            });
        });
        yield database_1.default
            .query(queryAuditoria, paramsAuditoria)
            .catch((error) => {
            console.error('Error al insertar auditoría de acciones seleccionadas:', error);
            // REVERTIR TRANSACCIÓN EN CASO DE ERROR
            return database_1.default.query('ROLLBACK')
                .then(() => {
                throw new Error('Error al insertar auditoría de acciones seleccionadas: ' + error.message);
            });
        });
        // FINALIZAR TRANSACCION
        yield database_1.default.query('COMMIT');
        console.log('Acciones seleccionadas insertadas correctamente.');
    });
}
exports.rolPermisosControlador = new RolPermisosControlador();
exports.default = exports.rolPermisosControlador;
