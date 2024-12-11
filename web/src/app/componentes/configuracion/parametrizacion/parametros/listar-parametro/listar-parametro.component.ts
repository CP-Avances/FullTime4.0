// SECCION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';

import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';
import ExcelJS, { FillPattern } from "exceljs";

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

@Component({
  selector: 'app-listar-parametro',
  templateUrl: './listar-parametro.component.html',
  styleUrls: ['./listar-parametro.component.css']
})

export class ListarParametroComponent implements OnInit {
  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;
  tipoPermiso: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    descripcionForm: this.descripcionF,
  });

  constructor(
    public restE: EmpleadoService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public restEmpre: EmpresaService,
    private restP: ParametrosService,

  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerParametros();
    this.ObtenerColores();
    this.ObtenerLogo();
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

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
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

  // EVENTO PARA MANEJAR PAGINACIÓN EN TABLAS
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA LISTAR PARÁMETROS
  parametros: any = [];
  ObtenerParametros() {
    this.parametros = [];
    this.numero_pagina = 1;
    this.restP.ListarParametros().subscribe(datos => {
      datos.sort((a: any, b: any) => a.id - b.id);
      this.parametros = datos;
      this.ObtenerDetallesParametro();
    });
  }

  // METOOD PARA OBTENER DETALLES DE PARAMETROS
  detalles: any = [];
  ObtenerDetallesParametro() {
    this.detalles = [];
    this.restP.BuscarDetallesParametros().subscribe(datos => {
      datos.sort((a: any, b: any) => a.id - b.id);
      this.detalles = datos;
      this.parametros.forEach((parametro: any) => {
        parametro.detalles = this.detalles.filter((detalle: any) => detalle.id_parametro === parametro.id);
      });
    });
  }

  // METODO PARA LIMPIAR CAMPO DE BUSQUEDA
  LimpiarCampos() {
    this.formulario.setValue({
      descripcionForm: '',
    });
    this.ObtenerParametros();
  }

  // METODO PARA VER DETALLE DE PARAMETROS
  ver_lista: boolean = true;
  ver_detalle: boolean = false;
  parametro_id: string
  VerDetalleParametro(id: number) {
    this.ver_detalle = true;
    this.ver_lista = false;
    this.parametro_id = String(id);
  }

  /** ************************************************************************************************** **
   ** **                                 METODO PARA EXPORTAR A PDF                                   ** **
   ** ************************************************************************************************** **/


  async GenerarPdf(action = 'open') {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Parametros_generales' + '.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: 'portrait',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
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
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'PARÁMETROS GENERALES', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.PresentarDataPDF(),
      ],
      styles: {
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
        itemsTableInfo: { fontSize: 9, margin: [0, -1, 0, -1], fillColor: this.p_color },
        tableMargin: { margin: [0, 5, 0, 0] },
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
      }
    };
  }

  // METODO PARA PRESENTAR DATOS DEL DOCUMENTO PDF
  PresentarDataPDF(): Array<any> {
    let n: any = []
    this.parametros.forEach((obj: any) => {
      n.push({
        style: 'tableMarginCabecera',
        table: {
          widths: ['*'],
          headerRows: 1,
          body: [
            [
              { text: `PARÁMETRO: ${obj.descripcion}`, style: 'itemsTableInfo', border: [true, true, true, true] },
            ],
          ]
        },
      });
      if (obj.detalles.length > 0) {
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['auto', '*', '*'],
            headerRows: 1,
            body: [
              [
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'DETALLE', style: 'tableHeader' },
                { text: 'DESCRIPCIÓN', style: 'tableHeader' },
              ],
              ...obj.detalles.map((detalle: any) => {
                return [
                  { text: detalle.id, style: 'itemsTableCentrado' },
                  { text: detalle.descripcion, style: 'itemsTableCentrado' },
                  { text: detalle.observacion, style: 'itemsTableCentrado' },
                ];
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
    });
    return n;
  }


  /** ************************************************************************************************* **
   ** **                                 METODO PARA EXPORTAR A EXCEL                                ** **
   ** ************************************************************************************************* **/
  async generarExcelParametros() {

    const parametroslista: any[] = [];
    let n: number = 1;

    this.parametros.forEach((obj: any) => {
      obj.detalles.forEach((det: any) => {
        parametroslista.push([
          n++,
          obj.descripcion,
          det.descripcion,
          det.observacion
        ]);
      });
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Parametros");


    console.log("ver logo. ", this.logo)
    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });
    // COMBINAR CELDAS
    worksheet.mergeCells("B1:K1");
    worksheet.mergeCells("B2:K2");
    worksheet.mergeCells("B3:K3");
    worksheet.mergeCells("B4:K4");
    worksheet.mergeCells("B5:K5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = "Lista de Parámetros Generales".toUpperCase();

    // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
    ["B1", "B2"].forEach((cell) => {
      worksheet.getCell(cell).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(cell).font = { bold: true, size: 14 };
    });


    worksheet.columns = [
      { key: "n", width: 10 },
      { key: "parametro", width: 20 },
      { key: "detalle", width: 20 },
      { key: "descripcion", width: 40 },
    ];


    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "PARÁMETRO", totalsRowLabel: "Total:", filterButton: true },
      { name: "DETALLE", totalsRowLabel: "", filterButton: true },
      { name: "DESCRIPCIÓN", totalsRowLabel: "", filterButton: true },
    ];

    worksheet.addTable({
      name: "ParametrosTabla",
      ref: "A6",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium16",
        showRowStripes: true,
      },
      columns: columnas,
      rows: parametroslista,
    });


    const numeroFilas = parametroslista.length;
    for (let i = 0; i <= numeroFilas; i++) {
      for (let j = 1; j <= 4; j++) {
        const cell = worksheet.getRow(i + 6).getCell(j);
        if (i === 0) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = {
            vertical: "middle",
            horizontal: this.obtenerAlineacionHorizontalEmpleados(j),
          };
        }
        cell.border = this.bordeCompleto;
      }
    }
    worksheet.getRow(6).font = this.fontTitulo;

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      FileSaver.saveAs(blob, "ParametrosGeneralesEXCEL.xlsx");
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
    }
  }

  private obtenerAlineacionHorizontalEmpleados(
    j: number
  ): "left" | "center" | "right" {
    if (j === 1 || j === 9 || j === 10 || j === 11) {
      return "center";
    } else {
      return "left";
    }
  }


  /** ************************************************************************************************* **
   ** **                               METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************* **/
  ExportToCSV() {
    // 1. Crear un nuevo workbook
    const workbook = new ExcelJS.Workbook();
    let n: number = 1;

    // 2. Crear una hoja en el workbook
    const worksheet = workbook.addWorksheet('ParametrosGeneralesCSV');
    // 3. Agregar encabezados de las columnas
    worksheet.columns = [
      { header: 'n', key: 'n', width: 10 },
      { header: 'parametro', key: 'parametro', width: 30 },
      { header: 'detalle', key: 'detalle', width: 15 },
      { header: 'descripcion', key: 'descripcion', width: 15 }
    ];
    // 4. Llenar las filas con los datos
    this.parametros.forEach((obj: any) => {
      obj.detalles.forEach((det: any) => {
        worksheet.addRow({
          n: n++,
          parametro: obj.descripcion,
          detalle: det.descripcion,
          descripcion: det.observacion
        }).commit();
      })
    });
    // 5. Escribir el CSV en un buffer
    workbook.csv.writeBuffer().then((buffer) => {
      // 6. Crear un blob y descargar el archivo
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "ParametrosGeneralesCSV.csv");
    });
  }

  /** ************************************************************************************************* **
   ** **                           PARA LA EXPORTACION DE ARCHIVOS XML                                ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    var objeto: any;
    var arregloHorarios: any = [];
    this.parametros.forEach((obj: any) => {
      let detalles: any = [];
      obj.detalles.forEach((det: any) => {
        detalles.push({
          "$": { "id": det.id },
          "detalle": det.descripcion,
          "descripcion": det.observacion
        });
      });
      objeto = {
        "parametro": {
          "$": { "codigo": obj.id },
          "nombre": obj.descripcion,
          "detalles": { "detalle": detalles }
        }
      }
      arregloHorarios.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'ParametrosGenerales' });
    const xml = xmlBuilder.buildObject(arregloHorarios);

    if (xml === undefined) {
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // ABRIR UNA NUEVA PESTAÑA O VENTANA CON EL CONTENIDO XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // EVITAR QUE LA NUEVA PESTAÑA TENGA ACCESO A LA VENTANA PADRE
      newTab.focus(); // DAR FOCO A LA NUEVA PESTAÑA
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'ParametrosGenerales.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }

}
