import { Component, OnInit, Inject, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from "@angular/material/paginator";
import * as moment from 'moment';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';

// IMPORTAR COMPONENTES
import { ListarEmpleadoPermisoComponent } from '../../modulos/permisos/listar/listar-empleado-permiso/listar-empleado-permiso.component';
import { MatSelect } from '@angular/material/select';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

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

  @Input() data: any = [];
  @Input() filtroDepa: any = [];


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

  estados: Estado[] = [];

  public ArrayAutorizacionTipos: any = [];
  public nuevoAutorizacionTipos: any = [];
  public gerencia:boolean = false;
  autorizaDirecto: boolean = false;
  InfoListaAutoriza: any = [];
  id_depart: any; 
  
  oculDepa: boolean = true;
  ocultar: boolean = true;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  constructor(
    public restAutorizaciones: AutorizacionService,
    //public restNotiAutorizaciones: NotiAutorizacionesService,
    //public restNotificaciones: NotificacionesService,
    public restDepartamento: DepartamentosService,
    public restCargo: EmplCargosService,
    private restP: PermisosService,
    private realTime: RealTimeService,
    private toastr: ToastrService,
    public restAutoriza: AutorizaDepartamentoService,
    public usuarioDepa: UsuarioService,
    private componente: ListarEmpleadoPermisoComponent,
    private plangeneral: PlanGeneralService,
    public informacion: DatosGeneralesService,
    public configNoti: RealTimeService,
  ) { }

  
  ngOnInit(): void {
    console.log(this.data, 'data', this.data.carga);

    if(this.filtroDepa != '' && this.filtroDepa != undefined){
      this.id_depart = this.data.datosPermiso[0].id_depa;
      this.obtenerAutorizacion();
      this.ocultar = false;

    }else{
      var ListaConteoDepa: any = [];
      this.data.datosPermiso.filter(function(elemento, indice, array) {
        if(ListaConteoDepa.find(p => p.nombre_depa == elemento.nombre_depa) == undefined){
          ListaConteoDepa.push(elemento);
        }
      });

      if(ListaConteoDepa.length < 2){
        this.id_depart = this.data.datosPermiso[0].id_depa;
        this.departamentoChange.depa_autoriza = this.data.datosPermiso[0].nombre_depa;
        this.ocultar = false;
        this.oculDepa = true;
        this.obtenerAutorizacion();
      }else{
        this.oculDepa = false;
        this.ocultar = true;
      }
    }

    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.obtenerDepartamento();
    this.id_empleado_loggin = parseInt(localStorage.getItem('empleado') as string);
    this.BuscarTipoAutorizacion();
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
        }
        
        this.nuevoAutorizacionTipos.forEach(x => {
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
  ChangeDepa(e: any, select: MatSelect) {
    if (e != null && e != undefined) {
      select.value = null;
      select.defaultTabIndex = 0;
      const [departamento] = this.ArrayAutorizacionTipos.filter(o => {
        return o.id_departamento === e
      })
      this.listafiltrada = [];
      this.departamentoChange = departamento;
      this.id_depart = this.departamentoChange.id_departamento;
      this.BuscarTipoAutorizacion();
      return this.obtenerAutorizacion();
    }
  }

  /***********************************************************************************************************
   ** METODOS PARA VALIDAR LAS SOLICITUDES Y FILTRAR LAS SOLICITUDES QUE LE CORRESPONDEN AL USUARIO APROBAR **
   ***********************************************************************************************************/
  lectura: number = 0;
  estado_auto: any;
  listadoDepaAutoriza: any = [];
  nivel_padre: number = 0;
  cont: number = 0;
  mensaje: any;
  listafiltrada: any = [];
  ListaPermisos: any = [];

  //Variables para el metodo de conteo y lista de correos de las solicitudes
  cont_correo: number = 0;
  info_correo: string = '';
  listaCorreosEnviar: any = [];
  num: number = 0; 
  obtenerAutorizacion(){
    this.habilitarprogress = true;
    this.cont_correo = 0;
    this.info_correo = '';
    this.listaCorreosEnviar = [];
    if(this.data.carga === 'multiple'){
      var contador = 0;
      this.ListaPermisos = [];
      this.listafiltrada = [];
      this.mensaje = '';

      this.ListaPermisos = this.data.datosPermiso.filter(i => {
        contador += 1;
        return (i.id_depa == this.id_depart);    
      })

      this.cont = 0;
      if(this.data.datosPermiso.length == contador){
        if(this.ListaPermisos.length != 0){
          this.listadoDepaAutoriza = [];
          this.lectura = 1;
          this.ListaPermisos.forEach(o => {
            this.cont = this.cont + 1;
            this.restAutorizaciones.BuscarAutorizacionPermiso(o.id).subscribe(
              autorizacion => {
                var autorizaciones = autorizacion[0].id_documento.split(',');
                autorizaciones.map((obj: string) => {
                  this.lectura = this.lectura + 1;
                  if (obj != '') {
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
                        this.listadoDepaAutoriza.forEach(item => {
                          if((this.id_empleado_loggin == item.id_empleado) && (autorizaciones.length ==  item.nivel)){
                            this.obtenerPlanificacionHoraria(o.fecha_inicio, o.fecha_final, o.codigo, o);
                            this.listafiltrada.push(o);
                            this.ConfiguracionCorreo(o);
                            return this.ocultar = false;
                          }
                        })

                        
                        if(this.ListaPermisos.length == this.cont){
                          this.habilitarprogress = false;
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
                              this.listafiltrada.sort((a, b) => b.id - a.id);
                            }
                            this.ocultar = false;
                          }
                        }
    
                      });
                    }else{
                      this.habilitarprogress = false;
                      this.ocultar = true;
                    }
    
                  }else{
                    if(autorizaciones.length < 2){
                      //Valida que el usuario que va a realizar la aprobacion le corresponda su nivel y autorice caso contrario se oculta el boton de aprobar.
                      this.restAutoriza.BuscarListaAutorizaDepa(autorizacion[0].id_departamento).subscribe(
                        res => {
                          this.listadoDepaAutoriza = res; 
                          this.listadoDepaAutoriza.forEach(valor => {
                            if((this.id_empleado_loggin == valor.id_empleado) && (autorizaciones.length ==  valor.nivel)){
                              this.obtenerPlanificacionHoraria(o.fecha_inicio, o.fecha_final, o.codigo, o);
                              this.listafiltrada.push(o);
                              this.ConfiguracionCorreo(o);
                              return this.ocultar = false;
                            }
                          });

                          if(this.ListaPermisos.length == this.cont){
                            this.habilitarprogress = false;
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
                                if(ListaSinDuplicadosPendie.find(p=>p.id == elemento.id) == undefined){
                                  ListaSinDuplicadosPendie.push(elemento);
                                }
                              });

                              if(this.listafiltrada.length == cont){
                                this.listafiltrada = [];
                                this.listafiltrada = ListaSinDuplicadosPendie;
                                this.listafiltrada.sort((a, b) => b.id - a.id);
                              }

                              this.ocultar = false;
                            }
                          }
                        }
                      );
                    }
                  }
                });
              },error => {
                this.habilitarprogress = false;
                o.observacion = 'La solicitud tiene problemas con el registro de autorización';
                o.aprobar = 'SI';
                this.listafiltrada.push(o);
                this.ConfiguracionCorreo(o);
              }
            )
          })

          return 
        }else{
          this.habilitarprogress = false;
          this.mensaje = 'No hay solicitudes seleccionadas del departamento de '+this.departamentoChange.depa_autoriza;
          this.ocultar = true;
          return
        }
      }else{
        this.habilitarprogress = false;
        this.mensaje = 'No ha seleccionado solicitudes del departamento de '+this.departamentoChange.depa_autoriza;
        this.ocultar = true;
        return
      }
    }
  }

  listahorario: any = [];
  i: number = 0;
  obtenerPlanificacionHoraria(fecha_i: any, fehca_f: any, codigo: any, solicitud: any){
    var datos = {
      fecha_inicio: fecha_i, 
      fecha_final: fehca_f, 
      codigo: '\''+codigo+'\''
    }

    this.i = 0;
    this.plangeneral.BuscarPlanificacionHoraria(datos).subscribe(res => {
      this.listahorario = res;
      if(this.listahorario.data.length == 0){
        solicitud.observacion = 'No tiene registrado una planificacion';
        return solicitud.aprobar = 'NO';
      }else{
        solicitud.observacion = 'Sin novedad';
        return solicitud.aprobar = 'SI';
      }

    },error => {
      solicitud.observacion = 'No tiene registrado una planificacion';
      return solicitud.aprobar = 'NO';
    });

  }


  /***********************************************************************************************************
   ******************   METODOS PARA INSERTA Y ENVIAR LA APROBACION DE LA SOLICITUD   ************************
   ***********************************************************************************************************/
  resAutorizacion: any = [];
  idNotifica: any = [];
  total: number = 0;
  //Este array permite que se filtre la lista de permisos para quitar los permisos que 
  //si tienen la novedad de no aprobar que no se envien.
  NuevaListaAprobada: any = [];
  a: number;
  no_aprobar: number;
  insertarAutorizacion(form: any) {
    this.a = 0;
    this.no_aprobar = 0;
    this.NuevaListaAprobada = this.listafiltrada.filter(valor => {
      this.a += 1; 
      if(valor.aprobar == 'NO' || valor.aprobar == 'no'){ this.no_aprobar += 1}
      return valor.aprobar == 'SI' || valor.aprobar == 'si';
    });
    
    if(this.listafiltrada.length == this.a ){
      if(this.NuevaListaAprobada.length == 0){
        this.toastr.error("No se han podido aprobar las solicitudes debido a que tiene observaciones que no permiten enviar");
      }else{
        if(this.no_aprobar > 0){
          this.toastr.error("Algunas solicitudes no se enviaron debido algun problema, revisar la observacion de la solicitud");
        }      

        if (this.data.carga === 'multiple') {
          this.NuevaListaAprobada.map(obj => {
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
                }
              })
            }
            else {
              console.log('idpermiso', obj.id);
              this.restP.BuscarDatosAutorizacion(obj.id).subscribe(data => {
                var documento = data[0].empleado_estado;
                this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
                  this.departamentos = res;
                  this.ActualizarDatos(form, documento, obj.id, this.departamentos[0].id_departamento, obj.id_emple_solicita);
                })
              }, err => {
                this.toastr.error("No existe autorizacion en el permiso "+obj.id);
                this.restDepartamento.ConsultarDepartamentoPorContrato(obj.id_cargo).subscribe(res => {
                  this.departamentos = res;
                  this.IngresarDatos(form, obj.id, this.departamentos[0].id_departamento, obj.id_emple_solicita);
                })
              })
            }
          })

        }
        else if (this.data.carga === undefined) {
          this.IngresarDatos(form, this.data.id, form.idDepartamentoF, this.data.id_emple_solicita);
        } 
      }
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
    })
    
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
    }else if (estado_permiso === 2) {
      estado_letras = 'Pre-autorizado';
    }else if (estado_permiso === 3) {
      estado_letras = 'Autorizado';
    }else if (estado_permiso === 4) {
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
        //this.dialogRef.close();
      }
    });
    

    this.total += 1;
    if (this.data.carga === 'multiple') {
      if (this.total === this.NuevaListaAprobada.length) {
        this.FiltroCorreos(this.listaCorreosEnviar, estado_letras);
        this.toastr.success('Operación exitosa.', 'Se autorizo un total de ' + this.NuevaListaAprobada.length + ' permisos.', {
          timeOut: 6000,
        });
        this.CerrarVentanaRegistroNoti();
      }
    }
  }

  ConfiguracionCorreo(solicitud: any){
    this.configNoti.ObtenerConfiguracionEmpleado(solicitud.id_contrato).subscribe(res_config => {
      if(res_config[0].permiso_mail == true){
        this.listaCorreosEnviar.push(solicitud);
      }
    });
  }

  // METODO PARA CONTAR NUMERO DE CORREOS A ENVIARSE
  listapermisosActualizada: any = [];
  CorreosUsuariosAutorizanDepa: string = '';
  FiltroCorreos(permisos: any, estado_letras) {
    this.listapermisosActualizada = [];
    this.CorreosUsuariosAutorizanDepa = '';
    var nuevalista: any = [];
    permisos.forEach(function(elemento, indice, array) {
      if(nuevalista.find(p=>p.id_emple_solicita == elemento.id_emple_solicita) == undefined)
      {
        return nuevalista.push(elemento);
      }
    }); 

    //Correos de los usuarios que autorizan las solicitudes
    this.listadoDepaAutoriza.forEach(valor => {
      if(this.CorreosUsuariosAutorizanDepa == ''){
        this.CorreosUsuariosAutorizanDepa = valor.correo;
      }else{
        this.CorreosUsuariosAutorizanDepa = this.CorreosUsuariosAutorizanDepa + ', ' + valor.correo;
      }
    });

    //Correos de las solicitudes de los usuarios
    nuevalista.forEach(solicitud => {
      this.cont_correo = this.cont_correo + 1;
      if (this.info_correo === '') {
        this.info_correo = solicitud.correo;
      }
      else {
        this.info_correo = this.info_correo + ', ' + solicitud.correo;
      }
    });

   
    this.info_correo = this.info_correo + ', ' + this.CorreosUsuariosAutorizanDepa;


    this.listafiltrada.forEach(item => {
      if(item.aprobar == "SI"){
        item.estado = estado_letras;
      }
    });

    this.EnviarCorreo(this.info_correo, this.listafiltrada);

  }

  // METODO USADO PARA ENVIAR COMUNICADO POR CORREO
  EnviarCorreo(correos: any, permisos: any) {
    let datosCorreo = {
      id_envia: this.id_empleado_loggin,
      mensaje: 'Listado de Solicitudes',
      correo: correos,
      asunto: 'Aprobacion multiple de solicitudes',
    }

    var datosEnvia: any = {
      movil: false,
      datosCorreo: datosCorreo,
      solicitudes: permisos
    };

    console.log('datosEnvia: ',datosEnvia);
    
    this.realTime.EnviarCorreoMultiple(datosEnvia).subscribe(envio => {
      if (envio.message === 'ok') {
        this.toastr.success('Mensaje enviado exitosamente.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Ups !!! algo salio mal', 'No fue posible enviar correo electrónico.', {
          timeOut: 6000,
        });
      }
    });
    
  }

  limpiarCampos() {
    this.nuevaAutorizacionesForm.reset();
  }

  formato_fecha: string = "DD/MM/YYYY";
  CerrarVentanaRegistroNoti() {
    this.limpiarCampos();
    this.componente.multiple = false;
    this.componente.lista_permisos = true;
    this.componente.lista_autorizados = false;
    this.componente.filtroDepa = undefined;
    this.componente.filtroUsuario = undefined;
    this.componente.filtroEstado = undefined;
    this.componente.BuscarHora(this.formato_fecha);
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

}