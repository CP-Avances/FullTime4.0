import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudVacacion } from 'src/app/interfaces/SolicitudesVacacion';
import { VacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/vacaciones/vacaciones.service';


@Component({
  selector: 'app-editar-solicitudes-vacaciones',
  standalone: false,

  templateUrl: './editar-solicitudes-vacaciones.component.html',
  styleUrl: './editar-solicitudes-vacaciones.component.scss'
})
export class EditarSolicitudesVacacionesComponent implements OnInit {

  formulario: FormGroup;
  id: number;
  solicitud: SolicitudVacacion | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vacacionesService: VacacionesService,
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.formulario = this.formBuilder.group({
      id_empleado: ['', Validators.required],
      id_cargo_vigente: ['', Validators.required],
      id_periodo_vacacion: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_final: ['', Validators.required],
      estado: ['', Validators.required],
      numero_dias_lunes: [0],
      numero_dias_martes: [0],
      numero_dias_miercoles: [0],
      numero_dias_jueves: [0],
      numero_dias_viernes: [0],
      numero_dias_sabado: [0],
      numero_dias_domingo: [0],
      numero_dias_totales: [0],
      incluir_feriados: [false],
      documento: [''],
      minutos_totales: [0]
    });
  }

  ngOnInit(): void {

  }

}