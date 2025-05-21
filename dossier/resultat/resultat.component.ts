import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { DossierService } from '../../../service/dossier.service';
import { CommonModule } from "@angular/common";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatList, MatListItem} from "@angular/material/list";
import {MatProgressBar} from "@angular/material/progress-bar";

import {
  MatStep,
  MatStepLabel,
  MatStepper,
  MatStepperModule,
  MatStepperNext,
  MatStepperPrevious
} from "@angular/material/stepper";
import {UserService} from "../../../service/user.service";
import {HttpClient} from "@angular/common/http";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";

@Component({
  selector: 'app-resultat',
  templateUrl: './resultat.component.html',
  imports: [
    ReactiveFormsModule, CommonModule, MatButton, MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatIcon, MatList, MatListItem, MatProgressBar, MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious,

    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCard,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatCardHeader,
    MatProgressBar,
    MatList,
    MatListItem
  ],
  styleUrls: ['./resultat.component.scss']
})
export class ResultatComponent implements OnInit {
  resultatForm!: FormGroup;
  dossierId!: number;
  resultatExistant: any = null;  // Contiendra le résultat récupéré (ou null)
  isLoading = true;

  resultats: any[] = [];
  loadingResultats: boolean = false;
  errorResultats: string | null = null;
  chargeDossierMap: { [id: number]: string } = {};
  dossierDetails: any;
  errorMessage: string | null = null;
  infoFormGroup: FormGroup = this._formBuilder.group({});
  detailsFormGroup: FormGroup = this._formBuilder.group({});
  filesFormGroup: FormGroup = this._formBuilder.group({});
  doneFormGroup: FormGroup = this._formBuilder.group({
    doneCtrl: [false],
    compteRenduCtrl: [''],

  });


  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private _formBuilder: FormBuilder,
    private dossierService: DossierService,
    private router: Router,

    private userService: UserService,


  private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadDossierDetails();
    this.dossierId = +this.route.snapshot.paramMap.get('id')!;
    this.loadResultats(this.dossierId);
    this.dossierId = Number(this.route.snapshot.paramMap.get('id'));
    this.resultatForm = this.fb.group({
      resultat: ['', Validators.required],
      compteRendu: ['', Validators.required]
    });

