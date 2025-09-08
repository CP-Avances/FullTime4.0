
import { Component, Input } from "@angular/core";
import { RegistrarVacacionesComponent } from "../registrar-vacaciones/registrar-vacaciones.component";

@Component({
    selector: 'solicitudes-vacaciones',
    standalone: false,
    templateUrl: './solicitudes-vacaciones.component.html',
    styleUrls: ['./solicitudes-vacaciones.component.css'],
})

export class SolicitudesVacacionesComponent {


    //VARIABLES PARA SOLICITUD DE VACACIONES
    @Input() conteoDiasSemana: any = {};
    @Input() diasTotales: number = 0;
    @Input() diasFeriados: number = 0;
    @Input() usuariosCorrectos: number = 0;
    @Input() vacaciones: any = [];
    @Input() tiposVacacion: any[] = [];
    @Input() incluirFeriados: boolean = false
    @Input() verificacionRealizada: boolean = false;
    @Input() estadoVerificacion: string = '';
    @Input() feriados: any = [];
    @Input() permiteHoras: boolean = false;
    @Input() diaSemanaSeleccionado: string | null = null;
    @Input() horasTotales: string = '00:00';

}