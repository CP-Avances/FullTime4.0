import { Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-administra-comida',
  templateUrl: './administra-comida.component.html',
  styleUrls: ['./administra-comida.component.css']
})

export class AdministraComidaComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO
  empleados: any = [];
  selec1: boolean = false;
  selec2: boolean = false;

  // VARIABLES DE FORMULARIO
  nombreEmpleadoF = new FormControl('', [Validators.required]);
  comidaF = new FormControl('', Validators.required);

  // ASIGNACION DE CAMPOS DE FORMULARIO
  public formulario = new FormGroup({
    nombreEmpleadoForm: this.nombreEmpleadoF,
    comidaForm: this.comidaF,
  });

  constructor(
    private rest: EmpleadoService,
    private restU: UsuarioService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<AdministraComidaComponent>,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any,
  ) { }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    this.MostrarDatos();
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

  // METODO PARA BUSCAR DATOS DE USUARIO
  usuario: any = [];
  MostrarDatos() {
    this.usuario = [];
    this.restU.BuscarDatosUser(this.datoEmpleado.idEmpleado).subscribe(datos => {
      this.usuario = datos;
      this.formulario.patchValue({
        comidaForm: this.usuario[0].admin_comida
      })
      if (this.usuario[0].admin_comida === true) {
        this.selec1 = true;
      }
      else {
        this.selec2 = true;
      }
    });
  }

  // METODO PARA REGISTRAR AUTORIZACION
  InsertarAutorizacion(form: any) {
    let control = {
      admin_comida: form.comidaForm,
      id_empleado: this.datoEmpleado.idEmpleado
    }
    this.restU.RegistrarAdminComida(control).subscribe(res => {
      this.toastr.success('Operación Exitosa.', 'Registro guardado.', {
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


