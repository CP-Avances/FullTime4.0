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
exports.EMPRESA_CONTROLADOR = void 0;
const ImagenCodificacion_1 = require("../../libs/ImagenCodificacion");
const builder = require('xmlbuilder');
const database_1 = __importDefault(require("../../database"));
const fs_1 = __importDefault(require("fs"));
class EmpresaControlador {
    // BUSCAR DATOS DE EMPRESA PARA RECUPERAR CUENTA
    BuscarCadena(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const EMPRESA = yield database_1.default.query(`
            SELECT cadena FROM cg_empresa
            `);
            if (EMPRESA.rowCount > 0) {
                return res.jsonp(EMPRESA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO DE BUSQUEDA DE IMAGEN
    getImagenBase64(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const file_name = yield database_1.default.query(`
            SELECT nombre, logo FROM cg_empresa WHERE id = $1
            `, [req.params.id_empresa])
                .then((result) => {
                return result.rows[0];
            });
            if (file_name.logo === null) {
                file_name.logo = 'logo_reportes.png';
            }
            const codificado = yield (0, ImagenCodificacion_1.ImagenBase64LogosEmpresas)(file_name.logo);
            console.log("file_name: ", file_name.logo);
            if (codificado === 0) {
                res.status(200).jsonp({ imagen: 0, nom_empresa: file_name.nombre });
            }
            else {
                res.status(200).jsonp({ imagen: codificado, nom_empresa: file_name.nombre });
            }
        });
    }
    // METODO PARA EDITAR LOGO DE EMPRESA
    ActualizarLogoEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let logo = list.image[0].path.split("\\")[1];
            console.log("logo: ", logo);
            let id = req.params.id_empresa;
            const logo_name = yield database_1.default.query(`
            SELECT nombre, logo FROM cg_empresa WHERE id = $1
            `, [id]);
            if (logo_name.rowCount > 0) {
                logo_name.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    console.log("logo_name: ", obj.logo);
                    if (obj.logo != null) {
                        console.log("lsi entro: ", obj.logo);
                        try {
                            let filePath = `servidor/logos/${obj.logo}`;
                            let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                            // ELIMINAR LOGO DEL SERVIDOR
                            fs_1.default.unlinkSync(direccionCompleta);
                            yield database_1.default.query(`UPDATE cg_empresa SET logo = $2 WHERE id = $1`, [id, logo]);
                        }
                        catch (error) {
                            yield database_1.default.query('', [id, logo]);
                        }
                    }
                    else {
                        yield database_1.default.query(`
                        UPDATE cg_empresa SET logo = $2 WHERE id = $1
                        `, [id, logo]);
                    }
                }));
            }
            const codificado = yield (0, ImagenCodificacion_1.ImagenBase64LogosEmpresas)(logo);
            res.send({ imagen: codificado, nom_empresa: logo_name.rows[0].nombre, message: 'Logo actualizado' });
        });
    }
    // METODO PARA BUSCAR DATOS GENERALES DE EMPRESA
    ListarEmpresaId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const EMPRESA = yield database_1.default.query(`
            SELECT * FROM cg_empresa WHERE id = $1
            `, [id]);
            if (EMPRESA.rowCount > 0) {
                return res.jsonp(EMPRESA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // ACTUALIZAR DATOS DE EMPRESA
    ActualizarEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, ruc, direccion, telefono, correo_empresa, tipo_empresa, representante, establecimiento, dias_cambio, cambios, num_partida, id } = req.body;
            yield database_1.default.query(`
            UPDATE cg_empresa SET nombre = $1, ruc = $2, direccion = $3, telefono = $4, correo_empresa = $5,
            tipo_empresa = $6, representante = $7, establecimiento = $8, dias_cambio = $9, cambios = $10, 
            num_partida = $11 WHERE id = $12
            `, [nombre, ruc, direccion, telefono, correo_empresa, tipo_empresa, representante, establecimiento,
                dias_cambio, cambios, num_partida, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // METODO PARA ACTUALIZAR DATOS DE COLORES DE EMPRESA
    ActualizarColores(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { color_p, color_s, id } = req.body;
            yield database_1.default.query(`
            UPDATE cg_empresa SET color_p = $1, color_s = $2 WHERE id = $3
            `, [color_p, color_s, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // METODO PARA ACTUALIZAR DATOS DE MARCA DE AGUA DE REPORTES
    ActualizarMarcaAgua(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { marca_agua, id } = req.body;
            yield database_1.default.query(`
            UPDATE cg_empresa SET marca_agua = $1 WHERE id = $2
            `, [marca_agua, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // METODO PARA ACTUALIZAR NIVELES DE SEGURIDAD
    ActualizarSeguridad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { seg_contrasena, seg_frase, seg_ninguna, id } = req.body;
            yield database_1.default.query(`
            UPDATE cg_empresa SET seg_contrasena = $1, seg_frase = $2, seg_ninguna = $3
            WHERE id = $4
            `, [seg_contrasena, seg_frase, seg_ninguna, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // METODO PARA ACTUALIZAR LOGO CABECERA DE CORREO
    ActualizarCabeceraCorreo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let logo = list.image[0].path.split("\\")[1];
            let id = req.params.id_empresa;
            const logo_name = yield database_1.default.query(`
            SELECT cabecera_firma FROM cg_empresa WHERE id = $1
            `, [id]);
            if (logo_name.rowCount > 0) {
                logo_name.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    if (obj.cabecera_firma != null) {
                        try {
                            // ELIMINAR IMAGEN DE SERVIDOR
                            let filePath = `servidor\\logos\\${obj.cabecera_firma}`;
                            let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                            fs_1.default.unlinkSync(direccionCompleta);
                            yield database_1.default.query(`
                            UPDATE cg_empresa SET cabecera_firma = $2 WHERE id = $1
                            `, [id, logo]);
                        }
                        catch (error) {
                            yield database_1.default.query(`
                            UPDATE cg_empresa SET cabecera_firma = $2 WHERE id = $1
                            `, [id, logo]);
                        }
                    }
                    else {
                        yield database_1.default.query(`
                        UPDATE cg_empresa SET cabecera_firma = $2 WHERE id = $1
                        `, [id, logo]);
                    }
                }));
            }
            const codificado = yield (0, ImagenCodificacion_1.ImagenBase64LogosEmpresas)(logo);
            res.send({ imagen: codificado, message: 'Registro actualizado.' });
        });
    }
    // METODO PARA CONSULTAR IMAGEN DE CABECERA DE CORREO
    VerCabeceraCorreo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const file_name = yield database_1.default.query(`
                SELECT cabecera_firma FROM cg_empresa WHERE id = $1
                `, [req.params.id_empresa])
                .then((result) => {
                return result.rows[0];
            });
            const codificado = yield (0, ImagenCodificacion_1.ImagenBase64LogosEmpresas)(file_name.cabecera_firma);
            if (codificado === 0) {
                res.status(200).jsonp({ imagen: 0 });
            }
            else {
                res.status(200).jsonp({ imagen: codificado });
            }
        });
    }
    // METODO PARA ACTUALIZAR PIE DE FIRMA DE CORREO
    ActualizarPieCorreo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let logo = list.image[0].path.split("\\")[1];
            let id = req.params.id_empresa;
            const logo_name = yield database_1.default.query(`
            SELECT pie_firma FROM cg_empresa WHERE id = $1
            `, [id]);
            if (logo_name.rowCount > 0) {
                logo_name.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    if (obj.pie_firma != null) {
                        try {
                            // ELIMINAR LOGO DE SERVIDOR
                            let filePath = `servidor\\logos\\${obj.pie_firma}`;
                            let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                            fs_1.default.unlinkSync(direccionCompleta);
                            yield database_1.default.query(`
                            UPDATE cg_empresa SET pie_firma = $2 WHERE id = $1
                            `, [id, logo]);
                        }
                        catch (error) {
                            yield database_1.default.query(`
                            UPDATE cg_empresa SET pie_firma = $2 WHERE id = $1
                            `, [id, logo]);
                        }
                    }
                    else {
                        yield database_1.default.query(`
                        UPDATE cg_empresa SET pie_firma = $2 WHERE id = $1
                        `, [id, logo]);
                    }
                }));
            }
            const codificado = yield (0, ImagenCodificacion_1.ImagenBase64LogosEmpresas)(logo);
            res.send({ imagen: codificado, message: 'Registro actualizado.' });
        });
    }
    // METODO PARA CONSULTAR IMAGEN DE PIE DE FIRMA DE CORREO
    VerPieCorreo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const file_name = yield database_1.default.query(`
                SELECT pie_firma FROM cg_empresa WHERE id = $1
                `, [req.params.id_empresa])
                .then((result) => {
                return result.rows[0];
            });
            const codificado = yield (0, ImagenCodificacion_1.ImagenBase64LogosEmpresas)(file_name.pie_firma);
            if (codificado === 0) {
                res.status(200).jsonp({ imagen: 0 });
            }
            else {
                res.status(200).jsonp({ imagen: codificado });
            }
        });
    }
    // METODO PARA ACTUALIZAR DATOS DE CORREO
    EditarPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_empresa;
            const { correo, password_correo, servidor, puerto } = req.body;
            yield database_1.default.query(`
            UPDATE cg_empresa SET correo = $1, password_correo = $2, servidor = $3, puerto = $4
            WHERE id = $5
            `, [correo, password_correo, servidor, puerto, id]);
            res.status(200).jsonp({ message: 'Registro actualizado.' });
        });
    }
    ListarEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const EMPRESA = yield database_1.default.query('SELECT id, nombre, ruc, direccion, telefono, correo, ' +
                'representante, tipo_empresa, establecimiento, logo, color_p, color_s, num_partida, marca_agua, ' +
                'correo_empresa FROM cg_empresa ORDER BY nombre ASC');
            if (EMPRESA.rowCount > 0) {
                return res.jsonp(EMPRESA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUnaEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const EMPRESA = yield database_1.default.query('SELECT id, nombre, ruc, direccion, telefono, correo, representante, ' +
                'tipo_empresa, establecimiento, logo, color_p, color_s, num_partida, marca_agua, correo_empresa ' +
                'FROM cg_empresa WHERE nombre = $1', [nombre]);
            if (EMPRESA.rowCount > 0) {
                return res.jsonp(EMPRESA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, ruc, direccion, telefono, tipo_empresa, representante, establecimiento, color_p, color_s, correo_empresa } = req.body;
            yield database_1.default.query('INSERT INTO cg_empresa (nombre, ruc, direccion, telefono, tipo_empresa, ' +
                'representante, establecimiento, color_p, color_s, correo_empresa) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [nombre, ruc, direccion, telefono, tipo_empresa, representante, establecimiento,
                color_p, color_s, correo_empresa]);
            res.jsonp({ message: 'La Empresa se registró con éxito' });
        });
    }
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            console.log(req.body.userName);
            let filename = "Empresas-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() +
                '.xml';
            fs_1.default.writeFile(`xmlDownload/${filename}`, xml, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("Archivo guardado");
            });
            res.jsonp({ text: 'XML creado', name: filename });
        });
    }
    downloadXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = req.params.nameXML;
            let filePath = `servidor\\xmlDownload\\${name}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query('DELETE FROM cg_empresa WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    ActualizarAccionesTimbres(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, bool_acciones } = req.body;
                yield database_1.default.query('UPDATE cg_empresa SET acciones_timbres = $1 WHERE id = $2', [bool_acciones, id]);
                res.status(200).jsonp({
                    message: 'Empresa actualizada exitosamente',
                    title: 'Ingrese nuevamente al sistema'
                });
            }
            catch (error) {
                res.status(404).jsonp(error);
            }
        });
    }
}
exports.EMPRESA_CONTROLADOR = new EmpresaControlador();
exports.default = exports.EMPRESA_CONTROLADOR;
