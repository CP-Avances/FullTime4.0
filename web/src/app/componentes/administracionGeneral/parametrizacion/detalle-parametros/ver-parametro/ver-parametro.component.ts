// SECCIÓN DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

// SECCIÓN DE SERVICIOS
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

  ver_detalles: boolean = true;

  // ACTIVADORES
  formato: boolean = true;
  formato_fecha: boolean = false;
  formato_hora: boolean = false;
  carga: boolean = false;
  kardex: boolean = false;
  laboral_calendario: boolean = false;
  limite_correo: boolean = false;
  ubicacion: boolean = false;
  dispositivos: boolean = false;
  segundos_timbres: boolean = false;
  tolerancia_atrasos: boolean = false;

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

  ActivarBoton() {
    if (this.idParametro === '22') {
      this.formato = true;
      this.ubicacion = true;
    }
    if (this.idParametro === '24') {
      this.formato = true;
      this.limite_correo = true;
    }
    if (this.idParametro === '25') {
      this.formato = false;
      this.formato_fecha = true;
    }
    if (this.idParametro === '26') {
      this.formato = false;
      this.formato_hora = true;
    }
    if (this.idParametro === '27') {
      this.formato = false;
      this.carga = true;
    }
    if (this.idParametro === '28') {
      this.formato = false;
      this.kardex = true;
    }
    if (this.idParametro === '31') {
      this.formato = false;
      this.laboral_calendario = true;
    }
    if (this.idParametro === '32') {
      this.formato = false;
      this.dispositivos = true;
    }
    if (this.idParametro === '1') {
      this.formato = false;
      this.segundos_timbres = true;
    }
    if (this.idParametro === '2') {
      this.formato = false;
      this.tolerancia_atrasos = true;
      this.ver_detalles = false;
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
    this.datosDetalle = [];
    this.parametro.ListarDetalleParametros(id).subscribe(datos => {
      this.datosDetalle = datos;
      //console.log('ver detalles ', this.datosDetalle)
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

      if (this.idParametro === '2') {
        this.VerConfiguracionAtrasos();
      }
    }, vacio => {
      if (this.idParametro === '2') {
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

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACION
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
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO CARGA DE VACACIONES                 ** **
   ** ******************************************************************************************* **/

  seleccion: any;
  SelecionarCarga(event: MatRadioChange) {
    this.seleccion = event.value;
    console.log('seleccion ... ', this.seleccion)
    this.RegistrarValores(this.seleccion);
  }


  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO CARGA DE VACACIONES                 ** **
   ** ******************************************************************************************* **/

  opcion_kardex: any;
  SelecionarDescarga(event: MatRadioChange) {
    this.opcion_kardex = event.value;
    console.log('seleccion ... ', this.opcion_kardex)
    this.RegistrarValores(this.opcion_kardex);
  }

  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO LABORAL - CALENDARIO                ** **
   ** ******************************************************************************************* **/

  opcion_laboral: any;
  SelecionarLaboral(event: MatRadioChange) {
    this.opcion_laboral = event.value;
    console.log('seleccion ... ', this.opcion_laboral)
    this.RegistrarValores(this.opcion_laboral);
  }


  /** ******************************************************************************************* **
   ** **                   ALMACENAMIENTO DE PARAMETROS EN BASE DE DATOS                       ** **
   ** ******************************************************************************************* **/

  // METODO PARA REGISTRAR DETALLES
  RegistrarValores(detalle: string) {
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

  // LIMPIAR OPCIONES DE SELECCION
  LimpiarSeleccion() {
    this.seleccion = '';
    this.opcion_kardex = '';
    this.opcion_laboral = '';
    this.formularioT.reset();
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

  // METODO PARA SELECCION TIPO DE EMPRESA, ESTABLECIMIENTOS Y RESTRICCIONES
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
    console.log('ver opcion ', opcion)
  }

  // METODO PARA SELECCION TIPO DE EMPRESA, ESTABLECIMIENTOS Y RESTRICCIONES
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
    console.log('ver opcion ', opcion)
  }

  // METODO PARA REGISTRAR DETALLE DE ATRASOS
  RegistrarAtraso() {
    if (this.tipoF.value) {
      console.log('ver registro ', this.tipoF.value)
      this.CrearDetalle(this.tipoF.value)
    }
    else {
      console.log('ver registro ', this.toleranciaF.value)
      this.CrearDetalle(this.toleranciaF.value)
    }
  }

  // METODO PARA REGISTRAR DETALLE DE ATRASOS
  ActualizarAtraso() {
    if (this.tipoF.value) {
      console.log('ver registro ', this.tipoF.value)
      this.ActualizarDetalle(this.datosDetalle[0].id_detalle, this.tipoF.value)
    }
    else {
      console.log('ver registro ', this.toleranciaF.value)
      this.ActualizarDetalle(this.datosDetalle[0].id_detalle, this.toleranciaF.value)
    }
  }

  // METODO PARA ELIMINAR DETALLE DE ATRASOS
  EliminarAtrasos() {
    this.ConfirmarDelete(this.datosDetalle[0]);
  }

  // METODO PARA VER CONFIGURACION DE ATRASOS
  VerConfiguracionAtrasos() {
    console.log('ver detalles ', this.datosDetalle)
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
}
