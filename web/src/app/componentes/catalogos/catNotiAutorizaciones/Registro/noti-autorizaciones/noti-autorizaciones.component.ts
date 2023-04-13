import { Component, OnInit, Inject } from '@angular/core';
import { NotiAutorizacionesService } from 'src/app/servicios/catalogos/catNotiAutorizaciones/noti-autorizaciones.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NotificacionesService } from 'src/app/servicios/catalogos/catNotificaciones/notificaciones.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface Orden {
  valor: number
}

@Component({
  selector: 'app-noti-autorizaciones',
  templateUrl: './noti-autorizaciones.component.html',
  styleUrls: ['./noti-autorizaciones.component.css']
})
export class NotiAutorizacionesComponent implements OnInit {

  idCatNotificacion = new FormControl('', Validators.required);
  idEmplCargo = new FormControl('', Validators.required);
  orden = new FormControl('', Validators.required);

  public nuevaNoti_AutorizacionesForm = new FormGroup({
    idCatNotificacionForm: this.idCatNotificacion,
    idEmplCargoForm: this.idEmplCargo,
    ordenForm: this.orden,
  });

  cargo: any = [];
  notificacion: any = [];

  ordenes: Orden[] = [
    { valor: 1},
    { valor: 2},
    { valor: 3},
    { valor: 4},
    { valor: 5}
  ];
  
  constructor(
    public restNotiAutorizaciones: NotiAutorizacionesService,
    public restNotificaciones: NotificacionesService,
    public restCargoEmpleado: EmplCargosService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<NotiAutorizacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.obtenerCargo();
    this.obtenerNotificacion();
    console.log(this.data);
  }

  insertarNotiAutorizacion(form){
    let newNotiAutori = {
      id_notificacion: form.idCatNotificacionForm,
      id_empl_cargo: form.idEmplCargoForm,
      orden: form.ordenForm
    }
    console.log(newNotiAutori);
    this.restNotiAutorizaciones.postNotiAutoriRest(newNotiAutori).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'Autorizacion de Notificación guardada', {
        timeOut: 6000,
      }),
      this.limpiarCampos();
      this.CerrarVentanaRegistroNoti();
    }, error => {
      console.log(error);
    })
  }

  totalCargos: any = [];
  obtenerCargo(){
    this.restCargoEmpleado.getListaEmpleadoCargosRest().subscribe(res => {
      // this.cargo = res;
      this.totalCargos = res;
      this.totalCargos.forEach(obj => {
        if (obj.departamento === this.data.nombre) {
          this.cargo.push(obj);
        }
      });
      console.log(res);
    });
  }

  obtenerNotificacion(){
    this.notificacion = [];
    this.notificacion.push(this.data);
    this.nuevaNoti_AutorizacionesForm.patchValue({
      idCatNotificacionForm: this.data.id
    });
  }

  limpiarCampos(){
    this.nuevaNoti_AutorizacionesForm.reset();
  }

  CerrarVentanaRegistroNoti() {
    this.limpiarCampos();
    this.dialogRef.close();
    window.location.reload();
  }

  Salir() {
    this.limpiarCampos();
    this.dialogRef.close();
  }

}
