// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ScriptService } from 'src/app/servicios/empleado/script.service';
import { ThemePalette } from '@angular/material/core';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
import * as moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { AsignacionesService } from 'src/app/servicios/asignaciones/asignaciones.service';

import { RegistroDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/registro-departamento/registro-departamento.component';
import { EditarDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/editar-departamento/editar-departamento.component';
import { VerDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/ver-departamento/ver-departamento.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableDepartamentos } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-principal-departamento',
  templateUrl: './principal-departamento.component.html',
  styleUrls: ['./principal-departamento.component.css']
})

export class PrincipalDepartamentoComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // ALMACENAMIENTO DE DATOS CONSULTADOS Y FILTROS DE BUSQUEDA
  departamentosEliminar: any = [];
  departamentos: any = [];
  depainfo: any = [];
  empleado: any = [];
  idEmpleado: number;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idDepartamentosAcceso: Set<any> = new Set();

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  departamentoPadreF = new FormControl('');
  departamentoF = new FormControl('');
  buscarNombre = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    departamentoPadreForm: this.departamentoPadreF,
    departamentoForm: this.departamentoF,
    buscarNombreForm: this.buscarNombre,
  });

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  nameFile: string;
  archivoSubido: Array<File>;
  archivoForm = new FormControl('', Validators.required);

  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = environment.url

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private asignacionesService: AsignacionesService,
    private scriptService: ScriptService,
    private toastr: ToastrService,
    private router: Router,
    private rest: DepartamentosService,
    public restE: EmpleadoService,
    public ventana: MatDialog,
    public restEmpre: EmpresaService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
    this.scriptService.load('pdfMake', 'vfsFonts');
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);

    this.idDepartamentosAcceso = this.asignacionesService.idDepartamentosAcceso;

    this.ObtenerEmpleados(this.idEmpleado);
    this.ListaDepartamentos();
    this.ObtenerColores();
    this.ObtenerLogo();
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

  // CONTROL DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }


  niveles: number = 0;
  depaSuperior: string = '';
  // METODO PARA BUSCAR DEPARTAMENTOS
  ListaDepartamentos() {
    this.departamentos = []
    this.rest.ConsultarDepartamentos().subscribe(datos => {
      this.departamentos = this.rolEmpleado === 1 ? datos : this.FiltrarDepartamentosAsignados(datos);
      this.OrdenarDatos(this.departamentos);
    })
  }

  // METODO PARA FILTRAR DEPARTAMENTOS ASIGNADOS
  FiltrarDepartamentosAsignados(data: any) {
    return data.filter((departamento: any) => this.idDepartamentosAcceso.has(departamento.id));
  }

  // METODO PARA ABRIR VENTANA DE REGISTRO DE DEPARTAMENTO
  AbrirVentanaRegistrarDepartamento(): void {
    this.ventana.open(RegistroDepartamentoComponent,
      { width: '500px' }).afterClosed().subscribe(item => {
        this.ListaDepartamentos();
      });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionDepartamentos.clear();
    this.departamentosEliminar = [];
  }

  // VENTANA PARA EDITAR DATOS DE DEPARTAMENTO
  AbrirEditarDepartamento(departamento: any): void {
    this.ventana.open(EditarDepartamentoComponent,
      { width: '400px', data: { data: departamento, establecimiento: false } })
      .afterClosed().subscribe(item => {
        this.ListaDepartamentos();
      });
  }

  // METODO PARA ABRIR VENTANA DE EDICION DE DEPARTAMENTO
  AbrirVentanaVerDepartamento(departamento: any): void {
    this.ventana.open(VerDepartamentoComponent,
      { width: '650px', data: departamento }).afterClosed().subscribe(item => {
        this.ListaDepartamentos();
      });
  }

  // METODO PARA LIMPIRA FORMULARIO
  LimpiarCampos() {
    this.DataDepartamentos = null;
    this.archivoSubido = [];
    this.nameFile = '';
    this.formulario.setValue({
      departamentoForm: '',
      departamentoPadreForm: '',
      buscarNombreForm: '',
    });
    this.ListaDepartamentos();
    this.ngOnInit();
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';
  }

  // ORDENAR LOS DATOS SEGUN EL ID
  OrdenarDatos(array: any) {
    function compare(a: any, b: any) {
      if (a.nomsucursal < b.nomsucursal) {
        return -1;
      }
      if (a.nomsucursal > b.nomsucursal) {
        return 1;
      }
      return 0;
    }
    array.sort(compare);
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  // METODO PARA NAVEGAR A PANTALLA DE NIVELES
  data_id: number = 0;
  ver_nivel: boolean = false;
  ver_departamentos: boolean = true;
  pagina: string = '';
  VerNiveles(id: number) {
    this.data_id = id;
    this.pagina = 'ver-departamento';
    this.ver_nivel = true;
    this.ver_departamentos = false;
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
        this.toastr.error('Seleccione plantilla con nombre plantillaConfiguracionGeneral.', 'Plantilla seleccionada incorrecta.', {
          timeOut: 6000,
        });
        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento.', 'Plantilla no aceptada.', {
        timeOut: 6000,
      });
      this.nameFile = '';
    }
    this.archivoForm.reset();
    this.mostrarbtnsubir = true;
  }

  DataDepartamentos: any;
  listDepartamentosCorrectos: any = [];
  messajeExcel: string = '';
  Revisarplantilla() {
    this.listDepartamentosCorrectos = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.progreso = true;
    // VERIFICACIÓN DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      this.DataDepartamentos = res.data;
      this.messajeExcel = res.message;

      this.DataDepartamentos.sort((a, b) => {
        if (a.observacion !== 'ok' && b.observacion === 'ok') {
          return -1;
        }
        if (a.observacion === 'ok' && b.observacion !== 'ok') {
          return 1;
        }
        return 0;
      });

      console.log('probando plantilla1 departamentos', this.DataDepartamentos);
      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.toastr.error('No se ha encontrado pestaña DEPARTAMENTOS en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        this.DataDepartamentos.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listDepartamentosCorrectos.push(item);
          }
        });
      }
    }, error => {
      console.log('Serivicio rest -> metodo RevisarFormato - ', error);
      this.toastr.error('Error al cargar los datos.', 'Plantilla no aceptada.', {
        timeOut: 4000,
      });
      this.progreso = false;
    }, () => {
      this.progreso = false;
    });
  }

  //FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE LOS FERIADOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    console.log('listDepartamentosCorrectos: ', this.listDepartamentosCorrectos.length);
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.registrarDepartamentos();
        }
      });
  }

  registrarDepartamentos() {
    if (this.listDepartamentosCorrectos.length > 0) {
      const data = {
        plantilla: this.listDepartamentosCorrectos,
        user_name: this.user_name,
        ip: this.ip
      }
      this.rest.subirArchivoExcel(data).subscribe({
        next: (response) => {
          this.toastr.success('Plantilla de Departamentos importada.', 'Operación exitosa.', {
            timeOut: 3000,
          });
          this.LimpiarCampos();
          this.archivoForm.reset();
          this.nameFile = '';
        },
        error: (error) => {
          ;
          this.toastr.error('No se pudo cargar la plantilla', 'Ups !!! algo salio mal', {
            timeOut: 4000,
          });
        }
      });
    } else {
      this.toastr.error('No se ha encontrado datos para su registro.', 'Plantilla procesada.', {
        timeOut: 4000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    }
  }

  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  colorCelda: string = ''
  stiloCelda(observacion: string): string {
    let arrayObservacion = observacion.split(" ");
    if (observacion == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    } else if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    } else if (observacion == 'Ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
    } else if (observacion == 'Sucursal no existe en el sistema') {
      return 'rgb(255, 192, 203)';
    } else if (arrayObservacion[0] == 'Departamento' || arrayObservacion[0] == 'Sucursal') {
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


  /** ************************************************************************************************** **
   ** **                                       METODO PARA EXPORTAR A PDF                             ** **
   ** ************************************************************************************************** **/

  generarPdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinicion();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Departamentos.pdf'); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicion() {
    sessionStorage.setItem('Departamentos', this.departamentos);
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
        { text: 'Lista de Departamentos', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFDepartamentos(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  presentarDataPDFDepartamentos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Establecimiento', style: 'tableHeader' },
                { text: 'Departamento', style: 'tableHeader' },
                { text: 'Nivel', style: 'tableHeader' },
                { text: 'Departamento Superior', style: 'tableHeader' }
              ],
              ...this.departamentos.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.nomsucursal, style: 'itemsTable' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.nivel, style: 'itemsTableC' },
                  { text: obj.departamento_padre, style: 'itemsTableC' }
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
   ** **                                 METODO PARA EXPORTAR A EXCEL                                 ** **
   ** ************************************************************************************************** **/
  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.departamentos);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Departamentos');
    xlsx.writeFile(wb, "Departamentos" + '.xlsx');
  }

  /** ************************************************************************************************** **
   ** **                                     METODO PARA EXPORTAR A CSV                               ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.departamentos);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "DepartamentosCSV" + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS XML                           ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloDepartamentos: any = [];
    this.departamentos.forEach((obj: any) => {
      objeto = {
        "departamento": {
          "$": { "id": obj.id },
          "establecimiento": obj.nomsucursal,
          "departamento": obj.nombre,
          "nivel": obj.nivel,
          "departamento_superior": obj.departamento_padre,
        }
      }
      arregloDepartamentos.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Departamentos' });
    const xml = xmlBuilder.buildObject(arregloDepartamentos);

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
    a.download = 'Departamentos.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
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

  selectionDepartamentos = new SelectionModel<ITableDepartamentos>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionDepartamentos.selected.length;
    return numSelected === this.departamentos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionDepartamentos.clear() :
      this.departamentos.forEach((row: any) => this.selectionDepartamentos.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableDepartamentos): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.departamentosEliminar = this.selectionDepartamentos.selected;

    return `${this.selectionDepartamentos.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;

  }

  contador: number = 0;
  ingresar: boolean = false;
  public departamentosNiveles: any = [];

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_dep: number, id_sucursal: number, nivel: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    }
    this.rest.EliminarRegistro(id_dep, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.departamentosNiveles = [];
        var id_departamento = id_dep;
        var id_establecimiento = id_sucursal;
        if (nivel != 0) {
          this.rest.ConsultarNivelDepartamento(id_departamento, id_establecimiento).subscribe(datos => {
            this.departamentosNiveles = datos;
            this.departamentosNiveles.filter(item => {
              this.rest.EliminarRegistroNivelDepa(item.id, datos).subscribe(
                (res: any) => {
                  if (res.message === 'error') {
                    this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
                      timeOut: 6000,
                    });
                  } else {
                    this.toastr.error('Nivel eliminado de ' + item.departamento, '', {
                      timeOut: 6000,
                    });
                    this.ListaDepartamentos();
                  }
                }
              );
            })
          })
          this.ListaDepartamentos();
        } else {
          this.ListaDepartamentos();
        }
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ListaDepartamentos();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id, datos.id_sucursal, datos.nivel);
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.departamentosEliminar = [];
          this.selectionDepartamentos.clear();
          this.ListaDepartamentos();
        } else {
          this.router.navigate(['/departamento']);
        }
      });
  }

  EliminarMultiple() {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    }
    this.ingresar = false;
    this.contador = 0;
    this.departamentosEliminar = this.selectionDepartamentos.selected;
    this.departamentosEliminar.forEach((datos: any) => {
      this.departamentos = this.departamentos.filter(item => item.id !== datos.id);
      this.contador = this.contador + 1;
      this.rest.EliminarRegistro(datos.id, datos).subscribe((res: any) => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con ' + datos.nombre + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
          this.contador = this.contador - 1;
        } else {
          this.departamentosNiveles = [];
          var id_departamento = datos.id;
          var id_establecimiento = datos.id_sucursal;
          if (datos.nivel != 0) {
            this.rest.ConsultarNivelDepartamento(id_departamento, id_establecimiento).subscribe(datos => {
              this.departamentosNiveles = datos;
              this.departamentosNiveles.filter(item => {
                this.rest.EliminarRegistroNivelDepa(item.id, datos).subscribe(
                  (res: any) => {
                    if (res.message === 'error') {
                      this.toastr.error('Existen datos relacionados con ' + item.nombre + '.', 'No fue posible eliminar.', {
                        timeOut: 6000,
                      });
                    } else {
                      this.toastr.error('Nivel eliminado de ' + item.departamento, '', {
                        timeOut: 6000,
                      });
                      this.ListaDepartamentos();
                    }
                  }
                )
                this.ListaDepartamentos();
              })
            })
            this.ListaDepartamentos();
          } else {
            this.ListaDepartamentos();
          }
          if (!this.ingresar) {
            this.toastr.error('Se ha eliminado ' + this.contador + ' registros.', '', {
              timeOut: 6000,
            });
            this.ingresar = true;
          }
          this.ListaDepartamentos();
        }
      });
    }
    )
  }

  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.departamentosEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.departamentosEliminar = [];
            this.selectionDepartamentos.clear();
            this.ListaDepartamentos();
          } else {
            this.toastr.warning('No ha seleccionado DEPARTAMENTOS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/departamento']);
        }
      });
  }
}


