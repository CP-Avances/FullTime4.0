import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';

interface Orden {
  valor: number
}

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-hora-extra-autorizaciones',
  templateUrl: './hora-extra-autorizaciones.component.html',
  styleUrls: ['./hora-extra-autorizaciones.component.css']
})

export class HoraExtraAutorizacionesComponent implements OnInit {

  TipoDocumento = new FormControl('');
  orden = new FormControl(0, Validators.required);
  estado = new FormControl('', Validators.required);
  idDepartamento = new FormControl('');

  public nuevaAutorizacionesForm = new FormGroup({
    ordenF: this.orden,
    estadoF: this.estado,
    idDepartamentoF: this.idDepartamento
  });

  departamentos: any = [];

  ordenes: Orden[] = [
    { valor: 1 },
    { valor: 2 },
    { valor: 3 },
    { valor: 4 },
    { valor: 5 }
  ];

  estados: Estado[] = [];

  Habilitado: boolean = true;
  id_empleado_loggin: number;
  FechaActual: any;
  NotifiRes: any;

  public ArrayAutorizacionTipos: any = [];
  public nuevoAutorizacionTipos: any = [];
  public gerencia: boolean = false;
  autorizaDirecto: boolean = false;
  InfoListaAutoriza: any = [];
  id_depart: any;

  oculDepa: boolean = true;
  ocultar: boolean = true;

  constructor(
    public restAutorizaciones: AutorizacionService,
    public restAutoriza: AutorizaDepartamentoService,
    public restDepartamento: DepartamentosService,
    private realTime: RealTimeService,
    private restH: PedHoraExtraService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<HoraExtraAutorizacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.id_empleado_loggin = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    console.log(this.data, 'datam');
    this.obtenerDepartamento();
    this.tiempo();
    this.BuscarTipoAutorizacion();

    if (this.data.datosHora.length == 0) {
      this.toastr.error("No ha seleccionado solicitudes para aprobar");
    }
  }

  BuscarTipoAutorizacion() {
    this.ArrayAutorizacionTipos = [];
    this.nuevoAutorizacionTipos = [];
    var i = 0;
    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.id_empleado_loggin).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
        this.nuevoAutorizacionTipos = this.ArrayAutorizacionTipos.filter(item => {
          i += 1;
          return item.estado == true
        });

