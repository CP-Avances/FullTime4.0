// IMPORTAR LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xml2js from 'xml2js';

// IMPORTAR COMPONENTES
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { EditarNivelTituloComponent } from '../editar-nivel-titulo/editar-nivel-titulo.component';
import { RegistrarNivelTitulosComponent } from '../registrar-nivel-titulos/registrar-nivel-titulos.component';

// IMPORTAR SERVICIOS
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { NivelTitulosService } from 'src/app/servicios/nivelTitulos/nivel-titulos.service';
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';


@Component({
  selector: 'app-listar-nivel-titulos',
  templateUrl: './listar-nivel-titulos.component.html',
  styleUrls: ['./listar-nivel-titulos.component.css']
})

export class ListarNivelTitulosComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  nivelTitulos: any = [];
  empleado: any = [];

  idEmpleado: number; // VARIABLE QUE ALMACENA ID DE EMPLEADO QUE INICIO SESIÓN
  filtradoNombre = ''; // VARIABLE DE BUSQUEDA DE DATOS

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

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    public nivel: NivelTitulosService, // SERVICIO DATOS NIVELES DE TÍTULOS
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    private router: Router, // VARIABLE DE MANEJO DE TUTAS URL
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerNiveles();
  }

  // EVENTO PARA MOSTRAR NUMERO DE FILAS DE TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
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
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.setValue({
      nombreForm: ''
    });
    this.ObtenerNiveles();
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

  // METODO PARA EDITAR NIVEL DE TITULO
  AbrirVentanaEditarTitulo(datosSeleccionados: any): void {
    this.ventana.open(EditarNivelTituloComponent, { width: '450px', data: datosSeleccionados })
      .afterClosed().subscribe(items => {
        this.ObtenerNiveles();
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_nivel: number) {
    this.nivel.EliminarNivel(id_nivel).subscribe(res => {
      this.toastr.error("Registro eliminado.", '', {
        timeOut: 6000,
      });
      this.ObtenerNiveles();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/nivelTitulos']);
        }
      });
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS PDF                              ** **
   ** ************************************************************************************************* **/

  GenerarPdf(action = 'open') {
    this.OrdenarDatos(this.nivelTitulos);
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Niveles_titulos.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.ObtenerNiveles();
  }

  GetDocumentDefinicion() {
    sessionStorage.setItem('Títulos', this.nivelTitulos);
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
        { text: 'Lista Niveles de Títulos Profesionales', bold: true, fontSize: 20, alignment: 'center', margin: [0, -5, 0, 10] },
        this.PresentarDataPDF(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableD: { fontSize: 10, alignment: 'center' },
        itemsTable: { fontSize: 10 }
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
            widths: ['auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Nivel', style: 'tableHeader' },
              ],
              ...this.nivelTitulos.map(obj => {
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

  ExportToExcel() {
    this.OrdenarDatos(this.nivelTitulos);
    const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.nivelTitulos.map(obj => {
      return {
        CODIGO: obj.id,
        NIVEL: obj.nombre,
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.nivelTitulos[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wst["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wst, 'LISTAR NIVELES TITULOS');
    xlsx.writeFile(wb, "NivelesTitulosEXCEL" + '.xlsx');
    this.ObtenerNiveles();
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
    this.nivelTitulos.forEach(obj => {
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
    a.download = 'Niveles_titulos.xml';
    // Simular un clic en el enlace para iniciar la descarga
    a.click();
    this.ObtenerNiveles();
  }

  /** ************************************************************************************************** ** 
   ** **                                 METODO PARA EXPORTAR A CSV                                   ** **
   ** ************************************************************************************************** **/

  ExportToCVS() {
    this.OrdenarDatos(this.nivelTitulos);
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.nivelTitulos);
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "NivelesTitulosCSV" + '.csv');
    this.ObtenerNiveles();
  }
}
