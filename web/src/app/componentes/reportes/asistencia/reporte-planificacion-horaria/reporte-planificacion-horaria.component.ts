// IMPORTAR LIBRERIAS
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import { DateTime } from 'luxon';

import * as xlsx from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ReportesService } from '../../../../servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-reporte-planificacion-horaria',
  templateUrl: './reporte-planificacion-horaria.component.html',
  styleUrls: ['./reporte-planificacion-horaria.component.css']
})

export class ReportePlanificacionHorariaComponent implements OnInit, OnDestroy {
  // CRITERIOS DE BUSQUEDA POR FECHAS
  get rangoFechas() { return this.reporteService.rangoFechas };

  // SELECCION DE BUSQUEDA DE DATOS SEGÚN OPCIÓN
  get opcion() { return this.reporteService.opcion };

  // CRITERIOS DE BUSQUEDA SEGÚN OPCIÓN SELECCIONADA
  get bool() { return this.reporteService.criteriosBusqueda };

  //FILTROS
  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc };
  get filtroNombreDep() { return this.reporteService.filtroNombreDep };
  get filtroNombreReg() { return this.reporteService.filtroNombreReg };
  get filtroNombreCar() { return this.reporteService.filtroNombreCarg };
  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };

  // VARIABLES DE ALMACENAMIENTO DE DATOS SELECCIONADOS EN LA BUSQUEDA
  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<any>(true, []);
  selectionCar = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl();
  fechaFinalF = new FormControl();

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  idEmpleadoLogueado: any;
  departamentos: any = [];
  sucursales: any = [];
  resultados: any = [];
  empleados: any = [];
  regimen: any = [];
  horarios: any = [];
  cargos: any = [];
  idsEmpleado: string = '';
  accion: any;

  // VARIABLES PARA MOSTRAR DETALLES
  verDetalle: boolean = false;

  // METODO PARA OBTENER DETALLE DE PLANIFICACION
  ver_detalle: boolean = false;
  ver_acciones: boolean = false;
  paginar: boolean = false;
  detalles: any = [];
  detalle_acciones: any = [];

  // VARIABLES UTILIZADAS PARA IDENTIFICAR EL TIPO DE USUARIO
  tipoUsuario: string = 'activo';
  opcionBusqueda: number = 1;
  limpiar: number = 0;

  // ACCIONES DE HORARIOS
  entrada: '';
  salida: '';
  inicio_comida = '';
  fin_comida = '';

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  numero_pagina_suc: number = 1;
  tamanio_pagina_suc: number = 5;
  pageSizeOptions_suc = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA REGIMEN
  numero_pagina_reg: number = 1;
  tamanio_pagina_reg: number = 5;
  pageSizeOptions_reg = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA CARGO
  numero_pagina_car: number = 1;
  tamanio_pagina_car: number = 5;
  pageSizeOptions_car = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  numero_pagina_dep: number = 1;
  tamanio_pagina_dep: number = 5;
  pageSizeOptions_dep = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  numero_pagina_emp: number = 1;
  tamanio_pagina_emp: number = 5;
  pageSizeOptions_emp = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA DETALLE
  @ViewChild('paginatorDetalle') paginatorDetalle: MatPaginator;
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA RESULTADOS
  @ViewChild('paginatorResultado') paginatorResultado: MatPaginator;
  pageSizeOptions_res = [5, 10, 20, 50];
  tamanio_pagina_res: number = 5;
  numero_pagina_res: number = 1;

  // ARREGLO DE DATOS DE HORARIOS
  nomenclatura = [
    { nombre: 'L', descripcion: 'LIBRE' },
    { nombre: 'FD', descripcion: 'FERIADO' },
    { nombre: 'REC', descripcion: 'RECUPERACIÓN' },
    { nombre: 'P', descripcion: 'PERMISO' },
    { nombre: 'V', descripcion: 'VACACION' },
    { nombre: '-', descripcion: 'SIN PLANIFICACIÓN' }
  ]

  constructor(
    private reporteService: ReportesService,
    private informacion: DatosGeneralesService,
    private parametro: ParametrosService,
    private restEmpre: EmpresaService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private plan: PlanGeneralService,
    public restUsuario: UsuarioService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.BuscarInformacionGeneral(this.opcionBusqueda);
    this.BuscarParametro();
  }

  ngOnDestroy(): void {
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.horarios = [];
    this.cargos = [];
  }

  /** ****************************************************************************************** **
   ** **                     BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** ****************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';
  idioma_fechas: string = 'es';
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

  /** ****************************************************************************************** **
   ** **                           BUSQUEDA Y MODELAMIENTO DE DATOS                           ** **
   ** ****************************************************************************************** **/

  // METODO DE BUSQUEDA DE DATOS GENERALES DEL EMPLEADO
  BuscarInformacionGeneral(opcion: any) {
    // LIMPIAR DATOS DE ALMACENAMIENTO
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    this.informacion.ObtenerInformacionGeneral(opcion).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatos(informacion: any) {
    this.cargos = this.validar.ProcesarDatosCargos(informacion);
    this.regimen = this.validar.ProcesarDatosRegimen(informacion);
    this.empleados = this.validar.ProcesarDatosEmpleados(informacion);
    this.sucursales = this.validar.ProcesarDatosSucursales(informacion);
    this.departamentos = this.validar.ProcesarDatosDepartamentos(informacion);
  }

  // METODO PARA OBTENER DATOS SEGUN EL ESTADO DEL USUARIO
  ObtenerTipoUsuario($event: string) {
    this.tipoUsuario = $event;
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.limpiar = this.opcionBusqueda;
    this.selectionSuc.clear();
    this.selectionDep.clear();
    this.selectionCar.clear();
    this.selectionReg.clear();
    this.selectionEmp.clear();
    this.BuscarInformacionGeneral(this.opcionBusqueda);
  }

  // VALIDACIONES DE SELECCION DE BUSQUEDA
  ValidarReporte(action: any) {
    if (this.fechaInicialF.value == null && this.fechaFinalF.value == null) return this.toastr.error('Ingresar fechas de búsqueda.'); if (
      this.bool.bool_suc === false &&
      this.bool.bool_reg === false &&
      this.bool.bool_cargo === false &&
      this.bool.bool_dep === false &&
      this.bool.bool_emp === false
    )
      return this.toastr.error('Seleccione un criterio de búsqueda.');
    // METODO PARA MODELAR DATOS
    this.ModelarDatos(action);
  }

  // MODELAR DATOS DE ACUERDO AL CRITERIO DE BUSQUEDA
  ModelarDatos(accion: any) {
    let seleccionados: any = [];
    this.accion = accion;
    switch (this.opcion) {
      case 's':
        if (this.selectionSuc.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione sucursal.'
          );
        seleccionados = this.validar.ModelarSucursal(this.empleados, this.sucursales, this.selectionSuc);
        break;
      case 'r':
        if (this.selectionReg.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione régimen.'
          );
        seleccionados = this.validar.ModelarRegimen(this.empleados, this.regimen, this.selectionReg);
        break;
      case 'c':
        if (this.selectionCar.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno',
            'Seleccione Cargo'
          );
        seleccionados = this.validar.ModelarCargo(this.empleados, this.cargos, this.selectionCar);
        break;
      case 'd':
        if (this.selectionDep.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione departamentos.'
          );
        seleccionados = this.validar.ModelarDepartamento(this.empleados, this.departamentos, this.selectionDep);
        break;
      case 'e':
        if (this.selectionEmp.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione empleados.'
          );
        seleccionados = this.validar.ModelarEmpleados(this.empleados, this.selectionEmp);
        break;
      default:
        this.toastr.error(
          'Ups!!! algo salio mal.',
          'Seleccione criterio de búsqueda.'
        );
        this.reporteService.DefaultFormCriterios();
        break;
    }
    // METODO PARA MOSTRAR DATOS DE REGISTROS DEL USUARIO
    if (seleccionados.length != 0) {
      this.VerPlanificacion(seleccionados);
    }
  }

  // METODO PARA VER PLANIFICACION
  VerPlanificacion(data: any) {
    this.resultados = [];
    this.idsEmpleado = '';
    data.forEach((info: any) => {
      info.empleados.forEach((usu: any) => {
        this.resultados.push(usu);
        if (this.idsEmpleado === '') {
          this.idsEmpleado = '\'' + usu.id + '\''
        }
        else {
          this.idsEmpleado = this.idsEmpleado + ', \'' + usu.id + '\''
        }
      })
    })
    this.ObtenerHorariosEmpleado(this.fechaInicialF.value, this.fechaFinalF.value, this.idsEmpleado);
  }

  // METODO PARA MOSTRAR DATOS DE HORARIO
  horariosEmpleado: any = [];
  mes_inicio: any = '';
  mes_fin: any = '';
  ObtenerHorariosEmpleado(fec_inicio: any, fec_final: any, id_empleado: any) {
    this.horariosEmpleado = [];
    this.mes_inicio = DateTime.fromISO(fec_inicio).toFormat('yyyy-MM-dd');
    this.mes_fin = DateTime.fromISO(fec_final).toFormat('yyyy-MM-dd');
    let busqueda = {
      fecha_inicio: this.mes_inicio,
      fecha_final: this.mes_fin,
      id_empleado: id_empleado
    }
    //console.log('fechas ', busqueda)
    this.plan.BuscarPlanificacionHoraria(busqueda).subscribe((datos: any) => {
      if (datos.message === 'OK') {
        const horarios = datos.data;
        const horariosPorEmpleado = {};

        //AGRUPAMIENTO DE LOS HORIOS POR CODIGO DE EMPLEADO
        horarios.forEach((h: any) => {
          horariosPorEmpleado[h.codigo_e] = horariosPorEmpleado[h.codigo_e] || [];
          horariosPorEmpleado[h.codigo_e].push(h);
        });
        this.resultados.forEach((r: any) => {
          r.horarios = horariosPorEmpleado[r.codigo];
        });
        this.resultados = this.resultados.filter((r: any) => {
          return r.horarios !== undefined && r.horarios !== null;
        });
        this.horariosEmpleado = this.resultados;
        this.ObtenerDetallesPlanificacion();
      }
      else {
        this.toastr.info('Ups!!! no se han encontrado registros.', 'No existe planificación.', {
          timeOut: 6000,
        });
      }
    })
  }

  // METODO PARA OBTENER PLANIFICACION HORARIA
  ObtenerDetallesPlanificacion() {
    this.detalles = [];
    // DATOS DE BUSQUEDA DE DETALLES DE PLANIFICACION
    let busqueda = {
      fecha_inicio: this.mes_inicio,
      fecha_final: this.mes_fin,
      id_empleado: this.idsEmpleado
    }
    let codigo_horario = '';
    let tipos: any = [];
    let accion = '';
    // VARIABLES AUXILIARES
    let aux_h = '';
    let aux_a = '';
    // BUSQUEDA DE DETALLES DE PLANIFICACIONES
    this.plan.BuscarDetallePlanificacion(busqueda).subscribe((datos: any) => {
      if (datos.message === 'OK') {
        this.ver_acciones = true;
        this.detalle_acciones = [];
        this.detalles = datos.data;
        datos.data.forEach((obj: any) => {
          if (aux_h === '') {
            accion = obj.tipo_accion + ': ' + obj.hora;
            this.ValidarAcciones(obj);
          } else if (obj.id_horario === aux_h) {
            if (obj.tipo_accion != aux_a) {
              accion = accion + ' , ' + obj.tipo_accion + ': ' + obj.hora
              codigo_horario = obj.codigo_dia
              this.ValidarAcciones(obj);
            }
          } else {
            // CONCATENAR VALORES ANTERIORES
            tipos = [{
              acciones: accion,
              horario: codigo_horario,
              entrada: this.entrada,
              inicio_comida: this.inicio_comida,
              fin_comida: this.fin_comida,
              salida: this.salida,
            }];
            this.detalle_acciones = this.detalle_acciones.concat(tipos);
            // LIMPIAR VALORES
            accion = obj.tipo_accion + ': ' + obj.hora;
            codigo_horario = obj.codigo_dia;
            this.entrada = '';
            this.salida = '';
            this.inicio_comida = '';
            this.fin_comida = '';
            this.ValidarAcciones(obj);
          }
          // ASIGNAR VALORES A VARIABLES AUXILIARES
          aux_h = obj.id_horario;
          aux_a = obj.tipo_accion;
        })
        // AL FINALIZAR EL CICLO CONCATENAR VALORES
        tipos = [{
          acciones: accion,
          horario: codigo_horario,
          entrada: this.entrada,
          inicio_comida: this.inicio_comida,
          fin_comida: this.fin_comida,
          salida: this.salida,
        }]
        this.detalle_acciones = this.detalle_acciones.concat(tipos);
        // FORMATEAR HORAS
        this.detalle_acciones.forEach((detalle: any) => {
          detalle.entrada_ = this.validar.FormatearHora(detalle.entrada, this.formato_hora);
          if (detalle.inicio_comida != '') {
            detalle.inicio_comida = this.validar.FormatearHora(detalle.inicio_comida, this.formato_hora);
          }
          if (detalle.fin_comida != '') {
            detalle.fin_comida = this.validar.FormatearHora(detalle.fin_comida, this.formato_hora);
          }
          detalle.salida_ = this.validar.FormatearHora(detalle.salida, this.formato_hora);
        })
        // METODO PARA VER PAGINACION
        if (this.detalle_acciones.length > 8) {
          this.paginar = true;
        }
        else {
          this.paginar = false;
        }
        this.EjecutarAccion();
      }
      else {
        this.EjecutarAccion();
        this.toastr.info('Ups!!! no se han encontrado registros.', 'No existe detalle de planificación.', {
          timeOut: 6000,
        });
      }
    })
  }

  // CONDICIONES DE ACCIONES EN HORARIO ASIGNADO
  ValidarAcciones(obj: any) {
    if (obj.tipo_accion === 'E') {
      return this.entrada = obj.hora;
    }
    if (obj.tipo_accion === 'S') {
      return this.salida = obj.hora;
    }
    if (obj.tipo_accion === 'I/A') {
      return this.inicio_comida = obj.hora;
    }
    if (obj.tipo_accion === 'F/A') {
      return this.fin_comida = obj.hora;
    }
  }

  EjecutarAccion() {
    switch (this.accion) {
      case 'excel': this.ExportarExcel(); break;
      case 'ver': this.VerDatos(); break;
      default: this.GenerarPDF(this.accion); break;
    }
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
   ** **                           METODO PARA GENERAR PDF                                    ** **
   ** ****************************************************************************************** **/
  GenerarPDF(action: any) {
    const documentDefinition = this.DefinirInformacionPDF();
    let doc_name = `Planificacion_horaria_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(doc_name); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF() {
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
        { text: `PLANIFICACIÓN HORARIA - ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: 'PERIODO DEL: ' + this.mes_inicio + " AL " + this.mes_fin, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF().map((obj: any) => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 7, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeaderSecundario: { fontSize: 7, bold: true, alignment: 'center', fillColor: this.s_color, margin: [0, 1, 0, 1] },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 6, alignment: 'center', margin: [1, 3, 1, 3] },
        tableMargin: { margin: [0, 0, 0, 10] },
        tableMarginHorarios: { margin: [10, 10, 10, 0] },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
      }
    };
  }

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(): Array<any> {
    let n: any = []
    if (this.ver_acciones) {
      n.push({
        style: 'tableMargin',
        table: {
          widths: ['*', 'auto', '*'],
          body: [
            [
              {
                border: [false, false, false, false],
                text: '',
              },
              {
                border: [false, false, false, false],
                table: {
                  widths: ['auto', 'auto'],
                  body: [
                    [
                      {
                        style: 'tableMarginHorarios',
                        border: [false, false, false, false],
                        table: {
                          widths: ['auto', 'auto', 'auto', 'auto', 'auto',],
                          headerRows: 2,
                          body: [
                            [
                              { colSpan: 5, text: 'DETALLE DE HORARIOS', style: 'tableHeader' },
                              {}, {}, {}, {}
                            ],
                            [
                              { text: 'HORARIO', style: 'tableHeader' },
                              { text: 'ENTRADA (E)', style: 'tableHeader' },
                              { text: 'INICIO ALIMENTACIÓN (I/A)', style: 'tableHeader' },
                              { text: 'FIN ALIMENTACIÓN (F/A)', style: 'tableHeader' },
                              { text: 'SALIDA (S)', style: 'tableHeader' }
                            ],
                            ...this.detalle_acciones.map((d: any) => {
                              return [
                                { style: 'itemsTableCentrado', text: d.horario },
                                { style: 'itemsTableCentrado', text: d.entrada_ },
                                { style: 'itemsTableCentrado', text: d.inicio_comida },
                                { style: 'itemsTableCentrado', text: d.fin_comida },
                                { style: 'itemsTableCentrado', text: d.salida_ },
                              ]
                            })
                          ]
                        },
                        layout: {
                          fillColor: function (rowIndex: any) {
                            return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                          }
                        }
                      },
                      {
                        style: 'tableMarginHorarios',
                        border: [false, false, false, false],
                        table: {
                          widths: ['auto', 'auto',],
                          headerRows: 2,
                          body: [
                            [
                              { colSpan: 2, text: 'DEFINICIONES', style: 'tableHeader' },
                              {},
                            ],
                            [
                              { text: 'NOMENCLATURA', style: 'tableHeader' },
                              { text: 'DESCRIPCIÓN', style: 'tableHeader' },
                            ],
                            ...this.nomenclatura.map(n => {
                              return [
                                { style: 'itemsTableCentrado', text: n.nombre },
                                { style: 'itemsTableCentrado', text: n.descripcion },
                              ]
                            })
                          ]
                        },
                        layout: {
                          fillColor: function (rowIndex: any) {
                            return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                          }
                        }
                      }
                    ]
                  ]
                },
              },
              {
                border: [false, false, false, false],
                text: '',
              }
            ]
          ]
        },

      },

      );
    };

    this.horariosEmpleado.forEach((e: any) => {
      n.push({
        style: 'tableMarginCabecera',
        table: {
          widths: ['*', 'auto', 'auto',],
          headerRows: 2,
          body: [
            [
              {
                border: [true, true, false, false],
                text: 'EMPLEADO: ' + e.apellido + ' ' + e.nombre,
                style: 'itemsTableInfoEmpleado'
              },
              {
                border: [false, true, false, false],
                text: 'C.C.: ' + e.cedula,
                style: 'itemsTableInfoEmpleado'
              },
              {
                border: [false, true, true, false],
                text: 'COD: ' + e.codigo,
                style: 'itemsTableInfoEmpleado'
              }
            ],
            [
              {
                border: [true, false, false, false],
                text: 'DEPARTAMENTO: ' + e.departamento,
                style: 'itemsTableInfoEmpleado'
              },
              {
                border: [false, false, false, false],
                text: 'CARGO: ' + e.cargo,
                style: 'itemsTableInfoEmpleado'
              },
              {
                border: [false, false, true, false],
                text: '',
                style: 'itemsTableInfoEmpleado'
              }
            ]
          ]
        }
      });

      e.horarios.forEach((h: any) => {
        n.push({
          style: 'tableMargin',
          table: {
            widths: [
              '*', '*', '*', '*', '*', '*', '*'
            ],
            headerRows: 0,
            body: [
              [
                { rowSpan: 1, colSpan: 7, text: 'AÑO: ' + h.anio + ' MES: ' + h.mes, style: 'tableHeaderSecundario' },
                {}, {}, {}, {}, {}, {}
              ],
              [
                { rowSpan: 1, text: '01', style: 'tableHeader' },
                { rowSpan: 1, text: '02', style: 'tableHeader' },
                { rowSpan: 1, text: '03', style: 'tableHeader' },
                { rowSpan: 1, text: '04', style: 'tableHeader' },
                { rowSpan: 1, text: '05', style: 'tableHeader' },
                { rowSpan: 1, text: '06', style: 'tableHeader' },
                { rowSpan: 1, text: '07', style: 'tableHeader' },
              ],
              [
                { style: 'itemsTableCentrado', text: h.dia1 },
                { style: 'itemsTableCentrado', text: h.dia2 },
                { style: 'itemsTableCentrado', text: h.dia3 },
                { style: 'itemsTableCentrado', text: h.dia4 },
                { style: 'itemsTableCentrado', text: h.dia5 },
                { style: 'itemsTableCentrado', text: h.dia6 },
                { style: 'itemsTableCentrado', text: h.dia7 },
              ],
              [
                { rowSpan: 1, text: '08', style: 'tableHeader' },
                { rowSpan: 1, text: '09', style: 'tableHeader' },
                { rowSpan: 1, text: '10', style: 'tableHeader' },
                { rowSpan: 1, text: '11', style: 'tableHeader' },
                { rowSpan: 1, text: '12', style: 'tableHeader' },
                { rowSpan: 1, text: '13', style: 'tableHeader' },
                { rowSpan: 1, text: '14', style: 'tableHeader' },
              ],
              [
                { style: 'itemsTableCentrado', text: h.dia8 },
                { style: 'itemsTableCentrado', text: h.dia9 },
                { style: 'itemsTableCentrado', text: h.dia10 },
                { style: 'itemsTableCentrado', text: h.dia11 },
                { style: 'itemsTableCentrado', text: h.dia12 },
                { style: 'itemsTableCentrado', text: h.dia13 },
                { style: 'itemsTableCentrado', text: h.dia14 },
              ],
              [
                { rowSpan: 1, text: '15', style: 'tableHeader' },
                { rowSpan: 1, text: '16', style: 'tableHeader' },
                { rowSpan: 1, text: '17', style: 'tableHeader' },
                { rowSpan: 1, text: '18', style: 'tableHeader' },
                { rowSpan: 1, text: '19', style: 'tableHeader' },
                { rowSpan: 1, text: '20', style: 'tableHeader' },
                { rowSpan: 1, text: '21', style: 'tableHeader' },
              ],
              [
                { style: 'itemsTableCentrado', text: h.dia15 },
                { style: 'itemsTableCentrado', text: h.dia16 },
                { style: 'itemsTableCentrado', text: h.dia17 },
                { style: 'itemsTableCentrado', text: h.dia18 },
                { style: 'itemsTableCentrado', text: h.dia19 },
                { style: 'itemsTableCentrado', text: h.dia20 },
                { style: 'itemsTableCentrado', text: h.dia21 }
              ],
              [
                { rowSpan: 1, text: '22', style: 'tableHeader' },
                { rowSpan: 1, text: '23', style: 'tableHeader' },
                { rowSpan: 1, text: '24', style: 'tableHeader' },
                { rowSpan: 1, text: '25', style: 'tableHeader' },
                { rowSpan: 1, text: '26', style: 'tableHeader' },
                { rowSpan: 1, text: '27', style: 'tableHeader' },
                { rowSpan: 1, text: '28', style: 'tableHeader' },
              ],
              [
                { style: 'itemsTableCentrado', text: h.dia22 },
                { style: 'itemsTableCentrado', text: h.dia23 },
                { style: 'itemsTableCentrado', text: h.dia24 },
                { style: 'itemsTableCentrado', text: h.dia25 },
                { style: 'itemsTableCentrado', text: h.dia26 },
                { style: 'itemsTableCentrado', text: h.dia27 },
                { style: 'itemsTableCentrado', text: h.dia28 },
              ],
              [
                { rowSpan: 1, text: '29', style: 'tableHeader' },
                { rowSpan: 1, text: '30', style: 'tableHeader' },
                { rowSpan: 1, text: '31', style: 'tableHeader' },
                {}, {}, {}, {}
              ],
              [
                { style: 'itemsTableCentrado', text: h.dia29 },
                { style: 'itemsTableCentrado', text: h.dia30 },
                { style: 'itemsTableCentrado', text: h.dia31 },
                {}, {}, {}, {}
              ],
            ],
          },
        });
      })
    })
    return n;
  }

  /** ****************************************************************************************** **
   ** **                               METODOS PARA EXPORTAR A EXCEL                          ** **
   ** ****************************************************************************************** **/

  ExportarExcel(): void {
    const sheet1: xlsx.WorkSheet = xlsx.utils.aoa_to_sheet(this.ConstruirTablaHorarioEmpleados());
    const sheet2: xlsx.WorkSheet = xlsx.utils.aoa_to_sheet(this.ConstruirTablaDetalleHorarios());
    const sheet3: xlsx.WorkSheet = xlsx.utils.aoa_to_sheet(this.ConstruirTablaDefiniciones());
    const workbook: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, sheet1, 'Planificacion horaria');
    xlsx.utils.book_append_sheet(workbook, sheet2, 'Detalle Horarios');
    xlsx.utils.book_append_sheet(workbook, sheet3, 'Definiciones');
    xlsx.writeFile(workbook, `Planificacion_horaria_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
  }

  ConstruirTablaHorarioEmpleados() {
    let n = 0;
    const tableData = [
      [
        'N°', 'CÓDIGO', 'NOMBRE EMPLEADO', 'CÉDULA',
        'SUCURSAL', 'CIUDAD', 'REGIMEN', 'DEPARTAMENTO',
        'CARGO', 'AÑO', 'MES',
        '01', '02', '03', '04', '05',
        '06', '07', '08', '09', '10',
        '11', '12', '13', '14', '15',
        '16', '17', '18', '19', '20',
        '21', '22', '23', '24', '25',
        '26', '27', '28', '29', '30', '31'
      ],
    ];

    this.horariosEmpleado.forEach((empleado) => {
      empleado.horarios.forEach((h: any) => {
        n++;
        tableData.push([
          n,
          empleado.codigo,
          empleado.apelido + ' ' + empleado.nombre,
          empleado.cedula,
          empleado.sucursal,
          empleado.ciudad,
          empleado.regimen,
          empleado.departamento,
          empleado.cargo,
          h.anio, h.mes,
          h.dia1, h.dia2, h.dia3, h.dia4,
          h.dia5, h.dia6, h.dia7, h.dia8,
          h.dia9, h.dia10, h.dia11, h.dia12,
          h.dia13, h.dia14, h.dia15, h.dia16,
          h.dia17, h.dia18, h.dia19, h.dia20,
          h.dia21, h.dia22, h.dia23, h.dia24,
          h.dia25, h.dia26, h.dia27, h.dia28,
          h.dia29, h.dia30, h.dia31
        ]);
      });
    });
    return tableData;
  }

  ConstruirTablaDetalleHorarios() {
    const tableData = [
      [
        'CÓDIGO', 'ENTRADA (E)',
        'INICIO ALIMENTACIÓN (I/A)',
        'FIN ALIMENTACIÓN (F/A)', 'SALIDA (S)'
      ],
    ];

    this.detalle_acciones.forEach((d) => {
      tableData.push([
        d.horario, d.entrada_, d.inicio_comida,
        d.fin_comida, d.salida_
      ]);
    });
    return tableData;
  }

  ConstruirTablaDefiniciones() {
    const tableData = [
      [
        'NOMENCLATURA', 'DESCRIPCIÓN'
      ],
    ];

    this.nomenclatura.forEach((n) => {
      tableData.push([
        n.nombre, n.descripcion
      ]);
    });
    return tableData;
  }

  /** ****************************************************************************************** **
   ** **                 METODO PARA EXTRAER HORARIOS PARA LA PREVISUALIZACION                ** **
   ** ****************************************************************************************** **/
  ExtraerHorarioEmpleados() {
    this.horarios = [];
    let n = 0;
    this.horariosEmpleado.forEach((empleado: any) => {
      empleado.horarios.forEach((h: any) => {
        n++;
        const horario = {
          n,
          cedula: empleado.cedula,
          codigo: empleado.codigo,
          empleado: empleado.apellido + ' ' + empleado.nombre,
          ciudad: empleado.ciudad,
          sucursal: empleado.sucursal,
          departamento: empleado.departamento,
          regimen: empleado.regimen[0].name_regimen,
          anio: h.anio, mes: h.mes,
          dia1: h.dia1, dia2: h.dia2, dia3: h.dia3, dia4: h.dia4,
          dia5: h.dia5, dia6: h.dia6, dia7: h.dia7, dia8: h.dia8,
          dia9: h.dia9, dia10: h.dia10, dia11: h.dia11, dia12: h.dia12,
          dia13: h.dia13, dia14: h.dia14, dia15: h.dia15, dia16: h.dia16,
          dia17: h.dia17, dia18: h.dia18, dia19: h.dia19, dia20: h.dia20,
          dia21: h.dia21, dia22: h.dia22, dia23: h.dia23, dia24: h.dia24,
          dia25: h.dia25, dia26: h.dia26, dia27: h.dia27, dia28: h.dia28,
          dia29: h.dia29, dia30: h.dia30, dia31: h.dia31
        }
        this.horarios.push(horario);
      })
    });
  }


  /** ****************************************************************************************** **
   **                   VARIOS METODOS COMPLEMENTARIOS AL FUNCIONAMIENTO.                        **
   ** ****************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleSuc() {
    this.isAllSelectedSuc() ?
      this.selectionSuc.clear() :
      this.sucursales.forEach((row: any) => this.selectionSuc.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedReg() {
    const numSelected = this.selectionReg.selected.length;
    return numSelected === this.regimen.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleReg() {
    this.isAllSelectedReg()
      ? this.selectionReg.clear()
      : this.regimen.forEach((row: any) => this.selectionReg.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelReg(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedReg() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionReg.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedCar() {
    const numSelected = this.selectionCar.selected.length;
    return numSelected === this.cargos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleCar() {
    this.isAllSelectedCar() ?
      this.selectionCar.clear() :
      this.cargos.forEach((row: any) => this.selectionCar.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelCar(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedCar() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionCar.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleDep() {
    this.isAllSelectedDep() ?
      this.selectionDep.clear() :
      this.departamentos.forEach((row: any) => this.selectionDep.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleEmp() {
    this.isAllSelectedEmp() ?
      this.selectionEmp.clear() :
      this.empleados.forEach((row: any) => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA EVENTOS DE PAGINACION
  ManejarPagina(e: PageEvent) {
    if (this.bool.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    }
    else if (this.bool.bool_reg === true) {
      this.tamanio_pagina_reg = e.pageSize;
      this.numero_pagina_reg = e.pageIndex + 1;
    }
    else if (this.bool.bool_cargo === true) {
      this.tamanio_pagina_car = e.pageSize;
      this.numero_pagina_car = e.pageIndex + 1;
    }
    else if (this.bool.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    }
    else if (this.bool.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
  }

  // METODO PARA MANEJAR PAGINACION DETALLE
  ManejarPaginaDetalle(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  ManejarPaginaResultados(e: PageEvent) {
    this.numero_pagina_res = e.pageIndex + 1;
    this.tamanio_pagina_res = e.pageSize;
  }

  // METODO PARA VALIDAR LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e)
  }

  // METODO PARA VALIDAR NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt)
  }

  // MOSTRAR DETALLES
  VerDatos() {
    this.ExtraerHorarioEmpleados();
    this.verDetalle = true;

  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.verDetalle = false;
    this.paginatorDetalle.firstPage();
    this.paginatorResultado.firstPage();
  }

  // METODO PARA CAMBIAR DE COLORES SEGUN EL MES
  CambiarColores(opcion: any) {
    let color: string;
    switch (opcion) {
      case 'ok':
        return color = '#F6DDCC';
    }
  }

  // METODO PARA MOSTRAR FECHA SELECCIONADA
  fecHorario: boolean = true;
  FormatearFecha(fecha: DateTime, datepicker: MatDatepicker<DateTime>, opcion: number) {
    const ctrlValue = fecha.toISOString();
    //console.log('value ', ctrlValue)
    //console.log('opcion ', opcion)
    if (opcion === 1) {
      if (this.fechaFinalF.value) {
        this.ValidarFechas(ctrlValue, this.fechaFinalF.value, this.fechaInicialF, opcion);
      }
      else {
        let inicio = DateTime.fromISO(ctrlValue).set({ day: 1 }).toFormat('dd/MM/yyyy');
        this.fechaInicialF.setValue(DateTime.fromFormat(inicio, 'dd/MM/yyyy').toISODate());
      }
      this.fecHorario = false;
    }
    else {
      this.ValidarFechas(this.fechaInicialF.value, ctrlValue, this.fechaFinalF, opcion);
    }
    datepicker.close();
  }

  // METODO PARA VALIDAR EL INGRESO DE LAS FECHAS
  ValidarFechas(fec_inicio: any, fec_fin: any, formulario: any, opcion: number) {
    //console.log('inicio ', fec_inicio);
    //console.log('final ', fec_fin);

    // PARSEAR LAS FECHAS DE ENTRADA
    const fechaInicio = DateTime.fromISO(fec_inicio);
    const fechaFin = DateTime.fromISO(fec_fin);

    // OBTENER EL PRIMER DIA DEL MES
    const inicio = fechaInicio.set({ day: 1 }).toFormat('dd/MM/yyyy');
    // OBTENER EL ÚLTIMO DIA DEL MES
    const final = fechaFin.endOf('month').toFormat('dd/MM/yyyy');

    // PARSEAR LAS FECHAS PARA LA COMPARACION
    const feci = DateTime.fromFormat(inicio, 'dd/MM/yyyy');
    const fecf = DateTime.fromFormat(final, 'dd/MM/yyyy');

    // VERIFICAR SI LAS FECHAS ESTAN INGRESADAS CORRECTAMENTE
    if (feci <= fecf) {
      if (opcion === 1) {
        formulario.setValue(feci.toISODate());
      } else {
        formulario.setValue(fecf.toISODate());
      }
    } else {
      this.toastr.warning('La fecha no se registró. Ups!!!, la fecha no es correcta.', 'VERIFICAR', {
        timeOut: 6000,
      });
    }
  }
}
