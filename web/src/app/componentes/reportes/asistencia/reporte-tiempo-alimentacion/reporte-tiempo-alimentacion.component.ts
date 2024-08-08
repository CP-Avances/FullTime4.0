// IMPORTAR LIBRERIAS
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IReporteFaltas, ITableEmpleados } from 'src/app/model/reportes.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';

import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { AlimentacionService } from 'src/app/servicios/reportes/alimentacion/alimentacion.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-reporte-tiempo-alimentacion',
  templateUrl: './reporte-tiempo-alimentacion.component.html',
  styleUrls: ['./reporte-tiempo-alimentacion.component.css']
})
export class ReporteTiempoAlimentacionComponent implements OnInit, OnDestroy {

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
  respuesta: any = [];
  data_pdf: any = [];
  regimen: any = [];
  timbres: any = [];
  cargos: any = [];

  //VARIABLES PARA ALMACENAR TIEMPOS DE SALIDAS ANTICIPADAS
  excesoDepartamentos: any = [];
  excesoSucursales: any = [];
  excesoRegimen: any = [];
  excesoCargos: any = [];

  //VARIABLES PARA MOSTRAR DETALLES
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
    private restAlimentacion: AlimentacionService,
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
    this.respuesta = [];
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
    this.restAlimentacion.BuscarTimbresAlimentacion(seleccionados, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
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
    let doc_name = `Tiempo_alimentacion_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
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
        { text: `TIEMPO DE ALIMENTACIÓN - ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF(this.data_pdf).map((obj: any) => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 1, 0, 1], },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0], fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        itemsTableCentradoFT: { fontSize: 8, alignment: 'center', fillColor: '#EE4444' },
        itemsTableCentradoExceso: { fontSize: 8, alignment: 'center', fillColor: '#55EE44' },
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
    let n: any = []
    let c = 0;
    let totalExcesoEmpleado: number = 0;
    let totalExcesoSucursal: number = 0;
    let totalExcesoCargo = 0;
    let totalExcesoRegimen = 0;
    let totalExcesoDepartamento = 0;
    this.excesoDepartamentos = [];
    this.excesoSucursales = [];
    this.excesoRegimen = [];
    this.excesoCargos = [];

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
              text: 'EXCESO DE ALIMENTACIÓN',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoExceso'
            },
          ]
        ]
      }
    });

    if (this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      data.forEach((obj1: any) => {
        if (this.bool.bool_cargo === true) {
          totalExcesoCargo = 0;
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*'],
              headerRows: 1,
              body: [
                [
                  {
                    border: [true, true, true, true],
                    bold: true,
                    text: 'CARGO: ' + obj1.name_cargo,
                    style: 'itemsTableInfo',
                  },
                ],
              ],
            },
          });
        } else {
          totalExcesoRegimen = 0;
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*'],
              headerRows: 1,
              body: [
                [
                  {
                    border: [true, true, true, true],
                    bold: true,
                    text: 'RÉGIMEN: ' + obj1.regimen.nombre,
                    style: 'itemsTableInfo',
                  },
                ],
              ],
            },
          });
        }

        obj1.empleados.forEach((obj2: any) => {
          n.push({
            style: 'tableMarginCabeceraEmpleado',
            table: {
              widths: ['*', 'auto', 'auto'],
              headerRows: 2,
              body: [
                [
                  {
                    border: [true, true, false, false],
                    text: 'EMPLEADO: ' + obj2.name_empleado,
                    style: 'itemsTableInfoEmpleado',
                  },
                  {
                    border: [false, true, false, false],
                    text: 'C.C.: ' + obj2.cedula,
                    style: 'itemsTableInfoEmpleado',
                  },
                  {
                    border: [false, true, true, false],
                    text: 'COD: ' + obj2.codigo,
                    style: 'itemsTableInfoEmpleado',
                  },
                ],
                [
                  {
                    border: [true, false, false, false],
                    text: 'DEPARTAMENTO: ' + obj2.departamento,
                    style: 'itemsTableInfoEmpleado'
                  },
                  {
                    border: [false, false, false, false],
                    text: this.bool.bool_reg ? 'CARGO: ' + obj2.cargo : '',
                    style: 'itemsTableInfoEmpleado'
                  },
                  {
                    border: [false, false, true, false],
                    text: '',
                    style: 'itemsTableInfoEmpleado'
                  }
                ]
              ],
            },
          });
          c = 0;
          totalExcesoEmpleado = 0;
          n.push({
            style: 'tableMargin',
            table: {
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
              headerRows: 1,
              body: [
                [
                  { text: 'N°', style: 'tableHeader' },
                  { text: 'FECHA', style: 'tableHeader' },
                  { text: 'INICIO ALIMENTACIÓN', style: 'tableHeader' },
                  { text: 'FIN ALIMENTACIÓN', style: 'tableHeader' },
                  { text: 'M. ALIMENTACIÓN', style: 'tableHeader' },
                  { text: 'M. TOMADOS', style: 'tableHeader' },
                  { text: 'M. EXCESO', style: 'tableHeader' },
                ],
                ...obj2.alimentacion.map((obj3: any) => {

                  const fecha = this.validar.FormatearFecha(obj3.inicioAlimentacion.fecha_horario, this.formato_fecha, this.validar.dia_abreviado);

                  const inicioAlimentacion = obj3.inicioAlimentacion.fecha_hora_timbre != null
                    ? this.validar.FormatearHora(obj3.inicioAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
                    : 'FT';
                  const finAlimentacion = obj3.finAlimentacion.fecha_hora_timbre != null
                    ? this.validar.FormatearHora(obj3.finAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
                    : 'FT';

                  const minAlimentacion = obj3.inicioAlimentacion.minutos_alimentacion;
                  const minutosTomados = this.CalcularDiferenciaFechas(obj3.inicioAlimentacion.fecha_hora_timbre, obj3.finAlimentacion.fecha_hora_timbre);
                  const exceso = this.CalcularExcesoTiempo(minAlimentacion, minutosTomados);
                  totalExcesoEmpleado += exceso;
                  totalExcesoRegimen += exceso;
                  totalExcesoCargo += exceso;
                  c = c + 1
                  return [
                    { style: 'itemsTableCentrado', text: c },
                    { style: 'itemsTableCentrado', text: fecha },
                    { style: inicioAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: inicioAlimentacion },
                    { style: finAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: finAlimentacion },
                    { style: 'itemsTableCentrado', text: minAlimentacion },
                    { style: 'itemsTableCentrado', text: minutosTomados !== null ? minutosTomados : minAlimentacion },
                    { style: exceso > 0 ? 'itemsTableCentradoExceso' : 'itemsTableCentrado', text: exceso },
                  ];
                }),
                [
                  {}, {}, {}, {}, {},
                  { style: 'itemsTableCentradoTotal', text: 'TOTAL' },
                  { style: 'itemsTableCentradoTotal', text: totalExcesoEmpleado },
                ],
              ],
            },
            layout: {
              fillColor: function (rowIndex: any) {
                return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
              }
            }
          });
        });
        if (this.bool.bool_cargo) {
          let cargo = {
            cargo: obj1.name_cargo,
            exceso: totalExcesoCargo,
          }
          this.excesoCargos.push(cargo);
        };

        if (this.bool.bool_reg) {
          let regimen = {
            regimen: obj1.nombre,
            exceso: totalExcesoRegimen,
          }
          this.excesoRegimen.push(regimen);
        };
      });

      if (this.bool.bool_cargo) {
        n.push({
          style: 'tableMarginCabeceraTotal',
          table: {
            widths: ['*', 'auto'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: 'TOTAL CARGOS',
                  style: 'itemsTableInfoTotal'
                },
                { text: 'M. EXCESO', style: 'itemsTableInfoTotal' },
              ],
              ...this.excesoCargos.map((cargo: any) => {
                return [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: cargo.cargo,
                    style: 'itemsTableCentrado'
                  },
                  { text: cargo.exceso, style: 'itemsTableCentrado' },
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
      };

      if (this.bool.bool_reg) {
        n.push({
          style: 'tableMarginCabeceraTotal',
          table: {
            widths: ['*', 'auto'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: 'TOTAL REGIMENES',
                  style: 'itemsTableInfoTotal'
                },
                { text: 'M. EXCESO', style: 'itemsTableInfoTotal' },
              ],
              ...this.excesoRegimen.map((regimen: any) => {
                return [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: regimen.regimen,
                    style: 'itemsTableCentrado'
                  },
                  { text: regimen.exceso, style: 'itemsTableCentrado' },
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
      };
    } else {
      data.forEach((obj: IReporteFaltas) => {
        if (this.bool.bool_suc === true) {
          totalExcesoSucursal = 0;
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*', '*'],
              headerRows: 1,
              body: [
                [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: 'CIUDAD: ' + obj.ciudad,
                    style: 'itemsTableInfo'
                  },
                  {
                    border: [false, true, true, true],
                    text: 'SUCURSAL: ' + obj.name_suc,
                    style: 'itemsTableInfo'
                  }
                ]
              ]
            }
          })
        }

        obj.departamentos.forEach((obj1: any) => {
          totalExcesoDepartamento = 0;
          // LA CABECERA CUANDO SE GENERA EL PDF POR DEPARTAMENTOS
          if (this.bool.bool_dep === true) {
            n.push({
              style: 'tableMarginCabecera',
              table: {
                widths: ['*'],
                headerRows: 1,
                body: [
                  [
                    {
                      border: [true, true, true, true],
                      text: 'DEPARTAMENTO: ' + obj1.name_dep,
                      style: 'itemsTableInfo'
                    },
                  ]
                ]
              }
            })
          }

          obj1.empleado.forEach((obj2: any) => {
            n.push({
              style: 'tableMarginCabeceraEmpleado',
              table: {
                widths: ['*', 'auto', 'auto',],
                headerRows: 2,
                body: [
                  [
                    {
                      border: [true, true, false, false],
                      text: 'EMPLEADO: ' + obj2.name_empleado,
                      style: 'itemsTableInfoEmpleado'
                    },
                    {
                      border: [false, true, false, false],
                      text: 'C.C.: ' + obj2.cedula,
                      style: 'itemsTableInfoEmpleado'
                    },
                    {
                      border: [false, true, true, false],
                      text: 'COD: ' + obj2.codigo,
                      style: 'itemsTableInfoEmpleado'
                    }
                  ],
                  [
                    {
                      border: [true, false, false, false],
                      text: this.bool.bool_suc || this.bool.bool_emp ? 'DEPARTAMENTO: ' + obj2.departamento : '',
                      style: 'itemsTableInfoEmpleado'
                    },
                    {
                      border: [false, false, false, false],
                      text: 'CARGO: ' + obj2.cargo,
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
            c = 0;
            totalExcesoEmpleado = 0;
            n.push({
              style: 'tableMargin',
              table: {
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
                headerRows: 1,
                body: [
                  [
                    { text: 'N°', style: 'tableHeader' },
                    { text: 'FECHA', style: 'tableHeader' },
                    { text: 'INICIO ALIMENTACIÓN', style: 'tableHeader' },
                    { text: 'FIN ALIMENTACIÓN', style: 'tableHeader' },
                    { text: 'M. ALIMENTACIÓN', style: 'tableHeader' },
                    { text: 'M. TOMADOS', style: 'tableHeader' },
                    { text: 'M. EXCESO', style: 'tableHeader' },
                  ],
                  ...obj2.alimentacion.map((obj3: any) => {
                    const fecha = this.validar.FormatearFecha(
                      obj3.inicioAlimentacion.fecha_horario,
                      this.formato_fecha,
                      this.validar.dia_abreviado);

                    const inicioAlimentacion = obj3.inicioAlimentacion.fecha_hora_timbre != null
                      ? this.validar.FormatearHora(obj3.inicioAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
                      : 'FT';
                    const finAlimentacion = obj3.finAlimentacion.fecha_hora_timbre != null
                      ? this.validar.FormatearHora(obj3.finAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
                      : 'FT';

                    const minAlimentacion = obj3.inicioAlimentacion.minutos_alimentacion;
                    const minutosTomados = this.CalcularDiferenciaFechas(obj3.inicioAlimentacion.fecha_hora_timbre, obj3.finAlimentacion.fecha_hora_timbre);
                    const exceso = this.CalcularExcesoTiempo(minAlimentacion, minutosTomados);
                    totalExcesoEmpleado += exceso;
                    totalExcesoSucursal += exceso;
                    totalExcesoDepartamento += exceso;
                    c = c + 1
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTableCentrado', text: fecha },
                      { style: inicioAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: inicioAlimentacion },
                      { style: finAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: finAlimentacion },
                      { style: 'itemsTableCentrado', text: minAlimentacion },
                      { style: 'itemsTableCentrado', text: minutosTomados !== null ? minutosTomados : minAlimentacion },
                      { style: exceso > 0 ? 'itemsTableCentradoExceso' : 'itemsTableCentrado', text: exceso },
                    ];
                  }),
                  [
                    {}, {}, {}, {}, {},
                    { style: 'itemsTableCentradoTotal', text: 'TOTAL' },
                    { style: 'itemsTableCentradoTotal', text: totalExcesoEmpleado },
                  ],
                ],
              },
              layout: {
                fillColor: function (rowIndex: any) {
                  return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                }
              }
            });
          });
          if (this.bool.bool_dep) {
            let departamento = {
              departamento: obj1.name_dep,
              exceso: totalExcesoDepartamento,
            }
            this.excesoDepartamentos.push(departamento);
          };
        });

        if (this.bool.bool_suc) {
          let sucursal = {
            sucursal: obj.name_suc,
            exceso: totalExcesoSucursal,
          }
          this.excesoSucursales.push(sucursal);
        };
      });
    }

    if (this.bool.bool_dep) {
      n.push({
        style: 'tableMarginCabeceraTotal',
        table: {
          widths: ['*', 'auto'],
          headerRows: 1,
          body: [
            [
              {
                border: [true, true, false, true],
                bold: true,
                text: 'TOTAL DEPARTAMENTOS',
                style: 'itemsTableInfoTotal'
              },
              { text: 'M. EXCESO', style: 'itemsTableInfoTotal' },
            ],
            ...this.excesoDepartamentos.map((departamento: any) => {
              return [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: departamento.departamento,
                  style: 'itemsTableCentrado'
                },
                { text: departamento.exceso, style: 'itemsTableCentrado' },
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
    };

    if (this.bool.bool_suc) {
      n.push({
        style: 'tableMarginCabeceraTotal',
        table: {
          widths: ['*', 'auto'],
          headerRows: 1,
          body: [
            [
              {
                border: [true, true, false, true],
                bold: true,
                text: 'TOTAL SUCURSALES',
                style: 'itemsTableInfoTotal'
              },
              { text: 'M. EXCESO', style: 'itemsTableInfoTotal' },
            ],
            ...this.excesoSucursales.map((sucursal: any) => {
              return [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: sucursal.sucursal,
                  style: 'itemsTableCentrado'
                },
                { text: sucursal.exceso, style: 'itemsTableCentrado' },
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
    };

    return n;
  }


  /** ****************************************************************************************** **
   ** **                               METODOS PARA EXPORTAR A EXCEL                          ** **
   ** ****************************************************************************************** **/

  ExportarExcel(): void {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel(this.data_pdf));
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Alimentacion');
    xlsx.writeFile(wb, `Tiempo_alimentacion_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
  }

  EstructurarDatosExcel(array: Array<any>) {
    let nuevo: Array<any> = [];
    let n = 0;
    array.forEach((info: any) => {
      info.empleados.forEach((usu: any) => {
        usu.alimentacion.forEach((a: any) => {
          n++;
          const inicioAlimentacion = a.inicioAlimentacion.fecha_hora_timbre != null
            ? this.validar.FormatearHora(a.inicioAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
            : 'FT';
          const finAlimentacion = a.finAlimentacion.fecha_hora_timbre != null
            ? this.validar.FormatearHora(a.finAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
            : 'FT';
          const minAlimentacion = a.inicioAlimentacion.minutos_alimentacion;
          const minutosTomados = this.CalcularDiferenciaFechas(a.inicioAlimentacion.fecha_hora_timbre, a.finAlimentacion.fecha_hora_timbre);
          const exceso = this.CalcularExcesoTiempo(minAlimentacion, minutosTomados);
          let ele = {
            'N°': n,
            'Cédula': usu.cedula,
            'Código': usu.codigo,
            'Nombre Empleado': usu.apellido + ' ' + usu.nombre,
            'Ciudad': usu.ciudad,
            'Sucursal': usu.sucursal,
            'Régimen': usu.regimen,
            'Departamento': usu.departamento,
            'Cargo': usu.cargo,
            'Fecha': new Date(a.inicioAlimentacion.fecha_hora_horario),
            'Inicio Alimentación': inicioAlimentacion,
            'Fin Alimentación': finAlimentacion,
            'Minutos Alimentación': minAlimentacion,
            'Minutos Tomados': minutosTomados !== null ? minutosTomados : minAlimentacion,
            'Minutos Exceso': exceso
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
    this.data_pdf.forEach((info: any) => {
      info.empleados.forEach((usu: any) => {
        usu.alimentacion.forEach((a: any) => {
          const fecha = this.validar.FormatearFecha(a.inicioAlimentacion.fecha_horario, this.formato_fecha, this.validar.dia_abreviado);
          const inicioAlimentacion = a.inicioAlimentacion.fecha_hora_timbre != null
            ? this.validar.FormatearHora(a.inicioAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
            : 'FT';
          const finAlimentacion = a.finAlimentacion.fecha_hora_timbre != null
            ? this.validar.FormatearHora(a.finAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
            : 'FT';
          const minAlimentacion = a.inicioAlimentacion.minutos_alimentacion;
          const minutosTomados = this.CalcularDiferenciaFechas(a.inicioAlimentacion.fecha_hora_timbre, a.finAlimentacion.fecha_hora_timbre);
          const exceso = this.CalcularExcesoTiempo(minAlimentacion, minutosTomados);
          n = n + 1;
          const ele = {
            n: n,
            cedula: usu.cedula,
            codigo: usu.codigo,
            empleado: usu.name_empleado,
            ciudad: usu.ciudad,
            sucursal: usu.sucursal,
            regimen: usu.regimen,
            departamento: usu.departamento,
            fecha,
            inicio: inicioAlimentacion,
            fin: finAlimentacion,
            alimentacion: minAlimentacion,
            tomados: minutosTomados !== null ? minutosTomados : minAlimentacion,
            exceso: exceso
          }
          this.timbres.push(ele);
        })
      })
    })
  }


  /** ****************************************************************************************** **
   ** **                                   CALCULOS Y CONVERSIONES                            ** **
   ** ****************************************************************************************** **/

  CalcularDiferenciaFechas(inicioAlimentacion: string, finAlimentacion: string) {
    if (inicioAlimentacion != null && finAlimentacion != null) {
      const fechaInicio = new Date(inicioAlimentacion);
      const fechaFin = new Date(finAlimentacion);
      const diferenciaEnMinutos = Math.abs(fechaFin.getTime() - fechaInicio.getTime()) / 1000 / 60;
      console.log('diferencia de fechas', fechaInicio, fechaFin, diferenciaEnMinutos);
      return Number(diferenciaEnMinutos.toFixed(2));
    } else {
      return null;
    }
  }

  CalcularExcesoTiempo(minutosAsignados: string, minutosTomados: any): number {
    if (!minutosAsignados || !minutosTomados) return 0;
    const asignados = Number(minutosAsignados);
    const tomados = Number(minutosTomados);
    return Number((Math.max(tomados - asignados, 0)).toFixed(2));
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

  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e)
  }

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

  // METDODO PARA CAMBIAR EL COLOR DE LAS CELDAS EN LA TABLA DE PREVISUALIZACION
  ObtenerClaseCeldas(valor: any) {
    if (valor > 0) {
      return 'verde';
    } else if (valor == 'FT') {
      return 'rojo';
    }
  }

}
