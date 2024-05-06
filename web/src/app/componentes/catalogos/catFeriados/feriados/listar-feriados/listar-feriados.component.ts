// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xml2js from 'xml2js';

// IMPORTACION DE COMPONENTES
import { EditarFeriadosComponent } from 'src/app/componentes/catalogos/catFeriados/feriados/editar-feriados/editar-feriados.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

// IMPORTACION DE SERVICIOS
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { SpinnerService } from 'src/app/servicios/spinner/spinner.service';

@Component({
  selector: 'app-listar-feriados',
  templateUrl: './listar-feriados.component.html',
  styleUrls: ['./listar-feriados.component.css'],
})

export class ListarFeriadosComponent implements OnInit {

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

  // VARAIBLES USADAS PARA FILTROS DE BUSQUEDA
  filtroDescripcion = '';
  filtradoFecha = '';

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

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE MANEJO DE MENSAJES DE NOTIFICACIONES
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private rest: FeriadosService, // SERVICIO DATOS DE FERIADOS
    public ventana: MatDialog, // VARIABLE DE USO DE VENTANAS DE DIÁLOGO
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    public spinnerService: SpinnerService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                          BUSQUEDA DE FORMATOS DE FECHAS                            ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
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
    this.rest.ConsultarFeriado().subscribe(datos => {
      this.feriados = datos;
      this.feriados.forEach(data => {
        data.fecha_ = this.validar.FormatearFecha(data.fecha, formato, this.validar.dia_abreviado);
        if (data.fecha_recuperacion != null) {
          data.fec_recuperacion_ = this.validar.FormatearFecha(data.fecha_recuperacion, formato, this.validar.dia_abreviado);
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

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_feriado: number) {
    this.rest.EliminarFeriado(id_feriado).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.BuscarParametro();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        }
      });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.DataFeriados = null;
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
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 8);
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'feriados') {
        this.numero_paginaMul = 1;
        this.tamanio_paginaMul = 5;
        this.Revisarplantilla();
        //this.Revisarplantilla_feriado_ciudad();
      } else {
        this.toastr.error('Seleccione plantilla con nombre Feriados', 'Plantilla seleccionada incorrecta', {
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
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    this.progreso = true;

    // VERIFICACIÓN DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      this.DataFeriados = res.data;
      this.DataFerieados_ciudades = res.datafc;
      this.messajeExcel = res.message;
      console.log('probando plantilla1 feriados', res);

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      } else {
        this.DataFeriados.forEach(item => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listFeriadosCorrectos.push(item);
          }
        });
      }

    }, error => {
      console.log('Serivicio rest -> metodo RevisarFormato - ', error);
      this.toastr.error('Error al cargar los datos', 'Plantilla no aceptada', {
        timeOut: 4000,
      });
      this.progreso = false;
    }, () => {
      this.progreso = false;
    });
  }

  DataFerieados_ciudades: any = [];
  messajeExcel2: string = ''; 
  Revisarplantilla_feriado_ciudad(){
    let form = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      form.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    this.progreso = true;

    // VERIFICACIÓN DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    setTimeout(() => {
      this.rest.RevisarDatos_feriados_ciudad(form).subscribe(res => {
        this.DataFerieados_ciudades = res.data;
        this.messajeExcel2 = res.message;
        console.log('probando plantilla1 feriados ciudad', this.DataFerieados_ciudades);

        if (this.messajeExcel2 == 'error') {
          this.toastr.error('Revisar que la numeración de la columna "item" sea correcta en FeriadoCiudad.', 'Plantilla no aceptada.', {
            timeOut: 4500,
          });
          this.mostrarbtnsubir = false;
        } else {
          
        }

      }, error => {
        console.log('Serivicio rest -> metodo RevisarFormato - ', error);
        this.toastr.error('Error al cargar los datos FeriadoCiudad', 'Plantilla no aceptada', {
          timeOut: 4000,
        });
        this.progreso = false;
      }, () => {
        this.progreso = false;
      });
    },500)
    
  }

  //FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE LOS FERIADOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.registrarFeriados();
        }
      });
  }

  listFeriadosCorrectos: any = [];
  registrarFeriados() {
    var data = {
      fecha: '',
      descripcion: '',
      fec_recuperacion: ''
    }

    if (this.listFeriadosCorrectos.length > 0) {
      console.log('lista sucursales correctas: ', this.listFeriadosCorrectos);
      var cont = 0;
      this.listFeriadosCorrectos.forEach(datos => {
        data.fecha = datos.fecha;
        data.descripcion = datos.descripcion;
        data.fec_recuperacion = datos.fecha_recuperacion;
        this.rest.CrearNuevoFeriado(data).subscribe(response => {
          cont = cont + 1;
          if (response.message === 'error') {
            this.toastr.error('La fecha del feriado o la fecha de recuperación se encuentran dentro de otro registro.', 'Upss!!! algo salio mal.', {
              timeOut: 5000,
            })
          } else {
            if (this.listFeriadosCorrectos.length == cont) {
              this.toastr.success('Operación exitosa.', 'Plantilla de feriados importada.', {
                timeOut: 10000,
              });
            }
          }
          this.LimpiarCampos();
        });
      })
    } else {
      this.toastr.error('No se ha encontrado datos para su registro', 'Plantilla procesada', {
        timeOut: 4000,
      });
      this.archivoForm.reset();
    }

    this.archivoSubido = [];
    this.nameFile = '';

  }


  // METODO PARA ASIGNAR CIUDADES A FERIADO
  contadorc: number = 0;
  ingresar: number = 0;
  /*
 InsertarFeriadoCiudad(id: number) {
   this.ingresar = 0;
   this.contadorc = 0;

   // RECORRER LA LISTA DE CIUDADES SELECCIONADAS

   this.ciudadesSeleccionadas.map(obj => {
     var buscarCiudad = {
       id_feriado: id,
       id_ciudad: obj.id
     }
     // BUSCAR ID DE CIUDADES EXISTENTES
     this.ciudadFeriados = [];
     this.restF.BuscarIdCiudad(buscarCiudad).subscribe(datos => {
       this.contadorc = this.contadorc + 1;
       this.ciudadFeriados = datos;
       this.VerMensaje(id);
       this.toastr.info('',
         'Se indica que ' + obj.descripcion + ' ya fue asignada a este Feriado.', {
         timeOut: 7000,
       })
     }, error => {
       this.restF.CrearCiudadFeriado(buscarCiudad).subscribe(response => {
         this.contadorc = this.contadorc + 1;
         this.ingresar = this.ingresar + 1;
         this.VerMensaje(id);
       }, error => {
         this.contadorc = this.contadorc + 1;
         this.VerMensaje(id);
         this.toastr.error('Verificar asignación de ciudades.', 'Ups!!! algo salio mal.', {
           timeOut: 6000,
         })
       });
     });
   });
 }*/


  //Metodo para dar color a las celdas y representar las validaciones
  colorCelda: string = ''
  stiloCelda(observacion: string): string {
    let arrayObservacion = observacion.split(" ");
    if (observacion == 'Fecha duplicada') {
      return 'rgb(170, 129, 236)';
    } else if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    } else if (observacion == 'Ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
    } else if (observacion == 'Fecha registrada como valor de otra columna') {
      return 'rgb(170, 129, 236)';
    } else if (observacion == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    } else if (observacion == 'Formato de fecha_recuperacion incorrecto (YYYY-MM-DD)') {
      return 'rgb(156, 214, 255)';
    } else if (observacion == 'Formato de fecha incorrecto (YYYY-MM-DD)') {
      return 'rgb(230, 176, 96)';
    } else if (arrayObservacion[0] == 'Fecha' || arrayObservacion[0] == 'Descripción') {
      return 'rgb(242, 21, 21)';
    } else {
      return 'white'
    }
  }

  colorTexto: string = '';
  stiloTextoCelda(texto: string): string {
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
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Feriados.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.BuscarParametro();
  }

  GetDocumentDefinicion() {
    sessionStorage.setItem('Feriados', this.feriados);
    return {
      // ENCABEZADO DE LA PAGINA
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por: ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
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
              ...this.feriados.map(obj => {
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
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.feriados.map(obj => {
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
    var objeto;
    var arregloFeriados: any = [];
    this.feriados.forEach(obj => {
      objeto = {
        "roles": {
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
    a.download = 'Feriados.xml';
    // Simular un clic en el enlace para iniciar la descarga
    a.click();

    this.BuscarParametro();
  }

  /** ************************************************************************************************** **
   ** **                                METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************** **/

  ExportToCVS() {
    this.OrdenarDatos(this.feriados);
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.feriados.map(obj => {
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

}
