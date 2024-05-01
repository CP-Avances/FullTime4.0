// IMPORTACION DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xml2js from 'xml2js';

import { RegistrarSucursalesComponent } from '../registrar-sucursales/registrar-sucursales.component';
import { EditarSucursalComponent } from 'src/app/componentes/catalogos/catSucursal/editar-sucursal/editar-sucursal.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { CiudadService } from 'src/app/servicios/ciudad/ciudad.service';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableSucursales } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-lista-sucursales',
  templateUrl: './lista-sucursales.component.html',
  styleUrls: ['./lista-sucursales.component.css']
})

export class ListaSucursalesComponent implements OnInit {

  sucursalesEliminar: any = [];

  buscarNombre = new FormControl('', [Validators.minLength(2)]);
  buscarCiudad = new FormControl('', [Validators.minLength(2)]);
  buscarEmpresa = new FormControl('', [Validators.minLength(2)]);
  filtroNombreSuc = '';
  filtroCiudadSuc = '';
  filtroEmpresaSuc = '';

  public formulario = new FormGroup({
    buscarNombreForm: this.buscarNombre,
    buscarCiudadForm: this.buscarCiudad,
    buscarEmpresForm: this.buscarEmpresa
  });

  archivoForm = new FormControl('', Validators.required);

  sucursales: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  empleado: any = [];
  idEmpleado: number;

