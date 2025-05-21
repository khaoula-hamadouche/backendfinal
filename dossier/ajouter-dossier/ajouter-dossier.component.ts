import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DossierService } from '../../../service/dossier.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { MatList, MatListItem } from '@angular/material/list';
import { MatLine } from '@angular/material/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

interface FichierSupplementaire {
  nom: string;
  file: File | null;
}

@Component({
  selector: 'app-ajouter-dossier',
  templateUrl: './ajouter-dossier.component.html',
  styleUrls: ['./ajouter-dossier.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatCheckboxModule,
    MatDivider,
    MatList,
    MatListItem,
    MatLine,
    MatProgressSpinner,
  ],
})
export class AjouterDossierComponent implements OnInit {
  dossierForm!: FormGroup;
  passations: string[] = [];
  selectedFichiers: string[] = [];
  fichiersSupplementaires: FichierSupplementaire[] = [];
  fichiersRequis: { [key: string]: string[] } = {
    APPEL_OFFRE_LANCEMENT: [
      'Dossier de la consultation',
      'Lettre d’opportunité',
      'Fiche de validation',
      'Fiche analytique',
      'DST',
      'Visa budgetaire',
    ],
    Consultation_Prestataire_de_Lancement: [
      'Dossier de consultation',
      'Lettre d’opportunité',
      'Fiche de validation',
      'Fiche analytique',
      'DST',
      'Visa budgetaire',
    ],
    Consultation_Procurement_de_Lancement: [
      'Dossier de consultation',
      'Lettre d’opportunité',
      'Fiche de validation',
      'Fiche analytique',
      'DST',
      'Visa budgetaire',
    ],
    APPEL_OFFRE_ATTRIBUTION: [
      'Projet de Contrat',
      'PVPNR',
      'VISA Lancement CME',
      'Avis d’attribution',
      'Décision de commission adhoc',
      'DST',
      'Fiche de présentation',
      'Lettre d’invitation',
      'Offre financière',
      'PV Adhoc',
      'PV COET',
      'PV CEO',
      'PV COP Technique',
      'PV COP Financier',
    ],
    Consultation_Prestataire_dAttribution: [
      'Contrat',
      'PVCNR',
      'VISA CME',
      'Avis d’attribution',
      'Décision ad hoc',
      'DST',
      'Fiche de présentation',
      'Lettre d’invitation',
      'Offre financière',
      'PV Adhoc',
      'Situation SAP',
      'PV COET',
      'PV CEO',
      'PV COP Technique',
      'PV COP Financier',
    ],
    Consultation_Procurement_dAttribution: [
      'Contrat',
      'PVCNR',
      'VISA CME',
      'Avis d’attribution',
      'Décision ad hoc',
      'DST',
      'Fiche de présentation',
      'Lettre d’invitation',
      'Offre financière',
      'PV Adhoc',
      'Situation SAP',
      'PV COET',
      'PV CEO',
      'PV COP Technique',
      'PV COP Financier',
    ],
    GRE_A_GRE: [
      'Dossier de consultation',
      'Lettre d’opportunité',
      'Fiche de validation',
      'Rapport circonstancié',
    ],
    AVENANT: ['Lettre d’opportunité', 'Rapport circonstancié', 'Contrat'],
    RECOURS: ['Dossier de consultation', 'Lettre d’opportunité', 'Cahier des charges', 'Offre'],
  };

  DonneeRequis: { [key: string]: string[] } = {
    APPEL_OFFRE_LANCEMENT: [
      'typologidemarche',
      'garantie',
      'montantEstime',
      'budgetEstime',
      'delaiRealisation',
    ],
    Consultation_Prestataire_de_Lancement: [
      'typologidemarche',
      'garantie',
      'montantEstime',
      'budgetEstime',
      'delaiRealisation',
    ],
    Consultation_Procurement_de_Lancement: [
      'typologidemarche',
      'garantie',
      'montantEstime',
      'budgetEstime',
      'delaiRealisation',
    ],
    APPEL_OFFRE_ATTRIBUTION: [
      'nomFournisseur',
      'montantContrat',
      'dureeContrat',
      'delaiRealisation',
      'typologidemarche',
      'garantie',
      'experiencefournisseur',
      'nombredeprojetssimilaires',
      'notationinterne',
      'chiffreaffaire',
      'situationfiscale',
      'fournisseurblacklist',
      'typefournisseur',],
    Consultation_Prestataire_dAttribution: [
      'nomFournisseur',
      'montantContrat',
      'dureeContrat',
      'delaiRealisation',
      'typologidemarche',
      'garantie',
      'experiencefournisseur',
      'nombredeprojetssimilaires',
      'notationinterne',
      'chiffreaffaire',
      'situationfiscale',
      'fournisseurblacklist',
      'typefournisseur',] ,
    Consultation_Procurement_dAttribution: [
      'nomFournisseur',
      'montantContrat',
      'dureeContrat',
      'delaiRealisation',
      'typologidemarche',
      'garantie',
      'experiencefournisseur',
      'nombredeprojetssimilaires',
      'notationinterne',
      'chiffreaffaire',
      'situationfiscale',
      'fournisseurblacklist',
      'typefournisseur',],
    GRE_A_GRE: ['montantEstime',
      'budgetEstime',
      'dureeContrat',
      'delaiRealisation'],
    AVENANT: [
      'numeroContrat',
      'dateSignatureContrat',
      'dureeContrat',
      'dateExpirationContrat',
      'montantContrat',
      'objetAvenant',
      'montantAvenant',
      'dureeAvenant',
      'garantie',
    ],
    RECOURS: [],
  };

