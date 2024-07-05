// LLAMADO DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import * as xlsx from "xlsx";
import * as moment from "moment";
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from "file-saver";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// LLAMADO A COMPONENTES
import { AutorizaSolicitudComponent } from '../../autoriza-solicitud/autoriza-solicitud.component';

// LLAMADO A SERVICIOS
import { PlantillaReportesService } from "src/app/componentes/reportes/plantilla-reportes.service";
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

import { EditarSolicitudComidaComponent } from '../editar-solicitud-comida/editar-solicitud-comida.component';

// EXPORTACION DE DATOS A SER LEIDOS EN COMPONENTE DE AUTORIZACION
export interface SolicitudElemento {
  nombre_servicio: string;
  nombre_plato: string;
  hora_inicio: string;
  id_empleado: number;
  nombre_menu: string;
  fec_comida: string;
  aprobada: boolean;
  apellido: string;
  hora_fin: string;
  nombre: string;
  cedula: string;
  codigo: number;
  id: number;
}

@Component({
  selector: 'app-listar-solicitud',
  templateUrl: './listar-solicitud.component.html',
  styleUrls: ['./listar-solicitud.component.css']
})

export class ListarSolicitudComponent implements OnInit {
  // VARIABLE PARA GUARDAR DATOS DE SOLICITUDES PENDIENTES
  solicitudes: any = [];

  // VARIABLE PARA GURDAR DATOS SELECCIONADOS DE LISTA DE SOLICITUDES PENDIENTES
  selectionUno = new SelectionModel<SolicitudElemento>(true, []);

  // VARIABLES PARA MOSTRAR U OCULTAR LISTAS DE SOLIICTUDES
  lista_autorizados: boolean = false; // LISTA DE SOLICITUDES AUTORIZADAS O NEGADAS
  lista_solicitados: boolean = false; // LISTA DE SOLICITUDES PENDIENTES
  lista_expirados: boolean = false; // LISTA DE SOLICITUDES EXPIRADAS

  validarMensaje1: boolean = false;
  validarMensaje2: boolean = false;
  validarMensaje3: boolean = false;

  // VARIABLE PARA MOSTRAR U OCULTAR ICONO DE AUTORIZACION INDIVIDUAL
  auto_individual: boolean = true; // ICONO LISTA DE SOLICITUDES PENDIENTES


  // ITEMS DE PAGINACION DE LA TABLA DE LISTA DE SOLICITUDES PENDIENTES
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DE LA LISTA DE SOLICITUDES AUTORIZADAS O NEGADAS
  pageSizeOptions_autorizado = [5, 10, 20, 50];
  tamanio_pagina_autorizado: number = 5;
  numero_pagina_autorizado: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DE LA LISTA DE SOLICITUDES EXPIRADAS
  pageSizeOptions_expirada = [5, 10, 20, 50];
  tamanio_pagina_expirada: number = 5;
  numero_pagina_expirada: number = 1;

  idEmpleado: number;
  empleado: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO

  get habilitarComida(): boolean { return this.funciones.alimentacion; }

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string {return this.plantilla.color_Secundary;}
  get p_color(): string {return this.plantilla.color_Primary;}
  get logoE(): string {return this.plantilla.logoBase64;}
  get frase(): string {return this.plantilla.marca_Agua;}

