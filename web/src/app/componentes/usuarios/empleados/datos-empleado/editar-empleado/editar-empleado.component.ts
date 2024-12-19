import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { RolesService } from 'src/app/servicios/configuracion/parametrizacion/catRoles/roles.service';
import { LoginService } from 'src/app/servicios/login/login.service';

@Component({
  selector: 'app-editar-empleado',
  templateUrl: './editar-empleado.component.html',
  styleUrls: ['./editar-empleado.component.css']
})

export class EditarEmpleadoComponent implements OnInit {
  ips_locales: any = '';

  nacionalidades: any = [];
  private idNacionalidad: number;

  roles: any = [];
  usuario: any = [];

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
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    private rest: EmpleadoService,
    private user: UsuarioService,
    private rol: RolesService,
    public router: Router,
    public ventana: MatDialogRef<EditarEmpleadoComponent>,
    public validar: ValidacionesService,
    public loginService: LoginService,
    @Inject(MAT_DIALOG_DATA) public empleado: any
  ) {
    this.idEmpleado = this.empleado.id;
    this.empleado_inicia = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.CargarRoles();
    this.VerificarFormulario();
    this.ObtenerNacionalidades();
    this.VerificarCodigo();
  }

  // METODO PARA FILTRAR DATOS DE NACIONALIDAD
  private _filter(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.nacionalidades.filter((nacionalidades: any) => nacionalidades.nombre.toLowerCase().includes(filterValue));
    }
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
    });
    this.segundoFormGroup = this._formBuilder.group({
      nacionalidadForm: this.NacionalidadControl,
      estadoCivilForm: ['', Validators.required],
      domicilioForm: [''],
      telefonoForm: [''],
      generoForm: ['', Validators.required],
      estadoForm: ['', Validators.required],
    });
    this.terceroFormGroup = this._formBuilder.group({
      userForm: ['', Validators.required],
      rolForm: ['', Validators.required],
    });
  }

  // METODO PARA LISTAR NACIONALIDADES
  ObtenerNacionalidades() {
    this.rest.BuscarNacionalidades().subscribe(res => {
      this.nacionalidades = res;
      this.ObtenerEmpleado();
      this.filteredOptions = this.NacionalidadControl.valueChanges.pipe(
        startWith(''),
        map((value: any) => this._filter(value))
      );
    });
  }

  // CARGAR DATOS DE EMPLEADO Y USUARIO
  ObtenerEmpleado() {
    const { apellido, cedula, codigo, correo, domicilio, estado_civil, estado, fecha_nacimiento, genero,
      id, id_nacionalidad, nombre, telefono } = this.empleado;

    this.primeroFormGroup.setValue({
      apellidoForm: apellido,
      codigoForm: codigo,
      nombreForm: nombre,
      cedulaForm: cedula,
      emailForm: correo,
      fechaForm: fecha_nacimiento,
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
      else if (this.datosCodigo.cedula === true) {
        this.cedula = true;
        this.escritura = true;
        this.primeroFormGroup.patchValue({
          codigoForm: this.empleado.cedula
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
      this.Cancelar();
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
      cedula: form1.cedulaForm,
      nombre: NombreCapitalizado,
      genero: form2.generoForm,
      correo: form1.emailForm,
      estado: form2.estadoForm,
      codigo: form1.codigoForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };

    // CONTADOR 0 EL REGISTRO SE REALIZA UNA SOLA VEZ, CONTADOR 1 SE DIO UN ERROR Y SE REALIZA NUEVAMENTE EL PROCESO
    if (this.contador === 0) {
      this.rest.ActualizarEmpleados(empleado, this.idEmpleado).subscribe(
        (response: any) => {
          if (response.message === 'Registro actualizado.') {
            this.ActualizarUser(form3, form1, form2);
          }
        },
        error => {
          this.toastr.error(error.error.message, 'Upss!!! algo salió mal.', {
            timeOut: 6000,
          });
        }
      );
    }
    else {
      this.ActualizarUser(form3, form1, form2);
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
      contrasena: this.usuario[0].contrasena,
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
        this.ventana.close(false);
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
    this.ventana.close(true)
  }

  // METODO PARA CERRAR VENTANA
  Cancelar() {
    this.ventana.close(false);
  }

}
