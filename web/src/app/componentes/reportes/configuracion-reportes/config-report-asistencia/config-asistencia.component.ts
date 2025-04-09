import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Task } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-config-asistencia',
  standalone: false,
  templateUrl: './config-asistencia.component.html',
  styleUrls: ['./config-asistencia.component.css']
})

export class ConfigAsistenciaComponent implements OnInit {

  task: Task = {
    name: 'Seleccionar Todo',
    completed: false,
    subtasks: [
      { name: 'ATRASO', completed: false },
      { name: 'SALIDA ANTICIPADA', completed: false },
      { name: 'ALIMENTACION', completed: false },
      { name: 'HORAS TRABAJADAS', completed: false },
      { name: 'HORAS SUPLEMENTARIAS', completed: false },
      { name: 'HORAS EXTRAS L-V', completed: false },
      { name: 'HORAS EXTRAS S-D', completed: false }
    ]
  };

  allComplete: boolean = false;

  updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
  }

  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.task.subtasks == null) {
      return;
    }
    this.task.subtasks.forEach(t => t.completed = completed);
  }

  constructor(
    public dialogRef: MatDialogRef<ConfigAsistenciaComponent>,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }

  GuardarConfiguracionAsistencia() {
    sessionStorage.removeItem('arrayConfigAsistencia');
    sessionStorage.removeItem('columnasValidasAsistencia');
    if (this.task.subtasks) {
      // console.log(this.task.subtasks);
      let columnasValidas = this.task.subtasks.filter(obj => {
        return (obj.completed === true)
      }).length + 15;
      // console.log(columnasValidas);
      sessionStorage.setItem('columnasValidasAsistencia', columnasValidas.toString())

      let ObjetoJSON = {
        atraso: this.task.subtasks.filter(obj => { return (obj.name === 'ATRASO') }).map((obj: any) => { return obj.completed })[0],
        salida_antes: this.task.subtasks.filter(obj => { return (obj.name === 'SALIDA ANTICIPADA') }).map((obj: any) => { return obj.completed })[0],
        almuerzo: this.task.subtasks.filter(obj => { return (obj.name === 'ALIMENTACION') }).map((obj: any) => { return obj.completed })[0],
        h_trab: this.task.subtasks.filter(obj => { return (obj.name === 'HORAS TRABAJADAS') }).map((obj: any) => { return obj.completed })[0],
        h_supl: this.task.subtasks.filter(obj => { return (obj.name === 'HORAS SUPLEMENTARIAS') }).map((obj: any) => { return obj.completed })[0],
        h_ex_LV: this.task.subtasks.filter(obj => { return (obj.name === 'HORAS EXTRAS L-V') }).map((obj: any) => { return obj.completed })[0],
        h_ex_SD: this.task.subtasks.filter(obj => { return (obj.name === 'HORAS EXTRAS S-D') }).map((obj: any) => { return obj.completed })[0]
      }

      let jsonTask = JSON.stringify(ObjetoJSON)
      console.log(jsonTask);
      sessionStorage.setItem('arrayConfigAsistencia', jsonTask)
      this.toastr.success('Configuración guardada', '', {
        timeOut: 6000,
      })
      this.dialogRef.close(true)
    }

  }
}