  champLabels: { [key: string]: string } = {

    montantEstime: 'Montant Estimé',
    budgetEstime: 'Budget Estimé',
    dureeContrat: 'Durée du Contrat',
    delaiRealisation: 'delai de Réalisation',
    nomFournisseur: 'Nom du Fournisseur',
    montantContrat: 'Montant du Contrat',
    numeroContrat: 'Numéro du Contrat',
    dateSignatureContrat: 'Date de Signature',
    dateExpirationContrat: 'Date d’Expiration',
    objetAvenant: 'Objet de l’Avenant',
    montantAvenant: 'Montant de l’Avenant',
    dureeAvenant: 'Durée de l’Avenant',
    typologidemarche: 'Typologie du marché',
    situationfiscale: 'Situation Fiscale',
    fournisseurblacklist: 'Fournisseur Blacklisté',
    typefournisseur: 'Type de Fournisseur',
    garantie: 'Garantie',
    experiencefournisseur: 'Expérience du Fournisseur',
    nombredeprojetssimilaires: 'Nombre de Projets Similaires',
    notationinterne: 'Notation Interne',
    chiffreaffaire: "Chiffre d'Affaires",
  };

  typologidemarcheOptions: string[] = ['Service', 'Fournitures', 'Travaux' , 'Etude'];
  garantieOptions: string[] = ['Aucune', 'Retenu', 'Caution'];
  situationFiscaleOptions: string[] = ['Conforme', 'Non conforme'];
  blacklistOptions: string[] = ['Oui', 'Non'];
  typefournisseurOptions: string[] = ['Local', 'ETRANGER'];

  afficherNomFichier: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dossierService: DossierService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dossierForm = this.fb.group({
      numeroDossier: ['', Validators.required],
      intitule: ['', Validators.required],
      typePassation: ['', Validators.required],
      fichiers: this.fb.array([]),
      nomFichierSuppl: [''],
      typefournisseur: [''],
      fournisseurEtrangerInstallationPermanente: [false], // Initialisation
      originePaysNonDoubleImposition: [false], // Initialisation
    });
    const typeFournisseurInitial = this.dossierForm.get('typefournisseur')?.value;
    if (typeFournisseurInitial) {
      this.onTypeFournisseurChange(typeFournisseurInitial);
    }

    this.dossierService.getPassations().subscribe({
      next: (data) => (this.passations = data),
      error: (err) => console.error('Erreur de récupération des passations', err),
    });

