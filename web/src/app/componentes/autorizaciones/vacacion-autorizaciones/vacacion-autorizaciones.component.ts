import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';

import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';

interface Orden {
  valor: number
}

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-vacacion-autorizaciones',
  templateUrl: './vacacion-autorizaciones.component.html',
  styleUrls: ['./vacacion-autorizaciones.component.css']
})
export class VacacionAutorizacionesComponent implements OnInit {

  // idDocumento = new FormControl('', Validators.required);
  TipoDocumento = new FormControl('');
  orden = new FormControl(0, Validators.required);
  estado = new FormControl('', Validators.required);
  idCatNotificacion = new FormControl('', Validators.required);
  idCatNotiAutorizacion = new FormControl('', Validators.required);
  idDepartamento = new FormControl('');

  public nuevaAutorizacionesForm = new FormGroup({
    // idDocumentoF: this.idDocumento,
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
    private restV: VacacionesService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<VacacionAutorizacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data, 'data_vacaciones');
    this.id_empleado_loggin = parseInt(localStorage.getItem('empleado') as string);
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.obtenerDepartamento();
    this.BuscarTipoAutorizacion();

    if (this.data.datosVacacion.length == 0) {
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
      const [departamento] = this.ArrayAutorizacionTipos.filter(o => {
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
  ListaVacaciones: any = [];
  obtenerAutorizacion() {
    if (this.data.carga === 'multiple') {
      var contador = 0;
      this.ListaVacaciones = [];
      this.listafiltrada = [];
      this.mensaje = '';
      this.ListaVacaciones = this.data.datosVacacion.filter(i => {
        contador += 1;
        return i.id_depa == this.id_depart;
      })

      this.cont = 0;
      if (this.data.datosVacacion.length == contador) {
        if (this.ListaVacaciones.length != 0) {
          this.ListaVacaciones.forEach(o => {
            this.cont = this.cont + 1;
            this.restAutorizaciones.getUnaAutorizacionByVacacionRest(o.id).subscribe(
              autorizacion => {
                var autorizaciones = autorizacion[0].id_documento.split(',');
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

                        if (this.ListaVacaciones.length == this.cont) {
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

                        if (this.ListaVacaciones.length == this.cont) {
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


  insertarAutorizacion(form) {
    if (this.data.carga === 'multiple') {
      this.listafiltrada.map(obj => {
        if (obj.estado === 'Pre-autorizado') {
          this.restV.BuscarDatosAutorizacion(obj.id).subscribe(data => {
            var documento = data[0].empleado_estado;
            this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
              this.departamentos = res;
              this.ActualizarDatos(form, documento, obj.id, this.departamentos[0].id_departamento, obj.id_emple_solicita);
            })
          })
        }
        else {
          this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
            this.departamentos = res;
            this.IngresarDatos(form, obj.id, this.departamentos[0].id_departamento, obj.id_emple_solicita);
          })
        }
      })
    }
    else if (this.data.carga === undefined) {
      this.IngresarDatos(form, this.data.id, form.idDepartamentoF, this.data.id_empleado);
    }
  }

  IngresarDatos(form, id_vacacion: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para ingresar una autorización
    let newAutorizaciones = {
      orden: form.ordenF,
      estado: form.estadoF,
      id_departamento: id_departamento,
      id_permiso: null,
      id_vacacion: id_vacacion,
      id_hora_extra: null,
      id_documento: localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      id_plan_hora_extra: null,
    }
    this.restAutorizaciones.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
      this.EditarEstadoVacacion(form, id_vacacion, empleado_solicita, id_departamento);
    }, error => { })
  }

  ActualizarDatos(form, documento, id_vacacion: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para actualizar la autorización de acuerdo al permiso
    let newAutorizacionesM = {
      id_documento: documento + localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      estado: form.estadoF,
      id_vacacion: id_vacacion,
    }
    /*  this.restAutorizaciones.PutEstadoAutoVacacion(newAutorizacionesM).subscribe(resA => {
        this.EditarEstadoVacacion(form, id_vacacion, empleado_solicita, id_departamento);
      })*/
  }

  resVacacion: any = [];
  contador: number = 0;
  EditarEstadoVacacion(form, id_vacacion, id_empleado, id_departamento) {
    let datosVacacion = {
      estado: form.estadoF,
      id_vacacion: id_vacacion,
      id_rece_emp: id_empleado,
      id_depa_send: id_departamento
    }
    this.restV.ActualizarEstado(id_vacacion, datosVacacion).subscribe(respon => {
      this.resVacacion = respon
      console.log(this.resVacacion);
      var f = new Date();
      var estado_letras: string = '';
      if (form.estadoF === 1) {
        estado_letras = 'Pendiente';
      }
      else if (form.estadoF === 2) {
        estado_letras = 'Pre-autorizado';
      }
      else if (form.estadoF === 3) {
        estado_letras = 'Autorizado';
      }
      else if (form.estadoF === 4) {
        estado_letras = 'Negado';
      }
      let notificacion = {
        id: null,
        id_send_empl: this.id_empleado_loggin,
        id_receives_empl: id_empleado,
        id_receives_depa: id_departamento,
        estado: estado_letras,
        create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
        id_vacaciones: id_vacacion,
        id_permiso: null
      }
      this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(res => {
        this.NotifiRes = res;
        console.log(this.NotifiRes);
        notificacion.id = this.NotifiRes._id;
        if (this.NotifiRes._id > 0 && this.resVacacion.notificacion === true) {
          this.restV.EnviarNotificacionRealTime(notificacion);
        }
      });
    });
    console.log('contador', this.contador);
    this.contador = this.contador + 1;
    if (this.data.carga === 'multiple') {
      console.log('arreglo', this.listafiltrada.length);
      if (this.contador === this.listafiltrada.length) {
        this.toastr.success('Operación exitosa.', 'Se autorizo un total de ' + this.listafiltrada.length + ' solicitudes de vacaciones.', {
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

  Habilitado: boolean = true;
  obtenerDepartamento() {
    if (this.data.carga === 'multiple') {
      this.nuevaAutorizacionesForm.patchValue({
        ordenF: 1,
        estadoF: '',
      });
      this.Habilitado = false;
    }
    else {
      this.restDepartamento.ConsultarDepartamentoPorContrato(this.data.id_empl_cargo).subscribe(res => {
        this.departamentos = res;
        this.nuevaAutorizacionesForm.patchValue({
          ordenF: 1,
          estadoF: '',
          idDepartamentoF: this.departamentos[0].id_departamento
        })
      })
    }
  }

  limpiarCampos() {
    this.nuevaAutorizacionesForm.reset();
  }
}
