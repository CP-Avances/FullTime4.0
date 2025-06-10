// IMPORTAR LIBRERIAS
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';
// IMPORTAR SERVICIOS
import { ValidacionesService } from '../../../../servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { AuditoriaService } from 'src/app/servicios/reportes/auditoria/auditoria.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { ThemePalette } from '@angular/material/core';
import { FormControl } from '@angular/forms';

interface Tablas {
    nombre: string;
    modulo: string;
    tabla: string;
    disponibilidad: boolean;
}

interface TablasD {
    nombre: string;
    modulo: string;
    tabla: string;
}

@Component({
    selector: 'app-reporte-auditoria',
    standalone: false,
    templateUrl: './reporte-auditoria.component.html',
    styleUrls: ['./reporte-auditoria.component.css']
})

export class ReporteAuditoriaComponent implements OnInit {

    // ITEMS DE PAGINACION DE LA TABLA
    @ViewChild('paginatorDetalle') paginatorDetalle: MatPaginator;
    pageSizeOptions = [5, 10, 20, 50];
    tamanio_pagina: number = 5;
    numero_pagina: number = 1;

    // CAMPOS DEL FORMULARIO
    tabla_ = new FormControl('');
    modulo_ = new FormControl('');

    // VARIABLES PROGRESS SPINNER
    habilitarprogress: boolean = false;
    mode: ProgressSpinnerMode = 'indeterminate';
    color: ThemePalette = 'primary';
    value = 10;

    // VARIABLES  
    formato_fecha: string = 'dd/MM/yyyy';
    formato_hora: string = 'HH:mm:ss';
    idioma_fechas: string = 'es';
    verDetalle: boolean = false;
    accionesSeleccionadas = [];
    tablasSolicitadas: any = [];
    tablasD: TablasD[] = [];
    datosbusqueda: any = [];
    dataSource: any;
    data_pdf: any = [];
    datosPdF: any = []

    // METODOS PARA LA SELECCION MULTIPLE
    plan_multiple: boolean = false;
    plan_multiple_: boolean = false;
    auto_individual: boolean = true;
    seleccion_vacia: boolean = true;
    activar_seleccion: boolean = true;
    selectionAuditoria = new SelectionModel<TablasD>(true, []);

    // CRITERIOS DE BUSQUEDA POR FECHAS
    get rangoFechas() { return this.reporteService.rangoFechas };

    // BUSQUEDA DE FUNCIONES ACTIVAS
    get geolocalizacion(): boolean { return this.varificarFunciones.geolocalizacion; }
    get alimentacion(): boolean { return this.varificarFunciones.alimentacion; }
    get horas_extras(): boolean { return this.varificarFunciones.horasExtras; }
    get timbre_virtual(): boolean { return this.varificarFunciones.timbre_web; }
    get vacaciones(): boolean { return this.varificarFunciones.vacaciones; }
    get permisos(): boolean { return this.varificarFunciones.permisos; }
    get acciones_personal(): boolean { return this.varificarFunciones.accionesPersonal; }
    get reloj_virtual(): boolean { return this.varificarFunciones.app_movil; }

    constructor(
        private varificarFunciones: MainNavService,
        private reporteService: ReportesService,
        private restAuditoria: AuditoriaService,
        private restEmpre: EmpresaService,
        private toastr: ToastrService,
        public validar: ValidacionesService, // SERVICIO CONTROL DE VALIDACONES
        public parametro: ParametrosService,
    ) {
        this.ObtenerLogo();
        this.ObtenerColores();
    }

    ngOnInit(): void {
        this.ContruirTablaDefinitiva(this.tablas);
        this.BuscarParametro();
    }

    // METODO PARA MOSTRAR FILAS DETERMINADAS DE DATOS EN LA TABLA
    ManejarPagina(e: PageEvent) {
        this.numero_pagina = e.pageIndex + 1;
        this.tamanio_pagina = e.pageSize;
    }

