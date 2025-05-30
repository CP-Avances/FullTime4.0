// SECCION DE LIBRERIAS
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { ListarParametroComponent } from '../../listar-parametro/listar-parametro.component';
import { CrearDetalleParametroComponent } from '../crear-detalle-parametro/crear-detalle-parametro.component';
import { EditarDetalleParametroComponent } from '../editar-detalle-parametro/editar-detalle-parametro.component';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-ver-parametro',
  standalone: false,
  templateUrl: './ver-parametro.component.html',
  styleUrls: ['./ver-parametro.component.css']
})

export class VerParametroComponent implements OnInit {
  ips_locales: any = '';

  formato12: string = 'rgb(80, 87, 97)';
  formato24: string = 'rgb(80, 87, 97)';
  formatoA: string = 'rgb(80, 87, 97)';
  formatoI: string = 'rgb(80, 87, 97)';
  formatoE: string = 'rgb(80, 87, 97)';
  // DIAS DE LA SEMANA
  lunes: string = 'rgb(80, 87, 97)';
  martes: string = 'rgb(80, 87, 97)';
  miercoles: string = 'rgb(80, 87, 97)';
  jueves: string = 'rgb(80, 87, 97)';
  viernes: string = 'rgb(80, 87, 97)';
  sabado: string = 'rgb(80, 87, 97)';
  domingo: string = 'rgb(80, 87, 97)';

  @Input() idParametro: string;

  parametros: any = [];
  datosDetalle: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // ACTIVADORES
  ver_editar: boolean = true;
  ver_detalles: boolean = true;
  boton_registrar: boolean = true;

  // TEXTO DE PARAMETRO
  nota_parametro: string = '';

  // PARAMETRO FECHA
  formato_fecha: boolean = false;
  // PARAMETRO HORA
  formato_hora: boolean = false;
  // PARAMETRO ATRASOS
  tolerancia_atrasos: boolean = false;
  // PARAMETRO UBICACION
  ubicacion: boolean = false;
  // PARAMETRO CARGAR VACACIONES
  carga: boolean = false;
  // PARAMETRO DESCARGAR KARDEX
  kardex: boolean = false;
  // PARAMETRO FORMATO LABORAL - CALENDARIO
  laboral_calendario: boolean = false;
  // PARAMETRO SELECCIONAR DIA
  seleccionar_dia: boolean = false;
  // IDENTIFICADOR DE HORAS
  horas: boolean = false;