  constructor(
    private plantilla: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    public restEmpleado: EmpleadoService, // SERVICIO DATOS EMPLEADO
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public restC: PlanComidasService, // SERVICIO DATOS SERVICIO DE COMIDA
    private ventana: MatDialog, // VARIABLE PARA LLAMADO A COMPONENTES
    private funciones: MainNavService,
  ) { 
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarComida === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Alimentación. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.BuscarParametro();
      this.ObtenerEmpleados(this.idEmpleado);
    }
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe((data) => {
      this.empleado = data;
    });
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora(this.formato_fecha)
      },
      vacio => {
        this.BuscarHora(this.formato_fecha)
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        // LISTA DE DATOS DE SOLICITUDES
        this.ObtenerSolicitudes(fecha, this.formato_hora);
        // LISTA DE DATOS DE SOLICITUDES AUTORIZADAS O NEGADAS
        this.ObtenerSolicitudesAutorizados(fecha, this.formato_hora);
        // LISTA DE DATOS DE SOLIICTUDES EXPIRADAS
        this.ObtenerSolicitudesExpiradas(fecha, this.formato_hora);
      },
      vacio => {
        // LISTA DE DATOS DE SOLICITUDES
        this.ObtenerSolicitudes(fecha, this.formato_hora);
        // LISTA DE DATOS DE SOLICITUDES AUTORIZADAS O NEGADAS
        this.ObtenerSolicitudesAutorizados(fecha, this.formato_hora);
        // LISTA DE DATOS DE SOLIICTUDES EXPIRADAS
        this.ObtenerSolicitudesExpiradas(fecha, this.formato_hora);
      });
  }

  FormatearDatos(lista: any, formato_fecha: string, formato_hora: string) {
    lista.forEach((data: any) => {
      data.fec_comida_ = this.validar.FormatearFecha(data.fec_comida, formato_fecha, this.validar.dia_abreviado);
      data.hora_inicio_ = this.validar.FormatearHora(data.hora_inicio, formato_hora);
      data.hora_fin_ = this.validar.FormatearHora(data.hora_fin, formato_hora);
    })
  }

  /** ********************************************************************************************* */
  /**                METODOS USADOS PARA MANEJO DE DATOS DE SOLICITUDES PENDIENTES                  */
  /** ********************************************************************************************* */

  // METODO PARA MOSTRAR UN DETERMINADO NUMERO DE FILAS EN LA TABLA DE SOLICITUDES PENDIENTES
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }


  lista_solicitudes_filtradas: any = [];
  // METODO PARA BUSQUEDA DE DATOS DE SOLICITUDES PENDIENTES
  ObtenerSolicitudes(formato_fecha: string, formato_hora: string) {
    this.restC.ObtenerSolComidaNegado().subscribe(res => {
      this.solicitudes = res;

      // FILTRA LA LISTA DE HORAS EXTRAS AUTORIZADAS PARA DESCARTAR LAS SOLICITUDES DEL MISMO USUARIO Y ALMACENA EN UNA NUEVA LISTA
      this.lista_solicitudes_filtradas = this.solicitudes.filter((o: any) => {
        if(this.idEmpleado !== o.id_empleado){
          return this.lista_solicitudes_filtradas.push(o);
        }
      });

      if (this.lista_solicitudes_filtradas.length != 0) {
        this.lista_solicitados = true;
      }else{
        this.lista_solicitados = false;
        this.validarMensaje1 = true;
      }

      this.FormatearDatos(this.lista_solicitudes_filtradas, formato_fecha, formato_hora);

    }, err => {
      this.validarMensaje1 = true;
    });
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.lista_solicitudes_filtradas.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.lista_solicitudes_filtradas.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabel(row?: SolicitudElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA HABILITAR O DESHABILITAR EL BOTON AUTORIZAR MULTIPLE Y BOTON AUTORIZAR INDIVIDUAL RESPECTIVAMENTE
  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
    }
  }

  // METODO PARA LEER TODOS LOS DATOS SELECCIONADOS
  AutorizarSolicitudMultiple() {
    let EmpleadosSeleccionados: any;
    EmpleadosSeleccionados = this.selectionUno.selected.map((obj: any) => {
      return {
        empleado: obj.nombre + ' ' + obj.apellido,
        id_empleado: obj.id_empleado,
        hora_inicio: obj.hora_inicio,
        hora_fin: obj.hora_fin,
        aprobada: obj.aprobada,
        fecha: obj.fec_comida,
        codigo: obj.codigo,
        id: obj.id,
      }
    })
    this.AbrirAutorizaciones(EmpleadosSeleccionados, 'multiple');
  }

  // METODO PARA ABRIR VENTA DE AUTORIZACIÓN DE SOLICITUDES CON TODOS LOS DATOS SELECCIONADOS
  AbrirAutorizaciones(datos_solicitud: any, forma: string) {
    this.ventana.open(AutorizaSolicitudComponent,
      { width: '600px', data: { datosMultiple: datos_solicitud, carga: forma } })
      .afterClosed().subscribe(items => {
        this.BuscarParametro();
        this.btnCheckHabilitar_Estado = false;
        this.selectionUnoEstado.clear();
        this.btnCheckHabilitar = false;
        this.selectionUno.clear();
      });
  }

  // METODO PARA ABRIR VENTANA DE EDICION DE SOLICITUD
  VentanaEditarPlanComida(datoSeleccionado: any) {
    this.ventana.open(EditarSolicitudComidaComponent, {
      width: '600px',
      data: { solicitud: datoSeleccionado }
    })
      .afterClosed().subscribe(item => {
        this.BuscarParametro();
      });
  }

  /** ********************************************************************************************* */
  /**      METODOS USADOS PARA MANEJO DE DATOS DE SOLICITUDES AUTORIZADAS O NEGADAS                 */
  /** ********************************************************************************************* */

  // METODO PARA MOSTRAR FILAS DETERMINADAS EN TABLA DE SOLICITUDES AUTORIZADAS O NEGADAS
  ManejarPaginaAutorizados(e: PageEvent) {
    this.numero_pagina_autorizado = e.pageIndex + 1;
    this.tamanio_pagina_autorizado = e.pageSize;
  }

  // METODO PARA BUSQUEDA DE DATOS DE SOLICITUDES AUTORIZADAS O NEGADAS
  solicitudesAutorizados: any = []; // VARIABLE PARA GUARDAR DATOS DE SOLICITUDES AUTORIZADAS O NEGADAS
  solicitudesAutorizadas_filtradas: any = []; // VARIABLE PARA GUARDAR DATOS DE SOLICITUDES AUTORIZADAS O NEGADAS SIN LAS DEL PROPIO USUARIO QUE INGRESO
  ObtenerSolicitudesAutorizados(formato_fecha: string, formato_hora: string) {
    this.restC.ObtenerSolComidaAprobado().subscribe(res => {
      this.solicitudesAutorizados = res;

      // FILTRA LA LISTA DE HORAS EXTRAS AUTORIZADAS PARA DESCARTAR LAS SOLICITUDES DEL MISMO USUARIO Y ALMACENA EN UNA NUEVA LISTA
      this.solicitudesAutorizadas_filtradas = this.solicitudesAutorizados.filter((o: any) => {
        if(this.idEmpleado !== o.id_empleado){
          return this.solicitudesAutorizadas_filtradas.push(o);
        }
      });

      this.FormatearDatos(this.solicitudesAutorizadas_filtradas, formato_fecha, formato_hora);

      for (var i = 0; i <= this.solicitudesAutorizadas_filtradas.length - 1; i++) {
        if (this.solicitudesAutorizadas_filtradas[i].aprobada === true) {
          this.solicitudesAutorizadas_filtradas[i].aprobada = 'AUTORIZADO';
        }
        else if (this.solicitudesAutorizadas_filtradas[i].aprobada === false) {
          this.solicitudesAutorizadas_filtradas[i].aprobada = 'NEGADO';
        }
      }

      if (this.solicitudesAutorizadas_filtradas.length != 0) {
        this.lista_autorizados = true;
      }else{
        this.lista_autorizados = false;
        this.validarMensaje2 = true;
      }

    }, err => {
      this.validarMensaje2 = true;
    });
  }

  // VARIABLE PARA ALMACENAR DATOS SELECCIONADOS DE TABLA DE LISTA DE SOLICITUDES AUTORIZADAS O NEGADAS
  selectionUnoEstado = new SelectionModel<SolicitudElemento>(true, []);

  //SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS.
  isAllSelectedEstado() {
    const numSelected = this.selectionUnoEstado.selected.length;
    const numRows = this.solicitudesAutorizadas_filtradas.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleEstado() {
    this.isAllSelectedEstado() ?
      this.selectionUnoEstado.clear() :
      this.solicitudesAutorizadas_filtradas.forEach((row: any) => this.selectionUnoEstado.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA..
  checkboxLabelEstado(row?: SolicitudElemento): string {
    if (!row) {
      return `${this.isAllSelectedEstado() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUnoEstado.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA HABILITAR O DESHABILITAR EL ÍCONO DE AUTORIZACION INDIVIDUAL SOLICITUDES APROBADAS O NEGADAS
  btnCheckHabilitar_Estado: boolean = false; // VARIABLE PARA MOSTRAR U OCULTAR BOTÓN DE AUTORIZACION MULTIPLE
  auto_individual_estado: boolean = true; // VARIABLE PARA MOSTRAR U OCULTAR BOTÓN DE AUTORIZACION INDIVIDUAL
  HabilitarSeleccionEstado() {
    if (this.btnCheckHabilitar_Estado === false) {
      this.btnCheckHabilitar_Estado = true;
      this.auto_individual_estado = false;
    } else if (this.btnCheckHabilitar_Estado === true) {
      this.btnCheckHabilitar_Estado = false;
      this.auto_individual_estado = true;
    }
  }

  // METODO PARA LEER LOS DATOS TOMADOS DE LA LISTA DE SOLICITUDES AUTORIZADAS O NEGADAS
  AutorizarSolicitudMultipleEstado() {
    let EmpleadosSeleccionados: any;
    EmpleadosSeleccionados = this.selectionUnoEstado.selected.map((obj: any) => {
      return {
        empleado: obj.nombre + ' ' + obj.apellido,
        id_empleado: obj.id_empleado,
        hora_inicio: obj.hora_inicio,
        hora_fin: obj.hora_fin,
        aprobada: obj.aprobada,
        fecha: obj.fec_comida,
        codigo: obj.codigo,
        id: obj.id,
      }
    })
    this.AbrirAutorizaciones(EmpleadosSeleccionados, 'multiple');
  }

  /** ********************************************************************************************* */
  /**                METODOS USADOS PARA MANEJO DE DATOS DE SOLICITUDES EXPIRADAS                   */
  /** ********************************************************************************************* */

  // METODO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA DE SOLICITUDES EXPIRADAS
  ManejarPaginaExpiradas(e: PageEvent) {
    this.numero_pagina_expirada = e.pageIndex + 1;
    this.tamanio_pagina_expirada = e.pageSize;
  }

  // METODO PARA BUSQUEDA DE DATOS DE SOLICITUDES EXPIRADAS
  
  solicitudesExpiradas: any = []; // VARIABLE PARA ALMACENAR DATOS DE SOLIICTUDES EXPIRADAS
  solicitudesExpiradas_filtradas: any = [];
  ObtenerSolicitudesExpiradas(formato_fecha: string, formato_hora: string) {
    this.restC.ObtenerSolComidaExpirada().subscribe(res => {
      this.solicitudesExpiradas = res;

       //Filtra la lista de Horas Extras Autorizadas para descartar las solicitudes del mismo usuario y almacena en una nueva lista
       this.solicitudesExpiradas_filtradas = this.solicitudesExpiradas.filter((o: any) => {
        if(this.idEmpleado !== o.id_empleado){
          return this.solicitudesExpiradas_filtradas.push(o);
        }
      });

      this.FormatearDatos(this.solicitudesExpiradas_filtradas, formato_fecha, formato_hora);

      for (var i = 0; i <= this.solicitudesExpiradas_filtradas.length - 1; i++) {
        if (this.solicitudesExpiradas_filtradas[i].aprobada === true) {
          this.solicitudesExpiradas_filtradas[i].aprobada = 'AUTORIZADO';
        }
        else if (this.solicitudesExpiradas_filtradas[i].aprobada === false) {
          this.solicitudesExpiradas_filtradas[i].aprobada = 'NEGADO';
        }
        else {
          this.solicitudesExpiradas_filtradas[i].aprobada = 'PENDIENTE';
        }
      }

      if (this.solicitudesExpiradas_filtradas.length != 0) {
        this.lista_expirados = true;
      }else{
        this.lista_expirados = false;
        this.validarMensaje3 = true;
      }


    }, err => {
      this.validarMensaje3 = true;
    });
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS PDF                              ** **
   ** ************************************************************************************************* **/

  // METODO PARA CREAR ARCHIVO PDF
  generarPdf(action = "open", opcion: string) {
    const documentDefinition = this.getDocumentDefinicion(opcion);
    switch (action) {
      case "open":
        pdfMake.createPdf(documentDefinition).open();
        break;
      case "print":
        pdfMake.createPdf(documentDefinition).print();
        break;
      case "download":
        pdfMake.createPdf(documentDefinition).download();
        break;
      default:
        pdfMake.createPdf(documentDefinition).open();
        break;
    }
  }

  getDocumentDefinicion(opcion: string) {
    if (opcion == "Servicios de alimentación solicitados") {
      sessionStorage.setItem(
        "ServiciosAlimentacionSolicitados",
        this.lista_solicitudes_filtradas
      );
    } else if (opcion == "Servicios de alimentación aprobados") {
      sessionStorage.setItem(
        "ServiciosAlimentacionAprobados",
        this.solicitudesAutorizadas_filtradas
      );
    } else if (opcion == "Servicios de alimentación finalizados") {
      sessionStorage.setItem(
        "ServiciosAlimentacionFinalizados",
        this.solicitudesExpiradas_filtradas
      );
    }


    return {
      // ENCABEZADO DE LA PAGINA
      watermark: {
        text: this.frase,
        color: "blue",
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      header: {
        text:
          "Impreso por: " +
          this.empleado[0].nombre +
          " " +
          this.empleado[0].apellido,
        margin: 10,
        fontSize: 9,
        opacity: 0.3,
        alignment: "right",
      },
      // PIE DE LA PAGINA
      footer: function (
        currentPage: any,
        pageCount: any,
        fecha: any,
        hora: any
      ) {
        var f = moment();
        fecha = f.format("YYYY-MM-DD");
        hora = f.format("HH:mm:ss");
        return {
          margin: 10,
          columns: [
            { text: "Fecha: " + fecha + " Hora: " + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: "© Pag " + currentPage.toString() + " of " + pageCount,
                  alignment: "right",
                  opacity: 0.3,
                },
              ],
            },
          ],
          fontSize: 10,
        };
      },
      content: [
        { image: this.logoE, width: 150, margin: [10, -25, 0, 5] },
        {
          text: opcion,
          bold: true,
          fontSize: 16,
          alignment: "center",
          margin: [0, -10, 0, 10],
        },
        this.PresentarDataPDFPermisos(opcion),
      ],
      styles: {
        tableHeader: {
          fontSize: 12,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        itemsTable: { fontSize: 10, alignment: "center" },
      },
    };
  }

  // ESTRUCTURA DEL ARCHIVO PDF
  PresentarDataPDFPermisos(opcion: string) {
    return {
      columns: [
        { width: "*", text: "" },
        {
          width: "auto",
          table: {
            widths: ["auto", "auto", "auto", "auto", "auto"],
            body: [
              [
                { text: "Empleado", style: "tableHeader" },
                { text: "Estado", style: "tableHeader" },
                { text: "Fecha Comida", style: "tableHeader" },
                { text: "Hora inicio", style: "tableHeader" },
                { text: "Hora Final", style: "tableHeader" },
              ],
              ...this.mostrarDatosSolicitudes(opcion),
            ],
          },
          // ESTILO DE COLORES FORMATO ZEBRA
          layout: {
            fillColor: function (i: any) {
              return i % 2 === 0 ? "#CCD1D1" : null;
            },
          },
        },
        { width: "*", text: "" },
      ],
    };
  }

  // METODO SELECCIONAR QUE LISTA DE PERMISOS MOSTRAR (SOLICITADOS O AUTORIZADOS)
  mostrarDatosSolicitudes(opcion: string) {
      return (opcion == "Servicios de alimentación solicitados"?this.lista_solicitudes_filtradas:(
        opcion=="Servicios de alimentación aprobados"?this.solicitudesAutorizadas_filtradas:this.solicitudesExpiradas_filtradas
        )).map((obj) => {
        return [
          { text: obj.nombre +' '+ obj.apellido, style: "itemsTable" },
          { text: (opcion=="Servicios de alimentación solicitados"?"Solicitado":obj.aprobada), style: "itemsTable" },
          { text: obj.fec_comida_, style: "itemsTable" },
          { text: obj.hora_inicio_, style: "itemsTable" },
          { text: obj.hora_fin_, style: "itemsTable" },
        ];
      });
  }

   /** ************************************************************************************************* **
   ** **                             PARA LA EXPORTACION DE ARCHIVOS EXCEL                           ** **
   ** ************************************************************************************************* **/

   exportToExcel(opcion: string) {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet((opcion == "Servicios de alimentación solicitados"?this.lista_solicitudes_filtradas:(
      opcion=="Servicios de alimentación aprobados"?this.solicitudesAutorizadas_filtradas:this.solicitudesExpiradas_filtradas
      )).map((obj: any) => {
      return {
        Nombre: obj.nombre +' '+ obj.apellido,
        Estado: (opcion=="Servicios de alimentación solicitados"?"Solicitado":obj.aprobada),
        Fecha_Comida: obj.fec_comida_,
        Hora_Inicial: obj.hora_inicio_,
        Hora_final: obj.hora_fin_,

      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(opcion == "Servicios de alimentación solicitados"?this.lista_solicitudes_filtradas[0]:(
      opcion=="Servicios de alimentación aprobados"?this.solicitudesAutorizadas_filtradas[0]:this.solicitudesExpiradas_filtradas[0]
      )); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTA ROLES');
    xlsx.writeFile(wb, `${opcion}EXCEL` + new Date().getTime() + '.xlsx');
  }

   /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A CSV                               ** **
   ** ************************************************************************************************** **/

   exportToCVS(opcion: string) {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet((opcion == "Servicios de alimentación solicitados"?this.lista_solicitudes_filtradas:(
      opcion=="Servicios de alimentación aprobados"?this.solicitudesAutorizadas_filtradas:this.solicitudesExpiradas_filtradas
      )).map((obj: any) => {
      return {
        Nombre: obj.nombre +' '+ obj.apellido,
        Estado: (opcion=="Servicios de alimentación solicitados"?"Solicitado":obj.aprobada),
        Fecha_Comida: obj.fec_comida_,
        Hora_Inicial: obj.hora_inicio_,
        Hora_final: obj.hora_fin_,
      }
    }));
    const csvDataC = xlsx.utils.sheet_to_csv(wsr);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, `${opcion}CSV` + new Date().getTime() + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS XML                           ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML(opcion: String) {
    var objeto: any;
    var arregloSolicitudes: any = [];
    (opcion == "Servicios de alimentación solicitados"?this.lista_solicitudes_filtradas:(
      opcion=="Servicios de alimentación aprobados"?this.solicitudesAutorizadas_filtradas:this.solicitudesExpiradas_filtradas
      )).forEach((obj: any) => {
      objeto = {
        "lista_servicios_alimentacion": {
        '@id': obj.id,
        "nombre": obj.nombre +' '+ obj.apellido,
        "estado": (opcion=="Servicios de alimentación solicitados"?"Solicitado":obj.aprobada),
        "fecha_comida": obj.fec_comida_,
        "hora_inicial": obj.hora_inicio_,
        "hora_final": obj.hora_fin_,
        }
      }
      arregloSolicitudes.push(objeto)
    });
    this.restC.CrearXML(arregloSolicitudes).subscribe(res => {
      this.data = res;
      this.urlxml = `${(localStorage.getItem('empresaURL') as string)}/planComidas/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

  //Control Botones
  getAprobar(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Aprobar Solicitudes Alimentación');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }
}
