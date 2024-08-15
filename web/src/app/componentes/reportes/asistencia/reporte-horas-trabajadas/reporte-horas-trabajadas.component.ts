// IMPORTAR LIBRERIAS
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';

import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR SERVICIOS
import { TiempoLaboradoService } from 'src/app/servicios/reportes/tiempoLaborado/tiempo-laborado.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ReportesService } from '../../../../servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-reporte-horas-trabajadas',
  templateUrl: './reporte-horas-trabajadas.component.html',
  styleUrls: ['./reporte-horas-trabajadas.component.css']
})
export class ReporteHorasTrabajadasComponent implements OnInit, OnDestroy {

  // CRITERIOS DE BUSQUEDA POR FECHAS
  get rangoFechas() { return this.reporteService.rangoFechas };

  // SELECCIÓN DE BUSQUEDA DE DATOS SEGÚN OPCIÓN
  get opcion() { return this.reporteService.opcion };

  // CRITERIOS DE BUSQUEDA SEGÚN OPCIÓN SELECCIONADA
  get bool() { return this.reporteService.criteriosBusqueda };

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  idEmpleadoLogueado: any;
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  data_pdf: any = [];
  regimen: any = [];
  timbres: any = [];
  cargos: any = [];

  // VARIABLES PARA MOSTRAR DETALLES
  verDetalle: boolean = false;

  // VARIABLES UTILIZADAS PARA IDENTIFICAR EL TIPO DE USUARIO
  tipoUsuario: string = 'activo';
  opcionBusqueda: number = 1;
  limpiar: number = 0;

  // VARIABLES DE ALMACENAMIENTO DE DATOS SELECCIONADOS EN LA BUSQUEDA
  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<any>(true, []);
  selectionCar = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

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

