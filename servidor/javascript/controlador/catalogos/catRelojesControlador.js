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
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const xlsx_1 = __importDefault(require("xlsx"));
const database_1 = __importDefault(require("../../database"));
const fs_1 = __importDefault(require("fs"));
class RelojesControlador {
    // METODO PARA BUSCAR DISPOSITIVOS
    ListarRelojes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const RELOJES = yield database_1.default.query(`
            SELECT cr.id, cr.codigo, cr.nombre, cr.ip, cr.puerto, cr.contrasenia, cr.marca, cr.modelo, cr.serie,
                cr.id_fabricacion, cr.fabricante, cr.mac, cr.tiene_funciones, cr.id_sucursal, 
                cr.id_departamento, cr.numero_accion, cd.nombre AS nomdepar, s.nombre AS nomsucursal, 
                e.nombre AS nomempresa, c.descripcion AS nomciudad
            FROM ed_relojes cr, ed_departamentos cd, e_sucursales s, e_ciudades c, e_empresa e
            WHERE cr.id_departamento = cd.id AND cd.id_sucursal = cr.id_sucursal AND 
                cr.id_sucursal = s.id AND s.id_empresa = e.id AND s.id_ciudad = c.id;
            `);
            if (RELOJES.rowCount > 0) {
                return res.jsonp(RELOJES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const reloj = yield database_1.default.query('SELECT * FROM ed_relojes WHERE id = $1', [id]);
                const [datosOriginales] = reloj.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ed_relojes',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.jsonp({ message: `Error al eliminar registro con id ${id}. Registro no encontrado` });
                }
                yield database_1.default.query(`
                DELETE FROM ed_relojes WHERE id = $1
                `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ed_relojes',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA REGISTRAR DISPOSITIVO
    CrearRelojes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, ip, puerto, contrasenia, marca, modelo, serie, id_fabricacion, fabricante, mac, tien_funciones, id_sucursal, id_departamento, codigo, numero_accion, user_name, user_ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                var VERIFICAR_CODIGO = yield database_1.default.query(`
                SELECT * FROM ed_relojes WHERE UPPER(codigo) = $1
                `, [codigo.toUpperCase()]);
                if (VERIFICAR_CODIGO.rows[0] == undefined || VERIFICAR_CODIGO.rows[0] == '') {
                    const response = yield database_1.default.query(`
                    INSERT INTO ed_relojes (nombre, ip, puerto, contrasenia, marca, modelo, serie, 
                        id_fabricacion, fabricante, mac, tiene_funciones, id_sucursal, id_departamento, codigo, 
                        numero_accion )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *
                    `, [nombre, ip, puerto, contrasenia, marca, modelo, serie, id_fabricacion, fabricante, mac,
                        tien_funciones, id_sucursal, id_departamento, codigo, numero_accion]);
                    const [reloj] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'cg_relojes',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(reloj),
                        ip: user_ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (reloj) {
                        return res.status(200).jsonp({ message: 'guardado', reloj: reloj });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'mal_registro' });
                    }
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO PARA VER DATOS DE UN DISPOSITIVO
    ListarUnReloj(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const RELOJES = yield database_1.default.query(`
            SELECT * FROM ed_relojes WHERE id = $1
            `, [id]);
            if (RELOJES.rowCount > 0) {
                return res.jsonp(RELOJES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO
    ActualizarReloj(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, ip, puerto, contrasenia, marca, modelo, serie, id_fabricacion, fabricante, mac, tien_funciones, id_sucursal, id_departamento, codigo, numero_accion, id_real, user_name, user_ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const reloj = yield database_1.default.query('SELECT * FROM cg_relojes WHERE codigo = $1', [codigo]);
                const [datosOriginales] = reloj.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'cg_relojes',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: user_ip,
                        observacion: `Error al actualizar el registro con id: ${codigo}.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                var VERIFICAR_DISCAPACIDAD = yield database_1.default.query(`
                SELECT * FROM ed_relojes WHERE UPPER(codigo) = $1 AND NOT id = $2
                `, [codigo.toUpperCase(), id_real]);
                if (VERIFICAR_DISCAPACIDAD.rows[0] == undefined || VERIFICAR_DISCAPACIDAD.rows[0] == '') {
                    yield database_1.default.query(`
                    UPDATE ed_relojes SET nombre = $1, ip = $2, puerto = $3, contrasenia = $4, marca = $5, 
                        modelo = $6, serie = $7, id_fabricacion = $8, fabricante = $9, mac = $10, 
                        tiene_funciones = $11, id_sucursal = $12, id_departamento = $13, codigo = $14, 
                        numero_accion = $15 
                    WHERE id = $16
                    `, [nombre, ip, puerto, contrasenia, marca, modelo, serie, id_fabricacion, fabricante, mac,
                        tien_funciones, id_sucursal, id_departamento, codigo, numero_accion, id_real]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ed_relojes',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: JSON.stringify(datosOriginales),
                        datosNuevos: `{"nombre": "${nombre}", "ip": "${ip}", "puerto": "${puerto}", "contrasenia": "${contrasenia}", "marca": "${marca}", "modelo": "${modelo}", "serie": "${serie}", "id_fabricacion": "${id_fabricacion}", "fabricante": "${fabricante}", "mac": "${mac}", "tien_funciones": "${tien_funciones}", "id_sucursal": "${id_sucursal}", "id_departamento": "${id_departamento}", "codigo": "${codigo}", "numero_accion": "${numero_accion}"}`,
                        ip: user_ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.jsonp({ message: 'actualizado' });
                }
                else {
                    return res.jsonp({ message: 'existe' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA CONSULTAR DATOS GENERALES DE DISPOSITIVO
    ListarDatosUnReloj(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const RELOJES = yield database_1.default.query(`
            SELECT cr.id, cr.codigo, cr.nombre, cr.ip, cr.puerto, cr.contrasenia, cr.marca, cr.modelo, cr.serie,
                cr.id_fabricacion, cr.fabricante, cr.mac, cr.tiene_funciones, cr.id_sucursal, 
                cr.id_departamento, cr.numero_accion, cd.nombre AS nomdepar, s.nombre AS nomsucursal,
                e.nombre AS nomempresa, c.descripcion AS nomciudad
            FROM ed_relojes cr, ed_departamentos cd, e_sucursales s, e_ciudades c, e_empresa e
            WHERE cr.id_departamento = cd.id AND cd.id_sucursal = cr.id_sucursal AND cr.id_sucursal = s.id 
                AND s.id_empresa = e.id AND s.id_ciudad = c.id AND cr.id = $1
            `, [id]);
            if (RELOJES.rowCount > 0) {
                return res.jsonp(RELOJES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    CargaPlantillaRelojes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // DATOS DE LA PLANTILLA INGRESADA
                    const { nombre, ip, puerto, contrasenia, marca, modelo, serie, id_fabricacion, fabricante, mac, tiene_funciones, sucursal, departamento, codigo_reloj, numero_accion, user_name, user_ip } = data;
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // BUSCAR ID DE LA SUCURSAL INGRESADA
                    const id_sucursal = yield database_1.default.query('SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1', [sucursal.toUpperCase()]);
                    const id_departamento = yield database_1.default.query('SELECT id FROM ed_departamentos WHERE UPPER(nombre) = $1 AND ' +
                        'id_sucursal = $2', [departamento.toUpperCase(), id_sucursal.rows[0]['id']]);
                    if (id_sucursal.rowCount === 0 || id_departamento.rowCount === 0) {
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'ed_relojes',
                            usuario: user_name,
                            accion: 'I',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: user_ip,
                            observacion: `Error al guardar el reloj con nombre: ${nombre} e ip: ${ip}.`
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        return;
                    }
                    // VERIFICAR QUE SE HAYA INGRESADO NÚMERO DE ACCIONES SI EL DISPOSITIVO LAS TIENE
                    if (tiene_funciones === true) {
                        var accion = numero_accion;
                    }
                    else {
                        accion = 0;
                    }
                    yield database_1.default.query(`
                    INSERT INTO ed_relojes (nombre, ip, puerto, contrasenia, marca, modelo, serie, 
                        id_fabricacion, fabricante, mac, tiene_funciones, id_sucursal, id_departamento, id, numero_accion) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                    `, [nombre, ip, puerto, contrasenia, marca, modelo, serie, id_fabricacion, fabricante, mac,
                        tiene_funciones, id_sucursal.rows[0]['id'], id_departamento.rows[0]['id'], codigo_reloj, accion]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'cg_relojes',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{"nombre": "${nombre}", "ip": "${ip}", "puerto": "${puerto}", "contrasenia": "${contrasenia}", "marca": "${marca}", "modelo": "${modelo}", "serie": "${serie}", "id_fabricacion": "${id_fabricacion}", "fabricante": "${fabricante}", "mac": "${mac}", "tien_funciones": "${tiene_funciones}", "id_sucursal": "${id_sucursal.rows[0]['id']}", "id_departamento": "${id_departamento.rows[0]['id']}", "id": "${codigo_reloj}", "numero_accion": "${accion}"}`,
                        ip: user_ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    res.jsonp({ message: 'correcto' });
                }
                catch (error) {
                    // REVERTIR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    return;
                }
            }));
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    // ELIMINAR DEL SERVIDOR
                    fs_1.default.unlinkSync(filePath);
                }
            });
        });
    }
    VerificarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            var contarNombre = 0;
            var contarAccion = 0;
            var contarCodigo = 0;
            var contarIP = 0;
            var contarSucursal = 0;
            var contarDepartamento = 0;
            var contarLlenos = 0;
            var contador = 1;
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                // Datos que se leen de la plantilla ingresada
                const { nombre, ip, puerto, contrasenia, marca, modelo, serie, id_fabricacion, fabricante, mac, tiene_funciones, sucursal, departamento, codigo_reloj, numero_accion } = data;
                //Verificar que los datos obligatorios no esten vacios
                if (nombre != undefined && ip != undefined && puerto != undefined && sucursal != undefined &&
                    departamento != undefined && tiene_funciones != undefined && codigo_reloj != undefined) {
                    contarLlenos = contarLlenos + 1;
                }
                //Verificar que el codigo no se encuentre registrado
                const VERIFICAR_CODIGO = yield database_1.default.query(`
                SELECT * FROM ed_relojes WHERE id = $1
                `, [codigo_reloj]);
                if (VERIFICAR_CODIGO.rowCount === 0) {
                    contarCodigo = contarCodigo + 1;
                }
                //Verificar que el nombre del equipo no se encuentre registrado
                const VERIFICAR_NOMBRE = yield database_1.default.query(`
                SELECT * FROM ed_relojes WHERE UPPER(nombre) = $1
                `, [nombre.toUpperCase()]);
                if (VERIFICAR_NOMBRE.rowCount === 0) {
                    contarNombre = contarNombre + 1;
                }
                //Verificar que la IP del dispositivo no se encuentre registrado
                const VERIFICAR_IP = yield database_1.default.query(`
                SELECT * FROM ed_relojes WHERE ip = $1
                `, [ip]);
                if (VERIFICAR_IP.rowCount === 0) {
                    contarIP = contarIP + 1;
                }
                //Verificar que la sucursal exista dentro del sistema
                const VERIFICAR_SUCURSAL = yield database_1.default.query(`
                SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1
                `, [sucursal.toUpperCase()]);
                if (VERIFICAR_SUCURSAL.rowCount > 0) {
                    contarSucursal = contarSucursal + 1;
                    // Verificar que el departamento exista dentro del sistema
                    const VERIFICAR_DEPARTAMENTO = yield database_1.default.query(`
                    SELECT id FROM ed_departamentos WHERE UPPER(nombre) = $1 AND id_sucursal = $2
                    `, [departamento.toUpperCase(), VERIFICAR_SUCURSAL.rows[0]['id']]);
                    if (VERIFICAR_DEPARTAMENTO.rowCount > 0) {
                        contarDepartamento = contarDepartamento + 1;
                    }
                }
                // Verificar que se haya ingresado némero de acciones si el dispositivo las tiene
                if (tiene_funciones === true) {
                    if (numero_accion != undefined || numero_accion != '') {
                        contarAccion = contarAccion + 1;
                    }
                }
                else {
                    contarAccion = contarAccion + 1;
                }
                // Cuando todos los datos han sido leidos verificamos si todos los datos son correctos
                console.log('nombre', contarNombre, plantilla.length, contador);
                console.log('ip', contarIP, plantilla.length, contador);
                console.log('sucursal', contarSucursal, plantilla.length, contador);
                console.log('departamento', contarDepartamento, plantilla.length, contador);
                console.log('llenos', contarLlenos, plantilla.length, contador);
                console.log('codigo', contarCodigo, plantilla.length, contador);
                console.log('accion', contarAccion, plantilla.length, contador);
                if (contador === plantilla.length) {
                    if (contarNombre === plantilla.length && contarIP === plantilla.length &&
                        contarSucursal === plantilla.length && contarLlenos === plantilla.length &&
                        contarDepartamento === plantilla.length && contarCodigo === plantilla.length &&
                        contarAccion === plantilla.length) {
                        return res.jsonp({ message: 'correcto' });
                    }
                    else {
                        return res.jsonp({ message: 'error' });
                    }
                }
                contador = contador + 1;
            }));
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    // ELIMINAR DEL SERVIDOR
                    fs_1.default.unlinkSync(filePath);
                }
            });
        });
    }
    VerificarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            var contarNombreData = 0;
            var contarCodigoData = 0;
            var contarIP_Data = 0;
            var contador_arreglo = 1;
            var arreglos_datos = [];
            //Leer la plantilla para llenar un array con los datos cedula y usuario para verificar que no sean duplicados
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                // Datos que se leen de la plantilla ingresada
                const { nombre, ip, puerto, contrasenia, marca, modelo, serie, id_fabricacion, fabricante, mac, tiene_funciones, sucursal, departamento, codigo_reloj, numero_accion } = data;
                let datos_array = {
                    nombre: nombre,
                    ip: ip,
                    codigo: codigo_reloj
                };
                arreglos_datos.push(datos_array);
            }));
            // Vamos a verificar dentro de arreglo_datos que no se encuentren datos duplicados
            for (var i = 0; i <= arreglos_datos.length - 1; i++) {
                for (var j = 0; j <= arreglos_datos.length - 1; j++) {
                    if (arreglos_datos[i].nombre.toUpperCase() === arreglos_datos[j].nombre.toUpperCase()) {
                        contarNombreData = contarNombreData + 1;
                    }
                    if (arreglos_datos[i].ip === arreglos_datos[j].ip) {
                        contarIP_Data = contarIP_Data + 1;
                    }
                    if (arreglos_datos[i].codigo === arreglos_datos[j].codigo) {
                        contarCodigoData = contarCodigoData + 1;
                    }
                }
                contador_arreglo = contador_arreglo + 1;
            }
            // Cuando todos los datos han sido leidos verificamos si todos los datos son correctos
            console.log('nombre_data', contarNombreData, plantilla.length, contador_arreglo);
            console.log('ip', contarIP_Data, plantilla.length, contador_arreglo);
            if ((contador_arreglo - 1) === plantilla.length) {
                if (contarNombreData === plantilla.length && contarIP_Data === plantilla.length &&
                    contarCodigoData === plantilla.length) {
                    return res.jsonp({ message: 'correcto' });
                }
                else {
                    return res.jsonp({ message: 'error' });
                }
            }
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    // ELIMINAR DEL SERVIDOR
                    fs_1.default.unlinkSync(filePath);
                }
            });
        });
    }
}
const RELOJES_CONTROLADOR = new RelojesControlador();
exports.default = RELOJES_CONTROLADOR;
