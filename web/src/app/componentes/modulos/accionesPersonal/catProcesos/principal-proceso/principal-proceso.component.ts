// IMPORTACION DE LIBRERIAS
import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import ExcelJS, { FillPattern } from "exceljs";
import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';
import { FillPatterns } from 'exceljs';


import { RegistroProcesoComponent } from '../registro-proceso/registro-proceso.component';
import { EditarCatProcesosComponent } from 'src/app/componentes/modulos/accionesPersonal/catProcesos/editar-cat-procesos/editar-cat-procesos.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { ProcesoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catProcesos/proceso.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-principal-proceso',
  standalone: false,
  templateUrl: './principal-proceso.component.html',
  styleUrls: ['./principal-proceso.component.css']
})

export class PrincipalProcesoComponent implements OnInit {
  ips_locales: any = '';

  buscarNombre = new FormControl('', [Validators.minLength(2)]);
  buscarNivel = new FormControl('');
  buscarPadre = new FormControl('', [Validators.minLength(2)]);
  archivoForm = new FormControl('', Validators.required);

  procesos: any = [];
  empleado: any = [];
  idEmpleado: number;

  private bordeCompleto!: Partial<ExcelJS.Borders>;
  private bordeGrueso!: Partial<ExcelJS.Borders>;
  private fillAzul!: FillPatterns;
  private fontTitulo!: Partial<ExcelJS.Font>;
  private imagen: any;


  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // VARIABLES USADAS EN SELECCIÓN DE ARCHIVOS
  nameFile: string;
  archivoSubido: Array<File>;

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = (localStorage.getItem('empresaURL') as string);

  get habilitarAccion(): boolean { return this.funciones.accionesPersonal; }

  // VARAIBLES DE SELECCION DE DATOS DE UNA TABLA
  selectionUno = new SelectionModel<any>(true, []);
  procesoEliminar: any = [];

  constructor(
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public restE: EmpleadoService,
    private rest: ProcesoService,
    private router: Router,
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private funciones: MainNavService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    if (this.habilitarAccion === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Acciones de Personal. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.ObtenerProcesos();
      this.ObtenerEmpleados(this.idEmpleado);
      this.ObtenerLogo();
      this.ObtenerColores();
    }

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

  // METODO PARA LIMPIAR CAMPOS DE BUSQUEDA
  LimpiarCampos() {
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoForm.reset();
    this.Datos_procesos = null;
    this.messajeExcel = '';
    this.buscarNombre.reset();
    this.buscarNivel.reset();
    this.buscarPadre.reset();
    this.ObtenerProcesos();
    this.mostrarbtnsubir = false;
  }


  // METODO PARA LISTAR PROCESOS
  ObtenerProcesos() {
    this.procesos = [];
    this.rest.ConsultarProcesos().subscribe(data => {
      this.procesos = data;
      //console.log('ver datos de procesos ', this.procesos)
    });
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.procesos.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.procesos.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    this.procesoEliminar = this.selectionUno.selected;
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA HACTIBAR LA SELECCION
  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.selectionUno.clear();
    }
  }

  // METODO PARA ABRIR PANTALLA DE REGISTRO DE PROCESO
  AbrirVentanaRegistrarProceso() {
    this.ventana.open(RegistroProcesoComponent,
      { width: '450px' }).afterClosed().subscribe(items => {
        this.ObtenerProcesos();
      });
  }

  // METODO PARA ABRIR VENTANA EDITAR PROCESO
  AbrirVentanaEditar(datosSeleccionados: any): void {
    //console.log(datosSeleccionados);
    this.ventana.open(EditarCatProcesosComponent,
      {
        width: '450px', data: { datosP: datosSeleccionados, lista: true }
      }).afterClosed().subscribe(items => {
        this.ObtenerProcesos();
      });
  }

