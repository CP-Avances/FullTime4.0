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
exports.EMPLEADO_CONTROLADOR = void 0;
// SECCION LIBRERIAS
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const accesoCarpetas_2 = require("../../../libs/accesoCarpetas");
const ts_md5_1 = require("ts-md5");
const moment_1 = __importDefault(require("moment"));
const xlsx_1 = __importDefault(require("xlsx"));
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class EmpleadoControlador {
    /** ** ********************************************************************************************* **
     ** ** **                        MANEJO DE CODIGOS DE USUARIOS                                    ** **
     ** ** ********************************************************************************************* **/
    // BUSQUEDA DE CODIGO DEL EMPLEADO
    ObtenerCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VALOR = yield database_1.default.query(`
      SELECT * FROM e_codigo
      `);
            if (VALOR.rowCount > 0) {
                return res.jsonp(VALOR.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // CREAR CODIGO DE EMPLEADO
    CrearCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, valor, automatico, manual } = req.body;
            yield database_1.default.query(`
      INSERT INTO e_codigo (id, valor, automatico, manual) VALUES ($1, $2, $3, $4)
      `, [id, valor, automatico, manual]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // BUSQUEDA DEL ULTIMO CODIGO REGISTRADO EN EL SISTEMA
    ObtenerMAXCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const VALOR = yield database_1.default.query(`
        SELECT MAX(codigo::BIGINT) AS codigo FROM eu_empleados
        `); //TODO Revisar Instrucción SQL max codigo
                if (VALOR.rowCount > 0) {
                    return res.jsonp(VALOR.rows);
                }
                else {
                    return res.status(404).jsonp({ text: 'Registros no encontrados.' });
                }
            }
            catch (error) {
                return res.status(404).jsonp({ text: 'Error al obtener código máximo.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR INFORMACION DE CODIGOS
    ActualizarCodigoTotal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { valor, automatico, manual, cedula, id } = req.body;
            yield database_1.default.query(`
      UPDATE e_codigo SET valor = $1, automatico = $2, manual = $3 , cedula = $4 WHERE id = $5
      `, [valor, automatico, manual, cedula, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // METODO PARA ACTUALIZAR CODIGO DE EMPLEADO
    ActualizarCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { valor, id } = req.body;
            yield database_1.default.query(`
      UPDATE e_codigo SET valor = $1 WHERE id = $2
      `, [valor, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    /** ** ********************************************************************************************* **
     ** ** **                         MANEJO DE DATOS DE EMPLEADO                                     ** **
     ** ** ********************************************************************************************* **/
    // INGRESAR REGISTRO DE EMPLEADO EN BASE DE DATOS
    InsertarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo } = req.body;
                const response = yield database_1.default.query(`
        INSERT INTO eu_empleados (cedula, apellido, nombre, estado_civil, genero, correo, 
          fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
        `, [cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, domicilio,
                    telefono, id_nacionalidad, codigo]);
                const [empleado] = response.rows;
                if (empleado) {
                    let verificar = 0;
                    // RUTA DE LA CARPETA PRINCIPAL PERMISOS
                    const carpetaPermisos = yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo);
                    // METODO MKDIR PARA CREAR LA CARPETA
                    fs_1.default.mkdir(carpetaPermisos, { recursive: true }, (err) => {
                        if (err) {
                            verificar = 1;
                        }
                        else {
                            verificar = 0;
                        }
                    });
                    // RUTA DE LA CARPETA PRINCIPAL PERMISOS
                    const carpetaImagenes = yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(empleado.id);
                    // METODO MKDIR PARA CREAR LA CARPETA
                    fs_1.default.mkdir(carpetaImagenes, { recursive: true }, (err) => {
                        if (err) {
                            verificar = 1;
                        }
                        else {
                            verificar = 0;
                        }
                    });
                    // RUTA DE LA CARPETA DE ALMACENAMIENTO DE VACUNAS
                    const carpetaVacunas = yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(empleado.id);
                    // METODO MKDIR PARA CREAR LA CARPETA
                    fs_1.default.mkdir(carpetaVacunas, { recursive: true }, (err) => {
                        if (err) {
                            verificar = 1;
                        }
                        else {
                            verificar = 0;
                        }
                    });
                    // RUTA DE LA CARPETA DE ALMACENAMIENTO DE CONTRATOS
                    const carpetaContratos = yield (0, accesoCarpetas_1.ObtenerRutaContrato)(empleado.id);
                    // METODO MKDIR PARA CREAR LA CARPETA
                    fs_1.default.mkdir(carpetaContratos, { recursive: true }, (err) => {
                        if (err) {
                            verificar = 1;
                        }
                        else {
                            verificar = 0;
                        }
                    });
                    // METODO DE VERIFICACION DE CREACION DE DIRECTORIOS
                    if (verificar === 1) {
                        console.error('Error al crear las carpetas.');
                    }
                    else {
                        return res.status(200).jsonp(empleado);
                    }
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // ACTUALIZAR INFORMACION EL EMPLEADO
    EditarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo } = req.body;
                yield database_1.default.query(`
        UPDATE eu_empleados SET cedula = $2, apellido = $3, nombre = $4, estado_civil = $5, 
          genero = $6, correo = $7, fecha_nacimiento = $8, estado = $9, domicilio = $10, 
          telefono = $11, id_nacionalidad = $12, codigo = $13 
        WHERE id = $1 
        `, [id, cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado,
                    domicilio, telefono, id_nacionalidad, codigo]);
                let verificar_permisos = 0;
                // RUTA DE LA CARPETA PERMISOS DEL USUARIO
                const carpetaPermisos = yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo);
                // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
                fs_1.default.access(carpetaPermisos, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                        // METODO MKDIR PARA CREAR LA CARPETA
                        fs_1.default.mkdir(carpetaPermisos, { recursive: true }, (err) => {
                            if (err) {
                                verificar_permisos = 1;
                            }
                            else {
                                verificar_permisos = 0;
                            }
                        });
                    }
                    else {
                        verificar_permisos = 0;
                    }
                });
                let verificar_imagen = 0;
                // RUTA DE LA CARPETA IMAGENES DEL USUARIO
                const carpetaImagenes = yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(id);
                // VERIFICACION DE EXISTENCIA CARPETA IMAGENES DE USUARIO
                fs_1.default.access(carpetaImagenes, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                        // METODO MKDIR PARA CREAR LA CARPETA
                        fs_1.default.mkdir(carpetaImagenes, { recursive: true }, (err) => {
                            if (err) {
                                verificar_imagen = 1;
                            }
                            else {
                                verificar_imagen = 0;
                            }
                        });
                    }
                    else {
                        verificar_imagen = 0;
                    }
                });
                let verificar_vacunas = 0;
                // RUTA DE LA CARPETA VACUNAS DEL USUARIO
                const carpetaVacunas = yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(id);
                // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
                fs_1.default.access(carpetaVacunas, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                        // METODO MKDIR PARA CREAR LA CARPETA
                        fs_1.default.mkdir(carpetaVacunas, { recursive: true }, (err) => {
                            if (err) {
                                verificar_vacunas = 1;
                            }
                            else {
                                verificar_vacunas = 0;
                            }
                        });
                    }
                    else {
                        verificar_vacunas = 0;
                    }
                });
                let verificar_contrato = 0;
                // RUTA DE LA CARPETA CONTRATOS DEL USUARIO
                const carpetaContratos = yield (0, accesoCarpetas_1.ObtenerRutaContrato)(id);
                // VERIFICACION DE EXISTENCIA CARPETA CONTRATOS DE USUARIO
                fs_1.default.access(carpetaContratos, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                        // METODO MKDIR PARA CREAR LA CARPETA
                        fs_1.default.mkdir(carpetaContratos, { recursive: true }, (err) => {
                            if (err) {
                                verificar_contrato = 1;
                            }
                            else {
                                verificar_contrato = 0;
                            }
                        });
                    }
                    else {
                        verificar_contrato = 0;
                    }
                });
                // METODO DE VERIFICACION DE CREACION DE DIRECTORIOS
                if (verificar_permisos === 1 && verificar_imagen === 1 && verificar_vacunas === 1 && verificar_contrato === 1) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de contratos, permisos, imagenes y vacunación del usuario.' });
                }
                else if (verificar_permisos === 1 && verificar_imagen === 0 && verificar_vacunas === 0 && verificar_contrato === 0) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de permisos del usuario.' });
                }
                else if (verificar_permisos === 0 && verificar_imagen === 1 && verificar_vacunas === 0 && verificar_contrato === 0) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de imagenes del usuario.' });
                }
                else if (verificar_permisos === 0 && verificar_imagen === 0 && verificar_vacunas === 1 && verificar_contrato === 0) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de vacunación del usuario.' });
                }
                else if (verificar_permisos === 0 && verificar_imagen === 0 && verificar_vacunas === 1 && verificar_contrato === 1) {
                    res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de contratos del usuario.' });
                }
                else {
                    res.jsonp({ message: 'Registro actualizado.' });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // BUSQUEDA DE UN SOLO EMPLEADO  --**VERIFICADO
    BuscarEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const EMPLEADO = yield database_1.default.query(`
      SELECT * FROM eu_empleados WHERE id = $1
      `, [id]);
            if (EMPLEADO.rowCount > 0) {
                return res.jsonp(EMPLEADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // BUSQUEDA DE INFORMACION ESPECIFICA DE EMPLEADOS
    ListarBusquedaEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleado = yield database_1.default.query(`
      SELECT id, nombre, apellido FROM eu_empleados ORDER BY apellido
      `).then((result) => {
                return result.rows.map((obj) => {
                    return {
                        id: obj.id,
                        empleado: obj.apellido + ' ' + obj.nombre
                    };
                });
            });
            res.jsonp(empleado);
        });
    }
    // LISTAR EMPLEADOS ACTIVOS EN EL SISTEMA
    Listar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleado = yield database_1.default.query(`
      SELECT * FROM eu_empleados WHERE estado = 1 ORDER BY id
      `);
            res.jsonp(empleado.rows);
        });
    }
    // METODO QUE LISTA EMPLEADOS INHABILITADOS
    ListarEmpleadosDesactivados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleado = yield database_1.default.query(`
      SELECT * FROM eu_empleados WHERE estado = 2 ORDER BY id
      `);
            res.jsonp(empleado.rows);
        });
    }
    // METODO PARA INHABILITAR USUARIOS EN EL SISTEMA
    DesactivarMultiplesEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const arrayIdsEmpleados = req.body;
            if (arrayIdsEmpleados.length > 0) {
                arrayIdsEmpleados.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    // 2 => DESACTIVADO O INACTIVO
                    yield database_1.default.query(`
          UPDATE eu_empleados SET estado = 2 WHERE id = $1
          `, [obj])
                        .then((result) => { });
                    // FALSE => YA NO TIENE ACCESO
                    yield database_1.default.query(`
          UPDATE eu_usuarios SET estado = false, app_habilita = false WHERE id_empleado = $1
          `, [obj])
                        .then((result) => { });
                }));
                return res.jsonp({ message: 'Usuarios inhabilitados exitosamente.' });
            }
            return res.jsonp({ message: 'Upss!!! ocurrio un error.' });
        });
    }
    // METODO PARA HABILITAR EMPLEADOS
    ActivarMultiplesEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const arrayIdsEmpleados = req.body;
            if (arrayIdsEmpleados.length > 0) {
                arrayIdsEmpleados.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    // 1 => ACTIVADO
                    yield database_1.default.query(`
          UPDATE eu_empleados SET estado = 1 WHERE id = $1
          `, [obj])
                        .then((result) => { });
                    // TRUE => TIENE ACCESO
                    yield database_1.default.query(`
          UPDATE eu_usuarios SET estado = true, app_habilita = true WHERE id_empleado = $1
          `, [obj])
                        .then((result) => { });
                }));
                return res.jsonp({ message: 'Usuarios habilitados exitosamente.' });
            }
            return res.jsonp({ message: 'Upss!!! ocurrio un error.' });
        });
    }
    // METODO PARA HABILITAR TODA LA INFORMACION DEL EMPLEADO
    ReactivarMultiplesEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const arrayIdsEmpleados = req.body;
            if (arrayIdsEmpleados.length > 0) {
                arrayIdsEmpleados.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    // 1 => ACTIVADO
                    yield database_1.default.query(`
          UPDATE eu_empleados SET estado = 1 WHERE id = $1
          `, [obj])
                        .then((result) => { });
                    // TRUE => TIENE ACCESO
                    yield database_1.default.query(`
          UPDATE eu_usuarios SET estado = true, app_habilita = true WHERE id_empleado = $1
          `, [obj])
                        .then((result) => { });
                    // REVISAR
                    //EstadoHorarioPeriVacacion(obj);
                }));
                return res.jsonp({ message: 'Usuarios habilitados exitosamente.' });
            }
            return res.jsonp({ message: 'Upps!!! ocurrio un error.' });
        });
    }
    // CARGAR IMAGEN DE EMPLEADO
    CrearImagenEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // FECHA DEL SISTEMA
            var fecha = (0, moment_1.default)();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');
            let id = req.params.id_empleado;
            let separador = path_1.default.sep;
            const unEmpleado = yield database_1.default.query(`
      SELECT * FROM eu_empleados WHERE id = $1
      `, [id]);
            if (unEmpleado.rowCount > 0) {
                unEmpleado.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    let imagen = obj.codigo + '_' + anio + '_' + mes + '_' + dia + '_' + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
                    if (obj.imagen != 'null' && obj.imagen != '' && obj.imagen != null) {
                        try {
                            // ELIMINAR IMAGEN DE SERVIDOR
                            let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(obj.id)) + separador + obj.imagen;
                            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                                if (err) {
                                }
                                else {
                                    // ELIMINAR DEL SERVIDOR
                                    fs_1.default.unlinkSync(ruta);
                                }
                            });
                            yield database_1.default.query(`
              UPDATE eu_empleados SET imagen = $2 Where id = $1
              `, [id, imagen]);
                            res.jsonp({ message: 'Imagen actualizada.' });
                        }
                        catch (error) {
                            yield database_1.default.query(`
              UPDATE eu_empleados SET imagen = $2 Where id = $1
              `, [id, imagen]);
                            res.jsonp({ message: 'Imagen actualizada.' });
                        }
                    }
                    else {
                        yield database_1.default.query(`
            UPDATE eu_empleados SET imagen = $2 Where id = $1
            `, [id, imagen]);
                        res.jsonp({ message: 'Imagen actualizada.' });
                    }
                }));
            }
        });
    }
    // METODO PARA TOMAR DATOS DE LA UBICACION DEL DOMICILIO DEL EMPLEADO
    GeolocalizacionCrokis(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let { lat, lng } = req.body;
            console.log(lat, lng, id);
            try {
                yield database_1.default.query(`
        UPDATE eu_empleados SET latitud = $1, longitud = $2 WHERE id = $3
        `, [lat, lng, id])
                    .then((result) => { });
                res.status(200).jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                res.status(400).jsonp({ message: error });
            }
        });
    }
    /** **************************************************************************************** **
     ** **                       MANEJO DE DATOS DE TITULO PROFESIONAL                        ** **
     ** **************************************************************************************** **/
    // BUSQUEDA DE TITULOS PROFESIONALES DEL EMPLEADO
    ObtenerTitulosEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const unEmpleadoTitulo = yield database_1.default.query(`
        SELECT et.id, et.observacion As observaciones, et.id_titulo, 
          et.id_empleado, ct.nombre, nt.nombre as nivel
        FROM eu_empleado_titulos AS et, et_titulos AS ct, et_cat_nivel_titulo AS nt
        WHERE et.id_empleado = $1 and et.id_titulo = ct.id and ct.id_nivel = nt.id
        ORDER BY id
        `, [id_empleado]);
            if (unEmpleadoTitulo.rowCount > 0) {
                return res.jsonp(unEmpleadoTitulo.rows);
            }
            else {
                res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // INGRESAR TITULO PROFESIONAL DEL EMPLEADO
    CrearEmpleadoTitulos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { observacion, id_empleado, id_titulo } = req.body;
            yield database_1.default.query(`
      INSERT INTO eu_empleado_titulos (observacion, id_empleado, id_titulo) VALUES ($1, $2, $3)
      `, [observacion, id_empleado, id_titulo]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // ACTUALIZAR TITULO PROFESIONAL DEL EMPLEADO
    EditarTituloEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_empleado_titulo;
            const { observacion, id_titulo } = req.body;
            yield database_1.default.query(`
      UPDATE eu_empleado_titulos SET observacion = $1, id_titulo = $2 WHERE id = $3
      `, [observacion, id_titulo, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // METODO PARA ELIMINAR TITULO PROFESIONAL DEL EMPLEADO
    EliminarTituloEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_empleado_titulo;
            yield database_1.default.query(`
      DELETE FROM eu_empleado_titulos WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    /** ******************************************************************************************* **
     ** **               CONSULTAS DE COORDENADAS DE UBICACION DEL USUARIO                       ** **
     ** ******************************************************************************************* **/
    // METODO PARA BUSCAR DATOS DE COORDENADAS DE DOMICILIO
    BuscarCoordenadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const UBICACION = yield database_1.default.query(`
      SELECT longitud, latitud FROM eu_empleados WHERE id = $1
      `, [id]);
            if (UBICACION.rowCount > 0) {
                return res.jsonp(UBICACION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se ha encontrado registros.' });
            }
        });
    }
    // BUSQUEDA DE DATOS DE EMPLEADO INGRESANDO EL NOMBRE
    BuscarEmpleadoNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { informacion } = req.body;
            const EMPLEADO = yield database_1.default.query(`
      SELECT * FROM eu_empleados WHERE
      (UPPER (apellido) || \' \' || UPPER (nombre)) = $1
      `, [informacion]);
            if (EMPLEADO.rowCount > 0) {
                return res.jsonp(EMPLEADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // BUSQUEDA DE IMAGEN DE EMPLEADO
    BuscarImagen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const imagen = req.params.imagen;
            const id = req.params.id;
            let separador = path_1.default.sep;
            let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(id)) + separador + imagen;
            console.log('ver file ', ruta);
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(ruta));
                }
            });
        });
    }
    getImagenBase64(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const imagen = req.params.imagen;
            const id = req.params.id;
            let separador = path_1.default.sep;
            let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(id)) + separador + imagen;
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                    res.status(200).jsonp({ imagen: 0 });
                }
                else {
                    let path_file = path_1.default.resolve(ruta);
                    let data = fs_1.default.readFileSync(path_file);
                    let codificado = data.toString('base64');
                    if (codificado === null) {
                        res.status(200).jsonp({ imagen: 0 });
                    }
                    else {
                        res.status(200).jsonp({ imagen: codificado });
                    }
                }
            });
        });
    }
    // BUSQUEDA INFORMACIÓN DEPARTAMENTOS EMPLEADO
    ObtenerDepartamentoEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_emple, id_cargo } = req.body;
            const DEPARTAMENTO = yield database_1.default.query(`
      SELECT * FROM VistaDepartamentoEmpleado WHERE id_emple = $1 AND
      id_cargo = $2
      `, [id_emple, id_cargo]);
            if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    /** **************************************************************************************** **
     ** **                      CARGAR INFORMACIÓN MEDIANTE PLANTILLA                            **
     ** **************************************************************************************** **/
    VerificarPlantilla_Automatica(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            let data = {
                fila: '',
                cedula: '',
                apellido: '',
                nombre: '',
                estado_civil: '',
                genero: '',
                correo: '',
                fec_nacimiento: '',
                latitud: '',
                longitud: '',
                mail_alternativo: '',
                domicilio: '',
                telefono: '',
                nacionalidad: '',
                usuario: '',
                contrasena: '',
                rol: '',
                observacion: '',
            };
            var listEmpleados = [];
            var duplicados = [];
            var duplicados1 = [];
            var duplicados2 = [];
            var mensaje = 'correcto';
            plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                // Datos que se leen de la plantilla ingresada
                var { item, cedula, apellido, nombre, estado_civil, genero, correo, fec_nacimiento, latitud, longitud, mail_alternativo, domicilio, telefono, nacionalidad, usuario, contrasena, rol } = dato;
                //Verificar que el registo no tenga datos vacios
                if ((item != undefined && item != '') &&
                    (cedula != undefined) && (apellido != undefined) &&
                    (nombre != undefined) && (estado_civil != undefined) &&
                    (genero != undefined) && (correo != undefined) &&
                    (fec_nacimiento != undefined) && (mail_alternativo != undefined) &&
                    (latitud != undefined) && (longitud != undefined) &&
                    (domicilio != undefined) && (telefono != undefined) &&
                    (nacionalidad != undefined) && (usuario != undefined) &&
                    (contrasena != undefined) && (rol != undefined)) {
                    data.fila = item;
                    data.cedula = cedula;
                    data.apellido = apellido;
                    data.nombre = nombre;
                    data.estado_civil = estado_civil;
                    data.genero = genero;
                    data.correo = correo;
                    data.fec_nacimiento = fec_nacimiento;
                    data.latitud = latitud;
                    data.longitud = longitud;
                    data.mail_alternativo = mail_alternativo;
                    data.domicilio = domicilio;
                    data.telefono = telefono;
                    data.nacionalidad = nacionalidad;
                    data.usuario = usuario;
                    data.contrasena = contrasena;
                    data.rol = rol;
                    //Valida si los datos de la columna cedula son numeros.
                    const regex = /^[0-9]+$/;
                    if (regex.test(data.cedula)) {
                        if (data.cedula.toString().length != 10) {
                            data.observacion = 'La cédula ingresada no es válida';
                        }
                        else {
                            // Verificar si la variable tiene el formato de fecha correcto con moment
                            if ((0, moment_1.default)(fec_nacimiento, 'YYYY-MM-DD', true).isValid()) {
                                //Valida si los datos de la columna telefono son numeros.
                                if (telefono != undefined) {
                                    if (regex.test(data.telefono)) {
                                        if (data.telefono.toString().length < 10) {
                                            data.observacion = 'El teléfono ingresada no es válido';
                                        }
                                        else {
                                            if (duplicados.find((p) => p.cedula === dato.cedula || p.usuario === dato.usuario) == undefined) {
                                                data.observacion = 'ok';
                                                duplicados.push(dato);
                                            }
                                        }
                                    }
                                    else {
                                        data.observacion = 'El teléfono ingresada no es válido';
                                    }
                                }
                            }
                            else {
                                data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                            }
                        }
                    }
                    else {
                        data.observacion = 'La cédula ingresada no es válida';
                    }
                    listEmpleados.push(data);
                }
                else {
                    data.fila = item;
                    data.cedula = cedula;
                    data.apellido = apellido;
                    data.nombre = nombre;
                    data.estado_civil = estado_civil;
                    data.genero = genero;
                    data.correo = correo;
                    data.fec_nacimiento = fec_nacimiento;
                    data.latitud = latitud;
                    data.longitud = longitud;
                    data.mail_alternativo = mail_alternativo;
                    data.domicilio = domicilio;
                    data.telefono = telefono;
                    data.nacionalidad = nacionalidad;
                    data.usuario = usuario;
                    data.contrasena = contrasena;
                    data.rol = rol;
                    data.observacion = 'no registrado';
                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error';
                    }
                    if (apellido == undefined) {
                        data.apellido = 'No registrado';
                        data.observacion = 'Apellido ' + data.observacion;
                    }
                    if (nombre == undefined) {
                        data.nombre = 'No registrado';
                        data.observacion = 'Nombre ' + data.observacion;
                    }
                    if (estado_civil == undefined) {
                        data.estado_civil = 'No registrado';
                        data.observacion = 'Estado civil ' + data.observacion;
                    }
                    if (genero == undefined) {
                        data.genero = 'No registrado';
                        data.observacion = 'Género ' + data.observacion;
                    }
                    if (correo == undefined) {
                        data.correo = 'No registrado';
                        data.observacion = 'Correo ' + data.observacion;
                    }
                    if (fec_nacimiento == undefined) {
                        data.fec_nacimiento = 'No registrado';
                        data.observacion = 'Fecha de nacimiento ' + data.observacion;
                    }
                    if (latitud == undefined) {
                        data.latitud = 'No registrado';
                    }
                    if (longitud == undefined) {
                        data.longitud = 'No registrado';
                    }
                    if (mail_alternativo == undefined) {
                        data.mail_alternativo = 'No registrado';
                    }
                    if (domicilio == undefined) {
                        data.domicilio = 'No registrado';
                        data.observacion = 'Domicilio ' + data.observacion;
                    }
                    if (telefono == undefined) {
                        data.telefono = 'No registrado';
                        data.observacion = 'Teléfono ' + data.observacion;
                    }
                    if (nacionalidad == undefined) {
                        data.nacionalidad = 'No registrado';
                        data.observacion = 'Nacionalidad ' + data.observacion;
                    }
                    if (usuario == undefined) {
                        data.usuario = 'No registrado';
                        data.observacion = 'Usuario ' + data.observacion;
                    }
                    if (contrasena == undefined) {
                        data.contrasena = 'No registrado';
                        data.observacion = 'Contraseña ' + data.observacion;
                    }
                    if (rol == undefined) {
                        data.rol = 'No registrado';
                        data.observacion = 'Rol ' + data.observacion;
                    }
                    // Verificar si la variable tiene el formato de fecha correcto con moment
                    if (data.fec_nacimiento != 'No registrado') {
                        if ((0, moment_1.default)(fec_nacimiento, 'YYYY-MM-DD', true).isValid()) { }
                        else {
                            data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                        }
                    }
                    //Valida si los datos de la columna telefono son numeros.
                    if (telefono != undefined) {
                        const regex = /^[0-9]+$/;
                        if (regex.test(telefono)) {
                            if (data.telefono.toString().length != 10) {
                                data.observacion = 'El teléfono ingresado no es válido';
                            }
                        }
                        else {
                            data.observacion = 'El teléfono ingresado no es válido';
                        }
                    }
                    if (cedula == undefined) {
                        data.cedula = 'No registrado';
                        data.observacion = 'Cédula ' + data.observacion;
                    }
                    else {
                        //Valida si los datos de la columna cedula son numeros.
                        const rege = /^[0-9]+$/;
                        if (rege.test(data.cedula)) {
                            if (data.cedula.toString().length != 10) {
                                data.observacion = 'La cédula ingresada no es válida';
                            }
                        }
                        else {
                            data.observacion = 'La cédula ingresada no es válida';
                        }
                    }
                    listEmpleados.push(data);
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
            listEmpleados.forEach((valor) => __awaiter(this, void 0, void 0, function* () {
                var VERIFICAR_CEDULA = yield database_1.default.query(`
        SELECT * FROM eu_empleados WHERE cedula = $1
        `, [valor.cedula]);
                if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                    valor.observacion = 'Cédula ya existe en el sistema';
                }
                else {
                    var VERIFICAR_USUARIO = yield database_1.default.query(`
          SELECT * FROM eu_usuarios WHERE usuario = $1
          `, [valor.usuario]);
                    if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
                        valor.observacion = 'Usuario ya existe en el sistema';
                    }
                    else {
                        if (valor.rol != 'No registrado') {
                            var VERIFICAR_ROL = yield database_1.default.query(`
              SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
              `, [valor.rol.toUpperCase()]);
                            if (VERIFICAR_ROL.rows[0] != undefined && VERIFICAR_ROL.rows[0] != '') {
                                if (valor.nacionalidad != 'No registrado') {
                                    var VERIFICAR_NACIONALIDAD = yield database_1.default.query(`
                  SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1
                  `, [valor.nacionalidad.toUpperCase()]);
                                    if (VERIFICAR_NACIONALIDAD.rows[0] != undefined && VERIFICAR_NACIONALIDAD.rows[0] != '') {
                                        // Discriminación de elementos iguales
                                        if (duplicados1.find((p) => p.cedula === valor.cedula) == undefined) {
                                            // Discriminación de elementos iguales
                                            if (duplicados2.find((a) => a.usuario === valor.usuario) == undefined) {
                                                //valor.observacion = 'ok'
                                                duplicados2.push(valor);
                                            }
                                            else {
                                                valor.observacion = '2';
                                            }
                                            duplicados1.push(valor);
                                        }
                                        else {
                                            valor.observacion = '1';
                                        }
                                    }
                                    else {
                                        valor.observacion = 'Nacionalidad no existe en el sistema';
                                    }
                                }
                            }
                            else {
                                valor.observacion = 'Rol no existe en el sistema';
                            }
                        }
                    }
                }
            }));
            setTimeout(() => {
                listEmpleados.sort((a, b) => {
                    // Compara los números de los objetos
                    if (a.fila < b.fila) {
                        return -1;
                    }
                    if (a.fila > b.fila) {
                        return 1;
                    }
                    return 0; // Son iguales
                });
                var filaDuplicada = 0;
                listEmpleados.forEach((item) => {
                    if (item.observacion == '1') {
                        item.observacion = 'Registro duplicado - cédula';
                    }
                    else if (item.observacion == '2') {
                        item.observacion = 'Registro duplicado - usuario';
                    }
                    if (item.observacion != undefined) {
                        let arrayObservacion = item.observacion.split(" ");
                        if (arrayObservacion[0] == 'no') {
                            item.observacion = 'ok';
                        }
                    }
                    else {
                        item.observacion = 'Datos no registrado';
                    }
                    //Valida si los datos de la columna N son numeros.
                    if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                        //Condicion para validar si en la numeracion existe un numero que se repite dara error.
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
                    listEmpleados = undefined;
                }
                //console.log('empleados: ', listEmpleados);
                return res.jsonp({ message: mensaje, data: listEmpleados });
            }, 1500);
        });
    }
    VerificarPlantilla_DatosAutomatico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + list;
            //const workbook = excel.readFile(filePath);
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            console.log('plantilla1: ', plantilla);
        });
    }
    CargarPlantilla_Automatico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const plantilla = req.body;
            console.log('datos automatico: ', plantilla);
            const VALOR = yield database_1.default.query('SELECT * FROM codigo');
            //TODO Revisar max codigo
            var codigo_dato = VALOR.rows[0].valor;
            var codigo = 0;
            if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
                codigo = codigo_dato = parseInt(codigo_dato);
            }
            var contador = 1;
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                // Realiza un capital letter a los nombres y apellidos
                var nombreE;
                let nombres = data.nombre.split(' ');
                if (nombres.length > 1) {
                    let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
                    let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
                    nombreE = name1 + ' ' + name2;
                }
                else {
                    let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
                    nombreE = name1;
                }
                var apellidoE;
                let apellidos = data.apellido.split(' ');
                if (apellidos.length > 1) {
                    let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
                    let lastname2 = apellidos[1].charAt(0).toUpperCase() + apellidos[1].slice(1);
                    apellidoE = lastname1 + ' ' + lastname2;
                }
                else {
                    let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
                    apellidoE = lastname1;
                }
                // Encriptar contraseña
                var md5 = new ts_md5_1.Md5();
                var contrasena = (_a = md5.appendStr(data.contrasena).end()) === null || _a === void 0 ? void 0 : _a.toString();
                // Datos que se leen de la plantilla ingresada
                const { cedula, estado_civil, genero, correo, fec_nacimiento, domicilio, longitud, latitud, telefono, nacionalidad, usuario, rol } = data;
                //Obtener id del estado_civil
                var id_estado_civil = 0;
                if (estado_civil.toUpperCase() === 'SOLTERO/A') {
                    id_estado_civil = 1;
                }
                else if (estado_civil.toUpperCase() === 'UNION DE HECHO') {
                    id_estado_civil = 2;
                }
                else if (estado_civil.toUpperCase() === 'CASADO/A') {
                    id_estado_civil = 3;
                }
                else if (estado_civil.toUpperCase() === 'DIVORCIADO/A') {
                    id_estado_civil = 4;
                }
                else if (estado_civil.toUpperCase() === 'VIUDO/A') {
                    id_estado_civil = 5;
                }
                //Obtener id del genero
                var id_genero = 0;
                if (genero.toUpperCase() === 'MASCULINO') {
                    id_genero = 1;
                }
                else if (genero.toUpperCase() === 'FEMENINO') {
                    id_genero = 2;
                }
                var _longitud = null;
                if (longitud != 'No registrado') {
                    _longitud = longitud;
                }
                var _latitud = null;
                if (latitud != 'No registrado') {
                    _latitud = latitud;
                }
                //OBTENER ID DEL ESTADO
                var id_estado = 1;
                var estado_user = true;
                var app_habilita = false;
                //Obtener id de la nacionalidad
                const id_nacionalidad = yield database_1.default.query(`
        SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1
        `, [nacionalidad.toUpperCase()]);
                //Obtener id del rol
                const id_rol = yield database_1.default.query(`
        SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
        `, [rol.toUpperCase()]);
                console.log('codigo dato 222: ', codigo_dato);
                console.log('codigo 222: ', codigo);
                if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
                    // Incrementar el valor del código
                    codigo = codigo + 1;
                }
                else {
                    codigo = cedula;
                }
                var fec_nacimi = new Date((0, moment_1.default)(fec_nacimiento).format('YYYY-MM-DD'));
                console.log('codigo: ', codigo);
                console.log('cedula: ', cedula, ' usuario: ', usuario, ' contrasena: ', contrasena);
                console.log('nombre: ', nombreE, ' usuario: ', apellidoE, ' fecha nacimien: ', fec_nacimi, ' estado civil: ', id_estado_civil);
                console.log('genero: ', id_genero, ' estado: ', id_estado, ' nacionalidad: ', id_nacionalidad.rows, ' rol: ', id_rol);
                console.log('longitud: ', _longitud, ' latitud: ', _latitud);
                // Registro de nuevo empleado
                yield database_1.default.query(`
        INSERT INTO eu_empleados (cedula, apellido, nombre, estado_civil, genero, correo,
          fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [cedula, apellidoE, nombreE,
                    id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
                    domicilio, telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud]);
                // Obtener el id del empleado ingresado
                const oneEmpley = yield database_1.default.query(`
        SELECT id FROM eu_empleados WHERE cedula = $1
        `, [cedula]);
                const id_empleado = oneEmpley.rows[0].id;
                // Registro de los datos de usuario
                yield database_1.default.query(`
        INSERT INTO eu_usuarios (usuario, contrasena, estado, id_rol, id_empleado, app_habilita)
        VALUES ($1, $2, $3, $4, $5, $6)
        `, [usuario, contrasena, estado_user, id_rol.rows[0]['id'],
                    id_empleado, app_habilita]);
                if (contador === plantilla.length) {
                    console.log('codigo_ver', codigo, VALOR.rows[0].id);
                    // Actualización del código
                    if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
                        yield database_1.default.query(`
            UPDATE e_codigo SET valor = $1 WHERE id = $2
            `, [codigo, VALOR.rows[0].id]);
                    }
                }
                contador = contador + 1;
                contrasena = undefined;
            }));
            setTimeout(() => {
                return res.jsonp({ message: 'correcto' });
            }, 1500);
        });
    }
    /** METODOS PARA VERIFICAR PLANTILLA CON CÓDIGO INGRESADO DE FORMA MANUAL */
    VerificarPlantilla_Manual(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_2.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            let data = {
                fila: '',
                cedula: '',
                apellido: '',
                nombre: '',
                codigo: '',
                estado_civil: '',
                genero: '',
                correo: '',
                fec_nacimiento: '',
                latitud: '',
                longitud: '',
                mail_alternativo: '',
                domicilio: '',
                telefono: '',
                nacionalidad: '',
                usuario: '',
                contrasena: '',
                rol: '',
                observacion: '',
            };
            var listEmpleadosManual = [];
            var duplicados = [];
            var duplicados1 = [];
            var duplicados2 = [];
            var duplicados3 = [];
            var mensaje = 'correcto';
            plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                // Datos que se leen de la plantilla ingresada
                var { item, cedula, apellido, nombre, codigo, estado_civil, genero, correo, fec_nacimiento, latitud, longitud, mail_alternativo, domicilio, telefono, nacionalidad, usuario, contrasena, estado_user, rol, app_habilita } = dato;
                //Verificar que el registo no tenga datos vacios
                if ((item != undefined && item != '') &&
                    (cedula != undefined) && (apellido != undefined) &&
                    (nombre != undefined) && (codigo != undefined) && (estado_civil != undefined) &&
                    (genero != undefined) && (correo != undefined) &&
                    (fec_nacimiento != undefined) && (mail_alternativo != undefined) &&
                    (latitud != undefined) && (longitud != undefined) &&
                    (domicilio != undefined) && (telefono != undefined) &&
                    (nacionalidad != undefined) && (usuario != undefined) &&
                    (contrasena != undefined) && (rol != undefined)) {
                    data.fila = item;
                    data.cedula = cedula;
                    data.apellido = apellido;
                    data.nombre = nombre;
                    data.codigo = codigo;
                    data.estado_civil = estado_civil;
                    data.genero = genero;
                    data.correo = correo;
                    data.fec_nacimiento = fec_nacimiento;
                    data.latitud = latitud;
                    data.longitud = longitud;
                    data.mail_alternativo = mail_alternativo;
                    data.domicilio = domicilio;
                    data.telefono = telefono;
                    data.nacionalidad = nacionalidad;
                    data.usuario = usuario;
                    data.contrasena = contrasena;
                    data.rol = rol;
                    //Valida si los datos de la columna cedula son numeros.
                    const rege = /^[0-9]+$/;
                    if (rege.test(data.cedula)) {
                        if (data.cedula.toString().length > 10 || data.cedula.toString().length < 10) {
                            data.observacion = 'La cédula ingresada no es válida';
                        }
                        else {
                            if (rege.test(data.codigo)) {
                                // Verificar si la variable tiene el formato de fecha correcto con moment
                                if ((0, moment_1.default)(fec_nacimiento, 'YYYY-MM-DD', true).isValid()) {
                                    //Valida si los datos de la columna telefono son numeros.
                                    if (telefono != undefined) {
                                        if (rege.test(data.telefono)) {
                                            if (data.telefono.toString().length < 10) {
                                                data.observacion = 'El teléfono ingresada no es válido';
                                            }
                                            else {
                                                if (duplicados.find((p) => p.cedula === dato.cedula || p.usuario === dato.usuario) == undefined) {
                                                    data.observacion = 'ok';
                                                    duplicados.push(dato);
                                                }
                                            }
                                        }
                                        else {
                                            data.observacion = 'El teléfono ingresado no es válido';
                                        }
                                    }
                                }
                                else {
                                    data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                                }
                            }
                            else {
                                data.observacion = 'Formato de código incorrecto';
                            }
                        }
                    }
                    else {
                        data.observacion = 'La cédula ingresada no es válida';
                    }
                    listEmpleadosManual.push(data);
                }
                else {
                    data.fila = item;
                    data.cedula = cedula;
                    data.apellido = apellido;
                    data.nombre = nombre;
                    data.codigo = codigo;
                    data.estado_civil = estado_civil;
                    data.genero = genero;
                    data.correo = correo;
                    data.fec_nacimiento = fec_nacimiento;
                    data.latitud = latitud;
                    data.longitud = longitud;
                    data.mail_alternativo = mail_alternativo;
                    data.domicilio = domicilio;
                    data.telefono = telefono;
                    data.nacionalidad = nacionalidad;
                    data.usuario = usuario;
                    data.contrasena = contrasena;
                    data.rol = rol,
                        data.observacion = 'no registrado';
                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error';
                    }
                    if (apellido == undefined) {
                        data.apellido = 'No registrado';
                        data.observacion = 'Apellido ' + data.observacion;
                    }
                    if (nombre == undefined) {
                        data.nombre = 'No registrado';
                        data.observacion = 'Nombre ' + data.observacion;
                    }
                    if (codigo == undefined) {
                        data.codigo = 'No registrado';
                        data.observacion = 'Código ' + data.observacion;
                    }
                    if (estado_civil == undefined) {
                        data.estado_civil = 'No registrado';
                        data.observacion = 'Estado civil ' + data.observacion;
                    }
                    if (genero == undefined) {
                        data.genero = 'No registrado';
                        data.observacion = 'Género ' + data.observacion;
                    }
                    if (correo == undefined) {
                        data.correo = 'No registrado';
                        data.observacion = 'Correo ' + data.observacion;
                    }
                    if (fec_nacimiento == undefined) {
                        data.fec_nacimiento = 'No registrado';
                        data.observacion = 'Fecha de nacimiento ' + data.observacion;
                    }
                    if (latitud == undefined) {
                        data.latitud = 'No registrado';
                    }
                    if (longitud == undefined) {
                        data.longitud = 'No registrado';
                    }
                    if (mail_alternativo == undefined) {
                        data.mail_alternativo = 'No registrado';
                    }
                    if (domicilio == undefined) {
                        data.domicilio = 'No registrado';
                        data.observacion = 'Domicilio ' + data.observacion;
                    }
                    if (telefono == undefined) {
                        data.telefono = 'No registrado';
                        data.observacion = 'Teléfono ' + data.observacion;
                    }
                    if (nacionalidad == undefined) {
                        data.nacionalidad = 'No registrado';
                        data.observacion = 'Nacionalidad ' + data.observacion;
                    }
                    if (usuario == undefined) {
                        data.usuario = 'No registrado';
                        data.observacion = 'Usuario ' + data.observacion;
                    }
                    if (contrasena == undefined) {
                        data.contrasena = contrasena;
                        data.observacion = 'Contraseña ' + data.observacion;
                    }
                    if (rol == undefined) {
                        data.rol = 'No registrado';
                        data.observacion = 'Rol ' + data.observacion;
                    }
                    // Verificar si la variable tiene el formato de fecha correcto con moment
                    if (data.fec_nacimiento != 'No registrado') {
                        if ((0, moment_1.default)(fec_nacimiento, 'YYYY-MM-DD', true).isValid()) { }
                        else {
                            data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                        }
                    }
                    //Valida si los datos de la columna telefono son numeros.
                    if (telefono != undefined) {
                        const regex = /^[0-9]+$/;
                        if (regex.test(data.telefono)) {
                            if (data.telefono.toString().length != 10) {
                                data.observacion = 'El teléfono ingresado no es válido';
                            }
                        }
                        else {
                            data.observacion = 'El teléfono ingresado no es válido';
                        }
                    }
                    if (codigo != undefined) {
                        const rege = /^[0-9]+$/;
                        if (!rege.test(data.codigo)) {
                            data.observacion = 'Formato de código incorrecto';
                        }
                    }
                    if (cedula == undefined) {
                        data.cedula = 'No registrado';
                        data.observacion = 'Cédula ' + data.observacion;
                    }
                    else {
                        //Valida si los datos de la columna cedula son numeros.
                        const rege = /^[0-9]+$/;
                        if (rege.test(data.cedula)) {
                            if (data.cedula.toString().length != 10) {
                                data.observacion = 'La cédula ingresada no es válida';
                            }
                        }
                        else {
                            data.observacion = 'La cédula ingresada no es válida';
                        }
                    }
                    listEmpleadosManual.push(data);
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
            listEmpleadosManual.forEach((valor) => __awaiter(this, void 0, void 0, function* () {
                var VERIFICAR_CEDULA = yield database_1.default.query(`
        SELECT * FROM eu_empleados WHERE cedula = $1
        `, [valor.cedula]);
                if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                    valor.observacion = 'Cédula ya existe en el sistema';
                }
                else {
                    var VERIFICAR_CODIGO = yield database_1.default.query(`
          SELECT * FROM eu_empleados WHERE codigo = $1
          `, [valor.codigo]);
                    if (VERIFICAR_CODIGO.rows[0] != undefined && VERIFICAR_CODIGO.rows[0] != '') {
                        valor.observacion = 'Codigo ya existe en el sistema';
                    }
                    else {
                        var VERIFICAR_USUARIO = yield database_1.default.query(`
            SELECT * FROM eu_usuarios WHERE usuario = $1
            `, [valor.usuario]);
                        if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
                            valor.observacion = 'Usuario ya existe en el sistema';
                        }
                        else {
                            if (valor.rol != 'No registrado') {
                                var VERIFICAR_ROL = yield database_1.default.query(`
                SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
                `, [valor.rol.toUpperCase()]);
                                if (VERIFICAR_ROL.rows[0] != undefined && VERIFICAR_ROL.rows[0] != '') {
                                    if (valor.nacionalidad != 'No registrado') {
                                        var VERIFICAR_NACIONALIDAD = yield database_1.default.query(`
                    SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1
                    `, [valor.nacionalidad.toUpperCase()]);
                                        if (VERIFICAR_NACIONALIDAD.rows[0] != undefined && VERIFICAR_NACIONALIDAD.rows[0] != '') {
                                            // Discriminación de elementos iguales
                                            if (duplicados1.find((p) => p.cedula === valor.cedula) == undefined) {
                                                // Discriminación de elementos iguales
                                                if (duplicados3.find((c) => c.codigo === valor.codigo) == undefined) {
                                                    // Discriminación de elementos iguales
                                                    if (duplicados2.find((a) => a.usuario === valor.usuario) == undefined) {
                                                        //valor.observacion = 'ok'
                                                        duplicados2.push(valor);
                                                    }
                                                    else {
                                                        valor.observacion = '2';
                                                    }
                                                    duplicados3.push(valor);
                                                }
                                                else {
                                                    valor.observacion = '3';
                                                }
                                                duplicados1.push(valor);
                                            }
                                            else {
                                                valor.observacion = '1';
                                            }
                                        }
                                        else {
                                            valor.observacion = 'Nacionalidad no existe en el sistema';
                                        }
                                    }
                                }
                                else {
                                    valor.observacion = 'Rol no existe en el sistema';
                                }
                            }
                        }
                    }
                }
            }));
            setTimeout(() => {
                listEmpleadosManual.sort((a, b) => {
                    // Compara los números de los objetos
                    if (a.fila < b.fila) {
                        return -1;
                    }
                    if (a.fila > b.fila) {
                        return 1;
                    }
                    return 0; // Son iguales
                });
                var filaDuplicada = 0;
                listEmpleadosManual.forEach((item) => {
                    if (item.observacion == '1') {
                        item.observacion = 'Registro duplicado - cédula';
                    }
                    else if (item.observacion == '2') {
                        item.observacion = 'Registro duplicado - usuario';
                    }
                    else if (item.observacion == '3') {
                        item.observacion = 'Registro duplicado - codigo';
                    }
                    if (item.observacion != undefined) {
                        let arrayObservacion = item.observacion.split(" ");
                        if (arrayObservacion[0] == 'no') {
                            item.observacion = 'ok';
                        }
                    }
                    //Valida si los datos de la columna N son numeros.
                    if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                        //Condicion para validar si en la numeracion existe un numero que se repite dara error.
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
                    listEmpleadosManual = undefined;
                }
                return res.jsonp({ message: mensaje, data: listEmpleadosManual });
            }, 1500);
        });
    }
    VerificarPlantilla_DatosManual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            var contarCedulaData = 0;
            var contarUsuarioData = 0;
            var contarCodigoData = 0;
            var contador_arreglo = 1;
            var arreglos_datos = [];
            //Leer la plantilla para llenar un array con los datos cedula y usuario para verificar que no sean duplicados
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                // Datos que se leen de la plantilla ingresada
                const { cedula, codigo, estado_civil, genero, correo, fec_nacimiento, estado, domicilio, telefono, nacionalidad, usuario, estado_user, rol, app_habilita } = data;
                let datos_array = {
                    cedula: cedula,
                    usuario: usuario,
                    codigo: codigo
                };
                arreglos_datos.push(datos_array);
            }));
            // Vamos a verificar dentro de arreglo_datos que no se encuentren datos duplicados
            for (var i = 0; i <= arreglos_datos.length - 1; i++) {
                for (var j = 0; j <= arreglos_datos.length - 1; j++) {
                    if (arreglos_datos[i].cedula === arreglos_datos[j].cedula) {
                        contarCedulaData = contarCedulaData + 1;
                    }
                    if (arreglos_datos[i].usuario === arreglos_datos[j].usuario) {
                        contarUsuarioData = contarUsuarioData + 1;
                    }
                    if (arreglos_datos[i].codigo === arreglos_datos[j].codigo) {
                        contarCodigoData = contarCodigoData + 1;
                    }
                }
                contador_arreglo = contador_arreglo + 1;
            }
            // Cuando todos los datos han sido leidos verificamos si todos los datos son correctos
            console.log('cedula_data', contarCedulaData, plantilla.length, contador_arreglo);
            console.log('usuario_data', contarUsuarioData, plantilla.length, contador_arreglo);
            console.log('codigo_data', contarCodigoData, plantilla.length, contador_arreglo);
            if ((contador_arreglo - 1) === plantilla.length) {
                if (contarCedulaData === plantilla.length && contarUsuarioData === plantilla.length &&
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
    CargarPlantilla_Manual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const plantilla = req.body;
            console.log('datos manual: ', plantilla);
            var contador = 1;
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                // Realiza un capital letter a los nombres y apellidos
                var nombreE;
                let nombres = data.nombre.split(' ');
                if (nombres.length > 1) {
                    let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
                    let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
                    nombreE = name1 + ' ' + name2;
                }
                else {
                    let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
                    nombreE = name1;
                }
                var apellidoE;
                let apellidos = data.apellido.split(' ');
                if (apellidos.length > 1) {
                    let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
                    let lastname2 = apellidos[1].charAt(0).toUpperCase() + apellidos[1].slice(1);
                    apellidoE = lastname1 + ' ' + lastname2;
                }
                else {
                    let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
                    apellidoE = lastname1;
                }
                // Encriptar contraseña
                const md5 = new ts_md5_1.Md5();
                const contrasena = md5.appendStr(data.contrasena).end();
                // Datos que se leen de la plantilla ingresada
                const { cedula, codigo, estado_civil, genero, correo, fec_nacimiento, estado, domicilio, longitud, latitud, telefono, nacionalidad, usuario, rol } = data;
                //Obtener id del estado_civil
                var id_estado_civil = 0;
                if (estado_civil.toUpperCase() === 'SOLTERA/A') {
                    id_estado_civil = 1;
                }
                else if (estado_civil.toUpperCase() === 'UNION DE HECHO') {
                    id_estado_civil = 2;
                }
                else if (estado_civil.toUpperCase() === 'CASADO/A') {
                    id_estado_civil = 3;
                }
                else if (estado_civil.toUpperCase() === 'DIVORCIADO/A') {
                    id_estado_civil = 4;
                }
                else if (estado_civil.toUpperCase() === 'VIUDO/A') {
                    id_estado_civil = 5;
                }
                //Obtener id del genero
                var id_genero = 0;
                if (genero.toUpperCase() === 'MASCULINO') {
                    id_genero = 1;
                }
                else if (genero.toUpperCase() === 'FEMENINO') {
                    id_genero = 2;
                }
                var _longitud = null;
                if (longitud != 'No registrado') {
                    _longitud = longitud;
                }
                var _latitud = null;
                if (latitud != 'No registrado') {
                    _latitud = latitud;
                }
                //OBTENER ID DEL ESTADO
                var id_estado = 1;
                var estado_user = true;
                var app_habilita = false;
                //Obtener id de la nacionalidad
                const id_nacionalidad = yield database_1.default.query(`
        SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1
        `, [nacionalidad.toUpperCase()]);
                //Obtener id del rol
                const id_rol = yield database_1.default.query(`
        SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
        `, [rol.toUpperCase()]);
                // Registro de nuevo empleado
                yield database_1.default.query(`
        INSERT INTO eu_empleados ( cedula, apellido, nombre, estado_civil, genero, correo,
          fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [cedula, apellidoE, nombreE,
                    id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
                    domicilio, telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud]);
                // Obtener el id del empleado ingresado
                const oneEmpley = yield database_1.default.query(`
        SELECT id FROM eu_empleados WHERE cedula = $1
        `, [cedula]);
                const id_empleado = oneEmpley.rows[0].id;
                // Registro de los datos de usuario
                yield database_1.default.query(`
        INSERT INTO eu_usuarios (usuario, contrasena, estado, id_rol, id_empleado, app_habilita)
        VALUES ($1, $2, $3, $4, $5, $6)
        `, [usuario, contrasena, estado_user, id_rol.rows[0]['id'], id_empleado,
                    app_habilita]);
                if (contador === plantilla.length) {
                    // Actualización del código
                    yield database_1.default.query(`
          UPDATE e_codigo SET valor = null WHERE id = 1
          `);
                    return res.jsonp({ message: 'correcto' });
                }
                contador = contador + 1;
            }));
        });
    }
}
exports.EMPLEADO_CONTROLADOR = new EmpleadoControlador();
exports.default = exports.EMPLEADO_CONTROLADOR;
