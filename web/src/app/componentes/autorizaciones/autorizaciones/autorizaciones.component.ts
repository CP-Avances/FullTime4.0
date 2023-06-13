import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

interface Orden {
  valor: number
}

interface Estado {
  id: number,
  nombre: string
}

interface Documento {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-autorizaciones',
  templateUrl: './autorizaciones.component.html',
  styleUrls: ['./autorizaciones.component.css'],
})
export class AutorizacionesComponent implements OnInit {

  // idDocumento = new FormControl('', Validators.required);
  orden = new FormControl(0, Validators.required);
  estado = new FormControl('', Validators.required);
  idDepartamento = new FormControl('');

  public nuevaAutorizacionesForm = new FormGroup({
    // idDocumentoF: this.idDocumento,
    ordenF: this.orden,
    estadoF: this.estado,
    idDepartamentoF: this.idDepartamento
  });

  Habilitado: boolean = true;
  notificacion: any = [];
  notiAutrizaciones: any = [];
  departamentos: any = [];

  id_empleado_loggin: number;
  FechaActual: any;
  NotifiRes: any;

  ordenes: Orden[] = [
    { valor: 1 },
    { valor: 2 },
    { valor: 3 },
    { valor: 4 },
    { valor: 5 }
  ];

  estados: Estado[] = [];

  public ArrayAutorizacionTipos: any = [];
  public nuevoAutorizacionTipos: any = [];
  public gerencia:boolean = false;
  autorizaDirecto: boolean = false;
  InfoListaAutoriza: any = [];
  id_depart: any; 
  
  oculDepa: boolean = true;
  ocultar: boolean = true;

  constructor(
    public restAutorizaciones: AutorizacionService,
    // public restNotiAutorizaciones: NotiAutorizacionesService,
    // public restNotificaciones: NotificacionesService,
    public restDepartamento: DepartamentosService,
    public restCargo: EmplCargosService,
    private restP: PermisosService,
    private realTime: RealTimeService,
    private toastr: ToastrService,
    public restAutoriza: AutorizaDepartamentoService,
    public usuarioDepa: UsuarioService,
    public dialogRef: MatDialogRef<AutorizacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data, 'data', this.data.carga);
    
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.obtenerDepartamento();
    this.id_empleado_loggin = parseInt(localStorage.getItem('empleado') as string);
    this.BuscarTipoAutorizacion();

