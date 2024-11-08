// IMPORTACION DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';
const pdfMake = require('src/assets/build/pdfmake.js');
const pdfFonts = require('src/assets/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { environment } from 'src/environments/environment';

import { RegistrarSucursalesComponent } from '../registrar-sucursales/registrar-sucursales.component';
import { EditarSucursalComponent } from 'src/app/componentes/configuracion/localizacion/sucursales/editar-sucursal/editar-sucursal.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { AsignacionesService } from 'src/app/servicios/usuarios/asignaciones/asignaciones.service';
import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { CiudadService } from 'src/app/servicios/configuracion/localizacion/ciudad/ciudad.service';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableSucursales } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-lista-sucursales',
  templateUrl: './lista-sucursales.component.html',
  styleUrls: ['./lista-sucursales.component.css']
})

export class ListaSucursalesComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  sucursalesEliminar: any = [];

  buscarNombre = new FormControl('', [Validators.minLength(2)]);
  buscarCiudad = new FormControl('', [Validators.minLength(2)]);
  buscarEmpresa = new FormControl('', [Validators.minLength(2)]);

  public formulario = new FormGroup({
    buscarNombreForm: this.buscarNombre,
    buscarCiudadForm: this.buscarCiudad,
    buscarEmpresForm: this.buscarEmpresa
  });

  archivoForm = new FormControl('', Validators.required);

  sucursales: any = [];
  establecimientosCorrectos: number = 0;

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  empleado: any = [];
  idEmpleado: number;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idSucursalesAcceso: Set<any> = new Set();
  idDepartamentosAcceso: Set<any> = new Set();

  expansion: boolean = false;

  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = environment.url

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private rest: SucursalService,
    private serviciudades: CiudadService,
    private toastr: ToastrService,
    private router: Router,
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public restE: EmpleadoService,
    private asignaciones: AsignacionesService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);

    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;
    this.idSucursalesAcceso = this.asignaciones.idSucursalesAcceso;

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
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
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
    this.numero_pagina = 1;
    this.rest.BuscarSucursal().subscribe(data => {
      this.sucursales = this.rolEmpleado === 1 ? data : this.FiltrarSucursalesAsignadas(data);
    });
  }

  // METODO PARA FILTRAR SUCURSALES ASIGNADAS
  FiltrarSucursalesAsignadas(data: any) {
    return data.filter((sucursal: any) => this.idSucursalesAcceso.has(sucursal.id));
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
    this.ObtenerSucursal();
    this.activar_seleccion = true;

    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionSucursales.clear();
    this.sucursalesEliminar = [];

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
    this.ObtenerSucursal();
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
    const documentDefinition = this.DefinirInformacionPDF();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Establecimientos.pdf'); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'portrait',
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
        { text: 'LISTA DE SUCURSALES', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.presentarDataPDFSucursales(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8 },
        itemsTableC: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 5, 0, 0] },
      }
    };
  }

  presentarDataPDFSucursales() {
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
                { text: 'SUCURSAL/ ESTABLECIMIENTO', style: 'tableHeader' },
                { text: 'CIUDAD', style: 'tableHeader' }
              ],
              ...this.sucursales.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
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
    var listExcelSucursales: any = [];
    this.sucursales.forEach((item: any) => {
      var data: any = {
        id: '',
        ciudad: '',
        nombre: '',
      }

      data.id = item.id;
      data.ciudad = item.descripcion;
      data.nombre = item.nombre;

      listExcelSucursales.push(data);
    })

    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(listExcelSucursales);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Establecimientos');
    xlsx.writeFile(wb, "Establecimientos" + '.xlsx');
  }

  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A CSV                              ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    var listExcelSucursales: any = [];
    this.sucursales.forEach((item: any) => {
      var data: any = {
        id: '',
        ciudad: '',
        nombre: '',
      }

      data.id = item.id;
      data.ciudad = item.descripcion;
      data.nombre = item.nombre;

      listExcelSucursales.push(data);
    })

    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(listExcelSucursales);
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
    this.sucursales.forEach((obj: any) => {
      objeto = {
        "establecimiento": {
          "$": { "id": obj.id },
          "ciudad": obj.descripcion,
          "establecimiento": obj.nombre,
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
    a.download = 'Estamblecimientos.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }


  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  nameFile: string;
  archivoSubido: Array<File>;
  mostrarbtnsubir: boolean = false;
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE SUCURSALES
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
  Datasucursales: any;
  messajeExcel: string = '';
  Revisarplantilla() {
    this.listSucursalesCorrectas = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      this.Datasucursales = res.data;
      this.messajeExcel = res.message;

      this.Datasucursales.sort((a: any, b: any) => {
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
        this.toastr.error('No se ha encontrado pestaña SUCURSALES en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        // SEPARA LLAS FILAS QUE ESTAN CON LA OBSERVACION OK PARA LUEGO REGISTRAR EN LA BASE.
        this.Datasucursales.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {

            const nombre = item.nom_sucursal.charAt(0).toUpperCase() + item.nom_sucursal.slice(1);
            const ciudad = this.datosCiudades.find((ciudad: any) => ciudad.nombre.toLowerCase() === item.ciudad.toLowerCase());

            const sucursal = {
              nombre: nombre,
              id_ciudad: ciudad.id,
              id_empresa: '1',
            }
            this.listSucursalesCorrectas.push(sucursal);
          }
        });

        this.establecimientosCorrectos = this.listSucursalesCorrectas.length;

        if (this.listSucursalesCorrectas.length > 0) {
          this.btn_registrar = false;
        }
      }
    }, error => {
      this.toastr.error('Error al cargar los datos', 'Plantilla no aceptada', {
        timeOut: 4000,
      });
      this.messajeExcel = 'error';
    });
  }


  // METODO PARA LISTAR CIUDADES
  datosCiudades: any = [];
  ciudad: any = [];
  ListarCiudades(ciudadd: string) {
    this.ciudad = [];
    this.ciudad = this.datosCiudades.filter((item: any) => item.id == ciudadd);
    if (this.ciudad[0]) {
      return this.ciudad[0].nombre
    } else {
      return 'No registrada'
    }
  }

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.RegistrarSucursales();
        }
      });
  }

  // METODO PARA REGISTRAR SUCURSALES
  listSucursalesCorrectas: any = [];
  btn_registrar: boolean = true;
  RegistrarSucursales() {
    if (this.listSucursalesCorrectas.length > 0) {
      let data = {
        sucursales: this.listSucursalesCorrectas,
        user_name: this.user_name,
        ip: this.ip,
      }
      this.rest.RegistrarSucursales(data).subscribe({
        next: (res: any) => {
          this.toastr.success('Plantilla de Sucursales importada.', 'Operación exitosa.', {
            timeOut: 10000,
          });
          this.LimpiarCampoBuscar();

        }, error: (error: any) => {
          this.toastr.error('No se pudo cargar la plantilla', 'Ups !!! algo salio mal', {
            timeOut: 6000,
          });
        }
      });
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


  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  colorCelda: string = ''
  EstiloCelda(observacion: string): string {
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
  EstiloTextoCelda(texto: string): string {
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

    return `${this.selectionSucursales.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;

  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_sucursal: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.rest.EliminarRegistro(id_sucursal, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
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
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.sucursalesEliminar = [];
          this.selectionSucursales.clear();
          this.ObtenerSucursal();
        } else {
          this.router.navigate(['/sucursales']);
        }
      });
  }

  // METODO DE ELIMINACION MULTIPLE
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.ingresar = false;
    this.contador = 0;
    this.sucursalesEliminar = this.selectionSucursales.selected;
    this.sucursalesEliminar.forEach((datos: any) => {
      this.datosCiudades = this.datosCiudades.filter(item => item.id !== datos.id);
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
          this.ObtenerSucursal();
        }
      });
    }
    )
  }

  // METOOD DE CONFIRMACION DE ELIMINACION
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.sucursalesEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.sucursalesEliminar = [];
            this.selectionSucursales.clear();
            this.ObtenerSucursal();
          } else {
            this.toastr.warning('No ha seleccionado SUCURSALES.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/sucursales']);
        }
      });
  }

}
