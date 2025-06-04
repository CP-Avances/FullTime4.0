// LLAMADO DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

// LLAMADO A COMPONENTES
import { EditarPlanComidasComponent } from '../editar-plan-comidas/editar-plan-comidas.component';

// LLAMADO A SERVICIOS
import { PlantillaReportesService } from "src/app/componentes/reportes/plantilla-reportes.service";
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { PlanComidasService } from 'src/app/servicios/modulos/modulo-alimentacion/planComidas/plan-comidas.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

// EXPORTACION DE DATOS A SER LEIDOS EN COMPONENTE DE EMPLEADOS PLANIFICACIÓN
export interface SolicitudElemento {
  nombre_servicio: string;
  nombre_plato: string;
  hora_inicio: string;
  id_empleado: number;
  nombre_menu: string;
  fec_inicio: string;
  fec_final: string;
  fecha: string;
  hora_fin: string;
  nombre: string;
  codigo: number;
  id: number;
  extra: boolean;
  id_detalle: number;
  id_menu: number;
  id_servicio: number;
  observa_menu: string;
  observacion: string;
  valor: string;
  correo: string;
  identificacion: string;
}

@Component({
  selector: 'app-listar-planificacion',
  standalone: false,
  templateUrl: './listar-planificacion.component.html',
  styleUrls: ['./listar-planificacion.component.css']
})

export class ListarPlanificacionComponent implements OnInit {
  ips_locales: any = '';


  // VARIABLE PARA GUARDAR DATOS DE LISTA DE PLANIFICACIONES
  planificaciones: any = [];

  // VARIABLE PARA GURDAR DATOS SELECCIONADOS DE LISTA DE PLANIFICACIONES
  selectionUno = new SelectionModel<SolicitudElemento>(true, []);

  // VARIABLES PARA MOSTRAR U OCULTAR LISTAS DE PLANIFICACIONES
  lista_planificaciones: boolean = false; // LISTA DE SOLICITUDES PENDIENTES
  lista_empleados: boolean = false; // LISTA DE SOLICITUDES EXPIRADAS

  validarMensaje1: boolean = false;
  validarMensaje2: boolean = false;

  // VARIABLE PARA MOSTRAR U OCULTAR ÍCONO DE EDICIÓN O ELIMINACIÓN DE PLANIFICACIÓN
  ver_icono: boolean = true; // ÍCONO ELIMINAR - EDITAR LISTA PLANIFICACIONES
  ver_editar: boolean = true; // ÍCONO EDITAR LISTA PLANIFICACIONES EMPLEADO
  ver_eliminar: boolean = true; // ÍCONO ELIMINAR LISTA PLANIFICACIONES EMPLEADO

  // ITEMS DE PAGINACION DE LA TABLA DE LISTA DE PLANIFICACIONES DE SERVICIO DE ALIMENTACIÓN
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DE LA LISTA DE EMPLEADOS CON PLANIFICACIÓN SELECCIONADA
  pageSizeOptions_empleado = [5, 10, 20, 50];
  tamanio_pagina_empleado: number = 5;
  numero_pagina_empleado: number = 1;

