import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

@Component({
  selector: 'app-contrato-cargo-empleado',
  templateUrl: './contrato-cargo-empleado.component.html',
  styleUrls: ['./contrato-cargo-empleado.component.css']
})

export class ContratoCargoEmpleadoComponent implements OnInit {

  idEmpleado: string = '';
  contratoEmpleado: any = [];
  hipervinculo: string = (localStorage.getItem('empresaURL') as string)

  constructor(
    public restEmpleado: EmpleadoService,
    public informacion: DatosGeneralesService,
    public restTitulo: TituloService,
    public restCargo: EmplCargosService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    private toastr: ToastrService,
  ) {
    // LEER ID DE USUARIO QUE INICIA SESION
    var item = localStorage.getItem('empleado');
    if (item) {
      this.idEmpleado = item;
    }
  }

  ngOnInit(): void {
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                       METODOS GENERALES DEL SISTEMA                                ** ** 
   ** **************************************************************************************** **/

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  datoActual: any = [];
  VerDatosActuales(formato_fecha: string) {
    this.datoActual = [];
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe((res: any) => {
      this.datoActual = res[0];
      // LLAMADO A DATOS DE USUARIO
      this.ObtenerContratoEmpleado(this.datoActual.id_contrato, formato_fecha);
      this.ObtenerCargoEmpleado(this.datoActual.id_cargo, formato_fecha);
    }, vacio => {
      this.BuscarContratoActual(formato_fecha);
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
        this.LlamarMetodos(this.formato_fecha);
      },
      vacio => {
        this.LlamarMetodos(this.formato_fecha);
      });
  }

  // LLAMAR METODOS DE PRESENTACION DE INFORMACION
  LlamarMetodos(formato_fecha: string) {
    this.VerDatosActuales(formato_fecha);
    this.ObtenerContratosEmpleado(formato_fecha);
  }

  /** ******************************************************************************************** **
   ** **                    METODOS PARA MENEJO DE DATOS DE CONTRATO                            ** **
   ** ******************************************************************************************** **/

  // METODO PARA OBTENER ULTIMO CONTRATO
  BuscarContratoActual(formato_fecha: string) {
    this.restEmpleado.BuscarIDContratoActual(parseInt(this.idEmpleado)).subscribe((datos: any) => {
      this.datoActual.id_contrato = datos[0].max;
      this.ObtenerContratoEmpleado(this.datoActual.id_contrato, formato_fecha);
    });
  }

  // METODO PARA OBTENER EL CONTRATO DE UN EMPLEADO CON SU RESPECTIVO RÉGIMEN LABORAL 
  ObtenerContratoEmpleado(id_contrato: number, formato_fecha: string) {
    this.restEmpleado.BuscarDatosContrato(id_contrato).subscribe(res => {
      this.contratoEmpleado = res;
      this.contratoEmpleado.forEach((data: any) => {
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fecha_ingreso, formato_fecha, this.validar.dia_abreviado);
        data.fec_salida_ = this.validar.FormatearFecha(data.fecha_salida, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  // METODO PARA VER LISTA DE TODOS LOS CONTRATOS
  contratoBuscado: any = [];
  ObtenerContratosEmpleado(formato_fecha: string) {
    this.contratoBuscado = [];
    this.restEmpleado.BuscarContratosEmpleado(parseInt(this.idEmpleado)).subscribe(res => {
      this.contratoBuscado = res;
      this.contratoBuscado.forEach((data: any) => {
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fecha_ingreso, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  // METODO PARA VER DATOS DEL CONTRATO SELECCIONADO 
  fechaContrato = new FormControl('');
  public contratoForm = new FormGroup({
    fechaContratoForm: this.fechaContrato,
  });
  contratoSeleccionado: any = [];
  listaCargos: any = [];
  ObtenerContratoSeleccionado(form: any) {
    this.LimpiarCargo();
    this.contratoSeleccionado = [];
    this.restEmpleado.BuscarDatosContrato(form.fechaContratoForm).subscribe(res => {
      this.contratoSeleccionado = res;
      this.contratoSeleccionado.forEach((data: any) => {
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fecha_ingreso, this.formato_fecha, this.validar.dia_abreviado);
        data.fec_salida_ = this.validar.FormatearFecha(data.fecha_salida, this.formato_fecha, this.validar.dia_abreviado);
      })
    });
    this.restCargo.BuscarCargoIDContrato(form.fechaContratoForm).subscribe(datos => {
      this.listaCargos = datos;
      this.listaCargos.forEach((data: any) => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fecha_inicio, this.formato_fecha, this.validar.dia_abreviado);
      })
    }, error => {
      this.toastr.info('El contrato seleccionado no registra ningún cargo', 'VERIFICAR', {
        timeOut: 6000,
      });
    });
  }

  // METODO PARA LIMPIAR REGISTRO DE CONTRATO
  LimpiarContrato() {
    this.contratoSeleccionado = [];
    this.cargoSeleccionado = [];
    this.listaCargos = [];
    this.contratoForm.reset();
    this.cargoForm.reset();
  }


  /** ** ***************************************************************************************** **
   ** ** **                  METODOS PARA MENEJO DE DATOS DE CARGO                              ** **
   ** ******************************************************************************************** **/

  // METODO PARA OBTENER LOS DATOS DEL CARGO DEL EMPLEADO 
  cargoEmpleado: any = [];
  ObtenerCargoEmpleado(id_cargo: number, formato_fecha: string) {
    this.cargoEmpleado = [];
    this.restCargo.BuscarCargoID(id_cargo).subscribe(datos => {
      this.cargoEmpleado = datos;
      this.cargoEmpleado.forEach((data: any) => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fecha_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fecha_final, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  // METODO PARA LIMPIAR REGISTRO 
  LimpiarCargo() {
    this.cargoSeleccionado = [];
    this.listaCargos = [];
    this.cargoForm.reset();
  }

  // METODO PARA VER CARGO SELECCIONADO 
  fechaICargo = new FormControl('');
  public cargoForm = new FormGroup({
    fechaICargoForm: this.fechaICargo,
  });
  cargoSeleccionado: any = [];
  ObtenerCargoSeleccionado(form: any) {
    this.cargoSeleccionado = [];
    this.restCargo.BuscarCargoID(form.fechaICargoForm).subscribe(datos => {
      this.cargoSeleccionado = datos;
      this.cargoSeleccionado.forEach((data: any) => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fecha_inicio, this.formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fecha_final, this.formato_fecha, this.validar.dia_abreviado);
      })
    });
  }


}
