import { Component, inject, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConteoDiasSemana } from 'src/app/interfaces/ConteoDiasSemana';
import { SolicitudVacacion } from 'src/app/interfaces/SolicitudesVacacion';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { VacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/vacaciones/vacaciones.service';


@Component({
  selector: 'app-editar-solicitudes-vacaciones',
  standalone: false,

  templateUrl: './editar-solicitudes-vacaciones.component.html',
  styleUrl: './editar-solicitudes-vacaciones.component.scss'
})
export class EditarSolicitudesVacacionesComponent implements OnInit {

  @Input() data: any;
  @Output() cerrar = new EventEmitter<void>();


  ngOnInit(): void {
    console.log('Componente Editar en construcción.');
  }


  cerrarEdicion() {
    this.cerrar.emit();
  }

}
