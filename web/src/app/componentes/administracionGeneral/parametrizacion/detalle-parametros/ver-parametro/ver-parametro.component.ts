// SECCION DE LIBRERIAS
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

// SECCION DE SERVICIOS
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { EditarParametroComponent } from '../../parametros/editar-parametro/editar-parametro.component';
import { ListarParametroComponent } from '../../parametros/listar-parametro/listar-parametro.component';
import { CrearDetalleParametroComponent } from '../crear-detalle-parametro/crear-detalle-parametro.component';
import { EditarDetalleParametroComponent } from '../editar-detalle-parametro/editar-detalle-parametro.component';

@Component({
  selector: 'app-ver-parametro',
  templateUrl: './ver-parametro.component.html',
  styleUrls: ['./ver-parametro.component.css']
})

export class VerParametroComponent implements OnInit {

  formato12: string = 'rgb(80, 87, 97)';
  formato24: string = 'rgb(80, 87, 97)';
  formatoA: string = 'rgb(80, 87, 97)';
  formatoI: string = 'rgb(80, 87, 97)';
  formatoE: string = 'rgb(80, 87, 97)';

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

  // PARAMETRO FECHA
  formato_fecha: boolean = false;
  // PARAMETRO HORA
  formato_hora: boolean = false;
  // PARAMETRO ATRASOS
  tolerancia_atrasos: boolean = false;
  // PARAMETRO UBICACION
  ubicacion: boolean = false;
  // PARAMETRO UBICACION DESCONOCIDA
  ubicacion_desconocida: boolean = false;
  // PARAMTERO DISPOSITIVOS
  dispositivos: boolean = false;
  // PARAMETRO CERTIFICADO SSL
  certificados: boolean = false;
  // PARAMETRO CUMPLEANIOS
  cumpleanios: boolean = false;
  // PARAMETRO CONSIDERAR SEGUNDOS
  segundos_timbres: boolean = false;
  // PARAMETRO CARGAR VACACIONES
  carga: boolean = false;
  // PARAMETRO DESCARGAR KARDEX
  kardex: boolean = false;
  // PARAMETRO FORMATO LABORAL - CALENDARIO
  laboral_calendario: boolean = false;
  // PARAMETRO FORMATO CONECTIVIDAD A INTERNET
  conectividad_internet: boolean = false;
  // PARAMETRO TOMAR FOTO MOVIL
  foto_movil: boolean = false;
  // PARAMETRO LIMITE CORREO
  limite_correo: boolean = false;

