// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTACION DE COMPONENTES
import { EditarFeriadosComponent } from '../editar-feriados/editar-feriados.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

// IMPORTACION DE SERVICIOS
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableFeriados } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-listar-feriados',
  templateUrl: './listar-feriados.component.html',
  styleUrls: ['./listar-feriados.component.css'],
})

export class ListarFeriadosComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  feriadosEliminar: any = [];

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl('');
  archivoForm = new FormControl('', Validators.required);
  fechaF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    descripcionForm: this.descripcionF,
    fechaForm: this.fechaF,
  });

  // ALMACENAMIENTO DE DATOS CONSULTADOS
  feriados: any = [];
  empleado: any = [];

  idEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESION

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  tamanio_paginaMul2: number = 5;
  numero_paginaMul2: number = 1;

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  nameFile: string;
  archivoSubido: Array<File>;

  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = environment.url

  expansion: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  feriadosCorrectos: number = 0;
  feriadosCiudadesCorrectos: number = 0;

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE MANEJO DE MENSAJES DE NOTIFICACIONES
    private router: Router,
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private rest: FeriadosService, // SERVICIO DATOS DE FERIADOS
    public ventana: MatDialog, // VARIABLE DE USO DE VENTANAS DE DIÁLOGO
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerEmpleados(this.idEmpleado);
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                          BUSQUEDA DE FORMATOS DE FECHAS                            ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.ObtenerFeriados(this.formato_fecha)
      },
      vacio => {
        this.ObtenerFeriados(this.formato_fecha)
      });
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // LECTURA DE DATOS
  ObtenerFeriados(formato: string) {
    this.feriados = [];
    this.numero_pagina = 1;
    this.rest.ConsultarFeriado().subscribe(datos => {
      this.feriados = datos;
      this.feriados.forEach((data: any) => {
        data.fecha_ = this.validar.FormatearFecha(data.fecha, formato, this.validar.dia_abreviado, this.idioma_fechas);
        if (data.fecha_recuperacion != null) {
          data.fec_recuperacion_ = this.validar.FormatearFecha(data.fecha_recuperacion, formato, this.validar.dia_abreviado, this.idioma_fechas);
        }
      })
    })
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

  // METODO PARA REGISTRAR FERIADO
  ver_registrar: boolean = false;
  AbrirVentanaRegistrarFeriado(): void {
    this.ver_lista = false;
    this.ver_registrar = true;

    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionFeriados.clear();
    this.feriadosEliminar = [];
  }

  // METODO PARA EDITAR FERIADOS
  AbrirVentanaEditarFeriado(datosSeleccionados: any): void {
    this.ventana.open(EditarFeriadosComponent,
      {
        width: '350px', data: { datosFeriado: datosSeleccionados, actualizar: true },
        disableClose: true
      }).afterClosed()
      .subscribe((confirmado: number) => {
        if (confirmado > 0) {
          this.VerListaCiudades(confirmado);
        }
      });;
  }


  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.DataFeriados = null;
    this.DataFerieados_ciudades = null;
    this.messajeExcel2 = '';
    this.archivoSubido = [];
    this.nameFile = '';
    this.formulario.setValue({
      descripcionForm: '',
      fechaForm: ''
    });
    this.BuscarParametro();
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';
  }

  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  ManejarPaginaMulti2(e: PageEvent) {
    this.tamanio_paginaMul2 = e.pageSize;
    this.numero_paginaMul2 = e.pageIndex + 1
  }

  // METODO PARA VISUALIZAR PANTALLA ASIGNAR CIUDAD FERIADO
  ver_lista: boolean = true;
  ver_asignar: boolean = false;
  pagina: string = '';
  feriado_id: number;
  VerAsignarCiudad(id: number) {
    this.feriado_id = id;
    this.pagina = 'listar-feriados';
    this.ver_ciudades = false;
    this.ver_asignar = true;
    this.ver_lista = false;
  }

  // METODO PARA VISUALIZAR PANTALLA VER CIUDADES FERIADOS
  ver_ciudades: boolean = false;
  VerListaCiudades(id: number) {
    this.feriado_id = id;
    this.pagina = 'listar-ciudades';
    this.ver_ciudades = true;
    this.ver_asignar = false;
    this.ver_lista = false;
  }

  mostrarbtnsubir: boolean = false;
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE FERIADOS
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

  DataFeriados: any;
  messajeExcel: string = '';
  // METODO PARA ENVIAR MENSAJES DE ERROR O CARGAR DATOS SI LA PLANTILLA ES CORRECTA
  Revisarplantilla() {
    this.listFeriadosCorrectos = [];
    this.listaFerediadCiudadCorrectos = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      this.DataFeriados = res.data;
      this.DataFerieados_ciudades = res.datafc;

      this.DataFeriados.sort((a: any, b: any) => {
        if (a.observacion !== 'ok' && b.observacion === 'ok') {
          return -1;
        }
        if (a.observacion === 'ok' && b.observacion !== 'ok') {
          return 1;
        }
        return 0;
      });

      this.DataFerieados_ciudades.sort((a: any, b: any) => {
        if (a.observacion !== 'ok' && b.observacion === 'ok') {
          return -1;
        }
        if (a.observacion === 'ok' && b.observacion !== 'ok') {
          return 1;
        }
        return 0;
      });


      this.messajeExcel = res.message;
      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe_feriado') {
        this.toastr.error('No se ha encontrado pestaña FERIADOS en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe_ciudad') {
        this.toastr.error('No se ha encontrado pestaña CIUDAD_FERIADOS en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        this.DataFeriados.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listFeriadosCorrectos.push(item);
          }
        });

        this.DataFerieados_ciudades.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaFerediadCiudadCorrectos.push(item);
          }
        });
        this.feriadosCorrectos = this.listFeriadosCorrectos.length;
        this.feriadosCiudadesCorrectos = this.listaFerediadCiudadCorrectos.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos', 'Plantilla no aceptada', {
        timeOut: 4000,
      });
    });
  }

  // METODO PARA REGISTRAR FERIADO CIUDAD PLANTILLA
  DataFerieados_ciudades: any = [];
  messajeExcel2: string = '';
  Crear_feriado_ciudad() {
    const data = {
      plantilla: this.listaFerediadCiudadCorrectos,
      user_name: this.user_name,
      ip: this.ip
    }
    this.rest.Crear_feriados_ciudad(data).subscribe();
  }

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.RegistrarFeriados();
        }
      });
  }

  // METODO PARA REGISTRAR DATOS
  listFeriadosCorrectos: any = [];
  listaFerediadCiudadCorrectos: any = [];
  RegistrarFeriados() {
    if (this.listFeriadosCorrectos?.length > 0) {
      const data = {
        plantilla: this.listFeriadosCorrectos,
        user_name: this.user_name,
        ip: this.ip
      }
      this.rest.Crear_feriados(data).subscribe({
        next: (response) => {
          this.toastr.success('Plantilla de Feriados importada.', 'Operación exitosa.', {
            timeOut: 5000,
          });
          if (this.listaFerediadCiudadCorrectos?.length > 0) {
            setTimeout(() => {
              this.Crear_feriado_ciudad();
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

  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  colorCelda: string = ''
  EstiloCelda(observacion: string): string {
    let arrayObservacion = observacion.split(" ");
    if (observacion == 'Fecha duplicada') {
      return 'rgb(170, 129, 236)';
    }
    else if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    }
    else if (observacion == 'Fecha ya existe en el sistema' ||
      observacion == 'Fecha recuperación ya existe en el sistema' ||
      observacion == 'Descripción ya existe en el sistema' ||
      observacion == 'Feriando ya asignado a una ciudad') {
      return 'rgb(239, 203, 106)';
    }
    else if (observacion == 'Fecha como valor de otra columna') {
      return 'rgb(170, 129, 236)';
    }
    else if (observacion == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    }
    else if (observacion == 'Formato de fecha incorrecto (YYYY-MM-DD)' ||
      observacion == 'Formato de fecha recuperación incorrecto (YYYY-MM-DD)') {
      return 'rgb(230, 176, 96)';
    }
    else if (observacion == 'Feriado no válido (Debe existir previamente)') {
      return 'rgb(238, 34, 207)';
    }
    else if (arrayObservacion[0] == 'Fecha' || arrayObservacion[0] == 'Descripción'
      || arrayObservacion[0] == 'Provincia' || arrayObservacion[0] == 'Ciudad'
      || arrayObservacion[0] == 'Feriado') {
      return 'rgb(242, 21, 21)';
    }
    else if (observacion == 'La ciudad no existe en el sistema' ||
      observacion == 'La provincia no existe en el sistema') {
      return 'rgb(255, 192, 203';
    }
    else {
      return 'white'
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

  /** ************************************************************************************************* **
   ** **                           PARA LA EXPORTACION DE ARCHIVOS PDF                               ** **
   ** ************************************************************************************************* **/

  GenerarPdf(action = 'open') {
    this.OrdenarDatos(this.feriados);
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Feriados.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.BuscarParametro();
  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por: ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
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
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Lista de Feriados', bold: true, fontSize: 20, alignment: 'center', margin: [0, -10, 0, 10] },
        this.PresentarDataPDFFeriados(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10, alignment: 'center' },
        itemsTableD: { fontSize: 10 }
      }
    };
  }

  PresentarDataPDFFeriados() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Fecha', style: 'tableHeader' },
                { text: 'Fecha Recuperación', style: 'tableHeader' },
              ],
              ...this.feriados.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTableD' },
                  { text: obj.fecha_, style: 'itemsTable' },
                  { text: obj.fec_recuperacion_, style: 'itemsTable' },
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
   ** **                          PARA LA EXPORTACION DE ARCHIVOS EXCEL                              ** **
   ** ************************************************************************************************* **/

  ExportToExcel() {
    this.OrdenarDatos(this.feriados);
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.feriados.map((obj: any) => {
      return {
        CODIGO: obj.id,
        FERIADO: obj.descripcion,
        FECHA: obj.fecha_,
        FECHA_RECUPERA: obj.fec_recuperacion_
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.feriados[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTA FERIADOS');
    xlsx.writeFile(wb, "FeriadosEXCEL" + '.xlsx');
    this.BuscarParametro();
  }

  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS XML                            ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    this.OrdenarDatos(this.feriados);
    var objeto: any;
    var arregloFeriados: any = [];
    this.feriados.forEach((obj: any) => {
      objeto = {
        "feriados": {
          "$": { "id": obj.id },
          "descripcion": obj.descripcion,
          "fecha": obj.fecha_,
          "fec_recuperacion": obj.fec_recuperacion_,
        }
      }
      arregloFeriados.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Feriados' });
    const xml = xmlBuilder.buildObject(arregloFeriados);

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
    a.download = 'Feriados.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();

    this.BuscarParametro();
  }

  /** ************************************************************************************************** **
   ** **                                METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************** **/

  ExportToCVS() {
    this.OrdenarDatos(this.feriados);
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.feriados.map((obj: any) => {
      return {
        CODIGO: obj.id,
        FERIADO: obj.descripcion,
        FECHA: obj.fecha_,
        FECHA_RECUPERA: obj.fec_recuperacion_
      }
    }));
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "FeriadosCSV" + '.csv');
    this.BuscarParametro();
  }


  /** ************************************************************************************************** **
   ** **                          METODO DE SELECCION MULTIPLE DE DATOS                               ** **
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

  selectionFeriados = new SelectionModel<ITableFeriados>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionFeriados.selected.length;
    return numSelected === this.feriados.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionFeriados.clear() :
      this.feriados.forEach((row: any) => this.selectionFeriados.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableFeriados): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.feriadosEliminar = this.selectionFeriados.selected;

    return `${this.selectionFeriados.isSelected(row) ? 'deselect' : 'select'} row ${row.descripcion + 1}`;

  }

  // METODO PARA ELIMINAR REGISTROS
  Eliminar(id_feriado: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.rest.EliminarFeriado(id_feriado, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No se puede eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.feriados = [];
        this.LimpiarCampos();
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
          this.feriadosEliminar = [];
          this.selectionFeriados.clear();
        }
      });

  }

  // FUNCION PARA ELIMINAR REGISTROS MULTIPLES
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.ingresar = false;
    this.contador = 0;
    this.feriadosEliminar = this.selectionFeriados.selected;
    this.feriadosEliminar.forEach((datos: any) => {
      this.feriados = this.feriados.filter((item: any) => item.id !== datos.id);
      this.contador = this.contador + 1;
      this.rest.EliminarFeriado(datos.id, data).subscribe((res: any) => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con ' + datos.descripcion + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
          this.contador = this.contador - 1;
        } else {
          if (!this.ingresar) {
            this.toastr.error('Se ha eliminado ' + this.contador + ' registros.', '', {
              timeOut: 6000,
            });
            this.ingresar = true;
            this.feriados = [];
            this.LimpiarCampos();
          }
        }
      });
    }
    )
  }

  // FUNCION PARA CONFIRMAR ELIMINACION DE REGISTROS MULTIPLES
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.feriadosEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.feriadosEliminar = [];
            this.selectionFeriados.clear();
          } else {
            this.toastr.warning('No ha seleccionado FERIADOS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/listarFeriados']);
        }
      });
  }



}