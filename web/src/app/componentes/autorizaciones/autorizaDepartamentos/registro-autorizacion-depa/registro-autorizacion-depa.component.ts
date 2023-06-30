import { Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-registro-autorizacion-depa',
  templateUrl: './registro-autorizacion-depa.component.html',
  styleUrls: ['./registro-autorizacion-depa.component.css']
})

export class RegistroAutorizacionDepaComponent implements OnInit {

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
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any,
  ) {
    this.idEmpresa = parseInt(localStorage.getItem('empresa') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    this.BuscarSucursales();
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
      id_empleado: this.datoEmpleado.idEmpleado,
      estado: true,
      preautorizar: false,
      autorizar: false,
    }

    if (form.autorizarForm == 'preautorizar') {
      autoriza.preautorizar = true;
    } else if (form.autorizarForm == 'autorizar') {
      autoriza.autorizar = true;
    } else {
      autoriza.preautorizar = false;
      autoriza.autorizar = false;
    }

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
