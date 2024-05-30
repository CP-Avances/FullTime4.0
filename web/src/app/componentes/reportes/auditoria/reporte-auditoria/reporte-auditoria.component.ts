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

    ) { }


    // VALIDACIONES DE OPCIONES DE REPORTE
    ValidarReporte() {
        if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Primero valide fechas de búsqueda.');
        this.BuscarTablasAuditoria();
    }


    //BUSCAR REGISTROS AUDITORIA

    BuscarTablasAuditoria() {

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
    }




    ngOnDestroy(): void {
        this.BuscarTablasAuditoria();
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


}
