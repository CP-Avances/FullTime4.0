import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit,Input } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatRadioChange } from '@angular/material/radio';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { GenerosService } from 'src/app/servicios/usuarios/catGeneros/generos.service';
import { EstadoCivilService } from 'src/app/servicios/usuarios/catEstadoCivil/estado-civil.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { RolesService } from 'src/app/servicios/configuracion/parametrizacion/catRoles/roles.service';
import { LoginService } from 'src/app/servicios/login/login.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { VerEmpleadoComponent } from '../../datos-empleado/ver-empleado/ver-empleado.component';
import { ChangeDetectorRef } from '@angular/core';
import { Console } from 'console';

@Component({
  selector: 'app-editar-empleado',
  standalone: false,
  templateUrl: './editar-empleado.component.html',
  styleUrls: ['./editar-empleado.component.css']
})

export class EditarEmpleadoComponent implements OnInit {
  ips_locales: any = '';

  @Input() empleado: any;
  @Input() pagina:any;

  nacionalidades: any = [];
  private idNacionalidad: number;

  roles: any = [];
  usuario: any = [];
  identificacion ="Cedula"

  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;
  terceroFormGroup: FormGroup;

  NacionalidadControl = new FormControl('', Validators.required);
  filteredOptions: Observable<any[]>;
  idEmpleado: number;

