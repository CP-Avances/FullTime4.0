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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // VARIABLES DE FORMULARIO
  comidaF = new FormControl('', Validators.required);

  // ASIGNACION DE CAMPOS DE FORMULARIO
  public formulario = new FormGroup({
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
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    this.MostrarDatos();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  nombre: string = '';
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleados = data;
      this.nombre = this.empleados[0].nombre + ' ' + this.empleados[0].apellido;
      this.nombre = this.nombre.toUpperCase();
    })
  }

  // METODO PARA BUSCAR DATOS DE USUARIO
  usuario: any = [];
  MostrarDatos() {
    this.usuario = [];
    this.restU.BuscarDatosUser(this.datoEmpleado.idEmpleado).subscribe(datos => {
      this.usuario = datos;
      if (this.usuario[0].administra_comida === true) {
        this.comidaF.setValue('si');
      }
      else {
        this.comidaF.setValue('no');
      }
    });
  }

  // METODO PARA REGISTRAR AUTORIZACION
  InsertarAutorizacion(form: any) {
    let administra: boolean;
    // VALIDAR SELECCION DEL USUARIO
    if (form.comidaForm === 'si') {
      administra = true;
    }
    else {
      administra = false;
    }
    let control = {
      admin_comida: form.comidaForm,
      id_empleado: this.datoEmpleado.idEmpleado,
      user_name: this.user_name,
      ip: this.ip
    }
    this.restU.RegistrarAdminComida(control).subscribe(res => {
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


