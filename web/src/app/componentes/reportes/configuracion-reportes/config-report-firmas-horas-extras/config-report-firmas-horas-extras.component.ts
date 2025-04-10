import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-config-report-firmas-horas-extras',
  standalone: false,
  templateUrl: './config-report-firmas-horas-extras.component.html',
  styleUrls: ['./config-report-firmas-horas-extras.component.css']
})

export class ConfigReportFirmasHorasExtrasComponent implements OnInit {

  FirmasformGroup: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ConfigReportFirmasHorasExtrasComponent>,
  ) {
    this.FirmasformGroup = formBuilder.group({
      firma_jefe: true,
      firma_resp: false,
      firma_empl: false
    });
  }

  ngOnInit(): void {

  }

  CrearConfiguracion(form: any) {
    
    console.log(form);
    if (!!sessionStorage.getItem('Firmas_hora_extra')) {
      sessionStorage.removeItem('Firmas_hora_extra')
      sessionStorage.setItem('Firmas_hora_extra', JSON.stringify(form))
      console.log('entro');
    } else {
      sessionStorage.setItem('Firmas_hora_extra', JSON.stringify(form))
      console.log('salio');
    }

    this.dialogRef.close()
    
  }

}
