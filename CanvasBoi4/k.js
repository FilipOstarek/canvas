console.log("OwO (Kontrola připojení js)");
let canvas = document.getElementById('canvas');
let pocetBloky = document.getElementById('NumberBloky');
let pocetAsteroidy = document.getElementById('NumberAsteroidy');
let vysledky = document.getElementById('Vysledky');
let Nejvysledek = document.getElementById('NejVysledek');
let ctx = canvas.getContext('2d');
let button = document.getElementById('button');
let FreezeOwO = document.getElementById('FreezeOwO');
let MenicExploze = document.getElementById('MenicExploze');
let ZrychlovacAazZanik = document.getElementById('ZrychlovacAazZanik');
let Varovani = document.getElementById('Warning');
let VarovaniText = document.getElementById('WarningText');

let SanceFreezeOwO;
let SanceMenicExploze;
let SanceZrychlovacAazZanik;

let Nejlepsi = 0;
let score = 0;

let StartovaciKontrola = false;

let ctverce = [];
let kruhy = [];
let miniKruhy = [];
let particle = [];

let i = 0;
let ukonceni = false;
let konecnaObrazovka = false;
let ukonceniVytvarecu = false;
let dash = false; // aby hráč se nemohl při použití dashe/teleportu zmáčknout klávedu vícekrát a tím pádem znehodnotit výsledek
let dashKontrola = false;
//false = dash/teleport umístí hráče před "hráče"
//true = dash/teleport umístí hráče za "hráče"
let velikostSkoku = 500;
let kontrolaDashProMys = false; //hodnota pro zjištění pokud hráč používá myš (a použije dash/teleport), tak aby nebyly souřadnice x a y neustále nastaveny na myš
let docasnaHodnotaPrevraceni = 0;
let pretvarovacVytvareni = false; //pokud je aktivováno buff zmraženi tak bloky,asteroidy a miniAsteroidy jenž se vytvoří PO získání buffu zmražení budou také zpomaleny
let hodnotaNesmrtelnosti = false; //pokud je nesmrtelnost detekována, změní se grafika dash/telepostu z kostky na kruh 
let pretoceni = 250;
let owoOblicej = false;
let zmenaVyplne = false; //až se dokončí změna výplně u OwO buff tak se všechny přepnou 
let particleStopper = false;
let zmenaStopper = false;
let OwOStopper = false;

let k = 20; // počítadlo pro particle u teleportu (ctverec)
let u = 70; // počítadlo pro particle u teleportu (kolo)
let m = 1; // počítadlo u zmrazení
let a = canvas.width; // Počitaldl u uwu animace
let OwO = 0; //počítadlo u OwO/UwU obličej

let startovac; //hodnota pro rozjetí animace

let v1;
let v2;
let v3;
let b1;
let b2;
let b3;

//v1,v2,v3,b1,b2,b3 jsou pro propočty kolize v kruhu
let player = {
    x: canvas.width / 100,
    y: canvas.height / 2,
    r: 50,
    width: 20,
    height: 20,
    speedX: 5,
    speedY: 5,
    Pv: 0,
    Pb: 0,
}

// Kontrola zdali je vůbec možné začít hru aniž by se nějak nepoškodily proměnné a jejich fungování
function StartKontrola(SanceFreezeOwO, SanceMenicExploze, SanceZrychlovacAazZanik) {
    if ((SanceFreezeOwO + SanceMenicExploze + SanceZrychlovacAazZanik) > 100) {
        VarovaniText.style.color = 'red';
        Varovani.style.borderColor = 'red';
    }
    if ((SanceFreezeOwO + SanceMenicExploze + SanceZrychlovacAazZanik) <= 100) {
        StartovaciKontrola = true;
        VarovaniText.style.color = 'sandybrown';
        Varovani.style.borderColor = 'white';
    }
    console.log((SanceFreezeOwO + SanceMenicExploze + SanceZrychlovacAazZanik));
    return StartovaciKontrola;
}

