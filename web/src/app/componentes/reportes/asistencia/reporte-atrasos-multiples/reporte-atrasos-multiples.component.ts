// IMPORTAR LIBRERIAS
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';

import * as xlsx from 'xlsx';

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { ReportesService } from '../../../../servicios/reportes/reportes.service';
import { AtrasosService } from 'src/app/servicios/reportes/atrasos/atrasos.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';

@Component({
  selector: 'app-reporte-atrasos-multiples',
  templateUrl: './reporte-atrasos-multiples.component.html',
  styleUrls: ['./reporte-atrasos-multiples.component.css']
})

export class ReporteAtrasosMultiplesComponent implements OnInit, OnDestroy {

  // CRITERIOS DE BUSQUEDA POR FECHAS
  get rangoFechas() { return this.reporteService.rangoFechas };

  // SELECCIÓN DE BUSQUEDA DE DATOS SEGUN OPCION
  get opcion() { return this.reporteService.opcion };

  // CRITERIOS DE BUSQUEDA SEGUN OPCION SELECCIONADA
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

  // VARIABLE PARA ADMINISTRAR TOLERANCIA
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
    private reportesAtrasos: AtrasosService,
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
  }

  ngOnDestroy(): void {
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.timbres = [];
    this.cargos = [];
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/
  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametro() {
    let datos: any = [];
    let detalles = { parametros: '1, 2, 3' };
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
          // id_tipo_parametro Tolerancia - atrasos = 3
          else if (p.id_parametro === 3) {
            this.tolerancia = p.descripcion;
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
    this.reportesAtrasos.ReporteAtrasos(seleccionados, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      if (this.tolerancia !== '1') {
        this.FiltrarTolerancia();
      }
      switch (accion) {
        case 'excel': this.ExportarExcel(); break;
        case 'ver': this.VerDatos(); break;
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


   async GenerarPDF(action: any) {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    let doc_name = `Atrasos_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
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
        { text: (localStorage.getItem('name_empresa') as string).toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, 0, 0, 5] },
        { text: `ATRASOS - USUARIOS ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF(this.data_pdf).map((obj: any) => {
          return obj
        })
      ],
      styles: {
        derecha: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color, alignment: 'left' },
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeaderSecundario: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 5, 0, 0] },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        itemsTableDerecha: { fontSize: 8, alignment: 'right' },
        itemsTableInfoTotal: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTableTotal: { fontSize: 8, bold: true, alignment: 'right', fillColor: '#E3E3E3' },
        itemsTableCentradoTotal: { fontSize: 8, bold: true, alignment: 'center', fillColor: '#E3E3E3' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        tableMarginCabeceraTotal: { margin: [0, 20, 0, 0] },
      }
    };
  }

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(data: any[]): Array<any> {
    let totalTiempoEmpleado: number = 0;
    let totalTiempo = 0;
    let resumen = '';
    let general: any = [];
    let n: any = []
    let c = 0;
    data.forEach((selec: any) => {
      // CONTAR REGISTROS
      let arr_reg = selec.empleados.map((o: any) => { return o.atrasos.length });
      let reg = this.validar.SumarRegistros(arr_reg);
      // CONTAR MINUTOS DE ATRASOS
      totalTiempo = 0;
      selec.empleados.forEach((o: any) => {
        o.atrasos.map((a: any) => {
          const minutos_ = this.SegundosAMinutosConDecimales(Number(a.diferencia));
          totalTiempo += Number(minutos_);
          return totalTiempo;
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
        formato_general: this.MinutosAHorasMinutosSegundos(Number(totalTiempo.toFixed(2))),
        formato_decimal: totalTiempo.toFixed(2),
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
        totalTiempoEmpleado = 0;
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            headerRows: 2,
            body: [
              [
                { rowSpan: 2, text: 'N°', style: 'centrado' },
                { rowSpan: 1, colSpan: 2, text: 'HORARIO', style: 'tableHeader' },
                {},
                { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                {},
                { rowSpan: 2, text: 'TIPO PERMISO', style: 'centrado' },
                { rowSpan: 2, text: 'DESDE', style: 'centrado' },
                { rowSpan: 2, text: 'HASTA', style: 'centrado' },
                { rowSpan: 2, colSpan: 2, text: 'PERMISO', style: 'centrado' },
                {},
                { rowSpan: 2, text: 'TOLERANCIA', style: 'centrado' },
                { rowSpan: 2, colSpan: 2, text: 'ATRASO', style: 'centrado' },
                {}
              ],
              [
                {},
                { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                { rowSpan: 1, text: 'FECHA', style: 'tableHeaderSecundario' },
                { rowSpan: 1, text: 'HORA', style: 'tableHeaderSecundario' },
                {}, {}, {}, {},
                {},
                {},
                {},
                {},
              ],
              ...empl.atrasos.map((usu: any) => {
                // FORMATEAR FECHAS
                const fechaHorario = this.validar.FormatearFecha(usu.fecha_hora_horario.split(' ')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
                const fechaTimbre = this.validar.FormatearFecha(usu.fecha_hora_timbre.split(' ')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
                console.log('hora formato', this.formato_hora)
                const horaHorario = this.validar.FormatearHora(usu.fecha_hora_horario.split(' ')[1], this.formato_hora);
                console.log('hora ', horaHorario)
                const horaTimbre = this.validar.FormatearHora(usu.fecha_hora_timbre.split(' ')[1], this.formato_hora);
                var tolerancia = '00:00:00';
                if (this.tolerancia !== '1') {
                  tolerancia = this.MinutosAHorasMinutosSegundos(Number(usu.tolerancia));
                }
                const minutos = this.SegundosAMinutosConDecimales(Number(usu.diferencia));
                const tiempo = this.MinutosAHorasMinutosSegundos(minutos);
                totalTiempoEmpleado += Number(minutos);
                c = c + 1
                return [
                  { style: 'itemsTableCentrado', text: c },
                  { style: 'itemsTableCentrado', text: fechaHorario },
                  { style: 'itemsTableCentrado', text: horaHorario },
                  { style: 'itemsTableCentrado', text: fechaTimbre },
                  { style: 'itemsTableCentrado', text: horaTimbre },
                  {}, {}, {}, {}, {},
                  { style: 'itemsTableCentrado', text: tolerancia },
                  { style: 'itemsTableCentrado', text: tiempo },
                  { style: 'itemsTableDerecha', text: minutos.toFixed(2) },
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
                { style: 'itemsTableCentradoTotal', text: 'TOTAL' },
                {
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                { style: 'itemsTableCentradoTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoEmpleado.toFixed(2))) },
                { style: 'itemsTableTotal', text: totalTiempoEmpleado.toFixed(2) },
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
              { colSpan: 2, text: 'PERMISO', style: 'itemsTableInfoTotal' },
              {},
              { colSpan: 2, text: 'ATRASO', style: 'itemsTableInfoTotal' },
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
                { text: '', style: 'itemsTableDerecha' },
                { text: '', style: 'itemsTableCentrado' },
                { text: info.formato_general, style: 'itemsTableCentrado' },
                { text: info.formato_decimal, style: 'itemsTableDerecha' },
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
    xlsx.utils.book_append_sheet(wb, wsr, 'Atrasos');
    xlsx.writeFile(wb, `Atrasos_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
  }

  EstructurarDatosExcel(array: Array<any>) {
    let nuevo: Array<any> = [];
    let n = 0;
    array.forEach((suc: any) => {
      suc.empleados.forEach((empl: any) => {
        empl.atrasos.forEach((usu: any) => {
          n++;
          const horaHorario = this.validar.FormatearHora(usu.fecha_hora_horario.split(' ')[1], this.formato_hora);
          const horaTimbre = this.validar.FormatearHora(usu.fecha_hora_timbre.split(' ')[1], this.formato_hora);
          const minutos = this.SegundosAMinutosConDecimales(Number(usu.diferencia));
          const tiempo = this.MinutosAHorasMinutosSegundos(minutos);
          let ele: any;
          var tolerancia = '00:00:00';
          if (this.tolerancia !== '1') {
            tolerancia = this.MinutosAHorasMinutosSegundos(Number(usu.tolerancia));
          }
          ele = {
            'N°': n,
            'Cédula': empl.cedula,
            'Código': empl.codigo,
            'Nombre Empleado': empl.apellido + ' ' + empl.nombre,
            'Ciudad': empl.ciudad,
            'Sucursal': empl.sucursal,
            'Régimen': empl.regimen,
            'Departamento': empl.departamento,
            'Cargo': empl.cargo,
            'Fecha Horario': new Date(usu.fecha_hora_horario),
            'Hora Horario': horaHorario,
            'Fecha Timbre': new Date(usu.fecha_hora_timbre),
            'Hora Timbre': horaTimbre,
            'Tolerancia': tolerancia,
            'Atraso HH:MM:SS': tiempo,
            'Atraso Minutos': minutos.toFixed(2),
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
        empl.atrasos.forEach((usu: any) => {
          const fechaHorario = this.validar.FormatearFecha(usu.fecha_hora_horario.split(' ')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const fechaTimbre = this.validar.FormatearFecha(usu.fecha_hora_timbre.split(' ')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const horaHorario = this.validar.FormatearHora(usu.fecha_hora_horario.split(' ')[1], this.formato_hora);
          const horaTimbre = this.validar.FormatearHora(usu.fecha_hora_timbre.split(' ')[1], this.formato_hora);
          const tolerancia = this.MinutosAHorasMinutosSegundos(Number(usu.tolerancia));
          const minutos = this.SegundosAMinutosConDecimales(Number(usu.diferencia));
          const tiempo = this.MinutosAHorasMinutosSegundos(minutos);
          n = n + 1;
          let ele = {
            n: n,
            cedula: empl.cedula,
            codigo: empl.codigo,
            empleado: empl.apellido + ' ' + empl.nombre,
            ciudad: empl.ciudad,
            sucursal: empl.sucursal,
            regimen: empl.regimen,
            departamento: empl.departamento,
            tolerancia,
            fechaHorario,
            horaHorario,
            fechaTimbre,
            horaTimbre,
            atrasoM: minutos.toFixed(2), atrasoT: tiempo,
          }
          this.timbres.push(ele);
        })
      })
    })
  }

  /** ****************************************************************************************** **
   ** **                              METODOS PARA FILTRAR TOLERANCIA                         ** **
   ** ****************************************************************************************** **/
  FiltrarTolerancia() {
    this.data_pdf = this.data_pdf.filter((suc: any) => {
      suc.empleados = suc.empleados.filter((empl: any) => {
        empl.atrasos = empl.atrasos && empl.atrasos.filter((usu: any) => {
          let diferencia = usu.diferencia;
          const tolerancia = usu.tolerancia * 60;
          return (diferencia <= tolerancia) ? false : (this.tolerancia === '2-1' ? (usu.diferencia = diferencia, true) : (usu.diferencia = diferencia - tolerancia, true));
        });
        return empl.atrasos && empl.atrasos.length > 0;
      });
      return suc.empleados && suc.empleados.length > 0;
    });

    if (this.data_pdf.length === 0) {
      this.toastr.error('No se han encontrado registros de timbres.');
    }
  }

  /** ****************************************************************************************** **
   ** **                                   CALCULOS Y CONVERSIONES                            ** **
   ** ****************************************************************************************** **/

  // METODO PARA CONVERTIR SEGUNDOS A MINUTOS
  SegundosAMinutosConDecimales(segundos: number) {
    return Number((segundos / 60).toFixed(2));
  }

  // METODO PARA CONVERTIR MINUTOS A FORMATO HH:MM:SS
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

  // METODOS PARA VALIDAR INGRESO DE LETRAS Y NUMEROS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e)
  }

  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt)
  }

  // MOSTRAR DETALLES
  VerDatos() {
    this.verDetalle = true;
    this.ExtraerDatos();
  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.verDetalle = false;
    this.paginatorDetalle.firstPage();
  }

}
