import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-ver-timbre',
  templateUrl: './ver-timbre.component.html',
  styleUrls: ['./ver-timbre.component.css']
})
export class VerTimbreComponent implements OnInit{



  constructor(
    public ventana: MatDialogRef<VerTimbreComponent>,
  ){}

  ngOnInit() {
    
  }

}