player.Pv = (player.r * (Math.sqrt(2) / 2));
player.Pb = (Math.sqrt((player.r ** 2) - (player.Pv ** 2)));
function pripravaParticle() {
    for (i = 0; i < (Math.ceil(Math.random() * 5)); i++) {
        let x = player.x;
        let y = player.y;
        let r = (Math.ceil((Math.random() * 10) + 5));
        let speedX = (Math.ceil(Math.random() * 10));
        let speedY = (Math.ceil(Math.random() * 10));
        let SP = (Math.ceil(Math.random() * 80));

        if (hodnotaNesmrtelnosti) {
            r += 20;
        }

        let samostatnyParticle = {
            x: x,
            y: y,
            r: r,
            speedX: speedX,
            speedY: speedY,
            SP: SP,
        }
        particle.push(samostatnyParticle);
    }
}
function roztristeni(x, y, akceY, pojistka) {
    if (y >= akceY) {
        pojistka = false;
        //vytvoření miniAsteroidů po roztříštění
        for (i = 0; i < (Math.ceil(Math.random() * 15)); i++) {
            let Kx = x;
            let Ky = y;
            let Kr = (Math.ceil((Math.random() * 50) + 10) / 3);
            let KspeedX = (Math.ceil(Math.random() * 10));
            let KspeedY = (Math.ceil(Math.random() * 10));
            let SP = (Math.ceil(Math.random() * 30));
            let nesmrtelnost = false; // Pro funkce kolize
            let mini = true;
            if (pretvarovacVytvareni) {
                KspeedX = (Math.ceil(KspeedX / 4));
                KspeedY = (Math.ceil(KspeedY / 4));
            }
            let miniAsteroidy = {
                x: Kx,
                y: Ky,
                r: Kr,
                speedX: KspeedX,
                speedY: KspeedY,
                SP: SP,
                nesmrtelnost: nesmrtelnost,
                mini: mini,
            }
            miniKruhy.push(miniAsteroidy);
        }
    }
    return pojistka;
}
function kolizeAsteroidu(x, y, r, nesmrtelnost, index, mini) {
    v1 = r * (1 / 2);
    v2 = r * (Math.sqrt(2) / 2);
    v3 = r * (Math.sqrt(3) / 2);
    b1 = Math.sqrt((r ** 2) - (v1 ** 2));
    b2 = Math.sqrt((r ** 2) - (v2 ** 2));
    b3 = Math.sqrt((r ** 2) - (v3 ** 2));
    //Horní pravý roh playera
    if (!hodnotaNesmrtelnosti) {
        if (((player.x + player.width) >= (x - r) && (player.x + player.width) <= (x + r)) && player.y >= (y - r) && player.y <= (y + r)) {
            if ((player.x + player.width) >= (x - b1) && (player.x + player.width) <= (x + b1) && player.y >= (y - v1) && player.y <= (y + v1)) {
                if (!nesmrtelnost) {
                    ukonceni = true;
                    pripravaParticle();
                    console.log("KONEC KOULE");
                }
                else if (nesmrtelnost) {
                    hodnotaNesmrtelnosti = true;
                }
            }
            else if ((player.x + player.width) >= (x - b2) && (player.x + player.width) <= (x + b2) && player.y >= (y - v2) && player.y <= (y + v2)) {
                if (!nesmrtelnost) {
                    ukonceni = true;
                    pripravaParticle();
                    console.log("KONEC KOULE");
                }
                else if (nesmrtelnost) {
                    hodnotaNesmrtelnosti = true;
                }
            }
            else if ((player.x + player.width) >= (x - b3) && (player.x + player.width) <= (x + b3) && player.y >= (y - v3) && player.y <= (y + v3)) {
                if (!nesmrtelnost) {
                    ukonceni = true;
                    pripravaParticle();
                    console.log("KONEC KOULE");
                }
                else if (nesmrtelnost) {
                    hodnotaNesmrtelnosti = true;
                }
            }
        }
        //Horní levý roh playera
        else if ((player.x >= (x - r) && player.x <= (x + r)) && player.y >= (y - r) && player.y <= (y + r)) {
            if ((player.x) >= (x - b1) && (player.x) <= (x + b1) && player.y >= (y - v1) && player.y <= (y + v1)) {
                if (!nesmrtelnost) {
                    ukonceni = true;
                    pripravaParticle();
                    console.log("KONEC KOULE");
                }
                else if (nesmrtelnost) {
                    hodnotaNesmrtelnosti = true;
                }
            }
            else if ((player.x) >= (x - b2) && (player.x) <= (x + b2) && player.y >= (y - v2) && player.y <= (y + v2)) {
                if (!nesmrtelnost) {
                    ukonceni = true;
                    pripravaParticle();
                    console.log("KONEC KOULE");
                }
                else if (nesmrtelnost) {
                    hodnotaNesmrtelnosti = true;
                }
            }
            else if ((player.x) >= (x - b3) && (player.x) <= (x + b3) && player.y >= (y - v3) && player.y <= (y + v3)) {
                if (!nesmrtelnost) {
                    ukonceni = true;
                    pripravaParticle();
                    console.log("KONEC KOULE");
                }
                else if (nesmrtelnost) {
                    hodnotaNesmrtelnosti = true;
                }
            }
        }
        //Dolní pravý roh playera
        else if (((player.x + player.width) >= (x - r) && (player.x + player.width) <= (x + r)) && (player.y + player.height) >= (y - r) && (player.y + player.height) <= (y + r)) {
            if ((player.x + player.width) >= (x - b1) && (player.x + player.width) <= (x + b1) && (player.y + player.height) >= (y - v1) && (player.y + player.height) <= (y + v1)) {
                if (!nesmrtelnost) {
                    ukonceni = true;
                    pripravaParticle();
                    console.log("KONEC KOULE");
                }
                else if (nesmrtelnost) {
                    hodnotaNesmrtelnosti = true;
                }
            }
            else if ((player.x + player.width) >= (x - b2) && (player.x + player.width) <= (x + b2) && (player.y + player.height) >= (y - v2) && (player.y + player.height) <= (y + v2)) {
                if (!nesmrtelnost) {
                    ukonceni = true;
                    pripravaParticle();
                    console.log("KONEC KOULE");
                }
                else if (nesmrtelnost) {
                    hodnotaNesmrtelnosti = true;
                }
            }
            else if ((player.x + player.width) >= (x - b3) && (player.x + player.width) <= (x + b3) && (player.y + player.height) >= (y - v3) && (player.y + player.height) <= (y + v3)) {
                if (!nesmrtelnost) {
                    ukonceni = true;
                    pripravaParticle();
                    console.log("KONEC KOULE");
                }
                else if (nesmrtelnost) {
                    hodnotaNesmrtelnosti = true;
                }
            }
        }
        //Dolní levý roh playera
        else if ((player.x >= (x - r) && player.x <= (x + r)) && (player.y + player.height) >= (y - r) && (player.y + player.height) <= (y + r)) {
            if ((player.x) >= (x - b1) && (player.x) <= (x + b1) && (player.y + player.height) >= (y - v1) && (player.y + player.height) <= (y + v1)) {
                if (!nesmrtelnost) {
                    ukonceni = true;
                    pripravaParticle();
                    console.log("KONEC KOULE");
                }
                else if (nesmrtelnost) {
                    hodnotaNesmrtelnosti = true;
                }
            }
            else if ((player.x) >= (x - b2) && (player.x) <= (x + b2) && (player.y + player.height) >= (y - v2) && (player.y + player.height) <= (y + v2)) {
                if (!nesmrtelnost) {
                    ukonceni = true;
                    pripravaParticle();
                    console.log("KONEC KOULE");
                }
                else if (nesmrtelnost) {
                    hodnotaNesmrtelnosti = true;
                }
            }
            else if ((player.x) >= (x - b3) && (player.x) <= (x + b3) && (player.y + player.height) >= (y - v3) && (player.y + player.height) <= (y + v3)) {
                if (!nesmrtelnost) {
                    ukonceni = true;
                    pripravaParticle();
                    console.log("KONEC KOULE");
                }
                else if (nesmrtelnost) {
                    hodnotaNesmrtelnosti = true;
                }
            }
        }
    }
    if (hodnotaNesmrtelnosti) {
        //Dolní bod playera *
        if (((player.x) >= (x - r) && (player.x) <= (x + r)) && (player.y + player.r) >= (y - r) && (player.y + player.r) <= (y + r)) {
            if ((player.x) >= (x - b1) && (player.x) <= (x + b1) && (player.y + player.r) >= (y - v1) && (player.y + player.r) <= (y + v1)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x) >= (x - b2) && (player.x) <= (x + b2) && (player.y + player.r) >= (y - v2) && (player.y + player.r) <= (y + v2)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x) >= (x - b3) && (player.x) <= (x + b3) && (player.y + player.r) >= (y - v3) && (player.y + player.r) <= (y + v3)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
        }
        //Levý bod playera * 
        else if (((player.x - player.r) >= (x - r) && (player.x - player.r) <= (x + r)) && player.y >= (y - r) && player.y <= (y + r)) {
            if ((player.x - player.r) >= (x - b1) && (player.x - player.r) <= (x + b1) && player.y >= (y - v1) && player.y <= (y + v1)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x - player.r) >= (x - b2) && (player.x - player.r) <= (x + b2) && player.y >= (y - v2) && player.y <= (y + v2)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x - player.r) >= (x - b3) && (player.x - player.r) <= (x + b3) && player.y >= (y - v3) && player.y <= (y + v3)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
        }
        //Pravý bod playera *
        else if (((player.x + player.r) >= (x - r) && (player.x + player.r) <= (x + r)) && player.y >= (y - r) && player.y <= (y + r)) {
            if ((player.x + player.r) >= (x - b1) && (player.x + player.r) <= (x + b1) && player.y >= (y - v1) && player.y <= (y + v1)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x + player.r) >= (x - b2) && (player.x + player.r) <= (x + b2) && player.y >= (y - v2) && player.y <= (y + v2)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x + player.r) >= (x - b3) && (player.x + player.r) <= (x + b3) && player.y >= (y - v3) && player.y <= (y + v3)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
        }
        //Horní bod playera *
        else if ((player.x >= (x - r) && player.x <= (x + r)) && (player.y - player.r) >= (y - r) && (player.y - player.r) <= (y + r)) {
            if ((player.x) >= (x - b1) && (player.x) <= (x + b1) && (player.y - player.r) >= (y - v1) && (player.y - player.r) <= (y + v1)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x) >= (x - b2) && (player.x) <= (x + b2) && (player.y - player.r) >= (y - v2) && (player.y - player.r) <= (y + v2)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x) >= (x - b3) && (player.x) <= (x + b3) && (player.y - player.r) >= (y - v3) && (player.y - player.r) <= (y + v3)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
        }
        //Horní levý bod playera *
        if (((player.x - player.Pb) >= (x - r) && (player.x - player.Pb) <= (x + r)) && (player.y - player.Pv) >= (y - r) && (player.y - player.Pv) <= (y + r)) {
            if ((player.x - player.Pb) >= (x - b1) && (player.x - player.Pb) <= (x + b1) && (player.y - player.Pv) >= (y - v1) && (player.y - player.Pv) <= (y + v1)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x - player.Pb) >= (x - b2) && (player.x - player.Pb) <= (x + b2) && (player.y - player.Pv) >= (y - v2) && (player.y - player.Pv) <= (y + v2)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x - player.Pb) >= (x - b3) && (player.x - player.Pb) <= (x + b3) && (player.y - player.Pv) >= (y - v3) && (player.y - player.Pv) <= (y + v3)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
        }
        //Horní Pravý bod playera *
        if (((player.x + player.Pb) >= (x - r) && (player.x + player.Pb) <= (x + r)) && (player.y - player.Pv) >= (y - r) && (player.y - player.Pv) <= (y + r)) {
            if ((player.x + player.Pb) >= (x - b1) && (player.x + player.Pb) <= (x + b1) && (player.y - player.Pv) >= (y - v1) && (player.y - player.Pv) <= (y + v1)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x + player.Pb) >= (x - b2) && (player.x + player.Pb) <= (x + b2) && (player.y - player.Pv) >= (y - v2) && (player.y - player.Pv) <= (y + v2)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x + player.Pb) >= (x - b3) && (player.x + player.Pb) <= (x + b3) && (player.y - player.Pv) >= (y - v3) && (player.y - player.Pv) <= (y + v3)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
        }
        //Dolní levý bod playera *
        if (((player.x - player.Pb) >= (x - r) && (player.x - player.Pb) <= (x + r)) && (player.y + player.Pv) >= (y - r) && (player.y + player.Pv) <= (y + r)) {
            if ((player.x - player.Pb) >= (x - b1) && (player.x - player.Pb) <= (x + b1) && (player.y + player.Pv) >= (y - v1) && (player.y + player.Pv) <= (y + v1)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x - player.Pb) >= (x - b2) && (player.x - player.Pb) <= (x + b2) && (player.y + player.Pv) >= (y - v2) && (player.y + player.Pv) <= (y + v2)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x - player.Pb) >= (x - b3) && (player.x - player.Pb) <= (x + b3) && (player.y + player.Pv) >= (y - v3) && (player.y + player.Pv) <= (y + v3)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
        }
        //Dolní Pravý bod playera *
        if (((player.x + player.Pb) >= (x - r) && (player.x + player.Pb) <= (x + r)) && (player.y + player.Pv) >= (y - r) && (player.y + player.Pv) <= (y + r)) {
            if ((player.x + player.Pb) >= (x - b1) && (player.x + player.Pb) <= (x + b1) && (player.y + player.Pv) >= (y - v1) && (player.y + player.Pv) <= (y + v1)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x + player.Pb) >= (x - b2) && (player.x + player.Pb) <= (x + b2) && (player.y + player.Pv) >= (y - v2) && (player.y + player.Pv) <= (y + v2)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if ((player.x + player.Pb) >= (x - b3) && (player.x + player.Pb) <= (x + b3) && (player.y + player.Pv) >= (y - v3) && (player.y + player.Pv) <= (y + v3)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
        }
        //Prostřední bod playera *
        if ((player.x >= (x - r) && player.x <= (x + r)) && player.y >= (y - r) && player.y <= (y + r)) {
            if (player.x >= (x - b1) && player.x <= (x + b1) && player.y >= (y - v1) && player.y <= (y + v1)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if (player.x >= (x - b2) && player.x <= (x + b2) && player.y >= (y - v2) && player.y <= (y + v2)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
            else if (player.x >= (x - b3) && player.x <= (x + b3) && player.y >= (y - v3) && player.y <= (y + v3)) {
                if (!mini) {
                    kruhy.splice(index, 1);
                }
                else if (mini) {
                    miniKruhy.splice(index, 1);
                }
                score += 5;
            }
        }
    }
    // Pro kosktu
    if (!hodnotaNesmrtelnosti) {
        if ((player.x + player.width) >= (canvas.width - 5) || (player.x) <= (5)) {
            ukonceni = true;
            if (!particleStopper) {
                pripravaParticle();
                particleStopper = true;
            }
            console.log("UKONCIT SE");
        }
        else if ((player.y + player.height) >= (canvas.height - 5) || (player.y) <= (5)) {
            ukonceni = true;
            if (!particleStopper) {
                pripravaParticle();
                particleStopper = true;
            }
            console.log("UKONCIT SE");
        }
        return;
    }
    // Pro OwO buff
    else if ((player.x + player.r) >= (canvas.width - 5) || (player.x - player.r) <= (5)) {
        ukonceni = true;
        if (!particleStopper) {
            pripravaParticle();
            particleStopper = true;
        }
        console.log("UKONCIT SE");
    }
    else if ((player.y + player.r) >= (canvas.height - 5) || (player.y - player.r) <= (5)) {
        ukonceni = true;
        if (!particleStopper) {
            pripravaParticle();
            particleStopper = true;
        }
        console.log("UKONCIT SE");
    }
}
function vytvorOkraje() {
    // OKRAJE CANVASU
    //1. Pro to aby hráč nemohl odjet do bezpečí před bloky
    //2. Hráč s myší se nemůže "teleportovat po canvasu" tím že z něj vyjede a pak zase do něj přijede 
    //(Neznemožní mu to úplně ale znesnadní to tak moc že je lepší kdyby hrál normálně) 
    //Okraje canvasu
    if (!hodnotaNesmrtelnosti) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, 5);
        ctx.fillRect(0, 0, 5, canvas.height);
        ctx.fillRect(0, canvas.height - 5, canvas.width, canvas.height - 5);
        ctx.fillRect(canvas.width - 5, 0, canvas.width - 5, canvas.height);
        //Další okraj canvasu (Pouze dekorační) 
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, 1);
        ctx.fillRect(0, 0, 1, canvas.height);
        ctx.fillRect(0, canvas.height - 1, canvas.width, canvas.height - 1);
        ctx.fillRect(canvas.width - 1, 0, canvas.width - 1, canvas.height);
    }
    if (hodnotaNesmrtelnosti) {
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, canvas.width, 5);
        ctx.fillRect(0, 0, 5, canvas.height);
        ctx.fillRect(0, canvas.height - 5, canvas.width, canvas.height - 5);
        ctx.fillRect(canvas.width - 5, 0, canvas.width - 5, canvas.height);
        //Další okraj canvasu (Pouze dekorační) 
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, 1);
        ctx.fillRect(0, 0, 1, canvas.height);
        ctx.fillRect(0, canvas.height - 1, canvas.width, canvas.height - 1);
        ctx.fillRect(canvas.width - 1, 0, canvas.width - 1, canvas.height);
    }
}

