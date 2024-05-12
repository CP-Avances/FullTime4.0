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
                const { nombre, id_sucursal } = req.body;
                yield database_1.default.query(`
        INSERT INTO ed_departamentos (nombre, id_sucursal ) VALUES ($1, $2)
        `, [nombre, id_sucursal]);
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // ACTUALIZAR REGISTRO DE DEPARTAMENTO   --**VERIFICADO
    ActualizarDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_sucursal } = req.body;
                const id = req.params.id;
                console.log(id);
                yield database_1.default.query(`
        UPDATE ed_departamentos set nombre = $1, id_sucursal = $2 
        WHERE id = $3
        `, [nombre, id_sucursal, id]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
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
            if (DEPARTAMENTO.rowCount > 0) {
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
            if (DEPARTAMENTO.rowCount > 0) {
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
            if (DEPARTAMENTO.rowCount > 0) {
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
            if (DEPARTAMENTOS.rowCount > 0 && NIVELES.rowCount > 0) {
                NIVELES.rows.forEach((obj) => {
                    DEPARTAMENTOS.rows.push(obj);
                });
                return res.jsonp(DEPARTAMENTOS.rows);
            }
            else if (DEPARTAMENTOS.rowCount > 0) {
                return res.jsonp(DEPARTAMENTOS.rows);
            }
            else if (NIVELES.rowCount > 0) {
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
            if (DEPARTAMENTO.rowCount > 0 && NIVEL.rowCount > 0) {
                DEPARTAMENTO.rows.forEach((obj) => {
                    NIVEL.rows.push(obj);
                });
                return res.jsonp(NIVEL.rows);
            }
            else if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            else if (NIVEL.rowCount > 0) {
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
                yield database_1.default.query(`
        DELETE FROM ed_departamentos WHERE id = $1
        `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    //METODO PARA CREAR NIVELES JERARQUICOS POR DEPARTAMENTOS  --**VERIFICADO
    CrearNivelDepa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_departamento, departamento, nivel, dep_nivel, dep_nivel_nombre, id_establecimiento, id_suc_dep_nivel } = req.body;
                yield database_1.default.query(`
        INSERT INTO ed_niveles_departamento (departamento, id_departamento, nivel, departamento_nombre_nivel, 
          id_departamento_nivel, id_sucursal, id_sucursal_departamento_nivel ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [departamento, id_departamento, nivel, dep_nivel_nombre, dep_nivel, id_establecimiento, id_suc_dep_nivel]);
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
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
            if (NIVELESDEP.rowCount > 0) {
                return res.jsonp(NIVELESDEP.rows);
            }
            res.status(404).jsonp({ text: 'Registros no encontrados.' });
        });
    }
    // ACTUALIZAR REGISTRO DE NIVEL DE DEPARTAMENTO DE TABLA NIVEL_JERARQUICO   --**VERIFICADO
    ActualizarNivelDepa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel } = req.body;
                const id = req.params.id;
                yield database_1.default.query(`
        UPDATE ed_niveles_departamento set nivel = $1 
        WHERE id = $2
        `, [nivel, id]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO DE NIVEL DE DEPARTAMENTO   --**VERIFICADO
    EliminarRegistroNivelDepa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield database_1.default.query(`
        DELETE FROM ed_niveles_departamento WHERE id = $1
        `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    //METODO PARA CREAR NIVELES JERARQUICOS POR DEPARTAMENTOS  --**VERIFICADO
    ActualizarNombreNivel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_departamento, departamento } = req.body;
                yield database_1.default.query(`
        UPDATE ed_niveles_departamento SET departamento = $1
        WHERE id_departamento = $2
        `, [departamento, id_departamento]);
                yield database_1.default.query(`
        UPDATE ed_niveles_departamento SET departamento_nombre_nivel = $1
        WHERE id_departamento_nivel = $2
        `, [departamento, id_departamento]);
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    /*
      * Metodo para revisar
      */
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    RevisarDatos(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
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
            plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                var { item, nombre, sucursal } = dato;
                //Verificar que el registo no tenga datos vacios
                if ((item != undefined && item != '') &&
                    (nombre != undefined) && (sucursal != undefined)) {
                    data.fila = item;
                    data.nombre = nombre;
                    data.sucursal = sucursal;
                    data.observacion = 'no registrado';
                    listDepartamentos.push(data);
                }
                else {
                    data.fila = item;
                    data.nombre = nombre;
                    data.sucursal = sucursal;
                    data.observacion = 'no registrado';
                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error';
                    }
                    if (nombre == undefined) {
                        data.nombre = 'No registrado';
                        data.observacion = 'Departamento ' + data.observacion;
                    }
                    if (sucursal == undefined) {
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
                    // Discriminación de elementos iguales
                    if (duplicados.find((p) => p.nombre === item.nombre && p.sucursal === item.sucursal) == undefined) {
                        duplicados.push(item);
                    }
                    else {
                        item.observacion = '1';
                    }
                }
            }));
            setTimeout(() => {
                listDepartamentos.sort((a, b) => {
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
                listDepartamentos.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    if (item.observacion == '1') {
                        item.observacion = 'Registro duplicado';
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
                }));
                if (mensaje == 'error') {
                    listDepartamentos = undefined;
                }
                console.log('listDepartamentos: ', listDepartamentos);
                return res.jsonp({ message: mensaje, data: listDepartamentos });
            }, 1000);
        });
    }
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plantilla = req.body;
                console.log('datos departamento: ', plantilla);
                var contador = 1;
                var respuesta;
                plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                    console.log('data: ', data);
                    // Datos que se guardaran de la plantilla ingresada
                    const { item, nombre, sucursal } = data;
                    const ID_SUCURSAL = yield database_1.default.query(`
          SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1
          `, [sucursal.toUpperCase()]);
                    var nivel = 0;
                    var id_sucursal = ID_SUCURSAL.rows[0].id;
                    // Registro de los datos de contratos
                    const response = yield database_1.default.query(`INSERT INTO ed_departamentos (nombre, id_sucursal) VALUES ($1, $2) RETURNING *
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
    ListarNombreDepartamentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const DEPARTAMENTOS = yield database_1.default.query(`
      SELECT * FROM ed_departamentos
      `);
            if (DEPARTAMENTOS.rowCount > 0) {
                return res.jsonp(DEPARTAMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarIdDepartamentoNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const DEPARTAMENTOS = yield database_1.default.query(`
      SELECT * FROM ed_departamentos WHERE nombre = $1
      `, [nombre]);
            if (DEPARTAMENTOS.rowCount > 0) {
                return res.jsonp(DEPARTAMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerIdDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const DEPARTAMENTO = yield database_1.default.query(`
      SELECT id FROM ed_departamentos WHERE nombre = $1
      `, [nombre]);
            if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    ObtenerUnDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const DEPARTAMENTO = yield database_1.default.query(`
      SELECT * FROM ed_departamentos WHERE id = $1
      `, [id]);
            if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows[0]);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado' });
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
            if (departamento.rowCount > 0) {
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
            if (DEPARTAMENTOS.rowCount > 0) {
                res.jsonp(DEPARTAMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
}
exports.DEPARTAMENTO_CONTROLADOR = new DepartamentoControlador();
exports.default = exports.DEPARTAMENTO_CONTROLADOR;
