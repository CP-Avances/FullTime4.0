// IMPORTACION DE LIBRERIAS
import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as xml2js from 'xml2js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTACION DE COMPONENTES
import { RegistroRolComponent } from 'src/app/componentes/catalogos/catRoles/registro-rol/registro-rol.component';
import { EditarRolComponent } from 'src/app/componentes/catalogos/catRoles/editar-rol/editar-rol.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

// IMPORTACION DE SERVICIOS
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { RolesService } from 'src/app/servicios/catalogos/catRoles/roles.service';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableRoles } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-vista-roles',
  templateUrl: './vista-roles.component.html',
  styleUrls: ['./vista-roles.component.css'],
})

export class VistaRolesComponent implements OnInit {

  ver_roles: boolean = true;
  ver_funciones: boolean = false;
  
  idEmpleado: number; // VARIABLE DE ID DE EMPLEADO QUE INICIA SESIÓN
  roles: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE ROLES
  empleado: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO
  rolesEliminar: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CAMPO DE BUSQUEDA DE DATOS
  buscarDescripcion = new FormControl('', Validators.minLength(2));

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantilla.color_Secundary }
  get p_color(): string { return this.plantilla.color_Primary }
  get logoE(): string { return this.plantilla.logoBase64 }
  get frase(): string { return this.plantilla.marca_Agua }

  constructor(
    private plantilla: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE DE MANEJO DE MENSAJES DE NOTIFICACIONES
    private router: Router, // VARAIBLE MANEJO DE RUTAS URL
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private rest: RolesService, // SERVICIO DATOS DE ROLES
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit() {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerRoles();
  }


  // METODO PARA MOSTRAR FILAS DETERMINADAS DE DATOS EN LA TABLA
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

  // METODO PARA OBTENER ROLES
  ObtenerRoles() {
    this.roles = [];
    this.rest.BuscarRoles().subscribe(res => {
      this.roles = res;
    });
  }

  /** ***************************************************************************** **
   ** **                  VENTANA PARA REGISTRAR Y EDITAR DATOS                  ** **
   ** ***************************************************************************** **/

  // METODO PARA EDITAR ROL
  AbrirVentanaEditar(datosSeleccionados: any): void {
    this.ventana.open(EditarRolComponent,
      { width: '400px', data: { datosRol: datosSeleccionados, actualizar: true } })
      .afterClosed().subscribe(items => {
        if (items == true) {
          this.ObtenerRoles();
        }
      });
  }

  // METODO PARA REGISTRAR ROL
  AbrirVentanaRegistrarRol() {
    this.ventana.open(RegistroRolComponent, { width: '400px' }).afterClosed().subscribe(items => {
      if (items == true) {
        this.ObtenerRoles();
      }
    });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionRoles.clear();
    this.rolesEliminar = [];
  }

  // METODO PARA LIMPIAR CAMPOS DE BUSQUEDA
  LimpiarCampoBuscar() {
    this.buscarDescripcion.reset();
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

  // METODO PARA ABRIR PAGINA LISTA DE FUNCIONES
  rol_id: number = 0;
  VerFunciones(id_rol: number) {
    this.rol_id = id_rol;
    //console.log('ver rol --- ', this.rol_id)
    this.ver_roles = false;
    this.ver_funciones = true;
  }


  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS PDF                              ** **
   ** ************************************************************************************************* **/

  // METODO PARA CREAR ARCHIVO PDF
  GenerarPdf(action = 'open') {
    this.OrdenarDatos(this.roles);
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Roles' + '.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.ObtenerRoles();
  }

  GetDocumentDefinicion() {
    sessionStorage.setItem('Roles', this.roles);
    return {
      // ENCABEZADO DE LA PAGINA
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por: ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
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
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logoE, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Roles del Sistema', bold: true, fontSize: 16, alignment: 'center', margin: [0, -10, 0, 10] },
        this.PresentarDataPDFRoles(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  // ESTRUCTURA DEL ARCHIVO PDF
  PresentarDataPDFRoles() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: [50, 150],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
              ],
              ...this.roles.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.nombre, style: 'itemsTable' },
                ];
              })
            ],
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
   ** **                             PARA LA EXPORTACION DE ARCHIVOS EXCEL                           ** **
   ** ************************************************************************************************* **/

  ExportToExcel() {
    this.OrdenarDatos(this.roles);
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.roles.map((obj: any) => {
      return {
        CODIGO: obj.id,
        NOMBRE_ROL: obj.nombre
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.roles[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTA ROLES');
    xlsx.writeFile(wb, "RolesEXCEL" + '.xlsx');
    this.ObtenerRoles();
  }

  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS XML                           ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    this.OrdenarDatos(this.roles);
    var objeto: any;
    var arregloRoles: any = [];
    this.roles.forEach((obj: any) => {
      objeto = {
        "rol": {
          "$": { "id": obj.id },
          "nombre": obj.nombre,
        }
      }
      arregloRoles.push(objeto)
    });
    const xmlBuilder = new xml2js.Builder({ rootName: 'Roles' });
    const xml = xmlBuilder.buildObject(arregloRoles);

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
    a.download = 'Roles.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
    this.ObtenerRoles();
  }

  /** ************************************************************************************************** **
   ** **                                     METODO PARA EXPORTAR A CSV                               ** **
   ** ************************************************************************************************** **/

  ExportToCVS() {
    this.OrdenarDatos(this.roles);
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.roles);
    const csvDataC = xlsx.utils.sheet_to_csv(wsr);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "RolesCSV" + '.csv');
    this.ObtenerRoles();
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

  selectionRoles = new SelectionModel<ITableRoles>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionRoles.selected.length;
    return numSelected === this.roles.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionRoles.clear() :
      this.roles.forEach((row: any) => this.selectionRoles.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableRoles): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.rolesEliminar = this.selectionRoles.selected;
    //console.log('paginas para Eliminar',this.paginasEliminar);
    //console.log(this.selectionPaginas.selected)
    return `${this.selectionRoles.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(rol: any) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.rest.EliminarRoles(rol.id, datos).subscribe((res: any) => {

      if (res.message === 'error') {
        this.toastr.error('No se puede eliminar.', '', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerRoles();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos);
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.rolesEliminar = [];
          this.selectionRoles.clear();
          this.ObtenerRoles();
        } else {
          this.router.navigate(['/roles']);
        }
      });
  }

  // FUNCION PARA ELIMINAR LOS REGISTROS SELECCIONADOS
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.ingresar = false;
    this.contador = 0;
    this.rolesEliminar = this.selectionRoles.selected;
    this.rolesEliminar.forEach((datos: any) => {
      this.roles = this.roles.filter(item => item.id !== datos.id);
      this.contador = this.contador + 1;
      this.rest.EliminarRoles(datos.id, data).subscribe((res: any) => {
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
          this.ObtenerRoles();
        }
      });
    }
    )
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO LOS REGISTROS
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.rolesEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.rolesEliminar = [];
            this.selectionRoles.clear();
            this.ObtenerRoles();
          } else {
            this.toastr.warning('No ha seleccionado ROLES.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/roles']);
        }
      });
  }
}