function End() {
    if (ukonceni) {
        //PROHRA
        ukonceniVytvarecu = true;
        ctverce.forEach(function (bloky) {
            bloky.speedX *= 1.1;
        });
        kruhy.forEach(function (asteroidy) {
            asteroidy.speedX *= 1.1;
            asteroidy.speedY *= 1.1;
            asteroidy.nesmrtelnost = false;
        });
        miniKruhy.forEach(function (miniAsteroidy) {
            miniAsteroidy.speedX *= 1.1;
            miniAsteroidy.speedY *= 1.1;
        });
        if (konecnaObrazovka && ctverce.length == 0 && kruhy.length == 0 && miniKruhy.length == 0) {
            vytvorOkraje();
            clearInterval(startovac);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, 5);
            ctx.fillRect(0, 0, 5, canvas.height);
            ctx.fillRect(0, canvas.height - 5, canvas.width, canvas.height - 5);
            ctx.fillRect(canvas.width - 5, 0, canvas.width - 5, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, 1);
            ctx.fillRect(0, 0, 1, canvas.height);
            ctx.fillRect(0, canvas.height - 1, canvas.width, canvas.height - 1);
            ctx.fillRect(canvas.width - 1, 0, canvas.width - 1, canvas.height);
            ctx.fillStyle = "white";
            ctx.font = "100px Arial";
            ctx.fillText("KONEC HRY", (canvas.width / 2) - 300, canvas.height / 2);
            ctx.font = "75px Arial";
            ctx.fillText("Stiskni tlačítko pro další hru", (canvas.width / 2) - 450, (canvas.height / 2) + 100);
            ctx.fillStyle = "#4dff4d";
            ctx.fillRect(canvas.width / 2, 70, player.width, player.height);
            console.log("KONECCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC");
            button.disabled = false;
        }
    }
}
//x,y,width,height se myslí pro bloky
function kolize(x, y, width, height, zmrazeni, zmrazeniPotrvzeni, index) {
    // kolize pro bloky
    //Horní pravý roh playera
    if (!hodnotaNesmrtelnosti) {
        if (((player.x + player.width) >= x && (player.x + player.width) <= x + width) && player.y >= y && player.y <= (y + height)) {
            if (!zmrazeni) {
                pripravaParticle();
                ukonceni = true;
                console.log("UKONCIT SE");
            }
            else if (zmrazeni && zmrazeniPotrvzeni) {
                if (!pretvarovacVytvareni) { //Pro jistotu aby se buff mrazení neaktivoval vícekrát
                    pretvarovacVytvareni = true;
                    miniKruhy.forEach(function (miniAsteroidy) {
                        miniAsteroidy.speedX = Math.ceil(miniAsteroidy.speedX / 4);//Math.ceil pro jistotu aby se nezastavily + aby vůbec canvas jel správně
                        miniAsteroidy.speedY = Math.ceil(miniAsteroidy.speedY / 4);
                    });
                    ctverce.forEach(function (bloky) {
                        bloky.speedX = Math.ceil(bloky.speedX / 4);
                    });
                    kruhy.forEach(function (asteroidy) {
                        asteroidy.speedX = Math.ceil(asteroidy.speedX / 4);
                        asteroidy.speedY = Math.ceil(asteroidy.speedY / 4);
                    });
                    setTimeout(konecMrazu, 5000);
                    function konecMrazu() {
                        console.log("Odmrazeni");
                        miniKruhy.forEach(function (miniAsteroidy) {
                            miniAsteroidy.speedX = Math.floor(miniAsteroidy.speedX * 4);
                            miniAsteroidy.speedY = Math.floor(miniAsteroidy.speedY * 4);
                        });
                        ctverce.forEach(function (bloky) {
                            bloky.speedX = Math.floor(bloky.speedX * 4);
                        });
                        kruhy.forEach(function (asteroidy) {
                            asteroidy.speedX = Math.floor(asteroidy.speedX * 4);
                            asteroidy.speedY = Math.floor(asteroidy.speedY * 4);
                        });
                        pretvarovacVytvareni = false;
                    }
                }
                zmrazeniPotrvzeni = false;
            }
        }
        //Horní levý roh playera
        else if ((player.x >= x && player.x <= (x + width)) && player.y >= y && player.y <= (y + height)) {
            if (!zmrazeni) {
                pripravaParticle();
                ukonceni = true;
                console.log("UKONCIT SE");
            }
            else if (zmrazeni && zmrazeniPotrvzeni) {
                if (!pretvarovacVytvareni) { //Pro jistotu aby se buff mrazení neaktivoval vícekrát
                    pretvarovacVytvareni = true;
                    miniKruhy.forEach(function (miniAsteroidy) {
                        miniAsteroidy.speedX = Math.ceil(miniAsteroidy.speedX / 4);//Math.ceil pro jistotu aby se nezastavily + aby vůbec canvas jel správně
                        miniAsteroidy.speedY = Math.ceil(miniAsteroidy.speedY / 4);
                    });
                    ctverce.forEach(function (bloky) {
                        bloky.speedX = Math.ceil(bloky.speedX / 4);
                    });
                    kruhy.forEach(function (asteroidy) {
                        asteroidy.speedX = Math.ceil(asteroidy.speedX / 4);
                        asteroidy.speedY = Math.ceil(asteroidy.speedY / 4);
                    });
                    setTimeout(konecMrazu, 5000);
                    function konecMrazu() {
                        console.log("Odmrazeni");
                        miniKruhy.forEach(function (miniAsteroidy) {
                            miniAsteroidy.speedX = Math.floor(miniAsteroidy.speedX * 4);
                            miniAsteroidy.speedY = Math.floor(miniAsteroidy.speedY * 4);
                        });
                        ctverce.forEach(function (bloky) {
                            bloky.speedX = Math.floor(bloky.speedX * 4);
                        });
                        kruhy.forEach(function (asteroidy) {
                            asteroidy.speedX = Math.floor(asteroidy.speedX * 4);
                            asteroidy.speedY = Math.floor(asteroidy.speedY * 4);
                        });
                        pretvarovacVytvareni = false;
                    }
                }
                zmrazeniPotrvzeni = false;
            }
        }
        //Dolní pravý roh playera
        else if (((player.x + player.width) >= x && (player.x + player.width) <= x + width) && (player.y + player.height) >= y && (player.y + player.height) <= (y + height)) {
            if (!zmrazeni) {
                ukonceni = true;
                pripravaParticle();
                console.log("UKONCIT SE");
            }
            else if (zmrazeni && zmrazeniPotrvzeni) {
                if (!pretvarovacVytvareni) { //Pro jistotu aby se buff mrazení neaktivoval vícekrát
                    pretvarovacVytvareni = true;
                    miniKruhy.forEach(function (miniAsteroidy) {
                        miniAsteroidy.speedX = Math.ceil(miniAsteroidy.speedX / 4);//Math.ceil pro jistotu aby se nezastavily + aby vůbec canvas jel správně
                        miniAsteroidy.speedY = Math.ceil(miniAsteroidy.speedY / 4);
                    });
                    ctverce.forEach(function (bloky) {
                        bloky.speedX = Math.ceil(bloky.speedX / 4);
                    });
                    kruhy.forEach(function (asteroidy) {
                        asteroidy.speedX = Math.ceil(asteroidy.speedX / 4);
                        asteroidy.speedY = Math.ceil(asteroidy.speedY / 4);
                    });
                    setTimeout(konecMrazu, 5000);
                    function konecMrazu() {
                        console.log("Odmrazeni");
                        miniKruhy.forEach(function (miniAsteroidy) {
                            miniAsteroidy.speedX = Math.floor(miniAsteroidy.speedX * 4);
                            miniAsteroidy.speedY = Math.floor(miniAsteroidy.speedY * 4);
                        });
                        ctverce.forEach(function (bloky) {
                            bloky.speedX = Math.floor(bloky.speedX * 4);
                        });
                        kruhy.forEach(function (asteroidy) {
                            asteroidy.speedX = Math.floor(asteroidy.speedX * 4);
                            asteroidy.speedY = Math.floor(asteroidy.speedY * 4);
                        });
                        pretvarovacVytvareni = false;
                    }
                }
                zmrazeniPotrvzeni = false;
            }
        }
        //Dolní levý roh playera
        else if ((player.x >= x && player.x <= x + width) && (player.y + player.height) >= y && (player.y + player.height) <= (y + height)) {
            if (!zmrazeni) {
                ukonceni = true;
                pripravaParticle();
                console.log("UKONCIT SE");
            }
            else if (zmrazeni && zmrazeniPotrvzeni) {
                if (!pretvarovacVytvareni) { //Pro jistotu aby se buff mrazení neaktivoval vícekrát
                    pretvarovacVytvareni = true;
                    miniKruhy.forEach(function (miniAsteroidy) {
                        miniAsteroidy.speedX = Math.ceil(miniAsteroidy.speedX / 4);//Math.ceil pro jistotu aby se nezastavily + aby vůbec canvas jel správně
                        miniAsteroidy.speedY = Math.ceil(miniAsteroidy.speedY / 4);
                    });
                    ctverce.forEach(function (bloky) {
                        bloky.speedX = Math.ceil(bloky.speedX / 4);
                    });
                    kruhy.forEach(function (asteroidy) {
                        asteroidy.speedX = Math.ceil(asteroidy.speedX / 4);
                        asteroidy.speedY = Math.ceil(asteroidy.speedY / 4);
                    });
                    setTimeout(konecMrazu, 5000);
                    function konecMrazu() {
                        console.log("Odmrazeni");
                        miniKruhy.forEach(function (miniAsteroidy) {
                            miniAsteroidy.speedX = Math.floor(miniAsteroidy.speedX * 4);
                            miniAsteroidy.speedY = Math.floor(miniAsteroidy.speedY * 4);
                        });
                        ctverce.forEach(function (bloky) {
                            bloky.speedX = Math.floor(bloky.speedX * 4);
                        });
                        kruhy.forEach(function (asteroidy) {
                            asteroidy.speedX = Math.floor(asteroidy.speedX * 4);
                            asteroidy.speedY = Math.floor(asteroidy.speedY * 4);
                        });
                        pretvarovacVytvareni = false;
                    }
                }
                zmrazeniPotrvzeni = false;
            }
        }
    }
    if (hodnotaNesmrtelnosti) {
        //Horní bod playera *
        if (player.x >= x && player.x <= x + width && (player.y - player.r) >= y && (player.y - player.r) <= (y + height)) {
            ctverce.splice(index, 1);
            score += 5;
        }
        //Dolní bod playera *
        else if (player.x >= x && player.x <= x + width && (player.y + player.r) >= y && (player.y + player.r) <= (y + height)) {
            ctverce.splice(index, 1);
            score += 5;
        }
        //levý bod playera *
        else if (((player.x + player.r) >= x && (player.x + player.r) <= (x + width)) && player.y >= y && player.y <= (y + height)) {
            ctverce.splice(index, 1);
            score += 5;
        }
        //Pravý bod playera *
        else if (((player.x - player.r) >= x && (player.x - player.r) <= (x + width)) && player.y >= y && player.y <= (y + height)) {
            ctverce.splice(index, 1);
            score += 5;
        }
        //Horní pravý bod playera *
        else if (((player.x + player.Pb) >= x && (player.x + player.Pb) <= x + width) && (player.y - player.Pv) >= y && (player.y - player.Pv) <= (y + height)) {
            ctverce.splice(index, 1);
            score += 5;
        }
        //Horní levý bod playera
        else if (((player.x - player.Pb) >= x && (player.x - player.Pb) <= x + width) && (player.y - player.Pv) >= y && (player.y - player.Pv) <= (y + height)) {
            ctverce.splice(index, 1);
            score += 5;
        }
        //Dolní pravý bod playera
        else if (((player.x + player.Pb) >= x && (player.x + player.Pb) <= x + width) && (player.y + player.Pv) >= y && (player.y + player.Pv) <= (y + height)) {
            ctverce.splice(index, 1);
            score += 5;
        }
        //Dolní levý bod playera
        else if (((player.x - player.Pb) >= x && (player.x - player.Pb) <= x + width) && (player.y + player.Pv) >= y && (player.y + player.Pv) <= (y + height)) {
            ctverce.splice(index, 1);
            score += 5;
        }
        //Prostřední bod playera
        else if (player.x >= x && player.x <= x + width && player.y >= y && player.y <= (y + height)) {
            ctverce.splice(index, 1);
            score += 5;
        }
    }
    //
    //Pro okraje canvasu
    //
    // Pro kosktu
    // Pro kosktu
    if (!hodnotaNesmrtelnosti) {
        if ((player.x + player.width) >= (canvas.width - 5) || (player.x) <= (5)) {
            ukonceni = true;
            if (!particleStopper) {
                pripravaParticle();
                particleStopper = true;
            }
            console.log("UKONCIT SE");
        }
        else if ((player.y + player.height) >= (canvas.height - 5) || (player.y) <= (5)) {
            ukonceni = true;
            if (!particleStopper) {
                pripravaParticle();
                particleStopper = true;
            }
            console.log("UKONCIT SE");
        }
        return zmrazeniPotrvzeni;;
    }
    // Pro OwO buff
    else if ((player.x + player.r) >= (canvas.width - 5) || (player.x - player.r) <= (5)) {
        ukonceni = true;
        if (!particleStopper) {
            pripravaParticle();
            particleStopper = true;
        }
        console.log("UKONCIT SE");
    }
    else if ((player.y + player.r) >= (canvas.height - 5) || (player.y - player.r) <= (5)) {
        ukonceni = true;
        if (!particleStopper) {
            pripravaParticle();
            particleStopper = true;
        }
        console.log("UKONCIT SE");
    }
    return zmrazeniPotrvzeni;
}
function move() {
    document.addEventListener('keydown', function (e) {
        switch (e.code) {
            case 'KeyW': //Pohyb dopředu
                if (!ukonceni) {
                    player.y -= player.speedY;
                }
                break;
            case 'KeyA': //Pohyb dolena
                if (!ukonceni) {
                    player.x -= player.speedX;
                }
                break;
            case 'KeyS': //Pohyb dozadu
                if (!ukonceni) {
                    player.y += player.speedY;
                }
                break;
            case 'KeyD': //Pohyb doprava
                if (!ukonceni) {
                    player.x += player.speedX;
                }
                break;
            case 'KeyQ': //pro teleportaci
                if (!ukonceni) {
                    if (!dash && !dashKontrola) {
                        dash = true;
                        kontrolaDashProMys = true;
                        setTimeout(skok, 250);
                        function skok() {
                            dash = false;
                            player.x += velikostSkoku;
                            dashKontrola = true;
                        }
                    }
                    else if (!dash && dashKontrola) {
                        dash = true;
                        kontrolaDashProMys = false;
                        setTimeout(skokZa, 250);
                        function skokZa() {
                            dash = false;
                            player.x -= velikostSkoku;
                            dashKontrola = false;
                        }
                    }
                }
                //dash=true nebo false zde funguje jako pojistka že hráč "nepřeklikne" o více/méně bloků než by měl
                //dashKontrola rozhoduje jaký typ dashe se provádí (jestli dopředu či dozadu)
                break;
        }
    })
    canvas.addEventListener('mousemove', function (e) {
        if (!ukonceni) {
            if (!hodnotaNesmrtelnosti) {
                if (kontrolaDashProMys && !dash) {
                    player.x = e.offsetX - (player.width / 2);
                    player.x += velikostSkoku;
                    player.y = e.offsetY - (player.height / 2);
                }
                if (!kontrolaDashProMys && !dash) {
                    player.x = e.offsetX - (player.width / 2);
                    player.y = e.offsetY - (player.height / 2);
                }
            }
            if (hodnotaNesmrtelnosti) {
                if (kontrolaDashProMys && !dash) {
                    player.x = e.offsetX;
                    player.x += velikostSkoku;
                    player.y = e.offsetY;
                }
                if (!kontrolaDashProMys && !dash) {
                    player.x = e.offsetX;
                    player.y = e.offsetY;
                }
            }
        }
        //kontrolaDashProMys pracuje s tím že pokud hráč použije dash/teleport tak ať nejsou souřadnice myši nastaveny přímo na souřadnice hráče
    });
}
function vytvorAsteroidy() {
    for (i = 0; i < (Math.ceil(Math.random() * 10)); i++) {
        let Kx = (Math.ceil(Math.random() * (canvas.width)) + 10);
        let Ky = -5;
        let Kr = (Math.ceil(Math.random() * 50) + 10);
        let KspeedX = (Math.ceil(Math.random() * 10));
        let KspeedY = (Math.ceil(Math.random() * 10));
        let SP = (Math.ceil(Math.random() * 30));
        //pro barvu
        let citacBarva = (Math.ceil(Math.random() * 100));
        let barva = "";
        let citacProStroke = false;
        let citacProRoztristeniY = null;
        let roztristeniJednou = false;
        let barvaPoRoztristeni = false;
        let citacProZvetseni = null;
        let citacProZvetseniR = null;
        let stopProZvetseni = false;
        let zvetseniJednou = false;
        let nesmrtelnost = false;
        let mini = false;
        if (pretvarovacVytvareni) {
            KspeedX = (Math.ceil(KspeedX / 4));
            KspeedY = (Math.ceil(KspeedY / 4));
        }
        if (citacBarva <= (100 - SanceFreezeOwO - SanceMenicExploze - SanceZrychlovacAazZanik)) { //Základní
            barva = "red";
        }
        if (citacBarva > (100 - SanceFreezeOwO - SanceMenicExploze - SanceZrychlovacAazZanik) && citacBarva <= (100 - SanceFreezeOwO - SanceMenicExploze)) {  //zmensovac az zánik
            barva = "yellow";
            citacProZvetseniR = (Kr * 2);
            citacProZvetseni = (Math.ceil((Math.random() * (canvas.height / 2)) + canvas.height / 4));
        }
        if (citacBarva > (100 - SanceFreezeOwO - SanceMenicExploze) && citacBarva <= (100 - SanceFreezeOwO)) { //exploze
            barva = "#ff8000" //orandžová
            citacProRoztristeniY = (Math.ceil((Math.random() * (canvas.height / 4)) + canvas.height / 4));
            roztristeniJednou = true;
        }
        if (citacBarva > (100 - SanceFreezeOwO) && citacBarva <= 100) { //OwO buff
            barva = "white"
            citacProStroke = true;
            nesmrtelnost = true;
        }
        //

        let asteroidy = {
            x: Kx,
            y: Ky,
            r: Kr,
            speedX: KspeedX,
            speedY: KspeedY,
            SP: SP,
            /*SP = směr pohybu, pokud je SP:
            0-10=doprava
            11-20=doleva
            21-30=přímo dolů
            */
            barva: barva,
            citacProAsteroidStroke: citacProStroke,
            citacProAsteroidRoztristeni: citacProRoztristeniY,
            roztristeniJednou: roztristeniJednou,
            barvaPoRoztristeni: barvaPoRoztristeni,
            citacProZvetseni: citacProZvetseni,
            stopProZvetseni: stopProZvetseni,
            citacProZvetseniR: citacProZvetseniR,
            zvetseniJednou: zvetseniJednou,
            nesmrtelnost: nesmrtelnost,
            mini: mini,
        }
        kruhy.push(asteroidy);
    }
    console.log("POLE ASTEROIDY")
    console.log(kruhy);
}
function vytvorBloky() {
    for (i = 0; i < (Math.ceil(Math.random() * 10)); i++) {
        //let x = canvas.width - 5;
        let x = 1500;
        let y = (Math.ceil(Math.random() * (canvas.height - 1)));
        let width = (Math.ceil(Math.random() * 150) + 10);
        let height = (Math.ceil(Math.random() * 150) + 10);
        let speedX = ((Math.ceil(Math.random() * 10)) + 5);
        let sance = (Math.ceil(Math.random() * 100));
        let citacProStroke = false;
        let casNaPrevraceni = false;
        let citacRychlosti = false;
        let zmrazeni = false;
        let zmrazeniPotrvzeni = false; //zařídí že zmrazeni projde pouze u jednoho bloku jednou a že se nenanásobí rychlosti po vrácení zmražení  
        let barva = "";

        if (pretvarovacVytvareni) {
            speedX = (Math.ceil(speedX / 4));
        }
        if (sance < (100 - SanceFreezeOwO - SanceMenicExploze - SanceZrychlovacAazZanik)) { //základní
            barva = "white";
        }
        if (sance >= (100 - SanceFreezeOwO - SanceMenicExploze - SanceZrychlovacAazZanik) && sance < (100 - SanceFreezeOwO - SanceMenicExploze)) { //rychlovač
            barva = "blue";
            citacRychlosti = true;
        }
        if (sance >= (100 - SanceFreezeOwO - SanceMenicExploze) && sance < (100 - SanceFreezeOwO)) { //měnič
            barva = "#00ccff"; //světlejši modrá
            citacProStroke = true;
            casNaPrevraceni = true;
        }
        if (sance >= (100 - SanceFreezeOwO) && sance <= 100) { //freeze
            barva = "#00ffff";
            zmrazeni = true;
            zmrazeniPotrvzeni = true;
        }
        let bloky = {
            x: x,
            y: y,
            width: width,
            height: height,
            speedX: speedX,
            barva: barva,
            citacProBlokyStroke: citacProStroke,
            casNaPrevraceni: casNaPrevraceni,
            citacRychlostiBloky: citacRychlosti,
            zmrazeni: zmrazeni,
            zmrazeniPotrvzeni: zmrazeniPotrvzeni,
        }
        ctverce.push(bloky);
    }
    console.log("POLE BLOKY")
    console.log(ctverce);
}
function animace() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if ((!pretvarovacVytvareni || ukonceni) && !hodnotaNesmrtelnosti) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        m = 1;
        a = canvas.width;
        zmenaVyplne = false;
        particleStopper = false;
        zmenaStopper = false;
    }
    if (pretvarovacVytvareni && !ukonceni && !hodnotaNesmrtelnosti) {
        ctx.fillStyle = "#33ccff";
        m += 20;
        if (m < canvas.width) {
            ctx.beginPath();
            ctx.arc(player.x, player.y, m, 0, Math.PI * 2);
            ctx.fill();
        }
        if (m >= canvas.width) {
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            zmenaVyplne = true;
        }
    }
    if (hodnotaNesmrtelnosti && !ukonceni) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        a -= 20;
        if (a <= canvas.width && a != 100 && a > 100) {
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(player.x, player.y, a, 0, Math.PI * 2);
            ctx.fill();
        }
        if (a <= 20) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (!particleStopper) {
                for(i=0;i<=4;i++){
                pripravaParticle();
                }
                particleStopper = true;
            }
        }
    }
    vytvorOkraje();
    //Hráčův pohyb pokud není zaznamenána změna
    //ASTEROIDY
    kruhy.forEach(function (asteroidy, index) {
        //určení směru pro asteroidy
        if (asteroidy.citacProZvetseni != null && asteroidy.y >= asteroidy.citacProZvetseni) {
            asteroidy.stopProZvetseni = true;
        }
        if (!asteroidy.stopProZvetseni) {
            if (asteroidy.SP <= 10) {
                asteroidy.x += asteroidy.speedX;
                asteroidy.y += asteroidy.speedY;
            }
            else if (asteroidy.SP <= 20 && asteroidy.SP > 10) {
                asteroidy.x -= asteroidy.speedX;
                asteroidy.y += asteroidy.speedY;
            }
            else {
                asteroidy.y += asteroidy.speedY;
            }
        }
        // Pokud má asteroid speciální vyznačení (stroke) tak se zde nastaví
        if (!asteroidy.citacProAsteroidStroke) {
            ctx.fillStyle = asteroidy.barva;
        }
        if (asteroidy.citacProAsteroidStroke) {
            ctx.strokeStyle = asteroidy.barva;
        }
        if (hodnotaNesmrtelnosti) {
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
        }
        if (asteroidy.barva == "#ff8000" && asteroidy.roztristeniJednou == true) {
            roztristeni(asteroidy.x, asteroidy.y, asteroidy.citacProAsteroidRoztristeni, asteroidy.roztristeniJednou);
            if (roztristeni(asteroidy.x, asteroidy.y, asteroidy.citacProAsteroidRoztristeni, asteroidy.roztristeniJednou) == false) {
                //Pojistka proti tomu aby se po "roztristeni" neopakovala funkce znovu
                asteroidy.roztristeniJednou = false;
                asteroidy.barvaPoRoztristeni = true;
            }
        }
        if (!asteroidy.citacProAsteroidStroke) {
            if (asteroidy.barvaPoRoztristeni) {
                ctx.fillStyle = "red";
            }
            if (!asteroidy.barvaPoRoztristeni) {
                ctx.fillStyle = asteroidy.barva;
            }
            if (hodnotaNesmrtelnosti) {
                ctx.fillStyle = "black";
                ctx.strokeStyle = "black";
            }
        }
        //Provedení všech asteroidů
        if (!asteroidy.stopProZvetseni) {
            kontrolaAsteroidy(asteroidy.y, index);
            ctx.beginPath();
            ctx.arc(asteroidy.x, asteroidy.y, asteroidy.r, 0, Math.PI * 2);
        }
        //Kontrola pro debuff u asteroidy se zvětšením až zánikem
        if (asteroidy.stopProZvetseni) {
            kontrolaAsteroidy(asteroidy.y, index);
            if (asteroidy.r < asteroidy.citacProZvetseniR && !asteroidy.zvetseniJednou) {
                ctx.beginPath();
                ctx.arc(asteroidy.x, asteroidy.y, asteroidy.r, 0, Math.PI * 2);
                if (!ukonceni) {
                    asteroidy.r += 3;
                }
                if (pretvarovacVytvareni && !ukonceni) {
                    asteroidy.r += 1;
                }
                if (ukonceni) {
                    asteroidy.r += 5;
                }
            }
            if (asteroidy.r >= asteroidy.citacProZvetseniR || asteroidy.zvetseniJednou) {
                asteroidy.zvetseniJednou = true;
                ctx.beginPath();
                ctx.arc(asteroidy.x, asteroidy.y, asteroidy.r, 0, Math.PI * 2);
                if (!ukonceni) {
                    asteroidy.r -= 3;
                }
                if (pretvarovacVytvareni && !ukonceni) {
                    asteroidy.r -= 1;
                }
                if (ukonceni) {
                    asteroidy.r -= 5;
                }
            }
            if (asteroidy.r <= 3 && asteroidy.zvetseniJednou) {
                kruhy.splice(index, 1);
            }
        }
        // Pokud má asteroid speciální vyznačení (stroke) tak se zde provede
        if (!asteroidy.citacProAsteroidStroke) {
            ctx.fill();
        }
        if (asteroidy.citacProAsteroidStroke) {
            if (!hodnotaNesmrtelnosti) {
                ctx.stroke();
            }
            if (hodnotaNesmrtelnosti) {
                ctx.fill();
            }
        }
        kolizeAsteroidu(asteroidy.x, asteroidy.y, asteroidy.r, asteroidy.nesmrtelnost, index, asteroidy.mini);
    });
    //miniasteroidy 
    miniKruhy.forEach(function (miniAsteroidy, index) {
        //určení směru pro asteroidy
        if (miniAsteroidy.SP <= 10) {
            miniAsteroidy.x += miniAsteroidy.speedX;
            miniAsteroidy.y += miniAsteroidy.speedY;
        }
        else if (miniAsteroidy.SP <= 20 && miniAsteroidy.SP > 10) {
            miniAsteroidy.x -= miniAsteroidy.speedX;
            miniAsteroidy.y += miniAsteroidy.speedY;
        }
        else {
            miniAsteroidy.y += miniAsteroidy.speedY;
        }
        //Provedení všech asteroidů
        ctx.fillStyle = "red"
        if (hodnotaNesmrtelnosti) {
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
        }
        ctx.beginPath();
        ctx.arc(miniAsteroidy.x, miniAsteroidy.y, miniAsteroidy.r, 0, Math.PI * 2);
        ctx.fill();
        kolizeAsteroidu(miniAsteroidy.x, miniAsteroidy.y, miniAsteroidy.r, miniAsteroidy.nesmrtelnost, index, miniAsteroidy.mini);

        //Kontrola pro mini asteroidy
        if (canvas.height < miniAsteroidy.y) {
            miniKruhy.splice(index, 1);
            if (!ukonceniVytvarecu) {
                score++;
            }
        }
    });
    //BLOKY
    ctverce.forEach(function (bloky, index) {
        //ctx.fillStyle = "white";
        kontrolaBloky(bloky.x, index, bloky.width);
        if (!bloky.citacProBlokyStroke) {
            ctx.fillStyle = bloky.barva;
            if (hodnotaNesmrtelnosti) {
                ctx.fillStyle = "black";
                ctx.strokeStyle = "black";
            }
            ctx.fillRect(bloky.x, bloky.y, bloky.width, bloky.height);
        }
        if (bloky.citacProBlokyStroke) {
            if (!pretvarovacVytvareni || ukonceni) {
                ctx.strokeStyle = bloky.barva;
                pretoceni = 250;
            }
            if (pretvarovacVytvareni && !ukonceni) {
                ctx.strokeStyle = "red";
                pretoceni = 500;
            }
            if (hodnotaNesmrtelnosti) {
                ctx.fillStyle = "black";
                ctx.strokeStyle = "black";
            }
            if (bloky.casNaPrevraceni) {
                bloky.casNaPrevraceni = false;
                setTimeout(pretoceniBloku, pretoceni);
                function pretoceniBloku() {
                    docasnaHodnotaPrevraceni = bloky.width;
                    bloky.width = bloky.height;
                    bloky.height = docasnaHodnotaPrevraceni;
                    bloky.casNaPrevraceni = true;
                }
            }

            ctx.strokeRect(bloky.x, bloky.y, bloky.width, bloky.height);
        }
        if (!bloky.citacRychlostiBloky) {
            bloky.x -= bloky.speedX;
        }
        else if (bloky.citacRychlostiBloky) {
            bloky.speedX += 0.45;
            bloky.x -= bloky.speedX;
            Math.floor(bloky.x);
        }
        kolize(bloky.x, bloky.y, bloky.width, bloky.height, bloky.zmrazeni, bloky.zmrazeniPotrvzeni, index);
        if (!kolize(bloky.x, bloky.y, bloky.width, bloky.height, bloky.zmrazeni, bloky.zmrazeniPotrvzeni, index)) {
            bloky.zmrazeniPotrvzeni = false;
        }
    });
    //Kontrola pro teleport/dash hráče
    if (!hodnotaNesmrtelnosti) {
        if (!dashKontrola) {
            if (!pretvarovacVytvareni) {
                ctx.strokeStyle = "#0099ff";//Světle modrá
                ctx.fillStyle = "#4dff4d";//Světle zelená
            }
            else if (pretvarovacVytvareni) {
                ctx.strokeStyle = "#ff0066";//Růžová
                ctx.fillStyle = "#9933ff";//Fialová
            }
            if (ukonceni) {
                ctx.strokeStyle = "red";// V případě prohry se nastaví na červeno 
                ctx.fillStyle = "red";
            }
            ctx.strokeRect(player.x + velikostSkoku, player.y, player.width, player.height);
            if (dash && !ukonceni) {
                pripravaParticle();
                ctx.beginPath();
                ctx.arc(player.x + player.width / 2, player.y + player.height / 2, k, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        if (dashKontrola) {
            if (!pretvarovacVytvareni) {
                ctx.strokeStyle = "#4dff4d";
                ctx.fillStyle = "#0099ff";
            }
            else if (pretvarovacVytvareni) {
                ctx.strokeStyle = "#9933ff  ";
                ctx.fillStyle = "#ff0066";
            }
            if (ukonceni) {
                ctx.strokeStyle = "red";
                ctx.fillStyle = "red";
            }
            ctx.strokeRect(player.x - velikostSkoku, player.y, player.width, player.height);
            if (dash && !ukonceni) {
                pripravaParticle();
                ctx.beginPath();
                ctx.arc(player.x + player.width / 2, player.y + player.height / 2, k, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        //Samotný hráč
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    if (hodnotaNesmrtelnosti) {
        if (!ukonceni) {
            ctx.strokeStyle = "black";
        }
        if (ukonceni) {
            ctx.strokeStyle = "red";
        }
        ctx.beginPath();
        if (!dashKontrola) {
            ctx.arc(player.x + velikostSkoku, player.y, player.r, 0, Math.PI * 2);
        }
        if (dashKontrola) {
            ctx.arc(player.x - velikostSkoku, player.y, player.r, 0, Math.PI * 2);
        }
        ctx.stroke();
        if (!ukonceni && dash) {
            pripravaParticle();
            ctx.beginPath();
            ctx.arc(player.x, player.y, u, 0, Math.PI * 2);
            ctx.fill();
        }
        //Samotný hráč
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
        ctx.stroke();
        if (ukonceni) {
            ctx.fillStyle = "red";
            ctx.font = "30px Arial";
            ctx.fillText("XwX", (player.x - 10), player.y);
            End();
        }
        if (!owoOblicej) {
            if (!ukonceni) {
                if (OwO < 25) {
                    ctx.fillStyle = "black";
                    ctx.font = "25px Arial";
                    ctx.fillText("OwO", (player.x - 10), player.y);
                    ctx.beginPath();
                    ctx.moveTo(player.x-player.Pb, player.y-player.Pv);
                    ctx.lineTo(player.x-player.r, player.y-player.r-player.Pv);
            
                    ctx.moveTo(player.x-player.r, player.y-player.r-player.Pv);
                    ctx.lineTo(player.x, player.y-player.r);
            
                    ctx.moveTo(player.x, player.y-player.r);
                    ctx.lineTo(player.x+player.r, player.y-player.r-player.Pv);
            
                    ctx.moveTo(player.x+player.r, player.y-player.r-player.Pv);
                    ctx.lineTo(player.x+player.Pb, player.y-player.Pv);
                    ctx.stroke();
                }
                if (OwO >= 25) {
                    ctx.fillStyle = "black";
                    ctx.font = "25px Arial";
                    ctx.fillText("UwU", (player.x - 10), player.y);
                    ctx.beginPath();
                    ctx.moveTo(player.x-player.Pb, player.y-player.Pv);
                    ctx.lineTo(player.x-player.r, player.y-player.r-player.Pv/2);
            
                    ctx.moveTo(player.x-player.r, player.y-player.r-player.Pv/2);
                    ctx.lineTo(player.x, player.y-player.r);
            
                    ctx.moveTo(player.x, player.y-player.r);
                    ctx.lineTo(player.x+player.r, player.y-player.r-player.Pv/2);
            
                    ctx.moveTo(player.x+player.r, player.y-player.r-player.Pv/2);
                    ctx.lineTo(player.x+player.Pb, player.y-player.Pv);
                    ctx.stroke();
                }
            }
        }
        if (zmenaStopper) {
            ctx.fillStyle = "black";
            ctx.font = "25px Arial";
            ctx.fillText("^w^", (player.x - 10), player.y);
            ctx.beginPath();
            ctx.moveTo(player.x-player.r, player.y);
            ctx.lineTo(player.x-player.r-player.Pb, player.y+player.Pv/2);

            ctx.moveTo(player.x-player.r-player.Pb, player.y+player.Pv/2);
            ctx.lineTo(player.x-player.Pb, player.y-player.Pv);
    
            ctx.moveTo(player.x+player.r, player.y);
            ctx.lineTo(player.x+player.r+player.Pb, player.y+player.Pv/2);

            ctx.moveTo(player.x+player.r+player.Pb, player.y+player.Pv/2);
            ctx.lineTo(player.x+player.Pb, player.y-player.Pv);
            ctx.stroke();
            owoOblicej = true;
        }
        if (!OwOStopper) {
            OwOStopper = true;
            setTimeout(zmena, 6000);
            function zmena() {
                zmenaStopper = true;
            }
            setTimeout(konecOwO, 8000);
            function konecOwO() {
                hodnotaNesmrtelnosti = false;
                owoOblicej = false;
                zmenaStopper = false;
                OwOStopper = false;
            }
        }
    }
    End();
    particle.forEach(function (samostatnyParticle, index) {
        //určení směru pro asteroidy
        if (samostatnyParticle.SP <= 10) {
            samostatnyParticle.y -= samostatnyParticle.speedY; //nahoru
        }
        if (samostatnyParticle.SP <= 20 && samostatnyParticle.SP > 10) {
            samostatnyParticle.x -= samostatnyParticle.speedX; // nahoru doleva
            samostatnyParticle.y -= samostatnyParticle.speedY;
        }
        if (samostatnyParticle.SP <= 30 && samostatnyParticle.SP > 20) {
            samostatnyParticle.x -= samostatnyParticle.speedX; //doleva
        }
        if (samostatnyParticle.SP <= 40 && samostatnyParticle.SP > 30) {
            samostatnyParticle.x -= samostatnyParticle.speedX; // dolů doleva
            samostatnyParticle.y += samostatnyParticle.speedY;
        }
        if (samostatnyParticle.SP <= 50 && samostatnyParticle.SP > 40) {
            samostatnyParticle.y += samostatnyParticle.speedY; //dolů
        }
        if (samostatnyParticle.SP <= 60 && samostatnyParticle.SP > 50) {
            samostatnyParticle.x += samostatnyParticle.speedX; // dolů doprava
            samostatnyParticle.y += samostatnyParticle.speedY;
        }
        if (samostatnyParticle.SP <= 70 && samostatnyParticle.SP > 60) {
            samostatnyParticle.x += samostatnyParticle.speedX; // doprava
        }
        if (samostatnyParticle.SP <= 80 && samostatnyParticle.SP > 70) {
            samostatnyParticle.x += samostatnyParticle.speedX; //nahoru doprava
            samostatnyParticle.y -= samostatnyParticle.speedY;
        }

        if (hodnotaNesmrtelnosti && !ukonceni && zmenaVyplne) {
            ctx.fillStyle = "black";
        }
        if (!dashKontrola) {
            if (!pretvarovacVytvareni && !hodnotaNesmrtelnosti) {
                ctx.fillStyle = "#4dff4d";
            }
            else if (pretvarovacVytvareni && !hodnotaNesmrtelnosti) {
                ctx.fillStyle = "#9933ff";
            }
            if (hodnotaNesmrtelnosti) {
                ctx.fillStyle = "black";
            }
        }
        if (dashKontrola) {
            if (!pretvarovacVytvareni && !hodnotaNesmrtelnosti) {
                ctx.fillStyle = "#0099ff";
            }
            else if (pretvarovacVytvareni && !hodnotaNesmrtelnosti) {
                ctx.fillStyle = "#ff0066";
            }
            if (hodnotaNesmrtelnosti) {
                ctx.fillStyle = "black";
            }
        }
        if (ukonceni) {
            ctx.fillStyle = "red";
        }
        ctx.beginPath();
        ctx.arc(samostatnyParticle.x, samostatnyParticle.y, samostatnyParticle.r, 0, Math.PI * 2);
        ctx.fill();
        //Kontrola pro particle
        if (samostatnyParticle.r <= 3) {
            particle.splice(index, 1);
        }
        samostatnyParticle.r -= 1;
    });
    End();
    k += 1;
    u += 1;
    OwO += 1;
    if (k >= 30) {
        k = 20;
    }
    if (u >= 90) {
        u = 60;
    }
    if (OwO >= 50) {
        OwO = 0;
    }
    if (!hodnotaNesmrtelnosti) {
        Vysledky.innerHTML = score;
    }
    if (hodnotaNesmrtelnosti) {
        Vysledky.innerHTML = score + " * 5";
    }
    if (score > Nejlepsi) {
        Nejlepsi = score;
        Nejvysledek.innerHTML = Nejlepsi;
        console.log("NOVÝ NEJLEPŠÍ VÝSLEDEK");
    }
}
function kontrolaBloky(x, index, width) {
    if (x < -width) {
        ctverce.splice(index, 1);
        if (!ukonceniVytvarecu) {
            score++;
        }
        //console.log("Odstranění překážky (BLOKY)");
    }
    if (ctverce.length == 0) {
        konecnaObrazovka = true;
        console.log("KONECNA OBRAZOBKA");
        End();
    }
    if (ctverce.length < pocetBloky.value && !ukonceniVytvarecu) {
        vytvorBloky();
        //console.log("Vytvoření nových překážek (BLOKY)")
    }
}
function kontrolaAsteroidy(y, index) {
    if (canvas.height < y) {
        kruhy.splice(index, 1);
        if (!ukonceniVytvarecu) {
            score++;
        }
        //console.log("Odstranění překážky (ASTEROIDY)");
    }
    if (kruhy.length < pocetAsteroidy.value && !ukonceniVytvarecu) {
        vytvorAsteroidy();
        //console.log("Vytvoření nových překážek (ASTEROIDY)")
    }
    if (kruhy.length == 0) {
        konecnaObrazovka = true;
        console.log("KONECNA OBRAZOBKA");
        End();
    }
}
//Pro spuštění se první provede kontrola pole a spuštění animace
button.addEventListener('click', start);
function start() {
    SanceFreezeOwO = Number(FreezeOwO.value);
    SanceMenicExploze = Number(MenicExploze.value);
    SanceZrychlovacAazZanik = Number(ZrychlovacAazZanik.value);
    if (StartKontrola(SanceFreezeOwO, SanceMenicExploze, SanceZrychlovacAazZanik)) {
        score = 0;
        button.disabled = true;
        ukonceni = false;
        konecnaObrazovka = false;
        ukonceniVytvarecu = false;
        dashKontrola = false;
        kontrolaDashProMys = false;
        docasnaHodnotaPrevraceni = 0;
        hodnotaNesmrtelnosti = false;
        zmenaVyplne = false;
        particleStopper = false;
        zmenaStopper = false;
        pretoceni = 250;
        vytvorOkraje();
        setTimeout(tri, 1000);
        function tri() {
            console.log("Příprava 3");
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, 5);
            ctx.fillRect(0, 0, 5, canvas.height);
            ctx.fillRect(0, canvas.height - 5, canvas.width, canvas.height - 5);
            ctx.fillRect(canvas.width - 5, 0, canvas.width - 5, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, 1);
            ctx.fillRect(0, 0, 1, canvas.height);
            ctx.fillRect(0, canvas.height - 1, canvas.width, canvas.height - 1);
            ctx.fillRect(canvas.width - 1, 0, canvas.width - 1, canvas.height);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = "100px Arial";
            ctx.fillText("PŘIPRAV SE", (canvas.width / 2) - 250, canvas.height / 2);
            ctx.fillText("3", (canvas.width / 2), canvas.height / 2 + 100);
        }
        setTimeout(dva, 2000);
        function dva() {
            console.log("Příprava 2");
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, 5);
            ctx.fillRect(0, 0, 5, canvas.height);
            ctx.fillRect(0, canvas.height - 5, canvas.width, canvas.height - 5);
            ctx.fillRect(canvas.width - 5, 0, canvas.width - 5, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, 1);
            ctx.fillRect(0, 0, 1, canvas.height);
            ctx.fillRect(0, canvas.height - 1, canvas.width, canvas.height - 1);
            ctx.fillRect(canvas.width - 1, 0, canvas.width - 1, canvas.height);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = "100px Arial";
            ctx.fillText("PŘIPRAV SE", (canvas.width / 2) - 250, canvas.height / 2);
            ctx.fillText("2", (canvas.width / 2), canvas.height / 2 + 100);
        }
        setTimeout(jedna, 3000);
        function jedna() {
            console.log("Příprava 1");
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, 5);
            ctx.fillRect(0, 0, 5, canvas.height);
            ctx.fillRect(0, canvas.height - 5, canvas.width, canvas.height - 5);
            ctx.fillRect(canvas.width - 5, 0, canvas.width - 5, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, 1);
            ctx.fillRect(0, 0, 1, canvas.height);
            ctx.fillRect(0, canvas.height - 1, canvas.width, canvas.height - 1);
            ctx.fillRect(canvas.width - 1, 0, canvas.width - 1, canvas.height);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = "100px Arial";
            ctx.fillText("PŘIPRAV SE", (canvas.width / 2) - 250, canvas.height / 2);
            ctx.fillText("1", (canvas.width / 2), canvas.height / 2 + 100);
        }
        setTimeout(start, 4000);
        function start() {
            console.log("Finální Příprava");
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, 5);
            ctx.fillRect(0, 0, 5, canvas.height);
            ctx.fillRect(0, canvas.height - 5, canvas.width, canvas.height - 5);
            ctx.fillRect(canvas.width - 5, 0, canvas.width - 5, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, 1);
            ctx.fillRect(0, 0, 1, canvas.height);
            ctx.fillRect(0, canvas.height - 1, canvas.width, canvas.height - 1);
            ctx.fillRect(canvas.width - 1, 0, canvas.width - 1, canvas.height);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = "100px Arial";
            ctx.fillText("Start", (canvas.width / 2) - 100, canvas.height / 2);
        }
        setTimeout(konecnaPriprava, 4500);
        function konecnaPriprava() {
            player.x = canvas.width / 100;
            player.y = canvas.height / 2;
            kontrolaBloky();
            kontrolaAsteroidy();
            startovac = setInterval(animace, 30);
            document.onkeypress = move();
            canvas.onmousemove = move();
            console.log("OwO");
        }
    }
}