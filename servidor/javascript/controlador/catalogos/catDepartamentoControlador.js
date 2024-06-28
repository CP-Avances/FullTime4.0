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
exports.DEPARTAMENTO_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const xlsx_1 = __importDefault(require("xlsx"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class DepartamentoControlador {
    // REGISTRAR DEPARTAMENTO
    CrearDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_sucursal, user_name, ip } = req.body;
                // INICIAR TRANSACCIÓN
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
        INSERT INTO ed_departamentos (nombre, id_sucursal ) VALUES ($1, $2)
        `, [nombre, id_sucursal]);
                // INSERTAR AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ed_departamentos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{Nombre: ${nombre}, Sucursal: ${id_sucursal}}`,
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCIÓN
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // ACTUALIZAR REGISTRO DE DEPARTAMENTO   --**VERIFICADO
    ActualizarDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_sucursal, user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCIÓN
                yield database_1.default.query('BEGIN');
                // OBTENER DATOS ANTES DE ACTUALIZAR
                const response = yield database_1.default.query('SELECT * FROM ed_departamentos WHERE id = $1', [id]);
                const datos = response.rows[0];
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ed_departamentos',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        observacion: `Error al actualizar el departamento con ID: ${id}`,
                    });
                    // FINALIZAR TRANSACCIÓN
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
        UPDATE ed_departamentos set nombre = $1, id_sucursal = $2 
        WHERE id = $3
        `, [nombre, id_sucursal, id]);
                // INSERTAR AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ed_departamentos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: `{Nombre: ${nombre}, Sucursal: ${id_sucursal}}`,
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCIÓN
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCIÓN
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL
    ObtenerDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const DEPARTAMENTO = yield database_1.default.query(`
      SELECT d.*, s.nombre AS sucursal
      FROM ed_departamentos AS d, e_sucursales AS s 
      WHERE d.id = $1 AND s.id = d.id_sucursal
      `, [id]);
            if (DEPARTAMENTO.rowCount != 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            res.status(404).jsonp({ text: 'El departamento no ha sido encontrado.' });
        });
    }
    // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL
    ObtenerDepartamentosSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_sucursal } = req.params;
            const DEPARTAMENTO = yield database_1.default.query(`
      SELECT * FROM ed_departamentos WHERE id_sucursal = $1
      `, [id_sucursal]);
            if (DEPARTAMENTO.rowCount != 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            res.status(404).jsonp({ text: 'El departamento no ha sido encontrado.' });
        });
    }
    // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL Y EXCLUIR DEPARTAMENTO ACTUALIZADO
    ObtenerDepartamentosSucursal_(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_sucursal, id } = req.params;
            const DEPARTAMENTO = yield database_1.default.query(`
      SELECT * FROM ed_departamentos WHERE id_sucursal = $1 AND NOT id = $2
      `, [id_sucursal, id]);
            if (DEPARTAMENTO.rowCount != 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // METODO DE BUSQUEDA DE DEPARTAMENTOS   --**VERIFICAR
    ListarDepartamentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const NIVELES = yield database_1.default.query(`
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, n.id_departamento AS id, 
        n.departamento AS nombre, n.nivel, n.departamento_nombre_nivel AS departamento_padre
      FROM ed_niveles_departamento AS n, e_sucursales AS s
      WHERE n.id_sucursal = s.id AND 
        n.nivel = (SELECT MAX(nivel) FROM ed_niveles_departamento WHERE id_departamento = n.id_departamento)
      ORDER BY s.nombre, n.departamento ASC
      `);
            const DEPARTAMENTOS = yield database_1.default.query(`
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, cd.id, cd.nombre,
        0 AS NIVEL, null AS departamento_padre
      FROM ed_departamentos AS cd, e_sucursales AS s
      WHERE NOT cd.id IN (SELECT id_departamento FROM ed_niveles_departamento) AND
        s.id = cd.id_sucursal
      ORDER BY s.nombre, cd.nombre ASC;
      `);
            if (DEPARTAMENTOS.rowCount != 0 && NIVELES.rowCount != 0) {
                NIVELES.rows.forEach((obj) => {
                    DEPARTAMENTOS.rows.push(obj);
                });
                return res.jsonp(DEPARTAMENTOS.rows);
            }
            else if (DEPARTAMENTOS.rowCount != 0) {
                return res.jsonp(DEPARTAMENTOS.rows);
            }
            else if (NIVELES.rowCount != 0) {
                return res.jsonp(NIVELES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA LISTAR INFORMACION DE DEPARTAMENTOS POR ID DE SUCURSAL   --**VERIFICADO
    ListarDepartamentosSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_sucursal;
            const NIVEL = yield database_1.default.query(`
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, n.id_departamento AS id, 
        n.departamento AS nombre, n.nivel, n.departamento_nombre_nivel AS departamento_padre
      FROM ed_niveles_departamento AS n, e_sucursales AS s
      WHERE n.id_sucursal = s.id AND 
        n.nivel = (SELECT MAX(nivel) FROM ed_niveles_departamento WHERE id_departamento = n.id_departamento)
        AND s.id = $1
      ORDER BY s.nombre, n.departamento ASC
      `, [id]);
            const DEPARTAMENTO = yield database_1.default.query(`
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, cd.id, cd.nombre,
        0 AS NIVEL, null AS departamento_padre
      FROM ed_departamentos AS cd, e_sucursales AS s
      WHERE NOT cd.id IN (SELECT id_departamento FROM ed_niveles_departamento) AND
        s.id = cd.id_sucursal AND s.id = $1
      ORDER BY s.nombre, cd.nombre ASC
      `, [id]);
            if (DEPARTAMENTO.rowCount != 0 && NIVEL.rowCount != 0) {
                DEPARTAMENTO.rows.forEach((obj) => {
                    NIVEL.rows.push(obj);
                });
                return res.jsonp(NIVEL.rows);
            }
            else if (DEPARTAMENTO.rowCount != 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            else if (NIVEL.rowCount != 0) {
                return res.jsonp(NIVEL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCIÓN
                yield database_1.default.query('BEGIN');
                // OBTENER DATOS ANTES DE ELIMINAR
                const response = yield database_1.default.query('SELECT * FROM ed_departamentos WHERE id = $1', [id]);
                const datos = response.rows[0];
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ed_departamentos',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        observacion: `Error al eliminar el departamento con ID: ${id}. Registro no encontrado.`,
                    });
                    // FINALIZAR TRANSACCIÓN
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
        DELETE FROM ed_departamentos WHERE id = $1
        `, [id]);
                // INSERTAR AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ed_departamentos',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: '',
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCIÓN
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCIÓN
                yield database_1.default.query('ROLLBACK');
                //return res.status(500).jsonp({ message: 'error' });
                return res.jsonp({ message: 'error' });
            }
        });
    }
    //METODO PARA CREAR NIVELES JERARQUICOS POR DEPARTAMENTOS  --**VERIFICADO
    CrearNivelDepa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_departamento, departamento, nivel, dep_nivel, dep_nivel_nombre, id_establecimiento, id_suc_dep_nivel, user_name, ip } = req.body;
                // INICIAR TRANSACCIÓN
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
        INSERT INTO ed_niveles_departamento (departamento, id_departamento, nivel, departamento_nombre_nivel, 
          id_departamento_nivel, id_sucursal, id_sucursal_departamento_nivel ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [departamento, id_departamento, nivel, dep_nivel_nombre, dep_nivel, id_establecimiento, id_suc_dep_nivel]);
                // INSERTAR AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ed_niveles_departamento',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{Departamento: ${departamento}, Nivel: ${nivel}, Departamento Nivel: ${dep_nivel_nombre}}`,
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCIÓN
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCIÓN
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    //METODO PARA BUSCAR NIVELES JERARQUICOS POR DEPARTAMENTO   --**VERIFICADO
    ObtenerNivelesDepa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_departamento, id_establecimiento } = req.params;
            const NIVELESDEP = yield database_1.default.query(`
      SELECT n.*, s.nombre AS suc_nivel
      FROM ed_niveles_departamento AS n, e_sucursales AS s
      WHERE id_departamento = $1 AND id_sucursal = $2 
        AND s.id = n.id_sucursal_departamento_nivel
      ORDER BY nivel DESC 
      `, [id_departamento, id_establecimiento]);
            if (NIVELESDEP.rowCount != 0) {
                return res.jsonp(NIVELESDEP.rows);
            }
            res.status(404).jsonp({ text: 'Registros no encontrados.' });
        });
    }
    // ACTUALIZAR REGISTRO DE NIVEL DE DEPARTAMENTO DE TABLA NIVEL_JERARQUICO   --**VERIFICADO
    ActualizarNivelDepa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCIÓN
                yield database_1.default.query('BEGIN');
                // OBTENER DATOS ANTES DE ACTUALIZAR
                const response = yield database_1.default.query('SELECT * FROM ed_niveles_departamento WHERE id = $1', [id]);
                const datos = response.rows[0];
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ed_niveles_departamento',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        observacion: `Error al actualizar el nivel de departamento con ID: ${id}, Registro no encontrado.`,
                    });
                    // FINALIZAR TRANSACCIÓN
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado' });
                }
                yield database_1.default.query(`
        UPDATE ed_niveles_departamento set nivel = $1 
        WHERE id = $2
        `, [nivel, id]);
                // INSERTAR AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ed_niveles_departamento',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: `{Nivel: ${nivel}}`,
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCIÓN
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCIÓN
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO DE NIVEL DE DEPARTAMENTO   --**VERIFICADO
    EliminarRegistroNivelDepa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCIÓN
                yield database_1.default.query('BEGIN');
                // OBTENER DATOS ANTES DE ELIMINAR
                const response = yield database_1.default.query('SELECT * FROM ed_niveles_departamento WHERE id = $1', [id]);
                const datos = response.rows[0];
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ed_niveles_departamento',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        observacion: `Error al eliminar el nivel de departamento con ID: ${id}`,
                    });
                    // FINALIZAR TRANSACCIÓN
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
        DELETE FROM ed_niveles_departamento WHERE id = $1
        `, [id]);
                // INSERTAR AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ed_niveles_departamento',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: '',
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCIÓN
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCIÓN
                yield database_1.default.query('ROLLBACK');
                //return res.status(500).jsonp({ message: 'error' });
                return res.jsonp({ message: 'error' });
            }
        });
    }
    //METODO PARA CREAR NIVELES JERARQUICOS POR DEPARTAMENTOS  --**VERIFICADO
    ActualizarNombreNivel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_departamento, departamento, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOS ANTES DE ACTUALIZAR
                const response1 = yield database_1.default.query('SELECT * FROM ed_niveles_departamento WHERE id_departamento = $1', [id_departamento]);
                const [datos1] = response1.rows;
                const response2 = yield database_1.default.query('SELECT * FROM ed_niveles_departamento WHERE id_departamento_nivel = $1', [id_departamento]);
                const [datos2] = response2.rows;
                if (datos1) {
                    if (!datos1) {
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'ed_niveles_departamento',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al actualizar el nombre de nivel del departamento con ID: ${id_departamento}. Registro no encontrado.`,
                        });
                        // FINALIZAR TRANSACCIÓN
                        yield database_1.default.query('COMMIT');
                        return res.status(404).jsonp({ message: 'Registro no encontrado' });
                    }
                    else {
                        yield database_1.default.query(`
            UPDATE ed_niveles_departamento SET departamento = $1
            WHERE id_departamento = $2
            `, [departamento, id_departamento]);
                        // INSERTAR AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'ed_niveles_departamento',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(datos1),
                            datosNuevos: `{departamento: ${departamento}}`,
                            ip: ip,
                            observacion: null
                        });
                    }
                }
                if (datos2) {
                    if (!datos2) {
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'ed_niveles_departamento',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al actualizar el nombre de nivel del departamento con ID: ${id_departamento}. Registro no encontrado.`,
                        });
                        // FINALIZAR TRANSACCIÓN
                        yield database_1.default.query('COMMIT');
                        return res.status(404).jsonp({ message: 'Registro no encontrado' });
                    }
                    else {
                        yield database_1.default.query(`
            UPDATE ed_niveles_departamento SET departamento_nombre_nivel = $1
            WHERE id_departamento_nivel = $2
            `, [departamento, id_departamento]);
                        // INSERTAR AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'ed_niveles_departamento',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(datos2),
                            datosNuevos: `{departamento_nombre_nivel: ${departamento}}`,
                            ip: ip,
                            observacion: null
                        });
                    }
                }
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'DEPARTAMENTOS');
            if (verificador === false) {
                return res.jsonp({ message: 'no_existe', data: undefined });
            }
            else {
                const sheet_name_list = workbook.SheetNames;
                const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
                let data = {
                    fila: '',
                    nombre: '',
                    sucursal: '',
                    observacion: ''
                };
                var listDepartamentos = [];
                var duplicados = [];
                var mensaje = 'correcto';
                // LECTURA DE LOS DATOS DE LA PLANTILLA
                plantilla.forEach((dato) => __awaiter(this, void 0, void 0, function* () {
                    var { ITEM, NOMBRE, SUCURSAL } = dato;
                    // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                    if ((ITEM != undefined && ITEM != '') &&
                        (NOMBRE != undefined) && (SUCURSAL != undefined)) {
                        data.fila = ITEM;
                        data.nombre = NOMBRE;
                        data.sucursal = SUCURSAL;
                        data.observacion = 'no registrado';
                        listDepartamentos.push(data);
                    }
                    else {
                        data.fila = ITEM;
                        data.nombre = NOMBRE;
                        data.sucursal = SUCURSAL;
                        data.observacion = 'no registrado';
                        if (data.fila == '' || data.fila == undefined) {
                            data.fila = 'error';
                            mensaje = 'error';
                        }
                        if (NOMBRE == undefined) {
                            data.nombre = 'No registrado';
                            data.observacion = 'Departamento ' + data.observacion;
                        }
                        if (SUCURSAL == undefined) {
                            data.sucursal = 'No registrado';
                            data.observacion = 'Sucursal ' + data.observacion;
                        }
                        listDepartamentos.push(data);
                    }
                    data = {};
                }));
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        // ELIMINAR DEL SERVIDOR
                        fs_1.default.unlinkSync(ruta);
                    }
                });
                listDepartamentos.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    if (item.observacion == 'no registrado') {
                        var VERIFICAR_SUCURSAL = yield database_1.default.query(`
            SELECT * FROM e_sucursales WHERE UPPER(nombre) = $1
            `, [item.sucursal.toUpperCase()]);
                        if (VERIFICAR_SUCURSAL.rows[0] != undefined && VERIFICAR_SUCURSAL.rows[0] != '') {
                            var VERIFICAR_DEPARTAMENTO = yield database_1.default.query(`
              SELECT * FROM ed_departamentos WHERE id_sucursal = $1 AND UPPER(nombre) = $2
              `, [VERIFICAR_SUCURSAL.rows[0].id, item.nombre.toUpperCase()]);
                            if (VERIFICAR_DEPARTAMENTO.rows[0] == undefined || VERIFICAR_DEPARTAMENTO.rows[0] == '') {
                                item.observacion = 'ok';
                            }
                            else {
                                item.observacion = 'Ya existe en el sistema';
                            }
                        }
                        else {
                            item.observacion = 'Sucursal no existe en el sistema';
                        }
                    }
                }));
                setTimeout(() => {
                    listDepartamentos.sort((a, b) => {
                        // COMPARA LOS NUMEROS DE LOS OBJETOS
                        if (a.fila < b.fila) {
                            return -1;
                        }
                        if (a.fila > b.fila) {
                            return 1;
                        }
                        return 0; // SON IGUALES
                    });
                    var filaDuplicada = 0;
                    listDepartamentos.forEach((item) => {
                        // DISCRIMINACION DE ELEMENTOS IGUALES
                        item.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        item.sucursal.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        if (duplicados.find((p) => p.nombre.toLowerCase() === item.nombre.toLowerCase() && p.sucursal.toLowerCase() === item.sucursal.toLowerCase()) == undefined) {
                            duplicados.push(item);
                        }
                        else {
                            item.observacion = 'Registro duplicado';
                        }
                        // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
                        if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                            // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
                            if (item.fila == filaDuplicada) {
                                mensaje = 'error';
                            }
                        }
                        else {
                            return mensaje = 'error';
                        }
                        filaDuplicada = item.fila;
                    });
                    if (mensaje == 'error') {
                        listDepartamentos = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listDepartamentos });
                }, 1000);
            }
        });
    }
    // METODO PARA REGISTRAR DATOS DE DEPARTAMENTOS
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plantilla = req.body;
                //console.log('datos departamento: ', plantilla);
                var contador = 1;
                var respuesta;
                plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                    console.log('data: ', data);
                    // DATOS QUE SE GUARDARAN DE LA PLANTILLA INGRESADA
                    const { nombre, sucursal } = data;
                    const ID_SUCURSAL = yield database_1.default.query(`
          SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1
          `, [sucursal.toUpperCase()]);
                    var id_sucursal = ID_SUCURSAL.rows[0].id;
                    // REGISTRO DE LOS DATOS DE CONTRATOS
                    const response = yield database_1.default.query(`
          INSERT INTO ed_departamentos (nombre, id_sucursal) VALUES ($1, $2) RETURNING *
          `, [nombre.toUpperCase(), id_sucursal]);
                    const [departamento] = response.rows;
                    if (contador === plantilla.length) {
                        if (departamento) {
                            return respuesta = res.status(200).jsonp({ message: 'ok' });
                        }
                        else {
                            return respuesta = res.status(404).jsonp({ message: 'error' });
                        }
                    }
                    contador = contador + 1;
                }));
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    BuscarDepartamentoPorCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_cargo;
            const departamento = yield database_1.default.query(`
      SELECT ec.id_departamento, d.nombre, ec.id AS cargo
      FROM eu_empleado_cargos AS ec, ed_departamentos AS d 
      WHERE d.id = ec.id_departamento AND ec.id = $1
      ORDER BY cargo DESC
      `, [id]);
            if (departamento.rowCount != 0) {
                return res.json([departamento.rows[0]]);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarDepartamentosRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const DEPARTAMENTOS = yield database_1.default.query(`
      SELECT d.id, d.nombre 
      FROM ere_cat_regimenes AS r, eu_empleado_cargos AS ec, eu_empleado_contratos AS c, ed_departamentos AS d 
      WHERE c.id_regimen = r.id AND c.id = ec.id_contrato AND ec.id_departamento = d.id AND r.id = $1 
      GROUP BY d.id, d.nombre
      `, [id]);
            if (DEPARTAMENTOS.rowCount != 0) {
                res.jsonp(DEPARTAMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    RevisarDatosNivel(req, res) {
        var _a;
        try {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'NIVEL_DEPARTAMENTOS');
            if (verificador === false) {
                return res.jsonp({ message: 'no_existe', data: undefined });
            }
            else {
                const sheet_name_list = workbook.SheetNames;
                const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
                console.log('plantilla: ', plantilla);
                let data = {
                    fila: '',
                    sucursal: '',
                    departamento: '',
                    nivel: '',
                    depa_superior: '',
                    sucursal_depa_superior: '',
                    observacion: '',
                };
                // EXPRESION REGULAR PARA VALIDAR EL FORMATO DE SOLO NUMEROS.
                const regex = /^[0-9]+$/;
                var listNivelesDep = [];
                var duplicados = [];
                var mensaje = 'correcto';
                // LECTURA DE LOS DATOS DE LA PLANTILLA
                plantilla.forEach((dato) => __awaiter(this, void 0, void 0, function* () {
                    var { ITEM, SUCURSAL, DEPARTAMENTO, NIVEL, DEPARTAMENTO_SUPERIOR, SUCURSAL_DEPARTAMENTO_SUPERIOR } = dato;
                    if (ITEM != undefined && SUCURSAL != undefined &&
                        DEPARTAMENTO != undefined && NIVEL != undefined &&
                        DEPARTAMENTO_SUPERIOR != undefined && SUCURSAL_DEPARTAMENTO_SUPERIOR != undefined) {
                        data.fila = ITEM;
                        data.sucursal = SUCURSAL;
                        data.departamento = DEPARTAMENTO;
                        data.nivel = NIVEL,
                            data.depa_superior = DEPARTAMENTO_SUPERIOR,
                            data.sucursal_depa_superior = SUCURSAL_DEPARTAMENTO_SUPERIOR,
                            data.observacion = 'no registrada';
                        listNivelesDep.push(data);
                    }
                    else {
                        data.fila = ITEM;
                        data.sucursal = SUCURSAL;
                        data.departamento = DEPARTAMENTO;
                        data.nivel = NIVEL,
                            data.depa_superior = DEPARTAMENTO_SUPERIOR,
                            data.sucursal_depa_superior = SUCURSAL_DEPARTAMENTO_SUPERIOR,
                            data.observacion = 'no registrada';
                        if (data.fila == '' || data.fila == undefined) {
                            data.fila = 'error';
                            mensaje = 'error';
                        }
                        if (SUCURSAL == undefined) {
                            data.sucursal = 'No registrado';
                            data.observacion = 'Sucursal ' + data.observacion;
                        }
                        if (DEPARTAMENTO == undefined) {
                            data.departamento = 'No registrado';
                            data.observacion = 'Departamento ' + data.observacion;
                        }
                        if (NIVEL == undefined) {
                            data.nivel = 'No registrado';
                            data.observacion = 'Nivel ' + data.observacion;
                        }
                        if (DEPARTAMENTO_SUPERIOR == undefined) {
                            data.depa_superior = 'No registrado';
                            data.observacion = 'Departamento superior ' + data.observacion;
                        }
                        if (SUCURSAL_DEPARTAMENTO_SUPERIOR == undefined) {
                            data.sucursal_depa_superior = 'No registrado';
                            data.observacion = 'Sucursal departamento superior ' + data.observacion;
                        }
                        listNivelesDep.push(data);
                    }
                    data = {};
                }));
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        // ELIMINAR DEL SERVIDOR
                        fs_1.default.unlinkSync(ruta);
                    }
                });
                listNivelesDep.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    if (item.observacion == 'no registrada') {
                        var validSucursal = yield database_1.default.query(`SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1`, [item.sucursal.toUpperCase()]);
                        if (validSucursal.rows[0] != undefined && validSucursal.rows[0] != '') {
                            var validDeparta = yield database_1.default.query(`SELECT * FROM ed_departamentos WHERE UPPER(nombre) = $1`, [item.departamento.toUpperCase()]);
                            if (validDeparta.rows[0] != undefined && validDeparta.rows[0] != '') {
                                if (validSucursal.rows[0].id == validDeparta.rows[0].id_sucursal) {
                                    if (regex.test(item.nivel)) {
                                        if (item.nivel <= 5) {
                                            var validDepSuperior = yield database_1.default.query(`SELECT * FROM ed_departamentos WHERE UPPER(nombre) = $1`, [item.depa_superior.toUpperCase()]);
                                            if (validDepSuperior.rows[0] != undefined && validDepSuperior.rows[0] != '') {
                                                var validSucSuperior = yield database_1.default.query(`SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1`, [item.sucursal_depa_superior.toUpperCase()]);
                                                if (validSucSuperior.rows[0] != undefined && validSucSuperior.rows[0] != '') {
                                                    if (validDepSuperior.rows[0].id_sucursal == validSucSuperior.rows[0].id) {
                                                        var validNivelExiste = yield database_1.default.query(`SELECT * FROM ed_niveles_departamento WHERE UPPER(departamento) = $1
                                    and nivel = $2`, [item.departamento.toUpperCase(), item.nivel]);
                                                        if (validNivelExiste.rows[0] != undefined && validNivelExiste.rows[0] != '') {
                                                            item.observacion = 'Ya existe en el sistema';
                                                        }
                                                        else {
                                                            // Discriminación de elementos iguales
                                                            if (duplicados.find((p) => p.sucursal.toLowerCase() === item.sucursal.toLowerCase() &&
                                                                p.departamento.toLowerCase() === item.departamento.toLowerCase() &&
                                                                p.nivel === item.nivel) == undefined) {
                                                                item.observacion = 'ok';
                                                                duplicados.push(item);
                                                            }
                                                            else {
                                                                item.observacion = '1';
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        item.observacion = 'Departamento no pertenece a la sucursal';
                                                    }
                                                }
                                                else {
                                                    item.observacion = 'Sucursal superior no existe en el sistema';
                                                }
                                            }
                                            else {
                                                item.observacion = 'Departamento superior no existe en el sistema';
                                            }
                                        }
                                        else {
                                            item.observacion = 'El nivel no puede ser mayor a 5';
                                        }
                                    }
                                    else {
                                        item.observacion = 'Nivel incorrecto (solo números)';
                                    }
                                }
                                else {
                                    item.observacion = 'Departamento no pertenece al establecimiento';
                                }
                            }
                            else {
                                item.observacion = 'Departamento no pertenece al establecimiento';
                            }
                        }
                        else {
                            item.observacion = 'Departamento no existe en el sistema';
                        }
                    }
                    else {
                        item.observacion = 'Sucursal no existe en el sistema';
                    }
                }));
                var tiempo = 1500;
                if (listNivelesDep.length > 500 && listNivelesDep.length <= 1000) {
                    tiempo = 3000;
                }
                else if (listNivelesDep.length > 1000) {
                    tiempo = 6000;
                }
                setTimeout(() => {
                    listNivelesDep.sort((a, b) => {
                        // COMPARA LOS NUMEROS DE LOS OBJETOS
                        if (a.fila < b.fila) {
                            return -1;
                        }
                        if (a.fila > b.fila) {
                            return 1;
                        }
                        return 0; // SON IGUALES
                    });
                    var filaDuplicada = 0;
                    console.log('plantilla: ', listNivelesDep);
                    // VALIDACIONES DE LOS DATOS
                    listNivelesDep.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                        if (item.observacion == '1') {
                            item.observacion = 'Registro duplicado';
                        }
                        else {
                        }
                        // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
                        if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                            // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
                            if (item.fila == filaDuplicada) {
                                mensaje = 'error';
                            }
                        }
                        else {
                            return mensaje = 'error';
                        }
                        filaDuplicada = item.fila;
                    }));
                    if (mensaje == 'error') {
                        listNivelesDep = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listNivelesDep });
                }, tiempo);
            }
        }
        catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }
    CargarPlantillaNivelesDep(req, res) {
        try {
            const plantilla = req.body;
            console.log('datos departamento: ', plantilla);
            var contador = 1;
            var respuesta;
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                console.log('data: ', data);
                // Datos que se guardaran de la plantilla ingresada
                const { fila, sucursal, departamento, nivel, depa_superior, sucursal_depa_superior, observacion } = data;
                var validSucursal = yield database_1.default.query(`SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1`, [sucursal.toUpperCase()]);
                var validDeparta = yield database_1.default.query(`SELECT id FROM ed_departamentos WHERE UPPER(nombre) = $1`, [departamento.toUpperCase()]);
                var validDepSuperior = yield database_1.default.query(`SELECT id FROM ed_departamentos WHERE UPPER(nombre) = $1`, [depa_superior.toUpperCase()]);
                var validSucSuperior = yield database_1.default.query(`SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1`, [sucursal_depa_superior.toUpperCase()]);
                //Variables de id de almacenamiento
                var id_sucursal = validSucursal.rows[0].id;
                var id_departamento = validDeparta.rows[0].id;
                var id_sucuDepSuperior = validDepSuperior.rows[0].id;
                var id_depaDepSuperior = validSucSuperior.rows[0].id;
                // Registro de los datos de contratos
                const response = yield database_1.default.query(`INSERT INTO ed_niveles_departamento (id_sucursal, id_departamento, departamento, nivel, id_departamento_nivel, departamento_nombre_nivel, id_sucursal_departamento_nivel) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
          `, [id_sucursal, id_departamento, departamento, nivel, id_sucuDepSuperior, depa_superior, id_depaDepSuperior]);
                const [depaNivel] = response.rows;
                if (contador === plantilla.length) {
                    if (depaNivel) {
                        return respuesta = res.status(200).jsonp({ message: 'ok' });
                    }
                    else {
                        return respuesta = res.status(404).jsonp({ message: 'error' });
                    }
                }
                contador = contador + 1;
            }));
        }
        catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }
}
exports.DEPARTAMENTO_CONTROLADOR = new DepartamentoControlador();
exports.default = exports.DEPARTAMENTO_CONTROLADOR;
