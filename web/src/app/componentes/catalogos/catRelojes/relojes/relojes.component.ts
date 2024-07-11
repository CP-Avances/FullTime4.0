import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AsignacionesService } from 'src/app/servicios/asignaciones/asignaciones.service';
import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-relojes',
  templateUrl: './relojes.component.html',
  styleUrls: ['./relojes.component.css'],
})

export class RelojesComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO
  sucursales: any = [];
  departamento: any = [];
  registrar: boolean = true;

  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idUsuariosAcceso: Set<any> = new Set();
  idSucursalesAcceso: Set<any> = new Set();
  idDepartamentosAcceso: Set<any> = new Set();

  // CONTROL DE FORMULARIOS
  isLinear = true;
  primerFormulario: FormGroup;
  segundoFormulario: FormGroup;

  // ACTIVAR INGRESO DE NUMERO DE ACCIONES
  activarCampo: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO

  // PRIMER FORMULARIO
  ipF = new FormControl('', [Validators.required, Validators.pattern(/^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/)]);
  nombreF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  puertoF = new FormControl('', [Validators.required]);
  codigoF = new FormControl('', Validators.required);
  numeroF = new FormControl('', [Validators.required]);
  funcionesF = new FormControl('', [Validators.required]);
  idSucursalF = new FormControl('', Validators.required);
  idDepartamentoF = new FormControl('', [Validators.required]);

  // SEGUNDO FORMULARIO
  macF = new FormControl('');
  marcaF = new FormControl('', [Validators.minLength(2)]);
  serieF = new FormControl('', Validators.minLength(4));
  modeloF = new FormControl('', [Validators.minLength(3)]);
  fabricanteF = new FormControl('', [Validators.minLength(4)]);
  contraseniaF = new FormControl('', [Validators.minLength(1)]);
  idFabricacionF = new FormControl('', [Validators.minLength(4)]);

  constructor(
    private restCatDepartamento: DepartamentosService,
    private restSucursales: SucursalService,
    private restUsuario: UsuarioService,
    private formulario: FormBuilder,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private router: Router,
    private rest: RelojesService,
    private asignaciones: AsignacionesService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);

    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;
    this.idSucursalesAcceso = this.asignaciones.idSucursalesAcceso;
    this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;

    this.FiltrarSucursales();
    this.ValidarFormulario();
  }

  // VALIDACIONES DE FORMULARIO
  ValidarFormulario() {
    this.primerFormulario = this.formulario.group({
      ipForm: this.ipF,
      nombreForm: this.nombreF,
      puertoForm: this.puertoF,
      numeroForm: this.numeroF,
      codigoForm: this.codigoF,
      funcionesForm: this.funcionesF,
      idSucursalForm: this.idSucursalF,
      idDepartamentoForm: this.idDepartamentoF,
    });
    this.segundoFormulario = this.formulario.group({
      macForm: this.macF,
      marcaForm: this.marcaF,
      serieForm: this.serieF,
      modeloForm: this.modeloF,
      fabricanteForm: this.fabricanteF,
      contraseniaForm: this.contraseniaF,
      idFabricacionForm: this.idFabricacionF,
    });
  }

  // METODO PARA LISTAR ESTABLECIMIENTOS
  FiltrarSucursales() {
    let idEmpre = parseInt(localStorage.getItem('empresa') as string);
    this.sucursales = [];
    this.restSucursales.BuscarSucursalEmpresa(idEmpre).subscribe(datos => {
      this.sucursales = this.rolEmpleado === 1 ? datos : this.FiltrarSucursalesAsignadas(datos);
    }, error => {
      this.toastr.info('No se han encntrado registros de establecimientos.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA FILTRAR SUCURSALES ASIGNADAS
  FiltrarSucursalesAsignadas(data: any) {
    return data.filter((sucursal: any) => this.idSucursalesAcceso.has(sucursal.id));
  }

  // METODO PARA LISTAR DEPARTAMENTOS DE ESTABLECIMIENTO
  ObtenerDepartamentos(form: any) {
    this.departamento = [];
    let idSucursal = form.idSucursalForm;
    this.restCatDepartamento.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamento = this.rolEmpleado === 1 ? datos : this.FiltrarDepartamentosAsignados(datos);
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA FILTRAR DEPARTAMENTOS ASIGNADOS
  FiltrarDepartamentosAsignados(data: any) {
    return data.filter((departamento: any) => this.idDepartamentosAcceso.has(departamento.id));
  }


  // METODO PARA REGISTRAR DISPOSITIVO
  InsertarReloj(form1: any, form2: any) {
    // VALIDAR DIRECCION MAC
    const direccMac = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^[0-9A-Fa-f]{12}$/;

    let reloj = {
      // PRIMER FORMULARIO
      ip: form1.ipForm,
      codigo: form1.codigoForm,
      nombre: form1.nombreForm,
      puerto: form1.puertoForm,
      id_sucursal: form1.idSucursalForm,
      numero_accion: form1.numeroForm,
      tien_funciones: form1.funcionesForm,
      id_departamento: form1.idDepartamentoForm,

      // SEGUNDO FORMULARIO
      mac: form2.macForm,
      serie: form2.serieForm,
      marca: form2.marcaForm,
      modelo: form2.modeloForm,
      fabricante: form2.fabricanteForm,
      contrasenia: form2.contraseniaForm,
      id_fabricacion: form2.idFabricacionForm,
      user_name: this.user_name,
      user_ip: this.ip,
    };
    // VALIDAR DIRECCION MAC
    console.log('mac ', reloj.mac)
    if (reloj.mac != '') {
      if (direccMac.test(reloj.mac.toString())) {
        console.log('ingresa aqui mac')
        this.GuardarSistema(reloj);
      } else {
        this.toastr.warning('MAC ingresada no es válida.',
          'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
    }
    else {
      console.log('ingresa aqui')
      this.GuardarSistema(reloj);
    }
  }

  // METODO PARA ALMACENAR LOS DATOS EN LA BASE
  GuardarSistema(reloj: any) {
    this.rest.CrearNuevoReloj(reloj).subscribe(response => {
      console.log('ver response', response)
      if (response.message === 'guardado') {
        this.LimpiarCampos();
        this.VerDatosReloj(response.reloj.id);
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        })
      }
      else if (response.message === 'existe') {
        this.toastr.warning('Código o serie del equipo ya existe en el sistema.',
          'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
      else if (response.message === 'error') {
        this.toastr.warning('IP ingresada ya existe en el sistema.',
          'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
    });
  }

  // MENSAJES DE ERRORES
  ObtenerMensajeErrorIp() {
    if (this.ipF.hasError('pattern')) {
      return 'Ingresar IP Ej: 0.0.0.0';
    }
  }

  // METODO PARA VALIDAR INGRESO DE IP
  IngresarIp(evt: any) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6 || keynum == 46) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras.', 'Usar solo números.', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA VISUALIZAR CAMPO NUMERO DE FUNCIONES
  ActivarVista() {
    this.activarCampo = true;
    this.primerFormulario.patchValue({
      numeroForm: ''
    })
  }

  // METODO PARA OCULTAR CAMPO DE NUMERO DE FUNCIONES
  DesactivarVista() {
    this.activarCampo = false;
    this.primerFormulario.patchValue({
      numeroForm: 0
    })
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.primerFormulario.reset();
    this.segundoFormulario.reset();
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.LimpiarCampos();
    this.router.navigate(['/listarRelojes']);
  }


  // METODO PARA VER DATOS DE RELOJ
  ver_datos: boolean = false;
  reloj_id: number;
  pagina: string = '';
  VerDatosReloj(id: number) {
    this.reloj_id = id;
    this.ver_datos = true;
    this.registrar = false;
    this.pagina = 'registrar-reloj';
  }

}