    if(this.data.datosPermiso.length == 0 ){
      this.toastr.error("No ha seleccionado solicitudes para aprobar");
    }

  }

  BuscarTipoAutorizacion(){
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

      if(i == this.ArrayAutorizacionTipos.length){
        if(this.nuevoAutorizacionTipos.length < 2){
          this.oculDepa = true;
          this.id_depart = this.nuevoAutorizacionTipos[0].id_departamento;
          this.obtenerAutorizacion();
        }else{
          this.oculDepa = false;
        }

        this.nuevoAutorizacionTipos.filter(x => {
          if(x.nombre == 'GERENCIA' && x.estado == true){
            console.log('entro en gerencia');
            this.gerencia = true;
            this.autorizaDirecto = false;
            this.InfoListaAutoriza = x;
            if(x.autorizar == true){
              this.estados = [
                { id: 3, nombre: 'Autorizado' },
                { id: 4, nombre: 'Negado' }
              ];
            }else if(x.preautorizar == true){
              this.estados = [
                { id: 2, nombre: 'Pre-autorizado' },
                { id: 4, nombre: 'Negado'}
              ];
            }
          }
          else if((this.gerencia == false) && (x.estado == true) && (x.id_departamento == this.id_depart)){
            console.log('esta fuera de gerencia');
            this.autorizaDirecto = true;
            this.InfoListaAutoriza = x;
            if(x.autorizar == true){
            this.estados = [
              { id: 3, nombre: 'Autorizado' },
              { id: 4, nombre: 'Negado' }
            ];
          }else if(x.preautorizar == true){
            this.estados = [
              { id: 2, nombre: 'Pre-autorizado' },
              { id: 4, nombre: 'Negado'}
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
  ListaPermisos: any = [];
  obtenerAutorizacion(){
    if(this.data.carga === 'multiple'){
      var contador = 0;
      this.ListaPermisos = [];
      this.listafiltrada = [];
      this.mensaje = '';
      this.ListaPermisos = this.data.datosPermiso.filter(i => {
        contador += 1;
        return i.id_depa == this.id_depart;    
      })

      this.cont = 0;
      if(this.data.datosPermiso.length == contador){
        if(this.ListaPermisos.length != 0){
          this.ListaPermisos.forEach(o => {
            this.cont = this.cont + 1;
            this.restAutorizaciones.BuscarAutorizacionPermiso(o.id).subscribe(
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
    
                    if((this.estado_auto === 'Pendiente') || (this.estado_auto === 'Preautorizado')){
                      //Valida que el usuario que va a realizar la aprobacion le corresponda su nivel y autorice caso contrario se oculta el boton de aprobar.
                      this.restAutoriza.BuscarListaAutorizaDepa(autorizacion[0].id_departamento).subscribe(res => {
                        this.listadoDepaAutoriza = res;
                        this.listadoDepaAutoriza.filter(item => {
                          this.nivel_padre = item.nivel_padre;
                          if((this.id_empleado_loggin == item.id_contrato) && (autorizaciones.length ==  item.nivel)){
                            this.listafiltrada.push(o);
                            return this.ocultar = false;
                          }
                        })
  
                        if(this.ListaPermisos.length == this.cont){
                          if(this.listafiltrada.length == 0){
                            this.mensaje = 'Las solicitudes seleccionadas del departamento de '+this.departamentoChange.depa_autoriza+' no corresponde a su nivel de aprobación';
                            this.ocultar = true;
                            return
                          }else{

                             //Listado para eliminar el usuario duplicado
                            var ListaSinDuplicadosPendie: any = [];
                            var cont = 0;
                            this.listafiltrada.forEach(function(elemento, indice, array) {
                              cont = cont + 1;
                              if(ListaSinDuplicadosPendie.find(p=>p.id == elemento.id) == undefined)
                              {
                                ListaSinDuplicadosPendie.push(elemento);
                              }
                            });

                            if(this.listafiltrada.length == cont){
                              this.listafiltrada = [];
                              this.listafiltrada = ListaSinDuplicadosPendie;
                            }

                            this.ocultar = false;
                          }
                        }
    
                      });
                    }else{
                      this.ocultar = true;
                    }
    
                  }else{
                    if(autorizaciones.length < 2){
                      //Valida que el usuario que va a realizar la aprobacion le corresponda su nivel y autorice caso contrario se oculta el boton de aprobar.
                      this.restAutoriza.BuscarListaAutorizaDepa(autorizacion[0].id_departamento).subscribe(res => {
                      this.listadoDepaAutoriza = res;
                      this.listadoDepaAutoriza.filter(item => {
                        if((this.id_empleado_loggin == item.id_contrato) && (autorizaciones.length ==  item.nivel)){
                          this.listafiltrada.push(o);
                          return this.ocultar = false;
                        }
                      })
  
                      if(this.ListaPermisos.length == this.cont){
                        if(this.listafiltrada.length == 0){
                          this.mensaje = 'Las solicitudes seleccionadas del departamento de '+this.departamentoChange.depa_autoriza+' no corresponde a su nivel de aprobación';
                          this.ocultar = true;
                          return
                        }else{

                          //Listado para eliminar el usuario duplicado
                          var ListaSinDuplicadosPendie: any = [];
                          var cont = 0;
                          this.listafiltrada.forEach(function(elemento, indice, array) {
                            cont = cont + 1;
                            if(ListaSinDuplicadosPendie.find(p=>p.id == elemento.id) == undefined)
                            {
                              ListaSinDuplicadosPendie.push(elemento);
                            }
                          });

                          if(this.listafiltrada.length == cont){
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
        }else{
          this.mensaje = 'No hay solicitudes seleccionadas del departamento de '+this.departamentoChange.depa_autoriza;
          this.ocultar = true;
          return
        }
      }else{
        this.mensaje = 'No ha seleccionado solicitudes del departamento de '+this.departamentoChange.depa_autoriza;
        this.ocultar = true;
        return
      }
    }
  }

  resAutorizacion: any = [];
  idNotifica: any = [];
  contador: number = 1;
  insertarAutorizacion(form) {
    if (this.data.carga === 'multiple') {
      this.listafiltrada.map(obj => {
        if (obj.estado === 'Pre-autorizado') {
          this.restP.BuscarDatosAutorizacion(obj.id).subscribe(data => {
            var documento = data[0].empleado_estado;
            this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
              this.departamentos = res;
              this.ActualizarDatos(form, documento, obj.id, this.departamentos[0].id_departamento, obj.id_emple_solicita);
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
          console.log('idpermiso', obj.id);
          this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
            this.departamentos = res;
            this.IngresarDatos(form, obj.id, this.departamentos[0].id_departamento, obj.id_emple_solicita);
          })
        }
      })
    }
    else if (this.data.carga === undefined) {
      this.IngresarDatos(form, this.data.id, form.idDepartamentoF, this.data.id_emple_solicita);
    }
  }

  IngresarDatos(form, id_permiso: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para ingresar una autorización
    let newAutorizaciones = {
      orden: form.ordenF,
      estado: form.estadoF,
      id_departamento: id_departamento,
      id_permiso: id_permiso,
      id_vacacion: null,
      id_hora_extra: null,
      id_documento: localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      id_plan_hora_extra: null,
    }
    this.restAutorizaciones.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
      this.EditarEstadoPermiso(id_permiso, id_departamento, empleado_solicita, form.estadoF);
    }, error => { })
  }

  ActualizarDatos(form, documento, id_permiso: number, id_departamento: number, empleado_solicita: number) {
    // Arreglo de datos para actualizar la autorización de acuerdo al permiso
    let newAutorizacionesM = {
      id_documento: documento + localStorage.getItem('empleado') as string + '_' + form.estadoF + ',',
      estado: form.estadoF,
      id_permiso: id_permiso,
    }
    this.restAutorizaciones.PutEstadoAutoPermisoMultiple(newAutorizacionesM).subscribe(resA => {
      this.EditarEstadoPermiso(id_permiso, id_departamento, empleado_solicita, form.estadoF);
    })
  }

  obtenerDepartamento() {
    if (this.data.carga === 'multiple') {
      this.nuevaAutorizacionesForm.patchValue({
        ordenF: 1,
        estadoF: '',
      });
      this.Habilitado = true;
    }

    else if (this.data.carga === undefined) {
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

  resEstado: any = [];
  idNoti: any = [];
  EditarEstadoPermiso(id_permiso, id_departamento, id_empleado, estado_permiso) {
    let datosPermiso = {
      estado: estado_permiso,
      id_permiso: id_permiso,
      id_departamento: id_departamento,
      id_empleado: id_empleado
    }
    // Actualizar estado del permiso
    var estado_letras: string = '';
    if (estado_permiso === 1) {
      estado_letras = 'Pendiente';
    }
    else if (estado_permiso === 2) {
      estado_letras = 'Pre-autorizado';
    } else if (estado_permiso === 3) {
      estado_letras = 'Autorizado';
    }
    else if (estado_permiso === 4) {
      estado_letras = 'Negado';
    }
    this.restP.ActualizarEstado(id_permiso, datosPermiso).subscribe(respo => {
      this.resEstado = [respo];
      var f = new Date();
      let notificacion = {
        id: null,
        id_send_empl: this.id_empleado_loggin,
        id_receives_empl: id_empleado,
        id_receives_depa: id_departamento,
        estado: estado_letras,
        create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
        id_permiso: id_permiso,
        id_vacaciones: null,
        id_hora_extra: null
      }
      // Enviar la respectiva notificación de cambio de estado del permiso
      this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(res => {
        this.NotifiRes = res;
        notificacion.id = this.NotifiRes._id;
        if (this.NotifiRes._id > 0 && this.resEstado[0].notificacion === true) {
          this.restP.EnviarNotificacionRealTime(notificacion);
        }
      });
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close();
      }
    });
    console.log('contador', this.contador);
    this.contador = this.contador + 1;
    if (this.data.carga === 'multiple') {
      console.log('arreglo', this.data.datosPermiso.length);
      if (this.contador === this.data.datosPermiso.length) {
        this.toastr.success('Operación Exitosa', 'Se autorizo un total de ' + this.data.datosPermiso.length + ' permisos.', {
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

  CerrarVentanaRegistroNoti() {
    this.limpiarCampos();
    this.dialogRef.close();
  }

}
