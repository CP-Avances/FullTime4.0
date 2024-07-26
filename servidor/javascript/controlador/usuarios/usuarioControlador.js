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
exports.USUARIO_CONTROLADOR = void 0;
const settingsMail_1 = require("../../libs/settingsMail");
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../../database"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UsuarioControlador {
    // CREAR REGISTRO DE USUARIOS
    CrearUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { usuario, contrasena, estado, id_rol, id_empleado, user_name, ip } = req.body;
                // INCIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO eu_usuarios (usuario, contrasena, estado, id_rol, id_empleado) 
          VALUES ($1, $2, $3, $4, $5) RETURNING *
        `, [usuario, contrasena, estado, id_rol, id_empleado]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_usuarios',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(response.rows[0]),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Usuario Guardado' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO DE BUSQUEDA DE DATOS DE USUARIO
    ObtenerDatosUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const UN_USUARIO = yield database_1.default.query(`
      SELECT * FROM eu_usuarios WHERE id_empleado = $1
      `, [id_empleado]);
            if (UN_USUARIO.rowCount != 0) {
                return res.jsonp(UN_USUARIO.rows);
            }
            else {
                res.status(404).jsonp({ text: 'No se ha encontrado el usuario.' });
            }
        });
    }
    ObtenerDepartamentoUsuarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const EMPLEADO = yield database_1.default.query(`
      SELECT e.id_empleado AS id, e.id_departamento, e.id_contrato, ed_departamentos.nombre 
      FROM contrato_cargo_vigente AS e 
      INNER JOIN ed_departamentos ON e.id_departamento = ed_departamentos.id 
      WHERE id_contrato = $1
      `, [id_empleado]);
            if (EMPLEADO.rowCount != 0) {
                return res.jsonp(EMPLEADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    ObtenerIdUsuariosDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_departamento } = req.body;
            const Ids = yield database_1.default.query(`
      SELECT id_empleado AS id
      FROM contrato_cargo_vigente
      WHERE id_departamento = $1
      `, [id_departamento]);
            if (Ids.rowCount != 0) {
                return res.jsonp(Ids.rows);
            }
            else {
                return res.jsonp(null);
            }
        });
    }
    // METODO PARA ACTUALIZAR DATOS DE USUARIO
    ActualizarUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { usuario, contrasena, id_rol, id_empleado, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [id_empleado]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuarios',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar usuario con id_empleado: ${id_empleado}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE eu_usuarios SET usuario = $1, contrasena = $2, id_rol = $3 WHERE id_empleado = $4 RETURNING *
        `, [usuario, contrasena, id_rol, id_empleado]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_usuarios',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                console.log('error *** ', error);
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ACTUALIZAR CONTRASEÑA
    CambiarPasswordUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { contrasena, id_empleado, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [id_empleado]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuarios',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar usuario con id_empleado: ${id_empleado}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        UPDATE eu_usuarios SET contrasena = $1 WHERE id_empleado = $2
        `, [contrasena, id_empleado]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'usuarios',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{contrasena: ${contrasena}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // ADMINISTRACION DEL MODULO DE ALIMENTACION
    RegistrarAdminComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { admin_comida, id_empleado, user_name, ip } = req.body;
                const adminComida = (yield admin_comida.toLowerCase()) === 'si' ? true : false;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [id_empleado]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuarios',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar usuario con id_empleado: ${id_empleado}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                const actualizacion = yield database_1.default.query(`
        UPDATE eu_usuarios SET administra_comida = $1 WHERE id_empleado = $2 RETURNING *
        `, [adminComida, id_empleado]);
                const [datosNuevos] = actualizacion.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_usuarios',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null
                });
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
    /** ************************************************************************************* **
     ** **                METODO FRASE DE SEGURIDAD ADMINISTRADOR                          ** **
     ** ************************************************************************************* **/
    // METODO PARA GUARDAR FRASE DE SEGURIDAD
    ActualizarFrase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { frase, id_empleado, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [id_empleado]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuarios',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar usuario con id_empleado: ${id_empleado}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        UPDATE eu_usuarios SET frase = $1 WHERE id_empleado = $2
        `, [frase, id_empleado]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_usuarios',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{frase: ${frase}}`,
                    ip,
                    observacion: null
                });
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
    /** ******************************************************************************************** **
     ** **               METODO PARA MANEJAR DATOS DE USUARIOS TIMBRE WEB                         ** **
     ** ******************************************************************************************** **/
    /**
     * @returns Retorna Array de [Sucursales[Regimen[Departamentos[Cargos[empleados[]]]]]]
     **/
    // METODO PARA LEER DATOS PERFIL SUPER-ADMINISTRADOR
    UsuariosTimbreWeb_SUPERADMIN(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            let habilitado = req.params.habilitado;
            // CONSULTA DE BUSQUEDA DE SUCURSALES
            let sucursal_ = yield database_1.default.query(`
      SELECT ig.id_suc, ig.name_suc 
      FROM informacion_general AS ig
      GROUP BY ig.id_suc, ig.name_suc
      ORDER BY ig.name_suc ASC
      `).then((result) => { return result.rows; });
            if (sucursal_.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE REGIMEN
            let regimen_ = yield Promise.all(sucursal_.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield database_1.default.query(`
        SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        FROM informacion_general AS ig
        WHERE ig.id_suc = $1
        GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        ORDER BY ig.name_suc ASC
        `, [reg.id_suc]).then((result) => { return result.rows; });
                return reg;
            })));
            let lista_regimen = regimen_.filter((obj) => {
                return obj.regimenes.length > 0;
            });
            if (lista_regimen.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
            let departamentos_ = yield Promise.all(lista_regimen.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield database_1.default.query(`
          SELECT DISTINCT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          FROM informacion_general AS ig
          WHERE ig.id_regimen = $1 AND ig.id_suc = $2
          GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          ORDER BY ig.name_suc ASC
          `, [dep.id_regimen, dep.id_suc]).then((result) => { return result.rows; });
                    return dep;
                })));
                return reg;
            })));
            let lista_departamentos = departamentos_.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    return dep.departamentos.length > 0;
                });
                return reg;
            });
            if (lista_departamentos.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE CARGOS
            let cargos_ = yield Promise.all(lista_departamentos.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield database_1.default.query(`
            SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen,
              ig.name_regimen
            FROM informacion_general AS ig
            WHERE ig.id_depa = $1 AND ig.id_suc = $2 AND ig.id_regimen = $3
            GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen, 
              ig.name_regimen
            ORDER BY ig.name_suc ASC
            `, [car.id_depa, car.id_suc, car.id_regimen]).then((result) => { return result.rows; });
                        return car;
                    })));
                    return dep;
                })));
                return reg;
            })));
            let lista_cargos = cargos_.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    dep.departamentos = dep.departamentos.filter((car) => {
                        return car.cargos.length > 0;
                    });
                    return dep;
                });
                return reg;
            });
            if (lista_cargos.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
            let lista = yield Promise.all(lista_cargos.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield Promise.all(car.cargos.map((empl) => __awaiter(this, void 0, void 0, function* () {
                            empl.empleado = yield database_1.default.query(`
              SELECT ig.*, u.usuario, u.web_habilita, u.id AS userid
              FROM informacion_general AS ig, eu_usuarios AS u 
              WHERE ig.id_cargo_= $1 AND ig.id_suc = $2 AND ig.estado = $3
                AND ig.id_depa = $4 AND ig.id_regimen = $5 AND u.id_empleado = ig.id
                AND u.web_habilita = $6
              `, [empl.id_cargo_, empl.id_suc, estado, empl.id_depa, empl.id_regimen, habilitado])
                                .then((result) => { return result.rows; });
                            return empl;
                        })));
                        return car;
                    })));
                    return dep;
                })));
                return reg;
            })));
            let empleados = lista.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    dep.departamentos = dep.departamentos.filter((car) => {
                        car.cargos = car.cargos.filter((empl) => {
                            return empl.empleado.length > 0;
                        });
                        return car;
                    }).filter((car) => {
                        return car.cargos.length > 0;
                    });
                    return dep;
                }).filter((dep) => {
                    return dep.departamentos.length > 0;
                });
                return reg;
            }).filter((reg) => {
                return reg.regimenes.length > 0;
            });
            if (empleados.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(empleados);
        });
    }
    // METODO PARA LEER DATOS PERFIL ADMINISTRADOR
    UsuariosTimbreWeb_ADMIN(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            let habilitado = req.params.habilitado;
            let { id_sucursal } = req.body;
            // CONSULTA DE BUSQUEDA DE SUCURSALES
            let sucursal_ = yield database_1.default.query("SELECT ig.id_suc, ig.name_suc " +
                "FROM informacion_general AS ig " +
                "WHERE ig.id_suc IN (" + id_sucursal + ")" +
                "GROUP BY ig.id_suc, ig.name_suc " +
                "ORDER BY ig.name_suc ASC").then((result) => { return result.rows; });
            if (sucursal_.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE REGIMEN
            let regimen_ = yield Promise.all(sucursal_.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield database_1.default.query(`
        SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        FROM informacion_general AS ig
        WHERE ig.id_suc = $1
        GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        ORDER BY ig.name_suc ASC
        `, [reg.id_suc]).then((result) => { return result.rows; });
                return reg;
            })));
            let lista_regimen = regimen_.filter((obj) => {
                return obj.regimenes.length > 0;
            });
            if (lista_regimen.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
            let departamentos_ = yield Promise.all(lista_regimen.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield database_1.default.query(`
          SELECT DISTINCT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          FROM informacion_general AS ig
          WHERE ig.id_regimen = $1 AND ig.id_suc = $2
          GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          ORDER BY ig.name_suc ASC
          `, [dep.id_regimen, dep.id_suc]).then((result) => { return result.rows; });
                    return dep;
                })));
                return reg;
            })));
            let lista_departamentos = departamentos_.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    return dep.departamentos.length > 0;
                });
                return reg;
            });
            if (lista_departamentos.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE CARGOS
            let cargos_ = yield Promise.all(lista_departamentos.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield database_1.default.query(`
              SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen,
                  ig.name_regimen
              FROM informacion_general AS ig
              WHERE ig.id_depa = $1 AND ig.id_suc = $2 AND ig.id_regimen = $3
              GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen, 
                  ig.name_regimen
              ORDER BY ig.name_suc ASC
            `, [car.id_depa, car.id_suc, car.id_regimen]).then((result) => { return result.rows; });
                        return car;
                    })));
                    return dep;
                })));
                return reg;
            })));
            let lista_cargos = cargos_.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    dep.departamentos = dep.departamentos.filter((car) => {
                        return car.cargos.length > 0;
                    });
                    return dep;
                });
                return reg;
            });
            if (lista_cargos.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
            let lista = yield Promise.all(lista_cargos.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield Promise.all(car.cargos.map((empl) => __awaiter(this, void 0, void 0, function* () {
                            empl.empleado = yield database_1.default.query(`
              SELECT ig.*, u.usuario, u.web_habilita, u.id AS userid
              FROM informacion_general AS ig, eu_usuarios AS u 
              WHERE ig.id_cargo_= $1 AND ig.id_suc = $2 AND ig.estado = $3
                AND ig.id_depa = $4 AND ig.id_regimen = $5 AND u.id_empleado = ig.id
                AND u.web_habilita = $6
              `, [empl.id_cargo_, empl.id_suc, estado, empl.id_depa, empl.id_regimen, habilitado])
                                .then((result) => { return result.rows; });
                            return empl;
                        })));
                        return car;
                    })));
                    return dep;
                })));
                return reg;
            })));
            let empleados = lista.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    dep.departamentos = dep.departamentos.filter((car) => {
                        car.cargos = car.cargos.filter((empl) => {
                            return empl.empleado.length > 0;
                        });
                        return car;
                    }).filter((car) => {
                        return car.cargos.length > 0;
                    });
                    return dep;
                }).filter((dep) => {
                    return dep.departamentos.length > 0;
                });
                return reg;
            }).filter((reg) => {
                return reg.regimenes.length > 0;
            });
            if (empleados.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(empleados);
        });
    }
    // METODO PARA LEER DATOS PERFIL ADMINISTRADOR JEFE
    UsuariosTimbreWeb_JEFE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            let habilitado = req.params.habilitado;
            let { id_sucursal, id_departamento } = req.body;
            // CONSULTA DE BUSQUEDA DE SUCURSALES
            let sucursal_ = yield database_1.default.query("SELECT ig.id_suc, ig.name_suc " +
                "FROM informacion_general AS ig " +
                "WHERE ig.id_suc IN (" + id_sucursal + ")" +
                "GROUP BY ig.id_suc, ig.name_suc " +
                "ORDER BY ig.name_suc ASC").then((result) => { return result.rows; });
            if (sucursal_.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE REGIMEN
            let regimen_ = yield Promise.all(sucursal_.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield database_1.default.query(`
        SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        FROM informacion_general AS ig
        WHERE ig.id_suc = $1
        GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        ORDER BY ig.name_suc ASC
        `, [reg.id_suc]).then((result) => { return result.rows; });
                return reg;
            })));
            let lista_regimen = regimen_.filter((obj) => {
                return obj.regimenes.length > 0;
            });
            if (lista_regimen.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
            let departamentos_ = yield Promise.all(lista_regimen.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield database_1.default.query("SELECT DISTINCT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen " +
                        "FROM informacion_general AS ig " +
                        "WHERE ig.id_regimen = $1 AND ig.id_suc = $2 AND ig.id_depa IN (" + id_departamento + ")" +
                        "GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen " +
                        "ORDER BY ig.name_suc ASC ", [dep.id_regimen, dep.id_suc]).then((result) => { return result.rows; });
                    return dep;
                })));
                return reg;
            })));
            let lista_departamentos = departamentos_.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    return dep.departamentos.length > 0;
                });
                return reg;
            });
            if (lista_departamentos.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE CARGOS
            let cargos_ = yield Promise.all(lista_departamentos.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield database_1.default.query(`
            SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen,
              ig.name_regimen
            FROM informacion_general AS ig
            WHERE ig.id_depa = $1 AND ig.id_suc = $2 AND ig.id_regimen = $3
            GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen, 
              ig.name_regimen
            ORDER BY ig.name_suc ASC
            `, [car.id_depa, car.id_suc, car.id_regimen]).then((result) => { return result.rows; });
                        return car;
                    })));
                    return dep;
                })));
                return reg;
            })));
            let lista_cargos = cargos_.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    dep.departamentos = dep.departamentos.filter((car) => {
                        return car.cargos.length > 0;
                    });
                    return dep;
                });
                return reg;
            });
            if (lista_cargos.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
            let lista = yield Promise.all(lista_cargos.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield Promise.all(car.cargos.map((empl) => __awaiter(this, void 0, void 0, function* () {
                            empl.empleado = yield database_1.default.query(`
              SELECT ig.*, u.usuario, u.web_habilita, u.id AS userid
              FROM informacion_general AS ig, eu_usuarios AS u 
              WHERE ig.id_cargo_= $1 AND ig.id_suc = $2 AND ig.estado = $3
                AND ig.id_depa = $4 AND ig.id_regimen = $5 AND u.id_empleado = ig.id
                AND u.web_habilita = $6
              `, [empl.id_cargo_, empl.id_suc, estado, empl.id_depa, empl.id_regimen, habilitado])
                                .then((result) => { return result.rows; });
                            return empl;
                        })));
                        return car;
                    })));
                    return dep;
                })));
                return reg;
            })));
            let empleados = lista.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    dep.departamentos = dep.departamentos.filter((car) => {
                        car.cargos = car.cargos.filter((empl) => {
                            return empl.empleado.length > 0;
                        });
                        return car;
                    }).filter((car) => {
                        return car.cargos.length > 0;
                    });
                    return dep;
                }).filter((dep) => {
                    return dep.departamentos.length > 0;
                });
                return reg;
            }).filter((reg) => {
                return reg.regimenes.length > 0;
            });
            if (empleados.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(empleados);
        });
    }
    // METODO PARA ACTUALIZAR ESTADO DE TIMBRE WEB
    ActualizarEstadoTimbreWeb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { array, user_name, ip } = req.body;
                if (array.length === 0)
                    return res.status(400).jsonp({ message: 'No se ha encontrado registros.' });
                const nuevo = yield Promise.all(array.map((o) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // INICIA TRANSACCION
                        yield database_1.default.query('BEGIN');
                        // CONSULTA DATOSORIGINALES
                        const consulta = yield database_1.default.query(`SELECT * FROM eu_usuarios WHERE id = $1`, [o.userid]);
                        const [datosOriginales] = consulta.rows;
                        if (!datosOriginales) {
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_usuarios',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al actualizar usuario con id: ${o.userid}. Registro no encontrado.`
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                        }
                        const [result] = yield database_1.default.query(`
            UPDATE eu_usuarios SET web_habilita = $1 WHERE id = $2 RETURNING id
            `, [!o.web_habilita, o.userid])
                            .then((result) => { return result.rows; });
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_usuarios',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(datosOriginales),
                            datosNuevos: `{web_habilita: ${!o.web_habilita}}`,
                            ip,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        return result;
                    }
                    catch (error) {
                        // REVERTIR TRANSACCION
                        yield database_1.default.query('ROLLBACK');
                        return { error: error.toString() };
                    }
                })));
                return res.status(200).jsonp({ message: 'Datos actualizados exitosamente.', nuevo });
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    /** ******************************************************************************************** **
     ** **               METODO PARA MANEJAR DATOS DE USUARIOS TIMBRE MOVIL                       ** **
     ** ******************************************************************************************** **/
    /**
     * @returns Retorna Array de [Sucursales[Regimen[Departamentos[Cargos[empleados[]]]]]]
     **/
    // METODO PARA LEER DATOS PERFIL SUPER-ADMINISTRADOR
    UsuariosTimbreMovil_SUPERADMIN(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            let habilitado = req.params.habilitado;
            // CONSULTA DE BUSQUEDA DE SUCURSALES
            let sucursal_ = yield database_1.default.query(`
      SELECT ig.id_suc, ig.name_suc FROM informacion_general AS ig
      GROUP BY ig.id_suc, ig.name_suc
      ORDER BY ig.name_suc ASC
      `).then((result) => { return result.rows; });
            if (sucursal_.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE REGIMEN
            let regimen_ = yield Promise.all(sucursal_.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield database_1.default.query(`
        SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        FROM informacion_general AS ig
        WHERE ig.id_suc = $1
        GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        ORDER BY ig.name_suc ASC
        `, [reg.id_suc]).then((result) => { return result.rows; });
                return reg;
            })));
            let lista_regimen = regimen_.filter((obj) => {
                return obj.regimenes.length > 0;
            });
            if (lista_regimen.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
            let departamentos_ = yield Promise.all(lista_regimen.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield database_1.default.query(`
          SELECT DISTINCT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          FROM informacion_general AS ig
          WHERE ig.id_regimen = $1 AND ig.id_suc = $2
          GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          ORDER BY ig.name_suc ASC
          `, [dep.id_regimen, dep.id_suc]).then((result) => { return result.rows; });
                    return dep;
                })));
                return reg;
            })));
            let lista_departamentos = departamentos_.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    return dep.departamentos.length > 0;
                });
                return reg;
            });
            if (lista_departamentos.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE CARGOS
            let cargos_ = yield Promise.all(lista_departamentos.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield database_1.default.query(`
            SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen,
              ig.name_regimen
            FROM informacion_general AS ig
            WHERE ig.id_depa = $1 AND ig.id_suc = $2 AND ig.id_regimen = $3
            GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen, 
              ig.name_regimen
            ORDER BY ig.name_suc ASC
            `, [car.id_depa, car.id_suc, car.id_regimen]).then((result) => { return result.rows; });
                        return car;
                    })));
                    return dep;
                })));
                return reg;
            })));
            let lista_cargos = cargos_.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    dep.departamentos = dep.departamentos.filter((car) => {
                        return car.cargos.length > 0;
                    });
                    return dep;
                });
                return reg;
            });
            if (lista_cargos.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
            let lista = yield Promise.all(lista_cargos.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield Promise.all(car.cargos.map((empl) => __awaiter(this, void 0, void 0, function* () {
                            empl.empleado = yield database_1.default.query(`
              SELECT ig.*, u.usuario, u.app_habilita, u.id AS userid
              FROM informacion_general AS ig, eu_usuarios AS u 
              WHERE ig.id_cargo_= $1 AND ig.id_suc = $2 AND ig.estado = $3
                AND ig.id_depa = $4 AND ig.id_regimen = $5 AND u.id_empleado = ig.id
                AND u.app_habilita = $6
              `, [empl.id_cargo_, empl.id_suc, estado, empl.id_depa, empl.id_regimen, habilitado])
                                .then((result) => { return result.rows; });
                            return empl;
                        })));
                        return car;
                    })));
                    return dep;
                })));
                return reg;
            })));
            let empleados = lista.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    dep.departamentos = dep.departamentos.filter((car) => {
                        car.cargos = car.cargos.filter((empl) => {
                            return empl.empleado.length > 0;
                        });
                        return car;
                    }).filter((car) => {
                        return car.cargos.length > 0;
                    });
                    return dep;
                }).filter((dep) => {
                    return dep.departamentos.length > 0;
                });
                return reg;
            }).filter((reg) => {
                return reg.regimenes.length > 0;
            });
            if (empleados.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(empleados);
        });
    }
    // METODO PARA LEER DATOS PERFIL ADMINISTRADOR
    UsuariosTimbreMovil_ADMIN(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            let habilitado = req.params.habilitado;
            let { id_sucursal } = req.body;
            // CONSULTA DE BUSQUEDA DE SUCURSALES
            let sucursal_ = yield database_1.default.query("SELECT ig.id_suc, ig.name_suc " +
                "FROM informacion_general AS ig " +
                "WHERE ig.id_suc IN (" + id_sucursal + ")" +
                "GROUP BY ig.id_suc, ig.name_suc " +
                "ORDER BY ig.name_suc ASC").then((result) => { return result.rows; });
            if (sucursal_.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE REGIMEN
            let regimen_ = yield Promise.all(sucursal_.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield database_1.default.query(`
        SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        FROM informacion_general AS ig
        WHERE ig.id_suc = $1
        GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        ORDER BY ig.name_suc ASC
        `, [reg.id_suc]).then((result) => { return result.rows; });
                return reg;
            })));
            let lista_regimen = regimen_.filter((obj) => {
                return obj.regimenes.length > 0;
            });
            if (lista_regimen.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
            let departamentos_ = yield Promise.all(lista_regimen.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield database_1.default.query(`
          SELECT DISTINCT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          FROM informacion_general AS ig
          WHERE ig.id_regimen = $1 AND ig.id_suc = $2
          GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          ORDER BY ig.name_suc ASC
          `, [dep.id_regimen, dep.id_suc]).then((result) => { return result.rows; });
                    return dep;
                })));
                return reg;
            })));
            let lista_departamentos = departamentos_.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    return dep.departamentos.length > 0;
                });
                return reg;
            });
            if (lista_departamentos.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE CARGOS
            let cargos_ = yield Promise.all(lista_departamentos.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield database_1.default.query(`
            SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen,
              ig.name_regimen
            FROM informacion_general AS ig
            WHERE ig.id_depa = $1 AND ig.id_suc = $2 AND ig.id_regimen = $3
            GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen, 
              ig.name_regimen
            ORDER BY ig.name_suc ASC
            `, [car.id_depa, car.id_suc, car.id_regimen]).then((result) => { return result.rows; });
                        return car;
                    })));
                    return dep;
                })));
                return reg;
            })));
            let lista_cargos = cargos_.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    dep.departamentos = dep.departamentos.filter((car) => {
                        return car.cargos.length > 0;
                    });
                    return dep;
                });
                return reg;
            });
            if (lista_cargos.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
            let lista = yield Promise.all(lista_cargos.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield Promise.all(car.cargos.map((empl) => __awaiter(this, void 0, void 0, function* () {
                            empl.empleado = yield database_1.default.query(`
              SELECT ig.*, u.usuario, u.app_habilita, u.id AS userid
              FROM informacion_general AS ig, eu_usuarios AS u 
              WHERE ig.id_cargo_= $1 AND ig.id_suc = $2 AND ig.estado = $3
                AND ig.id_depa = $4 AND ig.id_regimen = $5 AND u.id_empleado = ig.id
                AND u.app_habilita = $6
              `, [empl.id_cargo_, empl.id_suc, estado, empl.id_depa, empl.id_regimen, habilitado])
                                .then((result) => { return result.rows; });
                            return empl;
                        })));
                        return car;
                    })));
                    return dep;
                })));
                return reg;
            })));
            let empleados = lista.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    dep.departamentos = dep.departamentos.filter((car) => {
                        car.cargos = car.cargos.filter((empl) => {
                            return empl.empleado.length > 0;
                        });
                        return car;
                    }).filter((car) => {
                        return car.cargos.length > 0;
                    });
                    return dep;
                }).filter((dep) => {
                    return dep.departamentos.length > 0;
                });
                return reg;
            }).filter((reg) => {
                return reg.regimenes.length > 0;
            });
            if (empleados.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(empleados);
        });
    }
    // METODO PARA LEER DATOS PERFIL ADMINISTRADOR JEFE
    UsuariosTimbreMovil_JEFE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            let habilitado = req.params.habilitado;
            let { id_sucursal, id_departamento } = req.body;
            // CONSULTA DE BUSQUEDA DE SUCURSALES
            let sucursal_ = yield database_1.default.query("SELECT ig.id_suc, ig.name_suc " +
                "FROM informacion_general AS ig " +
                "WHERE ig.id_suc IN (" + id_sucursal + ")" +
                "GROUP BY ig.id_suc, ig.name_suc " +
                "ORDER BY ig.name_suc ASC").then((result) => { return result.rows; });
            if (sucursal_.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE REGIMEN
            let regimen_ = yield Promise.all(sucursal_.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield database_1.default.query(`
        SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        FROM informacion_general AS ig
        WHERE ig.id_suc = $1
        GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        ORDER BY ig.name_suc ASC
        `, [reg.id_suc]).then((result) => { return result.rows; });
                return reg;
            })));
            let lista_regimen = regimen_.filter((obj) => {
                return obj.regimenes.length > 0;
            });
            if (lista_regimen.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
            let departamentos_ = yield Promise.all(lista_regimen.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield database_1.default.query("SELECT DISTINCT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen " +
                        "FROM informacion_general AS ig " +
                        "WHERE ig.id_regimen = $1 AND ig.id_suc = $2 AND ig.id_depa IN (" + id_departamento + ")" +
                        "GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen " +
                        "ORDER BY ig.name_suc ASC", [dep.id_regimen, dep.id_suc]).then((result) => { return result.rows; });
                    return dep;
                })));
                return reg;
            })));
            let lista_departamentos = departamentos_.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    return dep.departamentos.length > 0;
                });
                return reg;
            });
            if (lista_departamentos.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE CARGOS
            let cargos_ = yield Promise.all(lista_departamentos.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield database_1.default.query(`
            SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen,
              ig.name_regimen
            FROM informacion_general AS ig
            WHERE ig.id_depa = $1 AND ig.id_suc = $2 AND ig.id_regimen = $3
            GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen, 
              ig.name_regimen
            ORDER BY ig.name_suc ASC
            `, [car.id_depa, car.id_suc, car.id_regimen]).then((result) => { return result.rows; });
                        return car;
                    })));
                    return dep;
                })));
                return reg;
            })));
            let lista_cargos = cargos_.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    dep.departamentos = dep.departamentos.filter((car) => {
                        return car.cargos.length > 0;
                    });
                    return dep;
                });
                return reg;
            });
            if (lista_cargos.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
            let lista = yield Promise.all(lista_cargos.map((reg) => __awaiter(this, void 0, void 0, function* () {
                reg.regimenes = yield Promise.all(reg.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield Promise.all(car.cargos.map((empl) => __awaiter(this, void 0, void 0, function* () {
                            empl.empleado = yield database_1.default.query(`
              SELECT ig.*, u.usuario, u.app_habilita, u.id AS userid
              FROM informacion_general AS ig, eu_usuarios AS u 
              WHERE ig.id_cargo_= $1 AND ig.id_suc = $2 AND ig.estado = $3
                AND ig.id_depa = $4 AND ig.id_regimen = $5 AND u.id_empleado = ig.id
                AND u.app_habilita = $6
              `, [empl.id_cargo_, empl.id_suc, estado, empl.id_depa, empl.id_regimen, habilitado])
                                .then((result) => { return result.rows; });
                            return empl;
                        })));
                        return car;
                    })));
                    return dep;
                })));
                return reg;
            })));
            let empleados = lista.map((reg) => {
                reg.regimenes = reg.regimenes.filter((dep) => {
                    dep.departamentos = dep.departamentos.filter((car) => {
                        car.cargos = car.cargos.filter((empl) => {
                            return empl.empleado.length > 0;
                        });
                        return car;
                    }).filter((car) => {
                        return car.cargos.length > 0;
                    });
                    return dep;
                }).filter((dep) => {
                    return dep.departamentos.length > 0;
                });
                return reg;
            }).filter((reg) => {
                return reg.regimenes.length > 0;
            });
            if (empleados.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(empleados);
        });
    }
    // METODO PARA ACTUALIZAR ESTADO DE TIMBRE MOVIL
    ActualizarEstadoTimbreMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { array, user_name, ip } = req.body;
                if (array.length === 0)
                    return res.status(400).jsonp({ message: 'No se ha encontrado registros.' });
                const nuevo = yield Promise.all(array.map((o) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // INICIA TRANSACCION
                        yield database_1.default.query('BEGIN');
                        // CONSULTA DATOSORIGINALES
                        const consulta = yield database_1.default.query(`SELECT * FROM eu_usuarios WHERE id = $1`, [o.userid]);
                        const [datosOriginales] = consulta.rows;
                        if (!datosOriginales) {
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'eu_usuarios',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al actualizar usuario con id: ${o.userid}. Registro no encontrado.`
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                        }
                        const [result] = yield database_1.default.query(`
            UPDATE eu_usuarios SET app_habilita = $1 WHERE id = $2 RETURNING id
            `, [!o.app_habilita, o.userid])
                            .then((result) => { return result.rows; });
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_usuarios',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: JSON.stringify(datosOriginales),
                            datosNuevos: `{"app_habilita": ${!o.app_habilita}}`,
                            ip,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        return result;
                    }
                    catch (error) {
                        // REVERTIR TRANSACCION
                        yield database_1.default.query('ROLLBACK');
                        return { error: error.toString() };
                    }
                })));
                return res.status(200).jsonp({ message: 'Datos actualizados exitosamente.', nuevo });
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    /** ******************************************************************************************** **
     ** **            METODO PARA MANEJAR DATOS DE REGISTRO DE DISPOSITIVOS MOVILES               ** **
     ** ******************************************************************************************** **/
    // LISTADO DE DISPOSITIVOS REGISTRADOS POR EL ID DE USUARIO
    ListarDispositivosMoviles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const DISPOSITIVOS = yield database_1.default.query(`
        SELECT e.codigo, (e.nombre || \' \' || e.apellido) AS nombre, e.cedula, d.id_dispositivo, d.modelo_dispositivo
        FROM mrv_dispositivos AS d 
        INNER JOIN eu_empleados AS e ON d.id_empleado = e.id
        ORDER BY nombre
        `).then((result) => { return result.rows; });
                if (DISPOSITIVOS.length === 0)
                    return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
                return res.status(200).jsonp(DISPOSITIVOS);
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS DE DISPOSITIVOS MOVILES
    EliminarDispositivoMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const array = req.params.dispositivo;
                let dispositivos = array.split(',');
                if (dispositivos.length === 0)
                    return res.status(400).jsonp({ message: 'No se han encontrado registros.' });
                const nuevo = yield Promise.all(dispositivos.map((id_dispo) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        // CONSULTA DATOSORIGINALES
                        const consulta = yield database_1.default.query(`SELECT * FROM mrv_dispositivos WHERE id_dispositivo = $1`, [id_dispo]);
                        const [datosOriginales] = consulta.rows;
                        if (!datosOriginales) {
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'mrv_dispositivos',
                                usuario: user_name,
                                accion: 'D',
                                datosOriginales: '',
                                datosNuevos: '',
                                ip,
                                observacion: `Error al eliminar dispositivo con id: ${id_dispo}. Registro no encontrado.`
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                        }
                        const [result] = yield database_1.default.query(`
            DELETE FROM mrv_dispositivos WHERE id_dispositivo = $1 RETURNING *
            `, [id_dispo])
                            .then((result) => { return result.rows; });
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'mrv_dispositivos',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: JSON.stringify(datosOriginales),
                            datosNuevos: '',
                            ip,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        return result;
                    }
                    catch (error) {
                        // REVERTIR TRANSACCION
                        yield database_1.default.query('ROLLBACK');
                        return { error: error.toString() };
                    }
                })));
                return res.status(200).jsonp({ message: 'Datos eliminados exitosamente.', nuevo });
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    /** ******************************************************************************************************************* **
     ** **                           ENVIAR CORREO PARA CAMBIAR FRASE DE SEGURIDAD                                       ** **
     ** ******************************************************************************************************************* **/
    RestablecerFrase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const correo = req.body.correo;
            const url_page = req.body.url_page;
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            const correoValido = yield database_1.default.query(`
      SELECT e.id, e.nombre, e.apellido, e.correo, u.usuario, u.contrasena 
      FROM eu_empleados AS e, eu_usuarios AS u 
      WHERE e.correo = $1 AND u.id_empleado = e.id
      `, [correo]);
            if (correoValido.rows[0] == undefined)
                return res.status(401).send('Correo de usuario no válido.');
            var datos = yield (0, settingsMail_1.Credenciales)(1);
            if (datos === 'ok') {
                const token = jsonwebtoken_1.default.sign({ _id: correoValido.rows[0].id }, process.env.TOKEN_SECRET_MAIL || 'llaveEmail', { expiresIn: 60 * 5, algorithm: 'HS512' });
                var url = url_page + '/recuperar-frase';
                let data = {
                    to: correoValido.rows[0].correo,
                    from: settingsMail_1.email,
                    subject: 'FULLTIME CAMBIO FRASE DE SEGURIDAD',
                    html: `
          <body>
            <div style="text-align: center;">
              <img width="100%" height="100%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar que se ha enviado un link para cambiar su frase de seguridad. <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
              <b>Asunto:</b> CAMBIAR FRASE DE SEGURIDAD <br> 
              <b>Colaborador que envía:</b> ${correoValido.rows[0].nombre} ${correoValido.rows[0].apellido} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">CAMBIAR FRASE DE SEGURIDAD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Ingrese al siguiente link y registre una nueva frase de seguridad.</b> <br>   
              <a href="${url}/${token}">${url}/${token}</a>  
            </p>
            <p style="font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Gracias por la atención</b><br>
              <b>Saludos cordiales,</b> <br><br>
            </p>
            <img src="cid:pief" width="100%" height="100%"/>
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
    // METODO PARA CAMBIAR FRASE DE SEGURIDAD
    CambiarFrase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var token = req.body.token;
            var frase = req.body.frase;
            const { user_name, ip } = req.body;
            try {
                const payload = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET_MAIL || 'llaveEmail');
                const id_empleado = payload._id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTA DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [id_empleado]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuarios',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar usuario con id: ${id_empleado}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        UPDATE eu_usuarios SET frase = $2 WHERE id_empleado = $1
        `, [id_empleado, frase]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_usuarios',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{"frase": "${frase}"}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ expiro: 'no', message: "Frase de seguridad actualizada." });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ expiro: 'si', message: "Tiempo para cambiar su frase de seguridad ha expirado." });
            }
        });
    }
    /** ************************************************************************************************** **
     ** **                           METODOS TABLA USUARIO - DEPARTAMENTO                               ** **
     ** ************************************************************************************************** */
    // BUSCAR LISTA DE ID_SUCURSAL DE ASIGNACION USUARIO - DEPARTAMENTO
    BuscarUsuarioSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.body;
            const USUARIOS = yield database_1.default.query(`
      SELECT DISTINCT d.id_sucursal
      FROM eu_usuario_departamento AS ud
      JOIN ed_departamentos AS d ON ud.id_departamento = d.id 
      WHERE id_empleado = $1
      `, [id_empleado]);
            if (USUARIOS.rowCount != 0) {
                return res.jsonp(USUARIOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // CREAR REGISTRO DE USUARIOS - DEPARTAMENTO
    CrearUsuarioDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, id_departamento, principal, personal, administra, user_name, ip } = req.body;
                // INICIA TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
        INSERT INTO eu_usuario_departamento (id_empleado, id_departamento, principal, personal, administra) 
        VALUES ($1, $2, $3, $4, $5)
        `, [id_empleado, id_departamento, principal, personal, administra]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_usuario_departamento',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{"id_empleado": ${id_empleado}, "id_departamento": ${id_departamento}, "principal": ${principal}, "personal": ${personal}, "administra": ${administra}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    //BUSCAR DATOS DE USUARIOS - DEPARTAMENTO
    BuscarUsuarioDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.body;
            const USUARIOS = yield database_1.default.query(`
      SELECT ud.id, e.nombre, e.apellido, d.nombre AS departamento, d.id AS id_departamento, 
      s.id AS id_sucursal, s.nombre AS sucursal, ud.principal, ud.personal, ud.administra
      FROM eu_usuario_departamento AS ud
      INNER JOIN eu_empleados AS e ON ud.id_empleado=e.id
      INNER JOIN ed_departamentos AS d ON ud.id_departamento=d.id
      INNER JOIN e_sucursales AS s ON d.id_sucursal=s.id
      WHERE id_empleado = $1
      ORDER BY ud.id ASC
      `, [id_empleado]);
            if (USUARIOS.rowCount != 0) {
                return res.jsonp(USUARIOS.rows);
            }
            else {
                return res.jsonp(null);
            }
        });
    }
    // BUSCAR ASIGNACION DE USUARIO - DEPARTAMENTO
    BuscarAsignacionUsuarioDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.body;
            const USUARIOS = yield database_1.default.query(`
      SELECT * FROM eu_usuario_departamento WHERE id_empleado = $1 
      AND principal = true
      `, [id_empleado]);
            if (USUARIOS.rowCount != 0) {
                return res.jsonp(USUARIOS.rows);
            }
            else {
                return res.jsonp(null);
            }
        });
    }
    // ACTUALIZAR DATOS DE USUARIOS - DEPARTAMENTO
    ActualizarUsuarioDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, id_departamento, principal, personal, administra, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTA DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM eu_usuario_departamento WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuario_departamento',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar registro con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                const datosActuales = yield database_1.default.query(`
        UPDATE eu_usuario_departamento SET id_departamento = $2, principal = $3, personal = $4, administra = $5 
        WHERE id = $1 RETURNING *
        `, [id, id_departamento, principal, personal, administra]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_usuario_departamento',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosActuales.rows[0]),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ELIMINAR ASIGNACIONES DE USUARIO - DEPARTAMENTO
    EliminarUsuarioDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip, id } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTA DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM eu_usuario_departamento WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuario_departamento',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar eu_usuario_departamento con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        DELETE FROM eu_usuario_departamento WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_usuario_departamento',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip,
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
    // METODO PARA REGISTRAR MULTIPLES ASIGNACIONES DE USUARIO - DEPARTAMENTO
    RegistrarUsuarioDepartamentoMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { usuarios_seleccionados, departamentos_seleccionados, isPersonal, user_name, ip } = req.body;
            let error = false;
            for (const usuario of usuarios_seleccionados) {
                let datos = {
                    id: '',
                    id_empleado: usuario.id,
                    id_departamento: '',
                    principal: false,
                    personal: false,
                    administra: false,
                    user_name: user_name,
                    ip: ip,
                };
                if (isPersonal) {
                    datos.id_departamento = usuario.id_departamento;
                    const verificacion = yield VerificarAsignaciones(datos, true, isPersonal);
                    if (verificacion === 2) {
                        error = yield EditarUsuarioDepartamento(datos);
                    }
                }
                for (const departamento of departamentos_seleccionados) {
                    datos.id_departamento = departamento.id;
                    datos.administra = true;
                    datos.principal = false;
                    datos.personal = false;
                    const verificacion = yield VerificarAsignaciones(datos, false, isPersonal);
                    switch (verificacion) {
                        case 1:
                            // INSERTAR NUEVA ASIGNACIÓN
                            error = yield RegistrarUsuarioDepartamento(datos);
                            break;
                        case 2:
                            // ACTUALIZAR ASIGNACIÓN EXISTENTE
                            error = yield EditarUsuarioDepartamento(datos);
                            break;
                    }
                }
            }
            if (error)
                return res.status(500).jsonp({ message: 'error' });
            return res.json({ message: 'Proceso completado' });
        });
    }
}
/* @return
    CASOS DE RETORNO
    0: USUARIO NO EXISTE => NO SE EJECUTA NINGUNA ACCION
    1: NO EXISTE LA ASIGNACION => SE PUEDE ASIGNAR (INSERTAR)
    2: EXISTE LA ASIGNACION Y ES PRINCIPAL => SE ACTUALIZA LA ASIGNACION (PRINCIPAL)
    3: EXISTE LA ASIGNACION Y NO ES PRINCIPAL => NO SE EJECUTA NINGUNA ACCION  */ function VerificarAsignaciones(datos, personal, isPersonal) {
    return __awaiter(this, void 0, void 0, function* () { const { id_empleado, id_departamento } = datos; const consulta = yield database_1.default.query(`      SELECT * FROM eu_usuario_departamento WHERE id_empleado = $1 AND id_departamento = $2      `, [id_empleado, id_departamento]); if (consulta.rowCount === 0)
        return 1; const asignacion = consulta.rows[0]; if (asignacion.principal) {
        datos.principal = true;
        datos.id = asignacion.id;
        datos.personal = asignacion.personal;
        if (isPersonal) {
            datos.personal = true;
        }
        if (personal) {
            datos.administra = asignacion.administra;
        }
        return 2;
    } return 3; });
}
function RegistrarUsuarioDepartamento(datos) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id_empleado, id_departamento, principal, personal, administra, user_name, ip } = datos;
            // INICIA TRANSACCION
            yield database_1.default.query('BEGIN');
            const registro = yield database_1.default.query(`
      INSERT INTO eu_usuario_departamento (id_empleado, id_departamento, principal, personal, administra) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *
      `, [id_empleado, id_departamento, principal, personal, administra]);
            const [datosNuevos] = registro.rows;
            // AUDITORIA
            yield auditoriaControlador_1.default.InsertarAuditoria({
                tabla: 'eu_usuario_departamento',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(datosNuevos),
                ip,
                observacion: null
            });
            // FINALIZAR TRANSACCION
            yield database_1.default.query('COMMIT');
            return false;
        }
        catch (error) {
            return true;
        }
    });
}
function EditarUsuarioDepartamento(datos) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id_empleado, id_departamento, principal, personal, administra, user_name, ip } = datos;
            // INICIAR TRANSACCION
            yield database_1.default.query('BEGIN');
            // CONSULTA DATOSORIGINALES
            const consulta = yield database_1.default.query(`
      SELECT * FROM eu_usuario_departamento WHERE id_empleado = $1 AND id_departamento = $2
      `, [id_empleado, id_departamento]);
            const [datosOriginales] = consulta.rows;
            if (!datosOriginales) {
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_usuario_departamento',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar registro con id_empleado: ${id_empleado} y id_departamento: ${id_departamento}. Registro no encontrado.`
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return true;
            }
            const actualizacion = yield database_1.default.query(`
      UPDATE eu_usuario_departamento SET principal = $3, personal = $4, administra = $5
      WHERE id_empleado = $1 AND id_departamento = $2 RETURNING *
      `, [id_empleado, id_departamento, principal, personal, administra]);
            const [datosNuevos] = actualizacion.rows;
            // AUDITORIA
            yield auditoriaControlador_1.default.InsertarAuditoria({
                tabla: 'eu_usuario_departamento',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: JSON.stringify(datosNuevos),
                ip,
                observacion: null
            });
            // FINALIZAR TRANSACCION
            yield database_1.default.query('COMMIT');
            return false;
        }
        catch (error) {
            return true;
        }
    });
}
exports.USUARIO_CONTROLADOR = new UsuarioControlador();
exports.default = exports.USUARIO_CONTROLADOR;
