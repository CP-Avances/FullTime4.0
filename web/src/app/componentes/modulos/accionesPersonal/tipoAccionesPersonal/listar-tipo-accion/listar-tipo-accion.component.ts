// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import ExcelJS, { FillPattern } from "exceljs";
import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';
import { FillPatterns } from 'exceljs';

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

import { AccionPersonalService } from 'src/app/servicios/modulos/modulo-acciones-personal/accionPersonal/accion-personal.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { auto } from '@popperjs/core';
import { ExcelService } from 'src/app/servicios/generarDocumentos/excel.service';
import { SelectionModel } from '@angular/cdk/collections';

(ExcelJS as any).crypto = null; // Desactiva funciones no soportadas en el navegador

@Component({
  selector: 'app-listar-tipo-accion',
  standalone: false,
  templateUrl: './listar-tipo-accion.component.html',
  styleUrls: ['./listar-tipo-accion.component.css']
})

export class ListarTipoAccionComponent implements OnInit {
  ips_locales: any = '';

  archivoForm = new FormControl('', Validators.required);

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // VARIABLES USADAS EN SELECCIÓN DE ARCHIVOS
  nameFile: string;
  archivoSubido: Array<File>;

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = (localStorage.getItem('empresaURL') as string);

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarTipoAccionForm = new FormGroup({
    nombreForm: this.nombreF,
  });

  get habilitarAccion(): boolean { return this.funciones.accionesPersonal; }

  private bordeCompleto!: Partial<ExcelJS.Borders>;
  private bordeGrueso!: Partial<ExcelJS.Borders>;
  private fillAzul!: FillPatterns;
  private fontTitulo!: Partial<ExcelJS.Font>;
  private imagen: any;

  // VARAIBLES DE SELECCION DE DATOS DE UNA TABLA
  selectionUno = new SelectionModel<any>(true, []);
  tipoAccionEliminar: any = [];

  constructor(
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public restE: EmpleadoService,
    private rest: AccionPersonalService,
    private toastr: ToastrService,
    private router: Router,
    private validar: ValidacionesService,
    private funciones: MainNavService,
    private generarExcel: ExcelService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    if (this.habilitarAccion === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Acciones de Personal. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.ObtenerTipoAccionesPersonal();
      this.ObtenerEmpleados(this.idEmpleado);
      this.ObtenerLogo();
      this.ObtenerColores();
    }
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

  // METODO PARA MANEJAR PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  // METODO PARA OBTENER TIPOS DE ACCIONES
  tipo_acciones: any = [];
  ObtenerTipoAccionesPersonal() {
    this.rest.ConsultarTipoAccionPersonal().subscribe(datos => {
      this.tipo_acciones = datos;
    });
  }

  // FUNCION PARA ELIMINAR REGISTROS
  Eliminar(id_accion: number) {
    let datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.rest.EliminarRegistro(id_accion, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.warning('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerTipoAccionesPersonal();
      }
    });
  }

