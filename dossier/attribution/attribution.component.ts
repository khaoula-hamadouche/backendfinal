import { AfterViewInit, Component, OnInit } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { DossierService } from "../../../service/dossier.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import Swal from 'sweetalert2';

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
  selector: 'app-attribution',
  templateUrl: './attribution.component.html',
  styleUrls: ['./attribution.component.scss'],
  standalone: true,
  imports: [
    AgGridAngular, CommonModule, TextColorDirective, CardComponent,
    CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule, FormsModule
  ],
})
export class AttributionComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  nomFournisseur = '';
  isBlacklisted: boolean | null = null;
  nomBlacklistStatus: { [key: string]: boolean } = {};
  selectedType: string = '';

  columnDefs: ColDef[] = [
    { headerName: 'Numéro Dossier', field: 'numeroDossier', sortable: true, filter: true, resizable: true },
    { headerName: 'Intitulé', field: 'intitule', sortable: true, filter: true, resizable: true },
    { headerName: 'Type Passation', field: 'typePassation', sortable: true, filter: true, resizable: true },
    {
      headerName: "État", field: "etat", sortable: true, filter: true,
      cellStyle: (params) => this.getEtatTextColorStyle(params)
    },
    {
      headerName: 'Date Soumission', field: 'dateSoumission', sortable: true,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => this.formatDate(params.value)
    },
    { headerName: 'Chargé', field: 'chargeDossier', sortable: true, filter: true, resizable: true },
    {
      headerName: 'Nom de fournisseur',
      field: 'nomFournisseur',
      cellRenderer: (params: any) => this.renderNomFournisseur(params)
    },
    { headerName: 'Montant Contrat', field: 'montantContrat', sortable: true, filter: true, resizable: true },
    { headerName: 'Durée Contrat', field: 'dureeContrat', sortable: true, filter: true, resizable: true }, // Renommé pour éviter la confusion
    { headerName: 'delai Realisation', field: 'delaiRealisation', sortable: true, filter: true, resizable: true },
    { headerName: 'typologie de marche', field: 'typologidemarche', sortable: true, filter: true, resizable: true },
    { headerName: 'garantie', field: 'garantie', sortable: true, filter: true, resizable: true },
    { headerName: 'experience fournisseur', field: 'experiencefournisseur', sortable: true, filter: true, resizable: true },
    { headerName: 'nombre de projets similaires', field: 'nombredeprojetssimilaires', sortable: true, filter: true, resizable: true },
    { headerName: 'notation interne', field: 'notationinterne', sortable: true, filter: true, resizable: true },
    { headerName: 'chiffre affaire', field: 'chiffreaffaire', sortable: true, filter: true, resizable: true },
    { headerName: 'situation fiscale', field: 'situationfiscale', sortable: true, filter: true, resizable: true },
    { headerName: 'fournisseur blacklist', field: 'fournisseurblacklist', sortable: true, filter: true, resizable: true },
    { headerName: 'type fournisseur', field: 'typefournisseur', sortable: true, filter: true, resizable: true },
    { headerName: 'fournisseur Etranger Installation Permanente', field: 'fournisseurEtrangerInstallationPermanente', sortable: true, filter: true, resizable: true, valueFormatter: (params) => params.value ? 'Oui' : 'Non' },
    { headerName: 'Origine Pays Non Double Imposition', field: 'originePaysNonDoubleImposition', sortable: true, filter: true, resizable: true, valueFormatter: (params) => params.value ? 'Oui' : 'Non' },

    {
      headerName: 'Fichiers',
      field: 'fileDetails',
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value || typeof params.value !== 'object') return '';

        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-sm';
        button.innerText = '📁 Voir ';
        const dossierId = params.data?.id;  // ID du dossier
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

  defaultColDef = { flex: 1, minWidth: 150, resizable: true };
  paginationPageSize = 10;
  paginationPageSizeSelector = [1, 5, 10];

  constructor(
    private dossierService: DossierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllAttributions();
  }

  ngAfterViewInit(): void {}

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

  loadAllAttributions(): void {
    this.loading = true;
    this.errorMessage = null;
    const types = ['APPEL_OFFRE_ATTRIBUTION', 'Consultation_Prestataire_dAttribution', 'Consultation_Procurement_dAttribution'];

    Promise.all(types.map(type => this.dossierService.getDossiersByTypeOnly(type).toPromise()))
      .then(results => {
        const data = results.flat().map((dossier: any) => ({
          id: dossier.id,
          intitule: dossier.intitule,
          numeroDossier: dossier.numeroDossier,
          typePassation: dossier.typePassation,
          dateSoumission: dossier.dateSoumission,
          etat: dossier.etat,
          fileDetails: dossier.fileDetails,
          chargeDossier: dossier.chargeDossier?.name || 'N/A',
          ...this.extractAttributionSpecificDetails(dossier.details, dossier.typePassation),
        }));
        this.rowData = data;
        this.filteredData = [...data];
        this.loadBlacklistStatuses(data);
        this.loading = false;
      })
      .catch(error => {
        this.errorMessage = 'Erreur lors du chargement des données d\'attribution.';
        this.loading = false;
        console.error('Erreur attribution :', error);
      });
  }

  extractAttributionSpecificDetails(details: any, typePassation: string): any {
    if (['Consultation_Prestataire_dAttribution', 'Consultation_Procurement_dAttribution', 'APPEL_OFFRE_ATTRIBUTION'].includes(typePassation)) {
      return {
        nomFournisseur: details?.nomFournisseur ?? 'N/A',
        montantContrat: details?.montantContrat ?? 'N/A',
        dureeContrat: details?.dureeContrat ?? 'N/A',
        delaiRealisation: details?.delaiRealisation ?? 'N/A',
        typologidemarche: details?.typologidemarche?? 'N/A',
        garantie: details?.garantie?? 'N/A',
        experiencefournisseur: details?.experiencefournisseur ?? 'N/A',
        nombredeprojetssimilaires: details?.nombredeprojetssimilaires?? 'N/A',
        notationinterne: details?.notationinterne?? 'N/A',
        chiffreaffaire: details?.chiffreaffaire?? 'N/A',
        situationfiscale: details?.situationfiscale?? 'N/A',
        fournisseurblacklist: details?.fournisseurblacklist?? 'N/A',
        typefournisseur: details?.typefournisseur?? 'N/A',
        fournisseurEtrangerInstallationPermanente: details?.fournisseurEtrangerInstallationPermanente ?? false,
        originePaysNonDoubleImposition: details?.originePaysNonDoubleImposition ?? false,
      };
    }
    return {};
  }

  formatDate(date: string | null): string {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    const query = target.value.toLowerCase();

    if (!query) {
      this.filteredData = [...this.rowData];
      return;
    }

    this.filteredData = this.rowData.filter(dossier =>
      Object.values(dossier).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(query)
      )
    );
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onTypeChange(): void {
    if (this.selectedType) {
      const encodedType = encodeURIComponent(this.selectedType);
      this.router.navigate([`/dossier/${encodedType}`]);
    }
  }

  check() {
    this.dossierService.checkFournisseur(this.nomFournisseur).subscribe({
      next: (res) => {
        this.isBlacklisted = res === true;
        Swal.fire({
          icon: this.isBlacklisted ? 'error' : 'success',
          title: this.isBlacklisted ? 'Fournisseur blacklisté' : 'Fournisseur autorisé',
          text: this.isBlacklisted
            ? '⚠️ Ce fournisseur est dans la liste noire.'
            : '✅ Ce fournisseur n’est pas blacklisté.'
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la vérification.'
        });
      }
    });
  }

  loadBlacklistStatuses(data: any[]): void {
    const noms = data.map(d => d.nomFournisseur).filter(nom => nom && nom !== 'N/A');
    const uniqueNoms = Array.from(new Set(noms));

    uniqueNoms.forEach(nom => {
      this.dossierService.checkFournisseur(nom).subscribe({
        next: res => {
          this.nomBlacklistStatus[nom] = res === true;
        },
        error: err => {
          console.error(`Erreur vérification blacklist pour ${nom}`, err);
        }
      });
    });
  }

  renderNomFournisseur(params: any): string {
    const nom = params.value;
    const isBlacklisted = this.nomBlacklistStatus[nom];
    const color = isBlacklisted ? 'red' : 'green';
    return `<span style="color: ${color}; font-weight: bold;">${nom}</span>`;
  }
}
