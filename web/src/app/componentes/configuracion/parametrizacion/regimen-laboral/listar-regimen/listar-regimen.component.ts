// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { DateTime } from 'luxon';
import { Router } from "@angular/router";
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import * as xml2js from 'xml2js';
import * as FileSaver from "file-saver";
import ExcelJS, { FillPattern } from "exceljs";

// IMPORTAR COMPONENTES
import { MetodosComponent } from "src/app/componentes/generales/metodoEliminar/metodos.component";

// IMPORTAR SERVICIOS
import { PlantillaReportesService } from "src/app/componentes/reportes/plantilla-reportes.service";
import { EmpleadoService } from "src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service";
import { RegimenService } from 'src/app/servicios/configuracion/parametrizacion/catRegimen/regimen.service';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableRegimen } from 'src/app/model/reportes.model';
import { ValidacionesService } from "src/app/servicios/generales/validaciones/validaciones.service";

@Component({
  selector: "app-listar-regimen",
  standalone: false,
  templateUrl: "./listar-regimen.component.html",
  styleUrls: ["./listar-regimen.component.css"],
})

export class ListarRegimenComponent implements OnInit {
  ips_locales: any = '';

  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;

  regimenesEliminar: any = [];

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl("");

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    descripcionForm: this.descripcionF,
  });

  // ALMACENAMIENTO DE DATOS CONSULTADOS
  empleado: any = [];
  regimen: any = [];
  rangos_antiguedad: any = [];
  periodos_vacacionales: any =[];

  idEmpleado: number; // VARIABLE QUE ALMACENA EL ID DEL EMPELADO QUE INICIA SESIÓN

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string {
    return this.plantillaPDF.color_Secundary;
  }
  get p_color(): string {
    return this.plantillaPDF.color_Primary;
  }
  get frase(): string {
    return this.plantillaPDF.marca_Agua;
  }
  get logo(): string {
    return this.plantillaPDF.logoBase64;
  }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE DE USO DE MENSAJES DE NOTIFICACIONES
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private rest: RegimenService, // SERVICIO DE DATOS DE REGIMEN
    public router: Router, // VARIABLE DE NAVEGACION DE PAGINAS CON URL
    public ventana: MatDialog, // VARIABLE MANEJO DE VENTANAS
    public validar: ValidacionesService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem("empleado") as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerRegimen();
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
    this.restE.BuscarUnEmpleado(idemploy).subscribe((data) => {
      this.empleado = data;
    });
  }

  // EVENTO PARA MANEJAR VISTA DE FILAS DETERMINADAS DE TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // LECTURA DE DATOS
  ObtenerRegimen() {
    this.regimen = [];
    this.numero_pagina = 1;
    this.rest.ConsultarRegimen().subscribe((datos) => {
      this.regimen = datos;

      this.ObtenerTodasLasAntiguedades();
      this.ObtenerTodosLosPeriodosVacacionales();
    });
  }

  // LECTURA DE ANTIGUEDAD
  ObtenerTodasLasAntiguedades() {
    this.rangos_antiguedad = [];

    this.regimen.forEach((reg) => {
      if (reg.antiguedad_variable) {
        this.rest.ConsultarAntiguedad(reg.id).subscribe(
          (data) => {
            this.rangos_antiguedad.push({
              id_regimen: reg.id,
              rangos: data
            });
          },
          () => {
            this.rangos_antiguedad.push({
              id_regimen: reg.id,
              rangos: []
            });
          }
        );
      } else {
        this.rangos_antiguedad.push({
          id_regimen: reg.id,
          rangos: []
        });
      }
    });
  }

  // LECTURA DE VACASIONES POR PERIODO
  ObtenerTodosLosPeriodosVacacionales() {
    this.periodos_vacacionales = [];

    this.regimen.forEach((reg) => {
      if (reg.vacacion_divisible) {
        this.rest.ConsultarUnPeriodo(reg.id).subscribe(
          (data) => {
            this.periodos_vacacionales.push({
              id_regimen: reg.id,
              periodos: data
            });
          },
          () => {
            this.periodos_vacacionales.push({
              id_regimen: reg.id,
              periodos: []
            });
          }
        );
      } else {
        this.periodos_vacacionales.push({
          id_regimen: reg.id,
          periodos: []
        });
      }
    });
  }


  // ORDENAR LOS DATOS SEGÚN EL ID
  OrdenarDatos(array: any) {
    function compare(a: any, b: any) {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    }
    array.sort(compare);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.setValue({
      descripcionForm: "",
    });
    this.ObtenerRegimen();
  }

  /** ********************************************************************************* **
   ** **          VENTANAS PARA REGISTRAR Y EDITAR DATOS DE UN REGIMEN LABORAL       ** **
   ** ********************************************************************************* **/

  // METODO PARA ABRIR FORMULARIO REGISTRAR
  ver_lista: boolean = true;
  ver_registrar: boolean = false;
  AbrirRegistrar() {
    this.ver_lista = false;
    this.ver_registrar = true;
    this.ObtenerRegimen();
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionRegimen.clear();
    this.regimenesEliminar = [];
  }

  // METODO PARA VER DATOS DE REGIMEN LABORAL
  ver_datos: boolean = false;
  regimen_id: number;
  VerDatosRegimen(id: number) {
    this.ver_lista = false;
    this.ver_datos = true;
    this.regimen_id = id;
  }

  // METODO PARA ABRIR FORMULARIO EDITAR
  ver_editar: boolean = false;
  pagina: string = '';
  AbrirEditar(id: number) {
    this.ver_lista = false;
    this.ver_editar = true;
    this.pagina = 'lista-regimen';
    this.regimen_id = id;
  }

  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS PDF                           ** **
   ** ************************************************************************************************* **/


  // METODO PARA GENERAR ARCHIVO PDF
  async GenerarPdf(action = "open") {
    this.OrdenarDatos(this.regimen);
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case "open":
        pdfMake.createPdf(documentDefinition).open();
        break;
      case "print":
        pdfMake.createPdf(documentDefinition).print();
        break;
      case "download":
        pdfMake.createPdf(documentDefinition).download('Regimen_laboral' + '.pdf');
        break;
      default:
        pdfMake.createPdf(documentDefinition).open();
        break;
    }
    this.ObtenerRegimen();
  }

  DefinirInformacionPDF() {

    return {
      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: "landscape",
      watermark: {
        text: this.frase,
        color: "blue",
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      header: {
        text:
          "Impreso por:  " +
          this.empleado[0].nombre +
          " " +
          this.empleado[0].apellido,
        margin: 10,
        fontSize: 9,
        opacity: 0.3,
        alignment: "right",
      },
      // PIE DE PAGINA
      footer: function (
        currentPage: any,
        pageCount: any,
        fecha: any,
        hora: any
      ) {
        let f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: "Fecha: " + fecha + " Hora: " + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: "© Pag " + currentPage.toString() + " of " + pageCount,
                  alignment: "right",
                  opacity: 0.3,
                },
              ],
            },
          ],
          fontSize: 10,
        };
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'RÉGIMEN LABORAL', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.PresentarDataPDF(),
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoHorario: { fontSize: 9, margin: [0, -1, 0, -1], fillColor: this.p_color },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraHorario: { margin: [0, 7, 0, 0] },
      },
    };
  }

  PresentarDataPDF(): Array<any> {
    const bloques: any[] = [];
    this.regimen.forEach((obj: any) => {
      const rangos = this.rangos_antiguedad.find(r => r.id_regimen === obj.id)?.rangos || [];
      const periodos = this.periodos_vacacionales.find(p => p.id_regimen === obj.id)?.periodos || [];
      
      // BLOQUE 1 – INFORMACION GENERAL
      bloques.push({
        style: 'tableMarginCabeceraHorario',
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: `PAÍS: ${obj.pais}`, style: 'itemsTableInfoHorario', border: [true, true, false, false] },
              { text: `RÉGIMEN: ${obj.descripcion}`, style: 'itemsTableInfoHorario', border: [false, true, false, false] },
              { text: `CONTINUIDAD LABORAL: ${obj.continuidad_laboral ? 'SI' : 'NO'}`, style: 'itemsTableInfoHorario', border: [false, true, false, false] },
              { text: `CÓDIGO: ${obj.id}`, style: 'itemsTableInfoHorario', border: [false, true, true, false] }
            ],
            [
              { text: `PERIODO LABORAL: ${obj.mes_periodo}`+' Meses', style: 'itemsTableInfoHorario', border: [true, false, false, true] },
              { text: `DÍAS POR MES: ${obj.dias_mes}`, style: 'itemsTableInfoHorario', border: [false, false, false, true] },
              {
                text: `TIEMPO MÍNIMO: ${obj.trabajo_minimo_mes > 0 ? obj.trabajo_minimo_mes + ' Meses' : obj.trabajo_minimo_horas + ' Horas'}`,
                style: 'itemsTableInfoHorario',
                border: [false, false, false, true]
              },
              { text: `ANTIGÜEDAD LABORAL: ${obj.antiguedad ? 'SI' : 'NO'}`, style: 'itemsTableInfoHorario', border: [false, false, true, true] }
            ]
          ]
        }
      });
  
      // BLOQUES 
      bloques.push({
        columns: [
          // BLOQUE 2 – CONFIGURACION DE VACACIONES
          {
            width: '33%',
            stack: [
              {
                table: {
                  widths: ['*'],
                  body: [
                    [{ text: 'CONFIGURACIÓN DE VACACIONES', style: 'itemsTableInfoHorario', alignment: 'center', border: [true, true, true, true] }]
                  ]
                },
                style: 'tableMarginCabeceraHorario'
              },
              {
                style: 'tableMargin',
                table: {
                  widths: ['60%', '40%'],
                  body: [
                    [{ text: 'DÍAS HÁBILES', style: 'tableHeader' }, { text: obj.vacacion_dias_laboral, style: 'itemsTableCentrado' }],
                    [{ text: 'DÍAS LIBRES', style: 'tableHeader' }, { text: obj.vacacion_dias_libre, style: 'itemsTableCentrado' }],
                    [{ text: 'DÍAS CALENDARIO', style: 'tableHeader' }, { text: obj.vacacion_dias_calendario, style: 'itemsTableCentrado' }],
                    [{ text: 'ACUMULA VACACIONES', style: 'tableHeader' }, { text: obj.acumular ? 'SI' : 'NO', style: 'itemsTableCentrado' }],
                    ...(obj.acumular
                      ? [[{ text: 'MÁXIMO DÍAS ACUMULABLES', style: 'tableHeader' }, { text: obj.dias_maximo_acumulacion, style: 'itemsTableCentrado' }]]
                      : []),
                    [{ text: 'VACACIONES POR PERÍODOS', style: 'tableHeader' }, { text: obj.vacacion_divisible ? 'SI' : 'NO', style: 'itemsTableCentrado' }],
                    ...(obj.vacacion_divisible
                      ? (
                          periodos.length > 0
                          ? periodos.map((p: any) => [
                              { text: p.descripcion, style: 'tableHeader' },
                              { text: `${p.dias_vacacion} días`, style: 'itemsTableCentrado' }
                            ])
                          : [[{ colSpan: 2, text: 'NO DEFINIDO', style: 'itemsTableCentrado' }, {}]]
                        )
                      : [])
                    
                  ]
                },
                layout: {
                  fillColor: (i) => (i % 2 === 0 ? '#E8F6F3' : null)
                }
              }
            ]
          },
  
          // BLOQUE 3 – VACACIONES GANADAS
          {
            width: '34%',
            stack: [
              {
                table: {
                  widths: ['*'],
                  body: [
                    [{ text: 'VACACIONES GANADAS', style: 'itemsTableInfoHorario', alignment: 'center', border: [true, true, true, true] }]
                  ]
                },
                style: 'tableMarginCabeceraHorario'
              },
              {
                style: 'tableMargin',
                table: {
                  widths: ['70%', '30%'],
                  body: [
                    [{ text: 'POR MES (HÁBILES)', style: 'tableHeader' }, { text: obj.vacacion_dias_laboral_mes, style: 'itemsTableCentrado' }],
                    [{ text: 'POR MES (CALEND.)', style: 'tableHeader' }, { text: obj.vacacion_dias_calendario_mes, style: 'itemsTableCentrado' }],
                    [{ text: 'POR DÍA (HÁBILES)', style: 'tableHeader' }, { text: obj.laboral_dias, style: 'itemsTableCentrado' }],
                    [{ text: 'POR DÍA (CALEND.)', style: 'tableHeader' }, { text: obj.calendario_dias, style: 'itemsTableCentrado' }]
                  ]
                },
                layout: {
                  fillColor: (i) => (i % 2 === 0 ? '#EBF5FB' : null)
                }
              }
            ]
          },

          // BLOQUE 4 – CONDIGURACION DE ANTIGUEDAD
          {
            width: '33%',
            stack: [
              {
                table: {
                  widths: ['*'],
                  body: [
                    [{ text: 'CONFIGURACIÓN DE ANTIGÜEDAD', style: 'itemsTableInfoHorario', alignment: 'center', border: [true, true, true, true] }]
                  ]
                },
                style: 'tableMarginCabeceraHorario'
              },
              {
                style: 'tableMargin',
                table: {
                  widths: ['60%', '40%'],
                  body:
                  obj.antiguedad_fija
                    ? [
                        [{ text: 'TIPO', style: 'tableHeader' }, { text: 'FIJA', style: 'itemsTableCentrado' }],
                        [{ text: 'AÑOS ANTIGÜEDAD', style: 'tableHeader' }, { text: obj.anio_antiguedad, style: 'itemsTableCentrado' }],
                        [{ text: 'DÍAS ADICIONALES', style: 'tableHeader' }, { text: obj.dias_antiguedad, style: 'itemsTableCentrado' }]
                      ]
                    : obj.antiguedad_variable
                      ? [
                          [{ text: 'TIPO', style: 'tableHeader' }, { text: 'VARIABLE', style: 'itemsTableCentrado' }],
                          ...(rangos.length > 0
                            ? rangos.map((r: any) => [
                                { text: `Desde ${r.anio_desde} hasta ${r.anio_hasta}`, style: 'tableHeader' },
                                { text: `${r.dias_antiguedad} días`, style: 'itemsTableCentrado' }
                              ])
                            : [[{ colSpan: 2, text: 'NO DEFINIDO', style: 'itemsTableCentrado' }, {}]])
                        ]
                      : [[{ colSpan: 2, text: 'NO APLICA', style: 'itemsTableCentrado' }, {}]]

                },
                layout: {
                  fillColor: (i) => (i % 2 === 0 ? '#FDEDEC' : null)
                }
              }
            ]
          }
        ]
      });
    });
  
    return bloques;
  }

  /** ************************************************************************************************* **
   ** **                             PARA LA EXPORTACION DE ARCHIVOS EXCEL                           ** **
   ** ************************************************************************************************* **/

  async generarExcelRegimen() {
    let datos: any[] = [];
    let n: number = 1;

    this.regimen.map((obj: any) => {
      datos.push([
        n++,
        obj.id,
        obj.descripcion,
        obj.pais,
        obj.mes_periodo,
        obj.dias_mes,
        obj.trabajo_minimo_mes,
        obj.trabajo_minimo_horas,
        obj.vacacion_dias_laboral,
        obj.vacacion_dias_libre,
        obj.vacacion_dias_calendario,
        obj.dias_maximo_acumulacion,
        obj.vacacion_dias_laboral_mes,
        obj.vacacion_dias_calendario_mes,
        obj.laboral_dias,
        obj.calendario_dias,
        obj.anio_antiguedad,
        obj.dias_antiguedad,
      ])
    })

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Régimen");
    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });
    // COMBINAR CELDAS
    worksheet.mergeCells("B1:R1");
    worksheet.mergeCells("B2:R2");
    worksheet.mergeCells("B3:R3");
    worksheet.mergeCells("B4:R4");
    worksheet.mergeCells("B5:R5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = "Lista de Régimen Laboral".toUpperCase();

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
      { key: "codigo", width: 20 },
      { key: "descripcion", width: 20 },
      { key: "pais", width: 20 },
      //
      { key: "mes_periodo", width: 20 },
      { key: "dias_mes", width: 20 },
      { key: "trabajo_minimo_mes", width: 30 },
      { key: "trabajo_minimo_horas", width: 30 },
      { key: "vacacion_dias_laboral", width: 30 },
      { key: "vacacion_dias_libre", width: 30 },
      { key: "vacacion_dias_calendario", width: 30 },      
      { key: "dias_maximo_acumulacion", width: 30 },
      { key: "vacacion_dias_laboral_mes", width: 40 },
      { key: "vacacion_dias_calendario_mes", width: 40 },
      { key: "laboral_dias", width: 40 },
      { key: "calendario_dias", width: 40 },
      { key: "anio_antiguedad", width: 30 },
      { key: "dias_antiguedad", width: 30 },
    ];

    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "CÓDIGO", totalsRowLabel: "Total:", filterButton: false },
      { name: "DESCRIPCION", totalsRowLabel: "", filterButton: true },
      { name: "PAÍS", totalsRowLabel: "", filterButton: true },
      //
      { name: "MESES_PERIODO", totalsRowLabel: "", filterButton: true },
      { name: "DIAS_MES", totalsRowLabel: "", filterButton: true },
      { name: "TRABAJO_MINIMO_MES", totalsRowLabel: "", filterButton: true },
      { name: "TRABAJO_MINIMO_HORA", totalsRowLabel: "", filterButton: true },
      { name: "DIAS_ANIO_VACACION", totalsRowLabel: "", filterButton: true },
      { name: "DIAS_LIBRES", totalsRowLabel: "", filterButton: true },
      { name: "DIAS_CALENDARIO_VACACION", totalsRowLabel: "", filterButton: true },
      { name: "MAX_DIAS_ACUMULABLES", totalsRowLabel: "", filterButton: true },
      { name: "DIAS_LABORALES_GANADOS_MES", totalsRowLabel: "", filterButton: true },
      { name: "DIAS_CALENDARIO_GANADOS_MES", totalsRowLabel: "", filterButton: true },
      { name: "DIAS_LABORALES_GANADOS_DIA", totalsRowLabel: "", filterButton: true },
      { name: "DIAS_CALENDARIO_GANADOS_DIA", totalsRowLabel: "", filterButton: true },
      { name: "ANIOS_ANTIGUEDAD", totalsRowLabel: "", filterButton: true },
      { name: "DIA_INCR_ANTIGUEDAD", totalsRowLabel: "", filterButton: true },
    ];

    worksheet.addTable({
      name: "RegimenTabla",
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
      FileSaver.saveAs(blob, "RegimenEXCEL.xlsx");
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
   ** **                            PARA LA EXPORTACION DE ARCHIVOS XML                               ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    this.OrdenarDatos(this.regimen);
    var objeto: any;
    var arregloRegimen: any = [];
    this.regimen.forEach((obj: any) => {
      objeto = {
        regimen_laboral: {
          "$": { "id": obj.id },
          descripcion: obj.descripcion,
          pais: obj.pais,
          meses_periodo: obj.mes_periodo,
          dias_mes: obj.dias_mes,
          trabajo_minimo_mes: obj.trabajo_minimo_mes,
          trabajo_minimo_hora: obj.trabajo_minimo_horas,
          dias_anio_vacacion: obj.vacacion_dias_laboral,
          dias_libres: obj.vacacion_dias_libre,
          dias_calendario_vacacion: obj.vacacion_dias_calendario,
          max_dias_acumulables: obj.dias_maximo_acumulacion,
          dias_laborales_ganados_mes: obj.vacacion_dias_laboral_mes,
          dias_calendario_ganados_mes: obj.vacacion_dias_calendario_mes,
          dias_laborales_ganados_dia: obj.laboral_dias,
          dias_calendario_ganados_dia: obj.calendario_dias,
          anios_antiguedad: obj.anio_antiguedad,
          dia_incr_antiguedad: obj.dias_antiguedad,
        },
      };
      arregloRegimen.push(objeto);
    });
    const xmlBuilder = new xml2js.Builder({ rootName: 'Regimen_laboral' });
    const xml = xmlBuilder.buildObject(arregloRegimen);

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
    a.download = 'Regimen_laboral.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
    this.ObtenerRegimen();
  }

  /** ************************************************************************************************** **
   ** **                                    METODO PARA EXPORTAR A CSV                                ** **
   ** ************************************************************************************************** **/
  ExportToCSV() {
  
    this.OrdenarDatos(this.regimen);
  
    const workbook = new ExcelJS.Workbook();
  
    const worksheet = workbook.addWorksheet('RegimenCSV');
  
    //  Agregar encabezados dinámicos basados en las claves del primer objeto
    const keys = Object.keys(this.regimen[0] || {}); // Obtener las claves
    worksheet.columns = keys.map(key => ({ header: key, key, width: 20 }));
  
    // Llenar las filas con los datos
    this.regimen.forEach((obj: any) => {
      worksheet.addRow(obj);
    });
  
    workbook.csv.writeBuffer().then((buffer) => {
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "RegimenCSV.csv");
    });

    this.ObtenerRegimen();
  }

  //HABILITAR LOS CHECKS

  /** ************************************************************************************************** **
   ** **                       METODO DE SELECCION MULTIPLE DE USUARIOS                               ** **
   ** ************************************************************************************************** **/

  //HABILITAR LOS CHECKS
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

  selectionRegimen = new SelectionModel<ITableRegimen>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionRegimen.selected.length;
    return numSelected === this.regimen.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionRegimen.clear() :
      this.regimen.forEach((row: any) => this.selectionRegimen.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableRegimen): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.regimenesEliminar = this.selectionRegimen.selected;
    return `${this.selectionRegimen.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;
  }

  // METODO DE ELIMINACION DE REGISTROS
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip
    };

    const peticiones = this.selectionRegimen.selected.map((datos: any) =>
      this.rest.EliminarRegistro(datos.id, data).pipe(
        map((res: any) => ({ success: res.message !== 'error', descripcion: datos.descripcion })),
        catchError(() => of({ success: false, descripcion: datos.descripcion }))
      )
    );

    forkJoin(peticiones).subscribe(resultados => {
      let eliminados = 0;

      resultados.forEach(resultado => {
        if (resultado.success) {
          eliminados++;
        } else {
          this.toastr.warning('Existen datos relacionados con ' + resultado.descripcion + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
        }
      });

      if (eliminados > 0) {
        this.toastr.error(`Se ha eliminado ${eliminados} registro${eliminados > 1 ? 's' : ''}.`, '', {
          timeOut: 6000,
        });
      }

      this.regimenesEliminar = [];
      this.selectionRegimen.clear();
      this.ObtenerRegimen();
    });
  }

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.regimenesEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.regimenesEliminar = [];
            this.selectionRegimen.clear();
            this.ObtenerRegimen();
          } else {
            this.toastr.warning('No ha seleccionado RÉGIMENES.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/listarRegimen']);
        }
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_regimen: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.rest.EliminarRegistro(id_regimen, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerRegimen();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana
      .open(MetodosComponent, { width: "450px" })
      .afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.regimenesEliminar = [];
          this.selectionRegimen.clear();
          this.ObtenerRegimen();
        } else {
          this.router.navigate(["/listarRegimen"]);
        }
      });
  }

  // CONTROL BOTONES
  private tienePermiso(accion: string, idFuncion?: number): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) =>
          item.accion === accion && (idFuncion === undefined || item.id_funcion === idFuncion)
        );
      } catch {
        return false;
      }
    } else {
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getCrearRegimenLaboral(){
    return this.tienePermiso('Crear Régimen Laboral');
  }

  getVerRegimenLaboral(){
    return this.tienePermiso('Ver Régimen Laboral');
  }

  getEditarRegimenLaboral(){
    return this.tienePermiso('Editar Régimen Laboral');
  }

  getEliminarRegimenLaboral(){
    return this.tienePermiso('Eliminar Régimen Laboral');
  }

  getDescargarReportes(){
    return this.tienePermiso('Descargar Reportes Régimen Laboral', 5);
  }

}