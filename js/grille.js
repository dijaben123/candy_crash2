import Cookie from "./cookie.js";
import { create2DArray } from "./utils.js";

/* Classe principale du jeu, c'est une grille de cookies. Le jeu se joue comme
Candy Crush Saga etc... c'est un match-3 game... */
export default class Grille {
  cookiesSelectionnees = [];

  constructor(l, c) {
    this.colonnes = c;
    this.lignes = l;
    // le tableau des cookies
    this.cookies = create2DArray(l);

    //let existeAlignement = false;
    this.remplirTableauDeCookies(6);
    /*
    do {
      this.remplirTableauDeCookies(6);
      existeAlignement = this.testAlignementDansTouteLaGrille();
      console.log("ExisteAlignement : " + existeAlignement)
    } while(existeAlignement)
    */
  }

  /**
   * parcours la liste des divs de la grille et affiche les images des cookies
   * correspondant à chaque case. Au passage, à chaque image on va ajouter des
   * écouteurs de click et de drag'n'drop pour pouvoir interagir avec elles
   * et implémenter la logique du jeu.
   */
  showCookies() {
    let caseDivs = document.querySelectorAll("#grille div");

    caseDivs.forEach((div, index) => {
      let ligne = Math.floor(index / this.lignes);
      let colonne = index % this.colonnes;

      let cookie = this.cookies[ligne][colonne];
      let img = cookie.htmlImage;

      // On met un écouteur de click sur l'image
      img.onclick = (event) => {
        let cookieClickee = this.getCookieFromImage(event.target);

        // on regarde combien on a de cookies selectionnées
        if (this.cookiesSelectionnees.length === 0) {
          cookieClickee.selectionnee();
          this.cookiesSelectionnees.push(cookieClickee);
        } else if (this.cookiesSelectionnees.length === 1) {
          cookieClickee.selectionnee();
          console.log("On essaie de swapper !")
          this.cookiesSelectionnees.push(cookieClickee);
          // on essaie de swapper
          Cookie.swapCookies(this.cookiesSelectionnees[0],
            this.cookiesSelectionnees[1]);
          // on remet le tableau des cookies selectionnées à 0
          this.cookiesSelectionnees = [];
        } else {
          console.log("Deux cookies sont déjà sélectionnées...")
        }
      }

      // On met un écouteur de drag'n'drop sur l'image
      img.ondragstart = (event) => {
        let cookieDragguee = this.getCookieFromImage(event.target);
        cookieDragguee.selectionnee();

        // on remet à zero le tableau des cookies selectionnees
        this.cookiesSelectionnees = [];
        this.cookiesSelectionnees.push(cookieDragguee);
      }

      img.ondragover = (event) => {
        return false;
      }

      img.ondragenter = (event) => {
        const i = event.target;
        i.classList.add("imgDragOver");
      }

      img.ondragleave = (event) => {
        const i = event.target;
        i.classList.remove("imgDragOver");
      }

      img.ondrop = (event) => {
        let cookieDragguee = this.getCookieFromImage(event.target);
        cookieDragguee.selectionnee();

        // on ajoute au tableau la deuxième cookie
        this.cookiesSelectionnees.push(cookieDragguee);

        // et on regarde si on peut les swapper
        Cookie.swapCookies(this.cookiesSelectionnees[0], this.cookiesSelectionnees[1]);

        // on remet le tableau des cookies selectionnées à 0
        this.cookiesSelectionnees = [];
        cookieDragguee.htmlImage.classList.remove("imgDragOver");
      }

      div.appendChild(img);
    });
  }

  getCookieFromImage(i) {
    let ligneCookie = i.dataset.ligne;
    let colonneCookie = i.dataset.colonne;
    return this.cookies[ligneCookie][colonneCookie];
  }
  /**
   * Initialisation du niveau de départ. Le paramètre est le nombre de cookies différents
   * dans la grille. 4 types (4 couleurs) = facile de trouver des possibilités de faire
   * des groupes de 3. 5 = niveau moyen, 6 = niveau difficile
   *
   * Améliorations : 1) s'assurer que dans la grille générée il n'y a pas déjà de groupes
   * de trois. 2) S'assurer qu'il y a au moins 1 possibilité de faire un groupe de 3 sinon
   * on a perdu d'entrée. 3) réfléchir à des stratégies pour générer des niveaux plus ou moins
   * difficiles.
   *
   * On verra plus tard pour les améliorations...
   */
  remplirTableauDeCookies(nbDeCookiesDifferents) {
    for (let l = 0; l < this.lignes; l++) {
      for (let c = 0; c < this.colonnes; c++) {
        //console.log("ligne = " + l + " colonne = " + c);
        const type = Math.round(Math.random() * (nbDeCookiesDifferents - 1))
        this.cookies[l][c] = new Cookie(type, l, c);
      }
    }
  }


  // Test des alignements de 3 cookies ou plus, horizontalement et verticalement

  testAlignementDansTouteLaGrille() {
    let alignementExisteLignes = this.testAlignementTouteDirection(this.cookies, this.lignes, this.colonnes, true);
    let alignementExisteColonnes = this.testAlignementTouteDirection(this.cookies, this.colonnes, this.lignes, false);

    return (alignementExisteLignes || alignementExisteColonnes);
  }

  testAlignementTouteDirection(tabCookies, premierIndice, deuxiemeIndice, isLigne) {
    let alignementExiste = false;

    for (let i = 0; i < premierIndice; i++) {
      let alignementCourant = this.testAlignementDirection(tabCookies, i, deuxiemeIndice, isLigne);

      if (alignementCourant) {
        alignementExiste = true;
      }
    }

    return alignementExiste;
  }

