import { Component, OnInit } from '@angular/core';
import { DossierService } from '../../../service/dossier.service';
import { CommonModule } from '@angular/common';
import { IconDirective } from "@coreui/icons-angular";
import {RouterLink} from "@angular/router";
import { HttpClient } from '@angular/common/http';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-file-link-renderer',
  imports: [CommonModule, IconDirective, FormsModule],
  templateUrl: "./file-link-renderer.component.html",
  styleUrls: ["./file-link-renderer.component.scss"],
  standalone: true
})
export class FileLinkRendererComponent  {
  country: string = '';
  city: string = '';
  apiResponse: any;
  errorMessage: string = '';

  constructor(private http: HttpClient) { }

  callApiWithLocation() {
    this.apiResponse = null;
    this.errorMessage = '';

    const apiUrl = 'http://localhost:8085/weather'; // Remplacez par l'URL de votre API
    const locationData = { country: this.country, city: this.city };

    this.http.post(apiUrl, locationData) // Adaptez la méthode HTTP selon votre API
      .subscribe(
        (response) => {
          this.apiResponse = response;
        },
        (error) => {
          this.errorMessage = 'Une erreur s\'est produite lors de l\'appel à l\'API.';
          console.error('Erreur API:', error);
        }
      );
  }
}
