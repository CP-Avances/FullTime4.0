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
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../../database"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const rsa_keys_service_1 = __importDefault(require("../llaves/rsa-keys.service"));
class UsuarioControlador {
    // CREAR REGISTRO DE USUARIOS
    CrearUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { usuario, contrasena, estado, id_rol, id_empleado } = req.body;
                let contrasena_encriptado = rsa_keys_service_1.default.encriptarLogin(contrasena);
                yield database_1.default.query(`
        INSERT INTO eu_usuarios (usuario, contrasena, estado, id_rol, id_empleado) 
          VALUES ($1, $2, $3, $4, $5)
        `, [usuario, contrasena_encriptado, estado, id_rol, id_empleado]);
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
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
            if (UN_USUARIO.rowCount > 0) {
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
      SELECT e.id, e.id_departamento, e.id_contrato, ed_departamentos.nombre 
      FROM datos_actuales_empleado AS e 
      INNER JOIN ed_departamentos ON e.id_departamento = ed_departamentos.id 
      WHERE id_contrato = $1
      `, [id_empleado]);
            if (EMPLEADO.rowCount > 0) {
                return res.jsonp(EMPLEADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR DATOS DE USUARIO
    ActualizarUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { usuario, contrasena, id_rol, id_empleado } = req.body;
                yield database_1.default.query(`
        UPDATE eu_usuarios SET usuario = $1, contrasena = $2, id_rol = $3 WHERE id_empleado = $4
        `, [usuario, contrasena, id_rol, id_empleado]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ACTUALIZAR CONTRASEÑA
    CambiarPasswordUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { contrasena, id_empleado } = req.body;
            let contrasena_encriptada = rsa_keys_service_1.default.encriptarLogin(contrasena);
            yield database_1.default.query(`
      UPDATE eu_usuarios SET contrasena = $1 WHERE id_empleado = $2
      `, [contrasena_encriptada, id_empleado]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // ADMINISTRACION DEL MODULO DE ALIMENTACION
    RegistrarAdminComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { admin_comida, id_empleado } = req.body;
            yield database_1.default.query(`
      UPDATE eu_usuarios SET administra_comida = $1 WHERE id_empleado = $2
      `, [admin_comida, id_empleado]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    /** ************************************************************************************* **
     ** **                METODO FRASE DE SEGURIDAD ADMINISTRADOR                          ** **
     ** ************************************************************************************* **/
    // METODO PARA GUARDAR FRASE DE SEGURIDAD
    ActualizarFrase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { frase, id_empleado } = req.body;
            yield database_1.default.query(`
      UPDATE eu_usuarios SET frase = $1 WHERE id_empleado = $2
      `, [frase, id_empleado]);
            res.jsonp({ message: 'Registro guardado.' });
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
                        //console.log('ver car ', car)
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
            //console.log('sucursal ', sucursal_)
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
                        //console.log('ver car ', car)
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
                        //console.log('ver car ', car)
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
                const array = req.body;
                if (array.length === 0)
                    return res.status(400).jsonp({ message: 'No se ha encontrado registros.' });
                const nuevo = yield Promise.all(array.map((o) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const [result] = yield database_1.default.query(`
            UPDATE eu_usuarios SET web_habilita = $1 WHERE id = $2 RETURNING id
            `, [!o.web_habilita, o.userid])
                            .then((result) => { return result.rows; });
                        return result;
                    }
                    catch (error) {
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
                        //console.log('ver car ', car)
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
            //console.log('sucursal ', sucursal_)
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
                        //console.log('ver car ', car)
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
                        //console.log('ver car ', car)
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
                console.log(req.body);
                const array = req.body;
                if (array.length === 0)
                    return res.status(400).jsonp({ message: 'No se ha encontrado registros.' });
                const nuevo = yield Promise.all(array.map((o) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const [result] = yield database_1.default.query(`
            UPDATE eu_usuarios SET app_habilita = $1 WHERE id = $2 RETURNING id
            `, [!o.app_habilita, o.userid])
                            .then((result) => { return result.rows; });
                        return result;
                    }
                    catch (error) {
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
    // LISTADO DE DISPOSITIVOS REGISTRADOS POR EL CODIGO DE USUARIO
    ListarDispositivosMoviles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const DISPOSITIVOS = yield database_1.default.query(`
        SELECT e.codigo, (e.nombre || \' \' || e.apellido) AS nombre, e.cedula, d.id_dispositivo, d.modelo_dispositivo
        FROM mrv_dispositivos AS d 
        INNER JOIN eu_empleados AS e ON d.codigo_empleado = e.codigo
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
                const array = req.params.dispositivo;
                let dispositivos = array.split(',');
                if (dispositivos.length === 0)
                    return res.status(400).jsonp({ message: 'No se han encontrado registros.' });
                const nuevo = yield Promise.all(dispositivos.map((id_dispo) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const [result] = yield database_1.default.query(`
            DELETE FROM mrv_dispositivos WHERE id_dispositivo = $1 RETURNING *
            `, [id_dispo])
                            .then((result) => { return result.rows; });
                        return result;
                    }
                    catch (error) {
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
            const cedula = req.body.cedula;
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            const correoValido = yield database_1.default.query(`
      SELECT e.id, e.nombre, e.apellido, e.correo, u.usuario, u.contrasena 
      FROM eu_empleados AS e, eu_usuarios AS u 
      WHERE e.correo = $1 AND u.id_empleado = e.id AND e.cedula = $2  AND u.frase IS NOT NULL 
      `, [correo, cedula]);
            if (correoValido.rows[0] == undefined)
                return res.status(401).send('Correo o cédula o frase de usuario no válido.');
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
              <img width="25%" height="25%" src="cid:cabeceraf"/>
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
    // METODO PARA CAMBIAR FRASE DE SEGURIDAD
    CambiarFrase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var token = req.body.token;
            var frase = req.body.frase;
            try {
                const payload = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET_MAIL || 'llaveEmail');
                const id_empleado = payload._id;
                yield database_1.default.query(`
        UPDATE eu_usuarios SET frase = $2 WHERE id_empleado = $1
        `, [id_empleado, frase]);
                return res.jsonp({ expiro: 'no', message: "Frase de seguridad actualizada." });
            }
            catch (error) {
                return res.jsonp({ expiro: 'si', message: "Tiempo para cambiar su frase de seguridad ha expirado." });
            }
        });
    }
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const USUARIOS = yield database_1.default.query(`
      SELECT * FROM eu_usuarios
      `);
            if (USUARIOS.rowCount > 0) {
                return res.jsonp(USUARIOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    getIdByUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { usuario } = req.params;
            const unUsuario = yield database_1.default.query(`
      SELECT id FROM eu_usuarios WHERE usuario = $1
      `, [usuario]);
            if (unUsuario.rowCount > 0) {
                return res.jsonp(unUsuario.rows);
            }
            else {
                res.status(404).jsonp({ text: 'No se ha encontrado el usuario.' });
            }
        });
    }
    /** ************************************************************************************************** **
     ** **                           METODOS TABLA USUARIO - SUCURSAL                                   ** **
     ** ************************************************************************************************** */
    // BUSCAR DATOS DE USUARIOS - SUCURSAL
    BuscarUsuarioSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.body;
            const USUARIOS = yield database_1.default.query(`
      SELECT * FROM eu_usuario_sucursal WHERE id_empleado = $1
      `, [id_empleado]);
            if (USUARIOS.rowCount > 0) {
                return res.jsonp(USUARIOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // CREAR REGISTRO DE USUARIOS - SUCURSAL
    CrearUsuarioSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, id_sucursal, principal } = req.body;
                yield database_1.default.query(`
        INSERT INTO eu_usuario_sucursal (id_empleado, id_sucursal, principal) 
        VALUES ($1, $2, $3)
        `, [id_empleado, id_sucursal, principal]);
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // BUSCAR DATOS DE USUARIOS - SUCURSAL
    BuscarUsuarioSucursalPrincipal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.body;
            const USUARIOS = yield database_1.default.query(`
      SELECT * FROM eu_usuario_sucursal WHERE id_empleado = $1 AND principal = true;
      `, [id_empleado]);
            if (USUARIOS.rowCount > 0) {
                return res.jsonp(USUARIOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR DATOS DE USUARIO - SUCURSAL
    ActualizarUsuarioSucursalPrincipal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_sucursal, id_empleado } = req.body;
                yield database_1.default.query(`
        UPDATE eu_usuario_sucursal SET id_sucursal = $1 WHERE id_empleado = $2 AND principal = true;
        `, [id_sucursal, id_empleado]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarUsuarioSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM eu_usuario_sucursal WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    //METODO PARA OBTENER TEXTO ENCRIPTADO
    ObtenerDatoEncriptado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { contrasena } = req.body;
                res.jsonp({ message: rsa_keys_service_1.default.encriptarLogin(contrasena) });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
}
exports.USUARIO_CONTROLADOR = new UsuarioControlador();
exports.default = exports.USUARIO_CONTROLADOR;
