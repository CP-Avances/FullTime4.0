import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AsignacionesService } from 'src/app/servicios/asignaciones/asignaciones.service';
import { UsuarioService } from "src/app/servicios/usuarios/usuario.service";
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';

import { EditarTimbreComponent } from '../editar-timbre/editar-timbre.component';
import { VerTimbreComponent } from '../ver-timbre/ver-timbre.component';

@Component({
  selector: 'app-buscar-timbre',
  templateUrl: './buscar-timbre.component.html',
  styleUrls: ['./buscar-timbre.component.css']
})

export class BuscarTimbreComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  codigo = new FormControl('',);
  cedula = new FormControl('',);
  fecha = new FormControl('', Validators.required);

  mostrarTabla: boolean = false;
  existenTimbres: boolean = false;

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    cedulaForm: this.cedula,
    codigoForm: this.codigo,
    fechaForm: this.fecha
  });

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina_e: number = 1;
  tamanio_pagina_e: number = 5;
  pageSizeOptions_e = [5, 10, 20, 50];

  timbres: any = [];
  idEmpleadoLogueado: any;

  idUsuariosAcceso: any = [];

  constructor(
    private timbresServicio: TimbresService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    public ventana: MatDialog,
    public parametro: ParametrosService,
    public restEmpleado: EmpleadoService,
    private restUsuario: UsuarioService,
    private asignaciones: AsignacionesService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;

    this.BuscarParametro();
    this.BuscarHora();
    this.ObtenerEmpleadoLogueado(this.idEmpleadoLogueado);
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
      });
  }

  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  datosEmpleadoLogueado: any = [];
  // METODO PARA VER LA INFORMACION DEL EMPLEADO QUE INICIA SESION
  ObtenerEmpleadoLogueado(idemploy: any) {
    this.datosEmpleadoLogueado = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.datosEmpleadoLogueado = data[0];
    })
  }

  async FiltrarEmpleadosAsignados(data: any) {
    return data.filter((timbre: any) => this.idUsuariosAcceso.includes(timbre.id_empleado));
  }

  // METODO PARA CONTROLAR REGISTRO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO DE VALIDACION DE INGRESO DE SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // EVENTO PARA MANEJAR LA PAGINACION DE TABLA
  ManejarPaginaE(e: PageEvent) {
    this.tamanio_pagina_e = e.pageSize;
    this.numero_pagina_e = e.pageIndex + 1;
  }

  // METODO PARA BUSCAR TIMBRES
  BuscarTimbresFecha(form: any) {
    this.timbres = [];
    this.existenTimbres = false;

    if (form.codigoForm === "" && form.cedulaForm === "") {
      return this.toastr.error('Ingrese código o cédula del usuario.', 'Llenar los campos.', {
        timeOut: 6000,
      })

    } else {
      var datos: any = {
        codigo: form.codigoForm,
        cedula: form.cedulaForm,
        fecha: moment(form.fechaForm).format('YYYY-MM-DD')
      }

      this.timbresServicio.ObtenerTimbresFechaEmple(datos).subscribe(async timbres => {
        if (timbres.timbres.length > 0) {
          this.existenTimbres = true;
        }
        this.timbres = await this.FiltrarEmpleadosAsignados(timbres.timbres);
        if (this.timbres.length === 0 && this.existenTimbres) {
          this.mostrarTabla = false;
          return this.toastr.error('No tiene acceso a los datos de este usuario.', 'Notificación', {
            timeOut: 6000,
          })
        }
        this.timbres.forEach((data: any) => {
          data.fecha = this.validar.FormatearFecha(data.fecha_hora_timbre_servidor, this.formato_fecha, this.validar.dia_abreviado);
          data.hora = this.validar.FormatearHora(data.fecha_hora_timbre_servidor.split(' ')[1], this.formato_hora);
        })
        this.mostrarTabla = true;
      }, error => {
        this.mostrarTabla = false;
        return this.toastr.error(error.error.message, 'Notificación', {
          timeOut: 6000,
        })
      })
    }
  }

  // METODO PARA ABRIR VENTANA EDITAR TIMBRE
  AbrirVentanaEditar(timbre: any, form: any): void {
    this.ventana.open(EditarTimbreComponent,
      { width: '650px', data: { timbre: timbre } })
      .afterClosed().subscribe(item => {
        if (item) {
          if (item === 2) {
            this.BuscarTimbresFecha(form);
          }
        }
      });
  }

  // METODO PARA VER LA INFORMACION DEL TIMBRE
  AbrirVentanaVerInfoTimbre(timbre: any): void {
    this.ventana.open(VerTimbreComponent,
      { width: '750px', data: { timbre: timbre } })
  }

  // METODO PARA LIMPIAR CAMPOS DE FORMULARIO
  LimpiarCampos() {
    this.codigo.reset('');
    this.cedula.reset('');
    this.fecha.reset();
    this.mostrarTabla = false;
  }

  ngOnDestroy(): void {
    this.mostrarTabla = false
  }

}
