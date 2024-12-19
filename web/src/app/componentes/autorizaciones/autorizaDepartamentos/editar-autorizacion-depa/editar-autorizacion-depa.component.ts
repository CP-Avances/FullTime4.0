import { Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/configuracion/localizacion/autorizaDepartamento/autoriza-departamento.service';
import { DepartamentosService } from 'src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-editar-autorizacion-depa',
  templateUrl: './editar-autorizacion-depa.component.html',
  styleUrls: ['./editar-autorizacion-depa.component.css']
})

export class EditarAutorizacionDepaComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // VARIABLES DE ALMACENAMIENTO
  departamento: any = [];
  sucursales: any = [];
  empleados: any = [];
  idEmpresa: number;

  selec1: boolean = false;
  selec2: boolean = false;
  selec3: boolean = false;

  preautorizar: boolean = false;
  autorizar: boolean = false

  // VARIABLES DE FORMULARIO
  idDepartamento = new FormControl('', [Validators.required]);
  idSucursal = new FormControl('', [Validators.required]);
  autorizarF = new FormControl(false, [Validators.required]);

  // AGREGAR FORMULARIO A UN GRUPO
  public formulario = new FormGroup({
    idSucursalForm: this.idSucursal,
    autorizarForm: this.autorizarF,
    idDeparForm: this.idDepartamento,
  });

  constructor(
    private restCatDepartamento: DepartamentosService,
    private restAutoriza: AutorizaDepartamentoService,
    private restSucursales: SucursalService,
    private toastr: ToastrService,
    private rest: EmpleadoService,
    public ventana: MatDialogRef<EditarAutorizacionDepaComponent>,
    public validar: ValidacionesService,

    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any,
  ) {
    this.idEmpresa = parseInt(localStorage.getItem('empresa') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
    

    this.ObtenerAutorizaciones();
    this.BuscarSucursales();
    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    this.CargarDatos();
  }

  // METODO PARA MOSTRAR DATOS DE AUTORIDAD DEPARTAMENTOS
  autorizaciones: any = [];
  ObtenerAutorizaciones() {
    this.autorizaciones = [];
    this.restAutoriza.BuscarAutoridadEmpleado(this.datoEmpleado.idEmpleado).subscribe(datos => {
      this.autorizaciones = datos;
    })
  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  CargarDatos() {
    this.restSucursales.BuscarSucursalEmpresa(this.datoEmpleado.datosAuto.id_empresa).subscribe(datos => {
      this.sucursales = datos;
    });

    this.restCatDepartamento.BuscarDepartamentoSucursal(this.datoEmpleado.datosAuto.id_sucursal).subscribe(datos => {
      this.departamento = datos;
    });

    this.formulario.patchValue({
      idSucursalForm: this.datoEmpleado.datosAuto.id_sucursal,
      autorizarForm: this.datoEmpleado.datosAuto.estado,
      idDeparForm: this.datoEmpleado.datosAuto.id_departamento,
    })

    if (this.datoEmpleado.datosAuto.estado === true) {
      if (this.datoEmpleado.datosAuto.autorizar == true && this.datoEmpleado.datosAuto.preautorizar == false) {
        this.selec2 = true;
        this.selec1 = false;
      } else if (this.datoEmpleado.datosAuto.autorizar == false && this.datoEmpleado.datosAuto.preautorizar == true) {
        this.selec2 = false;
        this.selec1 = true;
      } else {
        this.selec2 = false;
        this.selec1 = false;
        this.selec3 = true;
      }
    }
    else {
      this.selec3 = true;
    }

  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  usuario: string = '';
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleados = data;
      this.usuario = this.empleados[0].nombre + ' ' + this.empleados[0].apellido;
    })
  }

  // METODO PARA LISTAR SUCURSALES
  BuscarSucursales() {
    this.sucursales = [];
    this.restSucursales.BuscarSucursalEmpresa(this.idEmpresa).subscribe(datos => {
      this.sucursales = datos;
    });
  }

  // METODO PARA LISTAR DEPARTAMENTOS
  ObtenerDepartamentos(form: any) {
    this.departamento = [];
    let idSucursal = form.idSucursalForm;
    this.restCatDepartamento.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamento = datos;
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA REGISTRAR AUTORIZACION
  InsertarAutorizacion(form: any) {
    let autoriza = {
      id_departamento: form.idDeparForm,
      id_empl_cargo: this.datoEmpleado.datosAuto.id_empleado_cargo,
      preautorizar: false,
      autorizar: false,
      estado: false,
      id: this.datoEmpleado.datosAuto.id,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }

    if (form.autorizarForm == 'noautorizar') {
      this.selec2 = false;
      this.selec1 = false;
      this.selec3 = true;
    }

    if (form.autorizarForm == 'preautorizar') {
      autoriza.preautorizar = true;
      autoriza.estado = true;
    }
    else if (form.autorizarForm == 'autorizar') {
      autoriza.autorizar = true;
      autoriza.estado = true;
    }
    else if (this.selec2 == true) {
      autoriza.preautorizar = false;
      autoriza.autorizar = true;
      autoriza.estado = true;
    }
    else if (this.selec1 == true) {
      autoriza.autorizar = false;
      autoriza.preautorizar = true;
      autoriza.estado = true;
    }
    else {
      autoriza.preautorizar = false;
      autoriza.autorizar = false;
      autoriza.estado = false;
    }


    if (autoriza.id_departamento === this.datoEmpleado.datosAuto.id_departamento) {
      this.GuardarDatos(autoriza);
    }
    else {
      let verificador = 0;
      for (var i = 0; i < this.autorizaciones.length; i++) {
        if (this.autorizaciones[i].id_departamento === autoriza.id_departamento) {
          verificador = 1;
        }
      }
      if (verificador === 0) {
        this.GuardarDatos(autoriza);
      } else {
        this.toastr.error('Ups!!! algo salio mal.', 'Departamento ya se encuentra configurado.', {
          timeOut: 6000,
        });
      }
    }
  }


  // METODO PARA GUARDAR DATOS EN BASE DE DATOS
  GuardarDatos(autorizarDepar: any) {
    this.restAutoriza.ActualizarDatos(autorizarDepar).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

}
