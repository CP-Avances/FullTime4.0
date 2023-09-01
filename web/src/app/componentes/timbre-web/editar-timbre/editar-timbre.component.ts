import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

//Servicios
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-timbre',
  templateUrl: './editar-timbre.component.html',
  styleUrls: ['./editar-timbre.component.css']
})
export class EditarTimbreComponent implements OnInit {

  datosTimbre: any;
  teclaFuncionF: number = 0;

  // LISTA DE ACCIONES DE TIMBRES
  acciones: any = [
    { value: 1, item: 'E', text: 'Entrada' },
    { value: 2, item: 'S', text: 'Salida' },
    { value: 3, item: 'I/A', text: 'Inicio Alimentación' },
    { value: 4, item: 'F/A', text: 'Fin Alimentación' },
    { value: 5, item: 'S/P', text: 'Inicio Permiso' },
    { value: 7, item: 'E/P', text: 'Fin Permiso' },
    { value: 6, item: 'HA', text: 'Fin' }
  ]

  accionF: FormControl = new FormControl(null,); // Inicializa el FormControl

  public timbreForm: FormGroup = new FormGroup({
    accion: this.accionF
  });


  constructor(
    public ventana: MatDialogRef<EditarTimbreComponent>,
    private timbreServicio: TimbresService,
    private toastr: ToastrService,
    private validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){
  }

  accion:any = [];
  teclaFun: any = [];
  textareaValue: string = '';
  ngOnInit() {
    this.datosTimbre = [];
    this.datosTimbre = this.data.timbre;
    console.log(this.datosTimbre)
    this.acciones.forEach(accion => {
      if(accion.value == this.datosTimbre.tecl_funcion){
        this.accion = accion;
        this.teclaFun = accion;
      }
    });
    this.teclaFuncionF = this.datosTimbre.tecl_funcion
    this.textareaValue = this.datosTimbre.observacion;

  }

  EnviarDatosTimbre(){
    let data = {
      id: this.datosTimbre.id, 
      codigo: this.datosTimbre.id_empleado, 
      accion: this.teclaFun.item,
      tecla: this.teclaFun.value, 
      observacion: this.textareaValue 
    }

    this.timbreServicio.EditarTimbreEmpleado(data).subscribe(res => {
      const mensaje: any  = res
      this.ventana.close();
      return this.toastr.success(mensaje.message, '', {
        timeOut: 4000,
      })
    }, err => {
      this.ventana.close();
      return this.toastr.error(err.message, '', {
        timeOut: 4000,
      })
    })
  }

}
