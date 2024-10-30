// IMPORTAR LIBRERIAS
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';

import * as xlsx from 'xlsx';
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
  selector: 'app-reporte-resumen-asistencia',
  templateUrl: './reporte-resumen-asistencia.component.html',
  styleUrls: ['./reporte-resumen-asistencia.component.css']
})

export class ReporteResumenAsistenciaComponent implements OnInit, OnDestroy {
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
  cargos: any = [];;

  // VARIABLES PARA MOSTRAR DETALLES
  verDetalle: boolean = false;

  // VARIABLES UTILIZADAS PARA IDENTIFICAR EL TIPO DE USUARIO
  tipoUsuario: string = 'activo';
  opcionBusqueda: number = 1;
  limpiar: number = 0;

  // VARIABLES PARA ADMINISTRAR TOLERANCIA
  tolerancia: string = '1';

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
    this.BuscarTolerancia();
    this.BuscarParametro();
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

  formato_fecha: string = 'dd/MM/yyyy';
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

  // METODO PARA BUSCAR PARAMETRO DE TOLERANCIA
  BuscarTolerancia() {
    // id_tipo_parametro Tolerancia - atrasos = 3
    this.parametro.ListarDetalleParametros(3).subscribe(
      res => {
        this.tolerancia = res[0].descripcion;
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
    let doc_name = `Resumen_asistencia_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
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
        { text: `RESUMEN DE ASISTENCIA - ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF(this.data_pdf).map((obj: any) => {
          return obj
        })
      ],
      styles: {
        derecha: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color, alignment: 'left' },
        tableHeader: { fontSize: 7, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeaderSecundario: { fontSize: 7, bold: true, alignment: 'center', fillColor: this.s_color },
        centrado: { fontSize: 7, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 7 },
        itemsTableInfo: { fontSize: 9, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0], fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 7, alignment: 'center' },
        itemsTableCentradoFT: { fontSize: 7, alignment: 'center', fillColor: '#EE4444' },
        itemsTableCentradoAtraso: { fontSize: 7, alignment: 'center', fillColor: '#EEE344' },
        itemsTableCentradoSalidas: { fontSize: 7, alignment: 'center', fillColor: '#4499EE' },
        itemsTableCentradoAlimentacion: { fontSize: 7, alignment: 'center', fillColor: '#55EE44' },
        itemsTableCentradoVacaciones: { fontSize: 7, alignment: 'center', fillColor: '#E68A2E' },
        itemsTableCentradoColores: { fontSize: 9, alignment: 'center' },
        itemsTableInfoTotal: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTableCentradoTotal: { fontSize: 8, bold: true, alignment: 'center', fillColor: '#E3E3E3' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginColores: { margin: [0, 15, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        tableMarginCabeceraTotal: { margin: [0, 20, 0, 0] },
      }
    };
  }

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(data: any[]): Array<any> {
    let totalTiempoLaborado: number = 0;
    let totalTiempoAtrasos: number = 0;
    let totalTiempoSalidas: number = 0;
    let totalAlimentacionAsignada: number = 0;
    let totalAlimentacionTomado: number = 0;
    let totalTiempoLaboradoEmpleado: number = 0;
    let totalTiempoAtrasosEmpleado: number = 0;
    let totalTiempoSalidasEmpleado: number = 0;
    let totalTiempoAlimentacionAEmpleado: number = 0;
    let totalTiempoAlimentacionTEmpleado: number = 0;
    let resumen = '';
    let general: any = [];
    let n: any = [];
    let c = 0;
    n.push({
      style: 'tableMarginColores',
      table: {
        widths: ['*', 'auto', 50, 'auto', 50, 'auto', 50, 'auto', 50, 'auto', 50],
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
              text: 'ATRASO',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoAtraso'
            },
            {
              text: 'SALIDA ANTICIPADA',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoSalidas'
            },
            {
              text: 'EXCESO DE ALIMENTACIÓN',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoAlimentacion'
            },
            {
              text: 'VACACIONES',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoVacaciones'
            },
          ]
        ]
      }
    });
    // TRATAMIENTO DE LA INFORMACION
    data.forEach((selec: any) => {
      // CONTAR REGISTROS
      let arr_reg = selec.empleados.map((o: any) => { return o.tLaborado.length });
      let reg = this.validar.SumarRegistros(arr_reg);
      // CONTAR MINUTOS DE ATRASOS
      totalTiempoLaborado = 0;
      totalTiempoAtrasos = 0;
      totalTiempoSalidas = 0;
      totalAlimentacionAsignada = 0;
      totalAlimentacionTomado = 0;
      selec.empleados.forEach((o: any) => {
        o.tLaborado.map((t: any) => {
          const alimentacion_asignada = t.tipo == 'EAS' ? t.inicioAlimentacion.minutos_alimentacion : 0;
          const diferenciaEnMinutos = this.CalcularDiferenciaFechas(t);
          const minutosAlimentacion = diferenciaEnMinutos[0];
          const minutosLaborados = diferenciaEnMinutos[1];
          const minutosAtraso = diferenciaEnMinutos[2];
          const minutosSalidaAnticipada = diferenciaEnMinutos[3];
          totalTiempoLaborado += minutosLaborados;
          totalTiempoAtrasos += minutosAtraso;
          totalTiempoSalidas += minutosSalidaAnticipada;
          totalAlimentacionAsignada += alimentacion_asignada;
          totalAlimentacionTomado += minutosAlimentacion;

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
        tiempoLaborado: this.MinutosAHorasMinutosSegundos(Number(totalTiempoLaborado.toFixed(2))),
        tiempoAtrasos: this.MinutosAHorasMinutosSegundos(Number(totalTiempoAtrasos.toFixed(2))),
        tiempoSalida: this.MinutosAHorasMinutosSegundos(Number(totalTiempoSalidas.toFixed(2))),
        tiempoAlimentacionAsignado: this.MinutosAHorasMinutosSegundos(Number(totalAlimentacionAsignada.toFixed(2))),
        tiempoAlimentacionTomado: this.MinutosAHorasMinutosSegundos(Number(totalAlimentacionTomado.toFixed(2))),
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
        totalTiempoAtrasosEmpleado = 0;
        totalTiempoSalidasEmpleado = 0;
        totalTiempoAlimentacionAEmpleado = 0;
        totalTiempoAlimentacionTEmpleado = 0;
        // PRESENTAR DATOS
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
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
                { rowSpan: 2, text: 'ATRASO', style: 'centrado' },
                { rowSpan: 2, text: 'SALIDA ANTICIPADA', style: 'centrado' },
                { colSpan: 2, rowSpan: 1, text: 'T. ALIMENTACIÓN', style: 'tableHeader' },
                {},
                { rowSpan: 2, text: 'TIEMPO LABORADO', style: 'centrado' },
                { rowSpan: 2, text: 'OBSERVACIONES', style: 'centrado' },
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
                {}, {},
                { rowSpan: 1, text: 'ASIGNADO', style: 'tableHeader' },
                { rowSpan: 1, text: 'TOMADO', style: 'tableHeader' },
                {}, {}
              ],
              ...empl.tLaborado.map((lab: any) => {
                c = c + 1;
                //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
                const fecha = this.validar.FormatearFecha(lab.entrada.fecha_horario, this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
                const entradaHorario = this.validar.FormatearHora(lab.entrada.fecha_hora_horario.split(' ')[1], this.formato_hora);
                const salidaHorario = this.validar.FormatearHora(lab.salida.fecha_hora_horario.split(' ')[1], this.formato_hora);
                const inicioAlimentacionHorario = lab.tipo == 'EAS'
                  ? this.validar.FormatearHora(lab.inicioAlimentacion.fecha_hora_horario.split(' ')[1], this.formato_hora)
                  : '';
                const finAlimentacionHorario = lab.tipo == 'EAS'
                  ? this.validar.FormatearHora(lab.finAlimentacion.fecha_hora_horario.split(' ')[1], this.formato_hora)
                  : '';
                const entrada = lab.entrada.fecha_hora_timbre != null
                  ? this.validar.FormatearHora(lab.entrada.fecha_hora_timbre.split(' ')[1], this.formato_hora)
                  : (lab.origen === 'L' || lab.origen === 'FD' ? lab.origen : 'FT');
                const salida = lab.salida.fecha_hora_timbre != null
                  ? this.validar.FormatearHora(lab.salida.fecha_hora_timbre.split(' ')[1], this.formato_hora)
                  : (lab.origen === 'L' || lab.origen === 'FD' ? lab.origen : 'FT');
                const inicioAlimentacion = lab.tipo == 'EAS'
                  ? (lab.inicioAlimentacion.fecha_hora_timbre != null
                    ? this.validar.FormatearHora(lab.inicioAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
                    : (lab.origen === 'L' || lab.origen === 'FD' ? lab.origen : 'FT'))
                  : '';
                const finAlimentacion = lab.tipo == 'EAS'
                  ? (lab.finAlimentacion.fecha_hora_timbre != null
                    ? this.validar.FormatearHora(lab.finAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
                    : (lab.origen === 'L' || lab.origen === 'FD' ? lab.origen : 'FT'))
                  : '';
                const alimentacion_asignada = lab.tipo == 'EAS' ? lab.inicioAlimentacion.minutos_alimentacion : 0;
                const diferenciaEnMinutos = this.CalcularDiferenciaFechas(lab);
                const minutosAlimentacion = diferenciaEnMinutos[0];
                const tiempoAlimentacion = this.MinutosAHorasMinutosSegundos(minutosAlimentacion);
                const minutosLaborados = diferenciaEnMinutos[1];
                const tiempoLaborado = this.MinutosAHorasMinutosSegundos(minutosLaborados);
                const minutosAtraso = diferenciaEnMinutos[2];
                const tiempoAtraso = this.MinutosAHorasMinutosSegundos(minutosAtraso);
                const minutosSalidaAnticipada = diferenciaEnMinutos[3];
                const tiempoSalidaAnticipada = this.MinutosAHorasMinutosSegundos(minutosSalidaAnticipada);
                totalTiempoLaboradoEmpleado += minutosLaborados;
                totalTiempoAtrasosEmpleado += minutosAtraso;
                totalTiempoSalidasEmpleado += minutosSalidaAnticipada;
                totalTiempoAlimentacionAEmpleado += alimentacion_asignada;
                totalTiempoAlimentacionTEmpleado += minutosAlimentacion;
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
                  { style: minutosAtraso > 0 ? 'itemsTableCentradoAtraso' : 'itemsTableCentrado', text: tiempoAtraso },
                  { style: minutosSalidaAnticipada > 0 ? 'itemsTableCentradoSalidas' : 'itemsTableCentrado', text: tiempoSalidaAnticipada },
                  { style: 'itemsTableCentrado', text: this.MinutosAHorasMinutosSegundos(alimentacion_asignada) },
                  { style: minutosAlimentacion > alimentacion_asignada ? 'itemsTableCentradoAlimentacion' : 'itemsTableCentrado', text: tiempoAlimentacion },
                  { style: 'itemsTableCentrado', text: tiempoLaborado },
                  {},
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
                { style: 'itemsTableCentradoTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoAtrasosEmpleado.toFixed(2))) },
                { style: 'itemsTableCentradoTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoSalidasEmpleado.toFixed(2))) },
                { style: 'itemsTableCentradoTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoAlimentacionAEmpleado.toFixed(2))) },
                { style: 'itemsTableCentradoTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoAlimentacionTEmpleado.toFixed(2))) },
                { style: 'itemsTableCentradoTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoLaboradoEmpleado.toFixed(2))) },
                {}
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
          widths: ['*', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          headerRows: 2,
          body: [
            [
              {
                border: [true, true, false, true],
                bold: true,
                text: resumen,
                style: 'itemsTableInfoTotal',
                colSpan: 2,
                rowSpan: 2,
              },
              {},
              { colSpan: 1, rowSpan: 2, text: 'ATRASOS', style: 'itemsTableInfoTotal' },
              { colSpan: 1, rowSpan: 2, text: 'SALIDAS ANTICIPADAS', style: 'itemsTableInfoTotal' },
              { colSpan: 2, rowSpan: 1, text: 'T. ALIMENTACIÓN', style: 'itemsTableInfoTotal' },
              {},
              { colSpan: 1, rowSpan: 2, text: 'TIEMPO LABORADO', style: 'itemsTableInfoTotal' },
            ],
            [
              {}, {}, {}, {},
              { colSpan: 1, rowSpan: 1, text: 'ASIGNADO', style: 'itemsTableInfoTotal' },
              { colSpan: 1, rowSpan: 1, text: 'TOMADO', style: 'itemsTableInfoTotal' },
              {}
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
                { text: info.tiempoAtrasos, style: 'itemsTableCentrado' },
                { text: info.tiempoSalida, style: 'itemsTableCentrado' },
                { text: info.tiempoAlimentacionAsignado, style: 'itemsTableCentrado' },
                { text: info.tiempoAlimentacionTomado, style: 'itemsTableCentrado' },
                { text: info.tiempoLaborado, style: 'itemsTableCentrado' },
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
    const wsr_regimen_cargo: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel(this.data_pdf));
    const wb_regimen_cargo: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb_regimen_cargo, wsr_regimen_cargo, 'Resumen_asistencia');
    xlsx.writeFile(wb_regimen_cargo, `Resumen_asistencia_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
  }

  EstructurarDatosExcel(array: Array<any>) {
    let nuevo: Array<any> = [];
    let n = 0;
    array.forEach((data: any) => {
      data.empleados.forEach((usu: any) => {
        usu.tLaborado.forEach((t: any) => {
          n++;
          //CAMBIO DE FORMATO EN HORAS (HORARIO Y TIMBRE)
          const entradaHorario = this.validar.FormatearHora(t.entrada.fecha_hora_horario.split(' ')[1], this.formato_hora);
          const salidaHorario = this.validar.FormatearHora(t.salida.fecha_hora_horario.split(' ')[1], this.formato_hora);
          const inicioAlimentacionHorario = t.tipo == 'EAS'
            ? this.validar.FormatearHora(t.inicioAlimentacion.fecha_hora_horario.split(' ')[1], this.formato_hora)
            : '';
          const finAlimentacionHorario = t.tipo == 'EAS'
            ? this.validar.FormatearHora(t.finAlimentacion.fecha_hora_horario.split(' ')[1], this.formato_hora)
            : '';
          const entrada = t.entrada.fecha_hora_timbre != null
            ? this.validar.FormatearHora(t.entrada.fecha_hora_timbre.split(' ')[1], this.formato_hora)
            : (t.origen === 'L' || t.origen === 'FD' ? t.origen : 'FT');
          const salida = t.salida.fecha_hora_timbre != null
            ? this.validar.FormatearHora(t.salida.fecha_hora_timbre.split(' ')[1], this.formato_hora)
            : (t.origen === 'L' || t.origen === 'FD' ? t.origen : 'FT');
          const inicioAlimentacion = t.tipo == 'EAS'
            ? (t.inicioAlimentacion.fecha_hora_timbre != null
              ? this.validar.FormatearHora(t.inicioAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
              : (t.origen === 'L' || t.origen === 'FD' ? t.origen : 'FT'))
            : '';
          const finAlimentacion = t.tipo == 'EAS'
            ? (t.finAlimentacion.fecha_hora_timbre != null
              ? this.validar.FormatearHora(t.finAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
              : (t.origen === 'L' || t.origen === 'FD' ? t.origen : 'FT'))
            : '';

          let alimentacion_asignada = t.tipo == 'EAS' ? t.inicioAlimentacion.minutos_alimentacion : 0;
          alimentacion_asignada = this.MinutosAHorasMinutosSegundos(Number(alimentacion_asignada));

          const diferenciaEnMinutos = this.CalcularDiferenciaFechas(t);
          const minutosAlimentacion = diferenciaEnMinutos[0];
          const tiempoAlimentacion = this.MinutosAHorasMinutosSegundos(minutosAlimentacion);
          const minutosLaborados = diferenciaEnMinutos[1];
          const tiempoLaborado = this.MinutosAHorasMinutosSegundos(minutosLaborados);
          const minutosAtraso = diferenciaEnMinutos[2];
          const tiempoAtraso = this.MinutosAHorasMinutosSegundos(minutosAtraso);
          const minutosSalidaAnticipada = diferenciaEnMinutos[3];
          const tiempoSalidaAnticipada = this.MinutosAHorasMinutosSegundos(minutosSalidaAnticipada);

          let ele = {
            'N°': n,
            'Código': usu.codigo,
            'Cédula': usu.cedula,
            'Nombre Empleado': usu.apellido + ' ' + usu.nombre,
            'Ciudad': usu.ciudad,
            'Sucursal': usu.sucursal,
            'Régimen': usu.regimne,
            'Departamento': usu.departamento,
            'Cargo': usu.cargo,
            'Fecha': new Date(t.entrada.fecha_hora_horario),
            'Horario Entrada': entradaHorario,
            'Timbre Entrada': entrada,
            'Horario Inicio Alimentación': inicioAlimentacionHorario,
            'Timbre Inicio Alimentación': inicioAlimentacion,
            'Horario Fin Alimentación': finAlimentacionHorario,
            'Timbre Fin Alimentación': finAlimentacion,
            'Horario Salida': salidaHorario,
            'Timbre Salida': salida,
            'Atraso': tiempoAtraso,
            'Salida Anticipada': tiempoSalidaAnticipada,
            'Tiempo Alimentación Asignado': alimentacion_asignada,
            'Tiempo Alimentación HH:MM:SS': tiempoAlimentacion,
            'Tiempo Laborado HH:MM:SS': tiempoLaborado,
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
    this.data_pdf.forEach((data: any) => {
      data.empleados.forEach((usu: any) => {
        usu.tLaborado.forEach((t: any) => {
          //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
          const fecha = this.validar.FormatearFecha(t.entrada.fecha_horario, this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const entradaHorario = this.validar.FormatearHora(t.entrada.fecha_hora_horario.split(' ')[1], this.formato_hora);
          const salidaHorario = this.validar.FormatearHora(t.salida.fecha_hora_horario.split(' ')[1], this.formato_hora);
          const inicioAlimentacionHorario = t.tipo == 'EAS'
            ? this.validar.FormatearHora(t.inicioAlimentacion.fecha_hora_horario.split(' ')[1], this.formato_hora)
            : '';
          const finAlimentacionHorario = t.tipo == 'EAS'
            ? this.validar.FormatearHora(t.finAlimentacion.fecha_hora_horario.split(' ')[1], this.formato_hora)
            : '';
          const entrada = t.entrada.fecha_hora_timbre != null
            ? this.validar.FormatearHora(t.entrada.fecha_hora_timbre.split(' ')[1], this.formato_hora)
            : (t.origen === 'L' || t.origen === 'FD' ? t.origen : 'FT');
          const salida = t.salida.fecha_hora_timbre != null
            ? this.validar.FormatearHora(t.salida.fecha_hora_timbre.split(' ')[1], this.formato_hora)
            : (t.origen === 'L' || t.origen === 'FD' ? t.origen : 'FT');
          const inicioAlimentacion = t.tipo == 'EAS'
            ? (t.inicioAlimentacion.fecha_hora_timbre != null
              ? this.validar.FormatearHora(t.inicioAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
              : (t.origen === 'L' || t.origen === 'FD' ? t.origen : 'FT'))
            : '';
          const finAlimentacion = t.tipo == 'EAS'
            ? (t.finAlimentacion.fecha_hora_timbre != null
              ? this.validar.FormatearHora(t.finAlimentacion.fecha_hora_timbre.split(' ')[1], this.formato_hora)
              : (t.origen === 'L' || t.origen === 'FD' ? t.origen : 'FT'))
            : '';

          let alimentacion_asignada = t.tipo == 'EAS' ? t.inicioAlimentacion.minutos_alimentacion : 0;
          alimentacion_asignada = Number(alimentacion_asignada);

          const diferenciaEnMinutos = this.CalcularDiferenciaFechas(t);
          const minutosAlimentacion = diferenciaEnMinutos[0];
          const tiempoAlimentacion = this.MinutosAHorasMinutosSegundos(minutosAlimentacion);
          const minutosLaborados = diferenciaEnMinutos[1];
          const tiempoLaborado = this.MinutosAHorasMinutosSegundos(minutosLaborados);
          const minutosAtraso = diferenciaEnMinutos[2];
          const tiempoAtraso = this.MinutosAHorasMinutosSegundos(minutosAtraso);
          const minutosSalidaAnticipada = diferenciaEnMinutos[3];
          const tiempoSalidaAnticipada = this.MinutosAHorasMinutosSegundos(minutosSalidaAnticipada);

          n = n + 1;
          const ele = {
            n,
            cedula: usu.cedula,
            codigo: usu.codigo,
            empleado: usu.apellido + ' ' + usu.nombre,
            ciudad: usu.ciudad,
            sucursal: usu.sucursal,
            departamento: usu.departamento,
            regimen: usu.regimen,
            fecha, entradaHorario,
            entrada, salidaHorario,
            salida, alimentacion_asignada,
            inicioAlimentacionHorario,
            inicioAlimentacion,
            finAlimentacionHorario,
            finAlimentacion,
            tiempoAlimentacion,
            minutosAlimentacion,
            tiempoLaborado,
            minutosLaborados,
            tiempoAtraso,
            minutosAtraso,
            tiempoSalidaAnticipada,
            minutosSalidaAnticipada,
          }
          this.timbres.push(ele);
        })
      })
    })
  }

  /** ****************************************************************************************** **
   ** **                                   CALCULOS Y CONVERSIONES                            ** **
   ** ****************************************************************************************** **/

  CalcularDiferenciaFechas(timbre: any) {
    //VALORES DE RETORNO [minutosAlimentacion,minutosLaborados,minutosAtrasos,minutosSalidasAnticipadas]
    let minutosAlimentacion = 0;
    let minutosLaborados = 0;
    let minutosAtrasos = 0;
    let minutosSalidasAnticipadas = 0;

    if (timbre.origen === 'L' || timbre.origen === 'FD') {
      return [0, 0, 0, 0];
    }

    if (timbre.tipo === 'ES') {
      const { entrada, salida } = timbre;
      if (entrada.fecha_hora_timbre !== null && salida.fecha_hora_timbre !== null) {
        minutosLaborados = Number(this.CalcularMinutosDiferencia(entrada.fecha_hora_timbre, salida.fecha_hora_timbre).toFixed(2));
        minutosAtrasos = Number(this.CalcularMinutosAtraso(entrada.fecha_hora_horario, entrada.fecha_hora_timbre, entrada.tolerancia));
        minutosSalidasAnticipadas = Number(this.CalcularMinutosSalidaAnticipada(salida.fecha_hora_horario, salida.fecha_hora_timbre).toFixed(2));
      }
    }
    else {
      const { entrada, inicioAlimentacion, finAlimentacion, salida } = timbre;
      const min_alimentacion: number = timbre.inicioAlimentacion.minutos_alimentacion;
      if (entrada.fecha_hora_timbre !== null && salida.fecha_hora_timbre !== null) {
        minutosLaborados = Number(this.CalcularMinutosDiferencia(entrada.fecha_hora_timbre, salida.fecha_hora_timbre).toFixed(2));
        minutosAtrasos = Number(this.CalcularMinutosAtraso(entrada.fecha_hora_horario, entrada.fecha_hora_timbre, entrada.tolerancia));
        minutosSalidasAnticipadas = Number(this.CalcularMinutosSalidaAnticipada(salida.fecha_hora_horario, salida.fecha_hora_timbre).toFixed(2));
      }
      minutosAlimentacion = inicioAlimentacion.fecha_hora_timbre !== null && finAlimentacion.fecha_hora_timbre !== null
        ? Number(this.CalcularMinutosDiferencia(inicioAlimentacion.fecha_hora_timbre, finAlimentacion.fecha_hora_timbre).toFixed(2))
        : min_alimentacion;

      if (minutosLaborados > 0) {
        minutosLaborados = Number((minutosLaborados - minutosAlimentacion).toFixed(2));
      }
    }
    return [minutosAlimentacion, minutosLaborados, minutosAtrasos, minutosSalidasAnticipadas];
  }

  CalcularMinutosDiferencia(inicio: any, fin: any): number {
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    return Math.abs(fechaFin.getTime() - fechaInicio.getTime()) / 1000 / 60;
  }

  CalcularMinutosAtraso(horario: any, timbre: any, tolerancia: number): number {
    const diferencia = (new Date(timbre)).getTime() - (new Date(horario)).getTime();
    const atraso = diferencia > 0 ? (diferencia / (1000 * 60)) : 0;

    return this.tolerancia !== '1'
      ? atraso > tolerancia
        ? this.tolerancia === '2-1' ? atraso : atraso - tolerancia
        : 0
      : atraso;
  }

  CalcularMinutosSalidaAnticipada(horario: any, timbre: any): number {
    const fechaHorario = new Date(horario);
    const fechaTimbre = new Date(timbre);

    return fechaTimbre < fechaHorario ? (fechaHorario.getTime() - fechaTimbre.getTime()) / 1000 / 60 : 0;
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
    return `${this.selectionReg.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
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

  // METODO PARA VALIDAR LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA VALIDAR NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
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
  ObtenerClaseAlimentacion(asignado: any, tomado: any) {
    const tAsignado = Number(asignado);
    const tTomado = Number(tomado);
    if (tTomado > tAsignado) {
      return 'verde';
    }
  }

  ObtenerClaseTimbre(valor: any) {
    if (valor == 'FT') {
      return 'rojo';
    }
  }

  ObtenerClaseAtrasoSalida(valor: any, tipo: string) {
    const numero = Number(valor);
    if (numero > 0) {
      return tipo === 'A' ? 'amarillo' : 'azul';
    }
  }
}
