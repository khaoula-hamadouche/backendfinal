import { AfterViewInit, Component, OnInit, Renderer2 } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { DossierService } from "../../../service/dossier.service";
import { CommonModule } from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { Router } from '@angular/router'; // Importation du service Router
import {
  CardBodyComponent, CardComponent, ColComponent, RowComponent, TextColorDirective
} from "@coreui/angular";
import {
  ClientSideRowModelModule, ColDef, GridReadyEvent, ModuleRegistry,
  NumberFilterModule, TextFilterModule, ValidationModule, PaginationModule,
  DateFilterModule, NumberEditorModule, TextEditorModule, ColumnAutoSizeModule, CellStyleModule, ICellRendererParams
} from "ag-grid-community";
import {IconDirective} from "@coreui/icons-angular";

ModuleRegistry.registerModules([
  ColumnAutoSizeModule, NumberEditorModule, TextEditorModule, TextFilterModule,
  NumberFilterModule, PaginationModule, ClientSideRowModelModule, ValidationModule,
  DateFilterModule, CellStyleModule
]);

@Component({
  selector: "app-dossier",
  standalone: true,
  imports: [AgGridAngular, CommonModule, CardComponent, CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule, IconDirective, FormsModule],
  templateUrl: "./dossier.component.html",
  styleUrls: ["./dossier.component.scss"],
})
export class DossierComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  columnDefs: ColDef[] = [
    { headerName: "Numéro Dossier", field: "numero", sortable: true, filter: true },
    { headerName: "Intitulé", field: "intitule", sortable: true, filter: true },
    { headerName: "Type Passation", field: "typePassation", sortable: true, filter: true },
    { headerName: "État", field: "etat", sortable: true, filter: true,

      cellStyle: (params) => this.getEtatTextColorStyle(params)
    },
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




// Méthode pour retourner une couleur en fonction de l'état du dossier
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

  constructor(private dossierService: DossierService, private router: Router, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.getDossiers();
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  getDossiers(): void {
    this.loading = true;
    this.errorMessage = null;

    this.dossierService.getAllDossiers().subscribe({
      next: (data) => {
        console.log("✅ Données reçues :", data);

        this.rowData = data.map(dossier => {
          const mappedRow = {
            numero: dossier?.dossier?.numeroDossier?.toString() || '',
            intitule: dossier?.dossier?.intitule || '',
            typePassation: dossier?.dossier?.typePassation || '',
            dateSoumission: dossier?.dossier?.dateSoumission,
            etat: dossier?.dossier?.etat || '',
            chargeDossier: dossier.chargeDossier?.name || 'N/A',

            fileDetails: dossier.fileDetails,
            id: dossier?.dossier?.id  // Ajoutez l'ID du dossier ici
          };
          return mappedRow;
        });

        this.filteredData = this.rowData.slice();
        this.loading = false;
      },
      error: (err) => {
        console.error("❌ Erreur lors du chargement des dossiers :", err);
        this.errorMessage = "Erreur lors du chargement des dossiers. Veuillez réessayer.";
        this.loading = false;
      }
    });
  }

  private formatDate(date: string | null): string {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
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
    if (!target || !target.value) return;

    const query = target.value.toLowerCase();

    this.filteredData = this.rowData.filter(dossier =>
      (dossier.numero && dossier.numero.toLowerCase().includes(query)) ||
      (dossier.intitule && dossier.intitule.toLowerCase().includes(query)) ||
      (dossier.typePassation && dossier.typePassation.toLowerCase().includes(query)) ||
      (dossier.dateSoumission && this.formatDate(dossier.dateSoumission).toLowerCase().includes(query)) ||
      (dossier.etat && dossier.etat.toLowerCase().includes(query)) ||
      (typeof dossier.fileDetails === 'object' && Object.keys(dossier.fileDetails).some(fileName => fileName.toLowerCase().includes(query)))
    );
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }
  generatePdfReport() {
    window.open('http://localhost:9091/generate-dossier-pdf', '_blank'); // Changed to plural
  }
  selectedType: string = '';
  onTypeChange(): void {
    if (this.selectedType) {
      const encodedType = encodeURIComponent(this.selectedType);
      this.router.navigate([`/dossier/${encodedType}`]);
    }
  }

}
