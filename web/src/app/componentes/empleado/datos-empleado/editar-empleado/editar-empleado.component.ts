import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { RolesService } from 'src/app/servicios/catalogos/catRoles/roles.service';
import { LoginService } from 'src/app/servicios/login/login.service';

@Component({
  selector: 'app-editar-empleado',
  templateUrl: './editar-empleado.component.html',
  styleUrls: ['./editar-empleado.component.css']
})

export class EditarEmpleadoComponent implements OnInit {

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
    public loginService: LoginService,
    @Inject(MAT_DIALOG_DATA) public empleado: any
  ) {
    this.idEmpleado = this.empleado.id;
    this.empleado_inicia = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.CargarRoles();
    this.VerificarCodigo();
    this.VerificarFormulario();
    this.ObtenerNacionalidades();
  }

  // METODO PARA FILTRAR DATOS DE NACIONALIDAD
  private _filter(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.nacionalidades.filter(nacionalidades => nacionalidades.nombre.toLowerCase().includes(filterValue));
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
      apellidoForm: ['', Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,64}")],
      nombreForm: ['', Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")],
      codigoForm: [''],
      cedulaForm: ['', Validators.required],
      emailForm: ['', Validators.email],
      fechaForm: ['', Validators.required],
    });
    this.segundoFormGroup = this._formBuilder.group({
      nacionalidadForm: this.NacionalidadControl,
      estadoCivilForm: ['', Validators.required],
      domicilioForm: ['', Validators.required],
      telefonoForm: ['', Validators.required],
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
    const { apellido, cedula, codigo, correo, domicilio, esta_civil, estado, fec_nacimiento, genero,
      id, id_nacionalidad, nombre, telefono } = this.empleado;

    this.primeroFormGroup.setValue({
      apellidoForm: apellido,
      codigoForm: codigo,
      nombreForm: nombre,
      cedulaForm: cedula,
      emailForm: correo,
      fechaForm: fec_nacimiento,
    });

    this.segundoFormGroup.setValue({
      nacionalidadForm: this.nacionalidades.filter(o => { return id_nacionalidad === o.id }).map(o => { return o.nombre }),
      estadoCivilForm: esta_civil,
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
  VerificarCodigo() {
    this.datosCodigo = [];
    this.rest.ObtenerCodigo().subscribe(datos => {
      this.datosCodigo = datos[0];
      if (this.datosCodigo.automatico === true) {
        this.escritura = true;
      }
      else {
        this.escritura = false;
      }
    }, error => {
      this.toastr.info('Configurar ingreso de código de usuarios.', '', {
        timeOut: 6000,
      });
      this.router.navigate(['/codigo/']);
    });
  }

  // METODO PARA ACTUALIZAR REGISTRO DE EMPLEADO
  ActualizarEmpleado(form1: any, form2: any, form3: any) {
    // BUSCA EL ID DE LA NACIONALIDAD ELEGIDA EN EL AUTOCOMPLETADO
    this.nacionalidades.forEach(obj => {
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
      ip: this.ip,
    };

    // CONTADOR 0 EL REGISTRO SE REALIZA UNA SOL VEZ, CONTADOR 1 SE DIO UN ERROR Y SE REALIZA NUEVAMENTE EL PROCESO
    if (this.contador === 0) {
      this.rest.ActualizarEmpleados(empleado, this.idEmpleado).subscribe(response => {
        if (response.message === 'error') {
          this.toastr.error('Código o cédula ya se encuentran registrados.', 'Upss!!! algo slaio mal.', {
            timeOut: 6000,
          });
        }
        else {
          this.ActualizarUser(form3, form1);
        }
      });
    }
    else {
      this.ActualizarUser(form3, form1);
    }
  }

  // METODO PARA ACTUALIZAR INFORMACION D EUSUARIO
  contador: number = 0;
  ActualizarUser(form3: any, form1: any) {
    this.contador = 0;
    let dataUser = {
      id_empleado: this.idEmpleado,
      contrasena: this.usuario[0].contrasena,
      usuario: form3.userForm,
      id_rol: form3.rolForm,
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
        this.Navegar(form3);
        this.contador = 0;
      }
    });
  }

  // METODO PARA VALIDAR NAVEGABILIDAD
  Navegar(form3: any) {
    if (this.idEmpleado === this.empleado_inicia) {
      if (form3.userForm != this.usuario[0].usuario || form3.rolForm != this.usuario[0].id_rol) {
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
        ip: this.ip,
      }
      this.rest.ActualizarCodigo(dataCodigo).subscribe(res => {
      })
    }
  }

  // METODO DE VALIDACION DE INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACION DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO DE VALIDACION DE INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
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