        if (i == this.ArrayAutorizacionTipos.length) {
          if (this.nuevoAutorizacionTipos.length < 2) {
            this.oculDepa = true;
            this.id_depart = this.nuevoAutorizacionTipos[0].id_departamento;
            this.obtenerAutorizacion();
          } else {
            this.oculDepa = false;
          }

          this.nuevoAutorizacionTipos.filter(x => {
            if (x.nombre == 'GERENCIA' && x.estado == true) {
              console.log('entro en gerencia');
              this.gerencia = true;
              this.autorizaDirecto = false;
              this.InfoListaAutoriza = x;
              if (x.autorizar == true) {
                this.estados = [
                  { id: 3, nombre: 'Autorizado' },
                  { id: 4, nombre: 'Negado' }
                ];
              } else if (x.preautorizar == true) {
                this.estados = [
                  { id: 2, nombre: 'Pre-autorizado' },
                  { id: 4, nombre: 'Negado' }
                ];
              }
            }
            else if ((this.gerencia == false) && (x.estado == true) && (x.id_departamento == this.id_depart)) {
              console.log('esta fuera de gerencia');
              this.autorizaDirecto = true;
              this.InfoListaAutoriza = x;
              if (x.autorizar == true) {
                this.estados = [
                  { id: 3, nombre: 'Autorizado' },
                  { id: 4, nombre: 'Negado' }
                ];
              } else if (x.preautorizar == true) {
                this.estados = [
                  { id: 2, nombre: 'Pre-autorizado' },
                  { id: 4, nombre: 'Negado' }
                ];
              }
            }
          });

        }
      });
  }

  departamentoChange: any = [];
  ChangeDepa(e: any) {
    if (e != null && e != undefined) {
      const [departamento] = this.ArrayAutorizacionTipos.filter((o: any) => {
        return o.id_depa_confi === e
      })
      this.departamentoChange = departamento;
      this.id_depart = this.departamentoChange.id_departamento;
      this.BuscarTipoAutorizacion();
      this.obtenerAutorizacion();
    }
  }

  lectura: number = 0;
  estado_auto: any;
  listadoDepaAutoriza: any = [];
  nivel_padre: number = 0;
  cont: number = 0;
  mensaje: any;
  listafiltrada: any = [];
  ListaHorasExtras: any = [];
  obtenerAutorizacion() {
    if (this.data.carga === 'multiple') {
      var contador = 0;
      this.ListaHorasExtras = [];
      this.listafiltrada = [];
      this.mensaje = '';
      this.ListaHorasExtras = this.data.datosHora.filter(i => {
        contador += 1;
        return i.id_depa == this.id_depart;
      })

      this.cont = 0;
      if (this.data.datosHora.length == contador) {
        if (this.ListaHorasExtras.length != 0) {
          this.ListaHorasExtras.forEach(o => {
            this.cont = this.cont + 1;
            this.restAutorizaciones.getUnaAutorizacionByHoraExtraRest(o.id).subscribe(
              autorizacion => {
                var autorizaciones = autorizacion[0].id_autoriza_estado.split(',');
                autorizaciones.map((obj: string) => {
                  this.lectura = this.lectura + 1;
                  if (obj != '') {
                    let empleado_id = obj.split('_')[0];
                    this.estado_auto = obj.split('_')[1];

                    // CAMBIAR DATO ESTADO INT A VARCHAR
                    if (this.estado_auto === '1') {
                      this.estado_auto = 'Pendiente';
                    }
                    if (this.estado_auto === '2') {
                      this.estado_auto = 'Preautorizado';
                    }
                    if ((this.estado_auto === 'Pendiente') || (this.estado_auto === 'Preautorizado')) {
                      //Valida que el usuario que va a realizar la aprobacion le corresponda su nivel y autorice caso contrario se oculta el boton de aprobar.
                      this.restAutoriza.BuscarListaAutorizaDepa(autorizacion[0].id_departamento).subscribe(res => {
                        this.listadoDepaAutoriza = res;
                        this.listadoDepaAutoriza.filter(item => {
                          this.nivel_padre = item.nivel_padre;
                          if ((this.id_empleado_loggin == item.id_contrato) && (autorizaciones.length == item.nivel)) {
                            this.listafiltrada.push(o);
                            return this.ocultar = false;
                          }
                        })

                        if (this.ListaHorasExtras.length == this.cont) {
                          if (this.listafiltrada.length == 0) {
                            this.mensaje = 'Las solicitudes seleccionadas del departamento de ' + this.departamentoChange.depa_autoriza + ' no corresponde a su nivel de aprobación';
                            this.ocultar = true;
                            return
                          } else {

                            //Listado para eliminar el usuario duplicado
                            var ListaSinDuplicadosPendie: any = [];
                            var cont = 0;
                            this.listafiltrada.forEach(function (elemento, indice, array) {
                              cont = cont + 1;
                              if (ListaSinDuplicadosPendie.find(p => p.id == elemento.id) == undefined) {
                                ListaSinDuplicadosPendie.push(elemento);
                              }
                            });

                            if (this.listafiltrada.length == cont) {
                              this.listafiltrada = [];
                              this.listafiltrada = ListaSinDuplicadosPendie;
                            }

                            this.ocultar = false;
                          }
                        }

                      });
                    } else {
                      this.ocultar = true;
                    }

                  } else {
                    if (autorizaciones.length < 2) {
                      //Valida que el usuario que va a realizar la aprobacion le corresponda su nivel y autorice caso contrario se oculta el boton de aprobar.
                      this.restAutoriza.BuscarListaAutorizaDepa(autorizacion[0].id_departamento).subscribe(res => {
                        this.listadoDepaAutoriza = res;
                        this.listadoDepaAutoriza.filter(item => {
                          if ((this.id_empleado_loggin == item.id_contrato) && (autorizaciones.length == item.nivel)) {
                            this.listafiltrada.push(o);
                            return this.ocultar = false;
                          }
                        })

                        if (this.ListaHorasExtras.length == this.cont) {
                          if (this.listafiltrada.length == 0) {
                            this.mensaje = 'Las solicitudes seleccionadas del departamento de ' + this.departamentoChange.depa_autoriza + ' no corresponde a su nivel de aprobación';
                            this.ocultar = true;
                            return
                          } else {

                            //Listado para eliminar el usuario duplicado
                            var ListaSinDuplicadosPendie: any = [];
                            var cont = 0;
                            this.listafiltrada.forEach(function (elemento, indice, array) {
                              cont = cont + 1;
                              if (ListaSinDuplicadosPendie.find(p => p.id == elemento.id) == undefined) {
                                ListaSinDuplicadosPendie.push(elemento);
                              }
                            });

                            if (this.listafiltrada.length == cont) {
                              this.listafiltrada = [];
                              this.listafiltrada = ListaSinDuplicadosPendie;
                            }

                            this.ocultar = false;
                          }
                        }
                      });
                    }
                  }
                });
              }
            );
          })
        } else {
          this.mensaje = 'No hay solicitudes seleccionadas del departamento de ' + this.departamentoChange.depa_autoriza;
          this.ocultar = true;
          return
        }
      } else {
        this.mensaje = 'No ha seleccionado solicitudes del departamento de ' + this.departamentoChange.depa_autoriza;
        this.ocultar = true;
        return
      }
    }
  }

  insertarAutorizacion(form: any) {
    if (this.data.carga === 'individual') {
      if (this.data.pedido_hora.estado === 2 || this.data.pedido_hora.estado === 3 || this.data.pedido_hora.estado === 4) {
        this.restH.BuscarDatosAutorizacion(this.data.pedido_hora.id).subscribe(data => {
          var documento = data[0].empleado_estado;
          this.ActualizarDatos(form, documento, this.data.pedido_hora.id, form.idDepartamentoF, this.data.pedido_hora.id_usua_solicita);
        }, err => {
          const { access, message } = err.error.message;
          if (access === false) {
            this.toastr.error(message)
            this.dialogRef.close();
          }
        })
      }
      else {
        this.IngresarDatos(form, this.data.pedido_hora.id, form.idDepartamentoF, this.data.pedido_hora.id_usua_solicita);
      }
    }
    else if (this.data.carga === 'multiple') {
      this.listafiltrada.map(obj => {
        if (obj.estado === 'Pre-Autorizado') {
          this.restH.BuscarDatosAutorizacion(obj.id).subscribe(data => {
            var documento = data[0].empleado_estado;
            this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
              this.departamentos = res;
              this.ActualizarDatos(form, documento, obj.id, this.departamentos[0].id_departamento, obj.id_usua_solicita);
            })
          }, err => {
            const { access, message } = err.error.message;
            if (access === false) {
              this.toastr.error(message)
              this.dialogRef.close();
            }
          })
        }
        else {
          this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
            this.departamentos = res;
            this.IngresarDatos(form, obj.id, this.departamentos[0].id_departamento, obj.id_usua_solicita);
          })
        }
      })
    }
    else if (this.data.carga === undefined) {
      if (this.data.estado === 2 || this.data.estado === 3 || this.data.estado === 4) {
        this.restH.BuscarDatosAutorizacion(this.data.id).subscribe(data => {
          var documento = data[0].empleado_estado;
          this.ActualizarDatos(form, documento, this.data.id, form.idDepartamentoF, this.data.id_usua_solicita);
        }, err => {
          const { access, message } = err.error.message;
          if (access === false) {
            this.toastr.error(message)
            this.dialogRef.close();
          }
        })
      }
      else {
        this.IngresarDatos(form, this.data.id, form.idDepartamentoF, this.data.id_usua_solicita);
      }
    }
  }

  obtenerDepartamento() {
    if (this.data.carga === 'individual') {
      this.BusquedaDepartamento(this.data.pedido_hora.id_empl_cargo);
    }
    else {
      this.nuevaAutorizacionesForm.patchValue({
        ordenF: 1,
        estadoF: '',
      })
      this.Habilitado = false;
    }
  }

  BusquedaDepartamento(cargo_id) {
    this.restDepartamento.ConsultarDepartamentoPorContrato(cargo_id).subscribe(res => {
      console.log(res, 'departamentos');
      this.departamentos = res;
      this.nuevaAutorizacionesForm.patchValue({
        ordenF: 1,
        estadoF: '',
        idDepartamentoF: this.departamentos[0].id_departamento
      })
    })
  }

  tiempo() {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    console.log('fecha Actual', this.FechaActual);
  }


  IngresarDatos(form, id_hora_extra: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para ingresar una autorización
    let newAutorizaciones = {
      orden: form.ordenF,
      estado: form.estadoF,
      id_departamento: id_departamento,
      id_permiso: null,
      id_vacacion: null,
      id_hora_extra: id_hora_extra,
      id_documento: localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      id_plan_hora_extra: null,
    }
    this.restAutorizaciones.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
      console.log('pasa')
      this.EditarEstadoHoraExtra(id_hora_extra, id_departamento, empleado_solicita, form.estadoF)
    }, error => { })
  }

  ActualizarDatos(form, documento, id_hora_extra: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para actualizar la autorización de acuerdo a la hora extra
    let newAutorizacionesM = {
      id_documento: documento + localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      estado: form.estadoF,
      id_hora_extra: id_hora_extra,
      id_departamento: id_departamento,
    }
    this.restAutorizaciones.PutEstadoAutoHoraExtra(id_hora_extra, newAutorizacionesM).subscribe(res => {
      this.EditarEstadoHoraExtra(id_hora_extra, id_departamento, empleado_solicita, form.estadoF)
    })
  }

  resEstado: any = [];
  contador: number = 0;
  EditarEstadoHoraExtra(id_hora, id_departamento, usuario_solicita, estado_hora) {
    console.log('estado', estado_hora)
    let datosHorasExtras = {
      estado: estado_hora,
      id_hora_extra: id_hora,
      id_departamento: id_departamento,
    }
    console.log('datos', datosHorasExtras);
    this.restH.ActualizarEstado(id_hora, datosHorasExtras).subscribe(res => {
      this.resEstado = [res];
      console.log('estado', this.resEstado);
      console.log(this.resEstado[0].realtime[0].estado);
      var f = new Date();
      // let nomEstado = '';
      // this.estados.forEach((obj: any) => {
      //   if(obj.valor = form.estadoForm) {
      //     nomEstado = obj.nombre
      //   }
      // })
      var estado_letras: string = '';
      if (estado_hora === 1) {
        estado_letras = 'Pendiente';
      }
      else if (estado_hora === 2) {
        estado_letras = 'Pre-autorizado';
      }
      else if (estado_hora === 3) {
        estado_letras = 'Autorizado';
      }
      else if (estado_hora === 4) {
        estado_letras = 'Negado';
      }
      let notificacion = {
        id: null,
        id_send_empl: this.id_empleado_loggin,
        id_receives_empl: usuario_solicita,
        id_receives_depa: id_departamento,
        estado: estado_letras,
        create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
        id_permiso: null,
        id_vacaciones: null,
        id_hora_extra: id_hora
      }
      this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(res1 => {
        this.NotifiRes = res1;
        notificacion.id = this.NotifiRes._id;
        if (this.NotifiRes._id > 0 && this.resEstado[0].notificacion === true) {
          this.restH.EnviarNotificacionRealTime(notificacion);
        }
      });
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close();
      }
    })
    console.log('contador', this.contador);
    this.contador = this.contador + 1;
    if (this.data.carga === 'multiple') {
      console.log('arreglo', this.listafiltrada.length);
      if (this.contador === this.listafiltrada.length) {
        this.toastr.success('Operación exitosa.', 'Se autorizo un total de ' + this.listafiltrada.length + ' solicitudes de horas extras.', {
          timeOut: 6000,
        });
        console.log('idpermiso', 'entra');
        this.dialogRef.close();
      }
    }
    else {
      this.dialogRef.close();
    }
  }

  limpiarCampos() {
    this.nuevaAutorizacionesForm.reset();
  }

}
