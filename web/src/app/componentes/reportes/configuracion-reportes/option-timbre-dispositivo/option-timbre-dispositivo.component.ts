import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ReportesService } from '../../../../servicios/reportes/reportes.service';

@Component({
  selector: 'app-option-timbre-dispositivo',
  templateUrl: './option-timbre-dispositivo.component.html',
  styleUrls: ['./option-timbre-dispositivo.component.css']
})
export class OptionTimbreDispositivoComponent implements OnDestroy {

  showTimbre = this.reporteService.mostrarTimbreDispositivo;

  constructor(
    private reporteService: ReportesService,
  ) { }

  ngOnDestroy() {
    this.reporteService.DefaultTimbreDispositivo()
  }

  ChangeValue(e: MatSlideToggleChange) {
    console.log(e.checked);
    this.reporteService.setMostrarTimbreDispositivo(e.checked);    
  }

}
