import { Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-editar-autorizacion-depa',
  templateUrl: './editar-autorizacion-depa.component.html',
  styleUrls: ['./editar-autorizacion-depa.component.css']
})

export class EditarAutorizacionDepaComponent implements OnInit {

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
  nombreEmpleadoF = new FormControl('', [Validators.required]);
  idDepartamento = new FormControl('', [Validators.required]);
  idSucursal = new FormControl('', [Validators.required]);
  autorizarF = new FormControl(false, [Validators.required]);

  // AGREGAR FORMULARIO A UN GRUPO
  public formulario = new FormGroup({
    nombreEmpleadoForm: this.nombreEmpleadoF,
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
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any,
  ) {
    this.idEmpresa = parseInt(localStorage.getItem('empresa') as string);
  }

  ngOnInit(): void {
    this.BuscarSucursales();
    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    this.CargarDatos();
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
        if(this.datoEmpleado.datosAuto.autorizar == true && this.datoEmpleado.datosAuto.preautorizar == false){
          this.selec2 = true;
          this.selec1 = false;
        }else if(this.datoEmpleado.datosAuto.autorizar == false && this.datoEmpleado.datosAuto.preautorizar == true){
          this.selec2 = false;
          this.selec1 = true;
        }else{
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
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleados = data;
      this.formulario.patchValue({
        nombreEmpleadoForm: this.empleados[0].nombre + ' ' + this.empleados[0].apellido,
      })
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
    let autorizarDepar = {
      id_departamento: form.idDeparForm,
      id_empl_cargo: this.datoEmpleado.datosAuto.id_empl_cargo,
      preautorizar: false,
      autorizar: false,
      estado: false,
      id: this.datoEmpleado.datosAuto.id
    }
    if(form.autorizarForm == 'preautorizar'){
      autorizarDepar.preautorizar = true;
      autorizarDepar.estado = true;
    }else if(form.autorizarForm == 'autorizar'){
      autorizarDepar.autorizar = true;
      autorizarDepar.estado = true;
    }
    else{
      autorizarDepar.preautorizar = false;
      autorizarDepar.autorizar = false;
      autorizarDepar.estado = false;
    }

    this.restAutoriza.ActualizarDatos(autorizarDepar).subscribe(res => {
      console.log('res: ',res)
      this.toastr.success('Operación Exitosa.', 'Registro actualizado.', {
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
