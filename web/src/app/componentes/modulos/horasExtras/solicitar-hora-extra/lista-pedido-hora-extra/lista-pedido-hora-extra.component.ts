import { DateTime, Duration } from 'luxon';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import * as FileSaver from "file-saver";
import * as xlsx from "xlsx";
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { AutorizaDepartamentoService } from 'src/app/servicios/configuracion/localizacion/autorizaDepartamento/autoriza-departamento.service';
import { PlantillaReportesService } from "src/app/componentes/reportes/plantilla-reportes.service";
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { PedHoraExtraService } from 'src/app/servicios/modulos/modulo-horas-extras/horaExtra/ped-hora-extra.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';

import { HoraExtraAutorizacionesComponent } from 'src/app/componentes/autorizaciones/hora-extra-autorizaciones/hora-extra-autorizaciones.component';

export interface HoraExtraElemento {
  apellido: string;
  descripcion: string;
  estado: string;
  fec_final: string;
  fec_inicio: string;
  fec_solicita: string;
  id: number;
  nombre: string;
  num_hora: string;
  id_empl_cargo: number;
  id_contrato: number;
  id_usua_solicita: number;
  depa_nombre?: any;
}

@Component({
  selector: 'app-lista-pedido-hora-extra',
  templateUrl: './lista-pedido-hora-extra.component.html',
  styleUrls: ['./lista-pedido-hora-extra.component.css']
})

export class ListaPedidoHoraExtraComponent implements OnInit {

  horas_extras: any = [];

  selectionUno = new SelectionModel<HoraExtraElemento>(true, []);

  totalHorasExtras;

  idEmpleado: number;
  empleado: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACION INDIVIDUAL
  auto_individual: boolean = true;

  // Habilitar listas según los datos
  lista_autorizacion: boolean = false;

  validarMensaje1: boolean = false;
  validarMensaje2: boolean = false;
  validarMensaje3: boolean = false;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  inicioFor = 0;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // VARIABLES USADAS EN BUSQUEDA DE FILTRO DE DATOS
  Depata: any = new FormControl('');
  Usuario: any = new FormControl('');
  Estado: any = new FormControl('');