  // FUNCION PARA ELIMINAR REGISTROS
  Eliminar(id_proceso: number) {
    let datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.rest.EliminarProceso(id_proceso, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerProcesos();
      }
    });
  }

  // FUNCION PARA CONFIRMAR ELIMINAR REGISTROS
  ConfirmarDelete(datos: any) {
    //console.log(datos);
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/proceso']);
        }
      });
  }

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.procesoEliminar.length != 0) {
            this.EliminarMultiple();
            this.btnCheckHabilitar = false;
            this.procesoEliminar = [];
            this.selectionUno.clear();
          } else {
            this.toastr.warning('No ha seleccionado registros.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        }
      });
  }
  EliminarMultiple() {
    const data = {
      listaEliminar: this.procesoEliminar,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }

    this.rest.EliminarProcesoMult(data).subscribe({
      next: (response) => {
        this.toastr.error(response.message, 'Operación exitosa.', {
          timeOut: 5000,
        });
        if (response.relacionados > 0) {
          if (response.relacionados > 0) {
            response.listaNoEliminados.forEach(item => {
              this.toastr.warning(response.ms2 + ' ' + item.trim(), 'Advertencia.', {
                timeOut: 5000,
              });
            });

          }
        }
        this.ngOnInit();
      }, error: (err) => {
        if (err.status == 300) {
          this.toastr.error(err.error.message, '', {
            timeOut: 4500,
          });
          this.toastr.warning(err.error.ms2, 'Advertencia.', {
            timeOut: 5000,
          });
        } else {
          this.toastr.error(err.error.message, 'Ups !!! algo salio mal.', {
            timeOut: 4000,
          });
        }
      },
    })
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA VALIDAR INGRESO DE LETRA
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  mostrarbtnsubir: boolean = false;
  messajeExcel: string = '';
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS
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
        this.VerificarPlantilla();
      } else {
        this.toastr.error('Seleccione plantilla con nombre plantillaConfiguracionGeneral.', 'Plantilla seleccionada incorrecta', {
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



  // METODO PARA LEER DATOS DE PLANTILLA
  CargarPlantillaGeneral(element: any) {
    if (element.target.files && element.target.files[0]) {
      this.archivoSubido = element.target.files;
      this.nameFile = this.archivoSubido[0].name;
      let arrayItems = this.nameFile.split(".");
      let itemExtencion = arrayItems[arrayItems.length - 1];
      let itemName = arrayItems[0];

      if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {

        if (itemName.toLowerCase().startsWith('plantillaconfiguraciongeneral')) {
          this.VerificarPlantilla();
        } else {
          this.toastr.error('Solo se acepta plantillaConfiguracionGeneral.', 'Plantilla seleccionada incorrecta', {
            timeOut: 6000,
          });
        }
      } else {
        this.toastr.error('Error en el formato del documento.', 'Plantilla no aceptada.', {
          timeOut: 6000,
        });
      }
    } else {
      this.toastr.error('Error al cargar el archivo.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    }
    this.LimpiarCampos();
  }

  // METODO PARA VALIDAR DATOS DE PLANTILLAS
  Datos_procesos: any
  listaProcesosCorrectas: any = [];
  listaProcesosCorrectasCont: number;
  // METODO PARA VERIFICAR DATOS DE PLANTILLA
  VerificarPlantilla() {
    this.listaProcesosCorrectas = [];
    let formData = new FormData();

    for (let i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      this.Datos_procesos = res.data;
      this.messajeExcel = res.message;

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.toastr.error('No se ha encontrado pestaña PROESOS en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {

        this.Datos_procesos.sort((a: any, b: any) => {
          if (a.observacion !== 'ok' && b.observacion === 'ok') {
            return -1;
          }
          if (a.observacion === 'ok' && b.observacion !== 'ok') {
            return 1;
          }
          return 0;
        });

        this.Datos_procesos.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaProcesosCorrectas.push(item);
          }
        });
        this.listaProcesosCorrectasCont = this.listaProcesosCorrectas.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos.', 'Plantilla no aceptada', {
        timeOut: 4000,
      });
    });

  }

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.RegistrarProcesos();
        }
      });

  }

  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  colorCelda: string = ''
  EstiloCelda(observacion: string): string {
    let arrayObservacion = observacion.split(" ");
    if (observacion == 'Registro duplicado') {
      return 'rgb(156, 214, 255)';
    } else if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    } else if (observacion == 'Ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
    } else if (observacion == 'Registro cruzado' || observacion == 'Proceso superior no existe en el sistema como un proceso..' ||
      observacion == 'No se puede registrar este proceso con su proceso padre porque no se pueden cruzar los mismo procesos' ||
      observacion == 'No es posible registrar un proceso como su propio proceso superior.' ||
      observacion == 'Proceso superior no existe en el sistema como un proceso.'
    ) {
      return 'rgb(238, 21, 242)';
    } else if (arrayObservacion[0] == 'Un' ||
      observacion == 'Procesos mal definidos') {
      return 'rgb(232, 137, 207)';
    } else {
      return 'rgb(242, 21, 21)';
    }
  }

  colorTexto: string = '';
  EstiloTextoCelda(texto: string): string {
    texto = texto.toString()
    let arrayObservacion = texto.split(" ");
    if (arrayObservacion[0] == 'No') {
      return 'rgb(255, 80, 80)';
    } else {
      return 'black'
    }
  }

  // METODO PARA REGISTRAR DATOS
  RegistrarProcesos() {
    console.log('listaProcesosCorrectas: ', this.listaProcesosCorrectas.length)
    if (this.listaProcesosCorrectas?.length > 0) {
      const data = {
        plantilla: this.listaProcesosCorrectas,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales
      }
      this.rest.RegistrarPlantilla(data).subscribe({
        next: (response: any) => {
          this.toastr.success('Plantilla de Procesos importada.', 'Operación exitosa.', {
            timeOut: 5000,
          });
          if (this.listaProcesosCorrectas?.length > 0) {
            setTimeout(() => {
              this.ngOnInit();
            }, 500);
          }
          this.LimpiarCampos();
        },
        error: (error) => {
          this.toastr.error('No se pudo cargar la plantilla', 'Ups !!! algo salio mal', {
            timeOut: 4000,
          });
          this.archivoForm.reset();
        }
      });
    } else {
      this.toastr.error('No se ha encontrado datos para su registro.', 'Plantilla procesada.', {
        timeOut: 4000,
      });
      this.archivoForm.reset();
    }

    this.archivoSubido = [];
    this.nameFile = '';

  }


  /** ************************************************************************************************** **
   ** **                               METODO PARA EXPORTAR A PDF                                     ** **
   ** ************************************************************************************************** **/


  async GenerarPdf(action = 'open') {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Procesos.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF() {

    return {

      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: 'portrait',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE LA PAGINA
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
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'LISTA DE PROCESOS', bold: true, fontSize: 12, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFProcesos(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 9 },
        itemsTableC: { fontSize: 9, alignment: 'center' }
      }
    };
  }

  presentarDataPDFProcesos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto'],
            body: [
              [
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'NOMBRE', style: 'tableHeader' },
                { text: 'PROCESO SUPERIOR', style: 'tableHeader' },
              ],
              ...this.procesos.map((obj: any) => {
                console.log(obj);
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.proc_padre, style: 'itemsTable' },
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
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  async exportToExcel() {

    var f = DateTime.now();
    let fecha = f.toFormat('yyyy-MM-dd');
    let hora = f.toFormat('HH:mm:ss');
    let fechaHora = 'Fecha: ' + fecha + ' Hora: ' + hora;
    const listProcesos: any[] = [];

    console.log('this.procesos: ', this.procesos);
    this.procesos.forEach((accion: any, index: number) => {

      listProcesos.push([
        index + 1,
        accion.id,
        accion.nombre,
        accion.proc_padre
      ]);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Procesos");

    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });

    // COMBINAR CELDAS
    worksheet.mergeCells("B1:M1");
    worksheet.mergeCells("B2:M2");
    worksheet.mergeCells("B3:M3");
    worksheet.mergeCells("B4:M4");
    worksheet.mergeCells("B5:M5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = "Lista de Procesos".toUpperCase();

    // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
    ["B1", "B2"].forEach((cell) => {
      worksheet.getCell(cell).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(cell).font = { bold: true, size: 14 };
    });

    worksheet.columns = [
      { key: "n", width: 10 },
      { key: "codigo", width: 20 },
      { key: "proceso", width: 20 },
      { key: "proceso_padre", width: 20 },
    ];

    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "CODIGO", totalsRowLabel: "Total:", filterButton: true },
      { name: "PROCESO", totalsRowLabel: "", filterButton: true },
      { name: "PROCESO PADRE", totalsRowLabel: "", filterButton: true },
    ];
    console.log("ver list Procesos", listProcesos);
    console.log("Columnas:", columnas);

    worksheet.addTable({
      name: "Procesos",
      ref: "A6",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium16",
        showRowStripes: true,
      },
      columns: columnas,
      rows: listProcesos,
    });


    worksheet.getRow(6).font = this.fontTitulo;

    const numeroFilas = listProcesos.length;
    for (let i = 0; i <= numeroFilas; i++) {
      for (let j = 1; j <= 4; j++) {
        const cell = worksheet.getRow(i + 6).getCell(j);
        if (i === 0) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = {
            vertical: "middle",
            horizontal: this.obtenerAlineacionHorizontalEmpleados(j),
          };
        }
        cell.border = this.bordeCompleto;
      }
    }

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      FileSaver.saveAs(blob, "Lista_procesos.xlsx");
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
    }

  }
  private obtenerAlineacionHorizontalEmpleados(j: number): "left" | "center" | "right" {
    if (j === 1 || j === 9 || j === 10 || j === 11) {
      return "center";
    } else {
      return "left";
    }
  }

  /** ************************************************************************************************** **
   ** **                                   METODO PARA EXPORTAR A CSV                                 ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    /*
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.procesos);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "ProcesosCSV" + new Date().getTime() + '.csv');
    */
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS XML                               ** **
   ** ************************************************************************************************* **/

   urlxml: string;
   data: any = [];
   exportToXML() {
     
    var objeto: any;
    var arregloProcesos: any = [];
    console.log('this.procesos: ', this.procesos);
    this.procesos.forEach((obj: any) => {
      objeto = {
        "tipo_accion_personal": {
          "$": { "id": obj.id },
          "proceso": obj.nombre,
          "proceso_padre": obj.proc_padre,
        }
      }
      arregloProcesos.push(objeto)
     });
     const xmlBuilder = new xml2js.Builder({ rootName: 'Procesos' });
     const xml = xmlBuilder.buildObject(arregloProcesos);
 
     if (xml === undefined) {
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
     a.download = 'Procesos.xml';
     // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
     a.click();
   }

  //CONTROL BOTONES
  getCrearProceso() {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Crear Proceso');
    } else {
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getEditar() {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Editar Proceso');
    } else {
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getEliminar() {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Eliminar Proceso');
    } else {
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getDescargarReportes() {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Descargar Reportes Proceso');
    } else {
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }
}
