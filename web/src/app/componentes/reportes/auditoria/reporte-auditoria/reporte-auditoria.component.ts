// IMPORTAR LIBRERIAS
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IReporteFaltas, ITableEmpleados } from 'src/app/model/reportes.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';

import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { AuditoriaService } from 'src/app/servicios/auditoria/auditoria.service';

import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';



interface Tablas {
    nombre: string;
    modulo: string;
    disponibilidad: boolean;
}


@Component({
    selector: 'app-reporte-auditoria',
    templateUrl: './reporte-auditoria.component.html',
    styleUrls: ['./reporte-auditoria.component.css']
})

export class ReporteAuditoriaComponent implements OnInit, OnDestroy {

    data_pdf: any = [];

    // CRITERIOS DE BUSQUEDA POR FECHAS
    get rangoFechas() { return this.reporteService.rangoFechas };

    // SELECCIÓN DE BUSQUEDA DE DATOS SEGÚN OPCIÓN
    //get bool() { return this.reporteService.criteriosBusqueda };



    tablasSolicitadas: any = [];
    // ITEMS DE PAGINACION DE LA TABLA
    pageSizeOptions = [5, 10, 20, 50];
    tamanio_pagina: number = 5;
    numero_pagina: number = 1;


    // BUSQUEDA DE FUNCIONES ACTIVAS
    get geolocalizacion(): boolean { return this.varificarFunciones.geolocalizacion; }
    get alimentacion(): boolean { return this.varificarFunciones.alimentacion; }
    get horas_extras(): boolean { return this.varificarFunciones.horasExtras; }
    get timbre_virtual(): boolean { return this.varificarFunciones.timbre_web; }
    get vacaciones(): boolean { return this.varificarFunciones.vacaciones; }
    get permisos(): boolean { return this.varificarFunciones.permisos; }
    get acciones_personal(): boolean { return this.varificarFunciones.accionesPersonal; }
    get reloj_virtual(): boolean { return this.varificarFunciones.app_movil; }


