import { Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { AutorizaDepartamentoService } from 'src/app/servicios/configuracion/localizacion/autorizaDepartamento/autoriza-departamento.service';
import { DepartamentosService } from 'src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-registro-autorizacion-depa',
  standalone: false,
  templateUrl: './registro-autorizacion-depa.component.html',
  styleUrls: ['./registro-autorizacion-depa.component.css']
})

export class RegistroAutorizacionDepaComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // VARIABLES DE ALMACENAMIENTO
  departamento: any = [];
  sucursales: any = [];
  empresas: any = [];
  empleados: any = [];
  idEmpresa: number;

  // VARIABLES DE FORMULARIO
  idDepartamento = new FormControl('', [Validators.required]);
  idSucursal = new FormControl('', [Validators.required]);
  autorizarF = new FormControl('', [Validators.required]);

  // AGREGRA FORMULARIO A UN GRUPO
  public formulario = new FormGroup({
    idSucursalForm: this.idSucursal,
    autorizarForm: this.autorizarF,
    idDeparForm: this.idDepartamento,
  });

  constructor(
    private restCatDepartamento: DepartamentosService,
    private restSucursales: SucursalService,
    private restAutoriza: AutorizaDepartamentoService,
    private toastr: ToastrService,
    private rest: EmpleadoService,
    public ventana: MatDialogRef<RegistroAutorizacionDepaComponent>,
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
    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    this.BuscarSucursales();
  }

  // METODO PARA MOSTRAR DATOS DE AUTORIDAD DEPARTAMENTOS
  autorizaciones: any = [];
  ObtenerAutorizaciones() {
    this.autorizaciones = [];
    this.restAutoriza.BuscarAutoridadEmpleado(this.datoEmpleado.idEmpleado).subscribe(datos => {
      this.autorizaciones = datos;
    })
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

  // METODO PARA BUSCAR SUCURSALES
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
      this.toastr.info('Sucursal seleccionada no tiene registro de departamentos.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA REGISTRAR AUTORIZACION
  InsertarAutorizacion(form: any) {
    let autoriza = {
      id_departamento: form.idDeparForm,
      id_empl_cargo: this.datoEmpleado.idCargo,
      preautorizar: false,
      id_empleado: this.datoEmpleado.idEmpleado,
      autorizar: false,
      estado: true,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }

    if (form.autorizarForm == 'preautorizar') {
      autoriza.preautorizar = true;
    }
    else if (form.autorizarForm == 'autorizar') {
      autoriza.autorizar = true;
    }
    else {
      autoriza.preautorizar = false;
      autoriza.autorizar = false;
    }

    let verificador = 0;
    if (this.autorizaciones.length > 0) {
      for (var i = 0; i < this.autorizaciones.length; i++) {
        if (this.autorizaciones[i].id_departamento === autoriza.id_departamento) {
          verificador = 1;
        }
      }
    }

    if (verificador === 0) {
      this.GuardarDatos(autoriza);
    } else {
      this.toastr.error('Ups! algo salio mal.', 'Departamento ya se encuentra configurado.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA GUARDAR EN BASE DE DATOS
  GuardarDatos(autoriza: any) {
    this.restAutoriza.IngresarAutorizaDepartamento(autoriza).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
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
