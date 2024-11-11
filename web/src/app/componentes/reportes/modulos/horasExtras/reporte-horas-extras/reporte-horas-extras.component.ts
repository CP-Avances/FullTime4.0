import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';

import { PlantillaReportesService } from '../../../plantilla-reportes.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { KardexService } from 'src/app/servicios/reportes/kardex.service';

import { ConfigReportFirmasHorasExtrasComponent } from '../../../configuracion-reportes/config-report-firmas-horas-extras/config-report-firmas-horas-extras.component';

@Component({
  selector: 'app-reporte-horas-extras',
  templateUrl: './reporte-horas-extras.component.html',
  styleUrls: ['./reporte-horas-extras.component.css']
})
export class ReporteHorasExtrasComponent implements OnInit {

  fec_inicia: string = '2021-12-01';
  fec_fin: string = '2021-12-31';
  horas_extras: any;

  Lista_empleados: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  /**
  * Variables Tabla de datos
  */
  dataSource: any;
  filtroEmpleados = '';

  idEmpleado: number;
  empleadoD: any = [];
  frase = 'reporte';
  // Getters de colores, nombre empresa y logo para colocar en reporte
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get urlImagen(): string { return this.plantillaPDF.logoBase64 }
  get nombreEmpresa(): string { return this.plantillaPDF.nameEmpresa }

  constructor(
    private restEmpleado: EmpleadoService,
    private restReporte: KardexService,
    private toastr: ToastrService,
    private plantillaPDF: PlantillaReportesService,
    public vistaFlotante: MatDialog,
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);

