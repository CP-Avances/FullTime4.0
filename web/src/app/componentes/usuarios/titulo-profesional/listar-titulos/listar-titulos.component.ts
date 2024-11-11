// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';

// IMPORTAR COMPONENTES
import { EditarTitulosComponent } from '../editar-titulos/editar-titulos.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { TitulosComponent } from '../titulos/titulos.component';

// IMPORTAR SERVICIOS
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { NivelTitulosService } from 'src/app/servicios/usuarios/nivelTitulos/nivel-titulos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { TituloService } from 'src/app/servicios/usuarios/catTitulos/titulo.service';

import { ITableProvincias } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-listar-titulos',
  templateUrl: './listar-titulos.component.html',
  styleUrls: ['./listar-titulos.component.css']
})

export class ListarTitulosComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // VARIABLES USADAS PARA ALMACENAMIENTO DE DATOS
  titulosEliminar: any = [];
  verTitulos: any = [];
  empleado: any = [];
  idEmpleado: number; // VARIABLE QUE ALMACENA ID DE EMPLEADO QUE INICIO SESION

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);
  nivelF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  archivoForm = new FormControl('', Validators.required);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreForm: this.nombreF,
    nivelForm: this.nivelF,
  });

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

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

  titulosCorrectos: number = 0;

  constructor(
    public ventana: MatDialog, // VARIABLE QUE MANEJA EVENTOS CON VENTANAS
    public router: Router, // VARIABLE USADA PARA MANEJO DE PÁGINAS CON URL
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public nivel: NivelTitulosService,
    public rest: TituloService, // SERVICIO DATOS DE TITULOS
    public validar: ValidacionesService,
    private toastr: ToastrService, // VARIABLE DE MANEJO DE MENSAJES DE NOTIFICACIONES
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
  ) { }

  ngOnInit(): void {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerTitulos();
    this.ObtenerNiveles();
  }

  // EVENTO PARA MOSTRAR NUMERO DE FILAS DETERMINADAS EN LA TABLA
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
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

  // METODO PARA LISTAR TITULOS
  ObtenerTitulos() {
    this.verTitulos = [];
    this.rest.ListarTitulos().subscribe(data => {
      this.verTitulos = data;
    });
  }

  // METODO DE BUSQUEDA DE DATOS DE NIVELES
  nivelTitulos: any = [];
  ObtenerNiveles() {
    this.nivelTitulos = [];
    this.nivel.ListarNiveles().subscribe(res => {
      this.nivelTitulos = res;
    });
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

  // METODO PARA REGISTRAR TITULO
  AbrirVentanaRegistrarTitulo(): void {
    this.ventana.open(TitulosComponent, { width: '400px' })
      .afterClosed().subscribe(items => {
        this.ObtenerTitulos();
      });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionTitulos.clear();
    this.titulosEliminar = [];
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.DataTitulosProfesionales = null;
    this.formulario.setValue({
      nombreForm: '',
      nivelForm: ''
    });
    this.ObtenerTitulos();
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA EDITAR TITULO
  AbrirVentanaEditarTitulo(datosSeleccionados: any): void {
    this.ventana.open(EditarTitulosComponent, { width: '400px', data: datosSeleccionados })
      .afterClosed().subscribe(items => {
        this.ObtenerTitulos();
      });
  }

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  nameFile: string;
  archivoSubido: Array<File>;
  mostrarbtnsubir: boolean = false;
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE TITULOS
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
  DataTitulosProfesionales: any;
  listTitulosCorrectos: any = [];
  messajeExcel: string = '';
  Revisarplantilla() {
    this.listTitulosCorrectos = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      this.DataTitulosProfesionales = res.data;
      this.messajeExcel = res.message;

      this.DataTitulosProfesionales.sort((a: any, b: any) => {
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
        this.toastr.error('No se ha encontrado pestaña TITULOS en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        this.DataTitulosProfesionales.forEach((item: any) => {
          if (item.observacion.toLowerCase() === 'ok') {
            const nombre = item.titulo;
            const nivel = this.nivelTitulos.find((valor: any) => valor.nombre.toLowerCase() === item.nivel.toLowerCase());

            const titulo = {
              nombre: nombre,
              id_nivel: nivel.id
            }

            this.listTitulosCorrectos.push(titulo);
          }
        });

        this.titulosCorrectos = this.listTitulosCorrectos.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos', 'Plantilla no aceptada', {
        timeOut: 4000,
      });

    });

  }

  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  colorCelda: string = '';
  EstiloCelda(observacion: string): string {
    if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    } else if (observacion == 'Ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
    } else if (observacion == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    } else if (observacion == 'Nivel no existe en el sistema') {
      return 'rgb(255, 192, 203)';
    } else {
      return 'rgb(251, 73, 18)';
    }
  }

  colorTexto: string = '';
  EstiloTextoCelda(texto: string): any {
    let arrayObservacion = texto.split(" ");
    if (arrayObservacion[0] == 'No') {
      return 'rgb(255, 80, 80)';
    } else {
      return 'black'
    }

  }

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.RegistrarTitulos();
        }
      });
  }

  // METODO PARA REGISTRAR DATOS DE PLANTILLA
  RegistrarTitulos() {
    if (this.listTitulosCorrectos.length > 0) {
      const data = {
        titulos: this.listTitulosCorrectos,
        user_name: this.user_name,
        ip: this.ip
      };
      this.rest.RegistrarTitulosPlantilla(data).subscribe({
        next: (res: any) => {
          this.toastr.success('Plantilla de Titulos profesionales importada.', 'Operación exitosa.', {
            timeOut: 1500,
          });
          this.LimpiarCampos();
        },
        error: (error: any) => {
          this.toastr.error('No se pudo cargar la plantilla', 'Ups !!! algo salio mal', {
            timeOut: 4000,
          });
          this.archivoForm.reset();
        }
      });
    } else {
      this.toastr.error('No exiten datos para registrar ingrese otra', 'Plantilla no aceptada', {
        timeOut: 4000,
      });
      this.archivoForm.reset();
    }
    this.archivoSubido = [];
    this.nameFile = '';
  }


  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS PDF                            ** **
   ** ************************************************************************************************* **/


  async GenerarPdf(action = 'open') {
    this.OrdenarDatos(this.verTitulos);
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Titulos.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.ObtenerTitulos();
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
        { text: 'LISTA DE TITULOS PROFESIONALES', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.PresentarDataPDF(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8 },
        itemsTableD: { fontSize: 8, alignment: 'center' },
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
            widths: ['auto', 'auto', 'auto'],
            body: [
              [
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'NIVEL', style: 'tableHeader' },
                { text: 'NOMBRE', style: 'tableHeader' },
              ],
              ...this.verTitulos.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTableD' },
                  { text: obj.nivel, style: 'itemsTableD' },
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
   ** **                            PARA LA EXPORTACION DE ARCHIVOS EXCEL                            ** **
   ** ************************************************************************************************* **/

  ExportToExcel() {
    this.OrdenarDatos(this.verTitulos);
    const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.verTitulos.map((obj: any) => {
      return {
        CODIGO: obj.id,
        NIVEL: obj.nivel,
        TITULO: obj.nombre,
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.verTitulos[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wst["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wst, 'LISTAR TITULOS');
    xlsx.writeFile(wb, "TitulosEXCEL" + '.xlsx');
    this.ObtenerTitulos();
  }

  /** ************************************************************************************************* **
   ** **                             PARA LA EXPORTACION DE ARCHIVOS XML                             ** **
   ** ************************************************************************************************* **/
  urlxml: string;
  data: any = [];
  ExportToXML() {
    this.OrdenarDatos(this.verTitulos);
    var objeto: any;
    var arregloTitulos: any = [];
    this.verTitulos.forEach((obj: any) => {
      objeto = {
        "titulos": {
          "$": { "id": obj.id },
          "nivel": obj.nivel,
          "nombre": obj.nombre,
        }
      }
      arregloTitulos.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Titulos' });
    const xml = xmlBuilder.buildObject(arregloTitulos);

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
    a.download = 'Titulos.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
    this.ObtenerTitulos();
  }

  /** ************************************************************************************************** **
   ** **                                METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************** **/

  ExportToCVS() {
    this.OrdenarDatos(this.verTitulos);
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.verTitulos);
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "TitulosCSV" + '.csv');
    this.ObtenerTitulos();
  }

  //CONTROL BOTONES
  getCrearTituloProfesional(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Crear Título Profesional');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getPlantilla(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Cargar Plantilla Títulos Profesionales');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getEditarTituloProfesional(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Editar Título Profesional');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getEliminarTituloProfesional(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Eliminar Título Profesional');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getDescargarReportes(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Descargar Reportes Títulos Profesionales');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  /** ************************************************************************************************** **
   ** **                           METODO DE SELECCION MULTIPLE DE DATOS                              ** **
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

  selectionTitulos = new SelectionModel<ITableProvincias>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionTitulos.selected.length;
    return numSelected === this.verTitulos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionTitulos.clear() :
      this.verTitulos.forEach((row: any) => this.selectionTitulos.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableProvincias): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.titulosEliminar = this.selectionTitulos.selected;

    return `${this.selectionTitulos.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;

  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_titulo: number) {
    const data = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.rest.EliminarRegistro(id_titulo, data).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('No se puede eliminar.', '', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerTitulos();
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
          this.titulosEliminar = [];
          this.selectionTitulos.clear();
          this.ObtenerTitulos();
        } else {
          this.router.navigate(['/titulos']);
        }
      });
  }

  // METODO DE ELIMINACIN MULTIPLE
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.ingresar = false;
    this.contador = 0;
    this.titulosEliminar = this.selectionTitulos.selected;
    this.titulosEliminar.forEach((datos: any) => {
      this.verTitulos = this.verTitulos.filter(item => item.id !== datos.id);
      this.contador = this.contador + 1;
      this.rest.EliminarRegistro(datos.id, data).subscribe((res: any) => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con ' + datos.nombre + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
          this.contador = this.contador - 1;
        } else {
          if (!this.ingresar) {
            this.toastr.error('Se ha eliminado ' + this.contador + ' registros.', '', {
              timeOut: 6000,
            });
            this.ingresar = true;
          }
          this.ObtenerTitulos();
        }
      });
    }
    )
  }

  // METODO DE CONFIRMACION DE ELIMINACION
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.titulosEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.titulosEliminar = [];
            this.selectionTitulos.clear();
            this.ObtenerTitulos();
          } else {
            this.toastr.warning('No ha seleccionado TÍTULOS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/titulos']);
        }
      });
  }

}