  empleado_inicia: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public componentev: VerEmpleadoComponent,
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    private rest: EmpleadoService,
    private user: UsuarioService,
    private rol: RolesService,
    public router: Router,
    public validar: ValidacionesService,
    public loginService: LoginService,
    public generoS: GenerosService,
    public estadoS: EstadoCivilService,
    private restParametros: ParametrosService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.empleado_inicia = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.idEmpleado = this.empleado.id;
    this.CargarRoles();
    this.VerificarFormulario();
    this.ObtenerNacionalidades();
    this.ObtenerEstadoCivil();
    this.ObtenerGeneros();
    this.VerificarCodigo();
    this.CargarEstadoValidacionCedula();
  }

  // METODO PARA FILTRAR DATOS DE NACIONALIDAD
  private _filter(value: any): any {
    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return this.nacionalidades.filter((nacionalidad: any) =>
        nacionalidad.nombre.toLowerCase().includes(filterValue)
      );
    }
    return this.nacionalidades;
  }


  // METODO PARA LISTAR ROLES
  CargarRoles() {
    this.rol.BuscarRoles().subscribe(data => {
      this.roles = data;
    });
  }

  // METODO PARA VERIFICAR FORMULARIO
  VerificarFormulario() {
    this.primeroFormGroup = this._formBuilder.group({
      apellidoForm: [''],
      nombreForm: [''],
      codigoForm: [''],
      cedulaForm: ['', Validators.required],
      emailForm: ['', Validators.email],
      fechaForm: ['', Validators.required],
      tipoIdentificacionForm: ['', Validators.required],
    });
    this.segundoFormGroup = this._formBuilder.group({
      nacionalidadForm: this.NacionalidadControl,
      estadoCivilForm: [0, Validators.required],
      domicilioForm: [''],
      telefonoForm: [''],
      generoForm: [0, Validators.required],
      estadoForm: ['', Validators.required],
    });
    this.terceroFormGroup = this._formBuilder.group({
      userForm: ['', Validators.required],
      rolForm: ['', Validators.required],
      partidaForm: [''],
    });
  }

  // METODO PARA LISTAR NACIONALIDADES
  ObtenerNacionalidades() {
    this.rest.BuscarNacionalidades().subscribe(res => {
      this.nacionalidades = res;
      this.ObtenerEmpleado();
      console.log(this.nacionalidades)
      this.filteredOptions = this.NacionalidadControl.valueChanges.pipe(
        startWith(''),
        map((value: any) => this._filter(value))
      );

    });
  }

  estados_civil: any = []
  // METODO PARA LISTAR NACIONALIDADES
  ObtenerEstadoCivil() {
    this.estadoS.ListarEstadoCivil().subscribe(res => {
      this.estados_civil = res;
      this.ObtenerEmpleado();

    });
  }

  // METODO PARA LISTAR NACIONALIDADES
  generos: any = []

  ObtenerGeneros() {
    this.generoS.ListarGeneros().subscribe(res => {
      this.generos = res;
      this.ObtenerEmpleado();

    });
  }

  // CARGAR DATOS DE EMPLEADO Y USUARIO
  ObtenerEmpleado() {
    const { apellido, identificacion, codigo, correo, domicilio, estado_civil, estado, fecha_nacimiento, genero,
      id, id_nacionalidad, nombre, telefono, numero_partida_individual, tipo_identificacion } = this.empleado;
      this.identificacion = tipo_identificacion === 1 ? 'Cedula' : 'Pasaporte';      

    this.primeroFormGroup.setValue({
      apellidoForm: apellido,
      codigoForm: codigo,
      nombreForm: nombre,
      cedulaForm: identificacion,
      emailForm: correo,
      fechaForm: fecha_nacimiento,
      tipoIdentificacionForm: this.identificacion,
    });

    this.segundoFormGroup.setValue({
      nacionalidadForm: this.nacionalidades.filter((o: any) => { return id_nacionalidad === o.id }).map((o: any) => { return o.nombre }),
      estadoCivilForm: estado_civil,
      domicilioForm: domicilio,
      telefonoForm: telefono,
      generoForm: genero,
      estadoForm: estado,
    });

    // METODO DE BUSQUEDA DE DATOS DE USUARIO
    this.user.BuscarDatosUser(id).subscribe(res => {
      this.usuario = [];
      this.usuario = res;
      this.terceroFormGroup.patchValue({
        rolForm: this.usuario[0].id_rol,
        userForm: this.usuario[0].usuario,
        partidaForm: numero_partida_individual || ''
      });
    });
  }

  // METODO PARA VALIDAR INGRESO MANUAL O AUTOMATICO DE CODIGO DE USUARIO
  datosCodigo: any = [];
  escritura = false;
  cedula: boolean = false;
  VerificarCodigo() {
    this.datosCodigo = [];
    this.rest.ObtenerCodigo().subscribe(datos => {
      this.datosCodigo = datos[0];
      if (this.datosCodigo.automatico === true) {
        this.escritura = true;
      }
      else if (this.datosCodigo.identificacion === true) {
        this.cedula = true;
        this.escritura = true;
        this.primeroFormGroup.patchValue({
          codigoForm: this.empleado.identificacion
        })
      }
      else {
        this.escritura = false;

      }
    }, error => {
      this.toastr.info('Configurar ingreso de código de usuarios.', '', {
        timeOut: 6000,
      });
      this.router.navigate(['/codigo/']);
      this.Cancelar(2);
    });
  }

  // METODO PARA ACTUALIZAR REGISTRO DE EMPLEADO
  ActualizarEmpleado(form1: any, form2: any, form3: any) {
    // BUSCA EL ID DE LA NACIONALIDAD ELEGIDA EN EL AUTOCOMPLETADO
    this.nacionalidades.forEach((obj: any) => {
      if (form2.nacionalidadForm == obj.nombre) {
        console.log(obj);
        this.idNacionalidad = obj.id;
      }
    });
    // REALIZAR UN CAPITAL LETTER A LOS NOMBRES
    var NombreCapitalizado: any;
    let nombres = form1.nombreForm.split(' ');
    if (nombres.length > 1) {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
      NombreCapitalizado = name1 + ' ' + name2;
    }
    else {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      var NombreCapitalizado = name1
    }

    // REALIZAR UN CAPITAL LETTER A LOS APELLIDOS
    var ApellidoCapitalizado: any;
    let apellidos = form1.apellidoForm.split(' ');
    if (apellidos.length > 1) {
      let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
      let lastname2 = apellidos[1].charAt(0).toUpperCase() + apellidos[1].slice(1);
      ApellidoCapitalizado = lastname1 + ' ' + lastname2;
    }
    else {
      let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
      ApellidoCapitalizado = lastname1
    }

    // CAPTURA DE DATOS DE FORMULARIO
    let empleado = {
      id_nacionalidad: this.idNacionalidad,
      fec_nacimiento: form1.fechaForm,
      esta_civil: form2.estadoCivilForm,
      domicilio: form2.domicilioForm,
      apellido: ApellidoCapitalizado,
      telefono: form2.telefonoForm,
      identificacion: form1.cedulaForm,
      nombre: NombreCapitalizado,
      genero: form2.generoForm,
      correo: form1.emailForm,
      estado: form2.estadoForm,
      codigo: form1.codigoForm,
      user_name: this.user_name,
      numero_partida_individual: form3.partidaForm === '' ? null : form3.partidaForm,
      tipo_identificacion: form1.tipoIdentificacionForm === 'Cedula' ? 1 : 2,
      ip: this.ip, ip_local: this.ips_locales,
    };

    // CONTADOR 0 EL REGISTRO SE REALIZA UNA SOLA VEZ, CONTADOR 1 SE DIO UN ERROR Y SE REALIZA NUEVAMENTE EL PROCESO
    if (this.contador === 0) {
      this.rest.ActualizarEmpleados(empleado, this.idEmpleado).subscribe(
        (response: any) => {
          if (response.message === 'Registro actualizado.') {
            this.ActualizarUser(form3, form1, form2);
            this.Cancelar(2);
          }
        },
        error => {
          this.toastr.error(error.error.message, 'Upss!!! algo salió mal.', {
            timeOut: 6000,
          });
          this.Cancelar(2);
        }
      );
    }
    else {
      this.ActualizarUser(form3, form1, form2);
      this.Cancelar(2);
    }
  }

  // METODO PARA ACTUALIZAR INFORMACION DE USUARIO
  contador: number = 0;
  ActualizarUser(form3: any, form1: any, form2: any) {
    let estado_user: boolean = false;
    if (form2.estadoForm === 1) {
      estado_user = true;
    }
    this.contador = 0;
    let dataUser = {
      id_empleado: this.idEmpleado,
      usuario: form3.userForm,
      id_rol: form3.rolForm,
      estado: estado_user,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.user.ActualizarDatos(dataUser).subscribe(data => {
      if (data.message === 'error') {
        this.toastr.error('Nombre de usuario ya se encuentra registrado.', 'Upss!!! algo salio mal.', {
          timeOut: 6000,
        });
        this.contador = 1;
      }
      else {
        this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
          timeOut: 6000,
        });
        this.ActualizarCodigo(form1.codigoForm);
        this.Navegar(form3, estado_user);
        this.contador = 0;
      }
    });
  }

  // METODO PARA VALIDAR NAVEGABILIDAD
  Navegar(form3: any, estado: any) {
    if (this.idEmpleado === this.empleado_inicia) {
      if (form3.userForm != this.usuario[0].usuario || form3.rolForm != this.usuario[0].id_rol
        || estado != this.usuario[0].estado
      ) {
        this.loginService.logout();
      }
      else {
        this.LimpiarCampos();
      }
    }
    else {
      this.LimpiarCampos();
    }
  }

  // METODO PARA ACTUALIZAR CODIGO DE USUARIO
  ActualizarCodigo(codigo: any) {
    if (this.datosCodigo.automatico === true) {
      let dataCodigo = {
        valor: codigo,
        id: 1,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales,
      }
      this.rest.ActualizarCodigo(dataCodigo).subscribe(res => {
      })
    }
  }

  // METODO DE VALIDACION DE INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO DE VALIDACION DE INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    const patron = /^[a-zA-Z\s]*$/
    if (!patron.test(tecla)) {
      this.toastr.info('No se admite datos numéricos o caracteres especiales.', 'Usar solo letras.', {
        timeOut: 6000,
      });
      return false;
    }
  }

  IngresarSoloLetrasNumeros(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL CONJUNTO DE CARACTERES PERMITIDOS.
    const patron = /^[a-zA-Z0-9]*$/;

    if (!patron.test(tecla)) {
      this.toastr.info('No se admite caracteres especiales', 'Usar solo letras y números.', {
        timeOut: 6000,
      });
      return false;
    }
  }

  // METODO PARA COLOCAR EL CODIGO SIMILAR AL CAMPO CEDULA
  LlenarCodigo(form1: any) {
    if (this.cedula) {
      let codigo: number = form1.cedulaForm;
      this.primeroFormGroup.patchValue({
        codigoForm: codigo
      })
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.primeroFormGroup.reset();
    this.segundoFormGroup.reset();
    this.terceroFormGroup.reset();

  }

  // METODO PARA CERRAR VENTANA
  Cancelar(opcion: any) {
    this.componentev.ver_empleado = true;

    if (this.pagina === 'ver-empleado') {
      this.componentev.editar_empleado = false;

      if (opcion === 2) {
        this.componentev.VerEmpleado(this.componentev.formato_fecha);

        setTimeout(() => {
          const divMapa = document.getElementById('geolocalizacion');

          if (divMapa) {
            var empleado = this.componentev.empleadoUno[0].nombre + ' ' + this.componentev.empleadoUno[0].apellido;
            this.componentev.MapGeolocalizar(
              this.componentev.empleadoUno[0].latitud,
              this.componentev.empleadoUno[0].longitud,
              empleado
            );
          }
        }, 200);
      }
    }
  }

  //METODO QUE DETECTA EL CAMBIO EN TIPO DE IDENTIFICACION DE CEDULA A PASAPORTE
  CambiarIdentificacion(ob: MatRadioChange) {
    this.identificacion = ob.value;
    const valor = this.primeroFormGroup.get('cedulaForm')?.value;
  
    if (this.identificacion === 'Cedula') {
      this.ValidarCedula({ cedulaForm: valor }); 
    } else {
      this.cedulaValida = true;
      this.pasaporteValida = true;
      this.primeroFormGroup.get('cedulaForm')?.setErrors(null); 
    }
  }

  //METODO QUE VALIDA LA CEDULA POR ALGORITMO
  cedulaValida: boolean = false;
  ValidarCedula(cedula: any) {
    if (!this.validarCedulaActiva) {
      this.cedulaValida = true;
      this.primeroFormGroup.controls['cedulaForm'].setErrors(null);
      return;
    }
    const inputElement = cedula.cedulaForm;
    const cad: string = inputElement;
    let total: number = 0;
    const longitud: number = cad.length;
    const longcheck: number = longitud - 1;
  
    if (longitud < 10) {
      this.cedulaValida = false;
      this.cdRef.detectChanges();
      this.primeroFormGroup.controls['cedulaForm'].setErrors({ minlength: true });
      return;
    }
  
    if (cad !== "" && longitud === 10) {
      for (let i = 0; i < longcheck; i++) {
        let num = parseInt(cad.charAt(i), 10);
        if (isNaN(num)) return;
  
        if (i % 2 === 0) {
          num *= 2;
          if (num > 9) num -= 9;
        }
        total += num;
      }
  
      total = total % 10 ? 10 - (total % 10) : 0;
  
      if (parseInt(cad.charAt(longcheck), 10) === total) {
        this.cedulaValida = true;
        this.primeroFormGroup.controls['cedulaForm'].setErrors(null); 
      } else {
        this.cedulaValida = false;
        this.cdRef.detectChanges();
        this.primeroFormGroup.controls['cedulaForm'].setErrors({ invalidCedula: true });
      }
    }
  }
  

  //METODO PARA OBTENER EL  DETALLE DEL PARAMETRO VALIDAR CEDULA (ACTIVADO/DESACTIVADO)
  validarCedulaActiva: boolean = true;
  CargarEstadoValidacionCedula() {
    this.restParametros.BuscarDetallesParametros().subscribe(detalles => {
      const parametro36 = detalles.find((d: any) => d.id_parametro === 36);
      this.validarCedulaActiva = parametro36?.descripcion?.toLowerCase() !== 'no';
    });
  }

  pasaporteValida:boolean=false;
  ValidarPasaporte(pasaporte:any){

  }

}