  expansion: boolean = false;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  constructor(
    private rest: SucursalService,
    private serviciudades: CiudadService,
    private toastr: ToastrService,
    private router: Router,
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public restE: EmpleadoService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerSucursal();
    this.ObtenerColores();
    this.ObtenerLogo();


    this.serviciudades.ListarNombreCiudadProvincia().subscribe(datos => {
      this.datosCiudades = datos;
    });
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

  // METODO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }
  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  // METODO PARA BUSCAR SUCURSALES
  ObtenerSucursal() {

    this.sucursales = [];
    this.rest.BuscarSucursal().subscribe(data => {
      this.sucursales = data;
    });
  }

  // METODO PARA REGISTRAR SUCURSAL
  AbrirVentanaRegistrar() {
    this.ventana.open(RegistrarSucursalesComponent, { width: '650px' })
      .afterClosed().subscribe(items => {
        if (items) {
          if (items > 0) {
            this.VerDepartamentos(items);
          }
        }
      });
  }

  // METODO PARA EDITAR SUCURSAL
  AbrirVentanaEditar(datosSeleccionados: any): void {
    this.ventana.open(EditarSucursalComponent, { width: '650px', data: datosSeleccionados })
      .afterClosed().subscribe(items => {
        if (items) {
          if (items > 0) {
            this.VerDepartamentos(items);
          }
        }
      });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampoBuscar() {
    this.Datasucursales = null;
    this.formulario.setValue({
      buscarNombreForm: '',
      buscarCiudadForm: '',
      buscarEmpresForm: ''
    });
    this.ObtenerSucursal();
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';
  }

  // METODO PARA VALIDAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }


  // METODO PARA VER DATOS DE DEPARTAMENTOS DE SUCURSAL
  ver_departamentos: boolean = false;
  sucursal_id: number;
  ver_lista: boolean = true;
  pagina: string = '';
  VerDepartamentos(id: number) {
    this.pagina = 'lista-sucursal';
    this.ver_lista = false;
    this.sucursal_id = id;
    this.ver_departamentos = true;
  }

  /** ************************************************************************************************** ** 
   ** **                                      METODO PARA EXPORTAR A PDF                              ** **
   ** ************************************************************************************************** **/
  generarPdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinicion();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Establecimientos.pdf'); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicion() {
    sessionStorage.setItem('Establecimientos', this.sucursales);
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'portrait',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
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
        { text: 'Lista de Establecimientos', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFSucursales(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  presentarDataPDFSucursales() {
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
                { text: 'Empresa', style: 'tableHeader' },
                { text: 'Establecimiento', style: 'tableHeader' },
                { text: 'Ciudad', style: 'tableHeader' }
              ],
              ...this.sucursales.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.nomempresa, style: 'itemsTable' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' }
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
   ** **                                      METODO PARA EXPORTAR A EXCEL                            ** **
   ** ************************************************************************************************** **/
  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.sucursales);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Establecimientos');
    xlsx.writeFile(wb, "Establecimientos" + '.xlsx');
  }

  /** ************************************************************************************************** ** 
   ** **                                      METODO PARA EXPORTAR A CSV                              ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.sucursales);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "EstablecimientosCSV" + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                                PARA LA EXPORTACION DE ARCHIVOS XML                          ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloSucursales: any = [];
    this.sucursales.forEach(obj => {
      objeto = {
        "establecimiento": {
          "$": { "id": obj.id },
          "empresa": obj.nomempresa,
          "establecimiento": obj.nombre,
          "ciudad": obj.descripcion,
        }
      }
      arregloSucursales.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Establecimientos' });
    const xml = xmlBuilder.buildObject(arregloSucursales);

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
    a.download = 'Estamblecimientos.xml';
    // Simular un clic en el enlace para iniciar la descarga
    a.click();
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
    let itemName = arrayItems[0].slice(0, 10);
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'sucursales') {
        this.numero_paginaMul = 1;
        this.tamanio_paginaMul = 5;
        this.Revisarplantilla();
      } else {
        this.toastr.error('Seleccione plantilla con nombre Sucursales.', 'Plantilla seleccionada incorrecta', {
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

  Datasucursales: any;
  messajeExcel: string = '';
  // METODO PARA ENVIAR MENSAJES DE ERROR O CARGAR DATOS SI LA PLANTILLA ES CORRECTA
  Revisarplantilla() {
    this.listSucursalesCorrectas = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    this.progreso = true;

    // VERIFICACIÓN DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      this.Datasucursales = res.data;
      this.messajeExcel = res.message;

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      } else {
        //Separa llas filas que estan con la observacion OK para luego registrar en la base.
        this.Datasucursales.forEach(item => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listSucursalesCorrectas.push(item);
          }
        });
        if (this.listSucursalesCorrectas.length > 0) {
          this.btn_registrar = false;
        }
      }



    }, error => {
      console.log('Serivicio rest -> metodo RevisarFormato - ', error);
      this.toastr.error('Error al cargar los datos', 'Plantilla no aceptada', {
        timeOut: 4000,
      });
      this.progreso = false;
      this.messajeExcel = 'error';
    }, () => {
      this.progreso = false;
    });

  }


  // METODO PARA LISTAR CIUDADES
  datosCiudades: any = [];
  ciudad: any = [];
  ListarCiudades(ciudadd): string {
    this.ciudad = [];
    this.ciudad = this.datosCiudades.filter((item: any) => item.id == ciudadd);
    if (this.ciudad[0]) {
      return this.ciudad[0].nombre
    } else {
      return 'No registrada'
    }
  }

  //FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE LOS FERIADOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.registrarSucursales();
        }
      });
  }

  listSucursalesCorrectas: any = [];
  btn_registrar: boolean = true;
  registrarSucursales() {
    var data = {
      nombre: '',
      id_ciudad: '',
      id_empresa: ''
    }

    if (this.listSucursalesCorrectas.length > 0) {
      console.log('lista sucursales correctas: ', this.listSucursalesCorrectas.length);
      var cont = 0;
      this.listSucursalesCorrectas.forEach(item => {
        this.datosCiudades.forEach(valor => {
          if (item.ciudad.toLowerCase() == valor.nombre.toLowerCase()) {
            data.nombre = item.nom_sucursal;
            data.id_ciudad = valor.id;
            data.id_empresa = '1';

            // Capitalizar la primera letra de la primera palabra
            const textonombre = data.nombre.charAt(0).toUpperCase();
            const restoDelTexto = data.nombre.slice(1);

            data.nombre = textonombre + restoDelTexto

            this.rest.RegistrarSucursal(data).subscribe(res => {
              cont = cont + 1;
              if (this.listSucursalesCorrectas.length == cont) {
                this.toastr.success('Operación exitosa.', 'Plantilla de Sucursales importada.', {
                  timeOut: 10000,
                });
                this.LimpiarCampoBuscar();
              }
            })
          }
        })

      })
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


  //Metodo para dar color a las celdas y representar las validaciones
  colorCelda: string = ''
  stiloCelda(observacion: string): string {
    let arrayObservacion = observacion.split(" ");
    arrayObservacion[0]
    if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    }
    else if (observacion == 'Ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
    }
    else if (arrayObservacion[0] == 'Ciudad' && arrayObservacion[1] == 'no' && arrayObservacion[2] == 'existe') {
      return 'rgb(255, 192, 203)';
    }
    else if (arrayObservacion[0] == 'Ciudad' || arrayObservacion[0] == 'Sucursal') {
      return 'rgb(242, 21, 21)';
    }
    else if (observacion == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    }
    else {
      return 'rgb(251, 73, 18)';
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

  selectionSucursales = new SelectionModel<ITableSucursales>(true, []);



  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionSucursales.selected.length;
    return numSelected === this.sucursales.length;
  }


  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionSucursales.clear() :
      this.sucursales.forEach((row: any) => this.selectionSucursales.select(row));
  }


  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableSucursales): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.sucursalesEliminar = this.selectionSucursales.selected;
    //console.log('paginas para Eliminar',this.paginasEliminar);

    //console.log(this.selectionPaginas.selected)
    return `${this.selectionSucursales.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;

  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_sucursal: number) {
    this.rest.EliminarRegistro(id_sucursal).subscribe(res => {
      if (res.message === 'error') {
        this.toastr.error('No se puede elminar.', '', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerSucursal();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/sucursales']);
        }
      });

    this.ObtenerSucursal();

  }


  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {


    this.ingresar = false;
    this.contador = 0;

    this.sucursalesEliminar = this.selectionSucursales.selected;
    this.sucursalesEliminar.forEach((datos: any) => {



      this.datosCiudades = this.datosCiudades.filter(item => item.id !== datos.id);

      this.contador = this.contador + 1;
      this.rest.EliminarRegistro(datos.id).subscribe(res => {
        if (res.message === 'error') {

          this.toastr.error('No se puede elminar ', datos.nombre, {
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
          this.ObtenerSucursal();

        }
      });


    }
    )
  }


  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {

          if (this.sucursalesEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;

            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.selectionSucursales.clear();

          } else {
            this.toastr.warning('No ha seleccionado SUCURSALES.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/sucursales']);
        }
      });

    this.ObtenerSucursal();

  }



}
