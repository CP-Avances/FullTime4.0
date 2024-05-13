// SECCIÓN DE LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Component, OnInit } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr'
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Md5 } from 'ts-md5/dist/md5';

// SECCIÓN DE SERVICIOS
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { RolesService } from 'src/app/servicios/catalogos/catRoles/roles.service';
import { use } from 'echarts';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],

  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class RegistroComponent implements OnInit {

  empleadoGuardado: any = [];
  nacionalidades: any = [];
  escritura = false;
  cedula = false;
  roles: any = [];
  hide = true;

  private idNacionalidad: number;

  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;
  terceroFormGroup: FormGroup;

  NacionalidadControl = new FormControl('', Validators.required);
  filteredOptions: Observable<any[]>;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private rol: RolesService,
    private rest: EmpleadoService,
    private user: UsuarioService,
    private toastr: ToastrService,
    private router: Router,
    private _formBuilder: FormBuilder,
    public ventana: MatDialog,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.CargarRoles();
    this.VerificarCodigo();
    this.AsignarFormulario();
    this.ObtenerNacionalidades();
  }

  // METODO DE FILTRACION DE DATOS DE NACIONALIDAD
  private _filter(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.nacionalidades.filter(nacionalidades => nacionalidades.nombre.toLowerCase().includes(filterValue));
    }
  }

  // METODO PARA BUSCAR NACIONALIDADES
  ObtenerNacionalidades() {
    this.rest.BuscarNacionalidades().subscribe(res => {
      this.nacionalidades = res;
      this.filteredOptions = this.NacionalidadControl.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filter(value))
        );
    });
  }

  // METODO PARA LISTAR ROLES
  CargarRoles() {
    this.rol.BuscarRoles().subscribe(data => {
      this.roles = data;
    });
  }

  // METODO PARA VALIDAR CAMPOS DE FORMULARIO
  AsignarFormulario() {
    this.primeroFormGroup = this._formBuilder.group({
      apellidoForm: ['', Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,64}")],
      nombreForm: ['', Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")],
      cedulaForm: ['', Validators.required],
      codigoForm: [''],
      emailForm: ['', Validators.email],
      fechaForm: ['', Validators.required],
    });
    this.segundoFormGroup = this._formBuilder.group({
      nacionalidadForm: this.NacionalidadControl,
      estadoCivilForm: ['', Validators.required],
      domicilioForm: ['', Validators.required],
      telefonoForm: ['', Validators.required],
      generoForm: ['', Validators.required],
    });
    this.terceroFormGroup = this._formBuilder.group({
      userForm: ['', Validators.required],
      passForm: ['', Validators.required],
      rolForm: ['', Validators.required],
    });
  }

  // METODO DE VALIDACION DE INGRESO DE CODIGO DE FORMA MANUAL O AUTOMATICO
  datosCodigo: any = [];
  VerificarCodigo() {
    this.datosCodigo = [];
    this.rest.ObtenerCodigo().subscribe(datos => {
      this.datosCodigo = datos[0];
      if (this.datosCodigo.automatico === true) {
        this.primeroFormGroup.patchValue({
          codigoForm: parseInt(this.datosCodigo.valor) + 1
        })
        this.escritura = true;
      }
      else if (this.datosCodigo.cedula === true) {
        this.cedula = true;
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

  // METODO PARA REGISTRAR EMPLEADO
  InsertarEmpleado(form1: any, form2: any, form3: any) {
    // BUSCA EL ID DE LA NACIONALIDAD ELEGIDA EN EL AUTOCOMPLETADO
    this.nacionalidades.forEach(obj => {
      if (form2.nacionalidadForm == obj.nombre) {
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

    // CAPTURAR DATOS DEL FORMULARIO
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
      codigo: form1.codigoForm,
      estado: 1,
      user_name: this.user_name,
      ip: this.ip
    };

    // CONTADOR 0 EL REGISTRO SE REALIZA UNA SOL VEZ, CONTADOR 1 SE DIO UN ERROR Y SE REALIZA NUEVAMENTE EL PROCESO
    if (this.contador === 0) {
      this.rest.RegistrarEmpleados(empleado).subscribe(response => {
        if (response.message === 'error') {
          this.toastr.error('Cédula o código de usuario ya se encuentran registrados.', 'Ups!!! algo salio mal.', {
            timeOut: 6000,
          });
        }
        else {
          this.empleadoGuardado = response;
          this.GuardarDatosUsuario(form3, this.empleadoGuardado.id, form1);

        }
      });
    }
    else {
      this.GuardarDatosUsuario(form3, this.empleadoGuardado.id, form1);
    }
  }

  // METODO PARA GUARDAR DATOS DE USUARIO
  contador: number = 0;
  GuardarDatosUsuario(form3: any, id: any, form1: any) {
    // CIFRADO DE CONTRASEÑA
    const md5 = new Md5();
    let clave = md5.appendStr(form3.passForm).end();
    let dataUser = {
      id_empleado: id,
      contrasena: clave,
      usuario: form3.userForm,
      id_rol: form3.rolForm,
      estado: true,
    }
    this.user.RegistrarUsuario(dataUser).subscribe(data => {
      if (data.message === 'error') {
        this.toastr.error('Nombre de usuario ya se encuentra registrado.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
        this.contador = 1;
      }
      else {
        this.ActualizarCodigo(form1.codigoForm);
        this.VerDatos(id);
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        });
        this.LimpiarCampos();
        this.contador = 0;
      }
    });
  }

  // METODO PARA INGRESAR A FICHA DEL USUARIO
  VerDatos(id: string) {
    this.router.navigate(['/verEmpleado/', id]);
  }

  // ACTUALIZACION DE CODIGO DE USUARIO
  ActualizarCodigo(codigo: any) {
    if (this.datosCodigo.automatico === true) {
      let dataCodigo = {
        valor: codigo,
        id: 1,
        user_name: this.user_name,
        ip: this.ip
      }
      this.rest.ActualizarCodigo(dataCodigo).subscribe(res => {
      })
    }
  }

  // METODO DE VALIDACION DE INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    const patron = /^[a-zA-Z\s]*$/
     if (!patron.test(tecla)) {
      this.toastr.info('No se admite datos numéricos o caracteres especiales', 'Usar solo letras', {
        timeOut: 6000,
      });
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

  IngresarSoloLetrasNumeros(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL CONJUNTO DE CARACTERES PERMITIDOS.
    const patron = /^[a-zA-Z0-9]*$/;

    if (!patron.test(tecla)) {
      this.toastr.info('No se admite caracteres especiales', 'Usar solo letras y números', {
        timeOut: 6000,
      });
      return false;
    }

    // this.LlenarCodigo(cedula,form1,tecla)

  }

  LlenarCodigo(form1: any){

    if (this.cedula) {
      let codigo:number = form1.cedulaForm;

        this.primeroFormGroup.patchValue({
          codigoForm: codigo
        })

    }
  }


  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarCampos() {
    this.primeroFormGroup.reset();
    this.segundoFormGroup.reset();
    this.terceroFormGroup.reset();
  }

}