    // Inicialización directa de la lista de objetos Tablas
    tablas: Tablas[] = [
        { nombre: "e_empresa ", modulo: "", disponibilidad: true },
        { nombre: "e_provincias", modulo: "", disponibilidad: true },
        { nombre: "e_ciudades", modulo: "", disponibilidad: true },
        { nombre: "e_sucursales ", modulo: "", disponibilidad: true },
        { nombre: "e_cat_cargo", modulo: "", disponibilidad: true },
        { nombre: "e_cat_modalidad_trabajo", modulo: "", disponibilidad: true },
        { nombre: "e_message_birthday", modulo: "", disponibilidad: true },
        { nombre: "e_documentacion", modulo: "", disponibilidad: true },
        { nombre: "ed_departamentos", modulo: "", disponibilidad: true },
        { nombre: "ed_niveles_departamento", modulo: "", disponibilidad: true },
        { nombre: "ed_relojes", modulo: "", disponibilidad: true },
        { nombre: "e_cat_discapacidad", modulo: "", disponibilidad: true },
        { nombre: "e_cat_vacuna", modulo: "", disponibilidad: true },
        { nombre: "ef_cat_feriados", modulo: "", disponibilidad: true },
        { nombre: "ef_ciudad_feriado", modulo: "", disponibilidad: true },
        { nombre: "eh_cat_horarios", modulo: "", disponibilidad: true },
        { nombre: "eh_detalle_horarios", modulo: "", disponibilidad: true },
        { nombre: "ep_parametro", modulo: "", disponibilidad: true },
        { nombre: "ep_detalle_parametro", modulo: "", disponibilidad: true },
        { nombre: "ere_cat_regimenes", modulo: "", disponibilidad: true },
        { nombre: "ere_dividir_vacaciones", modulo: "", disponibilidad: true },
        { nombre: "ere_antiguedad", modulo: "", disponibilidad: true },
        { nombre: "es_paginas", modulo: "", disponibilidad: true },
        { nombre: "es_acciones_paginas", modulo: "", disponibilidad: true },
        { nombre: "ero_cat_roles", modulo: "", disponibilidad: true },
        { nombre: "ero_rol_permisos", modulo: "", disponibilidad: true },
        { nombre: "et_cat_nivel_titulo", modulo: "", disponibilidad: true },
        { nombre: "et_titulos", modulo: "", disponibilidad: true },
        { nombre: "e_codigo", modulo: "", disponibilidad: true },
        { nombre: "eu_empleados", modulo: "", disponibilidad: true },
        { nombre: "eu_usuarios", modulo: "", disponibilidad: true },
        { nombre: "eu_empleado_contratos", modulo: "", disponibilidad: true },
        { nombre: "eu_empleado_cargos", modulo: "", disponibilidad: true },
        { nombre: "eu_empleado_titulos", modulo: "", disponibilidad: true },
        { nombre: "eu_empleado_discapacidad", modulo: "", disponibilidad: true },
        { nombre: "eu_empleado_vacunas", modulo: "", disponibilidad: true },
        { nombre: "eu_configurar_alertas", modulo: "", disponibilidad: true },
        { nombre: "eu_asistencia_general", modulo: "", disponibilidad: true },
        { nombre: "eu_timbres", modulo: "", disponibilidad: true },
        { nombre: "eu_usuario_sucursal", modulo: "", disponibilidad: true },
        { nombre: "eu_empleado_justifica_atraso", modulo: "", disponibilidad: true },
        { nombre: "ed_autoriza_departamento", modulo: "", disponibilidad: true },
        { nombre: "ecm_autorizaciones", modulo: "", disponibilidad: true },
        { nombre: "ecm_realtime_notificacion", modulo: "", disponibilidad: true },
        { nombre: "ecm_realtime_timbres", modulo: "", disponibilidad: true },
        { nombre: "ma_cg_comidas", modulo: "alimentacion", disponibilidad: this.alimentacion },
        { nombre: "ma_detalle_comida", modulo: "alimentacion", disponibilidad: this.alimentacion },
        { nombre: "ma_detalle_plan_comida", modulo: "alimentacion", disponibilidad: this.alimentacion },
        { nombre: "ma_empleado_plan_comida_general", modulo: "alimentacion", disponibilidad: this.alimentacion },
        { nombre: "ma_horario_comidas", modulo: "alimentacion", disponibilidad: this.alimentacion },
        { nombre: "ma_invitados_comida", modulo: "alimentacion", disponibilidad: this.alimentacion },
        { nombre: "ma_solicitud_comida", modulo: "alimentacion", disponibilidad: this.alimentacion },
        { nombre: "map_cargo_propuesto", modulo: "acciones_personal", disponibilidad: this.acciones_personal },
        { nombre: "map_cg_procesos", modulo: "acciones_personal", disponibilidad: this.acciones_personal },
        { nombre: "map_contexto_legal_accion_personal", modulo: "acciones_personal", disponibilidad: this.acciones_personal },
        { nombre: "map_detalle_tipo_accion_personal", modulo: "acciones_personal", disponibilidad: this.acciones_personal },
        { nombre: "map_empleado_procesos", modulo: " acciones_personal", disponibilidad: this.acciones_personal },
        { nombre: "map_solicitud_accion_personal", modulo: "acciones_personal", disponibilidad: this.acciones_personal },
        { nombre: "map_tipo_accion_personal", modulo: "acciones_personal", disponibilidad: this.acciones_personal },
        { nombre: "mg_cg_ubicaiones", modulo: "geolocalizacion", disponibilidad: this.geolocalizacion },
        { nombre: "mg_empleado_ubicacion", modulo: "geolocalizacion", disponibilidad: this.geolocalizacion },
        { nombre: "mhe_calcular_hora_extra", modulo: "horas_extras", disponibilidad: this.horas_extras },
        { nombre: "mhe_configurar_hora_extra", modulo: "horas_extras", disponibilidad: this.horas_extras },
        { nombre: "mhe_detalle_plan_hora_extra", modulo: "horas_extras", disponibilidad: this.horas_extras },
        { nombre: "mhe_empleado_plan_hora_extra", modulo: "horas_extras", disponibilidad: this.horas_extras },
        { nombre: "mhe_solicitud_hora_extra", modulo: "horas_extras", disponibilidad: this.horas_extras },
        { nombre: "mp_cg_tipo_permisos", modulo: "permisos", disponibilidad: this.permisos },
        { nombre: "mp_solicitud_permiso", modulo: "permisos", disponibilidad: this.permisos },
        { nombre: "mrv_dispositivos", modulo: "reloj_virtual", disponibilidad: this.reloj_virtual },
        { nombre: "mv_periodo_vacacion", modulo: "vacaciones", disponibilidad: this.vacaciones },
        { nombre: "mv_solicitud_vacacion", modulo: "vacaciones", disponibilidad: this.vacaciones }

    ];