  // FUNCION PARA CONFIRMAR ELIMINAR REGISTROS
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/acciones-personal']);
        }
      });
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.tipo_acciones.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.tipo_acciones.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    this.tipoAccionEliminar = this.selectionUno.selected;
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA HACTIBAR LA SELECCION
  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.selectionUno.clear();
    }
  }

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.tipoAccionEliminar.length != 0) {
            this.EliminarMultiple();
            this.btnCheckHabilitar = false;
            this.tipoAccionEliminar = [];
            this.selectionUno.clear();
          } else {
            this.toastr.warning('No ha seleccionado registros.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        }
      });
  }
  EliminarMultiple() {

  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoForm.reset();
    this.Datos_tipoAccion_personal = null;
    this.messajeExcel = '';
    this.mostrarbtnsubir = false;
    this.BuscarTipoAccionForm.setValue({
      nombreForm: '',
    });
    this.ObtenerTipoAccionesPersonal();
  }


  // METODO PARA ABRIR EL FORMULARIO REGISTRAR
  ver_registrar: boolean = false;
  ver_lista: boolean = true;
  AbrirRegistrar() {
    this.ver_registrar = true;
    this.ver_lista = false;
  }

  // METODO PARA ABRIR EL FORMULARIO EDITAR
  ver_editar: boolean = false;
  accion: any;
  pagina: string = '';
  AbrirEditar(datos: any) {
    this.ver_lista = false;
    this.ver_editar = true;
    this.accion = datos;
    this.pagina = 'listar-tipos-acciones';
  }

  // METODO PARA ABRIR DATOS DE TIPO DE ACCION
  ver_datos: boolean = false;
  accion_id: number;
  AbrirDatosAccion(id: number) {
    this.ver_lista = false;
    this.ver_datos = true;
    this.accion_id = id;
  }

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  mostrarbtnsubir: boolean = false;
  messajeExcel: string = '';
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS
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
        this.VerificarPlantilla();
      } else {
        this.toastr.error('Seleccione plantilla con nombre plantillaConfiguracionGeneral.', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });

        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento.', 'Plantilla no aceptada.', {
        timeOut: 6000,
      });

      this.nameFile = '';
    }
    this.archivoForm.reset();
    this.mostrarbtnsubir = true;
  }

  // METODO PARA VALIDAR DATOS DE PLANTILLAS
  Datos_tipoAccion_personal: any;
  listaTipoAccionesCorrectas: any = [];
  listaTipoAccionesCorrectasCont: number;
  // METODO PARA VERIFICAR DATOS DE PLANTILLA
  VerificarPlantilla() {
    this.listaTipoAccionesCorrectas = [];
    let formData = new FormData();

    for (let i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      this.Datos_tipoAccion_personal = res.data;
      this.messajeExcel = res.message;

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.toastr.error('No se ha encontrado pestaña procesos en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {

        this.Datos_tipoAccion_personal.sort((a: any, b: any) => {
          if (a.observacion !== 'ok' && b.observacion === 'ok') {
            return -1;
          }
          if (a.observacion === 'ok' && b.observacion !== 'ok') {
            return 1;
          }
          return 0;
        });

        this.Datos_tipoAccion_personal.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaTipoAccionesCorrectas.push(item);
          }
        });
        this.listaTipoAccionesCorrectasCont = this.listaTipoAccionesCorrectas.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos', 'Plantilla no aceptada', {
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
          this.RegistrarAcciones();
        }
      });

  }

  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  colorCelda: string = ''
  EstiloCelda(observacion: string): string {
    let arrayObservacion = observacion.split(" ");
    if (observacion == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    } else if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    } else if (observacion == 'Ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
    } else if (observacion == 'Registro cruzado' ||
      observacion == 'No existe el tipo de acción de personal en el sistema'
    ) {
      return 'rgb(238, 21, 242)';
    } else {
      return 'rgb(242, 21, 21)';
    }
  }

  colorTexto: string = '';
  EstiloTextoCelda(texto: string): string {
    texto = texto.toString()
    let arrayObservacion = texto.split(" ");
    if (arrayObservacion[0] == 'No') {
      return 'rgb(255, 80, 80)';
    } else {
      return 'black'
    }
  }

  // METODO PARA REGISTRAR DATOS
  RegistrarAcciones() {
    console.log('listaProcesosCorrectas: ', this.listaTipoAccionesCorrectas.length)
    if (this.listaTipoAccionesCorrectas?.length > 0) {
      const data = {
        plantilla: this.listaTipoAccionesCorrectas,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales
      }
      this.rest.RegistrarPlantilla(data).subscribe({
        next: (response: any) => {
          this.toastr.success('Plantilla de Tipo de accion personal importada.', 'Operación exitosa.', {
            timeOut: 5000,
          });
          if (this.listaTipoAccionesCorrectas?.length > 0) {
            setTimeout(() => {
              this.ngOnInit();
            }, 500);
          }
          this.LimpiarCampos();
        },
        error: (error) => {
          this.toastr.error('No se pudo cargar la plantilla', 'Ups !!! algo salio mal', {
            timeOut: 4000,
          });
          this.archivoForm.reset();
        }
      });
    } else {
      this.toastr.error('No se ha encontrado datos para su registro.', 'Plantilla procesada.', {
        timeOut: 4000,
      });
      this.archivoForm.reset();
    }

    this.archivoSubido = [];
    this.nameFile = '';

  }


  /******************************************************************************************************
 *                                         METODO PARA EXPORTAR A PDF
 ******************************************************************************************************/


  async GenerarPdf(action = 'open') {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('AccionesPersonal.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  DefinirInformacionPDF() {

    return {

      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: 'landscape',
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
        { text: 'LISTA DE TIPOS DE ACCIONES DE PERSONAL', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.presentarDataPDFTipoPermisos(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center', },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
      }
    };
  }

  presentarDataPDFTipoPermisos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          style: 'tableMarginCabecera',
          table: {
            widths: ['auto', '*', '*', '*'],
            body: [
              [
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'TIPO DE ACCIÓN DE PERSONAL', style: 'tableHeader' },
                { text: 'DESCRIPCIÓN', style: 'tableHeader' },
                { text: 'BASE LEGAL', style: 'tableHeader' },
                //{ text: 'TIPO', style: 'tableHeader' },
              ],
              ...this.tipo_acciones.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
                  { text: obj.base_legal, style: 'itemsTable' },
                  //{ text: (obj.tipo_permiso == true ? 'Permiso' : obj.tipo_vacacion == true ? 'Vacación' : 'Situación propuesta'), style: 'itemsTable' },
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

  /** ************************************************************************************************** **
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  async exportToExcel() {

    var f = DateTime.now();
    let fecha = f.toFormat('yyyy-MM-dd');
    let hora = f.toFormat('HH:mm:ss');
    let fechaHora = 'Fecha: ' + fecha + ' Hora: ' + hora;
    const tipoAccion: any[] = [];

    console.log('tipo_acciones: ', this.tipo_acciones);
    this.tipo_acciones.forEach((accion: any, index: number) => {

      tipoAccion.push([
        index + 1,
        accion.id_tipo_accion_personal,
        accion.nombre,
        accion.descripcion,
        accion.base_legal
      ]);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tipo Acción Personal");

    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });

    // COMBINAR CELDAS
    worksheet.mergeCells("B1:M1");
    worksheet.mergeCells("B2:M2");
    worksheet.mergeCells("B3:M3");
    worksheet.mergeCells("B4:M4");
    worksheet.mergeCells("B5:M5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = "Lista de Tipo de Acción Personal".toUpperCase();

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
      { key: "id_tipo_accion_personal", width: 20 },
      { key: "nombre", width: 20 },
      { key: "descripcion", width: 20 },
      { key: "base_legal", width: 20 },
    ]

    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "CODIGO", totalsRowLabel: "Total:", filterButton: true },
      { name: "TIPO ACCIÓN PERSONAL", totalsRowLabel: "", filterButton: true },
      { name: "DESCRIPCIÓN", totalsRowLabel: "", filterButton: true },
      { name: "BASE LEGAL", totalsRowLabel: "", filterButton: true },
    ];
    console.log("ver Tipo Accion Personal", tipoAccion);
    console.log("Columnas:", columnas);

    worksheet.addTable({
      name: "TipoAccionPersonal",
      ref: "A6",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium16",
        showRowStripes: true,
      },
      columns: columnas,
      rows: tipoAccion,
    });


    worksheet.getRow(6).font = this.fontTitulo;

    const numeroFilas = tipoAccion.length;
    for (let i = 0; i <= numeroFilas; i++) {
      for (let j = 1; j <= 5; j++) {
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

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      FileSaver.saveAs(blob, "Lista_tipoAccionPersonal.xlsx");
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
    }

  }
  private obtenerAlineacionHorizontalEmpleados(j: number): "left" | "center" | "right" {
    if (j === 1 || j === 9 || j === 10 || j === 11) {
      return "center";
    } else {
      return "left";
    }
  }


  /** ************************************************************************************************** **
   ** **                                   METODO PARA EXPORTAR A CSV                                 ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    var arreglo = this.tipo_acciones;
    // 1. Crear un nuevo workbook
    const workbook = new ExcelJS.Workbook();
    // 2. Crear una hoja en el workbook
    const worksheet = workbook.addWorksheet('TipoAccionPersonalCSV');
    // 3. Agregar encabezados de las columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'TIPO_ACCION_PERSONAL', key: 'tipo_accion_personal', width: 30 },
      { header: 'NOMBRE', key: 'nombre', width: 15 },
      { header: 'DESCRIPCION', key: 'descripcion', width: 15 },
      { header: 'BASE_LEGAL', key: 'base_legal', width: 15 },
    ];

    // 4. Llenar las filas con los datos
    arreglo.map((obj: any) => {
      worksheet.addRow({
        id: obj.id,
        tipo_accion_personal: obj.id_tipo_accion_personal,
        nombre: obj.nombre,
        descripcion: obj.descripcion,
        base_legal: obj.base_legal,
      }).commit();
    });

    // 5. Escribir el CSV en un buffer
    workbook.csv.writeBuffer().then((buffer) => {
      // 6. Crear un blob y descargar el archivo
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "TipoAccionPersonalCSV.csv");
    });
  }

/** ************************************************************************************************* **
 ** **                            PARA LA EXPORTACION DE ARCHIVOS XML                               ** **
 ** ************************************************************************************************* **/

urlxml: string;
data: any = [];
exportToXML() {

  var objeto: any;
  var arregloTipoAcciones: any = [];
  console.log('this.tipo_acciones: ', this.tipo_acciones)
  this.tipo_acciones.forEach((obj: any) => {
    objeto = {
      "tipo_accion_personal": {
        "$": { "id": obj.id },
        "id_tipo_accion_personal": obj.id_tipo_accion_personal,
        "nombre": obj.nombre,
        "descripcion": obj.descripcion,
        "base_legal": obj.base_legal,
      }
    }
    arregloTipoAcciones.push(objeto)
  });
  const xmlBuilder = new xml2js.Builder({ rootName: 'TipoAcciones' });
  const xml = xmlBuilder.buildObject(arregloTipoAcciones);

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
  a.download = 'Tipo_Accion_Personal.xml';
  // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
  a.click();
}


//CONTROL BOTONES
getCrearTipoAccion() {
  const datosRecuperados = sessionStorage.getItem('paginaRol');
  if (datosRecuperados) {
    var datos = JSON.parse(datosRecuperados);
    return datos.some(item => item.accion === 'Crear Detalle Tipo Acción Personal');
  } else {
    return !(parseInt(localStorage.getItem('rol') as string) !== 1);
  }
}

getVer() {
  const datosRecuperados = sessionStorage.getItem('paginaRol');
  if (datosRecuperados) {
    var datos = JSON.parse(datosRecuperados);
    return datos.some(item => item.accion === 'Ver Detalle Tipo Acción Personal');
  } else {
    return !(parseInt(localStorage.getItem('rol') as string) !== 1);
  }
}

getEditar() {
  const datosRecuperados = sessionStorage.getItem('paginaRol');
  if (datosRecuperados) {
    var datos = JSON.parse(datosRecuperados);
    return datos.some(item => item.accion === 'Editar Detalle Tipo Acción Personal');
  } else {
    return !(parseInt(localStorage.getItem('rol') as string) !== 1);
  }
}

getEliminar() {
  const datosRecuperados = sessionStorage.getItem('paginaRol');
  if (datosRecuperados) {
    var datos = JSON.parse(datosRecuperados);
    return datos.some(item => item.accion === 'Eliminar Detalle Tipo Acción Personal');
  } else {
    return !(parseInt(localStorage.getItem('rol') as string) !== 1);
  }
}

getDescargarReportes() {
  const datosRecuperados = sessionStorage.getItem('paginaRol');
  if (datosRecuperados) {
    var datos = JSON.parse(datosRecuperados);
    return datos.some(item => item.accion === 'Descargar Reportes Detalle Tipo Acción Personal');
  } else {
    return !(parseInt(localStorage.getItem('rol') as string) !== 1);
  }
}
}
