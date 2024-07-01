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
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
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
            if (RELOJES.rowCount != 0) {
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
                console.log('ver req.body ', req.body);
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                var VERIFICAR_CODIGO;
                if (serie === '') {
                    VERIFICAR_CODIGO = yield database_1.default.query(`
                    SELECT * FROM ed_relojes WHERE UPPER(codigo) = $1
                    `, [codigo.toUpperCase()]);
                }
                else {
                    VERIFICAR_CODIGO = yield database_1.default.query(`
                    SELECT * FROM ed_relojes WHERE UPPER(codigo) = $1 OR UPPER(serie) = $2
                    `, [codigo.toUpperCase(), serie.toUpperCase()]);
                }
                console.log('ver rows ', VERIFICAR_CODIGO.rows);
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
                        tabla: 'ed_relojes',
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
                else {
                    return res.jsonp({ message: 'existe' });
                }
            }
            catch (error) {
                console.log('error ', error);
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
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
            if (RELOJES.rowCount != 0) {
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
                const reloj = yield database_1.default.query(`
                SELECT * FROM ed_relojes WHERE id = $1
                `, [id_real]);
                const [datosOriginales] = reloj.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ed_relojes',
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
                var VERIFICA_CODIGO;
                if (serie === '') {
                    VERIFICA_CODIGO = yield database_1.default.query(`
                    SELECT * FROM ed_relojes WHERE UPPER(codigo) = $1 AND NOT id = $3
                    `, [codigo.toUpperCase(), id_real]);
                }
                else {
                    VERIFICA_CODIGO = yield database_1.default.query(`
                    SELECT * FROM ed_relojes WHERE (UPPER(codigo) = $1 OR UPPER(serie) = $2) AND NOT id = $3
                    `, [codigo.toUpperCase(), serie.toUpperCase(), id_real]);
                }
                if (VERIFICA_CODIGO.rows[0] == undefined || VERIFICA_CODIGO.rows[0] == '') {
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
                        datosNuevos: `{"nombre": "${nombre}", "ip": "${ip}", "puerto": "${puerto}", "contrasenia": "${contrasenia}", "marca": "${marca}", "modelo": "${modelo}", "serie": "${serie}", "id_fabricacion": "${id_fabricacion}", "fabricante": "${fabricante}", "mac": "${mac}", "tiene_funciones": "${tien_funciones}", "id_sucursal": "${id_sucursal}", "id_departamento": "${id_departamento}", "codigo": "${codigo}", "numero_accion": "${numero_accion}"}`,
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
                return res.jsonp({ message: 'error' });
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
            if (RELOJES.rowCount != 0) {
                return res.jsonp(RELOJES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
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
                if (VERIFICAR_SUCURSAL.rowCount != 0) {
                    contarSucursal = contarSucursal + 1;
                    // Verificar que el departamento exista dentro del sistema
                    const VERIFICAR_DEPARTAMENTO = yield database_1.default.query(`
                    SELECT id FROM ed_departamentos WHERE UPPER(nombre) = $1 AND id_sucursal = $2
                    `, [departamento.toUpperCase(), VERIFICAR_SUCURSAL.rows[0]['id']]);
                    if (VERIFICAR_DEPARTAMENTO.rowCount != 0) {
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
            var _a;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = xlsx_1.default.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'BIOMETRICOS');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.SheetNames;
                    const plantilla_dispositivos = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
                    let data = {
                        fila: '',
                        establecimiento: '',
                        departamento: '',
                        nombre_dispo: '',
                        codigo: '',
                        direccion_ip: '',
                        puerto: '',
                        acciones: '',
                        numero_acciones: '',
                        marca: '',
                        modelo: '',
                        id_fabricante: '',
                        fabricante: '',
                        numero_serie: '',
                        direccion_mac: '',
                        contrasena: '',
                        observacion: ''
                    };
                    var listDispositivos = [];
                    var duplicados = [];
                    var duplicados1 = [];
                    var duplicados2 = [];
                    var duplicados3 = [];
                    var mensaje = 'correcto';
                    //Exprecion regular para validar el formato de una IPv4.
                    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
                    //Exprecion regular para validar el formato de una direccion mac
                    const direccMac = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^[0-9A-Fa-f]{12}$/;
                    //Exprecion regular para validar el formato de solo números.
                    const regex = /^[0-9]+$/;
                    // LECTURA DE LOS DATOS DE LA PLANTILLA
                    plantilla_dispositivos.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                        var { ITEM, ESTABLECIMIENTO, DEPARTAMENTO, NOMBRE_DISPOSITIVO, CODIGO, DIRECCION_IP, PUERTO, ACCIONES, NUMERO_ACCIONES, MARCA, MODELO, ID_FABRICANTE, FABRICANTE, NUMERO_SERIE, DIRECCION_MAC, CONTRASENA } = dato;
                        // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                        if ((ITEM != undefined && ITEM != '') && (ESTABLECIMIENTO != undefined && ESTABLECIMIENTO != '') &&
                            (DEPARTAMENTO != undefined && DEPARTAMENTO != '') && (NOMBRE_DISPOSITIVO != undefined && NOMBRE_DISPOSITIVO != '') &&
                            (CODIGO != undefined && CODIGO != '') && (DIRECCION_IP != undefined && DIRECCION_IP != '') &&
                            (PUERTO != undefined && PUERTO != '') && (ACCIONES != undefined && ACCIONES != '') &&
                            (NUMERO_ACCIONES != undefined && NUMERO_ACCIONES != '') && (MARCA != undefined && MARCA != '') &&
                            (MODELO != undefined && MODELO != '') && (ID_FABRICANTE != undefined && ID_FABRICANTE != '') &&
                            (FABRICANTE != undefined && FABRICANTE != '') && (NUMERO_SERIE != undefined && NUMERO_SERIE != '') &&
                            (DIRECCION_MAC != undefined && DIRECCION_MAC != '') && (CONTRASENA != undefined && CONTRASENA != '')) {
                            data.fila = ITEM;
                            data.establecimiento = ESTABLECIMIENTO;
                            data.departamento = DEPARTAMENTO;
                            data.nombre_dispo = NOMBRE_DISPOSITIVO;
                            data.codigo = CODIGO;
                            data.direccion_ip = DIRECCION_IP;
                            data.puerto = PUERTO;
                            data.acciones = ACCIONES;
                            data.numero_acciones = NUMERO_ACCIONES;
                            data.marca = MARCA;
                            data.modelo = MODELO;
                            data.id_fabricante = ID_FABRICANTE;
                            data.fabricante = FABRICANTE;
                            data.numero_serie = NUMERO_SERIE;
                            data.direccion_mac = DIRECCION_MAC;
                            data.contrasena = CONTRASENA;
                            data.observacion = 'no registrado';
                            // DISCRIMINACION DE ELEMENTOS IGUALES CODIGO
                            if (duplicados.find((p) => p.codigo === data.codigo) == undefined) {
                                // DISCRIMINACIÓN DE ELEMENTOS IGUALES DIRECCION IP
                                if (duplicados1.find((a) => a.direccion_ip === data.direccion_ip) == undefined) {
                                    // DISCRIMINACIÓN DE ELEMENTOS IGUALES NUMERO DE SERIE
                                    if (duplicados2.find((b) => b.numero_serie === data.numero_serie) == undefined) {
                                        // DISCRIMINACIÓN DE ELEMENTOS IGUALES DIRECCION MAC
                                        if (duplicados3.find((c) => c.direccion_mac === data.direccion_mac) == undefined) {
                                            duplicados3.push(data);
                                        }
                                        else {
                                            data.observacion = '4';
                                        }
                                        duplicados2.push(data);
                                    }
                                    else {
                                        data.observacion = '3';
                                    }
                                    duplicados1.push(data);
                                }
                                else {
                                    data.observacion = '2';
                                }
                                duplicados.push(data);
                            }
                            else {
                                data.observacion = '1';
                            }
                            listDispositivos.push(data);
                        }
                        else {
                            data.fila = ITEM;
                            data.establecimiento = ESTABLECIMIENTO;
                            data.departamento = DEPARTAMENTO;
                            data.nombre_dispo = NOMBRE_DISPOSITIVO;
                            data.codigo = CODIGO;
                            data.direccion_ip = DIRECCION_IP;
                            data.puerto = PUERTO;
                            data.acciones = ACCIONES;
                            data.numero_acciones = NUMERO_ACCIONES;
                            data.marca = MARCA;
                            data.modelo = MODELO;
                            data.id_fabricante = ID_FABRICANTE;
                            data.fabricante = FABRICANTE;
                            data.numero_serie = NUMERO_SERIE;
                            data.direccion_mac = DIRECCION_MAC;
                            data.contrasena = CONTRASENA;
                            data.observacion = 'no registrado';
                            if (data.fila == '' || data.fila == undefined) {
                                data.fila = 'error';
                                mensaje = 'error';
                            }
                            if (ESTABLECIMIENTO == undefined) {
                                data.establecimiento = 'No registrado';
                                data.observacion = 'Establecimiento ' + data.observacion;
                            }
                            if (DEPARTAMENTO == undefined) {
                                data.departamento = 'No registrado';
                                data.observacion = 'Departamento ' + data.observacion;
                            }
                            if (NOMBRE_DISPOSITIVO == undefined) {
                                data.nombre_dispo = 'No registrado';
                                data.observacion = 'Nombre dispositivo ' + data.observacion;
                            }
                            if (CODIGO == undefined) {
                                data.codigo = 'No registrado';
                                data.observacion = 'Codigo ' + data.observacion;
                            }
                            if (DIRECCION_IP == undefined) {
                                data.direccion_ip = 'No registrado';
                                data.observacion = 'Dirección IP ' + data.observacion;
                            }
                            if (PUERTO == undefined) {
                                data.puerto = 'No registrado';
                                data.observacion = 'Puerto ' + data.observacion;
                            }
                            if (ACCIONES == undefined) {
                                data.acciones = 'No registrado';
                                data.observacion = 'Acciones ' + data.observacion;
                            }
                            if (NUMERO_ACCIONES == undefined) {
                                data.numero_acciones = ' - ';
                            }
                            if (MARCA == undefined) {
                                data.marca = ' - ';
                            }
                            if (MODELO == undefined) {
                                data.modelo = ' - ';
                            }
                            if (ID_FABRICANTE == undefined) {
                                data.id_fabricante = ' - ';
                            }
                            if (FABRICANTE == undefined) {
                                data.fabricante = ' - ';
                            }
                            if (NUMERO_SERIE == undefined) {
                                data.numero_serie = ' - ';
                            }
                            if (DIRECCION_MAC == undefined) {
                                data.direccion_mac = ' - ';
                            }
                            if (CONTRASENA == undefined) {
                                data.contrasena = ' - ';
                            }
                            if (data.codigo != 'No registrado' && data.direccion_ip != 'No registrado') {
                                // DISCRIMINACION DE ELEMENTOS IGUALES CODIGO
                                if (duplicados.find((p) => p.codigo === data.codigo) == undefined) {
                                    // DISCRIMINACIÓN DE ELEMENTOS IGUALES DIRECCION IP
                                    if (duplicados1.find((a) => a.direccion_ip === data.direccion_ip) == undefined) {
                                        if (data.numero_serie != ' - ') {
                                            // DISCRIMINACIÓN DE ELEMENTOS IGUALES NUMERO DE SERIE
                                            if (duplicados2.find((b) => b.numero_serie === data.numero_serie) == undefined) {
                                                duplicados2.push(data);
                                            }
                                            else {
                                                data.observacion = '3';
                                            }
                                        }
                                        if (data.direccion_mac != ' - ') {
                                            // DISCRIMINACIÓN DE ELEMENTOS IGUALES DIRECCION MAC
                                            if (duplicados3.find((c) => c.direccion_mac === data.direccion_mac) == undefined) {
                                                duplicados3.push(data);
                                            }
                                            else {
                                                data.observacion = '4';
                                            }
                                        }
                                        duplicados1.push(data);
                                    }
                                    else {
                                        data.observacion = '2';
                                    }
                                    duplicados.push(data);
                                }
                                else {
                                    data.observacion = '1';
                                }
                            }
                            listDispositivos.push(data);
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
                    listDispositivos.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                        if (item.observacion == 'no registrado' || item.observacion == '1' ||
                            item.observacion == '2' || item.observacion == '3' || item.observacion == '4') {
                            var validEstablecimiento = yield database_1.default.query(`SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1`, [item.establecimiento.toUpperCase()]);
                            if (validEstablecimiento.rows[0] != undefined && validEstablecimiento.rows[0] != '') {
                                var validDeparta = yield database_1.default.query(`SELECT * FROM ed_departamentos WHERE UPPER(nombre) = $1`, [item.departamento.toUpperCase()]);
                                if (validDeparta.rows[0] != undefined && validDeparta.rows[0] != '') {
                                    if (validEstablecimiento.rows[0].id == validDeparta.rows[0].id_sucursal) {
                                        var validCodigo = yield database_1.default.query(`SELECT * FROM ed_relojes WHERE codigo = $1`, [item.codigo]);
                                        if (validCodigo.rows[0] == undefined || validCodigo.rows[0] == '') {
                                            if (ipv4Regex.test(item.direccion_ip.toString())) {
                                                var validDireccIP = yield database_1.default.query(`SELECT * FROM ed_relojes WHERE ip = $1`, [item.direccion_ip]);
                                                if (validDireccIP.rows[0] == undefined || validDireccIP.rows[0] == '') {
                                                    if (regex.test(item.puerto)) {
                                                        if (item.puerto.toString().length > 6) {
                                                            item.observacion = 'El puerto debe ser de 6 dígitos';
                                                        }
                                                        else {
                                                            if (item.acciones.toString().toLowerCase() == 'si' || item.acciones.toString().toLowerCase() == 'no') {
                                                                if (item.acciones.toString().toLowerCase() == 'si') {
                                                                    if (item.numero_acciones != ' - ') {
                                                                        if (!regex.test(item.numero_acciones)) {
                                                                            item.observacion = 'Número de acciones incorrecta ingrese (solo números)';
                                                                        }
                                                                        else {
                                                                            if (item.numero_acciones < 1 || item.numero_acciones > 8) {
                                                                                item.observacion = 'El número de acciones no debe ser mayor 8 ni 0';
                                                                            }
                                                                        }
                                                                    }
                                                                    else {
                                                                        item.observacion = 'Debe ingresar acciones';
                                                                    }
                                                                }
                                                                if (item.numero_serie != ' - ') {
                                                                    var VERIFICAR_SERIE = yield database_1.default.query(`SELECT id FROM ed_relojes WHERE serie = $1`, [item.numero_serie]);
                                                                    if (VERIFICAR_SERIE.rows[0] != undefined && VERIFICAR_SERIE.rows[0] != '') {
                                                                        item.observacion = 'Número de serie ya existe en la base';
                                                                    }
                                                                }
                                                                if (item.direccion_mac != ' - ') {
                                                                    var VERIFICAR_MAC = yield database_1.default.query(`SELECT id FROM ed_relojes WHERE mac = $1`, [item.direccion_mac]);
                                                                    if (VERIFICAR_MAC.rows[0] != undefined && VERIFICAR_MAC.rows[0] != '') {
                                                                        item.observacion = 'Dirección MAC ya existe en la base';
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                item.observacion = 'Acción incorrecta ingrese (SI / NO)';
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        item.observacion = 'Puerto incorrecto (solo números)';
                                                    }
                                                }
                                                else {
                                                    item.observacion = 'Ya existe en el sistema';
                                                }
                                            }
                                            else {
                                                item.observacion = 'Dirección IP incorrecta';
                                            }
                                        }
                                        else {
                                            item.observacion = 'Ya existe en el sistema';
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
                                item.observacion = 'Establecimiento no existe en el sistema';
                            }
                        }
                    }));
                    var tiempo = 2000;
                    if (listDispositivos.length > 500 && listDispositivos.length <= 1000) {
                        tiempo = 4000;
                    }
                    else if (listDispositivos.length > 1000) {
                        tiempo = 7000;
                    }
                    setTimeout(() => {
                        listDispositivos.sort((a, b) => {
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
                        //VALIDACIONES DE LOS DATOS
                        listDispositivos.forEach((item) => {
                            if (item.direccion_mac != ' - ') {
                                if (direccMac.test(item.direccion_mac.toString())) {
                                }
                                else {
                                    item.observacion = 'Formato de dirección MAC incorrecta (numeración hexadecimal)';
                                }
                            }
                            if (item.observacion != undefined) {
                                let arrayObservacion = item.observacion.split(" ");
                                if (arrayObservacion[0] == 'no' || item.observacion == " ") {
                                    item.observacion = 'ok';
                                }
                                if (item.observacion == '1') {
                                    item.observacion = 'Registro duplicado (código)';
                                }
                                else if (item.observacion == '2') {
                                    item.observacion = 'Registro duplicado (dirección IP)';
                                }
                                else if (item.observacion == '3') {
                                    item.observacion = 'Registro duplicado (numero de serie)';
                                }
                                else if (item.observacion == '4') {
                                    item.observacion = 'Registro duplicado (dirección mac)';
                                }
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
                            listDispositivos = undefined;
                        }
                        return res.jsonp({ message: mensaje, data: listDispositivos });
                    }, tiempo);
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    CargaPlantillaRelojes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { plantilla, user_name, ip } = req.body;
                console.log('plantilla: ', plantilla.length);
                var contador = 1;
                var respuesta;
                plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                    // DATOS DE LA PLANTILLA INGRESADA
                    const { establecimiento, departamento, nombre_dispo, codigo, direccion_ip, puerto, acciones, numero_acciones, marca, modelo, id_fabricante, fabricante, numero_serie, direccion_mac, contrasena } = data;
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // BUSCAR ID DE LA SUCURSAL INGRESADA
                    const id_sucursal = yield database_1.default.query('SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1', [establecimiento.toUpperCase()]);
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
                            ip: ip,
                            observacion: `Error al guardar el reloj con nombre: ${nombre_dispo} e ip: ${ip}.`
                        });
                    }
                    // VERIFICAR QUE SE HAYA INGRESADO NÚMERO DE ACCIONES SI EL DISPOSITIVO LAS TIENE
                    var num_accion;
                    var acciones_boolean;
                    if (acciones.toLowerCase() === 'si') {
                        num_accion = numero_acciones;
                        acciones_boolean = true;
                    }
                    else {
                        num_accion = 0;
                        acciones_boolean = false;
                    }
                    // REGISTRO DE LOS DATOS DE MODLAIDAD LABORAL
                    const response = yield database_1.default.query(`
                        INSERT INTO ed_relojes (id_sucursal, id_departamento, nombre, ip, puerto, contrasenia, marca, modelo, serie, 
                            id_fabricacion, fabricante, mac, tiene_funciones, numero_accion, codigo) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *
                        `, [id_sucursal.rows[0]['id'], id_departamento.rows[0]['id'], nombre_dispo, direccion_ip, puerto, contrasena, marca,
                        modelo, numero_serie, id_fabricante, fabricante, direccion_mac, acciones_boolean, num_accion, codigo]);
                    const [reloj_ingre] = response.rows;
                    console.log('response.rows: ', response.rows);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ed_relojes',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{"nombre": "${nombre_dispo}", "ip": "${direccion_ip}", "puerto": "${puerto}", "contrasenia": "${contrasena}", "marca": "${marca}", "modelo": "${modelo}", "serie": "${numero_serie}", "id_fabricacion": "${id_fabricante}", "fabricante": "${fabricante}", "mac": "${direccion_mac}", "tien_funciones": "${acciones_boolean}", "id_sucursal": "${id_sucursal.rows[0]['id']}", "id_departamento": "${id_departamento.rows[0]['id']}", "id": "${codigo}", "numero_accion": "${num_accion}"}`,
                        ip: ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    console.log('contador: ', contador, ' plantilla: ', plantilla.length);
                    if (contador === plantilla.length) {
                        console.log('reloj: ', reloj_ingre);
                        if (reloj_ingre) {
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
                // ROLLBACK SI HAY ERROR
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: error });
            }
        });
    }
}
const RELOJES_CONTROLADOR = new RelojesControlador();
exports.default = RELOJES_CONTROLADOR;