  testAlignementDirection(tabCookies, indice, taille, isLigne) {
    let alignement = false;

    for (let j = 0; j <= taille - 3; j++) {
      let cookie1 = isLigne ? tabCookies[indice][j] : tabCookies[j][indice];
      let cookie2 = isLigne ? tabCookies[indice][j + 1] : tabCookies[j + 1][indice];
      let cookie3 = isLigne ? tabCookies[indice][j + 2] : tabCookies[j + 2][indice];

      if ((cookie1.type === cookie2.type) && (cookie2.type === cookie3.type)) {
        cookie1.cachee();
        cookie2.cachee();
        cookie3.cachee();
        alignement = true;
      }
    }

    return alignement;
  }


  generateCookies(column) {
    for (let i = this.lignes - 1; i >= 0; i--) {
      if (this.cookies[i][column].htmlImage.classList.contains("cookieCachee")) {
        const type = Math.floor(Math.random() * 5);
        this.cookies[i][column].type = type;
        this.cookies[i][column].htmlImage.src = Cookie.urlsImagesNormales[this.cookies[i][column].type];
        this.cookies[i][column].htmlImage.classList.remove("cookieCachee");
      }
    }
  }




  slide() {
    for (let column = this.colonnes - 1; column >= 0; column--) {
      for (let row = this.lignes - 1; row >= 0; row--) {
        if (this.cookies[row] && this.cookies[row][column]) {
          let currentCookie = this.cookies[row][column];
          if (currentCookie.isCachee()) {
            for (let newRow = row; newRow >= 0; newRow--) {
              if (newRow > 0 && this.cookies[newRow - 1] && this.cookies[newRow - 1][column]) {
                let upperCookie = this.cookies[newRow - 1][column];
                if (!upperCookie.isCachee()) {
                  this.cookies[row][column] = upperCookie;
                  this.cookies[row][column].htmlImage.classList.remove('cookieCachee');
                  row--;
                }
              }
            }
          }
        }
      }
      this.generateCookies(column);
    }

    for (let i = 0; i < this.lignes; i++) {
      for (let j = 0; j < this.colonnes; j++) {
        this.cookies[i][j].htmlImage.dataset.ligne = i;
        this.cookies[i][j].htmlImage.dataset.colonne = j;
      }
    }
  }


















}













  // slide() {
  //   // Shift hidden cookies down
  //   for (let column = this.colonnes - 1; column >= 0; column--) {
  //     for (let row = this.lignes - 1; row >= 0; row--) {
  //       if (this.cookies[row] && this.cookies[row][column]) {
  //         let currentCookie = this.cookies[row][column];
  //         if (currentCookie.isCachee()) {
  //           // console.log(`The cookie at row ${row + 1} and column ${column + 1} is hidden.`);
  //           for (let newRow = row; newRow >= 0; newRow--) {
  //             if (newRow > 0 && this.cookies[newRow - 1] && this.cookies[newRow - 1][column]) {
  //               let upperCookie = this.cookies[newRow - 1][column];
  //               if (!upperCookie.isCachee()) {
  //                 // console.log(`Before: Line - ${upperCookie.ligne}, Column - ${upperCookie.colonne}`);
  //                 this.cookies[row][column] = upperCookie;
  //                 this.cookies[row][column].htmlImage.classList.remove('cookieCachee');
  //                 row--;
  //               }
  //             }
  //           }
  //         }
  //       }

  //     }
  //     this.generateCookies(column);

  //   }


  //   for (let i = 0; i < this.lignes; i++) {
  //     for (let j = 0; j < this.colonnes; j++) {
  //       this.cookies[i][j].htmlImage.dataset.ligne = i;
  //       this.cookies[i][j].htmlImage.dataset.colonne = j;
  //     }
  //   }



  // }






  //   slide() {
  //     // Shift hidden cookies down
  //     for (let column = this.colonnes - 1; column >= 0; column--) {
  //       for (let row = this.lignes - 1; row >= 0; row--) {
  //         if (this.cookies[row] && this.cookies[row][column]) {
  //           let currentCookie = this.cookies[row][column];
  //           if (currentCookie.isCachee()) {
  //             for (let newRow = row; newRow >= 0; newRow--) {
  //               if (newRow > 0 && this.cookies[newRow - 1] && this.cookies[newRow - 1][column]) {
  //                 const upperCookie = this.cookies[newRow - 1][column];
  //                 if (!upperCookie.isCachee()) {
  //                   this.cookies[row][column] = upperCookie;
  //                   row--;
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }

  //     // Mettre à jour les attributs dataset des images
  //     for (let i = 0; i < this.lignes; i++) {
  //       for (let j = 0; j < this.colonnes; j++) {
  //         this.cookies[i][j].htmlImage.dataset.ligne = i;
  //         this.cookies[i][j].htmlImage.dataset.colonne = j;
  //       }
  //     }


  // let doc=document.querySelectorAll(".cookieCachee")
  // // doc.
  //     // for(let i = 0; i < 9;i++) {
  //     //   for(let j = 0; j < 9;j++) {

  //     //   }
  //     // }






  //     // Récupérer toutes les balises img du document
  // let toutesLesImages = document.querySelectorAll('img');

  // // Parcourir chaque balise img
  // toutesLesImages.forEach(img => {
  //   // Vérifier si la balise img a la classe "cookieCachee"
  //   if (img.classList.contains('cookieCachee')) {

  //     // Faire quelque chose avec la balise img qui a la classe "cookieCachee"
  //     console.log('Cette balise img a la classe cookieCachee:', img);
  //   }
  // });

  //   }