  idEmpleadoLogueado: number; // VARIABLE PARA ALMACENAR ID DE EMPLEADO QUE INICIA SESIÓN
  empleado: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  get habilitarComida(): boolean { return this.funciones.alimentacion; }

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantilla.color_Secundary; }
  get p_color(): string { return this.plantilla.color_Primary; }
  get logoE(): string { return this.plantilla.logoBase64; }
  get frase(): string { return this.plantilla.marca_Agua; }

  constructor(
    private plantilla: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    public restEmpleado: EmpleadoService, // SERVICIO DATOS EMPLEADO
    public validar: ValidacionesService,
    public toastr: ToastrService, // VARIABLE PARA MOSTRAR NOTIFICACIONES
    public router: Router,
    public aviso: RealTimeService,
    public restC: PlanComidasService, // SERVICIO DATOS SERVICIO DE COMIDA
    private ventana: MatDialog, // VARIABLE PARA LLAMADO A COMPONENTES
    private parametro: ParametrosService,
    private funciones: MainNavService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarComida === false) {
      let mensaje = {
        access: false,
        title: `Ups! al parecer no tienes activado en tu plan el Módulo de Alimentación. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.user_name = localStorage.getItem('usuario');
      this.ip = localStorage.getItem('ip');  
      this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
      this.ObtenerEmpleados(this.idEmpleadoLogueado);
      this.BuscarParametro();
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

  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametro() {
    let datos: any = [];
    let detalles = { parametros: '1, 2' };
    this.parametro.ListarVariosDetallesParametros(detalles).subscribe(
      res => {
        datos = res;
        //console.log('datos ', datos)
        datos.forEach((p: any) => {
          // id_tipo_parametro Formato fecha = 1
          if (p.id_parametro === 1) {
            this.formato_fecha = p.descripcion;
          }
          // id_tipo_parametro Formato hora = 2
          else if (p.id_parametro === 2) {
            this.formato_hora = p.descripcion;
          }
        })
        this.ObtenerPlanificaciones(this.formato_fecha, this.formato_hora);
      }, vacio => {
        this.ObtenerPlanificaciones(this.formato_fecha, this.formato_hora);
      });
  }

  /** ********************************************************************************************* */
  /**            METODOS USADOS PARA MANEJO DE DATOS DE PLANIFICACIONES DE COMIDAS                  */
  /** ********************************************************************************************* */

  // METODO PARA MOSTRAR UN DETERMINADO NÚMERO DE FILAS EN LA TABLA DE SOLICITUDES PENDIENTES
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  // METODO PARA BUSQUEDA DE DATOS DE SOLICITUDES PENDIENTES
  ObtenerPlanificaciones(formato_fecha: string, formato_hora: string) {
    this.planificaciones = [];
    this.restC.ObtenerPlanComidas().subscribe(res => {
      this.planificaciones = res;

      if (this.planificaciones.length != 0) {
        this.lista_planificaciones = true;
      } else {
        this.lista_planificaciones = false;
        this.validarMensaje1 = true;
      }

      this.FormatearDatos(this.planificaciones, formato_fecha, formato_hora);
    }, err => {
      this.validarMensaje1 = true;
    });
  }

  // METODO PARA VER LISTA DE EMPLEADOS CON PLANIFICACION SELECCIONADA CON ÍCONO EDITAR ACTIVO
  tipo_accion: string = '';
  HabilitarTablaEditar(id: any) {
    this.ObtenerEmpleadosPlanificacion(id, '1', true, false, true, false);
  }

  // METODO PARA VER LISTA DE EMPLEADOS CON PLANIIFCACION SELECCIONADA CON ICONO ELIMINAR ACTIVO
  HabilitarTablaEliminar(id: any) {
    this.ObtenerEmpleadosPlanificacion(id, '2', true, false, false, true);
  }

  // METODO PARA CERRAR TABLA DE LISTA DE EMPLEADOS CON PLANIFICACION SELECCIONADA
  CerrarTabla() {
    this.lista_empleados = false;
    this.validarMensaje2 = true;
    this.ver_icono = true;
    this.ver_editar = false;
    this.ver_eliminar = false;
    this.botonSeleccion = false;
    this.botonEditar = false;
    this.botonEliminar = false;
    this.BuscarParametro();
    this.selectionUno.clear();
  }

  // VENTANA PARA EDITAR PLANIFICACION DE COMIDAS
  AbrirEditarPlanComidas(datoSeleccionado: any, modo: any): void {
    console.log(datoSeleccionado);
    // VERIFICAR SI HAY UN REGISTRO CON ESTADO CONSUMIDO DENTRO DE LA PLANIFICACION
    let datosConsumido = {
      id_plan_comida: datoSeleccionado.id,
      id_empleado: datoSeleccionado.id_empleado
    }
    this.restC.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
      this.toastr.info('Proceso inválido. ' + datoSeleccionado.nombre + ' ' + datoSeleccionado.apellido + ' ya tiene un registro de servicio de alimentación consumido.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.VentanaEditarPlanComida(datoSeleccionado, EditarPlanComidasComponent, modo);
    });

  }

  VentanaEditarPlanComida(datoSeleccionado: any, componente: any, forma: any) {
    this.ventana.open(componente, {
      width: '600px',
      data: { solicitud: datoSeleccionado, modo: forma }
    })
      .afterClosed().subscribe(item => {
        if (forma === 'multiple') {
          var id = datoSeleccionado[0].id;
        }
        else {
          id = datoSeleccionado.id
        }
        this.VerificarPlanificacion(id, '1', true, false);
        this.botonSeleccion = false;
        this.botonEditar = false;
        this.botonEliminar = false;
        this.selectionUno.clear();
        this.BuscarParametro();
      });
  }


  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACION
  EliminarPlanComidas(id_plan: number, id_empleado: number, datos: any) {

    const data = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };

    // LECTURA DE DATOS DE USUARIO
    let usuario = '<tr><th>' + datos.nombre +
      '</th><th>' + datos.identificacion + '</th></tr>';
    let cuenta_correo = datos.correo;

    // LECTURA DE DATOS DE LA PLANIFICACIÓN
    let desde = this.validar.FormatearFecha(datos.fec_inicio, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
    let hasta = this.validar.FormatearFecha(datos.fec_final, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
    let h_inicio = this.validar.FormatearHora(datos.hora_inicio, this.formato_hora);
    let h_fin = this.validar.FormatearHora(datos.hora_fin, this.formato_hora);

    this.restC.EliminarPlanComida(id_plan, id_empleado, data).subscribe(res => {
      this.NotificarPlanificacion(datos, desde, hasta, h_inicio, h_fin, id_empleado);
      this.EnviarCorreo(datos, cuenta_correo, usuario, desde, hasta, h_inicio, h_fin);
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.VerificarPlanificacion(id_plan, '2', false, true);
      this.botonSeleccion = false;
      this.botonEditar = false;
      this.botonEliminar = false;
      this.selectionUno.clear();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeletePlanComidas(datos: any) {
    console.log('ver data seleccionada... ', datos)
    // VERIFICAR SI HAY UN REGISTRO CON ESTADO CONSUMIDO DENTRO DE LA PLANIFICACION
    let datosConsumido = {
      id_plan_comida: datos.id,
      id_empleado: datos.id_empleado
    }
    this.restC.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
      this.toastr.info('Proceso no permitido. Usuario ' + datos.nombre + ' ' + datos.apellido + ' tiene un registro de alimentación consumido.', '', {
        timeOut: 6000,
      })
    }, error => {
      (document.activeElement as HTMLElement)?.blur();
      this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarPlanComidas(datos.id, datos.id_empleado, datos);
          }
        });
    });
  }

  FormatearDatos(lista: any, formato_fecha: string, formato_hora: string) {
    lista.forEach((data: any) => {
      data.fecInicio = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
      data.fecFinal = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
      data.horaInicio = this.validar.FormatearHora(data.hora_inicio, formato_hora);
      data.horaFin = this.validar.FormatearHora(data.hora_fin, formato_hora);
    })
  }


  /** ********************************************************************************************* */
  /**      METODOS USADOS PARA MANEJO DE DATOS EMPLEADOS CON PLANIFICACIÓN SELECCIONADA             */
  /** ********************************************************************************************* */

  // METODO PARA MOSTRAR FILAS DETERMINADAS EN TABLA DE EMPLEADOS CON PLANIFICACIÓN
  ManejarPaginaEmpleados(e: PageEvent) {
    this.tamanio_pagina_empleado = e.pageSize;
    this.numero_pagina_empleado = e.pageIndex + 1;
  }

  // METODO PARA BUSQUEDA DE DATOS DE EMPLEADOS CON PLANIFICACIÓN
  planEmpleados: any = []; // VARIABLE PARA GUARDAR DATOS DE EMPLEADOS CON PLANIFICACIÓN
  ObtenerEmpleadosPlanificacion(id: any, accion: any, lista_empleados: any, icono: any, editar: any, eliminar: any) {

    const datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };

    this.restC.ObtenerPlanComidaPorIdPlan(id).subscribe(res => {
      this.planEmpleados = res;
      this.FormatearDatos(this.planEmpleados, this.formato_fecha, this.formato_hora);
      this.tipo_accion = accion;
      this.lista_empleados = lista_empleados;
      this.ver_icono = icono;
      this.ver_editar = editar;
      this.ver_eliminar = eliminar;

      if (this.planEmpleados.length == 0) {
        this.lista_empleados = false;
        this.validarMensaje2 = true;
      }

    }, error => {
      this.restC.EliminarRegistro(id, datos).subscribe(res => {
        this.toastr.warning('Planificación no ha sido asignada a ningún colaborador.', 'Registro eliminado.', {
          timeOut: 6000,
        })
        this.BuscarParametro();
        this.validarMensaje2 = true;
      });

      this.validarMensaje2 = true;
    });
  }

  // METODO PARA HABILITAR O DESHABILITAR EL BOTÓN EDITAR O ELIMINAR
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
  checkboxLabel(row?: SolicitudElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA LEER TODOS LOS DATOS SELECCIONADOS Y EDITAR
  EditarRegistrosMultiple() {
    let EmpleadosSeleccionados: any;
    EmpleadosSeleccionados = this.selectionUno.selected.map((obj: any) => {
      return {
        nombre: obj.nombre,
        identificacion: obj.identificacion,
        correo: obj.correo,
        id_empleado: obj.id_empleado,
        hora_inicio: obj.hora_inicio,
        hora_fin: obj.hora_fin,
        fec_inicio: obj.fec_inicio,
        fec_final: obj.fec_final,
        codigo: obj.codigo,
        id: obj.id,
        extra: obj.extra,
        fecha: obj.fecha,
        id_detalle: obj.id_detalle,
        id_menu: obj.id_menu,
        id_servicio: obj.id_servicio,
        observacion: obj.observacion
      }
    })
    if (EmpleadosSeleccionados.length === 1) {
      this.AbrirEditarPlanComidas(EmpleadosSeleccionados[0], 'individual');
    } else if (EmpleadosSeleccionados.length > 1) {
      this.AbrirEditarPlanComidas(EmpleadosSeleccionados, 'multiple');
    }
    else {
      this.toastr.info('No ha seleccionado ningún registro.', 'Seleccionar registros.', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA LEER TODOS LOS DATOS SELECCIONADOS Y ELIMINAR
  EliminarRegistrosMultiple() {
    let EmpleadosSeleccionados: any;
    EmpleadosSeleccionados = this.selectionUno.selected.map((obj: any) => {
      console.log('ver data obj... ', obj)
      return {
        alimentacion: obj
      }
    })

    console.log('ver data de empleados ... ', EmpleadosSeleccionados[0].alimentacion)
    if (EmpleadosSeleccionados.length === 1) {
      this.ConfirmarDeletePlanComidas(EmpleadosSeleccionados[0].alimentacion);
    } else if (EmpleadosSeleccionados.length > 1) {

      this.LeerCorreos(EmpleadosSeleccionados);
      this.ConfirmarDeletePlanComidasMultiple(EmpleadosSeleccionados)
    }
    else {
      this.toastr.info('No ha seleccionado ningún registro.', 'Seleccionar registros.', {
        timeOut: 6000,
      })
    }
  }


  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACIÓN
  id_plan: any;
  EliminarPlanComidasMultiple(datos: any) {

    const data = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };

    var usuario = '';

    datos.map((obj: any) => {

      console.log('ver eliminar 56666 ', plan)
      var plan = obj.alimentacion
      // LECTURA DE DATOS DE LA PLANIFICACIÓN
      let desde = this.validar.FormatearFecha(plan.fec_inicio, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
      let hasta = this.validar.FormatearFecha(plan.fec_final, this.formato_fecha, this.validar.dia_completo, this.idioma_fechas);
      let h_inicio = this.validar.FormatearHora(plan.hora_inicio, this.formato_hora);
      let h_fin = this.validar.FormatearHora(plan.hora_fin, this.formato_hora);

      // LECTURA DE NOMBRES DE USUARIOS
      usuario = usuario + '<tr><th>' + plan.nombre + '</th><th>' + plan.identificacion + '</th></tr>';

      this.restC.EliminarPlanComida(plan.id, plan.id_empleado, data).subscribe(res => {
        this.contar_eliminados = this.contar_eliminados + 1;
        this.NotificarPlanificacion(datos, desde, hasta, h_inicio, h_fin, plan.id_empleado);

        if (this.contar_eliminados === datos.length) {
          this.EnviarCorreo(plan, this.info_correo, usuario, desde, hasta, h_inicio, h_fin);
          this.toastr.error('Se ha eliminado un total de ' + datos.length + ' registros.', '', {
            timeOut: 6000,
          });
          this.VerificarPlanificacion(plan.id, '2', false, true);
          this.botonSeleccion = false;
          this.botonEditar = false;
          this.botonEliminar = false;
          this.selectionUno.clear();
        }
      });
    })
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  empleado_conConsumo: any = [];
  empleado_sinConsumo: any = [];
  contar: number = 0;
  contar_eliminados: number = 0;
  nota_nombres: string = '';
  ConfirmarDeletePlanComidasMultiple(datos: any) {
    console.log('ver datos seleccionados', datos)
    this.empleado_conConsumo = [];
    this.empleado_sinConsumo = [];
    this.contar = 0;
    this.contar_eliminados = 0;
    datos.map((obj: any) => {

      // VERIFICAR SI HAY UN REGISTRO CON ESTADO CONSUMIDO DENTRO DE LA PLANIFICACION
      let datosConsumido = {
        id_plan_comida: obj.alimentacion.id,
        id_empleado: obj.alimentacion.id_empleado
      }
      this.restC.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
        this.contar = this.contar + 1;
        this.empleado_conConsumo = this.empleado_conConsumo.concat(obj);
        this.nota_nombres = this.nota_nombres + ' - ' + obj.alimentacion.nombre;
        if (this.contar === datos.length) {
          this.MostrarMensajeEliminado(this.empleado_conConsumo, datos, this.nota_nombres);
          this.nota_nombres = '';
          this.MetodoEliminar(this.empleado_sinConsumo);
        }
      }, error => {
        this.contar = this.contar + 1;
        this.empleado_sinConsumo = this.empleado_sinConsumo.concat(obj);
        if (this.contar === datos.length) {
          this.MostrarMensajeEliminado(this.empleado_conConsumo, datos, this.nota_nombres);
          this.nota_nombres = '';
          this.MetodoEliminar(this.empleado_sinConsumo);
        }
      });

    })
  }

  // METODO PARA MOSTRAR MENSAJES SEGUN LECTURA DE DATOS
  MostrarMensajeEliminado(consumidos: any, datos_seleccion: any, nota: any) {
    if (consumidos.length === datos_seleccion.length) {
      this.toastr.error('Proceso no permitido.', 'Los usuarios seleccionados ya tienen registro de planificación consumida.', {
        timeOut: 6000,
      });
    } else if (consumidos.length > 0) {
      this.toastr.error(nota + '. \nLos usuarios indicados presentan tienen planificación con estado consumido.', 'No es posible eliminar planificación de: ', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA ABRIR VENTA DE SELECCION ELIMINAR DATOS
  MetodoEliminar(datos_eliminar: any) {
    if (datos_eliminar.length > 0) {
      (document.activeElement as HTMLElement)?.blur();
      this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarPlanComidasMultiple(datos_eliminar);
          }
        });
    }
  }

  // VERIFICAR SI LA PLANIFICACION TIENE DATOS DE EMPLEADOS
  VerificarPlanificacion(id: any, accion: any, editar: any, eliminar: any) {

    const datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };

    this.restC.ObtenerPlanComidaPorIdPlan(id).subscribe(res => {
      this.lista_empleados = true;
      this.validarMensaje2 = false;
      this.planEmpleados = res;
      this.FormatearDatos(this.planEmpleados, this.formato_fecha, this.formato_hora);
      this.ver_eliminar = eliminar;
      this.tipo_accion = accion;
      this.ver_editar = editar;
      this.ver_icono = false;
    }, res => {
      this.restC.EliminarRegistro(id, datos).subscribe(res => {
        this.tipo_accion = accion;
        this.lista_empleados = false;
        this.validarMensaje2 = true;
        this.ver_icono = true;
        this.ver_editar = false;
        this.ver_eliminar = false;
        this.BuscarParametro();
      });
    });
  }


  /** ***************************************************************************************************** **
   ** **               METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE ALIMENTACION                ** **
   ** ***************************************************************************************************** **/

  // METODO DE ENVIO DE CORREO DE PLANIFICACIÓN DE SERVICIO DE ALIMENTACION
  EnviarCorreo(datos: any, cuenta_correo: any, usuario: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {

    // DATOS DE ESTRUCTURA DEL CORREO
    let DataCorreo = {
      tipo_solicitud: 'ELIMINA',
      observacion: datos.observacion,
      id_comida: datos.id_detalle,
      id_envia: this.idEmpleadoLogueado,
      nombres: usuario,
      proceso: 'eliminado',
      asunto: 'ELIMINACION DE PLANIFICACION DE ALIMENTACION',
      correo: cuenta_correo,
      inicio: h_inicio,
      extra: datos.extra,
      desde: desde,
      hasta: hasta,
      final: h_fin,
    }

    console.log('DATOS A ENVIARSE POR CORREO', DataCorreo);
    // METODO ENVIO DE CORREO DE PLANIFICACIÓN DE ALIMENTACION
    this.restC.EnviarCorreoPlan(DataCorreo).subscribe(res => {
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
      console.log(res.message);

    })
  }


  // METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE SERVICIO DE ALIMENTACION
  NotificarPlanificacion(datos: any, desde: any, hasta: any, h_inicio: any, h_fin: any, id_empleado_recibe: number) {
    let mensaje = {
      id_comida: datos.id_detalle,
      id_empl_envia: this.idEmpleadoLogueado,
      id_empl_recive: id_empleado_recibe,
      tipo: 20, // PLANIFICACIÓN DE ALIMENTACION
      mensaje: 'Planificación de alimentación eliminada desde ' +
        desde + ' hasta ' + hasta +
        ' horario de ' + h_inicio + ' a ' + h_fin + ' servicio ',
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }
    this.restC.EnviarMensajePlanComida(mensaje).subscribe(res => {
      this.aviso.RecibirNuevosAvisos(res.respuesta);
    })
  }

  // METODO PARA CONTAR CORREOS A ENVIARSE
  info_correo: string = '';
  LeerCorreos(data: any) {
    console.log('ver data correo.... ', data)
    this.info_correo = '';
    data.forEach((obj: any) => {
      console.log('ver obj correo.... ', obj.alimentacion.correo)
      if (this.info_correo === '') {
        this.info_correo = obj.alimentacion.correo;
      }
      else {
        this.info_correo = this.info_correo + ', ' + obj.alimentacion.correo;
      }
      console.log('ver info correo...', this.info_correo)
    })
  }

  /** ************************************************************************************************* **
 ** **                            PARA LA EXPORTACION DE ARCHIVOS PDF                              ** **
 ** ************************************************************************************************* **/

  // METODO PARA CREAR ARCHIVO PDF
  async GenerarPdf(action = "open") {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
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

  DefinirInformacionPDF() {

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
        let f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
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
          text: "Planificaciones de alimentación",
          bold: true,
          fontSize: 16,
          alignment: "center",
          margin: [0, -10, 0, 10],
        },
        this.PresentarDataPDFAlimentacion(),
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
  PresentarDataPDFAlimentacion() {
    return {
      columns: [
        { width: "*", text: "" },
        {
          width: "auto",
          table: {
            widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto"],
            body: [
              [
                { text: "Código", style: "tableHeader" },
                { text: "Servicio", style: "tableHeader" },
                { text: "Menú", style: "tableHeader" },
                { text: "Fecha inicio", style: "tableHeader" },
                { text: "Fecha Final", style: "tableHeader" },
                { text: "Hora inicio", style: "tableHeader" },
                { text: "Hora Final", style: "tableHeader" },
              ],
              ...this.planificaciones.map((obj) => {
                return [
                  { text: obj.id, style: "itemsTable" },
                  { text: obj.nombre_servicio, style: "itemsTable" },
                  { text: obj.nombre_menu, style: "itemsTable" },
                  { text: obj.fecInicio, style: "itemsTable" },
                  { text: obj.fecFinal, style: "itemsTable" },
                  { text: obj.horaInicio, style: "itemsTable" },
                  { text: obj.horaFin, style: "itemsTable" },
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
    /*
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.planificaciones.map((obj: any) => {
      return {
        Codigo: obj.id,
        Servicio: obj.nombre_servicio,
        Menu: obj.nombre_menu,
        Fecha_Inicio: obj.fecInicio,
        Fecha_Fin: obj.fecFinal,
        Hora_Inicio: obj.horaInicio,
        Hora_Fin: obj.horaFin,
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.planificaciones[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTA ROLES');
    xlsx.writeFile(wb, 'PAlimentacionEXCEL' + new Date().getTime() + '.xlsx');
    */
  }

  /** ************************************************************************************************** **
  ** **                                     METODO PARA EXPORTAR A CSV                               ** **
  ** ************************************************************************************************** **/

  exportToCVS() {
    /*
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.planificaciones.map((obj: any) => {
      return {
        Codigo: obj.id,
        Servicio: obj.nombre_servicio,
        Menu: obj.nombre_menu,
        Fecha_Inicio: obj.fecInicio,
        Fecha_Fin: obj.fecFinal,
        Hora_Inicio: obj.horaInicio,
        Hora_Fin: obj.horaFin,
      }
    }));
    const csvDataC = xlsx.utils.sheet_to_csv(wsr);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, 'PAlimentacionCSV' + new Date().getTime() + '.csv');
    */
  }

  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS XML                           ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto: any;
    var arregloPlanificacion: any = [];
    this.planificaciones.forEach((obj: any) => {
      objeto = {
        "lista_planificaciones": {
          '@id': obj.id,
          "servicio": obj.nombre_servicio,
          "menu": obj.nombre_menu,
          "fecha_inicio": obj.fecInicio,
          "fecha_fin": obj.fecFinal,
          "hora_inicio": obj.horaInicio,
          "hora_fin": obj.horaFin,
        }
      }
      arregloPlanificacion.push(objeto)
    });
    this.restC.CrearXML(arregloPlanificacion).subscribe(res => {
      this.data = res;
      this.urlxml = `${(localStorage.getItem('empresaURL') as string)}/planComidas/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

  //CONTROL BOTONES
  private tienePermiso(accion: string, idFuncion?: number): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) =>
          item.accion === accion && (idFuncion === undefined || item.id_funcion === idFuncion)
        );
      } catch {
        return false;
      }
    } else {
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getEditarPlanificacion(){
    return this.tienePermiso('Editar Planificación Alimentación');
  }

  getEliminarPlanificacion(){
    return this.tienePermiso('Eliminar Planificación Alimentación');
  }

}
