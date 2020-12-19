import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  constructor() { }

  save(key: string, obj: any) {
    localStorage.setItem(key, obj);
  }

  retrieve(key: string): any {
    return localStorage.getItem(key);
  }

  remove(key: string) {
    return localStorage.removeItem(key);
  }

  freePersistence() {
    localStorage.clear();
  }
}
