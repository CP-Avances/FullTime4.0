// IMPORTAR LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR SERVICIOS
import { PlantillaReportesService } from '../../plantilla-reportes.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { KardexService } from 'src/app/servicios/reportes/kardex.service';

// IMPORTAR COMPONENTES
import { ConfigAsistenciaComponent } from '../../configuracion-reportes/config-report-asistencia/config-asistencia.component';
import { EmpleadoElemento } from 'src/app/model/empleado.model';
import { SelectionModel } from '@angular/cdk/collections';

// IMPORTAR MODELOS
import { IReporteAsistenciaConsolidada, IRestAsisteConsoli, IRestTotalAsisteConsoli } from '../../../../model/reportes.model'

@Component({
  selector: 'app-asistencia-consolidado',
  templateUrl: './asistencia-consolidado.component.html',
  styleUrls: ['./asistencia-consolidado.component.css']
})

export class AsistenciaConsolidadoComponent implements OnInit {

  empleados: any = [];
  asistencia: any = [];

  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);

  filtroCodigo: number;
  filtroCedula: '';
  filtroEmpleado = '';

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  empleadoD: any = [];
  idEmpleado: number;

  fec_inicio_mes = new FormControl('', Validators.required);
  fec_final_mes = new FormControl('', Validators.required);

  public fechasForm = new FormGroup({
    fec_inicio: this.fec_inicio_mes,
    fec_final: this.fec_final_mes
  })

  anio_inicio = new FormControl('', Validators.required);
  anio_final = new FormControl('', Validators.required);

  public fechasKardexForm = new FormGroup({
    fec_inicio: this.anio_inicio,
    fec_final: this.anio_final
  })

  selection = new SelectionModel<EmpleadoElemento>(true, []);

  // GETTERS DE COLORES, NOMBRE EMPRESA Y LOGO PARA COLOCAR EN REPORTE 
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get urlImagen(): string { return this.plantillaPDF.logoBase64 }
  get nombreEmpresa(): string { return this.plantillaPDF.nameEmpresa }

  constructor(
    private plantillaPDF: PlantillaReportesService,
    private restEmpleado: EmpleadoService,
    private openVentana: MatDialog,
    private restKardex: KardexService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
    this.ObtenerEmpleados();
    this.ObtenerEmpleadoSolicitaKardex(this.idEmpleado);
    this.MensajeInicio();
  }

  btnCheckDeshabilitado: boolean = false;
  HabilitarSeleccionDesactivados() {
    if (this.btnCheckDeshabilitado === false) {
      this.btnCheckDeshabilitado = true;
    } else if (this.btnCheckDeshabilitado === true) {
      this.btnCheckDeshabilitado = false;
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.empleados.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.empleados.forEach(row => this.selection.select(row));
  }

  checkboxLabelDos(row?: EmpleadoElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // MENSAJE DE ADVERTENCIA SI TIENE O NO LA CONFIGURACIÓN PARA SELECCIONAR LOS CAMPOS A IMPRIMIR
  MensajeInicio() {
    if (!!sessionStorage.getItem('arrayConfigAsistencia') === false) {
      if (this.habilitar === false) {
        this.estilo = { 'visibility': 'hidden' };
      }
      this.toastr.info('Configurar primero los campos a imprimir', 'Configurar campos Pdf', {
        timeOut: 10000,
      }).onTap.subscribe(items => {
        console.log(items);
        this.ConfiguracionReporteAsistencia();
      });
    } else {
      if (this.habilitar === true) {
        this.estilo = { 'visibility': 'visible' };
      }
    }
  }

  // OBTENER LISTA DE EMPLEADOS
  ObtenerEmpleados() {
    this.empleados = [];
    this.restEmpleado.ListarEmpleadosActivos().subscribe(res => {
      this.empleados = res;
      console.log(this.empleados);
    });
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  ObtenerEmpleadoSolicitaKardex(idemploy: any) {
    this.empleadoD = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoD = data;
    });
  }

  // METODO DE LA PAGINACIÓN
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // FUNCIONES PARA VALIDAR LOS CAMPOS Y LAS FECHAS DE RANGOS DEL REPORTE
  f_inicio_req: string = '';
  f_final_req: string = '';
  habilitar: boolean = false;
  estilo: any = { 'visibility': 'hidden' };
  ValidarRangofechas(form: any) {
    var f_i = new Date(form.fec_inicio)
    var f_f = new Date(form.fec_final)

    if (f_i < f_f) {
      this.toastr.success('Fechas validas', '', {
        timeOut: 6000,
      });
      this.f_inicio_req = f_i.toJSON().split('T')[0];
      this.f_final_req = f_f.toJSON().split('T')[0];
      this.habilitar = true
      this.estilo = { 'visibility': 'visible' };
    } else if (f_i > f_f) {
      this.toastr.info('Fecha final es menor a la fecha inicial', '', {
        timeOut: 6000,
      });
      this.fechasForm.reset();
    } else if (f_i.toLocaleDateString() === f_f.toLocaleDateString()) {
      this.toastr.info('Fecha inicial es igual a la fecha final', '', {
        timeOut: 6000,
      });
      this.fechasForm.reset();
    }
    // console.log(f_i.toJSON());
    // console.log(f_f.toJSON());
  }

  AsistenciaEmpleado(id_empleado: number, palabra: string) {
    this.asistencia = [];
    if (this.f_inicio_req != '' && this.f_final_req != '') {
      this.restKardex.ReporteAsistenciaDetalleConsolidado(id_empleado, this.f_inicio_req, this.f_final_req).subscribe(res => {
        this.asistencia = res;

        console.log('ver info ********************', this.asistencia)
        this.generarPdf(palabra, 1);
      }, err => {
        this.toastr.error(err.error.message, 'Algo salio mal', {
          timeOut: 6000,
        });
      })
    } else {
      this.toastr.error('Una de las fechas no ha sido asignada', 'Error al ingresar Fechas', {
        timeOut: 6000,
      });
    }
  }

  // ABRIR VENTANA DE SELECCIÓN DE CAMPOS PARA IMPRIMIR REPORTE 

  ConfiguracionReporteAsistencia() {
    console.log('Esta listo para configurar');
    this.openVentana.open(ConfigAsistenciaComponent, { width: '500px' }).afterClosed()
      .subscribe(res => {
        if (res === true) {
          if (this.habilitar === true) {
            this.estilo = { 'visibility': 'visible' };
          }
        } else {
          if (this.habilitar === false) {
            this.estilo = { 'visibility': 'hidden' };
          }
        }
      })

    this.MensajeInicio()
  }
  /* ****************************************************************************************************
  *                               PARA LA EXPORTACION DE ARCHIVOS PDF 
  * ****************************************************************************************************/

  generarPdf(action = 'open', pdf: number) {

    let documentDefinition;

    if (pdf === 1) {
      documentDefinition = this.getDocumentDefinicionAsistencia();
    }

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  /**********************************************
   *  METODOS PARA IMPRIMIR LA ASISTENCIA
   **********************************************/
  fechaHoy: string;
  getDocumentDefinicionAsistencia() {
    sessionStorage.setItem('Empleado', this.empleados);
    var f = new Date();
    f.setUTCHours(f.getHours())
    this.fechaHoy = f.toJSON();
    // console.log(this.fechaHoy);

    var nomEmpleado = this.empleadoD[0].nombre;
    var apelEmpleado = this.empleadoD[0].apellido;
    return {
      pageOrientation: 'landscape',
      watermark: { text: 'Confidencial', color: 'blue', opacity: 0.1, bold: true, italics: false },
      //header1: { text: 'Impreso por:  ' + this.empleadoD[0].nombre + ' ' + this.empleadoD[0].apellido, margin: 10, fontSize: 9, opacity: 0.3 },

      header: function (currentPage: any, pageCount: any, fecha: any) {
        fecha = f.toJSON().split("T")[0];
        var timer = f.toJSON().split("T")[1].slice(0, 5);
        return [
          {
            margin: [10, 5, 10, 0],
            columns: [

              'Impreso por: ' + nomEmpleado + ' ' + apelEmpleado,
              {
                text: [
                  {
                    text: 'Fecha: ' + fecha + ' Hora: ' + timer + '\n © Pag ' + currentPage.toString() + ' of ' + pageCount, alignment: 'right', opacity: 0.5, color: 'blue'
                  },
                ],
              }
            ],
            fontSize: 9, color: '#A4B8FF',
          }
        ]
      },

      footer: function () {
        return [
          {
            table: {
              //margin: [10, 5, 0, 2],
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'HORA TRAB: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Horas Trabajadas.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'TOTAL ALIM: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Total Alimentación.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'FT: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Falta Timbre.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'F: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Feriado.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'R: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Registrado.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'L: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Libre.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'SUPL: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Hora Suplementaria.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'EX. L-V: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Extra de lunes a viernes.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'EX. S-D: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Extra sábado a domingo.', border: [false, false, false, false], style: ['quote', 'small'] },
                ]
              ]
            }
          }
        ]
      },
      content: [
        {
          columns: [
            {
              image: this.urlImagen,
              width: 90,
              height: 40,
            },
            {
              width: '*',
              text: this.nombreEmpresa,
              bold: true,
              fontSize: 20,
              margin: [230, 2, 0, 0],
            }
          ]
        },
        {
          style: 'subtitulos',
          text: 'REPORTE ASISTENCIA DETALLE CONSOLIDADO'
        },
        this.CampoInformacionGeneralAsistencia(this.asistencia.empleado[0].descripcion, this.asistencia.empleado[0]),
        this.CampoDetalleAsistencia(this.asistencia.detalle),
        this.CampoOperaciones(this.asistencia.operaciones[0]),
      ],
      styles: {
        tableTotal: { fontSize: 30, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeaderT: { fontSize: 7, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeaderS: { fontSize: 6, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, margin: [0, 3, 0, 3], },
        itemsTableD: { fontSize: 7, margin: [0, 3, 0, 3], },
        itemsTableInfo: { fontSize: 10, margin: [0, 5, 0, 5] },
        subtitulos: { fontSize: 16, alignment: 'center', margin: [0, 0, 0, 4] },
        tableMargin: { margin: [0, 20, 0, 0] },
        CabeceraTabla: { fontSize: 12, alignment: 'center', margin: [0, 6, 0, 6], fillColor: this.p_color },
        quote: { margin: [5, 20, -2, -5], italics: true },
        small: { fontSize: 7, color: 'blue', opacity: 0.5 }
      }
    };
  }

  CampoInformacionGeneralAsistencia(ciudad: string, e: any) {
    return {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { colSpan: 3, text: 'INFORMACIÓN GENERAL EMPLEADO', style: 'CabeceraTabla' },
            '', ''
          ],
          [
            {
              border: [true, true, false, true],
              text: 'CIUDAD: ' + ciudad,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, false, true],
              bold: true,
              text: 'PERIODO DEL: ' + String(moment(this.f_inicio_req, "YYYY/MM/DD").format("DD/MM/YYYY")) + ' AL ' + String(moment(this.f_final_req, "YYYY/MM/DD").format("DD/MM/YYYY")),
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, true, true],
              text: 'N° REGISTROS: ' + this.asistencia.detalle.length,
              style: 'itemsTableInfo'
            }
          ],
          [
            {
              border: [true, true, false, true],
              text: 'EMPLEADO: ' + e.nombre,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, false, true],
              text: 'C.C.: ' + e.cedula,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, true, true],
              text: 'COD: ' + e.codigo,
              style: 'itemsTableInfo'
            }
          ]
        ]
      }
    }
  }

  CampoDetalleAsistencia(d: any[]) {
    // console.log(!!sessionStorage.getItem('arrayConfigAsistencia'));
    // console.log(!!sessionStorage.getItem('columnasValidasAsistencia'));
    if (!!sessionStorage.getItem('arrayConfigAsistencia') === false) {
      this.toastr.error('Configurar campos a imprimir antes de descargar o visualizar', 'Error Pdf', {
        timeOut: 10000,
      }).onTap.subscribe(items => {
        console.log(items);
        this.ConfiguracionReporteAsistencia();
      });

      return { text: 'No has seleccionado ningun campo de impresión.' }
    }

    if (!!sessionStorage.getItem('columnasValidasAsistencia') === false) {
      this.toastr.error('Configurar campos a imprimir antes de descargar o visualizar', 'Error Pdf', {
        timeOut: 10000,
      }).onTap.subscribe(items => {
        console.log(items);
        this.ConfiguracionReporteAsistencia();
      });

      return { text: 'No has seleccionado ningun campo de impresión.' }
    }

    let columnas = parseInt(sessionStorage.getItem('columnasValidasAsistencia') as string);
    let s = JSON.parse(sessionStorage.getItem('arrayConfigAsistencia') as any) as IReporteAsistenciaConsolidada;
    console.log(s);

    return this.FuncionRegistros(columnas, s, d);
  }

  FuncionRegistros(columnas: number, configuracion: IReporteAsistenciaConsolidada, datos: any[]) {
    let contador = 0;
    return {
      style: 'tableMargin',
      table: {
        headerRows: 2,
        widths: this.FuncionColumnas(columnas),
        body: [
          this.FuncionTituloColumna(configuracion, 'titulo'),
          this.FuncionTituloColumna(configuracion, 'subtitulo'),
          ...datos.map((obj: IRestAsisteConsoli) => {
            contador = contador + 1;
            var array = [
              { style: 'itemsTable', margin: [0, 5, 0, 5], text: '1.' + contador },
              { style: 'itemsTableD', text: '2.' + obj.fecha_mostrar.split('.')[0] },
              { style: 'itemsTableD', text: '3.' + obj.fecha_mostrar.split('.')[1] },
              { style: 'itemsTable', text: '4.' + obj.E.hora_default },
              { style: 'itemsTable', text: '5.' + obj.E.hora_timbre },
              { style: 'itemsTable', text: '6.' + obj.E.descripcion },
              { style: 'itemsTable', text: '7.' + obj.S_A.hora_default },
              { style: 'itemsTable', text: '8.' + obj.S_A.hora_timbre },
              { style: 'itemsTable', text: '9.' + obj.S_A.descripcion },
              { style: 'itemsTable', text: '10.' + obj.E_A.hora_default },
              { style: 'itemsTable', text: '11.' + obj.E_A.hora_timbre },
              { style: 'itemsTable', text: '12.' + obj.E_A.descripcion },
              { style: 'itemsTable', text: '13.' + obj.S.hora_default },
              { style: 'itemsTable', text: '14.' + obj.S.hora_timbre },
              { style: 'itemsTable', text: '15.' + obj.S.descripcion },
              { style: 'itemsTable', text: '16.' + obj.atraso },
              { style: 'itemsTable', text: '17.' + obj.sal_antes },
              { style: 'itemsTable', text: '18.' + obj.almuerzo },
              { style: 'itemsTable', text: '19.' + obj.hora_trab },
              { style: 'itemsTable', text: '20.' + obj.hora_supl },
              { style: 'itemsTable', text: '21.' + obj.hora_ex_L_V },
              { style: 'itemsTable', text: '22.' + obj.hora_ex_S_D },
            ]

            let index = 0;
            let cont = 0;

            if (configuracion.atraso === false) {
              cont = 0; index = 0;
              array.forEach(ele => {
                if (ele.text.split('.')[0] === '16') { index = cont; }
                cont = cont + 1
              })
              array.splice(index, 1)
            }

            if (configuracion.salida_antes === false) {
              cont = 0; index = 0;
              array.forEach(ele => {
                if (ele.text.split('.')[0] === '17') { index = cont; }
                cont = cont + 1
              })
              array.splice(index, 1)
            }

            if (configuracion.almuerzo === false) {
              cont = 0; index = 0;
              array.forEach(ele => {
                if (ele.text.split('.')[0] === '18') { index = cont; }
                cont = cont + 1
              })
              array.splice(index, 1)
            }

            if (configuracion.h_trab === false) {
              cont = 0; index = 0;
              array.forEach(ele => {
                if (ele.text.split('.')[0] === '19') { index = cont; }
                cont = cont + 1
              })
              array.splice(index, 1)
            }

            if (configuracion.h_supl === false) {
              cont = 0; index = 0;
              array.forEach(ele => {
                if (ele.text.split('.')[0] === '20') { index = cont; }
                cont = cont + 1
              })
              array.splice(index, 1)
            }

            if (configuracion.h_ex_LV === false) {
              cont = 0; index = 0;
              array.forEach(ele => {
                if (ele.text.split('.')[0] === '21') { index = cont; }
                cont = cont + 1
              })
              array.splice(index, 1)
            }

            if (configuracion.h_ex_SD === false) {
              cont = 0; index = 0;
              array.forEach(ele => {
                if (ele.text.split('.')[0] === '22') { index = cont; }
                cont = cont + 1
              })
              array.splice(index, 1)
            }

            return array.map(maping => {
              return { style: maping.style, text: maping.text.split('.')[1] }
            })
          })
        ]
      },
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
        }
      }
    }
  }

  FuncionColumnas(columnas: number) {
    console.log('columnas -------------------', columnas);
    if (columnas <= 17) {
      var col = ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*'];
    }
    else {
      col = ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];
    }
    // console.log(col.slice(0,columnas));
    return col.slice(0, columnas);
  }

  FuncionTituloColumna(configuracion: IReporteAsistenciaConsolidada, fila: String) {
    var arrayTitulos = [
      { rowSpan: 2, text: 'Nº', style: 'tableHeader' },
      { colSpan: 5, text: 'ENTRADA', style: 'tableHeader' },
      { text: '' },
      { text: '' },
      { text: '' },
      { text: '' },
      { colSpan: 3, text: 'INICIO ALIM', style: 'tableHeader' },
      { text: '' },
      { text: '' },
      { colSpan: 3, text: 'FIN ALIM', style: 'tableHeader' },
      { text: '' },
      { text: '' },
      { colSpan: 3, text: 'SALIDA', style: 'tableHeader' },
      { text: '' },
      { text: '' },
      { rowSpan: 2, text: 'TOTAL ATRASO', style: 'tableHeaderT' },
      { rowSpan: 2, text: 'TOTAL SALIDA ANTES', style: 'tableHeaderT' },
      { rowSpan: 2, text: 'TOTAL ALIM', style: 'tableHeaderT' },
      { rowSpan: 2, text: 'TOTAL HORA TRAB', style: 'tableHeaderT' },
      { rowSpan: 2, text: 'TOTAL HORA SUPL', style: 'tableHeaderT' },
      { rowSpan: 2, text: 'TOTAL HORA EX. L-V', style: 'tableHeaderT' },
      { rowSpan: 2, text: 'TOTAL HORA EX. S-D', style: 'tableHeaderT' },
    ]

    var arraySubtitulos = [
      { text: '' },
      { text: 'DIA', style: 'tableHeaderS' },
      { text: 'FECHA', style: 'tableHeaderS' },
      { text: 'HORARIO', style: 'tableHeaderS' },
      { text: 'TIMBRE', style: 'tableHeaderS' },
      { text: 'ESTADO', style: 'tableHeaderS' },
      { text: 'HORARIO', style: 'tableHeaderS' },
      { text: 'TIMBRE', style: 'tableHeaderS' },
      { text: 'ESTADO', style: 'tableHeaderS' },
      { text: 'HORARIO', style: 'tableHeaderS' },
      { text: 'TIMBRE', style: 'tableHeaderS' },
      { text: 'ESTADO', style: 'tableHeaderS' },
      { text: 'HORARIO', style: 'tableHeaderS' },
      { text: 'TIMBRE', style: 'tableHeaderS' },
      { text: 'ESTADO', style: 'tableHeaderS' },
      { text: '' },
      { text: '' },
      { text: '' },
      { text: '' },
      { text: '' },
      { text: '' },
      { text: '' },
    ]
    let index = 0;
    let contador = 0;

    if (configuracion.atraso === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL ATRASO') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
      arraySubtitulos.splice(index, 1)
      // console.log(arraySubtitulos, 'indice ' + index);
    }

    if (configuracion.salida_antes === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL SALIDA ANTES') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
      arraySubtitulos.splice(index, 1)
      // console.log(arraySubtitulos, 'indice ***********************' + index);
    }

    if (configuracion.almuerzo === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL ALIM') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
      arraySubtitulos.splice(index, 1)
      //console.log(arraySubtitulos, 'indice ***********************' + index);
    }

    if (configuracion.h_trab === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL HORA TRAB') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
      arraySubtitulos.splice(index, 1)
      // console.log(arraySubtitulos, 'indice ***********************' + index);
    }

    if (configuracion.h_supl === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL HORA SUPL') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
      arraySubtitulos.splice(index, 1)
      //console.log(arraySubtitulos, 'indice ***********************' + index);
    }

    if (configuracion.h_ex_LV === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL HORA EX. L-V') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
      arraySubtitulos.splice(index, 1)
      //console.log(arraySubtitulos, 'indice ***********************' + index);
    }

    if (configuracion.h_ex_SD === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL HORA EXTRAS S-D') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
      arraySubtitulos.splice(index, 1)
      //console.log(arraySubtitulos, 'indice ***********************' + index);
    }
    console.log(arraySubtitulos, 'indice ' + index);
    if (fila === 'titulo') {
      return arrayTitulos
    }
    else {
      return arraySubtitulos
    }

  }


  FuncionColumnasTotal(columnas: number) {
    // console.log(columnas);
    // let col = ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];
    //let col = [17, 17, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 20, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];
    let col = ['*', 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];

    // console.log(col.slice(0,columnas));
    return col.slice(0, columnas);
  }

  CampoOperaciones(objeto: any) {
    let columnas = parseInt(sessionStorage.getItem('columnasValidasAsistencia') as string);
    let s = JSON.parse(sessionStorage.getItem('arrayConfigAsistencia') as any) as IReporteAsistenciaConsolidada;
    // console.log(objeto);
    return {
      style: 'tableMargin',
      table: {
        widths: this.FuncionColumnasTotal(columnas),
        body: [
          this.FuncionTituloColumnaTotal(s),
          //this.HorasTrabajadas(objeto.HHMM, s),
          this.FuncionHHMMTotal(objeto.HHMM, s),
          this.FuncionDecimalTotal(objeto.decimal, s)
        ]
      }
    }
  }

  FuncionTituloColumnaTotal(configuracion: IReporteAsistenciaConsolidada) {
    console.log('ver configuracion ----------------------------- ' + configuracion.atraso)

    var arrayTitulos = [
      { rowSpan: 3, colSpan: 15, text: 'TOTAL', style: 'tableTotal', margin: [0, 15, 0, 10] },
      { text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' },
      { text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' },
      { text: '' }, { text: '' }, { text: '' }, { text: '' },
      { text: 'TOTAL ATRASOS', style: 'tableHeaderT' },
      { text: 'TOTAL SALIDA ANTES', style: 'tableHeaderT' },
      { text: 'TOTAL ALIM', style: 'tableHeaderT' },
      { text: 'TOTAL HORAS TRAB', style: 'tableHeaderT' },
      { text: 'TOTAL HORAS SUPL', style: 'tableHeaderT' },
      { text: 'TOTAL HORAS EX. L-V', style: 'tableHeaderT' },
      { text: 'TOTAL HORAS EX. S-D', style: 'tableHeaderT' }
    ]

    let index = 0;
    let contador = 0;
    if (configuracion.atraso === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL ATRASOS') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
    }

    if (configuracion.salida_antes === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL SALIDA ANTES') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
    }

    if (configuracion.almuerzo === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL ALIM') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
    }

    if (configuracion.h_trab === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL HORAS TRAB') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
    }

    if (configuracion.h_supl === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL HORAS SUPL') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
    }

    if (configuracion.h_ex_LV === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL HORAS EX. L-V') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
    }

    if (configuracion.h_ex_SD === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'TOTAL HORAS EX. S-D') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
    }
    // console.log(arrayTitulos);
    return arrayTitulos
  }

  HorasTrabajadas(obj: IRestTotalAsisteConsoli, configuracion: IReporteAsistenciaConsolidada) {
    var array = [
      { style: 'itemsTable', text: '1. ' }, { style: 'itemsTable', text: '2. ' }, { style: 'itemsTable', text: '3. ' },
      { style: 'itemsTable', text: '4. ' }, { style: 'itemsTable', text: '5. ' }, { style: 'itemsTable', text: '6. ' },
      { style: 'itemsTable', text: '7. ' }, { style: 'itemsTable', text: '8. ' }, { style: 'itemsTable', text: '9. ' },
      { style: 'itemsTable', text: '10. ' }, { style: 'itemsTable', text: '11. ' }, { style: 'itemsTable', text: '12. ' },
      { style: 'itemsTable', text: '13. ' }, { style: 'itemsTable', text: '14. ' }, { style: 'itemsTable', text: '15. ' },
      { style: 'itemsTable', text: '16.' },
      { style: 'itemsTable', text: '17.' },
      { style: 'itemsTable', text: '18.' + 456 },
      { style: 'itemsTable', text: '19.' + 500 },
      { style: 'itemsTable', text: '20.' },
      { style: 'itemsTable', text: '21.' },
      { style: 'itemsTable', text: '22.' },
    ]
    let index = 0;
    let cont = 0;
    if (configuracion.atraso === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '16') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.salida_antes === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '17') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.almuerzo === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '18') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.h_trab === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '19') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.h_supl === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '20') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.h_ex_LV === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '21') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.h_ex_SD === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '22') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    return array.map(maping => {
      return { style: maping.style, text: maping.text.split('.')[1] }
    })
  }

  FuncionHHMMTotal(obj: IRestTotalAsisteConsoli, configuracion: IReporteAsistenciaConsolidada) {
    var array = [
      { style: 'itemsTable', text: '1. ' }, { style: 'itemsTable', text: '2. ' }, { style: 'itemsTable', text: '3. ' },
      { style: 'itemsTable', text: '4. ' }, { style: 'itemsTable', text: '5. ' }, { style: 'itemsTable', text: '6. ' },
      { style: 'itemsTable', text: '7. ' }, { style: 'itemsTable', text: '8. ' }, { style: 'itemsTable', text: '9. ' },
      { style: 'itemsTable', text: '10. ' }, { style: 'itemsTable', text: '11. ' }, { style: 'itemsTable', text: '12. ' },
      { style: 'itemsTable', text: '13. ' }, { style: 'itemsTable', text: '14. ' }, { style: 'itemsTable', text: '15. ' },
      { style: 'itemsTable', text: '16.' + obj.atraso },
      { style: 'itemsTable', text: '17.' + obj.sal_antes },
      { style: 'itemsTable', text: '18.' + obj.almuerzo },
      { style: 'itemsTable', text: '19.' + obj.hora_trab },
      { style: 'itemsTable', text: '20.' + obj.hora_supl },
      { style: 'itemsTable', text: '21.' + obj.hora_ex_L_V },
      { style: 'itemsTable', text: '22.' + obj.hora_ex_S_D },
    ]
    let index = 0;
    let cont = 0;
    if (configuracion.atraso === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '16') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.salida_antes === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '17') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.almuerzo === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '18') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.h_trab === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '19') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.h_supl === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '20') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.h_ex_LV === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '21') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.h_ex_SD === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('.')[0] === '22') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    return array.map(maping => {
      return { style: maping.style, text: maping.text.split('.')[1] }
    })
  }

  FuncionDecimalTotal(obj: IRestTotalAsisteConsoli, configuracion: IReporteAsistenciaConsolidada) {
    console.log('ver horas totales formato decimal ------------- ' + obj.atraso +
      '  flotante  --- ' + parseFloat(obj.atraso.toString()))
    var array = [
      { text: '1- ', style: 'itemsTable' }, { text: '2- ', style: 'itemsTable' }, { text: '3- ', style: 'itemsTable' },
      { text: '4- ', style: 'itemsTable' }, { text: '5- ', style: 'itemsTable' }, { text: '6- ', style: 'itemsTable' },
      { text: '7- ', style: 'itemsTable' }, { text: '8- ', style: 'itemsTable' }, { text: '9- ', style: 'itemsTable' },
      { text: '10- ', style: 'itemsTable' }, { text: '11- ', style: 'itemsTable' }, { text: '12- ', style: 'itemsTable' },
      { text: '13- ', style: 'itemsTable' }, { text: '14- ', style: 'itemsTable' }, { text: '15- ', style: 'itemsTable' },
      { text: '16-' + parseFloat(obj.atraso.toString()).toFixed(3), style: 'itemsTable' },
      { text: '17-' + parseFloat(obj.sal_antes.toString()).toFixed(3), style: 'itemsTable' },
      { text: '18-' + parseFloat(obj.almuerzo.toString()).toFixed(3), style: 'itemsTable' },
      { text: '19-' + parseFloat(obj.hora_trab.toString()).toFixed(3), style: 'itemsTable' },
      { text: '20-' + parseFloat(obj.hora_supl.toString()).toFixed(3), style: 'itemsTable' },
      { text: '21-' + parseFloat(obj.hora_ex_L_V.toString()).toFixed(3), style: 'itemsTable' },
      { text: '22-' + parseFloat(obj.hora_ex_S_D.toString()).toFixed(3), style: 'itemsTable' },
    ]
    let index = 0;
    let cont = 0;
    if (configuracion.atraso === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('-')[0] === '16') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.salida_antes === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('-')[0] === '17') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.almuerzo === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('-')[0] === '18') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.h_trab === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('-')[0] === '19') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.h_supl === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('-')[0] === '20') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.h_ex_LV === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('-')[0] === '21') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    if (configuracion.h_ex_SD === false) {
      cont = 0;
      array.forEach(ele => {
        if (ele.text.split('-')[0] === '22') { index = cont; }
        cont = cont + 1
      })
      array.splice(index, 1)
    }

    return array.map(maping => {
      return { style: maping.style, text: maping.text.split('-')[1] }
    })
  }

  /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  exportToExcelAsistencia(id_empleado: number) {
    this.asistencia = [];
    this.restKardex.ReporteAsistenciaDetalleConsolidado(id_empleado, '2021-08-01', '2021-08-31').subscribe(res => {
      console.log(this.asistencia);
      if (res.message) {
        this.toastr.error(res.message, '', {
          timeOut: 6000,
        });
      } else {
        this.asistencia = res;
        console.log(this.asistencia);
        const wsd: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.asistencia.detalle.map(obj => {
          return {
            fecha: obj.fecha_mostrar,
            E_h_default: obj.E.hora_default,
            E_h_timbre: obj.E.hora_timbre,
            E_descripcion: obj.E.descripcion,
            S_A_h_default: obj.S_A.hora_default,
            S_A_h_timbre: obj.S_A.hora_timbre,
            S_A_descripcion: obj.S_A.descripcion,
            E_A_h_default: obj.E_A.hora_default,
            E_A_h_timbre: obj.E_A.hora_timbre,
            E_A_descripcion: obj.E_A.descripcion,
            S_h_default: obj.S.hora_default,
            S_h_timbre: obj.S.hora_timbre,
            S_descripcion: obj.S.descripcion,
            atraso: obj.atraso,
            sal_antes: obj.sal_antes,
            almuerzo: obj.almuerzo,
            hora_trab: obj.hora_trab,
            hora_supl: obj.hora_supl,
            hora_ex_L_V: obj.hora_ex_L_V,
            hora_ex_S_D: obj.hora_ex_S_D,
          }
        }));
        const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.asistencia.empleado);
        const wso: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.asistencia.operaciones.map(obj => {
          return {
            HHMM_atraso: obj.HHMM.atraso,
            HHMM_sal_antes: obj.HHMM.sal_antes,
            HHMM_almuerzo: obj.HHMM.almuerzo,
            HHMM_hora_trab: obj.HHMM.hora_trab,
            HHMM_hora_supl: obj.HHMM.hora_supl,
            HHMM_hora_ex_L_V: obj.HHMM.hora_ex_L_V,
            HHMM_hora_ex_S_D: obj.HHMM.hora_ex_S_D,
            decimal_atraso: obj.decimal.atraso.toString().slice(0, 8),
            decimal_sal_antes: obj.decimal.sal_antes.toString().slice(0, 8),
            decimal_almuerzo: obj.decimal.almuerzo.toString().slice(0, 8),
            decimal_hora_trab: obj.decimal.hora_trab.toString().slice(0, 8),
            decimal_hora_supl: obj.decimal.hora_supl.toString().slice(0, 8),
            decimal_hora_ex_L_V: obj.decimal.hora_ex_L_V.toString().slice(0, 8),
            decimal_hora_ex_S_D: obj.decimal.hora_ex_S_D.toString().slice(0, 8),
          }
        }));
        const wb: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, wsd, 'Detalle');
        xlsx.utils.book_append_sheet(wb, wse, 'Empleado');
        xlsx.utils.book_append_sheet(wb, wso, 'Operaciones');
        xlsx.writeFile(wb, "Asistencia - " + this.asistencia.empleado.nombre + '.xlsx');

      }

    })
  }

  /**
   * METODOS PARA CONTROLAR INGRESO DE LETRAS
   */

  IngresarSoloLetras(e) {
    this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt) {
    this.validar.IngresarSoloNumeros(evt);
  }

  limpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.filtroEmpleado = '';
  }

  limpiarCamposRango() {
    this.fechasForm.reset();
    this.habilitar = false;
    this.estilo = { 'visibility': 'hidden' };
  }


}