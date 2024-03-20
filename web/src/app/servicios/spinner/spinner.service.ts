import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  public visibility = new BehaviorSubject<boolean>(false);

  show() {
    this.visibility.next(true);
    console.log("visible");
  }

  hide() {
    this.visibility.next(false);
    console.log("oculto");
  }
}