    constructor(
        private varificarFunciones: MainNavService,
        private reporteService: ReportesService,
        private toastr: ToastrService,
        private restAuditoria: AuditoriaService,
        private restEmpre: EmpresaService,


    ) {

        this.ObtenerLogo();
        this.ObtenerColores();

    }


    // VALIDACIONES DE OPCIONES DE REPORTE
    ValidarReporte() {
        if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Primero valide fechas de búsqueda.');
        this.ModelarTablasAuditoria();
    }


    //BUSCAR REGISTROS AUDITORIA

    ModelarTablasAuditoria() {

        this.data_pdf = [];

        // Crear un array de promesas para todas las consultas
        const consultas1 = this.tablasSolicitadas.map(x => {
            const buscarTabla = {
                tabla: x.nombre,
                desde: this.rangoFechas.fec_inico,
                hasta: this.rangoFechas.fec_final,
                action: 'I'
            };
            return new Promise((resolve, reject) => {
                this.restAuditoria.ConsultarAuditoria(buscarTabla).subscribe(
                    res => resolve(res), // Resuelve la promesa con el resultado
                    error => {
                        if (error.status == '404') {
                            this.toastr.error('No existen registros en' + x.nombre, 'Ups!!! algo salio mal..', {
                                timeOut: 6000,
                            })
                        }
                    }
                );
            });
        });

        // Esperar a que todas las promesas se completen
        Promise.all(consultas1)
            .then(resultados => {
                // Todos los resultados están disponibles aquí
                this.data_pdf = resultados;
                // Puedes hacer más cosas aquí después de obtener todos los resultados
                this.GenerarPDF( this.data_pdf);
                console.log(this.data_pdf[0][0].action)

            })
            .catch(error => {
                // Manejar errores aquí
                console.error('Error en una o más consultas:', error);
            });


        /////////////////////////////////////////

        /*
        this.data_pdf = [];
                // Crear un array de promesas para todas las consultas
                const consultas = this.tablasSolicitadas.map(x => {
                    const buscarTabla = {
                        tabla: x.nombre,
                        desde: this.rangoFechas.fec_inico,
                        hasta: this.rangoFechas.fec_final,
                        action: 'I'
                    };
                    // return new Promise((resolve, reject) => {
        
        
        
                    this.restAuditoria.ConsultarAuditoria(buscarTabla).subscribe(
                        res => {
                            this.data_pdf.push(res)
                            console.log(this.data_pdf);
        
        
        
        
                        }, error => {
                            if (error.status == '404') {
                                this.toastr.error('No existen registros en' + x.nombre, 'Ups!!! algo salio mal..', {
                                    timeOut: 6000,
                                })
                            }
                        }
                    )
        
        
                });
        
                this.GenerarPDF();
        
                */

    }




    ngOnDestroy(): void {
        //this.ModelarTablasAuditoria();
    }
    ngOnInit(): void {
    }
    // METODO PARA MOSTRAR FILAS DETERMINADAS DE DATOS EN LA TABLA
    ManejarPagina(e: PageEvent) {
        this.numero_pagina = e.pageIndex + 1;
        this.tamanio_pagina = e.pageSize;
    }



    // METODOS PARA LA SELECCION MULTIPLE

    plan_multiple: boolean = false;
    plan_multiple_: boolean = false;

    HabilitarSeleccion() {
        this.plan_multiple = true;
        this.plan_multiple_ = true;
        this.auto_individual = false;
        this.activar_seleccion = false;
    }

    auto_individual: boolean = true;
    activar_seleccion: boolean = true;
    seleccion_vacia: boolean = true;

    selectionAuditoria = new SelectionModel<Tablas>(true, []);



    // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
    isAllSelectedPag() {
        const numSelected = this.selectionAuditoria.selected.length;
        return numSelected === this.tablas.length
    }


    // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
    masterTogglePag() {
        this.isAllSelectedPag() ?
            this.selectionAuditoria.clear() :
            this.tablas.forEach((row: any) => this.selectionAuditoria.select(row));
    }


    // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
    checkboxLabelPag(row?: Tablas): string {
        if (!row) {
            return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
        }
        this.tablasSolicitadas = this.selectionAuditoria.selected;

        //console.log(this.selectionPaginas.selected)
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
 **                                              PDF                                           **
 ** ****************************************************************************************** **/

    GenerarPDF(data: any) {
        let documentDefinition: any;
        documentDefinition = this.GetDocumentDefinicion(data);
        let doc_name = `Auditoría.pdf`;
        pdfMake.createPdf(documentDefinition).open();

    }



    GetDocumentDefinicion(data: any) {
        return {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [40, 50, 40, 50],
            watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
            header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },


            footer: function (currentPage: any, pageCount: any, fecha: any) {
                let f = moment();
                fecha = f.format('YYYY-MM-DD');
                let time = f.format('HH:mm:ss');
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
                //{ text: (localStorage.getItem('name_empresa') as string).toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
                { text: `AUDITORÍA`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
                //{ text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
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


/*
    // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
    EstructurarDatosPDF(data: any[]): Array<any> {
        let n: any = []

        let totalAuditotia = 0;


        totalAuditotia = 0;
        n.push({
            style: 'tableMarginCabecera',
            table: {
                widths: ['*'],
                headerRows: 1,
                body: [
                    [


                        {
                            border: [true, true, false, true],
                            bold: true,
                            text: 'PLATAFORMA: '+data[0][0].plataforma ,
                            style: 'itemsTableInfo'
                        },
                    ]
                ]
            }
        })


        n.push({
            style: 'tableMargin',
            table: {
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*', '*', '*'],
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
                    //  ...arr_emp.map((usu: any) => {
                    // return

                    ...data.map(audi => {

                        return [
                            { style: 'itemsTableCentrado', text: totalAuditotia + 1 },
                            { style: 'itemsTable', text: audi.plataforma },
                            { style: 'itemsTable', text: audi.user_name },
                            { style: 'itemsTableCentrado', text: audi.ip_address },
                            { style: 'itemsTableCentrado', text: audi.table_name },
                            { style: 'itemsTable', text: audi.action },
                            { style: 'itemsTable', text: audi.fecha_hora },
                            { style: 'itemsTable', text: audi.fecha_hora },
                            { style: 'itemsTable', text: audi.original_data },
                            { style: 'itemsTable', text: audi.new_data },
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
*/

    EstructurarDatosPDF(data: any[]): Array<any> {
        let n: any = []
    
        let totalAuditoria = 0;
    
        // Añadir la cabecera con información de la plataforma
        n.push({
            style: 'tableMarginCabecera',
            table: {
                widths: ['*'],
                headerRows: 1,
                body: [
                    [
                        {
                            border: [true, true, false, true],
                            bold: true,
                            text: 'PLATAFORMA: ' + data[0][0].plataforma,
                            style: 'itemsTableInfo'
                        },
                    ]
                ]
            }
        });
    
        // Añadir la tabla de datos
        n.push({
            style: 'tableMargin',
            table: {
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*'],
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
                            { style: 'itemsTable', text: audi[0].plataforma },
                            { style: 'itemsTable', text: audi[0].user_name },
                            { style: 'itemsTableCentrado', text: audi[0].ip_address },
                            { style: 'itemsTableCentrado', text: audi[0].table_name },
                            { style: 'itemsTable', text: audi[0].action },
                            { style: 'itemsTable', text:  this.getDateFromISO(audi[0].fecha_hora)  },
                            { style: 'itemsTable', text: this.getTimeFromISO(audi[0].fecha_hora)  },
                            { style: 'itemsTable', text: audi[0].original_data },
                            { style: 'itemsTable', text: audi[0].new_data },
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

     getDateFromISO(isoString: string): string {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }


    getTimeFromISO(isoString: string): string {
        const date = new Date(isoString);
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }



}
