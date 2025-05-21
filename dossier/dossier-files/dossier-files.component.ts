import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DossierService } from '../../../service/dossier.service';
import { CommonModule } from '@angular/common';
import { IconDirective } from "@coreui/icons-angular";

@Component({
  selector: 'app-dossier-files',
  standalone: true,
  imports: [CommonModule, IconDirective],
  templateUrl: './dossier-files.component.html',
  styleUrls: ['./dossier-files.component.scss']
})
export class DossierFilesComponent implements OnInit {
  dossier: any;
  dossierId!: number;
  dossiers: any[] = [];

  constructor(
    private dossierService: DossierService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.dossierId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchDossierById(this.dossierId);
    this.fetchDossiers();

    if (this.dossier) {
      console.log('Numero Dossier:', this.dossier.numeroDossier);
    }
  }

  fetchDossiers() {
    this.dossierService.getAllDossiers().subscribe({
      next: (data) => {
        console.log("✅ Données reçues :", data);
        this.dossiers = data;
      },
      error: (err) => {
        console.error("❌ Erreur lors de la récupération des dossiers", err);
      }
    });
  }

  fetchDossierById(id: number) {
    this.dossierService.getDossierById(id).subscribe({
      next: (data) => {
        console.log('✅ Dossier récupéré (data complet) :', data);
        this.dossier = data.dossier;
      },
      error: (err) => {
        console.error('❌ Erreur lors de la récupération du dossier', err);
      }
    });
  }

  getFilesNames(fileDetails: any): string[] {
    return fileDetails ? Object.keys(fileDetails) : [];
  }


  openMergedPdf() {
    const url = `http://localhost:9091/generate-merged-files-pdf/${this.dossierId}`;
    window.open(url, '_blank');
  }

  generateSingleDossierPdf() {
    window.open(`http://localhost:9091/generate-dossier-pdf/${this.dossierId}`, '_blank');
  }

  openFile(fileIdOrUrl: string) {
    let fileUrl: string;
    // Vérifiez si la valeur ressemble déjà à une URL
    if (fileIdOrUrl.startsWith('http://') || fileIdOrUrl.startsWith('https://')) {
      fileUrl = fileIdOrUrl;
    } else {
      // Si ce n'est pas une URL, assumez que c'est un ID et construisez l'URL
      fileUrl = `http://localhost:8083/api/attachments/view/${fileIdOrUrl}`;
    }
    console.log('🔗 Ouvrir l\'URL :', fileUrl);
    window.open(fileUrl, '_blank');
  }


}