    // Initialize based on the default value of typePassation if any
    if (this.dossierForm.get('typePassation')?.value) {
      this.onTypePassationChange(this.dossierForm.get('typePassation')?.value);
    }
  }

  onTypePassationChange(type: string) {
    const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
    fichiersArray.clear();
    this.selectedFichiers = this.fichiersRequis[type] || [];

    if (this.selectedFichiers.length === 0) {
      console.log(`Aucun fichier requis pour ce type de passation: ${type}`);
    }

    this.selectedFichiers.forEach(() => {
      fichiersArray.push(this.fb.control(null));
    });

    const anciensChamps = Object.keys(this.dossierForm.controls).filter(
      (champ) =>
        !['numeroDossier', 'intitule', 'typePassation', 'fichiers', 'nomFichierSuppl', 'typefournisseur', 'fournisseurEtrangerInstallationPermanente', 'originePaysNonDoubleImposition'].includes(champ)
    );
    anciensChamps.forEach((champ) => this.dossierForm.removeControl(champ));

    const champsSpecifiques = this.DonneeRequis[type] || [];
    if (champsSpecifiques.length === 0) {
      console.log(`Aucun champ requis pour ce type de passation: ${type}`);
    }

    const champsSpecifiquess = this.DonneeRequis[type] || [];
    champsSpecifiquess.forEach((champ) => {
      const isCheck = this.isCheckbox(champ);
      if (this.dossierForm.contains(champ)) {
        this.dossierForm.get(champ)?.setValue(isCheck ? false : ''); // Update existing control
      } else {
        this.dossierForm.addControl(champ, this.fb.control(isCheck ? false : '', Validators.required)); // Add new control
      }
    });
  }

  onTypeFournisseurChange(type: string) {
    // Pas besoin de manipuler les contrôles ici car ils sont initialisés dans ngOnInit
  }

  isFournisseurEtranger(): boolean {
    return this.dossierForm.get('typefournisseur')?.value === 'ETRANGER';
  }

  isCheckbox(champ: string): boolean {
    return ['fournisseurEtrangerInstallationPermanente', 'originePaysNonDoubleImposition'].includes(champ);
  }
  afficherChampNomFichier() {
    this.afficherNomFichier = true;
  }
  ajouterFichierSupplementaire() {
    const nomFichier = this.dossierForm.get('nomFichierSuppl')?.value;
    if (nomFichier && nomFichier.trim() !== '') {
      this.fichiersSupplementaires = [...this.fichiersSupplementaires, { nom: nomFichier.trim(), file: null }];
      this.dossierForm.patchValue({ nomFichierSuppl: '' });

      // Add a new control to the 'fichiers' FormArray for the new file
      const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
      fichiersArray.push(this.fb.control(null));
      this.afficherNomFichier = false; // On cache le champ après l'ajout
    } else {
      alert('Veuillez entrer un nom pour le fichier supplémentaire.');
    }
    const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
    fichiersArray.push(this.fb.control(null));

  }

  onFileSelect(event: any, index: number) {
    const file = event.target.files[0];
    if (file && index < this.selectedFichiers.length) {
      const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
      fichiersArray.at(index).setValue(file);
    } else if (
      file &&
      index >= this.selectedFichiers.length &&
      index - this.selectedFichiers.length < this.fichiersSupplementaires.length
    ) {
      this.fichiersSupplementaires[index - this.selectedFichiers.length].file = file;
    }
  }

  isSubmitting = false;

  onSubmit(): void {
    if (this.dossierForm.invalid) return;

    this.isSubmitting = true;

    console.log('Valeurs du formulaire lors de la soumission:', this.dossierForm.value); // Ajout pour le débogage

    const formData = new FormData();
    formData.append('numeroDossier', this.dossierForm.value.numeroDossier);
    formData.append('intitule', this.dossierForm.value.intitule);
    formData.append('typePassation', this.dossierForm.value.typePassation);

    const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
    fichiersArray.controls.forEach((control, index) => {
      const file = control.value;
      if (file && index < this.selectedFichiers.length) {
        formData.append('files', file);
        formData.append('fileNames', this.selectedFichiers[index]);
      }
    });

    // Ajout des fichiers supplémentaires
    this.fichiersSupplementaires.forEach((fichier) => {
      if (fichier.file) {
        formData.append('files', fichier.file);
        formData.append('fileNames', fichier.nom);
      }
    });

    // Ajout des champs spécifiques au type sélectionné
    const champsSpecifiques = this.DonneeRequis[this.dossierForm.value.typePassation] || [];
    champsSpecifiques.forEach((key) => {
      const value = this.dossierForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    formData.append(
      'fournisseurEtrangerInstallationPermanente',
      this.dossierForm.value.fournisseurEtrangerInstallationPermanente
    );
    formData.append(
      'originePaysNonDoubleImposition',
      this.dossierForm.value.originePaysNonDoubleImposition
    );

    this.dossierService.ajouterDossier(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dossier/dossier']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Erreur lors de l’ajout du dossier', err);
        alert('Erreur lors de l’envoi du dossier.');
      },
    });
  }

  formatNumeroDossier(value: string | null): string {
    if (!value) {
      return '';
    }
    // Appliquer un format à la valeur, par exemple un format simple avec un préfixe
    const format = '2025/DOS/';
    let numero = value.replace(format, ''); // Supprime le préfixe, si déjà présent
    numero = numero.padStart(3, '0'); // Ajouter des zéros si nécessaire
    return format + numero; // Retourner le format complet
  }
}
