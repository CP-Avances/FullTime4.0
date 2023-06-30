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

// IMPORTAR SERVICIOS
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

// IMPORTAR COMPONENTES
import { DetalleCatHorarioComponent } from 'src/app/componentes/catalogos/catHorario/detalle/detalle-cat-horario/detalle-cat-horario.component';
import { RegistroHorarioComponent } from 'src/app/componentes/catalogos/catHorario/horario/registro-horario/registro-horario.component';
import { EditarHorarioComponent } from '../editar-horario/editar-horario.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

@Component({
  selector: 'app-principal-horario',
  templateUrl: './principal-horario.component.html',
  styleUrls: ['./principal-horario.component.css']
})

export class PrincipalHorarioComponent implements OnInit {

  // ALMACENAMIENTO DE DATOS Y BUSQUEDA
  horarios: any = [];
  ver_horarios: boolean = true;

  // FILTROS
  filtroNombreHorario = '';

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreHorarioF = new FormControl('', Validators.minLength(2));
  archivo1Form = new FormControl('');
  archivo2Form = new FormControl('');
  archivo3Form = new FormControl('');

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreHorarioForm: this.nombreHorarioF,
  });

  // VARIABLES USADAS EN SELECCIÓN DE ARCHIVOS
  nameFile: string;
  archivoSubido: Array<File>;

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // VARIABLES DE ALMACENAMIENTO DE USUARIO DE INICIO SESIÓN
  empleado: any = [];
  idEmpleado: number;

  // VARIABLE DE NAVEGABILIDAD
  hipervinculo: string = environment.url;

  constructor(
    public restEmpre: EmpresaService, // SERVICIO DATOS DE EMPRESA
    public validar: ValidacionesService, // VARIABLE USADA PARA CONTROL DE VALIDACIONES
    public ventana: MatDialog, // VARIABLES MANEJO DE VENTANAS
    public router: Router, // VARIABLE DE MANEJO DE RUTAS
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private rest: HorarioService, // SERVICIO DATOS DE HORARIO
    private restD: DetalleCatHorariosService, // SERVICIO DE DATOS DE DETALLES DE HORARIOS
    private toastr: ToastrService, // VARIABLE DE MANEJO DE NOTIFICACIONES
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.nameFile = '';
    this.ObtenerLogo();
    this.ObtenerColores();
    this.ObtenerHorarios();
    this.ObtenerEmpleados();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  ObtenerEmpleados() {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(this.idEmpleado).subscribe(data => {
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

  // METODO PARA MANEJAR PAGINAS DE TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA OBTENER HORARIOS
  ObtenerHorarios() {
    this.horarios = [];
    this.rest.BuscarListaHorarios().subscribe(datos => {
      this.horarios = datos;
    })
  }

  // METODO PARA ABRIR VENTANA REGISTRAR HORARIO
  AbrirVentanaRegistrarHorario(): void {
    this.ventana.open(RegistroHorarioComponent, { width: '800px' }).afterClosed().subscribe(items => {
      this.ObtenerHorarios();
    });
  }

  // METODO PARA ABRIR VENTANA REGISTRAR DETALLE DE HORARIO
  AbrirRegistraDetalle(datosSeleccionados: any): void {
    this.ventana.open(DetalleCatHorarioComponent,
      { width: '610px', data: { datosHorario: datosSeleccionados, actualizar: false } })
      .afterClosed().subscribe(items => {
        if (items) {
          this.ver_horarios = false;
          this.ver_detalles = true;
          this.pagina = 'lista-horarios';
          this.horario_id = items;
        }
      });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.setValue({
      nombreHorarioForm: '',
    });
    this.ObtenerHorarios();
  }

  // METODO PARA ABRIR VENTANA EDITAR HORARIO
  AbrirVentanaEditarHorario(datosSeleccionados: any): void {
    this.ventana.open(EditarHorarioComponent,
      { width: '900px', data: { horario: datosSeleccionados, actualizar: false } })
      .afterClosed().subscribe(items => {
        this.ObtenerHorarios();
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarDetalle(id_horario: any) {
    this.rest.EliminarRegistro(id_horario.id).subscribe(res => {
      // METODO PARA AUDITAR CATÁLOGO HORARIOS
      this.validar.Auditar('app-web', 'cg_horarios', id_horario, '', 'DELETE');
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerHorarios();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos);
        } else {
          this.router.navigate(['/horario/']);
        }
      });
  }

  // METODO PARA VISUALIZAR PANTALLA DE HORARIOS Y DETALLES
  ver_detalles: boolean = false;
  horario_id: number;
  pagina: string;
  VerDetallesHorario(id: number) {
    this.horario_id = id;
    this.ver_horarios = false;
    this.ver_detalles = true;
    this.pagina = 'lista-horarios';
  }



  /** ************************************************************************************************* ** 
   ** **                              PLANTILLA CARGAR SOLO HORARIOS                                 ** **
   ** ************************************************************************************************* **/

  fileChangeCatalogoHorario(element: any) {
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 17);
    console.log("funcion horario", itemName.toLowerCase());
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'catalogo horarios') {
        this.plantillaHorario();
      } else {
        this.toastr.error('Solo se acepta', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });
        this.archivo1Form.reset();
        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
        timeOut: 6000,
      });
      this.archivo1Form.reset();
      this.nameFile = '';
    }
  }

  plantillaHorario() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.VerificarDatosHorario(formData).subscribe(res => {
      if (res.message === 'error') {
        this.toastr.error('Para el buen funcionamiento del sistema verifique los datos de su plantilla. ' +
          'Son datos obligatorios: nombre de horario, horas de trabajo y tipo de horario, además el nombre ' +
          'de horario debe ser único en cada registro.', 'Operación Fallida', {
          timeOut: 6000,
        });
        this.archivo1Form.reset();
        this.nameFile = '';
      }
      else {
        this.rest.VerificarPlantillaHorario(formData).subscribe(res => {
          if (res.message === 'error') {
            this.toastr.error('Para el buen funcionamiento del sistema verifique los datos de su plantilla. ' +
              'Son datos obligatorios: nombre de horario, horas de trabajo y tipo de horario, además el nombre ' +
              'de horario debe ser único en cada registro.', 'Operación Fallida', {
              timeOut: 6000,
            });
            this.archivo1Form.reset();
            this.nameFile = '';
          }
          else {
            this.rest.CargarHorariosMultiples(formData).subscribe(res => {
              this.toastr.success('Operación exitosa.', 'Plantilla de Horario importada.', {
                timeOut: 6000,
              });
              this.archivo1Form.reset();
              this.nameFile = '';
              window.location.reload();
            });
          }
        });
      }
    });
  }

  /** *********************************************************************************************** ** 
   ** **                              PLANTILLA CARGAR SOLO DETALLES                               ** **
   ** *********************************************************************************************** **/
  nameFileDetalle: string;
  archivoSubidoDetalle: Array<File>;
  fileChangeDetalle(element) {
    this.archivoSubidoDetalle = element.target.files;
    this.nameFileDetalle = this.archivoSubidoDetalle[0].name;
    let arrayItems = this.nameFileDetalle.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 17);
    console.log(itemName.toLowerCase());
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'detalles horarios') {
        this.plantillaDetalle();
      } else {
        this.toastr.error('Solo se acepta', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });
        this.archivo2Form.reset();
        this.nameFileDetalle = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
        timeOut: 6000,
      });
      this.archivo2Form.reset();
      this.nameFileDetalle = '';
    }
  }

  plantillaDetalle() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubidoDetalle.length; i++) {
      formData.append("uploads[]", this.archivoSubidoDetalle[i], this.archivoSubidoDetalle[i].name);
    }
    this.restD.VerificarDatosDetalles(formData).subscribe(res => {
      if (res.message === 'error') {
        this.toastr.error('Para el buen funcionamiento del sistema verifique los datos de su plantilla. ' +
          'Son datos obligatorios: nombre de horario, orden, hora y tipo de accion, además el nombre ' +
          'de horario debe existir dentro del sistema.', 'Operación Fallida', {
          timeOut: 6000,
        });
        this.archivo2Form.reset();
        this.nameFileDetalle = '';
      }
      else {
        this.restD.CargarPlantillaDetalles(formData).subscribe(res => {
          this.toastr.success('Operación exitosa.', 'Plantilla de Detalle de Horario importada.', {
            timeOut: 6000,
          });
          this.archivo2Form.reset();
          this.nameFileDetalle = '';
        });
      }
    });
  }










  /** ************************************************************************************************* ** 
   ** **                                METODO PARA EXPORTAR A PDF                                   ** **
   ** ************************************************************************************************* **/

  // GENERAR ARCHIVO PDF
  GenerarPDF(action = 'open') {
    const documentDefinition = this.EstructurarPDF();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  // DEFINICION DEL DOCUMENTO PDF
  EstructurarPDF() {
    sessionStorage.setItem('Empleados', this.horarios);
    return {
      // ENCABEZADO DE PÁGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PÁGINA
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
        { text: 'Lista de Horarios', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.PresentarDataPDFEmpleados(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  // METODO PARA PRESENTAR DATOS DEL DOCUMENTO PDF
  PresentarDataPDFEmpleados() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Minutos de almuerzo', style: 'tableHeader' },
                { text: 'Horas de trabajo', style: 'tableHeader' },
                { text: 'Horario noturno', style: 'tableHeader' },
                { text: 'Requiere detalle', style: 'tableHeader' },
                { text: 'Documento', style: 'tableHeader' },
              ],
              ...this.horarios.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.min_almuerzo, style: 'itemsTableC' },
                  { text: obj.hora_trabajo, style: 'itemsTableC' },
                  { text: obj.noturno == true ? 'Sí' : 'No', style: 'itemsTableC' },
                  { text: obj.detalle == true ? 'Sí' : 'No', style: 'itemsTableC' },
                  { text: obj.doc_nombre, style: 'itemsTableC' },
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
   ** **                                 METODO PARA EXPORTAR A EXCEL                                ** **
   ** ************************************************************************************************* **/

  ExportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.horarios);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'horarios');
    xlsx.writeFile(wb, "CatHorariosEXCEL" + new Date().getTime() + '.xlsx');
  }

  /** ************************************************************************************************* ** 
   ** **                               METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************* **/

  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.horarios);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "CatHorarioCSV" + new Date().getTime() + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                           PARA LA EXPORTACIÓN DE ARCHIVOS XML                               ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    var objeto: any;
    var arregloHorarios: any = [];
    this.horarios.forEach(obj => {
      objeto = {
        "horario": {
          '@id': obj.id,
          "nombre": obj.nombre,
          "min_almuerzo": obj.min_almuerzo,
          "hora_trabajo": obj.hora_trabajo,
          "noturno": obj.nocturno,
          "requiere_detalle": obj.detalle,
          "documento": obj.documento,
          "doc_nombre": obj.doc_nombre,
        }
      }
      arregloHorarios.push(objeto)
    });

    this.rest.CrearXML(arregloHorarios).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/horario/xmlDownload/${this.data.name}`;
      window.open(this.urlxml, "_blank");
    });
  }

}