    // METODO PARA BUSCAR DATOS DE PARAMETROS
    BuscarParametro() {
        let datos: any = [];
        let detalles = { parametros: '1, 2' };
        this.parametro.ListarVariosDetallesParametros(detalles).subscribe(
            res => {
                datos = res;
                //console.log('datos ', datos)
                datos.forEach((p: any) => {
                    // id_tipo_parametro Formato fecha = 1
                    if (p.id_parametro === 1) {
                        this.formato_fecha = p.descripcion;
                    }
                    // id_tipo_parametro Formato hora = 2
                    else if (p.id_parametro === 2) {
                        this.formato_hora = p.descripcion;
                    }
                })
            });
    }

    // METODO PARA OBTENER TIPO DE ACCIONES
    ObtenerTipoAccion($event: any) {
        this.accionesSeleccionadas = $event;
        return this.accionesSeleccionadas;
    }

    // INICIALIZACION DIRECTA DE LA LISTA DE OBJETOS TABLAS
    tablas: Tablas[] = [
        { nombre: "Provincias", tabla: "e_provincias", modulo: "", disponibilidad: true },
        { nombre: "Ciudades", tabla: "e_ciudades", modulo: "", disponibilidad: true },
        { nombre: "Empresa", tabla: "e_empresa", modulo: "", disponibilidad: true },
        { nombre: "Mensaje de Notificaciones", tabla: "e_message_notificaciones", modulo: "", disponibilidad: true },
        { nombre: "Documentacion", tabla: "e_documentacion", modulo: "", disponibilidad: true },
        { nombre: "Detalles de Parámetros", tabla: "ep_detalle_parametro", modulo: "", disponibilidad: true },
        { nombre: "Roles", tabla: "ero_cat_roles", modulo: "", disponibilidad: true },
        { nombre: "Permisos al Rol", tabla: "ero_rol_permisos", modulo: "", disponibilidad: true },
        { nombre: "Feriados", tabla: "ef_cat_feriados", modulo: "", disponibilidad: true },
        { nombre: "Ciudad Feriados", tabla: "ef_ciudad_feriado", modulo: "", disponibilidad: true },
        { nombre: "Régimen Laboral", tabla: "ere_cat_regimenes", modulo: "", disponibilidad: true },
        { nombre: "Antiguedad", tabla: "ere_antiguedad", modulo: "", disponibilidad: true },
        { nombre: "Vacaciones en Períodos", tabla: "ere_dividir_vacaciones", modulo: "", disponibilidad: true },
        { nombre: "Sucursales", tabla: "e_sucursales", modulo: "", disponibilidad: true },
        { nombre: "Departamentos", tabla: "ed_departamentos", modulo: "", disponibilidad: true },
        { nombre: "Niveles de Departamentos", tabla: "ed_niveles_departamento", modulo: "", disponibilidad: true },
        { nombre: "Autorizan Departamentos", tabla: "ed_autoriza_departamento", modulo: "", disponibilidad: true },
        { nombre: "Dispositivos Biométricos", tabla: "ed_relojes", modulo: "", disponibilidad: true },
        { nombre: "Configuración Código de Usuarios", tabla: "e_codigo", modulo: "", disponibilidad: true },
        { nombre: "Modalidad Laboral", tabla: "e_cat_modalidad_trabajo", modulo: "", disponibilidad: true },
        { nombre: "Tipos de Cargo", tabla: "e_cat_tipo_cargo", modulo: "", disponibilidad: true },
        { nombre: "Niveles de Titulos", tabla: "et_cat_nivel_titulo", modulo: "", disponibilidad: true },
        { nombre: "Título Profesionales", tabla: "et_titulos", modulo: "", disponibilidad: true },
        { nombre: "Tipo de Vacunas", tabla: "e_cat_vacuna", modulo: "", disponibilidad: true },
        { nombre: "Tipos de Discapacidad", tabla: "e_cat_discapacidad", modulo: "", disponibilidad: true },
        { nombre: "Horarios", tabla: "eh_cat_horarios", modulo: "", disponibilidad: true },
        { nombre: "Detalle de Horarios", tabla: "eh_detalle_horarios", modulo: "", disponibilidad: true },
        { nombre: "Empleados", tabla: "eu_empleados", modulo: "", disponibilidad: true },
        { nombre: "Usuarios", tabla: "eu_usuarios", modulo: "", disponibilidad: true },
        { nombre: "Administracion de información", tabla: "eu_usuario_departamento", modulo: "", disponibilidad: true },
        { nombre: "Discapacidades del Usuario", tabla: "eu_empleado_discapacidad", modulo: "", disponibilidad: true },
        { nombre: "Títulos del Usuario", tabla: "eu_empleado_titulos", modulo: "", disponibilidad: true },
        { nombre: "Registros de Vacunas", tabla: "eu_empleado_vacunas", modulo: "", disponibilidad: true },
        { nombre: "Contratos del Usuario", tabla: "eu_empleado_contratos", modulo: "", disponibilidad: true },
        { nombre: "Cargos del Usuario", tabla: "eu_empleado_cargos", modulo: "", disponibilidad: true },
        { nombre: "Asistencia General", tabla: "eu_asistencia_general", modulo: "", disponibilidad: true },
        { nombre: "Marcaciones", tabla: "eu_timbres", modulo: "", disponibilidad: true },
        { nombre: "Justificación de Atrasos", tabla: "eu_empleado_justificacion_atraso", modulo: "", disponibilidad: true },
        { nombre: "Configuración de alertas", tabla: "eu_configurar_alertas", modulo: "", disponibilidad: true },
        { nombre: "Autorización de Solicitudes", tabla: "ecm_autorizaciones", modulo: "", disponibilidad: true },
        { nombre: "Notificaciones de Solicitudes", tabla: "ecm_realtime_notificacion", modulo: "", disponibilidad: true },
        { nombre: "Notificaciones Generales", tabla: "ecm_realtime_timbres", modulo: "", disponibilidad: true },
        // MODULO DE VACACIONES
        { nombre: "Periodos de Vacaciones", tabla: "mv_periodo_vacacion", modulo: "Vacaciones", disponibilidad: this.vacaciones },
        { nombre: "Solicitudes de Vacaciones", tabla: "mv_solicitud_vacacion", modulo: "Vacaciones", disponibilidad: this.vacaciones },
        // MODULO DE PERMISOS
        { nombre: "Tipos de Permisos", tabla: "mp_cat_tipo_permisos", modulo: "Permisos", disponibilidad: this.permisos },
        { nombre: "Solicitudes de Permisos", tabla: "mp_solicitud_permiso", modulo: "Permisos", disponibilidad: this.permisos },
        // MODULO DE HORAS EXTRAS
        { nombre: "Configuración de Horas Extras", tabla: "mhe_configurar_hora_extra", modulo: "Horas Extras", disponibilidad: this.horas_extras },
        { nombre: "Detalles Planificación de Horas Extras", tabla: "mhe_detalle_plan_hora_extra", modulo: "Horas Extras", disponibilidad: this.horas_extras },
        { nombre: "Planificación de Horas Extras", tabla: "mhe_empleado_plan_hora_extra", modulo: "Horas Extras", disponibilidad: this.horas_extras },
        { nombre: "Solicitud de Horas Extras", tabla: "mhe_solicitud_hora_extra", modulo: "Horas Extras", disponibilidad: this.horas_extras },
        { nombre: "Calcular Horas Extras", tabla: "mhe_calcular_hora_extra", modulo: "Horas Extras", disponibilidad: this.horas_extras },
        // MODULO DE ALIMENTACION
        { nombre: "Tipos de Servicio Alimentación", tabla: "ma_cat_comidas", modulo: "Alimentacion", disponibilidad: this.alimentacion },
        { nombre: "Horarios de Servicio Alimentación", tabla: "ma_horario_comidas", modulo: "Alimentacion", disponibilidad: this.alimentacion },
        { nombre: "Detalles de Servicio Alimentación", tabla: "ma_detalle_comida", modulo: "Alimentacion", disponibilidad: this.alimentacion },
        { nombre: "Detalles Planificación de Servicio Alimentación", tabla: "ma_detalle_plan_comida", modulo: "Alimentacion", disponibilidad: this.alimentacion },
        { nombre: "Solicitudes de Servicio Alimentación", tabla: "ma_solicitud_comida", modulo: "Alimentacion", disponibilidad: this.alimentacion },
        { nombre: "Planificación de Servicio Aliemntación", tabla: "ma_empleado_plan_comida_general", modulo: "Alimentacion", disponibilidad: this.alimentacion },
        { nombre: "Servicios de Alimentación Invitados", tabla: "ma_invitados_comida", modulo: "Alimentacion", disponibilidad: this.alimentacion },
        // MODULO DE ACCIONES DE PERSONAL
        { nombre: "Cargo Propuesto", tabla: "map_cargo_propuesto", modulo: "Acciones de Personal", disponibilidad: this.acciones_personal },
        { nombre: "Contexto Legal", tabla: "map_contexto_legal", modulo: "Acciones de Personal", disponibilidad: this.acciones_personal },
        { nombre: "Tipos de Acción Personal", tabla: "map_tipo_accion_personal", modulo: "Acciones de Personal", disponibilidad: this.acciones_personal },
        { nombre: "Detalles de Tipo Acción Personal", tabla: "map_detalle_tipo_accion_personal", modulo: "Acciones de Personal", disponibilidad: this.acciones_personal },
        { nombre: "Tipos de Procesos", tabla: "map_cat_procesos", modulo: "Acciones de Personal", disponibilidad: this.acciones_personal },
        { nombre: "Procesos del Usuario", tabla: "map_empleado_procesos", modulo: " acciones_personal", disponibilidad: this.acciones_personal },
        { nombre: "Solicitud de Acción de Personal", tabla: "map_solicitud_accion_personal", modulo: "Acciones de Personal", disponibilidad: this.acciones_personal },
        // MODULO DE GEOLOCALIZACION
        { nombre: "Perimetros de Ubicación", tabla: "mg_cat_ubicaciones", modulo: "Geolocalización", disponibilidad: this.geolocalizacion },
        { nombre: "Ubicaciones asignadas al Usuario", tabla: "mg_empleado_ubicacion", modulo: "Geolocalización", disponibilidad: this.geolocalizacion },
        // MODULO DE RELOJ VIRTUAL
        { nombre: "Opciones de Marcación", tabla: "mtv_opciones_marcacion", modulo: "", disponibilidad: true },
        { nombre: "Opciones de Marcación RV", tabla: "mrv_opciones_marcacion", modulo: "", disponibilidad: true },

        { nombre: "Dispositivos Móviles", tabla: "mrv_dispositivos", modulo: "Reloj Virtual", disponibilidad: this.reloj_virtual },
    ];

