import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
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
  teclaFuncionF: any;
  accionF: any;

  // LISTA DE ACCIONES DE TIMBRES
  acciones: any = [
    { value: '0', item: 'E', text: 'Entrada' },
    { value: '1', item: 'S', text: 'Salida' },
    { value: '2', item: 'I/A', text: 'Inicio Alimentación' },
    { value: '3', item: 'F/A', text: 'Fin Alimentación' },
    { value: '4', item: 'S/P', text: 'Inicio Permiso' },
    { value: '5', item: 'HA', text: 'Fin' },
    { value: '6', item: 'E/P', text: 'Fin Permiso' }
  ]

  tecl_funcio: any = [
    {value: '0'},
    {value: '1'},
    {value: '2'},
    {value: '3'},
    {value: '4'},
    {value: '5'},
    {value: '6'},
  ]

  EditartimbreForm: FormGroup; 

  constructor(
    public ventana: MatDialogRef<EditarTimbreComponent>,
    private timbreServicio: TimbresService,
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){
    this.datosTimbre = [];
    this.datosTimbre = this.data.timbre;

    this.EditartimbreForm = this.formBuilder.group({
        accionTimbre: [this.datosTimbre.accion, Validators.required],
        teclaFunTimbre: [this.datosTimbre.tecl_funcion, Validators.required],
        ObservacionForm: [this.datosTimbre.observacion, Validators.required]
    });
  }

  ngOnInit() {
  }

  
  seleccion: any;
  SeleccionTecla: any;
  teclaFun: any;
  SelectedAccion(item: any){
    this.seleccion = item.value;
    this.acciones.forEach(elementAccion => {
      if(elementAccion.item == this.seleccion){
        this.SeleccionTecla = elementAccion.value;
      }
    });
  }

  SelectedTecla(item: any){
    this.SeleccionTecla = item.value;
    this.acciones.forEach(elementAccion => {
      if(elementAccion.value == this.SeleccionTecla){
        this.seleccion = elementAccion.item;
      }
    });
  }

  envio_accion: string = ''
  EnviarDatosTimbre(formTimbre: any){    
    let data = {
      id: this.datosTimbre.id, 
      codigo: this.datosTimbre.id_empleado, 
      accion: formTimbre.accionTimbre,
      tecla: formTimbre.teclaFunTimbre, 
      observacion: formTimbre.ObservacionForm
    }

    console.log('data: ',data);
    
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
