import { Injectable } from '@angular/core';

interface Scripts {
  name: string;
  src: string;
}

export const ScriptStore: Scripts[] = [
  { name: 'pdfMake', src: 'assets/build/pdfmake.min.js' },
  { name: 'vfsFonts', src: 'assets/build/vfs_fonts.js' }
];

@Injectable({
  providedIn: 'root'
})
export class ScriptService {

  private scripts: any = {};

  constructor() {
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });
  }

  load(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      // RESOLVE IF ALREADY LOADED
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      } else {
        // LOAD SCRIPT
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        script.onload = () => {
          this.scripts[name].loaded = true;
          resolve({ script: name, loaded: true, status: 'Loaded' });
        };
        script.onerror = (error: any) => reject({ script: name, loaded: false, status: 'Failed to load' });
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }

}