    // Charger le résultat existant
    this.dossierService.getResultatByDossierId(this.dossierId).subscribe({
      next: (res) => {
        if (res) {
          this.resultatExistant = res;
          // Pré-remplir le formulaire au cas où on voudrait modifier (optionnel)
          this.resultatForm.patchValue({
            resultat: res.resultat,
            compteRendu: res.compteRendu
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        // S'il n'y a pas de résultat, on reste sur formulaire vide
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.resultatForm.invalid) return;

    const resultat = this.resultatForm.value.resultat;
    const compteRendu = this.resultatForm.value.compteRendu;

    this.dossierService.ajouterResultatEtCompteRendu(this.dossierId, resultat, compteRendu).subscribe({
      next: () => {
        alert('✅ Résultat et compte rendu ajoutés avec succès !');
        this.router.navigate(['/dossier']);  // Ou autre route
      },
      error: (err) => {
        console.error('❌ Erreur lors de l’envoi du résultat :', err);
      }
    });
  }








  loadDossierDetails(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.dossierService.getDossierById(id).subscribe({
      next: (data) => {
        this.dossierDetails = data;
        console.log('✅ Détails du dossier chargés:', this.dossierDetails);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des détails du dossier.';
        console.error('❌ Erreur lors du chargement des détails du dossier:', error);
      }
    });
  }

  submitForm(): void {
    if (this.doneFormGroup.valid) {
      const compteRendu = this.doneFormGroup.value.compteRenduCtrl;
      const estTermine = this.doneFormGroup.value.doneCtrl;
      const dossierId = this.dossierDetails?.dossier?.id;

      console.log('Compte Rendu:', compteRendu);
      console.log('Dossier Terminé:', estTermine);
      console.log('ID du Dossier:', dossierId);

      // Ici, vous pouvez appeler votre service pour enregistrer le compte rendu et l'état du dossier.
    } else {
      alert('Veuillez remplir le compte rendu si nécessaire.');
    }
  }

  protected readonly Object = Object;


  onChangerEtat(id: number, nouvelEtat: string): void {
    if (!id) {
      console.error('ID de dossier manquant.');
      return;
    }

    this.dossierService.changerEtatDossier(id, nouvelEtat).subscribe({
      next: (response) => {
        console.log('État changé avec succès', response);
        // Redirection après succès
        this.router.navigate(['/dossier/dossier']);
      },
      error: (error) => {
        console.error('Erreur lors du changement d\'état :', error);
        // Ici tu peux afficher un message d'erreur à l'utilisateur si tu veux
      }
    });
  }
  predictionResultRF: any = null;
  predictionResultSVM: any = null;
  predictionResultxgboost: any = null;
  predictionResultknn: any = null;
  predictionResultAdaBoost: any = null;
  predictionResultNaiveBayes: any = null;
  loadingIA: boolean = false;

  verifyWithIA() {
    this.loadingIA = true;
    this.predictionResultRF = null;
    this.predictionResultSVM = null;
    this.predictionResultxgboost =null;
    this.predictionResultknn =null;
    this.predictionResultAdaBoost = null;
    this.predictionResultNaiveBayes = null;

    const dossier = {
      'Typologie du marché': this.dossierDetails?.details?.typologidemarche,
      'Montant du contrat': this.dossierDetails?.details?.montantContrat,
      'Garantie': this.dossierDetails?.details?.garantie ,
      'Délai de réalisation': this.dossierDetails?.details?.delaiRealisation,
      'Expérience fournisseur': this.dossierDetails?.details?.experiencefournisseur,
      'Nombre de projets similaires': this.dossierDetails?.details?.nombredeprojetssimilaires,
      'Notation interne': this.dossierDetails?.details?.notationinterne,
      'Chiffre d\'affaire': this.dossierDetails?.details?.chiffreaffaire,
      'Situation fiscale': this.dossierDetails?.details?.situationfiscale,
      'Fournisseur blacklisté': this.dossierDetails?.details?.fournisseurblacklist
    };
    console.log('donnees ia charge  avec succès', dossier);

    this.http.post<any>('http://localhost:5000/predict', dossier).subscribe({
      next: (response) => {
        console.log('results ia  charge  avec succès', response);
        this.predictionResultRF = response.RandomForest;
        this.predictionResultSVM = response.SVM;
        this.predictionResultxgboost = response.XGBoost;
        this.predictionResultknn = response.KNN;
        this.predictionResultAdaBoost= response.AdaBoost;
        this.predictionResultNaiveBayes = response.NaiveBayes;
        this.loadingIA = false;
      },
      error: (err) => {
        console.error('Erreur de prédiction IA :', err);
        this.loadingIA = false;
      }
    });
  }
  loadResultats(id: number) {
    this.loadingResultats = true;
    this.errorResultats = null;
    this.resultats = [];

    this.dossierService.getAllResultatsByDossierId(id).subscribe({
      next: (data) => {
        const resultatsAvecInfos: any[] = [];

        data.forEach((resultat: any) => {
          this.userService.getUserById(resultat.chargeDossierId).subscribe({
            next: (user) => {
              resultat.chargeDossierName = user.name;
              resultat.chargeDossierEmail = user.email;
              resultatsAvecInfos.push(resultat);

              if (resultatsAvecInfos.length === data.length) {
                this.resultats = resultatsAvecInfos;
                this.loadingResultats = false;
              }
            },
            error: () => {
              resultat.chargeDossierName = 'Inconnu';
              resultat.chargeDossierEmail = 'Inconnu';
              resultatsAvecInfos.push(resultat);

              if (resultatsAvecInfos.length === data.length) {
                this.resultats = resultatsAvecInfos;
                this.loadingResultats = false;
              }
            }
          });
        });

        if (data.length === 0) {
          this.loadingResultats = false;
        }
      },
      error: () => {
        this.errorResultats = "Erreur lors du chargement des résultats";
        this.loadingResultats = false;
      }
    });
  }

}