  ingreso: number = 0;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private toastr: ToastrService,
    public ventana: MatDialog,
    public parametro: ParametrosService,
    public componentel: ListarParametroComponent,
    public validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.BuscarParametros(this.idParametro);
    this.ListarDetalles(this.idParametro);
    this.ActivarBoton();
  }

  // METODO PARA ACTIVAR BOTONES SEGUN PARAMETRO
  ActivarBoton() {

    this.ver_editar = false;
    this.ver_detalles = false;

    // FORMATO FECHA
    if (this.idParametro === '1') {
      this.formato_fecha = true;
      this.nota_parametro =
        `
        NOTA: Seleccionar el tipo de formato de fecha con el cual se va a trabajar en el 
        sistema.
        `
        ;
    }
    // FORMATO HORA
    if (this.idParametro === '2') {
      this.formato_hora = true;
      this.nota_parametro =
        `
        NOTA: Seleccionar el tipo de formato de hora con el cual se va a trabajar en el
        sistema.
        `
        ;
    }
    // TOLERANCIA ATRASOS
    if (this.idParametro === '3') {
      this.tolerancia_atrasos = true;
      this.nota_parametro =
        `
        NOTA: Configuración de uso de minutos de tolerancia para cálculo de atrasos.
        `
        ;
    }
    // TOLERANCIA UBICACION
    if (this.idParametro === '4') {
      this.ubicacion = true;
      this.nota_parametro =
        `
        NOTA: El usuario podrá realizar su marcación o timbre dentro del perímetro definido.
        `
        ;
    }
    // CONSIDERAR SEGUNDOS MARCACIONES
    if (this.idParametro === '5') {
      this.nota_parametro =
        `
        NOTA: De los timbres realizados por los usuarios considerar o no los segundos para realizar
        cálculos referentes a la asistencia.
        `
        ;
    }
    // DISPOSITIVOS MOVILES
    if (this.idParametro === '6') {
      this.nota_parametro =
        `
        NOTA: Definir el número de dispositivos que pueden usar los usuarios para registrar sus timbres
        en la aplicación móvil.
        `
        ;
    }
    // FORMATO CERTIFICADOS SSL
    if (this.idParametro === '7') {
      this.nota_parametro =
        `
        NOTA: Revisar el uso de certificados de seguridad(SSL) en el sistema (GEOLOCALIZACIÓN).
        `
        ;
    }
    // ENVIAR MENSAJE DE CUMPLEAÑOS
    if (this.idParametro === '8') {
      this.nota_parametro =
        `
        NOTA: Enviar mensajes de felicitaciones de cumpleaños de los colaboradores.
        `
        ;
    }
    // HORA DE ENVIO DE MENSAJE DE CUMPLEAÑOS
    if (this.idParametro === '9') {
      this.horas = true;
      this.nota_parametro =
        `
        NOTA: Hora en la que se va a enviar el mensaje de cumpleaños a los colaboradores. Por ejemplo: 23:30.
        `
        ;
    }
    // ENVIAR REPORTE DE ATRASOS DIARIO
    if (this.idParametro === '10') {
      this.nota_parametro =
        `
        NOTA: Enviar notificaciones diarias con el reporte de atrasos de los colaboradores.
        `
        ;
    }
    // HORA DE ENVIO DE REPORTE DE ATRASOS DIARIO
    if (this.idParametro === '11') {
      this.horas = true;
      this.nota_parametro =
        `
        NOTA: Hora en la que se va a enviar la notificación diaria con el reporte de atrasos de los 
        colaboradores. Por ejemplo: 23:30.
        `
        ;
    }
    // CORREO DE ENVIO DE REPORTE DE ATRASOS DIARIO
    if (this.idParametro === '12') {
      this.nota_parametro =
        `
        NOTA: Registrar dirección de correo al que se enviará la notificación diaria con el reporte de atrasos 
        general de los colaboradores.
        `
        ;
    }
    // ENVIAR REPORTE DE ATRASOS SEMANAL
    if (this.idParametro === '13') {
      this.nota_parametro =
        `
        NOTA: Enviar notificaciones semanales con el reporte de atrasos de los colaboradores.
        `
        ;
    }
    // HORA DE ENVIO DE REPORTE DE ATRASOS SEMANAL
    if (this.idParametro === '14') {
      this.horas = true;
      this.nota_parametro =
        `
        NOTA: Hora en la que se va a enviar la notificación semanal con el reporte de atrasos de los 
        colaboradores. Por ejemplo: 23:30.
        `
        ;
    }
    // DIA DE ENVIO DE REPORTE DE ATRASOS SEMANAL
    if (this.idParametro === '15') {
      this.seleccionar_dia = true;
      this.nota_parametro =
        `
        NOTA: Seleccionar día en el que se enviará la notificación semanal con el reporte de atrasos 
        general de los colaboradores.
        `
        ;
    }
    // CORREO DE ENVIO DE REPORTE DE ATRASOS SEMANAL
    if (this.idParametro === '16') {
      this.nota_parametro =
        `
        NOTA: Registrar dirección de correo al que se enviará la notificación semanal con el reporte de atrasos 
        general de los colaboradores.
        `
        ;
    }
    // ENVIAR REPORTE DE FALTAS DIARIO
    if (this.idParametro === '17') {
      this.nota_parametro =
        `
        NOTA: Enviar notificaciones diarias con el reporte de faltas de los colaboradores.
        `
        ;
    }
    // HORA DE ENVIO DE REPORTE DE FALTAS DIARIO
    if (this.idParametro === '18') {
      this.horas = true;
      this.nota_parametro =
        `
        NOTA: Hora en la que se va a enviar la notificación diaria con el reporte de faltas de los 
        colaboradores. Por ejemplo: 23.
        `
        ;
    }
    // CORREO DE ENVIO DE REPORTE DE FALTAS DIARIO
    if (this.idParametro === '19') {
      this.nota_parametro =
        `
        NOTA: Registrar dirección de correo al que se enviará la notificación diaria con el reporte de faltas 
        general de los colaboradores.
        `
        ;
    }
    // ENVIAR REPORTE DE FALTAS SEMANAL
    if (this.idParametro === '20') {
      this.nota_parametro =
        `
        NOTA: Enviar notificaciones semanales con el reporte de faltas de los colaboradores.
        `
        ;
    }
    // HORA DE ENVIO DE REPORTE DE FALTAS SEMANAL
    if (this.idParametro === '21') {
      this.horas = true;
      this.nota_parametro =
        `
        NOTA: Hora en la que se va a enviar la notificación semanal con el reporte de faltas de los 
        colaboradores. Por ejemplo: 23.
        `
        ;
    }
    // DIA DE ENVIO DE REPORTE DE FALTAS SEMANAL
    if (this.idParametro === '22') {
      this.seleccionar_dia = true;
      this.nota_parametro =
        `
        NOTA: Seleccionar día en el que se va a enviar la notificación semanal con el reporte de faltas de los 
        colaboradores.
        `
        ;
    }
    // CORREO DE ENVIO DE REPORTE DE FALTAS SEMANAL
    if (this.idParametro === '23') {
      this.nota_parametro =
        `
        NOTA: Registrar dirección de correo al que se enviará la notificación semanal con el reporte de faltas 
        general de los colaboradores.
        `
        ;
    }
    // ENVIAR REPORTE DE FALTAS SEMANAL
    if (this.idParametro === '24') {
      this.nota_parametro =
        `
        NOTA: Enviar mensaje de correo a los colobaradores por su aniversario.
        `
        ;
    }
    // HORA DE ENVIO DE MENSAJE DE CUMPLEAÑOS
    if (this.idParametro === '25') {
      this.horas = true;
      this.nota_parametro =
        `
        NOTA: Hora en la que se va a enviar el mensaje de aniversario a los colaboradores. Por ejemplo: 23:30.
        `
        ;
    }

    // ENVIAR REPORTE DE SALIDAS ANTICIPADAS DIARIO
    if (this.idParametro === '26') {
      this.nota_parametro =
        `
        NOTA: Enviar notificaciones diarias con el reporte de salidas anticipadas de los colaboradores.
        `
        ;
    }
    // HORA DE ENVIO DE REPORTE DE SALIDAS ANTICIPADAS DIARIO
    if (this.idParametro === '27') {
      this.horas = true;
      this.nota_parametro =
        `
        NOTA: Hora en la que se va a enviar la notificación diaria con el reporte de salidas anticipadas de los 
        colaboradores. Por ejemplo: 23:30.
        `
        ;
    }
    // CORREO DE ENVIO DE REPORTE DE SALIDAS ANTICIPADAS DIARIO
    if (this.idParametro === '28') {
      this.nota_parametro =
        `
        NOTA: Registrar dirección de correo al que se enviará la notificación diaria con el reporte de faltas 
        general de los colaboradores.
        `
        ;
    }
    // ENVIAR REPORTE DE SALIDAS ANTICIPADAS SEMANAL
    if (this.idParametro === '29') {
      this.nota_parametro =
        `
        NOTA: Enviar notificaciones semanales con el reporte de salidas anticipadas de los colaboradores.
        `
        ;
    }
    // HORA DE ENVIO DE REPORTE DE SALIDAS ANTICIPADAS SEMANAL
    if (this.idParametro === '30') {
      this.horas = true;
      this.nota_parametro =
        `
        NOTA: Hora en la que se va a enviar la notificación semanal con el reporte de salidas anticipadas de los 
        colaboradores. Por ejemplo: 23:30.
        `
        ;
    }
    // DIA DE ENVIO DE REPORTE DE SALIDAS ANTICIPADAS SEMANAL
    if (this.idParametro === '31') {
      this.seleccionar_dia = true;
      this.nota_parametro =
        `
        NOTA: Seleccionar día en el que se va a enviar la notificación semanal con el reporte de salidas anticipadas de los 
        colaboradores.
        `
        ;
    }
    // CORREO DE ENVIO DE REPORTE DE SALIDAS ANTICIPADAS SEMANAL
    if (this.idParametro === '32') {
      this.nota_parametro =
        `
        NOTA: Registrar dirección de correo al que se enviará la notificación semanal con el reporte de salidas anticipadas 
        general de los colaboradores.
        `
        ;
    }
    // HORA DE ENVIO DE NOTIFICACIONES DE FALTAS INDIVIDUALES
    if (this.idParametro === '33') {
      this.horas = true;
      this.nota_parametro =
        `
        NOTA: Hora en la que se va a enviar las notificaciones de faltas a cada colaborador. Por ejemplo: 23:30.
        `
        ;
    }
    // HORA DE ENVIO DE NOTIFICACIONES DE ATRASOS INDIVIDUALES
    if (this.idParametro === '34') {
      this.horas = true;
      this.nota_parametro =
        `
        NOTA: Hora en la que se va a enviar las notificaciones de atrasos a cada colaborador. Por ejemplo: 23:30.
        `
        ;
    }
    // HORA DE ENVIO DE NOTIFICACIONES DE SALIDAS ANTICIPADAS INDIVIDUALES
    if (this.idParametro === '35') {
      this.horas = true;
      this.nota_parametro =
        `
        NOTA: Hora en la que se va a enviar las notificaciones de salidas anticipadas a cada colaborador. Por ejemplo: 23:30.
        `
        ;
    }
    // VALIDAR CEDULA ECUATORIANA
    if (this.idParametro === '36') {
      this.nota_parametro =
        `
        NOTA: Verificar que la cédula ecuatoriana exista y sea válida.
        `
        ;
    }
    // TIPO CARGA VACACIONES
    if (this.idParametro === '97') {
      this.carga = true;
      this.nota_parametro =
        `
        NOTA: Seleccionar el tipo de carga de días de vacaciones.
        `
        ;
    }
    // DESCARGAR KARDEX
    if (this.idParametro === '98') {
      this.kardex = true;
      this.nota_parametro =
        `
        NOTA: Seleccionar el tipo de descarga de Kardex de vacaciones.
        `
        ;
    }
    // FORMATO LABORAL CALENDARIO
    if (this.idParametro === '99') {
      this.laboral_calendario = true;
      this.nota_parametro =
        `
        NOTA: Seleccionar tipo de formato laboral o calendario para visualización de datos.
        `
        ;
    }
    // PARAMETRO DE HERRAMIENTA DE ANALISIS DE DATOS
    if (this.idParametro === '100') {
      this.nota_parametro =
        `
        NOTA: Registrar la URL de la herramienta de análisis de datos.
        `
        ;
    }
    // PARAMETROS PARA INGRESAR DETALLE
    if (this.idParametro === '4'    // ----> TOLERANCIA UBICACION
      || this.idParametro === '6'   // ----> DISPOSITIVOS MOVILES 
      || this.idParametro === '9'   // ----> HORA ENVIO CUMPLEAÑOS
      || this.idParametro === '11'  // ----> HORA ENVIO REPORTE ATRASOS DIARIO
      || this.idParametro === '12'  // ----> CORREO REPORTE ATRASOS DIARIO
      || this.idParametro === '14'  // ----> HORA ENVIO REPORTE ATRASOS SEMANAL
      || this.idParametro === '16'  // ----> CORREO REPORTE ATRASOS SEMANAL
      || this.idParametro === '18'  // ----> HORA ENVIO REPORTE FALTAS DIARIO
      || this.idParametro === '19'  // ----> CORREO REPORTE FALTAS DIARIO
      || this.idParametro === '21'  // ----> HORA ENVIO REPORTE FALTAS SEMANAL
      || this.idParametro === '23'  // ----> CORREO REPORTE FALTAS SEMANAL
      || this.idParametro === '25'  // ----> HORA ENVIO ANIVERSARIO
      || this.idParametro === '27'  // ----> HORA ENVIO REPORTE SALIDAS ANTICIPADAS DIARIO
      || this.idParametro === '28'  // ----> CORREO REPORTE SALIDAS ANTICIPADAS DIARIO
      || this.idParametro === '30'  // ----> HORA ENVIO REPORTE SALIDAS ANTICIPADAS SEMANAL
      || this.idParametro === '32'  // ----> CORREO REPORTE SALIDAS ANTICIPADAS SEMANAL
      || this.idParametro === '33'  // ----> HORA ENVIO NOTIFICACION FALTAS INDIVIDUAL
      || this.idParametro === '34'  // ----> HORA ENVIO NOTIFICACION ATRASOS INDIVIDUAL
      || this.idParametro === '35'  // ----> HORA ENVIO NOTIFICACION SALIDAS ANTICIPADAS INDIVIDUAL
      || this.idParametro === '100' // ----> URL HERRAMIENTA DE ANALISIS
    ) {
      this.ver_editar = true;
      this.ver_detalles = true;
    }
    // PARAMETROS CON FORMULARIO DE SELECION
    if (this.idParametro === '5'   // ----> ACTIVAR SEGUNDOS EN MARCACIONES
      || this.idParametro === '7'  // ----> ACTIVAR CERTIFICADOS DE SEGURIDAD
      || this.idParametro === '8'  // ----> ACTIVAR MENSAJE DE CUMPLEAÑOS
      || this.idParametro === '10' // ----> ACTIVAR REPORTE DE ATRASOS DIARIO
      || this.idParametro === '13' // ----> ACTIVAR REPORTE DE ATRASOS SEMANAL
      || this.idParametro === '17' // ----> ACTIVAR REPORTE DE FALTAS DIARIO
      || this.idParametro === '20' // ----> ACTIVAR REPORTE DE FALTAS SEMANAL
      || this.idParametro === '24' // ----> ACTIVAR MENSAJE DE ANIVERSARIO
      || this.idParametro === '26' // ----> ACTIVAR REPORTE DE SALIDAS ANTICIPADAS DIARIO
      || this.idParametro === '29' // ----> ACTIVAR REPORTE DE SALIDAS ANTICIPADAS SEMANAL
      || this.idParametro === '36' // ----> ACTIVAR VALIDACION CEDULA ECUATORIANA
    ) {
      this.ver_formulario = true;
    }

  }

  // METODO PARA MANEJAR PAGINACION DE TABLAS
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1
    this.tamanio_pagina = e.pageSize;
  }

  // METODO PARA BUSCAR DATOS TIPO PARAMETRO
  BuscarParametros(id: any) {
    this.parametros = [];
    this.parametro.ListarUnParametro(id).subscribe(data => {
      this.parametros = data;
    })
  }

  id_detalle: number;
  // METODO PARA BUSCAR DETALLES DE PARAMETRO GENERAL
  ListarDetalles(id: any) {
    this.boton_registrar = true;
    this.datosDetalle = [];
    this.parametro.ListarDetalleParametros(id).subscribe(datos => {
      this.datosDetalle = datos;
      // SELECCION DE OPCIONES
      if (this.ingreso === 0) {
        this.seleccion = this.datosDetalle[0].descripcion;
        this.opcion_kardex = this.datosDetalle[0].descripcion;
        this.opcion_laboral = this.datosDetalle[0].descripcion;
      }
      if (this.datosDetalle[0].descripcion === 'hh:mm:ss a') {
        this.formato12 = '#4194F0';
        this.formato24 = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'HH:mm:ss') {
        this.formato24 = '#4194F0';
        this.formato12 = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'dd/MM/yyyy') {
        this.formatoA = '#4194F0';
        this.formatoI = 'rgb(80, 87, 97)';
        this.formatoE = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'MM/dd/yyyy') {
        this.formatoI = '#4194F0';
        this.formatoA = 'rgb(80, 87, 97)';
        this.formatoE = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'yyyy-MM-dd') {
        this.formatoE = '#4194F0';
        this.formatoI = 'rgb(80, 87, 97)';
        this.formatoA = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'Lunes') {
        this.CambiarColores();
        this.lunes = '#4194F0';
      }
      if (this.datosDetalle[0].descripcion === 'Martes') {
        this.CambiarColores();
        this.martes = '#4194F0';
      }
      if (this.datosDetalle[0].descripcion === 'Miércoles') {
        this.CambiarColores();
        this.miercoles = '#4194F0';
      }
      if (this.datosDetalle[0].descripcion === 'Jueves') {
        this.CambiarColores();
        this.jueves = '#4194F0';
      }
      if (this.datosDetalle[0].descripcion === 'Viernes') {
        this.CambiarColores();
        this.viernes = '#4194F0';
      }
      if (this.datosDetalle[0].descripcion === 'Sábado') {
        this.CambiarColores();
        this.sabado = '#4194F0';
      }
      if (this.datosDetalle[0].descripcion === 'Domingo') {
        this.CambiarColores();
        this.domingo = '#4194F0';
      }

      // ----> OPCIONES TOLERANCIA ATRASOS
      if (this.idParametro === '3') {
        this.VerConfiguracionAtrasos();
      }

      // PARAMETROS QUE EXISTEN Y NO NECESITAN REGISTRO ADICIONAL
      if (this.idParametro === '4'    // ----> TOLERANCIA UBICACION
        || this.idParametro === '6'   // ----> DISPOSITIVOS MOVILES 
        || this.idParametro === '9'   // ----> HORA ENVIO CUMPLEAÑOS
        || this.idParametro === '11'  // ----> HORA ENVIO REPORTE ATRASOS DIARIO
        || this.idParametro === '14'  // ----> HORA ENVIO REPORTE ATRASOS SEMANAL
        || this.idParametro === '18'  // ----> HORA ENVIO REPORTE FALTAS DIARIO
        || this.idParametro === '21'  // ----> HORA ENVIO REPORTE FALTAS SEMANAL
        || this.idParametro === '25'  // ----> HORA ENVIO ANIVERSARIO
        || this.idParametro === '27'  // ----> HORA ENVIO REPORTE SALIDAS ANTICIPADAS DIARIO
        || this.idParametro === '30'  // ----> HORA ENVIO REPORTE SALIDAS ANTICIPADAS SEMANAL
        || this.idParametro === '33'  // ----> HORA ENVIO NOTIFICACION FALTAS INDIVIDUAL
        || this.idParametro === '34'  // ----> HORA ENVIO NOTIFICACION ATRASOS INDIVIDUAL
        || this.idParametro === '35'  // ----> HORA ENVIO NOTIFICACION SALIDAS ANTICIPADAS INDIVIDUAL
        || this.idParametro === '100' // ----> URL HERRAMIENTA DE ANALISIS
      ) {
        this.boton_registrar = false;
      }

      // PARAMETROS CON SELECCION DE OPCIONES
      if (this.idParametro === '5'   // ----> ACTIVAR SEGUNDOS EN MARCACIONES
        || this.idParametro === '7'  // ----> ACTIVAR CERTIFICADOS DE SEGURIDAD
        || this.idParametro === '8'  // ----> ACTIVAR MENSAJE DE CUMPLEAÑOS
        || this.idParametro === '10' // ----> ACTIVAR REPORTE DE ATRASOS DIARIO
        || this.idParametro === '13' // ----> ACTIVAR REPORTE DE ATRASOS SEMANAL
        || this.idParametro === '17' // ----> ACTIVAR REPORTE DE FALTAS DIARIO
        || this.idParametro === '20' // ----> ACTIVAR REPORTE DE FALTAS SEMANAL
        || this.idParametro === '24' // ----> ACTIVAR MENSAJE DE ANIVERSARIO
        || this.idParametro === '26' // ----> ACTIVAR REPORTE DE SALIDAS ANTICIPADAS DIARIO
        || this.idParametro === '29' // ----> ACTIVAR REPORTE DE SALIDAS ANTICIPADAS SEMANAL
        || this.idParametro === '36' // ----> ACTIVAR VALIDAR CEDULA ECUATORIANA
      ) {
        this.VerConfiguracionRegistro();
      }

    }, vacio => {
      if (this.idParametro === '3') {
        this.ver_actualizar_atraso = false;
        this.ver_eliminar_atraso = false;
        this.ver_guardar_atraso = true;
        this.ver_atraso = false;
        this.ver_con_tolerancia = false;
        this.ver_con_tolerancia_2 = false;
        this.ver_sin_tolerancia = false;
        this.ver_registrar_atraso = true;
      }
    })
  }

  // METODO PARA INGRESAR DETALLE DE PARAMETRO
  AbrirVentanaDetalles(datos: any): void {
    this.ventana.open(CrearDetalleParametroComponent,
      { width: '400px', data: { parametros: datos, actualizar: true } })
      .afterClosed().subscribe(item => {
        this.BuscarParametros(this.idParametro);
        this.ListarDetalles(this.idParametro);
      });
  }

  // METODO PARA EDITAR DETALLE DE PARAMETRO
  AbrirVentanaEditarDetalle(datos: any): void {
    this.ventana.open(EditarDetalleParametroComponent,
      { width: '400px', data: { parametros: datos } }).
      afterClosed().subscribe(item => {
        this.BuscarParametros(this.idParametro);
        this.ListarDetalles(this.idParametro);
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  EliminarDetalle(id_detalle: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.parametro.EliminarDetalleParametro(id_detalle, datos).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.LimpiarSeleccion();
      this.BuscarParametros(this.idParametro);
      this.ListarDetalles(this.idParametro);
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos.id_detalle);
        }
      });
  }

  // METODO PARA VER LISTA PARAMETROS
  VerListaParametro() {
    this.componentel.ver_lista = true;
    this.componentel.ver_detalle = false;
    this.componentel.ObtenerParametros();
  }

  /** ******************************************************************************************* **
   ** **                   ALMACENAMIENTO DE PARAMETROS EN BASE DE DATOS                       ** **
   ** ******************************************************************************************* **/

  // METODO PARA REGISTRAR DETALLES
  RegistrarValores(detalle: any, observacion: any) {
    this.ingreso = 1;
    this.parametro.ListarDetalleParametros(parseInt(this.idParametro)).subscribe(datos => {
      this.ActualizarDetalle(datos[0].id_detalle, detalle, observacion);
    }, vacio => {
      this.CrearDetalle(detalle, observacion);
    })
  }

  // METODO PARA REGISTRAR NUEVO PARÁMETRO
  CrearDetalle(detalle: any, observacion: any) {
    let datos = {
      id_tipo: this.idParametro,
      descripcion: detalle,
      observacion: observacion,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    this.parametro.IngresarDetalleParametro(datos).subscribe(response => {
      this.toastr.success('Detalle registrado exitosamente.',
        '', {
        timeOut: 2000,
      })
      this.LeerDatos();
    });
  }

  // METODO PARA ACTUALIZAR DETALLE DEL PARAMETRO
  ActualizarDetalle(id_detalle: number, detalle: any, observacion: any) {
    let datos = {
      id: id_detalle,
      descripcion: detalle,
      observacion: observacion,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    this.parametro.ActualizarDetalleParametro(datos).subscribe(response => {
      this.toastr.success('Detalle registrado exitosamente.',
        '', {
        timeOut: 2000,
      })
      this.LeerDatos();
    });
  }

  // MOSTRAR DATOS DE PARAMETROS Y DETALLES
  LeerDatos() {
    this.BuscarParametros(this.idParametro);
    this.ListarDetalles(this.idParametro);
  }

  /** ******************************************************************************************* **
   ** **                            FORMULARIO GENERAL DE DATOS                                ** **
   ** ******************************************************************************************* **/

  // ACTIVAR VISTA FORMULARIO
  ver_formulario: boolean = false;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    descripcionForm: this.descripcionF,
  });

  // METODO PARA SELECCIONAR EVENTO
  SelecionarEvento(event: MatRadioChange, observacion: any) {
    var seleccion = event.value;
    this.RegistrarValores(seleccion, observacion);
  }

  // METODO PARA REGISTRAR DETALLE DE ATRASOS
  ActualizarRegistro(detalle: any, observacion: any) {
    this.ActualizarDetalle(this.datosDetalle[0].id_detalle, detalle, observacion);
  }

  // METODO PARA LEER EL REGISTRO
  VerConfiguracionRegistro() {
    if (this.datosDetalle[0].descripcion != '' && this.datosDetalle[0].descripcion != null) {
      this.descripcionF.setValue(this.datosDetalle[0].descripcion);
    }
  }

  /** ******************************************************************************************* **
   ** **        REGISTRAR O EDITAR DETALLE DE PARAMETRO FORMATO DE FECHA Y HORA                ** **
   ** ******************************************************************************************* **/

  GuardarDatos(seleccion: number, dia: string) {
    let formato = '';
    let observacion = '';
    if (seleccion === 1) {
      formato = 'dd/MM/yyyy';
      observacion = 'Formato americano';
    }
    else if (seleccion === 2) {
      formato = 'MM/dd/yyyy';
      observacion = 'Formato ingles';
    }
    else if (seleccion === 3) {
      formato = 'yyyy-MM-dd';
      observacion = 'Formato estándar';
    }
    else if (seleccion === 4) {
      formato = 'hh:mm:ss a';
      observacion = 'Formato de 12 horas';
    }
    else if (seleccion === 5) {
      formato = 'HH:mm:ss';
      observacion = 'Formato de 24 horas';
    }
    else if (seleccion === 6) {
      formato = dia;
    }

    this.RegistrarValores(formato, observacion);
  }

  /** ******************************************************************************************* **
   ** **                        REGISTRO DE CONFIGURACION DE ATRASOS                           ** **
   ** ******************************************************************************************* **/

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  toleranciaF = new FormControl('');
  tipoF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formularioT = new FormGroup({
    tipoForm: this.tipoF,
    toleranciaForm: this.toleranciaF,
  });

  // VARIABLES DE CONTROL DE VISTA DE BOTONES
  ver_con_tolerancia: boolean = false;
  ver_con_tolerancia_2: boolean = false;
  ver_sin_tolerancia: boolean = false;
  ver_atraso: boolean = false;
  ver_registrar_atraso: boolean = true;
  ver_guardar_atraso: boolean = true;
  ver_eliminar_atraso: boolean = false;
  ver_actualizar_atraso: boolean = false;

  // METODO PARA SELECCION 
  SeleccionarOpcion(event: MatRadioChange) {
    var opcion = event.value;
    this.ver_atraso = true;
    // OPCION DOS (2) CONSIDERAR TOLERANCIA
    if (opcion === '2') {
      this.ver_con_tolerancia = true;
      this.ver_sin_tolerancia = false;
      this.ver_registrar_atraso = true;
    }
    // OPCION UNO (1) SIN CONSIDERAR TOLERANCIA
    else {
      this.observacion_atraso = 'No se considera minutos de tolerancia.';
      this.tipoF.reset();
      this.ver_con_tolerancia = false;
      this.ver_con_tolerancia_2 = false;
      this.ver_sin_tolerancia = true;
      this.ver_registrar_atraso = false;
    }
  }

  // METODO PARA SELECCION TIPO ATRASO
  observacion_atraso: any = '';
  SeleccionarTipo(event: MatRadioChange) {
    var opcion = event.value;
    this.ver_registrar_atraso = false;
    // OPCION (2-1) CONSIDERANDO MINUTOS DE TOLERANCIA - ATRASO CALCULADO CON HORARIO
    if (opcion === '2-1') {
      this.ver_sin_tolerancia = true;
      this.ver_con_tolerancia_2 = false;
      this.observacion_atraso = 'Considerar minutos de tolerancia. Si el usuario llegará más tarde de los minutos de tolerancia configurados, se contabilizará todos los minutos de atraso a partir de su horario de entrada.';
    }
    // OPCION (2-2) CONSIDERANDO MINUTOS DE TOLERANCIA - ATRASO CALCULADO CON TOLERANCIA
    else {
      this.ver_con_tolerancia_2 = true;
      this.ver_sin_tolerancia = false;
      this.observacion_atraso = 'Considerar minutos de tolerancia. Si el usuario llegará más tarde de los minutos de tolerancia configurados, se contabilizará los minutos de atraso a partir de los minutos de tolerancia.';
    }
  }

  // METODO PARA REGISTRAR DETALLE DE ATRASOS
  RegistrarAtraso() {
    if (this.tipoF.value) {
      this.CrearDetalle(this.tipoF.value, this.observacion_atraso)
    }
    else {
      this.CrearDetalle(this.toleranciaF.value, this.observacion_atraso)
    }
  }

  // METODO PARA REGISTRAR DETALLE DE ATRASOS
  ActualizarAtraso() {
    if (this.tipoF.value) {
      this.ActualizarDetalle(this.datosDetalle[0].id_detalle, this.tipoF.value, this.observacion_atraso)
    }
    else {
      this.ActualizarDetalle(this.datosDetalle[0].id_detalle, this.toleranciaF.value, this.observacion_atraso)
    }
  }

  // METODO PARA VER CONFIGURACION DE ATRASOS
  VerConfiguracionAtrasos() {
    if (this.datosDetalle[0].descripcion != '' && this.datosDetalle[0].descripcion != null) {
      this.ver_actualizar_atraso = true;
      this.ver_eliminar_atraso = true;
      this.ver_registrar_atraso = false;
      this.ver_guardar_atraso = false;
      this.ver_atraso = true;
      if (this.datosDetalle[0].descripcion === '1') {
        this.toleranciaF.setValue(this.datosDetalle[0].descripcion);
        this.tipoF.reset();
        this.ver_con_tolerancia = false;
        this.ver_con_tolerancia_2 = false;
        this.ver_sin_tolerancia = true;
        this.observacion_atraso = 'No se considera minutos de tolerancia.';
      }
      else if (this.datosDetalle[0].descripcion === '2-1') {
        this.ver_con_tolerancia = true;
        this.ver_sin_tolerancia = true;
        this.ver_con_tolerancia_2 = false;
        this.observacion_atraso = 'Considerar minutos de tolerancia. Si el usuario llegará más tarde de los minutos de tolerancia configurados, se contabilizará todos los minutos de atraso a partir de su horario de entrada.';
        this.toleranciaF.setValue('2');
        this.tipoF.setValue(this.datosDetalle[0].descripcion);
      }
      else if (this.datosDetalle[0].descripcion === '2-2') {
        this.ver_con_tolerancia = true;
        this.ver_con_tolerancia_2 = true;
        this.ver_sin_tolerancia = false;
        this.observacion_atraso = 'Considerar minutos de tolerancia. Si el usuario llegará más tarde de los minutos de tolerancia configurados, se contabilizará los minutos de atraso a partir de los minutos de tolerancia.';
        this.toleranciaF.setValue('2');
        this.tipoF.setValue(this.datosDetalle[0].descripcion);
      }

    }
    else {
      this.ver_actualizar_atraso = false;
      this.ver_eliminar_atraso = false;
      this.ver_registrar_atraso = true;
      this.ver_guardar_atraso = true;
    }
  }


  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO CARGA DE VACACIONES                 ** **
   ** ******************************************************************************************* **/

  seleccion: any;
  SelecionarCarga(event: MatRadioChange, observacion: any) {
    this.seleccion = event.value;
    this.RegistrarValores(this.seleccion, observacion);
  }


  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO CARGA DE VACACIONES                 ** **
   ** ******************************************************************************************* **/

  opcion_kardex: any;
  SelecionarDescarga(event: MatRadioChange, observacion: any) {
    this.opcion_kardex = event.value;
    this.RegistrarValores(this.opcion_kardex, observacion);
  }

  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO LABORAL - CALENDARIO                ** **
   ** ******************************************************************************************* **/

  opcion_laboral: any;
  SelecionarLaboral(event: MatRadioChange, observacion: any) {
    this.opcion_laboral = event.value;
    this.RegistrarValores(this.opcion_laboral, observacion);
  }


  // LIMPIAR OPCIONES DE SELECCION
  LimpiarSeleccion() {
    this.seleccion = '';
    this.opcion_kardex = '';
    this.opcion_laboral = '';
    this.formularioT.reset();
    this.formulario.reset();
  }

  /** ******************************************************************************************* **
   ** **                        COLORES DEFAULT DE DIAS DE LA SEMANA                           ** **
   ** ******************************************************************************************* **/
  CambiarColores() {
    this.lunes = 'rgb(80, 87, 97)';
    this.martes = 'rgb(80, 87, 97)';
    this.miercoles = 'rgb(80, 87, 97)';
    this.jueves = 'rgb(80, 87, 97)';
    this.viernes = 'rgb(80, 87, 97)';
    this.sabado = 'rgb(80, 87, 97)';
    this.domingo = 'rgb(80, 87, 97)';
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

  getVerParametroRegistrarDetalleParametro() {
    return this.tienePermiso('Ver Parámetro - Registrar Detalle Parámetro');
  }

  getVerParametroEditarDetalleParametro() {
    return this.tienePermiso('Ver Parámetro - Editar Detalle Parámetro');
  }

  getVerParametroEliminarDetalleParametro() {
    return this.tienePermiso('Ver Parámetro - Eliminar Detalle Parámetro');
  }

}
