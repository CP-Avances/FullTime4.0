// IMPORTAR LIBRERIAS
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';

import ExcelJS, { FillPattern } from "exceljs";
import * as FileSaver from 'file-saver';

// IMPORTAR MODELOS
import { ITableEmpleados } from 'src/app/model/reportes.model';

// IMPORTAR SERVICIOS
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';

@Component({
  selector: 'app-timbre-sistema',
  standalone: false,
  templateUrl: './timbre-sistema.component.html',
  styleUrls: ['./timbre-sistema.component.css']
})

export class TimbreSistemaComponent implements OnInit, OnDestroy {

  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;

  get timbreDispositivo() { return this.reporteService.mostrarTimbreDispositivo };

  get rangoFechas() { return this.reporteService.rangoFechas };

  get opcion() { return this.reporteService.opcion };

  get bool() { return this.reporteService.criteriosBusqueda };

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  idEmpleadoLogueado: any;
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  regimen: any = [];
  timbres: any = [];
  cargos: any = [];
  data_pdf: any = [];

  // ESTADO HORA SERVIDOR
  dispositivo: boolean = false;

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

  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc };

  get filtroNombreDep() { return this.reporteService.filtroNombreDep };

  get filtroNombreReg() { return this.reporteService.filtroNombreReg };

  get filtroNombreCar() { return this.reporteService.filtroNombreCarg };

  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };
  get filtroRolEmp() { return this.reporteService.filtroRolEmp};


  constructor(
    private reporteService: ReportesService,
    private R_asistencias: ReportesAsistenciasService,
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
    if (parseInt(localStorage.getItem('rol') as string) === 1) {
      this.dispositivo = true;
    }
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.BuscarInformacionGeneral(this.opcionBusqueda);
    this.BuscarParametro();
    this.bordeCompleto = {
      top: { style: "thin" as ExcelJS.BorderStyle },
      left: { style: "thin" as ExcelJS.BorderStyle },
      bottom: { style: "thin" as ExcelJS.BorderStyle },
      right: { style: "thin" as ExcelJS.BorderStyle },
    };

    this.bordeGrueso = {
      top: { style: "medium" as ExcelJS.BorderStyle },
      left: { style: "medium" as ExcelJS.BorderStyle },
      bottom: { style: "medium" as ExcelJS.BorderStyle },
      right: { style: "medium" as ExcelJS.BorderStyle },
    };

    this.fillAzul = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4F81BD" }, // Azul claro
    };

    this.fontTitulo = { bold: true, size: 12, color: { argb: "FFFFFF" } };
    this.fontHipervinculo = { color: { argb: "0000FF" }, underline: true };
  }

  ngOnDestroy() {
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
          'Ups! algo salio mal.',
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
    this.data_pdf = [];
    this.R_asistencias.ReporteTimbreSistema(seleccionados, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'excel': this.generarExcel(); break;
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
    let doc_name = `Timbres_virtuales_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(doc_name); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF() {
    // DEFINIR ORIENTACION DE LA PAGINA
    let orientacion = 'portrait';
    if (this.timbreDispositivo) {
      orientacion = 'landscape'
    }
    return {
      pageSize: 'A4',
      pageOrientation: orientacion,
      pageMargins: [40, 50, 40, 50],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');

        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
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
        { text: localStorage.getItem('name_empresa'), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: `TIMBRES VIRTUALES - ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF(this.data_pdf).map((obj: any) => {
          return obj
        })
      ],
      styles: {
        derecha: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color, alignment: 'left' },
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0], fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(data: any[]): Array<any> {
    let n: any = [];
    let c = 0;
    data.forEach((selec: any) => {
      let arr_reg = selec.empleados.map((o: any) => { return o.timbres.length })
      let reg = this.validar.SumarRegistros(arr_reg);
      // NOMBRE DE CABECERAS DEL REPORTE DE ACUERDO CON EL FILTRO DE BUSQUEDA
      let descripcion = '';
      let establecimiento = 'SUCURSAL: ' + selec.sucursal;
      if (this.bool.bool_reg === true) {
        descripcion = 'RÉGIMEN LABORAL: ' + selec.nombre;
      }
      else if (this.bool.bool_dep === true) {
        descripcion = 'DEPARTAMENTO: ' + selec.departamento;
      }
      else if (this.bool.bool_cargo === true) {
        descripcion = 'CARGO: ' + selec.nombre;
      }
      else if (this.bool.bool_suc === true) {
        descripcion = 'CIUDAD: ' + selec.ciudad;
      }
      else if (this.bool.bool_emp === true) {
        descripcion = 'LISTA EMPLEADOS';
        establecimiento = '';
      }
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
      // PRESENTACION DE LA INFORMACION USUARIO
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
                  text: 'C.C.: ' + empl.identificacion,
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
                  border: [true, false, false, false],
                  text: 'RÉGIMEN LABORAL: ' + empl.regimen,
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
              ],
            ],
          },
        });
        // ENCERAR VARIABLES
        c = 0;
        // ESTRUCTURAR PRESENTACION
        const CrearFilaEncabezado = (conDispositivo: boolean) => [
          [
            { rowSpan: 2, text: 'N°', style: 'centrado' },
            { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
            {},
            ...(conDispositivo
              ? [
                { rowSpan: 1, colSpan: 2, text: 'DISPOSITIVO', style: 'tableHeader' },
                {},
              ]
              : []),
            { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
            { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
            { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
            { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
            { rowSpan: 2, text: 'LATITUD', style: 'centrado' }
          ],
          [
            {},
            { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
            { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
            ...(conDispositivo
              ? [
                { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                { rowSpan: 1, text: 'HORA', style: 'tableHeader' }
              ]
              : []),
            {}, {}, {}, {}, {}
          ]
        ];
        // LEER ACCIONES DE LOS TIMBRES
        const ObtenerAccionTexto = (accion: string) => {
          const acciones = {
            'EoS': 'Entrada o salida',
            'AES': 'Inicio o fin alimentación',
            'PES': 'Inicio o fin permiso',
            'E': 'Entrada',
            'S': 'Salida',
            'I/A': 'Inicio alimentación',
            'F/A': 'Fin alimentación',
            'I/P': 'Inicio permiso',
            'F/P': 'Fin permiso',
            'HA': 'Timbre libre',
          };
          return acciones[accion] || 'Desconocido';
        };
        // LEER DATOS
        const CrearFilasCuerpo = (timbres: any[], conDispositivo: boolean) => timbres.map((t: any) => {
          let servidor_fecha = '';
          let servidor_hora = '';
          if (t.fecha_hora_timbre_validado) {
            [servidor_fecha, servidor_hora] = [
              this.validar.FormatearFecha(t.fecha_hora_timbre_validado.split(' ')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas),
              this.validar.FormatearHora(t.fecha_hora_timbre_validado.split(' ')[1], this.formato_hora)
            ];
          }
          const fechaTimbre = this.validar.FormatearFecha(t.fecha_hora_timbre.split(' ')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const horaTimbre = this.validar.FormatearHora(t.fecha_hora_timbre.split(' ')[1], this.formato_hora);
          const accionT = ObtenerAccionTexto(t.accion);
          c++;
          return [
            { style: 'itemsTableCentrado', text: c },
            { style: 'itemsTable', text: servidor_fecha },
            { style: 'itemsTable', text: servidor_hora },
            ...(conDispositivo ? [
              { style: 'itemsTable', text: fechaTimbre },
              { style: 'itemsTable', text: horaTimbre }
            ] : []),
            { style: 'itemsTableCentrado', text: t.id_reloj },
            { style: 'itemsTableCentrado', text: accionT },
            { style: 'itemsTable', text: t.observacion },
            { style: 'itemsTable', text: t.longitud },
            { style: 'itemsTable', text: t.latitud },
          ];
        });
        // ELABORAR TABLA
        const crearTabla = (conDispositivo: any) => ({
          style: 'tableMargin',
          table: {
            widths: conDispositivo
              ? ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto']
              : ['auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'],
            headerRows: 2,
            body: [
              ...CrearFilaEncabezado(conDispositivo),
              ...CrearFilasCuerpo(empl.timbres, conDispositivo),
            ]
          },
          layout: {
            fillColor: (rowIndex: any) => (rowIndex % 2 === 0) ? '#E5E7E9' : null,
          }
        });
        n.push(crearTabla(this.timbreDispositivo));
      })
    })
    return n;
  }

  /** ****************************************************************************************** **
   ** **                               METODOS PARA EXPORTAR A EXCEL                          ** **
   ** ****************************************************************************************** **/

 


  async generarExcel() {
    let datos: any[] = [];
    let n: number = 1;
    let accionT = '';

    this.data_pdf.forEach((data: any) => {
      data.empleados.forEach((usu: any) => {
        usu.timbres.forEach((t: any) => {
          let servidor_fecha: any = '';
          let servidor_hora = '';
          if (t.fecha_hora_timbre_validado != '' && t.fecha_hora_timbre_validado != null) {
            servidor_fecha = new Date(t.fecha_hora_timbre_validado);
            servidor_hora = this.validar.FormatearHora(t.fecha_hora_timbre_validado.split(' ')[1], this.formato_hora);
          };
          const horaTimbre = this.validar.FormatearHora(t.fecha_hora_timbre.split(' ')[1], this.formato_hora);
          switch (t.accion) {
            case 'EoS': accionT = 'Entrada o salida'; break;
            case 'AES': accionT = 'Inicio o fin alimentación'; break;
            case 'PES': accionT = 'Inicio o fin permiso'; break;
            case 'E': accionT = 'Entrada'; break;
            case 'S': accionT = 'Salida'; break;
            case 'I/A': accionT = 'Inicio alimentación'; break;
            case 'F/A': accionT = 'Fin alimentación'; break;
            case 'I/P': accionT = 'Inicio permiso'; break;
            case 'F/P': accionT = 'Fin permiso'; break;
            case 'HA': accionT = 'Timbre libre'; break;
            default: accionT = 'Desconocido'; break;
          }
          if (this.timbreDispositivo) {
            datos.push([
              n++,
              usu.identificacion,
              usu.codigo,
              `${usu.apellido} ${usu.nombre}`,
              usu.ciudad,
              usu.sucursal,
              usu.regimen,
              usu.departamento,
              usu.cargo,
              servidor_fecha,
              servidor_hora,
              t.id_reloj,
              accionT,
              t.observacion,
              t.latitud,
              t.longitud,
              new Date(t.fecha_hora_timbre),
              horaTimbre
            ])
          } else {
            datos.push([
              n++,
              usu.identificacion,
              usu.codigo,
              `${usu.apellido} ${usu.nombre}`,
              usu.ciudad,
              usu.sucursal,
              usu.regimen,
              usu.departamento,
              usu.cargo,
              servidor_fecha,
              servidor_hora,
              t.id_reloj,
              accionT,
              t.observacion,
              t.latitud,
              t.longitud
            ])
          }

        });
      })
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Timbres Virtuales");
    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });
    // COMBINAR CELDAS
 


    if (this.timbreDispositivo) {

      worksheet.mergeCells("B1:R1");
      worksheet.mergeCells("B2:R2");
      worksheet.mergeCells("B3:R3");
      worksheet.mergeCells("B4:R4");
      worksheet.mergeCells("B5:R5");
  
      // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
      worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
      worksheet.getCell("B2").value = 'Lista de Timbres Virtuales'.toUpperCase();
      worksheet.getCell(
        "B3"
      ).value = `Periodo del reporte: ${this.rangoFechas.fec_inico} al ${this.rangoFechas.fec_final}`;
      // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
      ["B1", "B2", "B3"].forEach((cell) => {
        worksheet.getCell(cell).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        worksheet.getCell(cell).font = { bold: true, size: 14 };
      });
      worksheet.columns = [
        { key: "n", width: 10 },
        { key: "identificacion", width: 20 },
        { key: "codigo", width: 20 },
        { key: "apenombre", width: 20 },
        { key: "ciudad", width: 20 },
        { key: "sucursal", width: 20 },
        { key: "regimen", width: 20 },
        { key: "departamento", width: 20 },
        { key: "cargo", width: 20 },
        { key: "servidor_fecha", width: 20 },
        { key: "servidor_hora", width: 20 },
        { key: "id_reloj", width: 20 },
        { key: "accionT", width: 20 },
        { key: "observacion", width: 20 },
        { key: "latitud", width: 20 },
        { key: "longitud", width: 20 },
        { key: "fecha_timbre_dispositivo", width: 40 },
        { key: "hora_timbre_dispositivo", width: 40 },
      ]

      const columnas = [
        { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
        { name: "IDENTIFICACIÓN", totalsRowLabel: "Total:", filterButton: true },
        { name: "CÓDIGO", totalsRowLabel: "", filterButton: true },
        { name: "APELLIDO NOMBRE", totalsRowLabel: "", filterButton: true },
        { name: "CIUDAD", totalsRowLabel: "", filterButton: true },
        { name: "SUCURSAL", totalsRowLabel: "", filterButton: true },
        { name: "RÉGIMEN", totalsRowLabel: "", filterButton: true },
        { name: "DEPARTAMENTO", totalsRowLabel: "", filterButton: true },
        { name: "CARGO", totalsRowLabel: "", filterButton: true },
        { name: "SERVIDOR FECHA", totalsRowLabel: "", filterButton: true },
        { name: "SERVIDOR HORA", totalsRowLabel: "", filterButton: true },
        { name: "ID RELOJ", totalsRowLabel: "", filterButton: true },
        { name: "ACCIÓN", totalsRowLabel: "", filterButton: true },
        { name: "OBSERVACIÓN", totalsRowLabel: "", filterButton: true },
        { name: "LATITUD", totalsRowLabel: "", filterButton: true },
        { name: "LONGITUD", totalsRowLabel: "", filterButton: true },
        { name: "FECHA TIMBRE DISPOSITIVO", totalsRowLabel: "", filterButton: true },
        { name: "HORA TIMBRE DISPOSITIVO", totalsRowLabel: "", filterButton: true },
      ]

      worksheet.addTable({
        name: "TimbresVirtualesReporteTabla",
        ref: "A6",
        headerRow: true,
        totalsRow: false,
        style: {
          theme: "TableStyleMedium16",
          showRowStripes: true,
        },
        columns: columnas,
        rows: datos,
      });

      const numeroFilas = datos.length;
      for (let i = 0; i <= numeroFilas; i++) {
        for (let j = 1; j <= 18; j++) {
          const cell = worksheet.getRow(i + 6).getCell(j);
          if (i === 0) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
          } else {
            cell.alignment = {
              vertical: "middle",
              horizontal: this.obtenerAlineacionHorizontal(j),
            };
          }
          cell.border = this.bordeCompleto;
        }
      }

    } else {

      worksheet.mergeCells("B1:P1");
      worksheet.mergeCells("B2:P2");
      worksheet.mergeCells("B3:P3");
      worksheet.mergeCells("B4:P4");
      worksheet.mergeCells("B5:P5");
  
      // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
      worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
      worksheet.getCell("B2").value = 'Lista de Timbres Virtuales'.toUpperCase();
      worksheet.getCell(
        "B3"
      ).value = `Periodo del reporte: ${this.rangoFechas.fec_inico} al ${this.rangoFechas.fec_final}`;
      // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
      ["B1", "B2", "B3"].forEach((cell) => {
        worksheet.getCell(cell).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        worksheet.getCell(cell).font = { bold: true, size: 14 };
      });
      worksheet.columns = [
        { key: "n", width: 10 },
        { key: "identificacion", width: 20 },
        { key: "codigo", width: 20 },
        { key: "apenombre", width: 20 },
        { key: "ciudad", width: 20 },
        { key: "sucursal", width: 20 },
        { key: "regimen", width: 20 },
        { key: "departamento", width: 20 },
        { key: "cargo", width: 20 },
        { key: "servidor_fecha", width: 20 },
        { key: "servidor_hora", width: 20 },
        { key: "id_reloj", width: 20 },
        { key: "accionT", width: 20 },
        { key: "observacion", width: 20 },
        { key: "latitud", width: 20 },
        { key: "longitud", width: 20 },
      ]

      const columnas = [
        { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
        { name: "IDENTIFICACIÓN", totalsRowLabel: "Total:", filterButton: true },
        { name: "CÓDIGO", totalsRowLabel: "", filterButton: true },
        { name: "APELLIDO NOMBRE", totalsRowLabel: "", filterButton: true },
        { name: "CIUDAD", totalsRowLabel: "", filterButton: true },
        { name: "SUCURSAL", totalsRowLabel: "", filterButton: true },
        { name: "RÉGIMEN", totalsRowLabel: "", filterButton: true },
        { name: "DEPARTAMENTO", totalsRowLabel: "", filterButton: true },
        { name: "CARGO", totalsRowLabel: "", filterButton: true },
        { name: "SERVIDOR FECHA", totalsRowLabel: "", filterButton: true },
        { name: "SERVIDOR HORA", totalsRowLabel: "", filterButton: true },
        { name: "ID RELOJ", totalsRowLabel: "", filterButton: true },
        { name: "ACCIÓN", totalsRowLabel: "", filterButton: true },
        { name: "OBSERVACIÓN", totalsRowLabel: "", filterButton: true },
        { name: "LATITUD", totalsRowLabel: "", filterButton: true },
        { name: "LONGITUD", totalsRowLabel: "", filterButton: true },
      ]

      worksheet.addTable({
        name: "TimbresVirtualesReporteTabla",
        ref: "A6",
        headerRow: true,
        totalsRow: false,
        style: {
          theme: "TableStyleMedium16",
          showRowStripes: true,
        },
        columns: columnas,
        rows: datos,
      });

      const numeroFilas = datos.length;
      for (let i = 0; i <= numeroFilas; i++) {
        for (let j = 1; j <= 16; j++) {
          const cell = worksheet.getRow(i + 6).getCell(j);
          if (i === 0) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
          } else {
            cell.alignment = {
              vertical: "middle",
              horizontal: this.obtenerAlineacionHorizontal(j),
            };
          }
          cell.border = this.bordeCompleto;
        }
      }

    }




    worksheet.getRow(6).font = this.fontTitulo;
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      FileSaver.saveAs(blob, `Timbres_virtuales_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
    }
  }

  private obtenerAlineacionHorizontal(
    j: number
  ): "left" | "center" | "right" {
    if (j === 1 || j === 9 || j === 10 || j === 11) {
      return "center";
    } else {
      return "left";
    }
  }



  /** ****************************************************************************************** **
   ** **                 METODOS PARA EXTRAER TIMBRES PARA LA PREVISUALIZACION                ** **
   ** ****************************************************************************************** **/

  ExtraerDatos() {
    this.timbres = [];
    let n = 0;
    let accionT = '';
    this.data_pdf.forEach((data: any) => {
      data.empleados.forEach((usu: any) => {
        usu.timbres.forEach((t: any) => {
          n = n + 1;
          let servidor_fecha = '';
          let servidor_hora = '';
          if (t.fecha_hora_timbre_validado != '' && t.fecha_hora_timbre_validado != null) {
            servidor_fecha = this.validar.FormatearFecha(t.fecha_hora_timbre_validado.split(' ')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
            servidor_hora = this.validar.FormatearHora(t.fecha_hora_timbre_validado.split(' ')[1], this.formato_hora);
          }
          const fechaTimbre = this.validar.FormatearFecha(t.fecha_hora_timbre.split(' ')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const horaTimbre = this.validar.FormatearHora(t.fecha_hora_timbre.split(' ')[1], this.formato_hora);
          switch (t.accion) {
            case 'EoS': accionT = 'Entrada o salida'; break;
            case 'AES': accionT = 'Inicio o fin alimentación'; break;
            case 'PES': accionT = 'Inicio o fin permiso'; break;
            case 'E': accionT = 'Entrada'; break;
            case 'S': accionT = 'Salida'; break;
            case 'I/A': accionT = 'Inicio alimentación'; break;
            case 'F/A': accionT = 'Fin alimentación'; break;
            case 'I/P': accionT = 'Inicio permiso'; break;
            case 'F/P': accionT = 'Fin permiso'; break;
            case 'HA': accionT = 'Timbre libre'; break;
            default: accionT = 'Desconocido'; break;
          }
          let ele = {
            n: n,
            codigo: usu.codigo,
            identificacion: usu.identificacion,
            empleado: usu.apellido + ' ' + usu.nombre,
            ciudad: usu.ciudad,
            sucursal: usu.sucursal,
            departamento: usu.departamento,
            fechaTimbre, horaTimbre,
            fechaTimbreServidor: servidor_fecha,
            horaTimbreServidor: servidor_hora,
            accion: accionT,
            reloj: t.id_reloj,
            latitud: t.latitud,
            longitud: t.longitud,
            observacion: t.observacion
          }
          this.timbres.push(ele);
        })
      })
    })
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

  // METODO PARA MANEJAR EVENTO DE PAGINACION
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

  // METODO PARA VER UBICACION DE TIMBRE
  AbrirMapa(latitud: string, longitud: string) {
    const rutaMapa = "https://www.google.com/maps/search/+" + latitud + "+" + longitud;
    window.open(rutaMapa);
  }

  // METODOS PARA CONTROLAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODOS PARA CONTROLAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  //MOSTRAR DETALLES
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
