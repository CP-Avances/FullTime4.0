import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';

@Component({
  selector: 'app-rango-fechas',
  templateUrl: './rango-fechas.component.html',
  styleUrls: ['./rango-fechas.component.css']
})
export class RangoFechasComponent implements OnInit, OnDestroy {

  fec_inicio_mes = new FormControl('', Validators.required);
  fec_final_mes = new FormControl('', Validators.required);
  
  public fechasForm = new FormGroup({
    fec_inicio: this.fec_inicio_mes,
    fec_final: this.fec_final_mes
  })

  constructor(
    private toastr: ToastrService,
    private reporteService: ReportesService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.reporteService.guardarRangoFechas('','')
  }

   f_inicio_req: string = '';
   f_final_req: string = '';
   habilitar: boolean = false;
   ValidarRangofechas(form) {
     var f_i = new Date(form.fec_inicio)
     var f_f = new Date(form.fec_final)
 
     if (f_i < f_f) {
       this.toastr.success('Fechas validas','', {
         timeOut: 6000,
       });
       this.f_inicio_req = f_i.toJSON().split('T')[0];
       this.f_final_req = f_f.toJSON().split('T')[0];
       this.habilitar = true;
       this.reporteService.guardarRangoFechas(this.f_inicio_req, this.f_final_req)
     } else if (f_i > f_f) {
       this.toastr.info('Fecha final es menor a la fecha inicial','', {
         timeOut: 6000,
       });
       this.fechasForm.reset();
     } else if (f_i.toLocaleDateString() === f_f.toLocaleDateString()) {
       this.toastr.info('Fecha inicial es igual a la fecha final','', {
         timeOut: 6000,
       });
       this.fechasForm.reset();
     }
   }

   limpiarCamposRango() {
    this.fechasForm.reset();
    this.habilitar = false;
  }
}
