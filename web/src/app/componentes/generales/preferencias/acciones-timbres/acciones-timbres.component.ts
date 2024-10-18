import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public ventana: MatDialogRef<AccionesTimbresComponent>,
    public formBuilder: FormBuilder,
    public loginService: LoginService,
    private restEmpresa: EmpresaService,
    private toaster: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.formGroup = formBuilder.group({
      acciones_timbres: this.bool_acc,
    });
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
  }

  GuardarAccion(form: any) {
    let data = {
      id: this.data.id_empresa,
      bool_acciones: form.acciones_timbres,
      user_name: this.user_name,
      ip: this.ip
    }

    this.ventana.close();

    this.restEmpresa.ActualizarAccionesTimbres(data).subscribe(res => {
      this.toaster.success(res.message, res.title);
      this.ventana.close();
      this.loginService.logout();
    }, err => {
      this.toaster.error(err.error.message)
    })
  }

}