    // METODO PARA CONSTRUIR TABLAS
    ContruirTablaDefinitiva(tabla: any) {
        tabla.map((x: any) => {
            if (x.disponibilidad == true) {
                this.tablasD.push({
                    nombre: x.nombre,
                    modulo: x.modulo,
                    tabla: x.tabla,
                })
            }
        })
    }

    // VALIDACIONES DE OPCIONES DE REPORTE
    ValidarReporte(action: any) {
        if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Ingresar fechas de búsqueda.');
        if (this.accionesSeleccionadas.length == 0) return this.toastr.error('Ingresar acciones.');
        if (this.tablasSolicitadas.length == 0) return this.toastr.error(
            'No a seleccionado ninguna.',
            'Seleccione tablas.'
        );

        this.ModelarTablasAuditoriaPorTablasEmpaquetados(action);
    }

    // METODO PARA EMPAQUETAR DATOS
    blobToArraynoString(blob: Blob): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const result = reader.result;
                    if (result instanceof ArrayBuffer) {
                        const dataArray = new Uint8Array(result);

                        const decoder = new TextDecoder('utf-8');
                        let jsonString = '';
                        const objects: any[] = []; // DEFINIR EL TIPO DE MATRIZ DE OBJETOS.
                        let lastIndex = 0;

                        for (let i = 0; i < dataArray.length; i++) {
                            if (dataArray[i] === 125) { // CODIGO DE CARACTER PARA "}"
                                let segment = decoder.decode(dataArray.slice(lastIndex, i + 1));
                                lastIndex = i + 1;
                                jsonString += segment;

                                try {
                                    const jsonObject = JSON.parse(jsonString);
                                    objects.push(jsonObject);
                                    jsonString = '';
                                } catch (e) {
                                    // SI JSON.parse FALLA, EL SEGMENTO AUN NO ESTA COMPLETO
                                    continue;
                                }
                            }
                        }
                        resolve(objects);
                    } else {
                        reject(new Error("Expected an ArrayBuffer but got a different type"));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => {
                reject(reader.error);
            };
            reader.readAsArrayBuffer(blob);
        });
    }

    // METODO PARA EMPAQUETAR DATOS
    blobToArray(blob: Blob): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const arrayBuffer = reader.result as ArrayBuffer;
                    const dataArray = new Uint8Array(arrayBuffer);
                    //console.log("para ver como es este array", dataArray)
                    let jsonString = new TextDecoder('utf-8').decode(dataArray);
                    // AÑADIR LAS COMAS ANTES DE {"plataforma": EXCEPTO LA PRIMERA VEZ
                    jsonString = jsonString.replace(/(\{"plataforma":)/g, (match, p1, offset) => offset === 0 ? p1 : `,${p1}`);
                    // AÑADIR LOS CORCHETES AL PRINCIPIO Y AL FINAL
                    jsonString = `[${jsonString}]`;
                    //console.log('Contenido modificado del Blob:', jsonString); // IMPRIMIR EL CONTENIDO MODIFICADO DEL BLOB
                    const data = JSON.parse(jsonString);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => {
                reject(reader.error);
            };
            reader.readAsArrayBuffer(blob);
        });
    }


    // METODO PARA MODELAR DATOS EN LAS TABLAS AUDITORIA
    async ModelarTablasAuditoriaPorTablasEmpaquetados(accion: any) {

        this.data_pdf = [];
        var acciones = this.accionesSeleccionadas.map(x => x).join(',');
        // ARRAY PARA ALMACENAR TODAS LAS PROMESAS DE CONSULTA
        const consultasPromesas: Promise<any>[] = [];
        for (let i = 0; i < this.tablasSolicitadas.length; i++) {
            const tabla = this.tablasSolicitadas[i];
            const buscarTabla = {
                tabla: tabla.tabla,
                desde: this.rangoFechas.fec_inico,
                hasta: this.rangoFechas.fec_final,
                action: acciones,
            };
            // CREAR UNA PROMESA PARA CADA CONSULTA
            const consultaPromise = new Promise((resolve, reject) => {
                this.restAuditoria.ConsultarAuditoriaPorTablaEmpaquetados(buscarTabla).subscribe(
                    (response: any) => {
                        if (response !== null && response.body instanceof Blob) {
                            this.blobToArraynoString(response.body).then((data_pdf: any[]) => {
                                resolve(data_pdf); // RESOLVER LA PROMESA CON LOS DATOS CONVERTIDOS
                            }).catch(error => {
                                reject(`Error al convertir Blob a array de objetos: ${error}`);
                            });
                        } else {
                            reject('Respuesta vacía o no es un Blob.');
                        }
                    },
                    error => {
                        if (error.status === 404) {
                            reject('No existen registros con las tablas y acciones seleccionadas');
                        } else {
                            reject(`Error en la consulta: ${error}`);
                        }
                    }
                );
            });
            consultasPromesas.push(consultaPromise); // AGREGAR LA PROMESA AL ARRAY
        }
        try {
            // ESPERAR A QUE TODAS LAS PROMESAS SE RESUELVAN
            this.habilitarprogress = true;
            const resultados = await Promise.allSettled(consultasPromesas);
            this.datosbusqueda = resultados
                .filter(result => result.status === 'fulfilled')
                .map(result => (result as PromiseFulfilledResult<any>).value);
            // RESULTADOS AHORA CONTIENE TODOS LOS ARRAYS DE DATOS OBTENIDOS
            this.data_pdf = this.datosbusqueda.flat(); // APLANAR EL ARRAY DE ARRAYS
            this.data_pdf.forEach(d => {
                d.action = this.transformAction(d.action);
                d.fecha_hora_format = this.validar.FormatearFechaAuditoria(d.fecha_hora,
                    this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
                d.solo_hora = this.validar.FormatearHoraAuditoria(d.fecha_hora.split(' ')[1],
                    this.formato_hora);
            })
            console.log("quiero ver los datos", this.data_pdf);
            this.datosPdF = this.data_pdf;

            if (this.datosPdF.length != 0) {
                switch (accion) {
                    case 'ver':
                        this.VerDatos();
                        break;
                    default:
                        this.GenerarPDF(this.datosPdF, accion);
                        break;
                }
            } else {
                this.toastr.error("No existen registros de auditoría.")
            }
            // REALIZAR LA ACCIÓN CORRESPONDIENTE

        } finally {
            this.habilitarprogress = false
        }
    }

    // METODOS PARA LA SELECCION MULTIPLE
    HabilitarSeleccion() {
        this.plan_multiple = true;
        this.plan_multiple_ = true;
        this.auto_individual = false;
        this.activar_seleccion = false;
    }

    // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
    isAllSelectedPag() {
        const numSelected = this.selectionAuditoria.selected.length;
        return numSelected === this.tablasD.length
    }

    // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
    masterTogglePag() {
        this.isAllSelectedPag() ?
            this.selectionAuditoria.clear() :
            this.tablasD.forEach((row: any) => this.selectionAuditoria.select(row));
    }

    // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
    checkboxLabelPag(row?: TablasD): string {
        if (!row) {
            return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
        }
        this.tablasSolicitadas = this.selectionAuditoria.selected;
        return `${this.selectionAuditoria.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;
    }

    /** ****************************************************************************************** **
    **                              COLORES Y LOGO PARA EL REPORTE                                **
    ** ****************************************************************************************** **/

    logo: any = String;
    ObtenerLogo() {
        this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string).subscribe(res => {
            this.logo = 'data:image/jpeg;base64,' + res.imagen;
        });
    }

    // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
    p_color: any;
    s_color: any;
    frase: any;
    ObtenerColores() {
        this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
            this.p_color = res[0].color_principal;
            this.s_color = res[0].color_secundario;
            this.frase = res[0].marca_agua;
        });
    }

    /** ****************************************************************************************** **
     ** **                                             PDF                                      ** **
     ** ****************************************************************************************** **/
    async GenerarPDF(data: any, action: any) {
        const pdfMake = await this.validar.ImportarPDF();
        let documentDefinition: any;
        documentDefinition = this.DefinirInformacionPDF(data);
        let doc_name = `Auditoría.pdf`;
        switch (action) {
            case 'open': pdfMake.createPdf(documentDefinition).open(); break;
            case 'print': pdfMake.createPdf(documentDefinition).print(); break;
            case 'download': pdfMake.createPdf(documentDefinition).download(doc_name); break;
            default: pdfMake.createPdf(documentDefinition).open(); break;
        }
    }

    DefinirInformacionPDF(data: any) {
        return {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [40, 50, 40, 50],
            watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
            header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
            footer: function (currentPage: any, pageCount: any, fecha: any) {
                let f = DateTime.now();
                fecha = f.toFormat('yyyy-MM-dd');
                let time = f.toFormat('HH:mm:ss');
                return {
                    margin: 10,
                    columns: [
                        { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
                        {
                            text: [
                                {
                                    text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                                    alignment: 'right', opacity: 0.3
                                }
                            ],
                        }
                    ],
                    fontSize: 10
                }
            },
            content: [
                { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
                { text: (localStorage.getItem('name_empresa') as string).toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
                { text: `AUDITORÍA`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
                ...this.EstructurarDatosPDF(data).map((obj: any) => {
                    return obj
                })
            ],
            styles: {
                tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
                centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 7, 0, 0] },
                itemsTable: { fontSize: 8 },
                itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
                itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0], fillColor: '#E3E3E3' },
                itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
                itemsTableCentrado: { fontSize: 8, alignment: 'center' },
                tableMargin: { margin: [0, 0, 0, 0] },
                tableMarginEmp: { margin: [0, 15, 0, 0] },
                tableMarginCabecera: { margin: [0, 15, 0, 0] },
                tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
                quote: { margin: [5, -2, 0, -2], italics: true },
                small: { fontSize: 8, color: 'blue', opacity: 0.5 }
            }
        };
    }

    EstructurarDatosPDF(data: any[]): Array<any> {
        let n: any = []
        let totalAuditoria = 0;
        // AÑADIR LA CABECERA CON INFORMACION DE LA PLATAFORMA
        n.push({
            style: 'tableMarginCabecera',
            table: {
                widths: ['*', '*'],
                headerRows: 1,
                body: [
                    [
                        {
                            border: [true, true, false, false],
                            bold: true,
                            text: 'PLATAFORMA: ' + data[0].plataforma,
                            style: 'itemsTableInfo'
                        },
                        {
                            border: [false, true, true, false],
                            text: 'N° Registros: ' + data.length,
                            style: 'itemsTableInfo',
                        },
                    ]
                ]
            }
        });
        // AÑADIR LA TABLA DE DATOS
        n.push({
            style: 'tableMargin',
            table: {
                widths: ['auto', '*', 'auto', 'auto', 100, 'auto', 'auto', 'auto', 140, 140],
                headerRows: 1,
                body: [
                    [
                        { text: 'ITEM', style: 'tableHeader' },
                        { text: 'PLATAFORMA', style: 'tableHeader' },
                        { text: 'USUARIO', style: 'tableHeader' },
                        { text: 'IP', style: 'tableHeader' },
                        { text: 'NOMBRE TABLA', style: 'tableHeader' },
                        { text: 'ACCIÓN', style: 'tableHeader' },
                        { text: 'FECHA', style: 'tableHeader' },
                        { text: 'HORA', style: 'tableHeader' },
                        { text: 'DATOS ORIGINALES', style: 'tableHeader' },
                        { text: 'DATOS NUEVOS', style: 'tableHeader' }
                    ],
                    ...data.map((audi) => {
                        totalAuditoria += 1;
                        return [
                            { style: 'itemsTableCentrado', text: totalAuditoria },
                            { style: 'itemsTable', text: audi.plataforma },
                            { style: 'itemsTableCentrado', text: audi.user_name },
                            { style: 'itemsTableCentrado', text: audi.ip_address },
                            { style: 'itemsTableCentrado', text: audi.table_name },
                            { style: 'itemsTableCentrado', text: this.transformAction(audi.action) },
                            { style: 'itemsTable', text: audi.fecha_hora_format },
                            { style: 'itemsTable', text: audi.solo_hora },
                            { style: 'itemsTable', text: audi.original_data, fontSize: 6, noWrap: false, overflow: 'hidden', margin: [4, 0, 9, 0] },
                            { style: 'itemsTable', text: audi.new_data, fontSize: 6, noWrap: false, overflow: 'hidden', margin: [4, 0, 9, 0] },
                        ]
                    })
                ]
            },
            layout: {
                fillColor: function (rowIndex: any) {
                    return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                }
            }
        });
        return n;
    }

    // METODO PARA FORMATEAR FECHA
    getDateFromISO(isoString: string): string {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // METODO PARA FORMATEAR HORA
    getTimeFromISO(isoString: string): string {
        const date = new Date(isoString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    // METODO PARA LEER ACCIONES
    transformAction(action: string): string {
        console.log("ver transformAction")
        switch (action) {
            case 'U':
                return 'Actualizar';
            case 'I':
                return 'Insertar';
            case 'D':
                return 'Eliminar';
            default:
                return action;
        }
    }

    // METODO PARA REGRESAR A LA PAGINA ANTERIOR
    Regresar() {
        this.verDetalle = false;
        this.paginatorDetalle.firstPage();
    }

    // METODO DE CONTROL DE PAGINACION
    ManejarPaginaDet(e: PageEvent) {
        this.tamanio_pagina = e.pageSize;
        this.numero_pagina = e.pageIndex + 1;
    }

    //ENVIAR DATOS A LA VENTANA DE DETALLE
    VerDatos() {
        this.verDetalle = true;
    }

    // METODO PARA LIMPIAR DATOS
    LimpiarDatos() {
        this.selectionAuditoria.clear();
        this.verDetalle = false;
        this.tabla_.setValue('');
        this.modulo_.setValue('');
    }

}