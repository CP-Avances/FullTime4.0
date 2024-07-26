import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { RolesService } from 'src/app/servicios/catalogos/catRoles/roles.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-rol-user',
  templateUrl: './editar-rol-user.component.html',
  styleUrl: './editar-rol-user.component.css'
})
export class EditarRolUserComponent implements OnInit {

  nombreRolF = new FormControl('', [Validators.required]);

  public formulario = new FormGroup({
    nombreRolF: this.nombreRolF
  });

  listaRoles: any = [];

  constructor(
    private restRol: RolesService,
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    public ventana: MatDialogRef<EditarRolUserComponent>, // VARIABLE DE MANEJO DE VENTANAS
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { 
    
  }

  ngOnInit(): void {
    this,this.restRol.BuscarRoles().subscribe((respuesta: any) => {
      this.listaRoles = respuesta
      console.log('this.listaRoles: ',this.listaRoles)
    })
    console.log('dataaaa: ',this.data)
  }

  // METODO PARA LIMPIAR DATOS DE FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  EditarRolUsuarios(form: any){

  }

}