    this.ObtenerEmpleados();
    this.ObtenerEmpleadoSolicitaKardex(this.idEmpleado);
  }

  firma_jefe: boolean = true;
  firma_resp: boolean = false;
  firma_empl: boolean = false;
  AbrirSettings() {
    this.vistaFlotante.open(ConfigReportFirmasHorasExtrasComponent, { width: '350px' }).afterClosed().subscribe(res => {
      this.toastr.success('Configuración de Firmas guardada')
      let data = JSON.parse(sessionStorage.getItem('Firmas_hora_extra') as any);
      console.log(data);
      this.firma_jefe = data.firma_jefe;
      this.firma_resp = data.firma_resp;
      this.firma_empl = data.firma_empl;
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  ObtenerEmpleados() {
    this.dataSource = new MatTableDataSource(JSON.parse(sessionStorage.getItem('lista-empleados') as any));
    this.Lista_empleados = this.dataSource.data;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtroEmpleados = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // METODO para ver la informacion del empleado
  ObtenerEmpleadoSolicitaKardex(idemploy: any) {
    this.empleadoD = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoD = data;
    });

  }

  ObtenerReporte(id_empleado, palabra: string) {
    this.restReporte.ReporteHorasExtras(id_empleado, this.fec_inicia, this.fec_fin).subscribe(res => {
      console.log(res);
      this.horas_extras = res
      this.GenerarPdf(palabra, 2)

    }, err => {
      console.log(err);
      this.toastr.error(err.error.message)
    });
  }

  /* ****************************************************************************************************
 *                               PARA LA EXPORTACION DE ARCHIVOS PDF
 * ****************************************************************************************************/
  fechaHoy: string;


  async GenerarPdf(action = 'open', pdf: number) {
    let documentDefinition;
    const pdfMake = await this.validar.ImportarPDF();
    if (pdf === 2) {
      documentDefinition = this.getDocumentHorasExtras();
    }
    let name_document = 'reporte horas extras'
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(name_document); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  /**********************************************
    *  METODOS PARA IMPRIMIR REPORTE DE HORAS EXTRAS
    **********************************************/
  getDocumentHorasExtras() {
    var f = new Date();
    f.setUTCHours(f.getHours())
    this.fechaHoy = f.toJSON();
    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [25, 60, 25, 40],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoD[0].nombre + ' ' + this.empleadoD[0].apellido, margin: 10, fontSize: 9, opacity: 0.3 },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        fecha = f.toJSON().split("T")[0];
        var timer = f.toJSON().split("T")[1].slice(0, 5);
        return {
          margin: 10,
          columns: [
            'Fecha: ' + fecha + ' Hora: ' + timer,
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right', color: 'blue', opacity: 0.5
                }
              ],
            }
          ],
          fontSize: 10,
          color: '#A4B8FF',
        }
      },
      content: [
        {
          columns: [
            {
              image: this.urlImagen,
              width: 100,
              margin: [0, -25, 0, 0]
            },
            {
              width: '*',
              text: this.nombreEmpresa,
              bold: true,
              fontSize: 20,
              alignment: 'center',
              margin: [-100, -15, 0, 0],
            }
          ]
        },
        {
          style: 'subtitulos',
          text: 'Reporte Horas Extras'
        },
        this.ImpresionInformacion(this.horas_extras.info[0]),
        this.ImpresionDetalle(this.horas_extras.detalle),
        this.ImprimirTotal(this.horas_extras.total),
        this.ImprimirFirmas(this.horas_extras.info[0])
      ],
      styles: {
        tableHeaderDetalle: { bold: true, alignment: 'center', fillColor: this.p_color, fontSize: 9, margin: [0, 3, 0, 3] },
        itemsTableDetalle: { fontSize: 8, margin: [0, 3, 0, 3] },
        subtitulos: { fontSize: 16, alignment: 'center', margin: [0, 5, 0, 10] },
        tableTotal: { fontSize: 15, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 5, 0, 8] },
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, margin: [0, 3, 0, 3] },
        itemsTableInfo: { fontSize: 10, margin: [0, 5, 0, 5] },
        tableMargin: { margin: [0, 20, 0, 0] },
        MarginTable: { margin: [0, 10, 0, 10] },
        CabeceraTabla: { fontSize: 12, alignment: 'center', margin: [0, 8, 0, 8], fillColor: this.p_color },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  ImpresionInformacion(e: any) {
    return {
      table: {
        widths: ['*', 'auto', 'auto'],
        body: [
          [
            { colSpan: 3, text: 'INFORMACIÓN GENERAL EMPLEADO', style: 'CabeceraTabla' },
            '', ''
          ],
          [
            {
              border: [true, true, false, true],
              bold: true,
              text: 'PERIODO DEL: ' + DateTime.fromFormat('2020/12/01', 'yyyy/MM/dd').toFormat('dd/MM/yyyy') + ' AL ' + DateTime.fromFormat('2020/12/31', 'yyyy/MM/dd').toFormat('dd/MM/yyyy'),
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, false, true],
              text: 'CIUDAD: ' + 'Quito',
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, true, true],
              text: 'N° REGISTROS: ' + this.horas_extras.detalle.length,
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
          ],
          [
            {
              border: [true, true, false, true],
              text: 'SUELDO: ' + e.sueldo,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, false, true],
              text: 'HORAS TRABAJADAS EN EL DÍA: ' + e.hora_trabaja,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, true, true],
              text: ' ',
              style: 'itemsTableInfo'
            }
          ]
        ]
      }
    }
  }

  ImpresionDetalle(datosRest: any[]) {
    let contador = 0;
    return {
      style: 'MarginTable',
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          this.FuncionTituloColumna(),
          ...datosRest.map((obj) => {
            contador = contador + 1;
            var array = [
              { style: 'itemsTableDetalle', text: contador },
              { style: 'itemsTableDetalle', text: obj.descripcion },
              { style: 'itemsTableDetalle', text: obj.fec_inicio.split('T')[0] },
              { style: 'itemsTableDetalle', text: obj.fec_inicio.split('T')[1].split('.')[0] },
              { style: 'itemsTableDetalle', text: obj.fec_final.split('T')[0] },
              { style: 'itemsTableDetalle', text: obj.fec_final.split('T')[1].split('.')[0] },
              { style: 'itemsTableDetalle', text: obj.total_horas },
              { style: 'itemsTableDetalle', text: obj.porcentaje },
              { style: 'itemsTableDetalle', text: obj.valor_recargo.toString().slice(0, 6) },
              { style: 'itemsTableDetalle', text: obj.valor_hora_total },
              { style: 'itemsTableDetalle', text: obj.valor_pago }
            ]
            return array
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

  FuncionTituloColumna() {
    var arrayTitulos = [
      { text: 'N°', style: 'tableHeaderDetalle' },
      { text: 'Descripcion', style: 'tableHeaderDetalle' },
      { text: 'Fecha Inicio', style: 'tableHeaderDetalle' },
      { text: 'Hora Inicio', style: 'tableHeaderDetalle' },
      { text: 'Fecha Final', style: 'tableHeaderDetalle' },
      { text: 'Hora Final', style: 'tableHeaderDetalle' },
      { text: 'Horas', style: 'tableHeaderDetalle' },
      { text: 'Porcentaje', style: 'tableHeaderDetalle' },
      { text: 'Valor recargo', style: 'tableHeaderDetalle' },
      { text: 'Valor hora', style: 'tableHeaderDetalle' },
      { text: 'Valor a pagar', style: 'tableHeaderDetalle' }
    ]

    return arrayTitulos
  }

  ImprimirTotal(t: any) {

    var arrayTitulos = [
      { text: 'VALOR HORAS EXTRAS: $ ' + t.total_pago_hx, style: 'tableTotal' },
      { text: 'TOTAL SUELDO: $ ' + t.total_sueldo, style: 'tableTotal' },
    ]

    return arrayTitulos
  }

  ImprimirFirmas(e: any) {
    let n: any = [
      {
        columns: []
      }
    ];
    let nombreJefe = this.empleadoD[0].nombre + ' ' + this.empleadoD[0].apellido
    if (this.firma_jefe === true) {
      n[0].columns.push(
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              layout: 'lightHorizontalLines',
              table: {
                widths: ['auto'],
                body: [
                  [{ text: 'AUTORIZADO', style: 'tableHeaderA' }],
                  [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] }],
                  [{ text: nombreJefe + '\n' + 'GERENTE', style: 'itemsTable' }]
                ]
              }
            },
            { width: '*', text: '' },
          ]
        }
      )
    }

    if (this.firma_resp === true) {
      n[0].columns.push(
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              layout: 'lightHorizontalLines',
              table: {
                widths: ['auto'],
                body: [
                  [{ text: 'RESPONSABLE', style: 'tableHeaderA' }],
                  [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] }],
                  [{ text: 'Alejandra Cortez' + '\n' + 'RRHH', style: 'itemsTable' }]
                ]
              }
            },
            { width: '*', text: '' },
          ]
        }
      )
    }

    if (this.firma_empl === true) {
      n[0].columns.push(
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              layout: 'lightHorizontalLines',
              table: {
                widths: ['auto'],
                body: [
                  [{ text: 'EMPLEADO', style: 'tableHeaderA' },],
                  [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] }],
                  [{ text: e.nombre + '\n' + 'Asistente', style: 'itemsTable' }]
                ]
              }
            },
            { width: '*', text: '' },
          ]
        }
      )
    }

    return n
  }

}
