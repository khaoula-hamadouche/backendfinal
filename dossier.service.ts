import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
export interface BlacklistDTO {
  denomination: string;
  activite: string;
  structureDemandeExclusion: string;
  dateExclusion: string;
  motifs: string;
  dureeExclusion: number;
}
interface Dossier {
  numeroDossier: string;
  intitule: string;
  typePassation: 'APPEL_OFFRE_LANCEMENT' | 'Consultation_Prestataire_de_Lancement' | 'Consultation_Procurement_de_Lancement' |
    'APPEL_OFFRE_ATTRIBUTION' | 'Consultation_Prestataire_dAttribution' | 'Consultation_Procurement_dAttribution' |
    'GRE_A_GRE' | 'AVENANT';
  montantEstime?: number;
  budgetEstime?: number;
  dureeContrat?: number;
  dureeRealisation?: number;
  nomFournisseur?: string;
  montantContrat?: number;
  fournisseurEtranger?: boolean;
  fournisseurEtrangerInstallationPermanente?: boolean;
  originePaysNonDoubleImposition?: boolean;
  numeroContrat?: string;
  dateExpirationContrat?: string;
  dateSignatureContrat?: string;
  objetAvenant?: string;
  montantAvenant?: number;
  dureeAvenant?: number;
  nouveauMontantContrat?: number;
  nouvelleDureeContrat?: number;
  // Si tu as d'autres champs spécifiques pour chaque type de dossier, ajoute-les ici
}

@Injectable({
  providedIn: 'root',
})
export class DossierService {
  private apiUrl = 'http://localhost:8085/api/dossiers';
  private passationUrl = 'http://localhost:8085/api/passations'; // API pour Enum
  private  pdfUrl = 'http://localhost:9091/generate-merged-files-pdf';
 private listUrl  = 'http://localhost:8086/blacklist';
  constructor(private http: HttpClient) {}

  ajouterDossier(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { withCredentials: true });
  }

  getPassations(): Observable<string[]> {
    return this.http.get<string[]>(this.passationUrl, {withCredentials: true});


  }

  deleteDossier(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`,{withCredentials: true});
  }
  getDossiersByTypeOnly(typePassation: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-type-only/${typePassation}`,{withCredentials: true});
  }
  getDossiersByType(typePassation: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-type/${typePassation}`,{withCredentials: true});
  }
  updateDossier(dossierId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${dossierId}`, formData, { withCredentials: true });
  }
  getDossierById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`,{withCredentials: true});
  }
  getDossierByNumeroDossier(numeroDossier: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/byNumeroDossier/${numeroDossier}`, { withCredentials: true });
  }
  mergePdfFiles(files: string[],id: number): Observable<any> {
    return this.http.post<any>(`${this.pdfUrl}/${id}`, {withCredentials: true});
  }
  getAllDossiers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`,{withCredentials: true});
  }

  addToBlacklist(data: BlacklistDTO): Observable<any> {
    return this.http.post(`${this.listUrl}`, data, { withCredentials: true });
  }

  checkFournisseur(nomFournisseur: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.listUrl}/check?nomFournisseur=${encodeURIComponent(nomFournisseur)}`, { withCredentials: true });
  }
  changerEtatDossier(id: number, nouvelEtat: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/changer-etat?nouvelEtat=${nouvelEtat}`, {withCredentials: true });
  }
  getStatsParEtat(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>('http://localhost:8085/api/dossiers/stats/etat');
  }
  ajouterResultatEtCompteRendu(idDossier: number, resultat: string, compteRendu: string) {
    const params = new HttpParams()
      .set('resultat', resultat)
      .set('compteRendu', compteRendu);

    return this.http.post(
      `http://localhost:8085/api/resultats/dossiers/${idDossier}/resultat`,
      null,  // pas de body
      { params: params, withCredentials: true }
    );
  }

  getResultatByDossierId(dossierId: number) {
    return this.http.get<any>(`http://localhost:8085/api/resultats/dossiers/${dossierId}/resultat`, {withCredentials: true });
  }

  getAllResultatsByDossierId(id: number) {
    return this.http.get<any[]>(`http://localhost:8085/api/resultats/dossiers/${id}/resultats`, {withCredentials: true });
  }



}
