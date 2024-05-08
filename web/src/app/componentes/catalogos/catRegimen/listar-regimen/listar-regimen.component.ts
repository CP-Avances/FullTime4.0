// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";
import { PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";

import * as FileSaver from "file-saver";
import * as moment from "moment";
import * as xlsx from "xlsx";
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xml2js from 'xml2js';

// IMPORTAR COMPONENTES
import { MetodosComponent } from "src/app/componentes/administracionGeneral/metodoEliminar/metodos.component";

// IMPORTAR SERVICIOS
import { PlantillaReportesService } from "src/app/componentes/reportes/plantilla-reportes.service";
import { EmpleadoService } from "src/app/servicios/empleado/empleadoRegistro/empleado.service";
import { RegimenService } from "src/app/servicios/catalogos/catRegimen/regimen.service";


import { SelectionModel } from '@angular/cdk/collections';
import { ITableRegimen } from 'src/app/model/reportes.model';


@Component({
  selector: "app-listar-regimen",
  templateUrl: "./listar-regimen.component.html",
  styleUrls: ["./listar-regimen.component.css"],
})

export class ListarRegimenComponent implements OnInit {

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

  filtroRegimenLaboral = ""; // VARIABLE DE FILTRO DE BUSQUEDA
  idEmpleado: number; // VARIABLE QUE ALMACENA EL ID DEL EMPELADO QUE INICIA SESIÓN

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

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
    public router: Router, // VARIABLE DE NAVEGACIÓN DE PÁGINAS CON URL
    public ventana: MatDialog // VARIABLE MANEJO DE VENTANAS
  ) {
    this.idEmpleado = parseInt(localStorage.getItem("empleado") as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerRegimen();
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
    this.rest.ConsultarRegimen().subscribe((datos) => {
      this.regimen = datos;
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
  GenerarPdf(action = "open") {
    this.OrdenarDatos(this.regimen);
    const documentDefinition = this.GetDocumentDefinicion();
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

  GetDocumentDefinicion() {
    sessionStorage.setItem("Regimen", this.regimen);
    return {
      // ENCABEZADO DE LA PAGINA
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
        var f = moment();
        fecha = f.format("YYYY-MM-DD");
        hora = f.format("HH:mm:ss");
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
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        {
          text: "Regímenes Laborales",
          bold: true,
          fontSize: 20,
          alignment: "center",
          margin: [0, -20, 0, 10],
        },
        this.PresentarDataPDF(),
      ],
      styles: {
        tableHeader: {
          fontSize: 10,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        itemsTable: { fontSize: 8, alignment: "center" },
      },
    };
  }

  PresentarDataPDF() {
    return {
      columns: [
        { width: "*", text: "" },
        {
          width: "auto",
          table: {
            widths: [
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
            ],
            body: [
              [
                { text: "Código", style: "tableHeader" },
                { text: "Descripción", style: "tableHeader" },
                { text: "País", style: "tableHeader" },
                { text: "Meses Periodo", style: "tableHeader" },
                { text: "Días por mes", style: "tableHeader" },
                { text: "Vacaciones por año", style: "tableHeader" },
                { text: "Días libres", style: "tableHeader" },
                { text: "Días calendario", style: "tableHeader" },
                { text: "Días máximos acumulables", style: "tableHeader" },
                { text: "Años para antiguedad", style: "tableHeader" },
                { text: "Días de incremento", style: "tableHeader" },
              ],
              ...this.regimen.map((obj) => {
                return [
                  { text: obj.id, style: "itemsTable" },
                  { text: obj.descripcion, style: "itemsTable" },
                  { text: obj.pais, style: "itemsTable" },
                  { text: obj.mes_periodo, style: "itemsTable" },
                  { text: obj.dias_mes, style: "itemsTable" },
                  { text: obj.vacacion_dias_laboral, style: "itemsTable" },
                  { text: obj.vacacion_dias_libre, style: "itemsTable" },
                  { text: obj.vacacion_dias_calendario, style: "itemsTable" },
                  { text: obj.dias_maximo_acumulacion, style: "itemsTable" },
                  { text: obj.anio_antiguedad, style: "itemsTable" },
                  { text: obj.dias_antiguedad, style: "itemsTable" },
                ];
              }),
            ],
          },
          // ESTILO DE COLORES FORMATO ZEBRA
          layout: {
            fillColor: function (i: any) {
              return i % 2 === 0 ? "#CCD1D1" : null;
            },
          },
        },
        { width: "*", text: "" },
      ],
    };
  }

  /** ************************************************************************************************* **
   ** **                             PARA LA EXPORTACION DE ARCHIVOS EXCEL                           ** **
   ** ************************************************************************************************* **/

  ExportToExcel() {
    this.OrdenarDatos(this.regimen);
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
      this.regimen.map((obj) => {
        return {
          CODIGO: obj.id,
          DESCRIPCION: obj.descripcion,
          PAIS: obj.pais,
          MESES_PERIODO: obj.mes_periodo,
          DIAS_MES: obj.dias_mes,
          TRABAJO_MINIMO_MES: obj.trabajo_minimo_mes,
          TRABAJO_MINIMO_HORA: obj.trabajo_minimo_horas,
          DIAS_ANIO_VACACION: obj.vacacion_dias_laboral,
          DIAS_LIBRES: obj.vacacion_dias_libre,
          DIAS_CALENDARIO_VACACION: obj.vacacion_dias_calendario,
          MAX_DIAS_ACUMULABLES: obj.dias_maximo_acumulacion,
          DIAS_LABORALES_GANADOS_MES: obj.vacacion_dias_laboral_mes,
          DIAS_CALENDARIO_GANADOS_MES: obj.vacacion_dias_calendario_mes,
          DIAS_LABORALES_GANADOS_DIA: obj.laboral_dias,
          DIAS_CALENDARIO_GANADOS_DIA: obj.calendario_dias,
          ANIOS_ANTIGUEDAD: obj.anio_antiguedad,
          DIA_INCR_ANTIGUEDAD: obj.dias_antiguedad,
        };
      })
    );
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.regimen[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {
      // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 });
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, "LISTAR REGIMEN");
    xlsx.writeFile(wb, "RegimenEXCEL" + ".xlsx");
    this.ObtenerRegimen();
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
    this.regimen.forEach((obj) => {
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
      console.error('Error al construir el objeto XML.');
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // Abrir una nueva pestaña o ventana con el contenido XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // Evitar que la nueva pestaña tenga acceso a la ventana padre
      newTab.focus(); // Dar foco a la nueva pestaña
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }
    // const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'Regimen_laboral.xml';
    // Simular un clic en el enlace para iniciar la descarga
    a.click();
    this.ObtenerRegimen();
  }

  /** ************************************************************************************************** **
   ** **                                    METODO PARA EXPORTAR A CSV                                ** **
   ** ************************************************************************************************** **/

  ExportToCVS() {
    this.OrdenarDatos(this.regimen);
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.regimen);
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], {
      type: "text/csv;charset=utf-8;",
    });
    FileSaver.saveAs(data, "RegimenCSV" + ".csv");
    this.ObtenerRegimen();
  }

  // CONTROL DE VISIBILIDAD DE BOTONES
  getCrearRegimenLaboral(){
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if(datosRecuperados){
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => item.accion === 'Crear Régimen Laboral');
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    }else{
      if(parseInt(localStorage.getItem('rol') as string) != 1){
        return false;
      }else{
        return true;
      }
    }
  }

  getVerRegimenLaboral(){
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if(datosRecuperados){
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => item.accion === 'Ver Régimen Laboral');
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    }else{
      if(parseInt(localStorage.getItem('rol') as string) != 1){
        return false;
      }else{
        return true;
      }
    }
  }

  getEditarRegimenLaboral(){
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if(datosRecuperados){
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => item.accion === 'Editar Régimen Laboral');
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    }else{
      if(parseInt(localStorage.getItem('rol') as string) != 1){
        return false;
      }else{
        return true;
      }
    }
  }

  getEliminarRegimenLaboral(){
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if(datosRecuperados){
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => item.accion === 'Eliminar Régimen Laboral');
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    }else{
      if(parseInt(localStorage.getItem('rol') as string) != 1){
        return false;
      }else{
        return true;
      }
    }
  }

  getDescargarReportes(){
    var datosRecuperados = sessionStorage.getItem('paginaRol');
    if(datosRecuperados){
      var datos = JSON.parse(datosRecuperados);
      var encontrado = false;
      const index = datos.findIndex(item => (item.accion === 'Descargar Reportes Régimen Laboral' && item.id_funcion === 5));
      if (index !== -1) {
        encontrado = true;
      }
      return encontrado;
    }else{
      if(parseInt(localStorage.getItem('rol') as string) != 1){
        return false;
      }else{
        return true;
      }
    }
  }

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
    //console.log('paginas para Eliminar',this.paginasEliminar);

    //console.log(this.selectionPaginas.selected)
    return `${this.selectionRegimen.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;

  }
  contador: number = 0;
  ingresar: boolean = false;


  EliminarMultiple() {

    this.ingresar = false;
    this.contador = 0;
    this.regimenesEliminar = this.selectionRegimen.selected;
    this.regimenesEliminar.forEach((datos: any) => {

      this.regimen = this.regimen.filter(item => item.id !== datos.id);

      this.contador = this.contador + 1;

      //AQUI MODIFICAR EL METODO 
      this.rest.EliminarRegistro(datos.id).subscribe(res => {

        if (res.message === 'error') {
          this.toastr.error('No se puede eliminar.', '', {
            timeOut: 6000,
          });
          this.contador = this.contador - 1;


        } else {
          if (!this.ingresar) {
            this.toastr.error('Se ha Eliminado ' + this.contador + ' registros.', '', {
              timeOut: 6000,
            });
            this.ingresar = true;
          }
          this.ObtenerRegimen();
        }
      });

    }
    )
  }





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
            this.toastr.warning('No ha seleccionado REGÍMENES.', 'Ups!!! algo salio mal.', {
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
    this.rest.EliminarRegistro(id_regimen).subscribe((res) => {

      if (res.message === 'error') {
        this.toastr.error('No se puede elminar.', '', {
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





}





