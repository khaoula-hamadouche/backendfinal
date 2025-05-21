import { AfterViewInit, Component, OnInit, Renderer2 } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { DossierService } from "../../../service/dossier.service";
import { CommonModule } from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  CardBodyComponent, CardComponent, ColComponent, RowComponent, TextColorDirective
} from "@coreui/angular";
import {
  ClientSideRowModelModule, ColDef, GridReadyEvent, ModuleRegistry,
  NumberFilterModule, TextFilterModule, ValidationModule, PaginationModule,
  DateFilterModule, NumberEditorModule, TextEditorModule, ColumnAutoSizeModule, CellStyleModule, ICellRendererParams
} from "ag-grid-community";
import { Router } from "@angular/router";

ModuleRegistry.registerModules([
  ColumnAutoSizeModule, NumberEditorModule, TextEditorModule, TextFilterModule,
  NumberFilterModule, PaginationModule, ClientSideRowModelModule, ValidationModule,
  DateFilterModule, CellStyleModule
]);

@Component({
  selector: 'app-avenant',
  templateUrl: './avenant.component.html',
  styleUrls: ['./avenant.component.scss'],
  standalone: true,
  imports: [
    AgGridAngular, CommonModule, TextColorDirective, CardComponent,
    CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule, FormsModule
  ],
})
export class AvenantComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  columnDefs: ColDef[] = [
    { headerName: 'Numéro Dossier', field: 'numeroDossier', sortable: true, filter: true, resizable: true },

    { headerName: 'Intitulé', field: 'intitule', sortable: true, filter: true, resizable: true },
    { headerName: "État", field: "etat", sortable: true, filter: true,

      cellStyle: (params) => this.getEtatTextColorStyle(params)
    },
    { headerName: 'Numero Contrat', field: 'numeroContrat', sortable: true, filter: true, resizable: true },
    { headerName: 'date Signature Contrat', field: 'dateSignatureContrat', sortable: true, filter: true, resizable: true },
    { headerName: 'Durée Contrat', field: 'dureeContrat', sortable: true, filter: true, resizable: true },
    { headerName: 'date Expiration Contrat', field: 'dateExpirationContrat', sortable: true, filter: true, resizable: true },
    { headerName: 'montant Contrat', field: 'montantContrat', sortable: true, filter: true, resizable: true },
    { headerName: 'objet Avenant', field: 'objetAvenant', sortable: true, filter: true, resizable: true },
    { headerName: 'montant Avenant', field: 'montantAvenant', sortable: true, filter: true, resizable: true },
    { headerName: 'duree Avenant', field: 'dureeAvenant', sortable: true, filter: true, resizable: true },
    { headerName: 'nouveau Montant Contrat', field: 'nouveauMontantContrat', sortable: true, filter: true, resizable: true },
    { headerName: 'nouvelle Duree  Contrat', field: 'nouvelleDureeContrat', sortable: true, filter: true, resizable: true },
    { headerName: 'Chargé', field: 'chargeDossier', sortable: true, filter: true, resizable: true },
    {
      headerName: "Date Soumission",
      field: "dateSoumission",
      sortable: true,
      filter: "agDateColumnFilter",
      valueFormatter: (params) => this.formatDate(params.value),
      valueGetter: (params) => params.data?.dateSoumission ? new Date(params.data.dateSoumission) : null,
    },
    {
      headerName: 'Fichiers',
      field: 'fileDetails',
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value || typeof params.value !== 'object') return '';
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-sm';
        button.innerText = '📁 Voir ';
        const dossierId = params.data?.id;
        button.addEventListener('click', () => {
          this.router.navigate([`/dossier/dossiers/${dossierId}/fichiers`]);
        });
        const fragment = document.createDocumentFragment();
        fragment.appendChild(button);
        return fragment;
      },
      width: 250,
    },
    {
      headerName: 'Action',
      field: 'action',
      cellRenderer: (params: ICellRendererParams) => {
        const button = document.createElement('button');
        button.className = 'btn btn-success btn-sm';
        button.innerText = '🛠️ Traitement';
        const dossierId = params.data?.id;

        button.addEventListener('click', () => {
          if (dossierId) {
            // Appeler le service pour changer l'état AVANT de naviguer
            this.dossierService.changerEtatDossier(dossierId, 'EN_TRAITEMENT').subscribe({
              next: () => {
                // Quand l'état est changé avec succès, on navigue
                this.router.navigate([`/dossier/traitement/${dossierId}`]);
              },
              error: (error) => {
                console.error('Erreur lors du changement d\'état', error);
              }
            });
          }
        });

        const fragment = document.createDocumentFragment();
        fragment.appendChild(button);
        return fragment;
      },
      width: 200,
    }

  ];

  defaultColDef = { flex: 1, minWidth: 120, resizable: true };
  paginationPageSize = 10;
  paginationPageSizeSelector = [1, 5, 10];

  constructor(private dossierService: DossierService, private router: Router, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.getDossiersByTypeOnly();
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }
  getEtatTextColorStyle(params: any): any {
    if (params.value === 'EN_ATTENTE') {
      return { 'color': '#ffeb3b', 'font-weight': 'bold' };  // Jaune
    } else if (params.value === 'VALIDE') {
      return { 'color': '#4caf50', 'font-weight': 'bold' };  // Vert
    } else if (params.value === 'REJETE') {
      return { 'color': '#f44336', 'font-weight': 'bold' };  // Rouge
    }else if (params.value === 'EN_TRAITEMENT') {
      return { 'color': '#0d0795', 'font-weight': 'bold' };  // Rouge
    }
    return {};
  }
  getDossiersByTypeOnly(): void {
    this.loading = true;
    this.errorMessage = null;

    this.dossierService.getDossiersByTypeOnly("AVENANT").subscribe( (data) => {
        console.log("✅ Données reçues :", data);

        this.rowData = data.map((dossier: any) => ({
          id: dossier.id,
          intitule: dossier.intitule,
          numeroDossier: dossier.numeroDossier,
          typePassation: dossier.typePassation,
          dateSoumission: dossier.dateSoumission,
          fileDetails: dossier.fileDetails,
          chargeDossier: dossier.chargeDossier?.name || 'N/A',
          etat:dossier.etat,

          // Champs extraits depuis "details"
          numeroContrat: dossier.details?.numeroContrat?? 'N/A',
          dateSignatureContrat: dossier.details?.dateSignatureContrat ?? 'N/A',
          dureeContrat: dossier.details?.dureeContrat ?? 'N/A',
          dateExpirationContrat: dossier.details?.dateExpirationContrat ?? 'N/A',
          montantContrat: dossier.details?.montantContrat ?? 'N/A',
          objetAvenant: dossier.details?.objetAvenant ?? 'N/A',
          montantAvenant: dossier.details?.montantAvenant ?? 'N/A',
          dureeAvenant: dossier.details?.dureeAvenant ?? 'N/A',
          nouveauMontantContrat: dossier.details?.nouveauMontantContrat ?? 'N/A',
          nouvelleDureeContrat: dossier.details?.nouvelleDureeContrat?? 'N/A',

          // Correction ici : extraire 'name' de l'objet chargeDossier directement
        }));
        console.log("✅ rowData après mapping :", this.rowData); // Ajout de ce log
      },
      (error) => {
        console.error('❌ Erreur lors de la récupération des dossiers :', error);
      }
    );}

  private formatDate(date: string | null): string {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  addActionListeners() {
    const table = document.querySelector("ag-grid-angular");
    if (table) {
      this.renderer.listen(table, "click", (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "A") {
          alert(`Téléchargement de : ${target.innerText}`);
        }
      });
    }
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target || !target.value) {
      this.filteredData = [...this.rowData];
      return;
    }

    const query = target.value.toLowerCase();

    this.filteredData = this.rowData.filter(dossier =>
      (dossier.numeroDossier && dossier.numeroDossier.toLowerCase().includes(query)) ||
      (dossier.intitule && dossier.intitule.toLowerCase().includes(query)) ||
      (dossier.typePassation && dossier.typePassation.toLowerCase().includes(query)) ||
      (dossier.dateSoumission && this.formatDate(dossier.dateSoumission).toLowerCase().includes(query)) ||
      (dossier.etat && dossier.etat.toLowerCase().includes(query)) ||
      (typeof dossier.fileDetails === 'object' && Object.keys(dossier.fileDetails).some(fileName => fileName.toLowerCase().includes(query))) ||
      (dossier.numeroContrat && dossier.numeroContrat.toLowerCase().includes(query)) ||
      (dossier.dateSignatureContrat && dossier.dateSignatureContrat.toString().toLowerCase().includes(query)) ||
      (dossier.dureeContrat && dossier.dureeContrat.toString().toLowerCase().includes(query)) ||
      (dossier.dateExpirationContrat && dossier.dateExpirationContrat.toString().toLowerCase().includes(query)) ||
      (dossier.montantContrat && dossier.montantContrat.toString().toLowerCase().includes(query)) ||
      (dossier.objetAvenant && dossier.objetAvenant.toLowerCase().includes(query)) ||
      (dossier.montantAvenant && dossier.montantAvenant.toString().toLowerCase().includes(query)) ||
      (dossier.dureeAvenant && dossier.dureeAvenant.toString().toLowerCase().includes(query)) ||
      (dossier.nouveauMontantContrat && dossier.nouveauMontantContrat.toString().toLowerCase().includes(query)) ||
      (dossier.nouvelleDureeContrat && dossier.nouvelleDureeContrat.toString().toLowerCase().includes(query)) ||
      (dossier.chargeDossier && dossier.chargeDossier.toLowerCase().includes(query))
    );
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }
  selectedType: string = '';
  onTypeChange(): void {
    if (this.selectedType) {
      const encodedType = encodeURIComponent(this.selectedType);
      this.router.navigate([`/dossier/${encodedType}`]);
    }
  }
}
