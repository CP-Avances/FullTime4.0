import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { LoginService } from 'src/app/servicios/login/login.service';

@Component({
  selector: 'app-acciones-timbres',
  templateUrl: './acciones-timbres.component.html',
  styleUrls: ['./acciones-timbres.component.css']
})
export class AccionesTimbresComponent implements OnInit {

  formGroup: FormGroup;
  bool_acc: boolean = (localStorage.getItem('bool_timbres') === "true") ? true : false;

  constructor(
    public formBuilder: FormBuilder,
    public loginService: LoginService,
    private restEmpresa: EmpresaService,
    private toaster: ToastrService,
    public dialogRef: MatDialogRef<AccionesTimbresComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.formGroup = formBuilder.group({
      acciones_timbres: this.bool_acc,
    });
  }

  ngOnInit(): void {
  }

  GuardarAccion(form) {
    console.log(form);
    
    let data = {
      id: this.data.id_empresa,
      bool_acciones: form.acciones_timbres
    }
    console.log('ACCIONES TIMBRES: ',data);
    this.dialogRef.close();

    this.restEmpresa.ActualizarAccionesTimbres(data).subscribe(res => {
      this.toaster.success(res.message, res.title);
      this.dialogRef.close();
      this.loginService.logout();
    }, err => {
      console.log(err);
      this.toaster.error(err.error.message)
    })
  }

}
