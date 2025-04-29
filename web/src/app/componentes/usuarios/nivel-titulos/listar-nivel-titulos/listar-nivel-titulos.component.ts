// IMPORTAR LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';
import ExcelJS, { FillPattern } from "exceljs";

import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';

// IMPORTAR COMPONENTES
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { EditarNivelTituloComponent } from '../editar-nivel-titulo/editar-nivel-titulo.component';
import { RegistrarNivelTitulosComponent } from '../registrar-nivel-titulos/registrar-nivel-titulos.component';

// IMPORTAR SERVICIOS
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { NivelTitulosService } from 'src/app/servicios/usuarios/nivelTitulos/nivel-titulos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';

import { ITableNivelesEducacion } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-listar-nivel-titulos',
  standalone: false,
  templateUrl: './listar-nivel-titulos.component.html',
  styleUrls: ['./listar-nivel-titulos.component.css']
})

export class ListarNivelTitulosComponent implements OnInit {
  ips_locales: any = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;

  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;
  // VARIABLES DE ALMACENAMIENTO DE DATOS
  nivelesEliminar: any = [];
  nivelTitulos: any = [];
  empleado: any = [];

  idEmpleado: number; // VARIABLE QUE ALMACENA ID DE EMPLEADO QUE INICIO SESION

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreForm: this.nombreF,
  });

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  archivoForm = new FormControl('', Validators.required);

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = (localStorage.getItem('empresaURL') as string);

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  nivelesCorrectos: number = 0;

  constructor(
    public nivel: NivelTitulosService, // SERVICIO DATOS NIVELES DE TÍTULOS
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    public validar: ValidacionesService,
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    private router: Router, // VARIABLE DE MANEJO DE TUTAS URL
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerNiveles();
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

  // EVENTO PARA MOSTRAR NUMERO DE FILAS DE TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO DE BUSQUEDA DE DATOS DE NIVELES
  ObtenerNiveles() {
    this.nivelTitulos = [];
    this.nivel.ListarNiveles().subscribe(res => {
      this.nivelTitulos = res;
    });
  }

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  nameFile: string;
  archivoSubido: Array<File>;
  mostrarbtnsubir: boolean = false;
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE NIVELES
  FileChange(element: any) {
    this.numero_paginaMul = 1;
    this.tamanio_paginaMul = 5;
    this.paginator.firstPage();
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0];
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase().startsWith('plantillaconfiguraciongeneral')) {
        this.numero_paginaMul = 1;
        this.tamanio_paginaMul = 5;
        this.Revisarplantilla();
      } else {
        this.toastr.error('Seleccione plantilla con nombre plantillaConfiguracionGeneral.', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });
        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
        timeOut: 6000,
      });
      this.nameFile = '';
    }
    this.archivoForm.reset();
    this.mostrarbtnsubir = true;
  }


  // METODO PARA ENVIAR MENSAJES DE ERROR O CARGAR DATOS SI LA PLANTILLA ES CORRECTA
  DataNivelesProfesionales: any;
  listNivelesCorrectos: any = [];
  messajeExcel: string = '';
  Revisarplantilla() {
    this.listNivelesCorrectos = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.nivel.RevisarFormato(formData).subscribe(res => {
      this.DataNivelesProfesionales = res.data;
      this.messajeExcel = res.message;

      this.DataNivelesProfesionales.sort((a: any, b: any) => {
        if (a.observacion !== 'ok' && b.observacion === 'ok') {
          return -1;
        }
        if (a.observacion === 'ok' && b.observacion !== 'ok') {
          return 1;
        }
        return 0;
      });

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.toastr.error('No se ha encontrado pestaña NIVELES_TITULOS en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        this.DataNivelesProfesionales.forEach((item: any) => {
          if (item.observacion.toLowerCase() === 'ok') {
            const nombre = item.nombre.charAt(0).toUpperCase() + item.nombre.slice(1);
            const nivel = { nombre: nombre };
            this.listNivelesCorrectos.push(nivel);
          }
        });

        this.nivelesCorrectos = this.listNivelesCorrectos.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos.', 'Plantilla no aceptada.', {
        timeOut: 4000,
      });

    });
  }

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.RegistrarNiveles();
        }
      });
  }

  // METODO PARA REGISTRAR DATOS DE PLANTILLA
  btn_registrar: boolean = true;
  RegistrarNiveles() {
    if (this.listNivelesCorrectos.length > 0) {

      const data = {
        niveles: this.listNivelesCorrectos,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales,
      }

      this.nivel.RegistrarNivelesPlantilla(data).subscribe({
        next: (res) => {
          this.toastr.success('Plantilla de Niveles profesionales importada.', 'Operación exitosa.', {
            timeOut: 1500,
          });
          this.LimpiarCampos();
        },
        error: (error) => {
          this.toastr.error('No se pudo imnportar la plantilla', 'Ups !!! algo salio mal', {
            timeOut: 4000,
          });
        }
      });

    } else {
      this.toastr.error('No se ha encontrado datos para su registro', 'Plantilla procesada', {
        timeOut: 4000,
      });
      this.archivoForm.reset();
    }

    this.btn_registrar = true;
    this.archivoSubido = [];
    this.nameFile = '';
  }

  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  colorCelda: string = ''
  EstiloCelda(observacion: string): string {
    let arrayObservacion = observacion.split(" ");
    if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    } else if (observacion == 'Ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
    } else if (observacion == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    } else {
      return 'rgb(251, 73, 18)';
    }
  }

  colorTexto: string = '';
  EstiloTextoCelda(texto: string): string {
    let arrayObservacion = texto.split(" ");
    if (arrayObservacion[0] == 'No') {
      return 'rgb(255, 80, 80)';
    } else {
      return 'black'
    }
  }

  // ORDENAR LOS DATOS SEGUN EL ID
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

  // METODO PARA REGISTRAR NIVEL DE TITULO
  AbrirVentanaNivelTitulo(): void {
    this.ventana.open(RegistrarNivelTitulosComponent, { width: '500px' })
      .afterClosed().subscribe(items => {
        this.ObtenerNiveles();
      });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionNiveles.clear();
    this.nivelesEliminar = [];
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.DataNivelesProfesionales = null;
    this.formulario.setValue({
      nombreForm: ''
    });
    this.ObtenerNiveles();
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA EDITAR NIVEL DE TITULO
  AbrirVentanaEditarTitulo(datosSeleccionados: any): void {
    this.ventana.open(EditarNivelTituloComponent, { width: '450px', data: datosSeleccionados })
      .afterClosed().subscribe(items => {
        this.ObtenerNiveles();
      });
  }


  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS PDF                              ** **
   ** ************************************************************************************************* **/


  async GenerarPdf(action = 'open') {
    const pdfMake = await this.validar.ImportarPDF();
    this.OrdenarDatos(this.nivelTitulos);
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Niveles_titulos.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.ObtenerNiveles();
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
        { text: 'LISTA DE NIVELES DE TITULOS PROFESIONALES', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
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
                { text: 'NIVEL', style: 'tableHeader' },
              ],
              ...this.nivelTitulos.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTableD' },
                  { text: obj.nombre, style: 'itemsTable' },
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

  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS EXCEL                          ** **
   ** ************************************************************************************************* **/
  async generarExcelNivelesTitulos() {
    this.OrdenarDatos(this.nivelTitulos);

    const niveles: any[] = [];
    this.nivelTitulos.forEach((nivel: any, index: number) => {
      niveles.push([
        index + 1,
        nivel.id,
        nivel.nombre,
      ]);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Niveles Títulos");


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
    worksheet.mergeCells("B1:C1");
    worksheet.mergeCells("B2:C2");
    worksheet.mergeCells("B3:C3");
    worksheet.mergeCells("B4:C4");
    worksheet.mergeCells("B5:C5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = "Lista de Niveles de Títulos Profesionales".toUpperCase();

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
      { key: "nombre", width: 40 },
    ];


    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "CODIGO", totalsRowLabel: "Total:", filterButton: true },
      { name: "NOMBRE", totalsRowLabel: "", filterButton: true },
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
      rows: niveles,
    });


    const numeroFilas = niveles.length;
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
      FileSaver.saveAs(blob, "NivelesTitulosEXCEL.xlsx");
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
   ** **                              PARA LA EXPORTACION DE ARCHIVOS XML                            ** **
   ** ************************************************************************************************* **/
  urlxml: string;
  data: any = [];
  ExportToXML() {
    this.OrdenarDatos(this.nivelTitulos);
    var objeto: any;
    var arregloTitulos: any = [];
    this.nivelTitulos.forEach((obj: any) => {
      objeto = {
        "titulos": {
          "$": { "id": obj.id },
          "nivel": obj.nombre,
        }
      }
      arregloTitulos.push(objeto)
    });
    const xmlBuilder = new xml2js.Builder({ rootName: 'Niveles_titulos' });
    const xml = xmlBuilder.buildObject(arregloTitulos);

    if (xml === undefined) {
      console.error('Error al construir el objeto XML.');
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
    a.download = 'Niveles_titulos.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
    this.ObtenerNiveles();
  }

  /** ************************************************************************************************** **
   ** **                                 METODO PARA EXPORTAR A CSV                                   ** **
   ** ************************************************************************************************** **/

  ExportToCSV() {
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('NivelesTitulosCSV');
    //  Agregar encabezados dinámicos basados en las claves del primer objeto
    const keys = Object.keys(this.nivelTitulos[0] || {}); // Obtener las claves
    worksheet.columns = keys.map(key => ({ header: key, key, width: 20 }));
    // Llenar las filas con los datos
    this.nivelTitulos.forEach((obj: any) => {
      worksheet.addRow(obj);
    });
    workbook.csv.writeBuffer().then((buffer) => {
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "NivelesTitulosCSV.csv");
    });

  }


  /** ************************************************************************************************** **
   ** **                             METODO DE SELECCION MULTIPLE DE DATOS                            ** **
   ** ************************************************************************************************** **/

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

  selectionNiveles = new SelectionModel<ITableNivelesEducacion>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionNiveles.selected.length;
    return numSelected === this.nivelTitulos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionNiveles.clear() :
      this.nivelTitulos.forEach((row: any) => this.selectionNiveles.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableNivelesEducacion): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.nivelesEliminar = this.selectionNiveles.selected;

    return `${this.selectionNiveles.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_nivel: number) {
    const data = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.nivel.EliminarNivel(id_nivel, data).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerNiveles();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.nivelesEliminar = [];
          this.selectionNiveles.clear();
          this.ObtenerNiveles();
        } else {
          this.router.navigate(['/nivelTitulos']);
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
  
    let eliminados = 0;
    let totalProcesados = 0;
    const totalSeleccionados = this.selectionNiveles.selected.length;
  
    this.nivelesEliminar = this.selectionNiveles.selected;
  
    this.nivelesEliminar.forEach((datos: any) => {
      this.nivel.EliminarNivel(datos.id, data).subscribe((res: any) => {
        totalProcesados++;
  
        if (res.message === 'error') {
          this.toastr.warning('Existen datos relacionados con ' + datos.nombre + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
        } else {
          eliminados++;
          this.nivelTitulos = this.nivelTitulos.filter(item => item.id !== datos.id);
        }
        if (totalProcesados === totalSeleccionados) {
          if (eliminados > 0) {
            this.toastr.error(`Se ha eliminado ${eliminados} registro${eliminados > 1 ? 's' : ''}.`, '', {
              timeOut: 6000,
            });
          }
          this.selectionNiveles.clear();
          this.nivelesEliminar = [];
          this.ObtenerNiveles();
        }
      });
    });
  }
  

  // METODO DE CONFIRMACION DE ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.nivelesEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.nivelesEliminar = [];
            this.selectionNiveles.clear();
            this.ObtenerNiveles();
          } else {
            this.toastr.warning('No ha seleccionado NIVELES DE EDUCACIÓN.', 'Ups! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/nivelTitulos']);
        }
      });
  }

  //CONTROL BOTONES
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

  getCrearNivelTituloProfesional(){
    return this.tienePermiso('Crear Nivel Académico');
  }

  getEditarNivelTituloProfesional(){
    return this.tienePermiso('Editar Nivel Académico');
  }

  getPlantilla(){
    return this.tienePermiso('Cargar Plantilla Niveles Académicos');
  }

  getEliminarNivelTituloProfesional(){
    return this.tienePermiso('Eliminar Nivel Académico');
  }

  getDescargarReportes(){
    return this.tienePermiso('Descargar Reportes Niveles Académicos');
  }

}
