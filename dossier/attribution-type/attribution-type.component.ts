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
import { AuthService } from "../../../service/auth.service"; // Import AuthService

ModuleRegistry.registerModules([
  ColumnAutoSizeModule, NumberEditorModule, TextEditorModule, TextFilterModule,
  NumberFilterModule, PaginationModule, ClientSideRowModelModule, ValidationModule,
  DateFilterModule, CellStyleModule
]);

@Component({
  selector: 'app-attribution-type',
  templateUrl: './attribution-type.component.html',
  styleUrls: ['./attribution-type.component.scss'],
  standalone: true,
  imports: [
    AgGridAngular, CommonModule, TextColorDirective, CardComponent,
    CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule, FormsModule
  ],
})
export class AttributionTypeComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  selectedType: string = '';

  columnDefs: ColDef[] = [
    { headerName: 'Intitulé', field: 'intitule', sortable: true, filter: true, resizable: true },
    { headerName: 'Numéro Dossier', field: 'numeroDossier', sortable: true, filter: true, resizable: true },
    { headerName: 'Type Passation', field: 'typePassation', sortable: true, filter: true, resizable: true },
    {
      headerName: "État", field: "etat", sortable: true, filter: true,
      cellStyle: (params) => this.getEtatTextColorStyle(params)
    },    { headerName: 'Date Soumission', field: 'dateSoumission', sortable: true, filter: 'agDateColumnFilter', valueFormatter: (params) => this.formatDate(params.value) },
    { headerName: 'Chargé', field: 'chargeDossier', sortable: true, filter: true, resizable: true },
    { headerName: 'Nom Fournisseur', field: 'nomFournisseur', sortable: true, filter: true, resizable: true },
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
    // Ajoutez ici d'autres colonnes spécifiques si nécessaire
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
      headerName: 'Actions',
      cellRenderer: (params: ICellRendererParams) => {
        const div = document.createElement('div');

        const editButton = document.createElement('button');
        editButton.className = 'btn btn-sm btn-primary edit-btn';
        editButton.innerText = 'Modifier';
        const dossierId = params.data?.id;
        editButton.addEventListener('click', () => {
          this.router.navigate([`/dossier/edit-dossier/${dossierId}`]);
        });

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.innerText = 'Supprimer';
        deleteButton.addEventListener('click', () => {
          if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
            this.dossierService.deleteDossier(dossierId).subscribe({
              next: () => this.loadAllAttributions(), // Recharge toutes les données
              error: (error) => {
                console.error('Erreur lors de la suppression du dossier :', error);
                alert("Erreur lors de la suppression du dossier.");
              }
            });
          }
        });

        div.appendChild(editButton);
        div.appendChild(deleteButton);
        return div;
      },
      width: 250,
      suppressSizeToFit: true,
    }
  ];

  defaultColDef = { flex: 1, minWidth: 150, resizable: true };
  paginationPageSize = 10;
  paginationPageSizeSelector = [1, 5, 10];

  constructor(
    private dossierService: DossierService,
    private router: Router,
    private renderer: Renderer2,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllAttributions();
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
  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  loadAllAttributions(): void {
    this.loading = true;
    this.errorMessage = null;
    const types = [ 'APPEL_OFFRE_ATTRIBUTION','Consultation_Prestataire_dAttribution', 'Consultation_Procurement_dAttribution'];

    Promise.all(types.map(type => this.dossierService.getDossiersByType(type).toPromise()))
      .then(results => {
        this.rowData = results.flat().reduce((acc, response) => {
          if (response && response.dossiers) {
            return acc.concat(response.dossiers.map((dossier: any) => ({
              id: dossier.id,
              intitule: dossier.intitule,
              numeroDossier: dossier.numeroDossier,
              typePassation: dossier.typePassation,
              dateSoumission: dossier.dateSoumission,
              etat: dossier.etat,
              fileDetails: dossier.fileDetails,
              chargeDossier: dossier.chargeDossier?.name || 'N/A',
              typeAttribution: dossier.typePassation, // Utiliser le type de passation comme type d'attribution ici
              ...this.extractAttributionSpecificDetails(dossier.details, dossier.typePassation),
            })));
          }
          return acc;
        }, []);
        this.loading = false;
        console.log('✅ Toutes les données d\'attribution chargées (avec user access):', this.rowData);
      })
      .catch(error => {
        this.errorMessage = 'Erreur lors du chargement des données d\'attribution.';
        this.loading = false;
        console.error('❌ Erreur lors du chargement des données d\'attribution (avec user access):', error);
      });
  }
  extractAttributionSpecificDetails(details: any, typePassation: string): any {
  if (typePassation === 'Consultation_Prestataire_dAttribution' || typePassation === 'Consultation_Procurement_dAttribution' || typePassation ==='APPEL_OFFRE_ATTRIBUTION') {
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
        (dossier.chargeDossier && dossier.chargeDossier.toLowerCase().includes(query)) ||
        (dossier.nomFournisseur && dossier.nomFournisseur.toLowerCase().includes(query)) ||
        (dossier.montantContrat && dossier.montantContrat.toString().toLowerCase().includes(query)) ||
        (dossier.dureeContratAttribution && dossier.dureeContratAttribution.toString().toLowerCase().includes(query)) ||
        (dossier.fournisseurEtranger && (dossier.fournisseurEtranger ? 'oui' : 'non').toLowerCase().includes(query)) ||
        (dossier.fournisseurEtrangerInstallationPermanente && (dossier.fournisseurEtrangerInstallationPermanente ? 'oui' : 'non').toLowerCase().includes(query)) ||
        (dossier.originePaysNonDoubleImposition && (dossier.originePaysNonDoubleImposition ? 'oui' : 'non').toLowerCase().includes(query)) ||
        (typeof dossier.fileDetails === 'object' && Object.keys(dossier.fileDetails).some(fileName => fileName.toLowerCase().includes(query)))
      // Ajoutez ici d'autres propriétés spécifiques pour la recherche si nécessaire
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
}
