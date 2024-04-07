import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../../database';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
import { ObtenerRutaContrato } from '../../../libs/accesoCarpetas';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';

import excel from 'xlsx';

class ContratoEmpleadoControlador {

    // REGISTRAR CONTRATOS
    public async CrearContrato(req: Request, res: Response): Promise<Response> {
        const { id_empleado, fec_ingreso, fec_salida, vaca_controla, asis_controla,
            id_regimen, id_tipo_contrato } = req.body;

        const response: QueryResult = await pool.query(
            `
            INSERT INTO empl_contratos (id_empleado, fec_ingreso, fec_salida, vaca_controla, 
            asis_controla, id_regimen, id_tipo_contrato) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `,
            [id_empleado, fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
                id_tipo_contrato]);

        const [contrato] = response.rows;

        if (contrato) {
            return res.status(200).jsonp(contrato)
        }
        else {
            return res.status(404).jsonp({ message: 'error' })
        }
    }

    // METODO PARA GUARDAR DOCUMENTO
    public async GuardarDocumentoContrato(req: Request, res: Response): Promise<void> {

        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

        let id = req.params.id;

        const response: QueryResult = await pool.query(
            `
            SELECT codigo FROM empleados AS e, empl_contratos AS c WHERE c.id = $1 AND c.id_empleado = e.id
            `
            , [id]);

        const [empleado] = response.rows;

        let documento = empleado.codigo + '_' + anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;

        await pool.query(
            `
            UPDATE empl_contratos SET documento = $2 WHERE id = $1
            `
            , [id, documento]);

        res.jsonp({ message: 'Documento actualizado.' });
    }

