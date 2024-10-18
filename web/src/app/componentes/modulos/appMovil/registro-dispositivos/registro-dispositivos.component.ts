import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

// LIBRERIAS DE ARCHIVOS
import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// MODELOS
import { ItableDispositivos } from 'src/app/model/reportes.model';

// COMPONENTES
import { DeleteRegistroDispositivoComponent } from '../delete-registro-dispositivo/delete-registro-dispositivo.component';

// SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { AsignacionesService } from 'src/app/servicios/asignaciones/asignaciones.service';

@Component({
  selector: 'app-registro-dispositivos',
  templateUrl: './registro-dispositivos.component.html',
  styleUrls: ['./registro-dispositivos.component.css']
})

export class RegistroDispositivosComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO
  dispositivosRegistrados: any = [];
  dispositivo: any = [];

  // DATOS DE EMPLEADO
  empleado: any = [];
  idEmpleado: number;

  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION
  idUsuariosAcceso: Set<any> = new Set();

  // VALIDAR ELIMINAR PROCESO CON FILTROS
  ocultar: boolean = false;

  // FORMULARIO
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // DATOS BOOLEANOS
  BooleanAppMap: any = { 'true': 'Si', 'false': 'No' };

  // BUSQUEDA DE MODULOS ACTIVOS
  get habilitarMovil(): boolean { return this.funciones.app_movil; }

  // ALMACENAMIENTO DATOS SELECCIONADOS
  selectionEmp = new SelectionModel<ItableDispositivos>(true, []);

  // DIRECCIONAMIENTO DE RUTAS
  hipervinculo: string = environment.url;

  // CONTROL DE BOTONES
  individual: boolean = true;
  multiple: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private usuariosService: UsuarioService,
    private funciones: MainNavService,
    private validar: ValidacionesService,
    private ventana: MatDialog,
    private toastr: ToastrService,
    private rest: RelojesService,
    public restEmpre: EmpresaService,
    public restE: EmpleadoService,
    private asignaciones: AsignacionesService,
  ) { this.idEmpleado = parseInt(localStorage.getItem('empleado') as string); }

  ngOnInit(): void {
    if (this.habilitarMovil === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Aplicación Móvil. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);
      this.user_name = localStorage.getItem('usuario');
      this.ip = localStorage.getItem('ip');

      this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;

      this.ObtenerLogo();
      this.ObtenerColores();
      this.ObtenerEmpleados(this.idEmpleado);
      this.ObtenerDispositivosRegistrados();
    }
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA ACTIVAR O DESACTIVAR CHECK LIST DE LAS TABLAS
  habilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.multiple === false) {
      this.multiple = true;
      this.individual = false;
    }
    else {
      this.selectionEmp.clear();
      this.multiple = false;
      this.individual = true;
    }

    if (this.habilitar === false) {
      this.habilitar = true;

      if (this.nombre.value != undefined) {
        if ((this.nombre.value).length > 1) {
          this.ocultar = true;
        } else {
          this.ocultar = false;
        }
      }

      if (this.codigo.value != undefined) {
        if ((this.codigo.value).length > 0) {
          this.ocultar = true;
        } else {
          this.ocultar = false;
        }
      }

      if (this.cedula.value != undefined) {
        if ((this.cedula.value).length > 1) {
          this.ocultar = true;
        } else {
          this.ocultar = false;
        }
      }

    } else {
      this.habilitar = false;
      this.selectionEmp.clear();
    }
  }

  // METODO PARA LISTAR DISPOSITIVOS
  ObtenerDispositivosRegistrados() {
    this.dispositivosRegistrados = [];
    this.usuariosService.BuscarDispositivoMovil().subscribe(res => {
      this.dispositivosRegistrados = res;
      if (this.rolEmpleado !== 1) {
        this.dispositivosRegistrados = this.dispositivosRegistrados.filter((item: any) => this.idUsuariosAcceso.has(item.id_empleado));
      }
    }, err => {
      this.toastr.info(err.error.message);
    })
  }

  // METODO PARA ABRIR VENTANA ELIMINAR REGISTROS
  AbrirVentanaEliminar(datos: any) {
    if (datos === 1) {
      this.EliminarRegistro(this.selectionEmp.selected);
    }
    else {
      var data = [datos];
      this.EliminarRegistro(data);
    }
  }

  // METODO PARA ELIMINAR REGISTROS
  EliminarRegistro(array: any) {
    this.habilitar = false;
    this.multiple = false;
    this.individual = true;

    const datos = {
      user_name: this.user_name,
      ip: this.ip,
    }

    // VALIDAR SELECCION DE REGISTROS
    if (array.length === 0) return this.toastr.
      warning('Debe seleccionar al menos un usuario para modificar su acceso al reloj virtual.');
    // ABRIR VENTANA CONFIRMACION DE ELIMINACION
    this.ventana.open(DeleteRegistroDispositivoComponent,
      { width: '400px', data: array }).afterClosed().subscribe(result => {
        if (result) {
          result.forEach((item: any) => {
            this.dispositivo.push(item.id_dispositivo);
          });
          this.usuariosService.EliminarDispositivoMovil(this.dispositivo, datos).subscribe(res => {
            this.toastr.success('Registros eliminados exitosamente.');
            this.ObtenerDispositivosRegistrados();
            this.selectionEmp.clear();
            this.multiple = false;
            this.individual = true;
            this.habilitar = false;
            this.numero_pagina = 1;
          }, err => {
            this.toastr.error(err.error.message)
          })
        }
      }, () => {
        this.individual = true;
        this.multiple = false;
      })
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.dispositivosRegistrados.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleEmp() {
    this.isAllSelectedEmp() ?
      this.selectionEmp.clear() :
      this.dispositivosRegistrados.forEach((row: any) => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmp(row?: ItableDispositivos): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // EVENTO DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    this.ocultar = true;
    return this.validar.IngresarSoloNumeros(evt)
  }

  // VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    this.ocultar = true;
    return this.validar.IngresarSoloLetras(e);
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

  /** ********************************************************************************* **
   ** **                        GENERACION DE PDFs                                   ** **
   ** ********************************************************************************* **/

  generarPdf(action = 'open') {
    const documentDefinition = this.DefinirInformacionPDF();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
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
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Lista de Dispositivos Registrados', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFRelojes(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 9 },
        itemsTableC: { fontSize: 9, alignment: 'center' }
      }
    };
  }

  presentarDataPDFRelojes() {
    let count = 1;
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'N#', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Codigo', style: 'tableHeader' },
                { text: 'Cedula', style: 'tableHeader' },
                { text: 'Id dispositivo', style: 'tableHeader' },
                { text: 'Modelo dispositivo', style: 'tableHeader' },
              ],
              ...this.dispositivosRegistrados.map((obj: any) => {
                return [
                  { text: count++, style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.codigo, style: 'itemsTableC' },
                  { text: obj.cedula, style: 'itemsTableC' },
                  { text: obj.id_dispositivo, style: 'itemsTable' },
                  { text: obj.modelo_dispositivo, style: 'itemsTable' },
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

  /** ********************************************************************************* **
   ** **                              GENERACION DE EXCEL                            ** **
   ** ********************************************************************************* **/

  exportToExcel() {
    var objeto: any;
    var cont: number = 1;
    var ListaDispositivosRegistrados: any = [];
    this.dispositivosRegistrados.forEach((obj: any) => {
      objeto = {
        'N#': cont++,
        "CODIGO": obj.codigo,
        "NOMBRE": obj.nombre,
        "CEDULA": obj.cedula,
        "ID DISPOSITIVOS": obj.id_dispositivo,
        "MODELO": obj.modelo_dispositivo,
      }
      ListaDispositivosRegistrados.push(objeto);
    });
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(ListaDispositivosRegistrados);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'dispositivos');
    xlsx.writeFile(wb, "DispositivosEXCEL" + new Date().getTime() + '.xlsx');
  }

  /** ********************************************************************************************** **
   ** **                              METODO PARA EXPORTAR A CSV                                  ** **
   ** ********************************************************************************************** **/

  exportToCVS() {
    var objeto: any;
    var cont: number = 1;
    var ListaDispositivosRegistrados: any = [];
    this.dispositivosRegistrados.forEach((obj: any) => {
      objeto = {
        'N#': cont++,
        "CODIGO": obj.codigo,
        "NOMBRE": obj.nombre,
        "CEDULA": obj.cedula,
        "ID DISPOSITIVOS": obj.id_dispositivo,
        "MODELO": obj.modelo_dispositivo,
      }
      ListaDispositivosRegistrados.push(objeto);
    });
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(ListaDispositivosRegistrados);
    const csvDataR = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataR], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "DispositivosCSV" + new Date().getTime() + '.csv');
  }

  /** ********************************************************************************************** **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS XML                             ** **
   ** ********************************************************************************************** **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto: any;
    var arregloDispositivos: any = [];
    let count: number = 0;
    this.dispositivosRegistrados.forEach((obj: any) => {
      objeto = {
        "dispositivo_moviles": {
          '@id': count++,
          "nombre": obj.nombre,
          "codigo": obj.codigo,
          "cedula": obj.cedula,
          "id_dispositivo": obj.id_dispositivo,
          "modelo_dispositivo": obj.modelo_dispositivo,
        }
      }
      arregloDispositivos.push(objeto)
    });
    const xmlBuilder = new xml2js.Builder({ rootName: 'Roles' });
    const xml = xmlBuilder.buildObject(arregloDispositivos);

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
    a.download = 'Dipositivos.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
    this.ObtenerDispositivosRegistrados();
  }


}