  //FILTROS
  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc };

  get filtroNombreDep() { return this.reporteService.filtroNombreDep };

  get filtroNombreReg() { return this.reporteService.filtroNombreReg };

  get filtroNombreCar() { return this.reporteService.filtroNombreCarg };

  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };

  constructor(
    private reportesTiempoLaborado: TiempoLaboradoService,
    private reporteService: ReportesService,
    private informacion: DatosGeneralesService,
    private parametro: ParametrosService,
    private restEmpre: EmpresaService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
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
    this.BuscarHora();
  }

  ngOnDestroy(): void {
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.timbres = [];
    this.cargos = [];
  }

  /** ****************************************************************************************** **
   ** **                     BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** ****************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
      });
  }

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE HORA
  BuscarHora() {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  /** ****************************************************************************************** **
   ** **                           BUSQUEDA Y MODELAMIENTO DE DATOS                           ** **
   ** ****************************************************************************************** **/

  // METODO DE BUSQUEDA DE DATOS GENERALES
  BuscarInformacionGeneral(opcion: any) {
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
    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Ingresar fechas de búsqueda.');
    if (
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
      this.MostrarInformacion(seleccionados, accion);
    }
  }

  // METODO PARA MOSTRAR INFORMACION
  MostrarInformacion(seleccionados: any, accion: any) {
    this.data_pdf = []
    this.reportesTiempoLaborado.ReporteTiempoLaborado(seleccionados, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'excel': this.ExportarExcel(); break;
        case 'ver': this.verDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
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
    let doc_name = `Tiempo_laborado_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
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
        { text: `TIEMPO LABORADO - ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF(this.data_pdf).map((obj: any) => {
          return obj
        })
      ],
      styles: {
        derecha: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color, alignment: 'left' },
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeaderSecundario: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0], fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        itemsTableCentradoFT: { fontSize: 8, alignment: 'center', fillColor: '#EE4444' },
        itemsTableCentradoMenor: { fontSize: 8, alignment: 'right', fillColor: '#55EE44' },
        itemsTableCentradoColores: { fontSize: 9, alignment: 'center' },
        itemsTableDerecha: { fontSize: 8, alignment: 'right' },
        itemsTableInfoTotal: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTableTotal: { fontSize: 8, bold: true, alignment: 'right', fillColor: '#E3E3E3' },
        itemsTableCentradoTotal: { fontSize: 8, bold: true, alignment: 'center', fillColor: '#E3E3E3' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginColores: { margin: [0, 15, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        tableMarginCabeceraTotal: { margin: [0, 20, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(data: any[]): Array<any> {
    let totalTiempoLaboradoEmpleado: number = 0;
    let totalTiempoPlanificadoEmpleado: number = 0;
    let totalPlanificado: number = 0;
    let totalLaborado: number = 0;
    let resumen: string = '';
    let general: any = [];
    let n: any = [];
    let c = 0;
    // CODIGO DE COLORES
    n.push({
      style: 'tableMarginColores',
      table: {
        widths: ['*', 'auto', 50, 'auto', 50],
        headerRows: 1,
        body: [
          [
            {
              text: 'CÓDIGO DE COLOR',
              style: 'itemsTableCentradoColores'
            },
            {
              text: 'FALTA TIMBRE',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoFT'
            },
            {
              text: 'TIEMPO LABORADO MENOR AL PLANIFICADO',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoMenor'
            },
          ]
        ]
      }
    });

    data.forEach((selec: any) => {
      // CONTAR REGISTROS
      let arr_reg = selec.empleados.map((o: any) => { return o.tLaborado.length });
      let reg = this.validar.SumarRegistros(arr_reg);
      // CONTAR MINUTOS LABORADOS Y PLANIFICADOS
      totalLaborado = 0;
      totalPlanificado = 0;
      selec.empleados.forEach((o: any) => {
        o.tLaborado.map((usu: any) => {
          const diferenciaEnMinutos = this.CalcularDiferenciaFechas(usu);
          const minutosPlanificados = diferenciaEnMinutos[0];
          const minutosLaborados = diferenciaEnMinutos[1];
          totalPlanificado += minutosPlanificados;
          totalLaborado += minutosLaborados;
        })
      })
      // NOMBRE DE CABECERAS DEL REPORTE DE ACUERDO CON EL FILTRO DE BUSQUEDA
      let descripcion = '';
      let establecimiento = 'SUCURSAL: ' + selec.sucursal;
      let opcion = selec.nombre;
      if (this.bool.bool_reg === true) {
        descripcion = 'RÉGIMEN LABORAL: ' + selec.nombre;
        resumen = 'TOTAL RÉGIMEN LABORAL';
      }
      else if (this.bool.bool_dep === true) {
        descripcion = 'DEPARTAMENTO: ' + selec.departamento;
        resumen = 'TOTAL DEPARTAMENTOS';
        opcion = selec.departamento;
      }
      else if (this.bool.bool_cargo === true) {
        descripcion = 'CARGO: ' + selec.nombre;
        resumen = 'TOTAL CARGOS';
      }
      else if (this.bool.bool_suc === true) {
        descripcion = 'CIUDAD: ' + selec.ciudad;
        resumen = 'TOTAL SUCURSALES';
      }
      else if (this.bool.bool_emp === true) {
        descripcion = 'LISTA EMPLEADOS';
        establecimiento = '';
      }
      // DATOS DE RESUMEN GENERAL
      let informacion = {
        sucursal: selec.sucursal,
        nombre: opcion,
        formato_general_planificado: this.MinutosAHorasMinutosSegundos(Number(totalPlanificado.toFixed(2))),
        formato_decimal_planifiado: totalPlanificado.toFixed(2),
        formato_general_laborado: this.MinutosAHorasMinutosSegundos(Number(totalLaborado.toFixed(2))),
        formato_decimal_laborado: totalLaborado.toFixed(2),
      }
      general.push(informacion);
      // CABECERA PRINCIPAL
      n.push({
        style: 'tableMarginCabecera',
        table: {
          widths: ['*', '*', '*'],
          headerRows: 1,
          body: [
            [
              {
                border: [true, true, false, true],
                bold: true,
                text: descripcion,
                style: 'itemsTableInfo',
              },
              {
                border: [false, true, false, true],
                bold: true,
                text: establecimiento,
                style: 'itemsTableInfo',
              },
              {
                border: [false, true, true, true],
                text: 'N° Registros: ' + reg,
                style: 'derecha',
              },
            ],
          ],
        },
      });
      // PRESENTACION DE LA INFORMACION
      selec.empleados.forEach((empl: any) => {
        n.push({
          style: 'tableMarginCabeceraEmpleado',
          table: {
            widths: ['*', 'auto', 'auto'],
            headerRows: 2,
            body: [
              [
                {
                  border: [true, true, false, false],
                  text: 'C.C.: ' + empl.cedula,
                  style: 'itemsTableInfoEmpleado',
                },
                {
                  border: [true, true, false, false],
                  text: 'EMPLEADO: ' + empl.apellido + ' ' + empl.nombre,
                  style: 'itemsTableInfoEmpleado',
                },
                {
                  border: [true, true, true, false],
                  text: 'COD: ' + empl.codigo,
                  style: 'itemsTableInfoEmpleado',
                },
              ],
              [
                {
                  border: [true, false, true, false],
                  text: 'RÉGIMEN LABORAL ' + empl.regimen,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [true, false, false, false],
                  text: 'DEPARTAMENTO: ' + empl.departamento,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [true, false, true, false],
                  text: 'CARGO: ' + empl.cargo,
                  style: 'itemsTableInfoEmpleado'
                }
              ]
            ],
          },
        });
        // ENCERAR VARIABLES
        c = 0;
        totalTiempoLaboradoEmpleado = 0;
        totalTiempoPlanificadoEmpleado = 0;
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*', '*', '*'],
            headerRows: 2,
            body: [
              [
                { rowSpan: 2, text: 'N°', style: 'centrado' },
                { rowSpan: 2, text: 'FECHA', style: 'centrado' },
                { colSpan: 2, rowSpan: 1, text: 'ENTRADA', style: 'tableHeader' },
                {},
                { colSpan: 2, rowSpan: 1, text: 'INICIO ALIMENTACIÓN', style: 'tableHeader' },
                {},
                { colSpan: 2, rowSpan: 1, text: 'FIN ALIMENTACIÓN', style: 'tableHeader' },
                {},
                { colSpan: 2, rowSpan: 1, text: 'SALIDA', style: 'tableHeader' },
                {},
                { rowSpan: 2, colSpan: 2, text: 'TIEMPO PLANIFICADO', style: 'centrado' },
                {},
                { rowSpan: 2, colSpan: 2, text: 'TIEMPO LABORADO', style: 'centrado' },
                {}
              ],
              [
                {}, {},
                { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                { rowSpan: 1, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                { rowSpan: 1, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                { rowSpan: 1, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                { rowSpan: 1, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                {}, {}, {}, {}
              ],
              ...empl.tLaborado.map((usu: any) => {
                c = c + 1;
                //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
                const fecha = this.validar.FormatearFecha(usu.entrada.fecha_horario, this.formato_fecha, this.validar.dia_abreviado);
                const entradaHorario = this.validar.FormatearHora(usu.entrada.fecha_hora_horario.split(' ')[1], this.formato_hora);
                const salidaHorario = this.validar.FormatearHora(usu.salida.fecha_hora_horario.split(' ')[1], this.formato_hora);
                const inicioAlimentacionHorario = usu.tipo == 'EAS'
                  ? this.validar.FormatearHora(usu.inicioAlimentacion.fecha_hora_horario.split(' ')[1], this.formato_hora)
                  : '';
                const finAlimentacionHorario = usu.tipo == 'EAS'
                  ? this.validar.FormatearHora(usu.finAlimentacion.fecha_hora_horario.split(' ')[1], this.formato_hora)
                  : '';
                const entrada = usu.entrada.fecha_hora_timbre != null
                  ? this.validar.FormatearHora(usu.entrada.fecha_hora_timbre.split(' ')[1], this.formato_hora)
                  : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
                const salida = usu.salida.fecha_hora_timbre != null
                  ? this.validar.FormatearHora(usu.salida.fecha_hora_timbre.split(' ')[1], this.formato_hora)
                  : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
                const inicioAlimentacion = usu.tipo == 'EAS'
                  ? (usu.inicioAlimentacion.fecha_hora_timbre != null
                    ? this.validar.FormatearHora(usu.inicioAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
                    : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
                  : '';
                const finAlimentacion = usu.tipo == 'EAS'
                  ? (usu.finAlimentacion.fecha_hora_timbre != null
                    ? this.validar.FormatearHora(usu.finAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
                    : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
                  : '';
                // SUMA DE MINUTOS DE TIEMPO LABORADO Y PLANIFICADO
                const diferenciaEnMinutos = this.CalcularDiferenciaFechas(usu);
                const minutosPlanificados = diferenciaEnMinutos[0];
                const tiempoPlanificado = this.MinutosAHorasMinutosSegundos(minutosPlanificados);
                const minutosLaborados = diferenciaEnMinutos[1];
                const tiempoLaborado = this.MinutosAHorasMinutosSegundos(minutosLaborados);
                totalTiempoPlanificadoEmpleado += minutosPlanificados;
                totalTiempoLaboradoEmpleado += minutosLaborados;
                return [
                  { style: 'itemsTableCentrado', text: c },
                  { style: 'itemsTableCentrado', text: fecha },
                  { style: 'itemsTableCentrado', text: entradaHorario },
                  { style: entrada == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: entrada },
                  { style: 'itemsTableCentrado', text: inicioAlimentacionHorario },
                  { style: inicioAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: inicioAlimentacion },
                  { style: 'itemsTableCentrado', text: finAlimentacionHorario },
                  { style: finAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: finAlimentacion },
                  { style: 'itemsTableCentrado', text: salidaHorario },
                  { style: salida == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: salida },
                  { style: 'itemsTableDerecha', text: tiempoPlanificado },
                  { style: 'itemsTableDerecha', text: minutosPlanificados.toFixed(2) },
                  { style: minutosLaborados < minutosPlanificados ? 'itemsTableCentradoMenor' : 'itemsTableDerecha', text: tiempoLaborado },
                  { style: minutosLaborados < minutosPlanificados ? 'itemsTableCentradoMenor' : 'itemsTableDerecha', text: minutosLaborados.toFixed(2) },
                ];
              }),
              [
                {
                  border: [true, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                { style: 'itemsTableCentradoTotal', text: 'TOTAL' },
                { style: 'itemsTableTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoPlanificadoEmpleado.toFixed(2))) },
                { style: 'itemsTableTotal', text: totalTiempoPlanificadoEmpleado.toFixed(2) },
                { style: 'itemsTableTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoLaboradoEmpleado.toFixed(2))) },
                { style: 'itemsTableTotal', text: totalTiempoLaboradoEmpleado.toFixed(2) },
              ],
            ],
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      })
    })
    // RESUMEN TOTALES DE REGISTROS
    if (this.bool.bool_emp === false) {
      n.push({
        style: 'tableMarginCabeceraTotal',
        table: {
          widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
          headerRows: 1,
          body: [
            [
              {
                border: [true, true, false, true],
                bold: true,
                text: resumen,
                style: 'itemsTableInfoTotal',
                colSpan: 2
              },
              {},
              { colSpan: 2, text: 'TIEMPO PLANIFICADO', style: 'itemsTableInfoTotal' },
              {},
              { colSpan: 2, text: 'TIEMPO LABORADO', style: 'itemsTableInfoTotal' },
              {},
            ],
            ...general.map((info: any) => {
              let valor = 0;
              if (this.bool.bool_suc === true) {
                valor = 2;
              }
              return [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: info.sucursal,
                  style: 'itemsTableCentrado',
                  colSpan: valor
                },
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: info.nombre,
                  style: 'itemsTableCentrado',
                },
                { text: info.formato_general_planificado, style: 'itemsTableDerecha' },
                { text: info.formato_decimal_planifiado, style: 'itemsTableCentrado' },
                { text: info.formato_general_laborado, style: 'itemsTableCentrado' },
                { text: info.formato_decimal_laborado, style: 'itemsTableDerecha' },
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
    }
    return n;
  }

  /** ****************************************************************************************** **
   ** **                               METODOS PARA EXPORTAR A EXCEL                          ** **
   ** ****************************************************************************************** **/

  ExportarExcel(): void {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel(this.data_pdf));
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Tiempo_laborado');
    xlsx.writeFile(wb, `Tiempo_laborado_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
  }

  EstructurarDatosExcel(array: Array<any>) {
    let nuevo: Array<any> = [];
    let n = 0;
    array.forEach((suc: any) => {
      suc.empleados.forEach((empl: any) => {
        empl.tLaborado.forEach((obj3: any) => {
          n++;
          //CAMBIO DE FORMATO EN HORAS (HORARIO Y TIMBRE)
          const entradaHorario = this.validar.FormatearHora(obj3.entrada.fecha_hora_horario.split(' ')[1], this.formato_hora);
          const salidaHorario = this.validar.FormatearHora(obj3.salida.fecha_hora_horario.split(' ')[1], this.formato_hora);
          const inicioAlimentacionHorario = obj3.tipo == 'EAS'
            ? this.validar.FormatearHora(obj3.inicioAlimentacion.fecha_hora_horario.split(' ')[1], this.formato_hora)
            : '';
          const finAlimentacionHorario = obj3.tipo == 'EAS'
            ? this.validar.FormatearHora(obj3.finAlimentacion.fecha_hora_horario.split(' ')[1], this.formato_hora)
            : '';
          const entrada = obj3.entrada.fecha_hora_timbre != null
            ? this.validar.FormatearHora(obj3.entrada.fecha_hora_timbre.split(' ')[1], this.formato_hora)
            : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT');
          const salida = obj3.salida.fecha_hora_timbre != null
            ? this.validar.FormatearHora(obj3.salida.fecha_hora_timbre.split(' ')[1], this.formato_hora)
            : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT');
          const inicioAlimentacion = obj3.tipo == 'EAS'
            ? (obj3.inicioAlimentacion.fecha_hora_timbre != null
              ? this.validar.FormatearHora(obj3.inicioAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
              : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT'))
            : '';
          const finAlimentacion = obj3.tipo == 'EAS'
            ? (obj3.finAlimentacion.fecha_hora_timbre != null
              ? this.validar.FormatearHora(obj3.finAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
              : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT'))
            : '';

          const diferenciaEnMinutos = this.CalcularDiferenciaFechas(obj3);
          const minutosPlanificados = diferenciaEnMinutos[0];
          const tiempoPlanificado = this.MinutosAHorasMinutosSegundos(minutosPlanificados);
          const minutosLaborados = diferenciaEnMinutos[1];
          const tiempoLaborado = this.MinutosAHorasMinutosSegundos(minutosLaborados);

          let ele = {
            'N°': n,
            'Cédula': empl.cedula,
            'Código': empl.codigo,
            'Nombre Empleado': empl.name_empleado,
            'Ciudad': empl.ciudad,
            'Sucursal': empl.sucursal,
            'Régimen': empl.regimen,
            'Departamento': empl.departamento,
            'Cargo': empl.cargo,
            'Fecha': new Date(obj3.entrada.fecha_hora_horario),
            'Horario Entrada': entradaHorario,
            'Timbre Entrada': entrada,
            'Horario Inicio Alimentación': inicioAlimentacionHorario,
            'Timbre Inicio Alimentación': inicioAlimentacion,
            'Horario Fin Alimentación': finAlimentacionHorario,
            'Timbre Fin Alimentación': finAlimentacion,
            'Horario Salida': salidaHorario,
            'Timbre Salida': salida,
            'Tiempo Planificado HH:MM:SS': tiempoPlanificado,
            'Tiempo Planificado Minutos': minutosPlanificados.toFixed(2),
            'Tiempo Laborado HH:MM:SS': tiempoLaborado,
            'Tiempo Laborado Minutos': minutosLaborados.toFixed(2),
          }
          nuevo.push(ele);
        })
      })
    })
    return nuevo;
  }


  /** ****************************************************************************************** **
   ** **                 METODOS PARA EXTRAER TIMBRES PARA LA PREVISUALIZACION                ** **
   ** ****************************************************************************************** **/

  ExtraerDatos() {
    this.timbres = [];
    let n = 0;
    this.data_pdf.forEach((suc: any) => {
      suc.empleados.forEach((empl: any) => {
        empl.tLaborado.forEach((usu: any) => {
          //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
          const fecha = this.validar.FormatearFecha(usu.entrada.fecha_horario, this.formato_fecha, this.validar.dia_abreviado);
          const entradaHorario = this.validar.FormatearHora(usu.entrada.fecha_hora_horario.split(' ')[1], this.formato_hora);
          const salidaHorario = this.validar.FormatearHora(usu.salida.fecha_hora_horario.split(' ')[1], this.formato_hora);
          const inicioAlimentacionHorario = usu.tipo == 'EAS'
            ? this.validar.FormatearHora(usu.inicioAlimentacion.fecha_hora_horario.split(' ')[1], this.formato_hora)
            : '';
          const finAlimentacionHorario = usu.tipo == 'EAS'
            ? this.validar.FormatearHora(usu.finAlimentacion.fecha_hora_horario.split(' ')[1], this.formato_hora)
            : '';
          const entrada = usu.entrada.fecha_hora_timbre != null
            ? this.validar.FormatearHora(usu.entrada.fecha_hora_timbre.split(' ')[1], this.formato_hora)
            : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
          const salida = usu.salida.fecha_hora_timbre != null
            ? this.validar.FormatearHora(usu.salida.fecha_hora_timbre.split(' ')[1], this.formato_hora)
            : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
          const inicioAlimentacion = usu.tipo == 'EAS'
            ? (usu.inicioAlimentacion.fecha_hora_timbre != null
              ? this.validar.FormatearHora(usu.inicioAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
              : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
            : '';
          const finAlimentacion = usu.tipo == 'EAS'
            ? (usu.finAlimentacion.fecha_hora_timbre != null
              ? this.validar.FormatearHora(usu.finAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
              : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
            : '';

          const diferenciaEnMinutos = this.CalcularDiferenciaFechas(usu);
          const minutosPlanificados = diferenciaEnMinutos[0];
          const tiempoPlanificado = this.MinutosAHorasMinutosSegundos(minutosPlanificados);
          const minutosLaborados = diferenciaEnMinutos[1];
          const tiempoLaborado = this.MinutosAHorasMinutosSegundos(minutosLaborados);
          n = n + 1;
          const ele = {
            n,
            cedula: empl.cedula,
            codigo: empl.codigo,
            empleado: empl.apellido + ' ' + empl.nombre,
            ciudad: empl.ciudad,
            sucursal: empl.sucursal,
            regimen: empl.regimen,
            departamento: empl.departamento,
            fecha, entradaHorario,
            entrada, salidaHorario, salida,
            inicioAlimentacionHorario,
            inicioAlimentacion,
            finAlimentacionHorario,
            finAlimentacion,
            tiempoPlanificado,
            minutosPlanificados: minutosPlanificados.toFixed(2),
            tiempoLaborado,
            minutosLaborados: minutosLaborados.toFixed(2),
          }
          this.timbres.push(ele);
        })
      })
    })
  }

  /** ****************************************************************************************** **
   ** **                                   CALCULOS Y CONVERSIONES                            ** **
   ** ****************************************************************************************** **/

  CalcularDiferenciaFechas(informacion: any) {
    if (informacion.origen === 'L' || informacion.origen === 'FD') {
      return [0, 0];
    }

    if (informacion.tipo === 'ES') {
      const { entrada, salida } = informacion;
      let minutosPlanificados = this.CalcularMinutosDiferencia(entrada.fecha_hora_horario, salida.fecha_hora_horario);

      if (entrada.fecha_hora_timbre !== null && salida.fecha_hora_timbre !== null) {
        const minutosLaborados = this.CalcularMinutosDiferencia(entrada.fecha_hora_timbre, salida.fecha_hora_timbre);
        return [minutosPlanificados, Number(minutosLaborados.toFixed(2))];
      }
      return [minutosPlanificados, 0];
    }
    else {
      const { entrada, inicioAlimentacion, finAlimentacion, salida } = informacion;
      const min_alimentacion: number = informacion.inicioAlimentacion.minutos_alimentacion;

      const minutosPlanificados = Number((this.CalcularMinutosDiferencia(entrada.fecha_hora_horario, salida.fecha_hora_horario) - min_alimentacion).toFixed(2));
      const minutosLaborados = entrada.fecha_hora_timbre !== null && salida.fecha_hora_timbre !== null ? this.CalcularMinutosDiferencia(entrada.fecha_hora_timbre, salida.fecha_hora_timbre) : 0;
      const minutosAlimentacion = inicioAlimentacion.fecha_hora_timbre !== null && finAlimentacion.fecha_hora_timbre !== null ? this.CalcularMinutosDiferencia(inicioAlimentacion.fecha_hora_timbre, finAlimentacion.fecha_hora_timbre) : min_alimentacion;
      return minutosLaborados == 0 ? [minutosPlanificados, minutosLaborados] : [minutosPlanificados, Number((minutosLaborados - minutosAlimentacion).toFixed(2))];
    }
  }

  CalcularMinutosDiferencia(inicio: any, fin: any): number {
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    return Math.abs(fechaFin.getTime() - fechaInicio.getTime()) / 1000 / 60;
  }

  SegundosAMinutosConDecimales(segundos: number) {
    return Number((segundos / 60).toFixed(2));
  }

  MinutosAHorasMinutosSegundos(minutos: number) {
    let seconds = minutos * 60;
    let hour: string | number = Math.floor(seconds / 3600);
    hour = (hour < 10) ? '0' + hour : hour;
    let minute: string | number = Math.floor((seconds / 60) % 60);
    minute = (minute < 10) ? '0' + minute : minute;
    let second: string | number = Number((seconds % 60).toFixed(0));
    second = (second < 10) ? '0' + second : second;
    return `${hour}:${minute}:${second}`;
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

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e)
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt)
  }

  // MOSTRAR DETALLES
  verDatos() {
    this.verDetalle = true;
    this.ExtraerDatos();
  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.verDetalle = false;
    this.paginatorDetalle.firstPage();
  }

  // METODODO PARA CAMBIAR EL COLOR DE LAS CELDAS EN LA TABLA DE PREVISUALIZACION
  ObtenerClaseTiempo(planificado: any, laborado: any) {
    const tPlanificado = Number(planificado);
    const tLaborado = Number(laborado);
    if (tLaborado < tPlanificado) {
      return 'verde';
    }
  }
  // METODODO PARA CAMBIAR EL COLOR DE LAS CELDAS EN LA TABLA DE PREVISUALIZACION
  ObtenerClaseTimbre(valor: any) {
    if (valor == 'FT') {
      return 'rojo';
    }
  }
}