    // METODO PARA VER DOCUMENTO
    public async ObtenerDocumento(req: Request, res: Response): Promise<any> {
        const docs = req.params.docs;
        const id = req.params.id;
        let separador = path.sep;
        let ruta = await ObtenerRutaContrato(id) + separador + docs;
        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
              res.sendFile(path.resolve(ruta));
            }
          });
    }


    // METODO PARA LISTAR CONTRATOS POR ID DE EMPLEADO
    public async BuscarContratoEmpleado(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const CONTRATO_EMPLEADO_REGIMEN = await pool.query(
            `
            SELECT ec.id, ec.fec_ingreso, ec.fec_salida FROM empl_contratos AS ec
            WHERE ec.id_empleado = $1 ORDER BY ec.id ASC
            `
            , [id_empleado]);
        if (CONTRATO_EMPLEADO_REGIMEN.rowCount > 0) {
            return res.jsonp(CONTRATO_EMPLEADO_REGIMEN.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // EDITAR DATOS DE CONTRATO
    public async EditarContrato(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const { fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
            id_tipo_contrato } = req.body;
        await pool.query(
            `
            UPDATE empl_contratos SET fec_ingreso = $1, fec_salida = $2, vaca_controla = $3,
            asis_controla = $4, id_regimen = $5, id_tipo_contrato = $6 
            WHERE id = $7
            `
            , [fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
                id_tipo_contrato, id]);

        res.jsonp({ message: 'Registro actualizado exitosamente.' });
    }

    // ELIMINAR DOCUMENTO CONTRATO BASE DE DATOS - SERVIDOR
    public async EliminarDocumento(req: Request, res: Response): Promise<void> {
        let { documento, id } = req.body;
        let separador = path.sep;

        const response: QueryResult = await pool.query(
            `
            UPDATE empl_contratos SET documento = null WHERE id = $1 RETURNING *
            `
            , [id]);

        const [contrato] = response.rows;

        if (documento != 'null' && documento != '' && documento != null) {
            let ruta = await ObtenerRutaContrato(contrato.id_empleado) + separador + documento;
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs.access(ruta, fs.constants.F_OK, (err) => {
                if (err) {
                } else {
                    // ELIMINAR DEL SERVIDOR
                    fs.unlinkSync(ruta);
                }
            });
        }

        res.jsonp({ message: 'Documento actualizado.' });
    }

    // ELIMINAR DOCUMENTO CONTRATO DEL SERVIDOR
    public async EliminarDocumentoServidor(req: Request, res: Response): Promise<void> {
        let { documento, id } = req.body;
        let separador = path.sep;
        if (documento != 'null' && documento != '' && documento != null) {
            let ruta = await ObtenerRutaContrato(id) + separador + documento;
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs.access(ruta, fs.constants.F_OK, (err) => {
                if (err) {
                } else {
                    // ELIMINAR DEL SERVIDOR
                    fs.unlinkSync(ruta);
                }
            });;
        }
        res.jsonp({ message: 'Documento actualizado.' });
    }

    // METODO PARA BUSCAR ID ACTUAL
    public async EncontrarIdContratoActual(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const CONTRATO = await pool.query(
            `
            SELECT MAX(ec.id) FROM empl_contratos AS ec, empleados AS e 
            WHERE ec.id_empleado = e.id AND e.id = $1
            `
            , [id_empleado]);
        if (CONTRATO.rowCount > 0) {
            if (CONTRATO.rows[0]['max'] != null) {
                return res.jsonp(CONTRATO.rows)
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado' });
        }
    }

    // METODO PARA BUSCAR DATOS DE CONTRATO POR ID 
    public async EncontrarDatosUltimoContrato(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const CONTRATO = await pool.query(
            `
            SELECT ec.id, ec.id_empleado, ec.id_regimen, ec.fec_ingreso, ec.fec_salida, ec.vaca_controla,
                ec.asis_controla, ec.documento, ec.id_tipo_contrato, cr.descripcion, 
                cr.mes_periodo, mt.descripcion AS nombre_contrato 
            FROM empl_contratos AS ec, cg_regimenes AS cr, modal_trabajo AS mt 
            WHERE ec.id = $1 AND ec.id_regimen = cr.id AND mt.id = ec.id_tipo_contrato
            `
            , [id]);
        if (CONTRATO.rowCount > 0) {
            return res.jsonp(CONTRATO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // METODO PARA BUSCAR FECHAS DE CONTRATOS    --**VERIFICADO
    public async EncontrarFechaContrato(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.body;
        const FECHA = await pool.query(
            `
            SELECT ca.id_contrato, ec.fec_ingreso
            FROM datos_contrato_actual AS ca, empl_contratos AS ec
            WHERE ca.id = $1 AND ec.id = ca.id_contrato
            `
            , [id_empleado]);
        if (FECHA.rowCount > 0) {
            return res.jsonp(FECHA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }


    /** **************************************************************************** ** 
     ** **          METODOS PARA LA TABLA MODAL_TRABAJO O TIPO DE CONTRATOS       ** **
     ** **************************************************************************** **/

    // LISTAR TIPOS DE MODALIDAD DE TRABAJO
    public async ListarTiposContratos(req: Request, res: Response) {
        const CONTRATOS = await pool.query(
            `
            SELECT * FROM modal_trabajo
            `
        );
        if (CONTRATOS.rowCount > 0) {
            return res.jsonp(CONTRATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // REGISTRAR MODALIDAD DE TRABAJO
    public async CrearTipoContrato(req: Request, res: Response): Promise<Response> {
        const { descripcion } = req.body;

        const response: QueryResult = await pool.query(
            `
            INSERT INTO modal_trabajo (descripcion) VALUES ($1) RETURNING *
            `,
            [descripcion]);


        const [contrato] = response.rows;

        if (contrato) {
            return res.status(200).jsonp(contrato)
        }
        else {
            return res.status(404).jsonp({ message: 'error' })
        }

    }












    public async ListarContratos(req: Request, res: Response) {
        const CONTRATOS = await pool.query('SELECT * FROM empl_contratos');
        if (CONTRATOS.rowCount > 0) {
            return res.jsonp(CONTRATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ObtenerUnContrato(req: Request, res: Response) {
        const id = req.params.id;
        const CONTRATOS = await pool.query('SELECT * FROM empl_contratos WHERE id = $1', [id]);
        if (CONTRATOS.rowCount > 0) {
            return res.jsonp(CONTRATOS.rows[0])
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }



    public async EncontrarIdContrato(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const CONTRATO = await pool.query('SELECT ec.id FROM empl_contratos AS ec, empleados AS e WHERE ec.id_empleado = e.id AND e.id = $1 ORDER BY ec.fec_ingreso DESC ', [id_empleado]);
        if (CONTRATO.rowCount > 0) {
            return res.jsonp(CONTRATO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado' });
        }
    }


    public async EncontrarFechaContratoId(req: Request, res: Response): Promise<any> {
        const { id_contrato } = req.body;
        const FECHA = await pool.query('SELECT contrato.fec_ingreso FROM empl_contratos AS contrato ' +
            'WHERE contrato.id = $1', [id_contrato]);
        if (FECHA.rowCount > 0) {
            return res.jsonp(FECHA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado' });
        }
    }




     // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    public async RevisarDatos(req: Request, res: Response): Promise<any> {
        const documento = req.file?.originalname;
        let separador = path.sep;
        let ruta = ObtenerRutaLeerPlantillas() + separador + documento;

        const workbook = excel.readFile(ruta);
        const sheet_name_list = workbook.SheetNames;
        const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        let data: any = {
            fila: '',
            cedula: '',
            pais: '',
            regimen_la: '',
            modalida_la: '',
            fecha_ingreso: '',
            fecha_salida: '',
            control_asis: '',
            control_vaca: '',
            observacion: ''
        };

        var listContratos: any = [];
        var duplicados: any = [];
        var mensaje: string = 'correcto';

        
        // LECTURA DE LOS DATOS DE LA PLANTILLA
        plantilla.forEach(async (dato: any, indice: any, array: any) => {
            var {item, cedula, pais, regimen_laboral, modalidad_laboral, fecha_ingreso, fecha_salida,
             controlar_asistencia, controlar_vacaciones, tipo_cargo} = dato;
            
            console.log('dato: ',dato)

            //Verificar que el registo no tenga datos vacios
            if ((item != undefined && item != '') && (cedula != undefined) && (pais != undefined) &&
            (regimen_laboral != undefined) && (modalidad_laboral != undefined) && (fecha_ingreso != undefined) &&
            (fecha_salida != undefined) && (controlar_asistencia != undefined) && (controlar_vacaciones != undefined) && 
            (tipo_cargo != undefined)){
                data.fila = item;
                data.cedula = cedula; data.pais = pais;
                data.regimen_la = regimen_laboral; data.modalida_la = modalidad_laboral; 
                data.fecha_ingreso = fecha_ingreso; data.fecha_salida = fecha_salida; 
                data.control_asis = controlar_asistencia; data.control_vaca = controlar_vacaciones; 

                data.observacion = 'no registrado';

                //Valida si los datos de la columna cedula son numeros.
                const rege = /^[0-9]+$/;
                if (rege.test(data.cedula)) {
                  if (data.cedula.toString().length != 10) {
                    data.observacion = 'La cédula ingresada no es válida';
                  }else{
                    // Verificar si la variable tiene el formato de fecha correcto con moment
                    if (moment(fecha_ingreso, 'YYYY-MM-DD', true).isValid()) { } else {
                        data.observacion = 'Formato de fecha ingreso incorrecto (YYYY-MM-DD)';
                    }

                    // Verificar si la variable tiene el formato de fecha correcto con moment
                    if (moment(fecha_salida, 'YYYY-MM-DD', true).isValid()) { } else {
                        data.observacion = 'Formato de fecha salida incorrecto (YYYY-MM-DD)';
                    }
                  }
                } else {
                  data.observacion = 'La cédula ingresada no es válida';
                } 

                listContratos.push(data);

            }else{
                data.fila = item;
                data.cedula = cedula; data.pais = pais;
                data.regimen_la = regimen_laboral; data.modalida_la = modalidad_laboral; 
                data.fecha_ingreso = fecha_ingreso; data.fecha_salida = fecha_salida; 
                data.control_asis = controlar_asistencia; data.control_vaca = controlar_vacaciones; 

                data.observacion = 'no registrado';

                if(data.fila == '' || data.fila == undefined) {
                    data.fila = 'error';
                    mensaje = 'error'
                }
                if (pais == undefined) {
                    data.pais = 'No registrado';
                    data.observacion = 'Pais, ' + data.observacion;
                }
                if (regimen_laboral == undefined) {
                    data.regimen_la = 'No registrado';
                    data.observacion = 'Rigimen laboral, ' + data.observacion;
                }
                if (modalidad_laboral == undefined) {
                    data.modalida_la = 'No registrado';
                    data.observacion = 'Modalida laboral, ' + data.observacion;
                }
                  if (fecha_ingreso == undefined) {
                    data.fecha_ingreso = 'No registrado';
                    data.observacion = 'Fecha ingreso, ' + data.observacion;
                  }
                  if (fecha_salida == undefined) {
                    data.fecha_salida = 'No registrado';
                    data.observacion = 'Fecha salida, ' + data.observacion;
                  }
                  if (controlar_asistencia == undefined) {
                    data.control_asis = 'No registrado';
                    data.observacion = 'Control asistencia, ' + data.observacion;
                  }
                  if (controlar_vacaciones == undefined) {
                    data.control_vaca = 'No registrado';
                    data.observacion = 'Control vacaciones, ' + data.observacion;
                  }
                

                // Verificar si la variable tiene el formato de fecha correcto con moment
                if(data.fecha_ingreso != 'No registrado'){
                    if (moment(fecha_ingreso, 'YYYY-MM-DD', true).isValid()) { } else {
                        data.observacion = 'Formato de fecha ingreso incorrecto (YYYY-MM-DD)';
                    }
                }

                // Verificar si la variable tiene el formato de fecha correcto con moment
                if(data.fecha_salida != 'No registrado'){
                    if (moment(fecha_salida, 'YYYY-MM-DD', true).isValid()) { } else {
                        data.observacion = 'Formato de fecha salida incorrecto (YYYY-MM-DD)';
                    }
                }


                  if (cedula == undefined) {
                    data.cedula = 'No registrado'
                    data.observacion = 'Cédula, ' + data.observacion;
                  } else {
                    //Valida si los datos de la columna cedula son numeros.
                    const rege = /^[0-9]+$/;
                    if (rege.test(data.cedula)) {
                      if (data.cedula.toString().length != 10) {
                        data.observacion = 'La cédula ingresada no es válida';
                      }
                    } else {
                      data.observacion = 'La cédula ingresada no es válida';
                    } 
          
                  }
          
                   listContratos.push(data);


            }
      
            data = {}

        });

        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                // ELIMINAR DEL SERVIDOR
                fs.unlinkSync(ruta);
            }
        });

        listContratos.forEach(async (valor: any) => {
            var VERIFICAR_CEDULA = await pool.query('SELECT * FROM empleados WHERE cedula = $1', [valor.cedula]);
            if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                if(valor.cedula != 'No registrado' &&  valor.pais != 'No registrado' && valor.pais != ''){
                    const fechaRango: any = await pool.query('SELECT * FROM empl_contratos '+ 
                        'WHERE id_empleado = $1 and ($2  between fec_ingreso and fec_salida or '+
                        '$3 between fec_ingreso and fec_salida or '+
                        'fec_ingreso between $2 and $3)',[VERIFICAR_CEDULA.rows[0].id, valor.fecha_ingreso, valor.fecha_salida]) 
                    
                    if(fechaRango.rows[0] != undefined && fechaRango.rows[0] != ''){
                        valor.observacion = 'Existe un contrato vigente en esas fechas'  
                    }else{
                        var VERIFICAR_PAISES = await pool.query('SELECT * FROM cg_paises WHERE UPPER(nombre) = $1', [valor.pais.toUpperCase()]);
                        if(VERIFICAR_PAISES.rows[0] != undefined && VERIFICAR_PAISES.rows[0] != ''){
                            var id_pais = VERIFICAR_PAISES.rows[0].id
                            if(valor.regimen_la != 'No registrado' && valor.regimen_la != ''){
                                var VERIFICAR_REGIMENES = await pool.query('SELECT * FROM cg_regimenes WHERE UPPER(descripcion) = $1', [valor.regimen_la.toUpperCase()])
                                if(VERIFICAR_REGIMENES.rows[0] != undefined && VERIFICAR_REGIMENES.rows[0] != ''){
                                    if(id_pais == VERIFICAR_REGIMENES.rows[0].id_pais){
                                        if(valor.modalida_la != 'No registrado' && valor.modalida_la != ''){
                                            var VERIFICAR_MODALIDAD = await pool.query('SELECT * FROM modal_trabajo WHERE UPPER(descripcion) = $1', [valor.modalida_la.toUpperCase()])
                                            if(VERIFICAR_MODALIDAD.rows[0] != undefined && VERIFICAR_MODALIDAD.rows[0] != ''){
                                                // Discriminación de elementos iguales
                                                if(duplicados.find((p: any)=> p.cedula === valor.cedula) == undefined)
                                                {
                                                    duplicados.push(valor);
                                                }else{
                                                    valor.observacion = '1';
                                                }
                                            }else{
                                                valor.observacion = 'Modalidad trabajo no se encuentra registrado'
                                            }
                                        }
                            
                                    }else{
                                        valor.observacion = 'Regimen no corresponde al pais'
                                    }
                        
                                }else{
                                    valor.observacion = 'Regimen ingresado no se encuentra registrado'
                                }
                            }
                        }else{
                            valor.observacion = 'Pais ingresado no se encuentra registrado'
                        }
                    }
                }
            }else{
                valor.observacion = 'Cédula no existe en el sistema'  
            }

        });

        setTimeout(() => {

            listContratos.sort((a: any, b: any) => {
                // Compara los números de los objetos
                if (a.fila < b.fila) {
                    return -1;
                }
                if (a.fila > b.fila) {
                    return 1;
                }
                return 0; // Son iguales
            });

            var filaDuplicada: number = 0;

            listContratos.forEach((item:any) => {
                if(item.observacion == '1') {
                    item.observacion = 'Registro duplicado - cédula'
                }

                if (item.observacion != undefined) {
                    let arrayObservacion = item.observacion.split(" ");
                    if (arrayObservacion[0] == 'no') {
                      item.observacion = 'ok'
                    }
                }

                //Valida si los datos de la columna N son numeros.
                if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                //Condicion para validar si en la numeracion existe un numero que se repite dara error.
                    if(item.fila == filaDuplicada){
                        mensaje = 'error';
                    }
                }else{
                    return mensaje = 'error';
                } 
  
                filaDuplicada = item.fila;

            });

            if(mensaje == 'error'){
                listContratos = undefined;
            }

            console.log('listContratos: ',listContratos);

            return res.jsonp({ message: mensaje, data: listContratos});
      
        }, 1500)
        
    }

    public async CargarPlantilla_contrato(req: Request, res: Response): Promise<void> {
        const plantilla = req.body;
        console.log('datos contrato: ', plantilla);

        plantilla.forEach(async (data: any) => {
            console.log('data: ',data);
            // Datos que se guardaran de la plantilla ingresada
            const {item, cedula, pais, regimen_la, modalida_la, fecha_ingreso, fecha_salida,
            control_asis, control_vaca} = data;

            const ID_EMPLEADO: any = await pool.query('SELECT id FROM empleados WHERE UPPER(cedula) = $1', [cedula]);
            const ID_REGIMEN: any = await pool.query('SELECT id FROM cg_regimenes WHERE UPPER(descripcion) = $1', [regimen_la.toUpperCase()]);
            const ID_TIPO_CONTRATO: any = await pool.query('SELECT id FROM modal_trabajo WHERE UPPER(descripcion) = $1', [modalida_la.toUpperCase()]);

            //Transformar el string en booleano
            var vaca_controla: any;
            if (control_vaca.toUpperCase() === 'SI') {
                vaca_controla = true;
            }else{
                vaca_controla = false;
            }
            
            var asis_controla: any;
            if (control_asis.toUpperCase() === 'SI') {
                asis_controla = true;
            }else{
                asis_controla = false;
            }

            var id_empleado = ID_EMPLEADO.rows[0].id;
            var id_regimen = ID_REGIMEN.rows[0].id;
            var id_tipo_contrato = ID_TIPO_CONTRATO.rows[0].id;

            console.log('id_empleado: ',id_empleado);
            console.log('id_regimen: ',id_regimen);
            console.log('id_tipo_contrato: ',id_tipo_contrato);
            

            // Registro de los datos de contratos
            const response: QueryResult = await pool.query(
                `INSERT INTO empl_contratos (id_empleado, fec_ingreso, fec_salida, vaca_controla, 
                asis_controla, id_regimen, id_tipo_contrato) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
                `,[id_empleado, fecha_ingreso, fecha_salida, vaca_controla, asis_controla, id_regimen,
                    id_tipo_contrato]);

            const [contrato] = response.rows;

            setTimeout(() => {
                if (contrato) {
                    return res.status(200).jsonp({message: 'ok'})
                }else {
                    return res.status(404).jsonp({ message: 'error' })
                }
            }, 1500)
            
        });
    }


}

const CONTRATO_EMPLEADO_CONTROLADOR = new ContratoEmpleadoControlador();

export default CONTRATO_EMPLEADO_CONTROLADOR;