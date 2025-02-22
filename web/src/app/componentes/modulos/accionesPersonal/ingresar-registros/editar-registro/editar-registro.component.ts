import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-registro',
  templateUrl: './editar-registro.component.html',
  styleUrl: './editar-registro.component.scss'
})
export class EditarRegistroComponent {

  @Input() dato: any;
  tipoAccionPersonal: string = ''
  listadoAccion: any;
  infoAccion: any

  idListaAcc = new FormControl('', [Validators.required])
  ValorEstado = new FormControl('', [Validators.required])

  public formulario = new FormGroup({
    idlistForm: this.idListaAcc,
    estadoForm: this.ValorEstado
  });

  estados: any = [
    {value: true, item: 'ACTIVO'},
    {value: false, item: 'INACTIVO'}
  ]

  constructor(
    private validar: ValidacionesService,
    public ventana: MatDialogRef<EditarRegistroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.listadoAccion = []
    this.tipoAccionPersonal = this.data.tipo.toLocaleUpperCase();
    this.listadoAccion = this.data.listAccion;
    this.infoAccion = this.data.info;
    this.LlenarFormulario() 
    console.log('data edit: ',this.data)
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  LlenarFormulario() {
    if(this.tipoAccionPersonal == 'PROCESO'){
      this.formulario.patchValue({
        idlistForm: this.infoAccion.id_proceso,
        estadoForm: this.infoAccion.estado
      })
    }else if(this.tipoAccionPersonal == 'GRADOS'){
      this.formulario.patchValue({
        idlistForm: this.infoAccion.id_grado,
        estadoForm: this.infoAccion.estado
      })
    }else{
      this.formulario.patchValue({
        idlistForm: this.infoAccion.id_grupo_ocupacional,
        estadoForm: this.infoAccion.estado
      })
    }
    
  }

  // METODO PARA VALIDAR SOLO INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }


  CerrarVentana(): void {
    this.ventana.close(false);
  }

  Confirmar(): void {
    this.ventana.close(true);
  }

}
