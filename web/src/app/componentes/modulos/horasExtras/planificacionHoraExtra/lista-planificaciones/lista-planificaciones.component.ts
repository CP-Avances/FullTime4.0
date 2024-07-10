// IMPORTACION DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import * as xlsx from "xlsx";
import * as moment from "moment";
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from "file-saver";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTACION DE COMPONENTES
import { PlantillaReportesService } from "src/app/componentes/reportes/plantilla-reportes.service";
import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { EmpleadoService } from "src/app/servicios/empleado/empleadoRegistro/empleado.service";
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

// IMPORTACION DE SERVICIOS
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

// EXPORTACION DE DATOS A SER LEIDOS EN COMPONENTE DE EMPLEADOS PLANIFICACION
export interface PlanificacionHE {
  descripcion: string;
  hora_inicio: string;
  id_empleado: number;
  fecha_desde: string;
  fecha_hasta: string;
  horas_totales: string;
  hora_fin: string;
  nombre: string;
  codigo: number;
  id: number;
  correo: string;
  cedula: string;
}

@Component({
  selector: 'app-lista-planificaciones',
  templateUrl: './lista-planificaciones.component.html',
  styleUrls: ['./lista-planificaciones.component.css']
})

export class ListaPlanificacionesComponent implements OnInit {

  // ITEMS DE PAGINACION DE LA LISTA DE PLANIFICACIONES
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA DE LA LISTA DE EMPLEADOS CON PLANIFICACION SELECCIONADA
  pageSizeOptions_empleado = [5, 10, 20, 50];
  tamanio_pagina_empleado: number = 5;
  numero_pagina_empleado: number = 1;

  // ALMACENAMIENTO DE DATOS DE PLANIFICACION
  listaPlan: any = [];

  // VARIABLE PARA GURDAR DATOS SELECCIONADOS DE LISTA DE PLANIFICACIONES
  selectionUno = new SelectionModel<PlanificacionHE>(true, []);

  // VARIABLE PARA MOSTRAR U OCULTAR ICONO DE EDICION O ELIMINACION DE PLANIFICACION
  ver_icono: boolean = true; // ÍCONO ELIMINAR - EDITAR LISTA PLANIFICACIONES
  ver_editar: boolean = true; // ÍCONO EDITAR LISTA PLANIFICACIONES EMPLEADO
  ver_eliminar: boolean = true; // ÍCONO ELIMINAR LISTA PLANIFICACIONES EMPLEADO

