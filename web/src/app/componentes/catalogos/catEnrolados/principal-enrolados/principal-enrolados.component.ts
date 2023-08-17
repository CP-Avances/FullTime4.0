import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import * as moment from 'moment';

import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';

import { RegistroEnroladosComponent } from '../registro-enrolados/registro-enrolados.component';
import { EnroladoRelojComponent } from '../enrolado-reloj/enrolado-reloj.component';
import { EditarEnroladosComponent } from 'src/app/componentes/catalogos/catEnrolados/editar-enrolados/editar-enrolados.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EnroladoService } from 'src/app/servicios/catalogos/catEnrolados/enrolado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { environment } from '../../../../../environments/environment';

interface buscarActivo {
  value: boolean;
  viewValue: string;
}

@Component({
  selector: 'app-principal-enrolados',
  templateUrl: './principal-enrolados.component.html',
  styleUrls: ['./principal-enrolados.component.css'],
})

export class PrincipalEnroladosComponent implements OnInit {

  enrolados: any = [];
  idUser = new FormControl('');
  nombre = new FormControl('');
  activo = new FormControl('');
  finger = new FormControl('');

  filtroIdUser: number;
  filtroEnrNombre = '';
  filtroActivo: boolean;
  filtroFinger: number;

  confirmacion = false;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

  activoBus: buscarActivo[] = [
    { value: true, viewValue: 'Activados' },
    { value: false, viewValue: 'Desactivados' }
  ];

  hipervinculo: string = environment.url;

  constructor(
    private rest: EnroladoService,
    public restE: EmpleadoService,
    public restEmpre: EmpresaService,
    public vistaRegistrarDatos: MatDialog,
    private toastr: ToastrService,
    private router: Router,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.getEnrolados();
    this.ObtenerEmpleados(this.idEmpleado);
       this.ObtenerLogo();
    this.ObtenerColores();
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
      this.p_color = res[0].color_p;
      this.s_color = res[0].color_s;
      this.frase = res[0].marca_agua;
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  getEnrolados() {
    this.enrolados = [];
    this.rest.getEnroladosRest().subscribe(data => {
      this.enrolados = data
    });
  }

  AbrirVentanaRegistrarEnrolado() {
    this.vistaRegistrarDatos.open(RegistroEnroladosComponent, { width: '900px' }).disableClose = true;
  }

  AbrirVentanaAsignarReloj(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EnroladoRelojComponent, { width: '400px', data: { datosEnrolado: datosSeleccionados, actualizar: false } }).disableClose = true;
    console.log(datosSeleccionados.nombre);
  }

  // Ventana para editar datos
  AbrirVentanaEditar(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarEnroladosComponent, { width: '900px', data: { datosEnrolado: datosSeleccionados, actualizar: false } }).disableClose = true;
  }


  /* **********************************************************************************
   * ELIMAR REGISTRO ENROLADO Y ENROLADOS-DISPOSITIVO 
   * **********************************************************************************/

  // FUNCION PARA ELIMINAR REGISTROS
  Eliminar(id_enrolado: number) {
    //console.log("probando id", id_enrolado)
    this.rest.EliminarRegistro(id_enrolado).subscribe(res => {
      this.toastr.error('Registro eliminado.','', {
        timeOut: 6000,
      });
      this.getEnrolados();
    });
  }

  // FUNCION PARA CONFIRMAR ELIMINAR REGISTROS
  ConfirmarDelete(datos): void {
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/enrolados']);
        }
      });
  }

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
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

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  limpiarCampos() {
    this.idUser.reset();
    this.nombre.reset();
    this.activo.reset();
    this.finger.reset();
  }

  /**
   * Metodos y variables para subir plantilla
   */

  nameFile: string;
  archivoSubido: Array<File>;
  archivoForm = new FormControl('', Validators.required);

  fileChange(element) {
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 9);
    console.log(itemName.toLowerCase());
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'enrolados') {
        this.plantilla();
      } else {
        this.toastr.error('Solo se acepta Enrolados', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });
      }
    } else {
      this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
        timeOut: 6000,
      });
    }
  }

  plantilla() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.subirArchivoExcel(formData).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Plantilla de Enrolados importada.', {
        timeOut: 6000,
      });
      this.getEnrolados();
      window.location.reload();
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  /****************************************************************************************************** 
  *                                         METODO PARA EXPORTAR A PDF
  ******************************************************************************************************/
  generarPdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinicion();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicion() {
    sessionStorage.setItem('Enrolados', this.enrolados);
    return {

      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');

        var h = new Date();
        // Formato de hora actual
        if (h.getMinutes() < 10) {
          var time = h.getHours() + ':0' + h.getMinutes();
        }
        else {
          var time = h.getHours() + ':' + h.getMinutes();
        }
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
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
        {image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Lista de Usuarios Enrolados', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFEnrolados(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10, alignment: 'center', }
      }
    };
  }

  EstadoSelect: any = ['Si', 'No'];
  presentarDataPDFEnrolados() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: [30, 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Id', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Código', style: 'tableHeader' },
                { text: 'Activo', style: 'tableHeader' },
                { text: 'Finger', style: 'tableHeader' },
                { text: 'Data Finger', style: 'tableHeader' }
              ],
              ...this.enrolados.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.codigo, style: 'itemsTable' },
                  { text: obj.activo, style: 'itemsTable' },
                  { text: obj.finger, style: 'itemsTable' },
                  { text: obj.data_finger, style: 'itemsTable' }
                ];
              })
            ]
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.enrolados);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Departamentos');
    xlsx.writeFile(wb, "Departamentos" + new Date().getTime() + '.xlsx');
  }

  /** ************************************************************************************************** ** 
   ** **                                   METODO PARA EXPORTAR A CSV                                 ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.enrolados);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "DepartamentosCSV" + new Date().getTime() + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS XML                               ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloEnrolados: any = [];
    this.enrolados.forEach(obj => {
      objeto = {
        "usuario_enrolado": {
          '@id': obj.id,
          "nombre": obj.nombre,
          "codigo": obj.codigo,
          "activo": obj.activo,
          "finger": obj.finger,
          "data_finger": obj.data_finger,
        }
      }
      arregloEnrolados.push(objeto)
    });

    this.rest.CrearXML(arregloEnrolados).subscribe(res => {
      this.data = res;
      console.log("prueba data", res)
      this.urlxml = `${environment.url}/enrolados/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }
}