  get habilitarHorasE(): boolean { return this.funciones.horasExtras; }

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantilla.color_Secundary; }
  get p_color(): string { return this.plantilla.color_Primary; }
  get logoE(): string { return this.plantilla.logoBase64; }
  get frase(): string { return this.plantilla.marca_Agua; }

  autorizacion: boolean = false;
  preautorizacion: boolean = false;

  constructor(
    private plantilla: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    public restEmpleado: EmpleadoService, // SERVICIO DATOS EMPLEADO
    private restHE: PedHoraExtraService,
    private ventana: MatDialog,
    private validar: ValidacionesService,
    public parametro: ParametrosService,
    private funciones: MainNavService,
    public restAutoriza: AutorizaDepartamentoService,
    public usuarioDepa: UsuarioService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

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

      this.BuscarParametro();
      this.ObtenerEmpleados(this.idEmpleado);
      this.calcularHoraPaginacion();
      this.calcularHoraPaginacionObservacion();
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
  ArrayAutorizacionTipos: any = []
  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.LeerDatos(this.formato_fecha);
      },
      vacio => {
        this.LeerDatos(this.formato_fecha);
      });

    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.idEmpleado).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
      }
    );
  }

  // METODO PARA LEER DATOS
  LeerDatos(fecha: string) {
    this.obtenerHorasExtras(fecha);
    this.obtenerHorasExtrasAutorizadas(fecha);
    this.obtenerHorasExtrasObservacion(fecha);
  }


  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
    this.calcularHoraPaginacion();
  }

  calcularHoraPaginacion() {
    if (this.numero_pagina != 1) {
      this.inicioFor = (this.numero_pagina - 1) * this.tamanio_pagina;
      this.SumatoriaHoras(this.inicioFor, ((this.numero_pagina) * this.tamanio_pagina))
    } else {
      this.inicioFor = 0;
      this.SumatoriaHoras(this.inicioFor, ((this.tamanio_pagina) * this.numero_pagina))
    }
  }

  sumaHoras: any = [];
  sumaHorasfiltro: any = [];
  horasSumadas: any;
  SumatoriaHoras(inicio, fin) {
    var tt = tt = DateTime.fromObject({ hour: 0, minute: 0, second: 0 });;
    var horaT = tt.toFormat('HH:mm:ss');
    this.restHE.ListaAllHoraExtra().subscribe(res => {
      this.sumaHoras = res;

      //Filtra la lista de Horas Extras para descartar las solicitudes del mismo usuario y almacena en una nueva lista
      this.sumaHorasfiltro = this.sumaHoras.filter((o: any) => {
        if (this.idEmpleado !== o.id_usua_solicita) {
          return this.sumaHorasfiltro.push(o);
        }
      })

      /* for (var i = inicio; i < fin; i++) {
         if (i < this.sumaHorasfiltro.length) {
           hora1 = (this.sumaHorasfiltro[i].num_hora).split(":");
           t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
           tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));
 
           // AQUÍ HAGO LA SUMA
           tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
           horaT = (moment(tt).format('HH:mm:ss')).split(':');
           this.horasSumadas = (moment(tt).format('HH:mm:ss'));
         }
         else {
           break;
         }
       }*/

      for (var i = inicio; i < fin; i++) {
        if (i < this.sumaHorasfiltro.length) {
          // DIVIDE LA HORA EN HORAS, MINUTOS Y SEGUNDOS
          const [hour, minute, second] = this.sumaHorasfiltro[i].num_hora.split(":").map(Number);
          // CREA UN DURATION CON LAS PARTES DE LA HORA
          const t1 = Duration.fromObject({ hours: hour, minutes: minute, seconds: second });
          // SUMA EL DURATION A TT
          tt = tt.plus(t1);
          // ACTUALIZA HORAT Y HORASSUMADAS EN EL FORMATO HH:mm:ss
          horaT = tt.toFormat('HH:mm:ss');
          this.horasSumadas = horaT;
        }
        else {
          break;
        }
      }
    }, err => {
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  lista_pedidos: boolean = false;
  lista_pedidosFiltradas: any = [];
  HorasExtraLista: any = [];
  lista_HorasExtras: any = [];
  gerencia: boolean = false;
  obtenerHorasExtras(formato_fecha: string) {
    this.HorasExtraLista = [];
    this.lista_HorasExtras = [];
    var tt = DateTime.fromObject({ hour: 0, minute: 0, second: 0 });;
    var horaT = tt.toFormat('HH:mm:ss');
    this.restHE.ListaAllHoraExtra().subscribe(res => {
      this.horas_extras = res;

      //Filtra la lista de Horas Extras para descartar las solicitudes del mismo usuario y almacena en una nueva lista
      this.lista_pedidosFiltradas = this.horas_extras.filter((o: any) => {
        if (this.idEmpleado !== o.id_usua_solicita) {
          return this.lista_pedidosFiltradas.push(o);
        }
      })

      this.lista_pedidosFiltradas.forEach((data: any) => {

        if (data.estado === 1) {
          data.estado = 'Pendiente';
        }
        else if (data.estado === 2) {
          data.estado = 'Pre-autorizado';
        }

        const [hour, minute, second] = (data.num_hora).split(":").map(Number);
        const t1 = Duration.fromObject({ hours: hour, minutes: minute, seconds: second });

        // HAGO LA SUMA
        tt = tt.plus(t1);
        horaT = tt.toFormat('HH:mm:ss');
        this.totalHorasExtras = horaT;

        data.fec_inicio = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
        data.fec_final = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
      })

      let i = 0;
      this.lista_pedidosFiltradas.filter((item: any) => {
        this.usuarioDepa.ObtenerDepartamentoUsuarios(item.id_contrato).subscribe(
          (usuaDep) => {
            i = i + 1;
            this.ArrayAutorizacionTipos.filter((x: any) => {
              if ((usuaDep[0].id_departamento == x.id_departamento && x.nombre == 'GERENCIA') && (x.estado == true)) {
                this.gerencia = true;
                if (item.estado == 'Pendiente' && (x.autorizar == true || x.preautorizar == true)) {
                  return this.HorasExtraLista.push(item);
                } else if (item.estado == 'Pre-autorizado' && (x.autorizar == true || x.preautorizar == true)) {
                  return this.HorasExtraLista.push(item);
                }
              } else if ((this.gerencia != true) && (usuaDep[0].id_departamento == x.id_departamento && x.estado == true)) {
                if ((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.preautorizar == true) {
                  return this.HorasExtraLista.push(item);
                } else if ((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.autorizar == true) {
                  return this.HorasExtraLista.push(item);
                }
              }
            })

            //Filtra la lista de autorizacion para almacenar en un array
            if (this.lista_pedidosFiltradas.length == i) {
              this.lista_HorasExtras = this.HorasExtraLista;

              console.log('this.lista_HorasExtras: ', this.lista_HorasExtras);

              if (Object.keys(this.lista_HorasExtras).length == 0) {
                this.validarMensaje1 = true;
              }

              if (this.lista_HorasExtras.length != 0) {
                this.lista_pedidos = true;
              }
              else {
                this.lista_pedidos = false;
              }
            }
          });

      });

    }, err => {
      console.log("Horas_Extra ALL ", err.error);
      this.validarMensaje1 = true;
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.lista_HorasExtras.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.lista_HorasExtras.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabel(row?: HoraExtraElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

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

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  /** *********************************************************************************************** **
   ** **                              LISTAS DE HORAS EXTRAS AUTORIZADAS                           ** **
   ** *********************************************************************************************** **/

  solicitudes_observacion: any = [];
  lista_observacion: boolean = false;
  total_horas_observacion: any;
  listaHorasExtrasObservaFiltradas: any = [];
  lista_HorasExtrasObservacion: any = [];
  obtenerHorasExtrasObservacion(formato_fecha: string) {
    this.solicitudes_observacion = [];
    this.listaHorasExtrasObservaFiltradas = [];
    this.lista_HorasExtrasObservacion = [];
    var tt = DateTime.fromObject({ hour: 0, minute: 0, second: 0 });
    var horaT = tt.toFormat('HH:mm:ss');
    this.restHE.ListaAllHoraExtraObservacion().subscribe(res => {
      this.solicitudes_observacion = res;

      //Filtra la lista de Horas Extras Autorizadas para descartar las solicitudes del mismo usuario y almacena en una nueva lista
      this.listaHorasExtrasObservaFiltradas = this.solicitudes_observacion.filter((o: any) => {
        if (this.idEmpleado !== o.id_usua_solicita) {
          return this.listaHorasExtrasObservaFiltradas.push(o);
        }
      });

      this.listaHorasExtrasObservaFiltradas.forEach((data: any) => {

        if (data.estado === 1) {
          data.estado = 'Pendiente';
        }
        else if (data.estado === 2) {
          data.estado = 'Pre-Autorizado';
        }
        else if (data.estado === 3) {
          data.estado = 'Autorizado';
        }
        else if (data.estado === 4) {
          data.estado = 'Negado';
        }

        const [hour, minute, second] = (data.num_hora).split(":").map(Number);
        const t1 = Duration.fromObject({ hours: hour, minutes: minute, seconds: second });
        tt = tt.plus(t1);
        horaT = tt.toFormat('HH:mm:ss');
        this.total_horas_observacion = horaT;

        data.fec_inicio = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
        data.fec_final = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);

      });

      let i = 0;
      this.listaHorasExtrasObservaFiltradas.filter(item => {
        this.usuarioDepa.ObtenerDepartamentoUsuarios(item.id_contrato).subscribe(
          (usuaDep) => {
            i = i + 1;
            this.ArrayAutorizacionTipos.filter(x => {
              if ((usuaDep[0].id_departamento == x.id_departamento && x.nombre == 'GERENCIA') && (x.estado == true)) {
                this.gerencia = true;
                if (item.estado == 'Pendiente' && (x.autorizar == true || x.preautorizar == true)) {
                  return this.lista_HorasExtrasObservacion.push(item);
                } else if (item.estado == 'Pre-autorizado' && (x.autorizar == true || x.preautorizar == true)) {
                  return this.lista_HorasExtrasObservacion.push(item);
                }
              } else if ((this.gerencia != true) && (usuaDep[0].id_departamento == x.id_departamento && x.estado == true)) {
                if ((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.preautorizar == true) {
                  return this.lista_HorasExtrasObservacion.push(item);
                } else if ((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.autorizar == true) {
                  return this.lista_HorasExtrasObservacion.push(item);
                }
              }
            })

            //Filtra la lista de autorizacion para almacenar en un array
            if (this.listaHorasExtrasObservaFiltradas.length == i) {
              this.listaHorasExtrasObservaFiltradas = this.lista_HorasExtrasObservacion;

              if (Object.keys(this.lista_HorasExtras).length == 0) {
                this.validarMensaje1 = true;
              }

              if (this.listaHorasExtrasObservaFiltradas.length != 0) {
                this.lista_observacion = true;
              }
              else {
                this.lista_observacion = false;
              }
            }
          });

      });

      if (Object.keys(this.listaHorasExtrasObservaFiltradas).length == 0) {
        this.validarMensaje2 = true;
      }

    }, err => {
      this.validarMensaje2 = true;
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  tamanio_pagina_observacion: number = 5;
  numero_pagina_observacion: number = 1;
  pageSizeOptions_observacion = [5, 10, 20, 50];
  ManejarPaginaObservacion(e: PageEvent) {
    this.tamanio_pagina_observacion = e.pageSize;
    this.numero_pagina_observacion = e.pageIndex + 1;
    this.calcularHoraPaginacionObservacion();
  }

  iniciaFor = 0;
  calcularHoraPaginacionObservacion() {
    if (this.numero_pagina_observacion != 1) {
      this.iniciaFor = (this.numero_pagina_observacion - 1) * this.tamanio_pagina_observacion;
      this.SumatoriaHorasObservacion(this.iniciaFor, ((this.numero_pagina_observacion) * this.tamanio_pagina_observacion))
    } else {
      this.iniciaFor = 0;
      this.SumatoriaHorasObservacion(this.iniciaFor, ((this.tamanio_pagina_observacion) * this.numero_pagina_observacion))
    }
  }

  sumaHoras_observacion: any = [];
  horasSumadas_observacion: any;
  susmaHoras_observacionFiltada: any = [];
  SumatoriaHorasObservacion(inicio, fin) {
    var tt = DateTime.fromObject({ hour: 0, minute: 0, second: 0 });
    var horaT = tt.toFormat('HH:mm:ss');
    this.restHE.ListaAllHoraExtraObservacion().subscribe(res => {
      this.sumaHoras_observacion = res;

      //Filtra la lista de Horas Extras Autorizadas para descartar las solicitudes del mismo usuario y almacena en una nueva lista
      this.susmaHoras_observacionFiltada = this.sumaHoras_observacion.filter((o: any) => {
        if (this.idEmpleado !== o.id_usua_solicita) {
          return this.susmaHoras_observacionFiltada.push(o);
        }
      });


      for (var i = inicio; i < fin; i++) {
        if (i < this.susmaHoras_observacionFiltada.length) {
          const [hour, minute, second] = (this.susmaHoras_observacionFiltada[i].num_hora).split(":").map(Number);
          const t1 = Duration.fromObject({ hours: hour, minutes: minute, seconds: second });
          tt = tt.plus(t1);
          horaT = tt.toFormat('HH:mm:ss');
          this.horasSumadas_observacion = horaT;
        }
        else {
          break;
        }
      }
    }, err => {
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  selectionUnoObserva = new SelectionModel<HoraExtraElemento>(true, []);
  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedObserva() {
    const numSelected = this.selectionUnoObserva.selected.length;
    const numRows = this.listaHorasExtrasObservaFiltradas.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleObserva() {
    this.isAllSelectedObserva() ?
      this.selectionUnoObserva.clear() :
      this.listaHorasExtrasObservaFiltradas.forEach((row: any) => this.selectionUnoObserva.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelObserva(row?: HoraExtraElemento): string {
    if (!row) {
      return `${this.isAllSelectedObserva() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUnoObserva.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  btnCheckHabilitarObserva: boolean = false;
  observa_individual: boolean = true;
  HabilitarSeleccionObserva() {
    if (this.btnCheckHabilitarObserva === false) {
      this.btnCheckHabilitarObserva = true;
      this.observa_individual = false;
    } else if (this.btnCheckHabilitarObserva === true) {
      this.btnCheckHabilitarObserva = false;
      this.observa_individual = true;
    }
  }

  /** ************************************************************************************* **
   ** **                       LISTAS DE HORAS EXTRAS AUTORIZADAS                        ** **
   ** ************************************************************************************* **/

  pedido_hora_autoriza: any = [];
  total_horas_autorizadas: any;
  listaHorasExtrasAutorizadasFiltradas: any = [];
  obtenerHorasExtrasAutorizadas(formato_fecha: string) {
    let tt = DateTime.fromObject({ hour: 0, minute: 0, second: 0 });
    let horaT = tt.toFormat('HH:mm:ss');
    this.restHE.ListaAllHoraExtraAutorizada().subscribe(res => {
      this.pedido_hora_autoriza = res;

      console.log('this.pedido_hora_autoriza: ', this.pedido_hora_autoriza);

      //Filtra la lista de Horas Extras Autorizadas para descartar las solicitudes del mismo usuario y almacena en una nueva lista
      this.pedido_hora_autoriza.filter((o: any) => {
        if (this.idEmpleado !== o.id_usua_solicita) {
          return this.listaHorasExtrasAutorizadasFiltradas.push(o);
        }
      });

      if (this.listaHorasExtrasAutorizadasFiltradas.length != 0) {
        this.lista_autorizacion = true;
      }
      else {
        this.lista_autorizacion = false;
      }

      this.listaHorasExtrasAutorizadasFiltradas.forEach((data: any) => {

        if (data.estado === 1) {
          data.estado = 'Pendiente';
        }
        else if (data.estado === 2) {
          data.estado = 'Pre-Autorizado';
        }
        else if (data.estado === 3) {
          data.estado = 'Autorizado';
        }
        else if (data.estado === 4) {
          data.estado = 'Negado';
        }

        if (data.estado === 'Autorizado') {
          const [hour, minute, second] = (data.tiempo_autorizado).split(":").map(Number);
          const t1 = Duration.fromObject({ hours: hour, minutes: minute, seconds: second });
          tt = tt.plus(t1);
          horaT = tt.toFormat('HH:mm:ss');
          this.total_horas_autorizadas = horaT;
        }

        data.fec_inicio = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
        data.fec_final = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);

      })

      console.log('this.listaHorasExtrasAutorizadasFiltradas: ', this.listaHorasExtrasAutorizadasFiltradas)

      if (Object.keys(this.listaHorasExtrasAutorizadasFiltradas).length == 0) {
        this.validarMensaje3 = true;
      }

    }, err => {
      this.validarMensaje3 = true;
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  // PAGINACIÓN DE LISTA DE DATOS AUTORIZADOS
  tamanio_pagina_auto: number = 5;
  numero_pagina_auto: number = 1;
  pageSizeOptions_auto = [5, 10, 20, 50];
  ManejarPaginaAutorizadas(e: PageEvent) {
    this.tamanio_pagina_auto = e.pageSize;
    this.numero_pagina_auto = e.pageIndex + 1;
  }

  AutorizarHorasExtrasMultiple(lista: string) {
    var dato: any;
    if (lista === 'pedido') {
      dato = this.selectionUno;
    }
    else if (lista === 'observacion') {
      dato = this.selectionUnoObserva;
    }
    let EmpleadosSeleccionados: any;
    EmpleadosSeleccionados = dato.selected.map((obj: any) => {
      return {
        id: obj.id,
        empleado: obj.nombre + ' ' + obj.apellido,
        num_hora: obj.num_hora,
        id_contrato: obj.id_contrato,
        id_usua_solicita: obj.id_usua_solicita,
        estado: obj.estado,
        id_depa: obj.id_departamento,
        id_cargo: obj.id_empl_cargo
      }
    })
    for (var i = 0; i <= EmpleadosSeleccionados.length - 1; i++) {
      let h = {
        hora: EmpleadosSeleccionados[i].num_hora,
        user_name: this.user_name,
        ip: this.ip,
      }
      this.restHE.AutorizarTiempoHoraExtra(EmpleadosSeleccionados[i].id, h).subscribe(res => {
        console.log(res);
      }, err => {
        return this.validar.RedireccionarHomeAdmin(err.error)
      })
    }
    this.AbrirAutorizaciones(EmpleadosSeleccionados, 'multiple', lista);
  }


  // AUTORIZACIÓN DE HORAS EXTRAS PLANIFICADAS
  AbrirAutorizaciones(datosHoraExtra, forma: string, lista: string) {
    this.ventana.open(HoraExtraAutorizacionesComponent,
      { width: '600px', data: { datosHora: datosHoraExtra, carga: forma } })
      .afterClosed()
      .subscribe(items => {
        this.BuscarParametro();
        if (lista === 'pedido') {
          this.auto_individual = true;
          this.selectionUno.clear();
          this.btnCheckHabilitar = false;
        }
        else if (lista === 'observacion') {
          this.observa_individual = true;
          this.selectionUnoObserva.clear();
          this.btnCheckHabilitarObserva = false;
        }
      }
      );
  }


  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS PDF                              ** **
   ** ************************************************************************************************* **/

  // METODO PARA CREAR ARCHIVO PDF
  generarPdf(action = "open", opcion: string) {
    const documentDefinition = this.DefinirInformacionPDF(opcion);
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

  DefinirInformacionPDF(opcion: string) {
    if (opcion == "Solicitudes de horas extras") {
      sessionStorage.setItem(
        "HorasExtrasSolicitadas",
        this.lista_HorasExtras
      );
    } else if (opcion == "Solicitudes de horas extras con observaciones") {
      sessionStorage.setItem(
        "HorasExtrasSolicitadasConObservaciones",
        this.listaHorasExtrasObservaFiltradas
      );
    } else if (opcion == "Horas extras autorizadas o negadas") {
      sessionStorage.setItem(
        "HorasExtrasAutorizadasNegadas",
        this.listaHorasExtrasAutorizadasFiltradas
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
            widths: ["auto", "auto", "auto", "auto", "auto", "auto"],
            body: [
              [
                { text: "Empleado", style: "tableHeader" },
                { text: "Estado", style: "tableHeader" },
                { text: "Descripción", style: "tableHeader" },
                { text: "Fecha inicio", style: "tableHeader" },
                { text: "Fecha final", style: "tableHeader" },
                { text: "Horas", style: "tableHeader" },
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

  // MEtodo seleccionar que lista de permisos mostrar (solicitados o autorizados)
  mostrarDatosSolicitudes(opcion: string) {
    return (opcion == "Solicitudes de horas extras con observaciones" ? this.lista_pedidosFiltradas : (
      opcion == "Solicitudes de horas extras con observaciones" ? this.listaHorasExtrasObservaFiltradas : this.listaHorasExtrasAutorizadasFiltradas
    )).map((obj) => {
      return [
        { text: obj.nombre + ' ' + obj.apellido, style: "itemsTable" },
        { text: obj.estado, style: "itemsTable" },
        { text: obj.descripcion, style: "itemsTable" },
        { text: obj.fec_inicio, style: "itemsTable" },
        { text: obj.fec_final, style: "itemsTable" },
        { text: obj.num_hora, style: "itemsTable" },
      ];
    });
  }

  /** ************************************************************************************************* **
  ** **                             PARA LA EXPORTACION DE ARCHIVOS EXCEL                           ** **
  ** ************************************************************************************************* **/

  exportToExcel(opcion: string) {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet((opcion == "Solicitudes de horas extras con observaciones" ? this.lista_pedidosFiltradas : (
      opcion == "Solicitudes de horas extras con observaciones" ? this.listaHorasExtrasObservaFiltradas : this.listaHorasExtrasAutorizadasFiltradas
    )).map((obj: any) => {
      return {
        Nombre: obj.nombre + ' ' + obj.apellido,
        Estado: obj.estado,
        Descripcion: obj.descripcion,
        Fecha_inicio: obj.fec_inicio,
        Fecha_final: obj.fec_final,
        Horas: obj.num_hora,
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(opcion == "Solicitudes de horas extras con observaciones" ? this.lista_pedidosFiltradas[0] : (
      opcion == "Solicitudes de horas extras con observaciones" ? this.listaHorasExtrasObservaFiltradas[0] : this.listaHorasExtrasAutorizadasFiltradas[0]
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
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet((opcion == "Solicitudes de horas extras con observaciones" ? this.lista_pedidosFiltradas : (
      opcion == "Solicitudes de horas extras con observaciones" ? this.listaHorasExtrasObservaFiltradas : this.listaHorasExtrasAutorizadasFiltradas
    )).map((obj: any) => {
      return {
        Nombre: obj.nombre + ' ' + obj.apellido,
        Estado: obj.estado,
        Descripcion: obj.descripcion,
        Fecha_inicio: obj.fec_inicio,
        Fecha_final: obj.fec_final,
        Horas: obj.num_hora,
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
    (opcion == "Solicitudes de horas extras con observaciones" ? this.lista_pedidosFiltradas : (
      opcion == "Solicitudes de horas extras con observaciones" ? this.listaHorasExtrasObservaFiltradas : this.listaHorasExtrasAutorizadasFiltradas
    )).forEach((obj: any) => {
      objeto = {
        "lista_solicitudes_horas_extras": {
          '@id': obj.id,
          "nombre": obj.nombre + ' ' + obj.apellido,
          "estado": obj.estado,
          "descripcion": obj.descripcion,
          "fecha_inicial": obj.fec_inicio,
          "fecha_final": obj.fec_final,
          "horas": obj.num_hora,
        }
      }
      arregloSolicitudes.push(objeto)
    });
    this.restHE.CrearXML(arregloSolicitudes).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/horas-extras-pedidas/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

}