  idEmpleadoLogueado: number; // VARIABLE PARA ALMACENAR ID DE EMPLEADO QUE INICIA SESION
  empleado: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  get habilitarHorasE(): boolean { return this.funciones.horasExtras; }

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantilla.color_Secundary; }
  get p_color(): string { return this.plantilla.color_Primary; }
  get logoE(): string { return this.plantilla.logoBase64; }
  get frase(): string { return this.plantilla.marca_Agua; }

  constructor(
    public restEmpleado: EmpleadoService,
    public restPlan: PlanHoraExtraService,
    public ventana: MatDialog,
    public aviso: RealTimeService,
    private plantilla: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private parametro: ParametrosService,
    private funciones: MainNavService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  fecha: any;
  ngOnInit(): void {
    if (this.habilitarHorasE === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Horas Extras. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.user_name = localStorage.getItem('usuario');
      this.ip = localStorage.getItem('ip');

      var f = moment();
      this.ObtenerEmpleados(this.idEmpleadoLogueado);
      this.fecha = f.format('YYYY-MM-DD');
      this.BuscarParametro();
      this.BuscarFecha();
    }
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe((data) => {
      this.empleado = data;
    });
  }

  // METODO PARA MANEJAR PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA MOSTRAR FILAS DETERMINADAS EN TABLA DE EMPLEADOS CON PLANIFICACION
  ManejarPaginaEmpleados(e: PageEvent) {
    this.tamanio_pagina_empleado = e.pageSize;
    this.numero_pagina_empleado = e.pageIndex + 1;
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarFecha() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora(this.formato_fecha)
      },
      vacio => {
        this.BuscarHora(this.formato_fecha)
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.ListarPlanificaciones(fecha, this.formato_hora);
      },
      vacio => {
        this.ListarPlanificaciones(fecha, this.formato_hora);
      });
  }

  lista_plan: boolean = false;
  ListarPlanificaciones(formato_fecha: string, formato_hora: string) {
    this.listaPlan = [];
    this.restPlan.ConsultarPlanificaciones().subscribe(response => {
      this.listaPlan = response;

      console.log('ver data ... ', this.listaPlan)

      this.listaPlan.forEach((data: any) => {
        data.fecha_desde_ = this.validar.FormatearFecha(data.fecha_desde, formato_fecha, this.validar.dia_abreviado);
        data.fecha_hasta_ = this.validar.FormatearFecha(data.fecha_hasta, formato_fecha, this.validar.dia_abreviado);
        data.hora_inicio_ = this.validar.FormatearHora(data.hora_inicio, formato_hora);
        data.hora_fin_ = this.validar.FormatearHora(data.hora_fin, formato_hora);
      })

      if (this.listaPlan.length != 0) {
        this.lista_plan = true;
      }
    }, err => {
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  // METODO PARA BUSQUEDA DE DATOS DE EMPLEADOS CON PLANIFICACIÓN
  planEmpleados: any = []; // VARIABLE PARA GUARDAR DATOS DE EMPLEADOS CON PLANIFICACIÓN
  lista_empleados: boolean = false; // LISTA DE USUARIOS
  ObtenerEmpleadosPlanificacion(id: any, accion: any, lista_empleados: any, icono: any, editar: any, eliminar: any) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    }
    this.restPlan.BuscarPlanEmpleados(id).subscribe(res => {
      this.planEmpleados = res;
      this.FormatearDatos(this.planEmpleados);
      this.tipo_accion = accion;
      this.lista_empleados = lista_empleados;
      this.ver_icono = icono;
      this.ver_editar = editar;
      this.ver_eliminar = eliminar;
    }, error => {
      this.restPlan.EliminarRegistro(id, datos).subscribe(res => {
        this.toastr.warning('Planificación no ha sido asignada a ningún colaborador.', 'Registro eliminado.', {
          timeOut: 6000,
        })
        this.BuscarFecha();
      });
    });
  }

  FormatearDatos(lista: any) {
    lista.forEach((data: any) => {
      data.fecDesde = this.validar.FormatearFecha(data.fecha_desde, this.formato_fecha, this.validar.dia_abreviado);
      data.fecHasta = this.validar.FormatearFecha(data.fecha_hasta, this.formato_fecha, this.validar.dia_abreviado);
      data.horaInicio = this.validar.FormatearHora(data.hora_inicio, this.formato_hora);
      data.horaFin = this.validar.FormatearHora(data.hora_fin, this.formato_hora);
    })
  }

  // METODO PARA VER LISTA DE EMPLEADOS CON PLANIFICACIÓN SELECCIONADA CON ÍCONO EDITAR ACTIVO
  tipo_accion: string = '';
  HabilitarTablaEditar(id: any) {
    this.ObtenerEmpleadosPlanificacion(id, '1', true, false, true, false);
  }

  // METODO PARA VER LISTA DE EMPLEADOS CON PLANIIFCACIÓN SELECCIONADA CON ÍCONO ELIMINAR ACTIVO
  HabilitarTablaEliminar(id: any) {
    this.ObtenerEmpleadosPlanificacion(id, '2', true, false, false, true);
  }

  AbrirEditarPlan(datoSeleccionado: any, forma: any) {
    /*
        this.ventana.open(EditarPlanHoraExtraComponent, {
          width: '600px',
          data: { planifica: datoSeleccionado, modo: forma }
        })
          .afterClosed().subscribe(id_plan => {
            this.VerificarPlanificacion(id_plan, '1', true, false);
            this.botonSeleccion = false;
            this.botonEditar = false;
            this.botonEliminar = false;
            //this.ver_editar = true;
            this.selectionUno.clear();
          });
          */
    let data = { planifica: datoSeleccionado, modo: forma };
    this.VerFormularioEditar(data);
  }

  // METODO PARA LEER TODOS LOS DATOS SELECCIONADOS Y EDITAR
  EditarRegistrosMultiple() {
    let EmpleadosSeleccionados: any;
    EmpleadosSeleccionados = this.selectionUno.selected;
    if (EmpleadosSeleccionados.length === 1) {
      this.AbrirEditarPlan(EmpleadosSeleccionados[0], 'individual');
    } else if (EmpleadosSeleccionados.length > 1) {
      this.AbrirEditarPlan(EmpleadosSeleccionados, 'multiple');
    }
    else {
      this.toastr.info('No ha seleccionado ningún registro.', 'Seleccionar registros.', {
        timeOut: 6000,
      })
    }
  }

  // VERIFICAR SI LA PLANIFICACION TIENE DATOS DE EMPLEADOS
  VerificarPlanificacion(id: number, accion: any, editar: any, eliminar: any) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    }
    this.restPlan.BuscarPlanEmpleados(id).subscribe(res => {
      this.lista_empleados = true;
      this.planEmpleados = res;
      this.FormatearDatos(this.planEmpleados);
      this.ver_eliminar = eliminar;
      this.tipo_accion = accion;
      this.ver_editar = editar;
      this.ver_icono = false;
    }, res => {
      this.restPlan.EliminarRegistro(id, datos).subscribe(res => {
        this.tipo_accion = accion;
        this.lista_empleados = false;
        this.ver_icono = true;
        this.ver_editar = false;
        this.ver_eliminar = false;
        this.BuscarFecha();
      });
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeletePlan(datos: any) {
    console.log('ver data seleccionada... ', datos)
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarPlanEmpleado(datos.id_plan, datos.id_empleado, datos);
        }
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACION
  EliminarPlanEmpleado(id_plan: number, id_empleado: number, datos: any) {

    const data = {
      user_name: this.user_name,
      ip: this.ip
    }

    // LECTURA DE DATOS DE USUARIO
    let usuario = '<tr><th>' + datos.nombre +
      '</th><th>' + datos.cedula + '</th></tr>';
    let cuenta_correo = datos.correo;

    // LECTURA DE DATOS DE LA PLANIFICACIÓN
    let desde = this.validar.FormatearFecha(datos.fecha_desde, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(datos.fecha_hasta, this.formato_fecha, this.validar.dia_completo);
    let h_inicio = this.validar.FormatearHora(datos.hora_inicio, this.formato_hora);
    let h_fin = this.validar.FormatearHora(datos.hora_fin, this.formato_hora);

    this.restPlan.EliminarPlanEmpleado(id_plan, id_empleado, data).subscribe(res => {
      this.NotificarPlanificacion(desde, hasta, h_inicio, h_fin, id_empleado);
      this.EnviarCorreo(datos, cuenta_correo, usuario, desde, hasta, h_inicio, h_fin);
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.botonSeleccion = false;
      this.botonEditar = false;
      this.botonEliminar = false;
      this.selectionUno.clear();
      this.VerificarPlanificacion(id_plan, '2', false, true);
    });
  }

  // METODO PARA LEER TODOS LOS DATOS SELECCIONADOS Y ELIMINAR
  EliminarRegistrosMultiple() {
    let EmpleadosSeleccionados: any;
    EmpleadosSeleccionados = this.selectionUno.selected;

    if (EmpleadosSeleccionados.length === 1) {
      this.ConfirmarDeletePlan(EmpleadosSeleccionados[0]);

    } else if (EmpleadosSeleccionados.length > 1) {
      this.ContarCorreos(EmpleadosSeleccionados);

      if (this.cont_correo <= this.correos) {
        this.ConfirmarDeletePlanMultiple(EmpleadosSeleccionados)
      }
      else {
        this.toastr.warning('Trata de enviar correo de un total de ' + this.cont_correo + ' colaboradores, sin embargo solo tiene permitido enviar un total de ' + this.correos + ' correos.', 'ACCIÓN NO PERMITIDA.', {
          timeOut: 6000,
        });
      }

    }
    else {
      this.toastr.info('No ha seleccionado ningún registro.', 'Seleccionar registros.', {
        timeOut: 6000,
      })
    }
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  contar: number = 0;
  contar_eliminados: number = 0;
  ConfirmarDeletePlanMultiple(datos: any) {
    console.log('ver data seleccionada... ', datos)
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarPlanMultiple(datos, datos[0].id_plan);
        }
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACION
  EliminarPlanMultiple(datos: any, id_plan: number) {
    var usuario = '';

    this.contar_eliminados = 0;

    const data = {
      user_name: this.user_name,
      ip: this.ip
    }

    datos.map((obj: any) => {

      console.log('ver datos seleccionados', obj)

      // LECTURA DE NOMBRES DE USUARIOS
      usuario = usuario + '<tr><th>' + obj.nombre + '</th><th>' + obj.cedula + '</th></tr>';

      // LECTURA DE DATOS DE LA PLANIFICACIÓN
      let desde = moment.weekdays(moment(obj.fecha_desde).day()).charAt(0).toUpperCase() + moment.weekdays(moment(obj.fecha_desde).day()).slice(1);
      let hasta = moment.weekdays(moment(obj.fecha_hasta).day()).charAt(0).toUpperCase() + moment.weekdays(moment(obj.fecha_hasta).day()).slice(1);
      let h_inicio = moment(obj.hora_inicio, 'HH:mm').format('HH:mm');
      let h_fin = moment(obj.hora_fin, 'HH:mm').format('HH:mm');


      this.restPlan.EliminarPlanEmpleado(obj.id_plan, obj.id_empleado, data).subscribe(res => {
        // CONTAR DATOS PROCESADOS
        this.contar_eliminados = this.contar_eliminados + 1;
        this.NotificarPlanificacion(desde, hasta, h_inicio, h_fin, obj.id_empleado);

        // SI TODOS LOS DATOS HAN SIDO PROCESADOS ENVIAR CORREO
        if (this.contar_eliminados === datos.length) {
          this.EnviarCorreo(datos[0], this.info_correo, usuario, desde, hasta, h_inicio, h_fin);
          this.toastr.error('Se ha eliminado un total de ' + datos.length + ' registros.', '', {
            timeOut: 6000,
          });
          this.VerificarPlanificacion(id_plan, '2', false, true);
          this.botonSeleccion = false;
          this.botonEditar = false;
          this.botonEliminar = false;
          this.selectionUno.clear();
        }
      });
    })
  }

  // METODO PARA HABILITAR O DESHABILITAR EL BOTON EDITAR O ELIMINAR
  botonSeleccion: boolean = false;
  botonEditar: boolean = false;
  botonEliminar: boolean = false;
  HabilitarSeleccion() {
    if (this.botonSeleccion === false && this.tipo_accion === '1') {
      this.botonSeleccion = true;
      this.botonEditar = true;
      this.botonEliminar = false;
      this.ver_editar = false;
    }
    else if (this.botonSeleccion === false && this.tipo_accion === '2') {
      this.botonSeleccion = true;
      this.botonEliminar = true;
      this.botonEditar = false;
      this.ver_eliminar = false;
    }
    else if (this.botonSeleccion === true && this.tipo_accion === '1') {
      this.botonSeleccion = false;
      this.botonEditar = false;
      this.botonEliminar = false;
      this.ver_editar = true;
    }
    else if (this.botonSeleccion === true && this.tipo_accion === '2') {
      this.botonSeleccion = false;
      this.botonEditar = false;
      this.botonEliminar = false;
      this.ver_eliminar = true;
    }
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.planEmpleados.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.planEmpleados.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabel(row?: PlanificacionHE): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA CERRAR TABLA DE LISTA DE EMPLEADOS CON PLANIFICACION SELECCIONADA
  CerrarTabla() {
    this.lista_empleados = false;
    this.ver_icono = true;
    this.ver_editar = false;
    this.ver_eliminar = false;
    this.botonSeleccion = false;
    this.botonEditar = false;
    this.botonEliminar = false;
    this.BuscarFecha();
    this.selectionUno.clear();
  }

  // METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE HORAS EXTRAS
  NotificarPlanificacion(desde: any, hasta: any, h_inicio: any, h_fin: any, recibe: number) {
    let mensaje = {
      id_empl_envia: this.idEmpleadoLogueado,
      id_empl_recive: recibe,
      tipo: 10, // PLANIFICACION DE HORAS EXTRAS
      mensaje: 'Planificación de horas extras eliminada desde ' +
        desde + ' hasta ' +
        hasta + ' horario de ' + h_inicio + ' a ' + h_fin,
      user_name: this.user_name,
      ip: this.ip
    }
    this.restPlan.EnviarNotiPlanificacion(mensaje).subscribe(res => {
      this.aviso.RecibirNuevosAvisos(res.respuesta);
    });
  }

  // METODO DE ENVIO DE CORREO DE PLANIFICACION DE HORAS EXTRAS
  EnviarCorreo(datos: any, cuenta_correo: any, usuario: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {

    // DATOS DE ESTRUCTURA DEL CORREO
    let DataCorreo = {
      tipo_solicitud: 'ELIMINA',
      id_empl_envia: this.idEmpleadoLogueado,
      observacion: datos.descripcion,
      proceso: 'eliminado',
      correos: cuenta_correo,
      nombres: usuario,
      asunto: 'ELIMINACION DE PLANIFICACION DE HORAS EXTRAS',
      inicio: h_inicio,
      desde: desde,
      hasta: hasta,
      horas: moment(datos.horas_totales, 'HH:mm').format('HH:mm'),
      fin: h_fin,
    }

    // METODO ENVIO DE CORREO DE PLANIFICACION DE HE
    this.restPlan.EnviarCorreoPlanificacion(DataCorreo).subscribe(res => {
      if (res.message === 'ok') {
        this.toastr.success('Correo de planificación enviado exitosamente.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de planificación.', {
          timeOut: 6000,
        });
      }
    })
  }

  // METODO DE BUSQUEDA DE NUMERO PERMITIDO DE CORREOS
  correos: number;
  BuscarParametro() {
    // id_tipo_parametro LIMITE DE CORREOS = 13
    let datos: any = [];
    this.parametro.ListarDetalleParametros(13).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          this.correos = parseInt(datos[0].descripcion)
        }
        else {
          this.correos = 0
        }
      });
  }

  // METODO PARA CONTAR NUMERO DE CORREOS A ENVIAR
  cont_correo: number = 0;
  info_correo: string = '';
  ContarCorreos(data: any) {
    this.cont_correo = 0;
    this.info_correo = '';
    data.forEach((obj: any) => {
      this.cont_correo = this.cont_correo + 1
      if (this.info_correo === '') {
        this.info_correo = obj.correo;
      }
      else {
        this.info_correo = this.info_correo + ', ' + obj.correo;
      }
    })
  }

  // METODO PARA VER FORMULARIO EDITAR
  ver_listas: boolean = true;
  ver_form_editar: boolean = false;
  datos_editar: any;
  pagina: string = '';
  VerFormularioEditar(datos: any) {
    this.ver_listas = false;
    this.ver_form_editar = true;
    this.datos_editar = datos;
    this.pagina = 'lista-planificaciones';
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS PDF                              ** **
   ** ************************************************************************************************* **/

  // METODO PARA CREAR ARCHIVO PDF
  generarPdf(action = "open") {
    const documentDefinition = this.getDocumentDefinicion();
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

  getDocumentDefinicion() {
    sessionStorage.setItem("PlanificacionesHE", this.listaPlan);
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
          text: "Planificaciones de horas extras",
          bold: true,
          fontSize: 16,
          alignment: "center",
          margin: [0, -10, 0, 10],
        },
        this.PresentarDataPDFHoras(),
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
  PresentarDataPDFHoras() {
    return {
      columns: [
        { width: "*", text: "" },
        {
          width: "auto",
          table: {
            widths: ["auto", "auto", "auto", "auto", "auto", "auto"],
            body: [
              [
                { text: "Descripción", style: "tableHeader" },
                { text: "Fecha inicio", style: "tableHeader" },
                { text: "Fecha Final", style: "tableHeader" },
                { text: "Hora inicio", style: "tableHeader" },
                { text: "Hora Final", style: "tableHeader" },
                { text: "Horas Totales", style: "tableHeader" },
              ],
              ...this.listaPlan.map((obj) => {
                return [
                  { text: obj.descripcion, style: "itemsTable" },
                  { text: obj.fecha_desde_, style: "itemsTable" },
                  { text: obj.fecha_hasta_, style: "itemsTable" },
                  { text: obj.hora_inicio_, style: "itemsTable" },
                  { text: obj.hora_fin_, style: "itemsTable" },
                  { text: obj.horas_totales, style: "itemsTable" },
                ];
              }),
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


  /** ************************************************************************************************* **
  ** **                             PARA LA EXPORTACION DE ARCHIVOS EXCEL                           ** **
  ** ************************************************************************************************* **/

  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.listaPlan.map((obj: any) => {
      return {
        Descripcion: obj.descripcion,
        Fecha_Inicio: obj.fecha_desde_,
        Fecha_Fin: obj.fecha_hasta_,
        Hora_Inicio: obj.hora_inicio_,
        Hora_Fin: obj.hora_fin_,
        Horas_Totales: obj.horas_totales,
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.listaPlan[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTA ROLES');
    xlsx.writeFile(wb, 'PlanificacionesHorasEXCEL' + new Date().getTime() + '.xlsx');
  }

  /** ************************************************************************************************** **
  ** **                                     METODO PARA EXPORTAR A CSV                               ** **
  ** ************************************************************************************************** **/

  exportToCVS() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.listaPlan.map((obj: any) => {
      return {
        Descripcion: obj.descripcion,
        Fecha_Inicio: obj.fecha_desde_,
        Fecha_Fin: obj.fecha_hasta_,
        Hora_Inicio: obj.hora_inicio_,
        Hora_Fin: obj.hora_fin_,
        Horas_Totales: obj.horas_totales,
      }
    }));
    const csvDataC = xlsx.utils.sheet_to_csv(wsr);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, 'PlanificacionesHorasCSV' + new Date().getTime() + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS XML                           ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto: any;
    var arregloPlanificacion: any = [];
    this.listaPlan.forEach((obj: any) => {
      objeto = {
        "lista_planificaciones": {
          '@id': obj.id,
          "descripcion": obj.descripcion,
          "fecha_inicio": obj.fecha_desde_,
          "fecha_fin": obj.fecha_hasta_,
          "hora_inicio": obj.hora_inicio_,
          "hora_fin": obj.hora_fin_,
          "horas_totales": obj.horas_totales,
        }
      }
      arregloPlanificacion.push(objeto)
    });
    this.restPlan.CrearXML(arregloPlanificacion).subscribe(res => {
      this.data = res;
      this.urlxml = `${(localStorage.getItem('empresaURL') as string)}/planificacionHoraExtra/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

  //Control Botones
  

}
