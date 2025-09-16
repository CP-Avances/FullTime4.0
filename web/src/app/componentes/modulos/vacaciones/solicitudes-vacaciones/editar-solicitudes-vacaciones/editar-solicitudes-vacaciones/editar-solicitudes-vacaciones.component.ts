import { Component, inject, Input, OnInit } from '@angular/core';
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

  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vacacionesService = inject(VacacionesService);
  private toastrService = inject(ToastrService);
  //private validacionesService = inject(ValidacionesService);

  solicitudForm: FormGroup;
  id: number
  diasPorSemana: ConteoDiasSemana = {
    L: 0,
    M: 0,
    X: 0,
    J: 0,
    V: 0,
    S: 0,
    D: 0
  }

  diasTotales = 0;
  documentoNombre = '';
  tiposVacacion: any[] = [];

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.inicializarFormulario();
    this.cargarSolicitud();
    this.CargarTiposVacacion();
  }

  private inicializarFormulario(): void {
    this.solicitudForm = this.formBuilder.group({
      id_periodo_vacacion: [null, Validators.required],
      fechaa_inicio: [null, Validators.required],
      fecha_final: [null, Validators.required],
      incluir_feriados: [false],
      documento: [''],
      numero_dias_lunes: [0],
      numero_dias_martes: [0],
      numero_dias_miercoles: [0],
      numero_dias_jueves: [0],
      numero_dias_viernes: [0],
      numero_dias_sabado: [0],
      numero_dias_domingo: [0],
      numero_dias_totales: [0],
      minutos_totales: [0]
    });
  }

  private cargarSolicitud(): void {
    this.vacacionesService.BuscarSolicitudExistente(this.id)
      .subscribe({
        next: (data: SolicitudVacacion) => {
          console.log("dataaaaaaaaaaa", data)
          this.setearValores(data)
        },
        error: (err) => console.log("Error al cargar una solicitud", err.message)
      });
  }

  private setearValores(data: SolicitudVacacion): void {
    this.solicitudForm.patchValue({
      id_periodo_vacacion: data.id_periodo_vacacion,
      fecha_inicio: data.fecha_inicio,
      fecha_final: data.fecha_final,
      incluir_feriados: data.incluir_feriados,
      documento: data.documento,
      numero_dias_lunes: data.numero_dias_lunes,
      numero_dias_martes: data.numero_dias_martes,
      numero_dias_miercoles: data.numero_dias_miercoles,
      numero_dias_jueves: data.numero_dias_jueves,
      numero_dias_viernes: data.numero_dias_viernes,
      numero_dias_sabado: data.numero_dias_sabado,
      numero_dias_domingo: data.numero_dias_domingo,
      numero_dias_totales: data.numero_dias_totales,
      minutos_totales: data.minutos_totales
    });
  }

  //METODO PARA OBTENER TIPOS DE VACACIONES
  CargarTiposVacacion() {
    this.vacacionesService.ListarTodasConfiguraciones().subscribe({
      next: (data) => {
        this.tiposVacacion = Array.isArray(data) ? data : [];
      },
      error: () => {
        this.toastrService.warning('No se pudieron cargar los tipos de vacaciones');
      }
    });
  }


}