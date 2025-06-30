import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import ExcelJS, { FillPattern } from "exceljs";
import * as FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { SelectionModel } from '@angular/cdk/collections';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import * as xml2js from 'xml2js';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { GenerosService } from 'src/app/servicios/usuarios/catGeneros/generos.service';
import { MatDialog } from '@angular/material/dialog';
import { RegistrarGeneroComponent } from '../registrar-genero/registrar-genero.component';
import { EditarGeneroComponent } from '../editar-genero/editar-genero.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-listar-genero',
  standalone: false,
  templateUrl: './listar-genero.component.html',
  styleUrl: './listar-genero.component.css'
})

export class ListarGeneroComponent {

  // ALMACENAMIENTO DE DATOS
  idEmpleado: number;
  generos: any = [];
  ips_locales: any = '';

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];
  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  empleado: any = [];

  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;



  constructor(
    public validar: ValidacionesService,
    public restEmpre: EmpresaService,
    public restE: EmpleadoService,
    public restG: GenerosService,
    public ventana: MatDialog,
    private router: Router, // VARIABLE DE MANEJO DE TUTAS URL
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES



  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);

  }

  generoF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);
  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    generoForm: this.generoF,
  });

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.ListarGeneros();
    this.ObtenerEmpleados(this.idEmpleado);
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


  // METODO PARA BUSCAR PROVINCIAS
  ListarGeneros() {
    this.generos = [];
    this.numero_pagina = 1;

    this.restG.ListarGeneros().subscribe(datos => {
      this.generos = datos;
    })


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

  AbrirVentanaRegistrarGenero() {
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(RegistrarGeneroComponent, { width: '550px' }).afterClosed().subscribe(item => {
      this.ListarGeneros();
    });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionGeneros.clear();
    this.generosEliminar = [];
  }


  AbrirVentanaEditarGenero(datosSeleccionados: any) {
    this.ventana.open(EditarGeneroComponent, { width: '400px', data: datosSeleccionados })
      .afterClosed().subscribe(items => {
        this.ListarGeneros();
      });
  }


  LimpiarCampos() {
    this.formulario.setValue({
      generoForm: '',
    });
    this.ListarGeneros();
  }

  ConfirmarDeleteMultiple() {
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.generosEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.generosEliminar = [];
            this.selectionGeneros.clear();
            this.ListarGeneros();
          } else {
            this.toastr.warning('No ha seleccionado ningun genero.', 'Ups! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/genero']);
        }
      });
  }


  // METODO DE ELIMINACION MULTIPLE
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales
    };

    const peticiones = this.selectionGeneros.selected.map((datos: any) =>
      this.restG.EliminarGenero(datos.id, data).pipe(
        map((res: any) => ({ success: res.message !== 'error', genero: datos.genero })),
        catchError(() => of({ success: false, genero: datos.genero }))
      )
    );

    forkJoin(peticiones).subscribe(resultados => {
      let eliminados = 0;

      resultados.forEach(resultado => {
        if (resultado.success) {
          eliminados++;
        } else {
          this.toastr.warning('Existen datos relacionados con ' + resultado.genero + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
        }
      });

      if (eliminados > 0) {
        this.toastr.error(`Se ha eliminado ${eliminados} registro${eliminados > 1 ? 's' : ''}.`, '', {
          timeOut: 6000,
        });
      }

      this.generosEliminar = [];
      this.selectionGeneros.clear();
      this.ListarGeneros();
    });
  }



  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }


  // METODOS PARA LA SELECCION MULTIPLE
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

  selectionGeneros = new SelectionModel<any>(true, []);

  generosEliminar: any = []

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionGeneros.selected.length;
    return numSelected === this.generos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionGeneros.clear() :
      this.generos.forEach((row: any) => this.selectionGeneros.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: any): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.generosEliminar = this.selectionGeneros.selected;
    return `${this.selectionGeneros.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;
  }


  ConfirmarDelete(datos: any) {
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.generosEliminar = [];
          this.selectionGeneros.clear();
          this.ListarGeneros();
        } else {
          this.router.navigate(['/genero']);
        }
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_nivel: number) {
    const data = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.restG.EliminarGenero(id_nivel, data).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ListarGeneros();
      }
    });
  }

  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  async GenerarPdf(action = "open") {
    if (action === "download") {
      const data = {
        usuario: this.empleado[0].nombre + ' ' + this.empleado[0].apellido,
        empresa: localStorage.getItem('name_empresa')?.toUpperCase(),
        fraseMarcaAgua: this.frase,
        logoBase64: this.logo,
        colorPrincipal: this.p_color, 
        generos: this.generos
      };
      console.log("Enviando al microservicio:", data);

      this.validar.generarReporteGeneros(data).subscribe((pdfBlob: Blob) => {
        const nombreArchivo = 'Géneros.pdf';
        FileSaver.saveAs(pdfBlob, nombreArchivo);
        console.log("Recibido del microservicio:");
      }, error => {
        console.error('Error al generar PDF desde el microservicio:', error);
      });
    }
    else {
      const pdfMake = await this.validar.ImportarPDF();
      const documentDefinition = this.DefinirInformacionPDF();

      switch (action) {
        case "open":
          pdfMake.createPdf(documentDefinition).open();
          break;
        case "print":
          pdfMake.createPdf(documentDefinition).print();
          break;
        default:
          pdfMake.createPdf(documentDefinition).open();
          break;
      }
    }
  }


  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE LA PAGINA
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
          ],
          fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'LISTA DE GÉNEROS', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.PresentarDataPDF(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableD: { fontSize: 8, alignment: 'center' },
        itemsTable: { fontSize: 8 },
        tableMargin: { margin: [0, 5, 0, 0] },
      }
    };
  }


  PresentarDataPDF() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          style: 'tableMargin',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'GENERO', style: 'tableHeader' },
              ],
              ...this.generos.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTableD' },
                  { text: obj.genero, style: 'itemsTable' },
                ];
              })
            ]
          },
          // ESTILO DE COLORES FORMATO ZEBRA
          layout: {
            fillColor: function (i: any) {
              return (i % 2 === 0) ? '#CCD1D1' : null;
            }
          }
        },
        { width: '*', text: '' },
      ]
    };
  }


  async generarExcelGeneros() {
    this.OrdenarDatos(this.generos);

    const generos: any[] = [];
    this.generos.forEach((nivel: any, index: number) => {
      generos.push([
        index + 1,
        nivel.id,
        nivel.genero,
      ]);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Género");

    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });

    // COMBINAR CELDAS
    worksheet.mergeCells("B1:C1");
    worksheet.mergeCells("B2:C2");
    worksheet.mergeCells("B3:C3");
    worksheet.mergeCells("B4:C4");
    worksheet.mergeCells("B5:C5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = "Lista de Géneros".toUpperCase();

    // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
    ["B1", "B2"].forEach((cell) => {
      worksheet.getCell(cell).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(cell).font = { bold: true, size: 14 };
    });


    worksheet.columns = [
      { key: "n", width: 20 },
      { key: "codigo", width: 30 },
      { key: "genero", width: 40 },
    ];


    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "CODIGO", totalsRowLabel: "Total:", filterButton: true },
      { name: "GENERO", totalsRowLabel: "", filterButton: true },
    ];

    worksheet.addTable({
      name: "NivelesTitulosTabla",
      ref: "A6",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium16",
        showRowStripes: true,
      },
      columns: columnas,
      rows: generos,
    });


    const numeroFilas = generos.length;
    for (let i = 0; i <= numeroFilas; i++) {
      for (let j = 1; j <= 3; j++) {
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
      FileSaver.saveAs(blob, "GenerosEXCEL.xlsx");
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




  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A CSV                              ** **
   ** ************************************************************************************************** **/

  ExportToCSV() {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('GénerosCSV');
    //  Agregar encabezados dinámicos basados en las claves del primer objeto
    const keys = Object.keys(this.generos[0] || {}); // Obtener las claves
    worksheet.columns = keys.map(key => ({ header: key, key, width: 20 }));
    // Llenar las filas con los datos
    this.generos.forEach((obj: any) => {
      worksheet.addRow(obj);
    });

    workbook.csv.writeBuffer().then((buffer) => {
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "GénerosCSV.csv");
    });

  }

  /** ************************************************************************************************* **
     ** **                                PARA LA EXPORTACION DE ARCHIVOS XML                          ** **
     ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto: any;
    var arregloGeneros: any = [];
    this.generos.forEach((obj: any) => {
      objeto = {
        genero: {
          "$": { "id": obj.id },
          genero: obj.genero,
        },
      };
      arregloGeneros.push(objeto);
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Géneros' });
    const xml = xmlBuilder.buildObject(arregloGeneros);

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
    a.download = 'Géneros.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }




}
