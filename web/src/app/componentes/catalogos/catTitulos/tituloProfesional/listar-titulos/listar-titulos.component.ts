// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xml2js from 'xml2js';

// IMPORTAR COMPONENTES
import { EditarTitulosComponent } from '../editar-titulos/editar-titulos.component'
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { TitulosComponent } from '../titulos/titulos.component'

// IMPORTAR SERVICIOS
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';

@Component({
  selector: 'app-listar-titulos',
  templateUrl: './listar-titulos.component.html',
  styleUrls: ['./listar-titulos.component.css']
})

export class ListarTitulosComponent implements OnInit {

  // VARIABLES USADAS PARA ALMACENAMIENTO DE DATOS
  verTitulos: any = [];
  empleado: any = [];

  // VARIABLES USADAS PARA FILTROS DE BUSQUEDA
  filtradoNombre = '';
  filtradoNivel = '';

  idEmpleado: number; // VARIABLE QUE ALMACENA ID DE EMPLEADO QUE INICIO SESIÓN

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

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    public ventana: MatDialog, // VARIABLE QUE MANEJA EVENTOS CON VENTANAS
    public router: Router, // VARIABLE USADA PARA MANEJO DE PÁGINAS CON URL
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public rest: TituloService, // SERVICIO DATOS DE TITULOS
    private toastr: ToastrService, // VARIABLE DE MANEJO DE MENSAJES DE NOTIFICACIONES
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
  ) { }

  ngOnInit(): void {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerTitulos();
  }

  // EVENTO PARA MOSTRAR NUMERO DE FILAS DETERMINADAS EN LA TABLA
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
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
    this.rest.ListarTitulos().subscribe(data => {
      this.verTitulos = data;
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
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO PARA EDITAR TITULO
  AbrirVentanaEditarTitulo(datosSeleccionados: any): void {
    this.ventana.open(EditarTitulosComponent, { width: '400px', data: datosSeleccionados })
      .afterClosed().subscribe(items => {
        this.ObtenerTitulos();
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_titulo: number) {
    this.rest.EliminarRegistro(id_titulo).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerTitulos();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/titulos']);
        }
      });
  }


  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  nameFile: string;
  archivoSubido: Array<File>;
  mostrarbtnsubir: boolean = false;
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE FERIADOS -----------------------------------------------------------------
  FileChange(element: any) {
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 25);
    console.log('itemName: ',itemName);
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'titulos_profesionales') {
        this.Revisarplantilla();
      } else {
        this.toastr.error('Seleccione plantilla con nombre Titulos_profesionales', 'Plantilla seleccionada incorrecta', {
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

  DataTitulosProfesionales: any;
  listTitulosCorrectos: any = [];
  // METODO PARA ENVIAR MENSAJES DE ERROR O CARGAR DATOS SI LA PLANTILLA ES CORRECTA
  Revisarplantilla(){
    this.listTitulosCorrectos = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
  
    // VERIFICACIÓN DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      this.DataTitulosProfesionales = res.data;
      
      console.log('probando plantilla1', this.DataTitulosProfesionales);

      this.DataTitulosProfesionales.forEach(item => {
        if( item.observacion.toLowerCase() === 'ok'){
          this.listTitulosCorrectos.push(item);
        }
      });
      
    });
      
  }



   //Metodo para dar color a las celdas y representar las validaciones
   colorCelda: string = ''
   stiloCelda(observacion: string): string{
     if(observacion == 'ok'){
       return 'rgb(159, 221, 154)';
     }else if(observacion == 'Ya esta registrado en base'){
       return 'rgb(239, 203, 106)';
     }else if(observacion == 'Registro duplicado'){
       return 'rgb(156, 214, 255)';
     }else{
       return 'rgb(251, 73, 18)';
     }
   }
 
   colorTexto: string = '';
   stiloTextoCelda(texto: string): string{    
     let arrayObservacion = texto.split(" ");
     if(arrayObservacion[0] == 'No'){
       return 'rgb(255, 80, 80)';
     }else{
       return 'black'
     }
     
   }

   registrarTitulos(){

   }


  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS PDF                            ** **
   ** ************************************************************************************************* **/

  GenerarPdf(action = 'open') {
    this.OrdenarDatos(this.verTitulos);
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Titulos.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.ObtenerTitulos();
  }

  GetDocumentDefinicion() {
    sessionStorage.setItem('Títulos', this.verTitulos);
    return {
      // ENCABEZADO DE LA PAGINA
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE LA PAGINA
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
          ],
          fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Lista de Títulos', bold: true, fontSize: 20, alignment: 'center', margin: [0, -10, 0, 10] },
        this.PresentarDataPDF(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableD: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  PresentarDataPDF() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Nivel', style: 'tableHeader' },
              ],
              ...this.verTitulos.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTableD' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.nivel, style: 'itemsTableD' }
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
    const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.verTitulos.map(obj => {
      return {
        CODIGO: obj.id,
        TITULO: obj.nombre,
        NIVEL: obj.nivel
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
    this.verTitulos.forEach(obj => {
      objeto = {
        "titulos": {
          "$": { "id": obj.id },
          "nombre": obj.nombre,
          "nivel": obj.nivel,
        }
      }
      arregloTitulos.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Titulos' });
    const xml = xmlBuilder.buildObject(arregloTitulos);

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
    a.download = 'Titulos.xml';
    // Simular un clic en el enlace para iniciar la descarga
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

}