  ingreso: number = 0;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private toastr: ToastrService,
    public ventana: MatDialog,
    public parametro: ParametrosService,
    public componentel: ListarParametroComponent,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.BuscarParametros(this.idParametro);
    this.ListarDetalles(this.idParametro);
    this.ActivarBoton();
  }

  // METODO PARA ACTIVAR BOTONES SEGUN PARAMETRO
  ActivarBoton() {

    this.ver_editar = false;
    this.ver_detalles = false;
    this.boton_registrar = false;

    // FORMATO FECHA
    if (this.idParametro === '1') {
      this.formato_fecha = true;
    }
    // FORMATO HORA
    if (this.idParametro === '2') {
      this.formato_hora = true;
    }
    // TOLERANCIA ATRASOS
    if (this.idParametro === '3') {
      this.tolerancia_atrasos = true;
    }
    // TOLERANCIA UBICACION
    if (this.idParametro === '4') {
      this.ver_detalles = true;
      this.ver_editar = true;
      this.ubicacion = true;
    }
    // FORMATO PERMITIR TIMBRE UBICACION DESCONOCIDA
    if (this.idParametro === '5') {
      this.ver_formulario = true;
      this.ubicacion_desconocida = true;
    }
    // DISPOSITIVOS MOVILES
    if (this.idParametro === '6') {
      this.ver_editar = true;
      this.ver_detalles = true;
      this.dispositivos = true;
    }
    // FORMATO CERTIFICADOS SSL
    if (this.idParametro === '7') {
      this.certificados = true;
      this.ver_formulario = true;
    }
    // FORMATO CERTIFICADOS SSL
    if (this.idParametro === '8') {
      this.cumpleanios = true;
      this.ver_formulario = true;
    }
    // CONSIDERAR SEGUNDOS MARCACIONES
    if (this.idParametro === '9') {
      this.segundos_timbres = true;
      this.ver_formulario = true;
    }
    // TIPO CARGA VACACIONES
    if (this.idParametro === '10') {
      this.carga = true;
    }
    // DESCARGAR KARDEX
    if (this.idParametro === '11') {
      this.kardex = true;
    }
    // FORMATO LABORAL CALENDARIO
    if (this.idParametro === '12') {
      this.laboral_calendario = true;
    }
    // FORMATO CONECTIVIDAD INTERNET
    if (this.idParametro === '13') {
      this.conectividad_internet = true;
      this.ver_formulario = true;
    }
    // FORMATO PERMITIR TIMBRE UBICACION DESCONOCIDA
    if (this.idParametro === '14') {
      this.ver_formulario = true;
      this.foto_movil = true;
    }
    // LIMITE CORREO
    if (this.idParametro === '33') {
      this.ver_editar = true;
      this.ver_detalles = true;
      this.limite_correo = true;
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
      //console.log('ver detalles ', this.datosDetalle)
      // SELECCION DE OPCIONES
      if (this.ingreso === 0) {
        this.seleccion = this.datosDetalle[0].descripcion;
        this.opcion_kardex = this.datosDetalle[0].descripcion;
        this.opcion_laboral = this.datosDetalle[0].descripcion;
      }
      if (this.datosDetalle[0].descripcion === 'hh:mm:ss A') {
        this.formato12 = '#4194F0';
        this.formato24 = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'HH:mm:ss') {
        this.formato24 = '#4194F0';
        this.formato12 = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'DD/MM/YYYY') {
        this.formatoA = '#4194F0';
        this.formatoI = 'rgb(80, 87, 97)';
        this.formatoE = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'MM/DD/YYYY') {
        this.formatoI = '#4194F0';
        this.formatoA = 'rgb(80, 87, 97)';
        this.formatoE = 'rgb(80, 87, 97)';
      }
      if (this.datosDetalle[0].descripcion === 'YYYY-MM-DD') {
        this.formatoE = '#4194F0';
        this.formatoI = 'rgb(80, 87, 97)';
        this.formatoA = 'rgb(80, 87, 97)';
      }

      if (this.idParametro === '3') {
        this.VerConfiguracionAtrasos();
      }

      // PARAMETROS QUE EXISTEN Y NO NECESITAN REGISTRO ADICIONAL
      if (this.idParametro === '4' || this.idParametro === '6' || this.idParametro === '13') {
        this.boton_registrar = false;
      }

      // PARAMETROS CON DETALLES
      if (this.idParametro === '5' || this.idParametro === '7' || this.idParametro === '8' || this.idParametro === '9' ||
        this.idParametro === '13' || this.idParametro === '14') {
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

  // METODO PARA EDITAR PARAMETRO
  AbrirVentanaEditar(datos: any): void {
    this.ventana.open(EditarParametroComponent,
      { width: '400px', data: { parametros: datos, actualizar: true } })
      .afterClosed().subscribe(item => {
        if (item) {
          if (item > 0) {
            this.BuscarParametros(this.idParametro);
          }
        }
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
      ip: this.ip
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
  RegistrarValores(detalle: any) {
    this.ingreso = 1;
    this.parametro.ListarDetalleParametros(parseInt(this.idParametro)).subscribe(datos => {
      this.ActualizarDetalle(datos[0].id_detalle, detalle);
    }, vacio => {
      this.CrearDetalle(detalle);
    })
  }

  // METODO PARA REGISTRAR NUEVO PARÁMETRO
  CrearDetalle(detalle: any) {
    let datos = {
      id_tipo: this.idParametro,
      descripcion: detalle,
      user_name: this.user_name,
      ip: this.ip,
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
  ActualizarDetalle(id_detalle: number, detalle: any) {
    let datos = {
      id: id_detalle,
      descripcion: detalle,
      user_name: this.user_name,
      ip: this.ip,
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
  SelecionarEvento(event: MatRadioChange) {
    var seleccion = event.value;
    this.RegistrarValores(seleccion);
  }

  // METODO PARA REGISTRAR DETALLE DE ATRASOS
  ActualizarRegistro(detalle: any) {
    this.ActualizarDetalle(this.datosDetalle[0].id_detalle, detalle);
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

  GuardarDatos(seleccion: number) {
    let formato = '';
    if (seleccion === 1) {
      formato = 'DD/MM/YYYY';
    }
    else if (seleccion === 2) {
      formato = 'MM/DD/YYYY';
    }
    else if (seleccion === 3) {
      formato = 'YYYY-MM-DD';
    }
    else if (seleccion === 4) {
      formato = 'hh:mm:ss A';
    }
    else if (seleccion === 5) {
      formato = 'HH:mm:ss';
    }

    this.RegistrarValores(formato);
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
      this.tipoF.reset();
      this.ver_con_tolerancia = false;
      this.ver_con_tolerancia_2 = false;
      this.ver_sin_tolerancia = true;
      this.ver_registrar_atraso = false;
    }
  }

  // METODO PARA SELECCION TIPO ATRASO
  SeleccionarTipo(event: MatRadioChange) {
    var opcion = event.value;
    this.ver_registrar_atraso = false;
    // OPCION (2-1) CONSIDERANDO MINUTOS DE TOLERANCIA - ATRASO CALCULADO CON HORARIO
    if (opcion === '2-1') {
      this.ver_sin_tolerancia = true;
      this.ver_con_tolerancia_2 = false;
    }
    // OPCION (2-2) CONSIDERANDO MINUTOS DE TOLERANCIA - ATRASO CALCULADO CON TOLERANCIA
    else {
      this.ver_con_tolerancia_2 = true;
      this.ver_sin_tolerancia = false;
    }
  }

  // METODO PARA REGISTRAR DETALLE DE ATRASOS
  RegistrarAtraso() {
    if (this.tipoF.value) {
      //console.log('ver registro ', this.tipoF.value)
      this.CrearDetalle(this.tipoF.value)
    }
    else {
      //console.log('ver registro ', this.toleranciaF.value)
      this.CrearDetalle(this.toleranciaF.value)
    }
  }

  // METODO PARA REGISTRAR DETALLE DE ATRASOS
  ActualizarAtraso() {
    if (this.tipoF.value) {
      //console.log('ver registro ', this.tipoF.value)
      this.ActualizarDetalle(this.datosDetalle[0].id_detalle, this.tipoF.value)
    }
    else {
      //console.log('ver registro ', this.toleranciaF.value)
      this.ActualizarDetalle(this.datosDetalle[0].id_detalle, this.toleranciaF.value)
    }
  }

  // METODO PARA VER CONFIGURACION DE ATRASOS
  VerConfiguracionAtrasos() {
    //console.log('ver detalles ', this.datosDetalle)
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
      }
      else if (this.datosDetalle[0].descripcion === '2-1') {
        this.ver_con_tolerancia = true;
        this.ver_sin_tolerancia = true;
        this.ver_con_tolerancia_2 = false;

        this.toleranciaF.setValue('2');
        this.tipoF.setValue(this.datosDetalle[0].descripcion);
      }
      else if (this.datosDetalle[0].descripcion === '2-2') {
        this.ver_con_tolerancia = true;
        this.ver_con_tolerancia_2 = true;
        this.ver_sin_tolerancia = false;

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
  SelecionarCarga(event: MatRadioChange) {
    this.seleccion = event.value;
    this.RegistrarValores(this.seleccion);
  }


  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO CARGA DE VACACIONES                 ** **
   ** ******************************************************************************************* **/

  opcion_kardex: any;
  SelecionarDescarga(event: MatRadioChange) {
    this.opcion_kardex = event.value;
    this.RegistrarValores(this.opcion_kardex);
  }

  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO LABORAL - CALENDARIO                ** **
   ** ******************************************************************************************* **/

  opcion_laboral: any;
  SelecionarLaboral(event: MatRadioChange) {
    this.opcion_laboral = event.value;
    this.RegistrarValores(this.opcion_laboral);
  }


  // LIMPIAR OPCIONES DE SELECCION
  LimpiarSeleccion() {
    this.seleccion = '';
    this.opcion_kardex = '';
    this.opcion_laboral = '';
    this.formularioT.reset();
    this.formulario.reset();
  }


}
