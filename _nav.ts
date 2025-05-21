import { INavData } from '@coreui/angular';
import { StorageService } from '../../service/storage-service/storage.service';

export function getNavItems(storageService: StorageService): INavData[] {
  const permissions = storageService.getPermissions();
  const navItems: INavData[] = []; // ✅ Déclaration unique

  // Accueil
  navItems.push({
    name: 'Accueil',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
  });

  // Titre du menu
  navItems.push({
    title: true,
    name: 'Menu'
  });
  if (permissions.includes('getresultat')) {
    const analyseMenu: INavData = {
      name: 'Dossier CME ',
      url: '/dossier/verifier',
      iconComponent: { name: 'cil-description' },
      children: [],};

      navItems.push(analyseMenu);
    }
  // Gestion des utilisateurs
  if (permissions.includes('GETALLUSER') || permissions.includes('AJOUTERUSER')) {
    const userMenu: INavData = {
      name: 'Utilisateurs',
      url: '/base',
      iconComponent: { name: 'cil-puzzle' },
      children: [],
    };

    if (permissions.includes('GETALLUSER')) {
      userMenu.children!.push({
        name: 'Gestion des Utilisateurs',
        url: '/base/users',
        icon: 'nav-icon-bullet'
      });
    }

    if (userMenu.children!.length > 0) {
      navItems.push(userMenu);
    }
  }

  // Rôles
  if (
    permissions.includes('GETALLROLE') ||
    permissions.includes('AJOUTERROLE') ||
    permissions.includes('MODIFERROLE')
  ) {
    const roleMenu: INavData = {
      name: 'Rôles',
      url: '/roles',
      iconComponent: { name: 'cil-people' },
      children: [],
    };

    if (permissions.includes('GETALLROLE')) {
      roleMenu.children!.push({
        name: 'Gestion des rôles',
        url: '/roles/list',
        icon: 'nav-icon-bullet'
      });
    }

    if (roleMenu.children!.length > 0) {
      navItems.push(roleMenu);
    }
  }

  // E-mails
  if (permissions.includes('SENDEMAIL') || permissions.includes('SEEEMAIL')) {
    const emailMenu: INavData = {
      name: 'E-mails',
      url: '/mails',
      iconComponent: { name: 'cil-envelope-open' },
      children: [],
    };

    if (permissions.includes('SENDEMAIL')) {
      emailMenu.children!.push({
        name: 'Envoyer un e-mail',
        url: '/mails/send',
        icon: 'nav-icon-bullet'
      });
    }

    if (permissions.includes('SEEEMAIL')) {
      emailMenu.children!.push(
        {
          name: 'Voir les e-mails',
          url: '/mails/all',
          icon: 'nav-icon-bullet'
        },
        {
          name: 'E-mails envoyés',
          url: '/mails/sent',
          icon: 'nav-icon-bullet'
        },
        {
          name: 'Boîte de réception',
          url: '/mails/received',
          icon: 'nav-icon-bullet'
        }
      );
    }

    if (emailMenu.children!.length > 0) {
      navItems.push(emailMenu);
    }
  }


  // Dossiers CME
  if (permissions.includes('GETALLDOSSIER') || permissions.includes('AJOUTERDOSSIER')) {
    const dossierMenu: INavData = {
      name: 'Dossier CME',
      url: '/dossier',
      iconComponent: { name: 'cil-description' },
      children: [],
    };

    if (permissions.includes('AJOUTERDOSSIER')) {
      dossierMenu.children!.push({
        name: 'Ajouter un dossier',
        url: '/dossier/ajouter-dossier',
        icon: 'nav-icon-bullet'
      });
    }

    if (permissions.includes('GETDOSSIERBYUSER')) {
        dossierMenu.children!.push({
          name: 'Voir les dossiers',
          url: '/dossier/dossierAttribution',
          icon: 'nav-icon-bullet'
        });
    }

    if (permissions.includes('GETALLDOSSIER')) {
      dossierMenu.children!.push({
        name: 'Tous les dossiers',
        url: '/dossier/dossier',
        icon: 'nav-icon-folder'
      });
    }

    navItems.push(dossierMenu);
  }

  // Blacklist
  if (permissions.includes('GETALL') || permissions.includes('AJOUTERBLACK')) {
    const blacklistMenu: INavData = {
      name: 'Blacklist',
      url: '/blacklist',
      iconComponent: { name: 'cil-description' },
      children: [],
    };

    if (permissions.includes('GETALL')) {
      blacklistMenu.children!.push({
        name: 'Gestion des blacklist',
        url: '/blacklist/voirblacklist',
        icon: 'nav-icon-bullet'
      });
    }

    if (permissions.includes('AJOUTERBLACK')) {
      blacklistMenu.children!.push({
        name: 'Ajouter une blacklist',
        url: '/blacklist/ajouterblacklist',
        icon: 'nav-icon-bullet'
      });
    }

    if (blacklistMenu.children!.length > 0) {
      navItems.push(blacklistMenu);
    }
  }

  return navItems;
}
