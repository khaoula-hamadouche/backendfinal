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
  selector: 'app-lancement-type', // Nom de votre composant
  templateUrl: './lancement-type.component.html', // Créez ce fichier HTML
  styleUrls: ['./lancement-type.component.scss'], // Créez ce fichier CSS si nécessaire
  standalone: true,
  imports: [
    AgGridAngular, CommonModule, TextColorDirective, CardComponent,
    CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule, FormsModule
  ],
})
export class LancementTypeComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  columnDefs: ColDef[] = [
    { headerName: 'Intitulé', field: 'intitule', sortable: true, filter: true, resizable: true },
    { headerName: 'Numéro Dossier', field: 'numeroDossier', sortable: true, filter: true, resizable: true },
    {
      headerName: "État", field: "etat", sortable: true, filter: true,

      cellStyle: (params) => this.getEtatTextColorStyle(params)
    }, // Ajout de la colonne Etat
    { headerName: 'Type Lancement', field: 'typeLancement', sortable: true, filter: true, resizable: true },
    { headerName: 'Date Soumission', field: 'dateSoumission', sortable: true, filter: 'agDateColumnFilter', valueFormatter: (params) => this.formatDate(params.value) },
    { headerName: 'Chargé', field: 'chargeDossier', sortable: true, filter: true, resizable: true },
    { headerName: 'Montant Estimé', field: 'montantEstime', sortable: true, filter: true, resizable: true },
    { headerName: 'Budget Estimé', field: 'budgetEstime', sortable: true, filter: true, resizable: true },
    { headerName: 'Delai Realisation', field: 'delaiRealisation', sortable: true, filter: true, resizable: true },
    { headerName: 'Typologie de marche', field: 'typologidemarche', sortable: true, filter: true, resizable: true },
    { headerName: 'Garantie', field: 'garantie', sortable: true, filter: true, resizable: true },
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
              next: () => this.loadAllLancements(), // Recharge toutes les données
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
  defaultColDef = { flex: 1, minWidth: 120, resizable: true };
  paginationPageSize = 10;
  paginationPageSizeSelector = [1, 5, 10];

  constructor(
    private dossierService: DossierService,
    private router: Router,
    private renderer: Renderer2,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllLancements();
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  loadAllLancements(): void {
    this.loading = true;
    this.errorMessage = null;
    const types = [ 'APPEL_OFFRE_LANCEMENT','Consultation_Prestataire_de_Lancement', 'Consultation_Procurement_de_Lancement'];

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
              fileDetails: dossier.fileDetails,
              chargeDossier: dossier.chargeDossier?.name || 'N/A',
              typeLancement: dossier.typePassation, // Utiliser le type de passation comme type de lancement ici
              etat: dossier.etat,
              ...this.extractLancementSpecificDetails(dossier.details, dossier.typePassation),
            })));
          }
          return acc;
        }, []);
        this.loading = false;
        console.log('✅ Toutes les données de lancement chargées (avec user access):', this.rowData);
      })
      .catch(error => {
        this.errorMessage = 'Erreur lors du chargement des données de lancement.';
        this.loading = false;
        console.error('❌ Erreur lors du chargement des données de lancement (avec user access):', error);
      });
  }

  extractLancementSpecificDetails(details: any, typePassation: string): any {
     if (typePassation === 'Consultation_Prestataire_de_Lancement' || typePassation === 'Consultation_Procurement_de_Lancement'||  typePassation === 'APPEL_OFFRE_LANCEMENT') {
      return {
        montantEstime: details?.montantEstime ?? 'N/A',
        budgetEstime: details?.budgetEstime ?? 'N/A',
        garantie: details?.garantie ?? 'N/A',
        delaiRealisation: details?.delaiRealisation ?? 'N/A',
        typologidemarche: details?.typologidemarche ?? 'N/A' ,
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
        (dossier.typeLancement && dossier.typeLancement.toLowerCase().includes(query)) ||
        (dossier.dateSoumission && this.formatDate(dossier.dateSoumission).toLowerCase().includes(query)) ||
        (typeof dossier.fileDetails === 'object' && Object.keys(dossier.fileDetails).some(fileName => fileName.toLowerCase().includes(query))) ||
        (dossier.chargeDossier && dossier.chargeDossier.toLowerCase().includes(query)) ||
        (dossier.montantEstime && dossier.montantEstime.toString().toLowerCase().includes(query)) ||
        (dossier.budgetEstime && dossier.budgetEstime.toString().toLowerCase().includes(query)) ||
        (dossier.dureeContrat && dossier.dureeContrat.toString().toLowerCase().includes(query)) ||
        (dossier.dureeRealisation && dossier.dureeRealisation.toString().toLowerCase().includes(query))
      // Ajoutez ici d'autres propriétés spécifiques pour la recherche si nécessaire
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
