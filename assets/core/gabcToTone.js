export function gabcToTone(gabc){ // Criar módulo específico para isso com melhores implementações
    let melodyGABC = gabc? [...gabc.matchAll(/\(([^)]*)\)/g)].map(m => m[1].replace(/\[[^\]]*\]/g, "").trim()) : "";
    const tones = /[A-Ma-m]/g;
    const clef = /[cfCF]b?[1234]/;
    const rythmicSigns = /[._]\d*?/g;
    const accidents = /[A-Ma-m][XYxy#]/g;
    const spaces = /[!@/vV]|\/\/|\/0|\[-?\d+\]/g;
    const noteModificator = /[~><os]|Rr[012345]?/g;
    const bistrophaTristropha = /([A-Ma-m])\1{1,2}/gi;
    const salicus = /(?:A[B-M]'[C-M]|B[C-M]'[D-M]|C[D-M]'[E-M]|D[E-M]'[F-M]|E[F-M]'[G-M]|F[G-M]'[H-M]|G[H-M]'[I-M]|H[I-M]'[J-M]|I[J-M]'[K-M]|J[K-M]'[L-M]|K[L-M]'[M-M]|L[M-M]'[M-M])/gi;
    const quilisma = /[A-Ma-m][^A-Ma-m]?[A-Ma-m]w[A-Ma-m]/g;
    const pressus = /([a-m])'?\1/gi;
    const bivirga = /[A-Ma-m]vv/g;
    const cadentPesClivis = /[A-Ma-m][^A-Ma-m]?[A-Ma-m]\.\./g;
    const respiration = /[,;:]|::/g;

    const notes = new RegExp(tones.source + '(' + rythmicSigns.source + ')?', 'g');
    const trashBin = new RegExp(spaces.source + '|' + noteModificator.source, 'g');
    melodyGABC = melodyGABC.map(e => e.replace(bivirga, match => {
        match = match.replace('vv', match[0]);
        return match
    }));
    melodyGABC = melodyGABC.map(e => e.replace(trashBin, "")) // Remoção de caracteres de formatação
    console.log(melodyGABC);
    melodyGABC = melodyGABC.map(e => e.replace(cadentPesClivis, match => {
        return match[0] + '.' + match[match.length - 3] + '.';
    })); // Alongamento das notas nas cadencias de pes e clivis
    melodyGABC = melodyGABC.map(e => e.replace(rythmicSigns, ".")); // Marcações de alongamento das notas
    melodyGABC = melodyGABC.map(e => e.replace(salicus, match => match.replace("'", ".")));
    /*melodyGABC = melodyGABC.map(e => e.replace(bistrophaTristropha, match => {
        match = match[0] + '.'
        return match;
    }));*/
    melodyGABC = melodyGABC.map(e => e.replace("'", ''));
    melodyGABC = melodyGABC.map(e => e.replace(quilisma, match => {
        match = match.replace('w', '');
        match = match.slice(0, 1) + '.' + match.slice(1);
        return match
    }));
    /*melodyGABC = melodyGABC.map(e => e.replace(pressus, match => {
        match = match[0] + '.'
        return match;
    }));*/
    melodyGABC = melodyGABC.map(e => e.toUpperCase());

    for (let i = 0; i < melodyGABC.length; i++) {
        if (melodyGABC[i].match(respiration) && melodyGABC[i].length > 1){
            let splits = melodyGABC[i].split(respiration);
            melodyGABC.splice(i, 1, ...splits);
        }
    }
    const accidentsSplit = new RegExp('(?=' + accidents.source + ')', 'g');
    for (let i = 0; i < melodyGABC.length; i++) {
        if (melodyGABC[i].match(accidents) && melodyGABC[i].length > 1){
            let splits = melodyGABC[i].split(accidentsSplit);
            melodyGABC.splice(i, 1, ...splits);
        }
    }
    function placeAccidents(noteStr){
        const accidentNote = noteStr.match(accidents)[0][0];
        const accident = noteStr.match(accidents)[0][1];
        let noteAccidented = accidentNote;
        switch (accident) {
            case 'X':
                noteAccidented += 'b';
                break; 
            case 'Y':
                noteAccidented = accidentNote[0];
                break;
            case '#':
                noteAccidented += '#';
                break;       
            }
        let accidentIndex = noteStr.search(accidents);
        noteStr = noteStr.replace(accidents, "");
        noteStr = noteStr.replaceAll(accidentNote, (match, i) => {
            if (i >= accidentIndex && match === accidentNote) {
                return noteAccidented;
            }else {
                return match;
            }   
        });
        return noteStr;
    }
    melodyGABC = melodyGABC.map(e => accidents.test(e)? placeAccidents(e): e);
    const melody = [];
    const gabcNotes = ["A","B","C","D","E","F","G","H","I","J","K","L","M"];
    const toneNotes = ["F3", "G3,", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"];
    
    let scoreSplitted = [];
    let clefFound = false;
    let clefScoreList = [];
    for (let e of melodyGABC) {
        const isClef = clef.test(e);
        if (isClef && !clefFound){
            clefFound = true;
        }else if (isClef && clefFound){
            clefScoreList.push(scoreSplitted);
            scoreSplitted = [];
        }
        if (clefFound) {
            scoreSplitted.push(e);
        }   
    }
    clefScoreList.push(scoreSplitted);

    const notesWithb = new RegExp(tones.source + 'b?' + '(' + rythmicSigns.source + ')?', 'g');
    clefScoreList.map(score => {
        scoreSplitted = [];
        for (let e of score) {
            if (score.indexOf(e) === 0) {
                scoreSplitted.push(e);
                continue;
            }
            const matches = e.matchAll(notesWithb);
            for (let match of matches) {
                scoreSplitted.push(match[0]);
            }
        }
        clefScoreList.splice(clefScoreList.indexOf(score), 1, scoreSplitted);
    });
    for (let score of clefScoreList) {
        let clef = score[0];
        for (let i in score) {
            if (score[i] === clef) continue;
            switch (clef) {
                case 'C4':
                        score[i] = score[i].replace(notesWithb, match => {
                        const noteIndex = gabcNotes.indexOf(match[0]);
                        let chars = match.slice(1);
                        let finalNote = toneNotes[noteIndex + 2];
                        if (score[i].includes('b')) {
                            finalNote = finalNote[0] + chars[0] + finalNote.slice(1) + chars.slice(1);
                        }else {
                            finalNote = finalNote + chars;
                        }
                        return finalNote;
                    });
                    break;
                case 'C3':
                    score[i] = score[i].replace(notesWithb, match => {
                        const noteIndex = gabcNotes.indexOf(match[0]);
                        let chars = match.slice(1);
                        let finalNote = toneNotes[noteIndex + 4];
                        if (score[i].includes('b')) {
                            finalNote = finalNote[0] + chars[0] + finalNote.slice(1) + chars.slice(1);
                        }else {
                            finalNote = finalNote + chars;
                        }
                        return finalNote;
                    });
                    break;
                case 'F3':
                    score[i] = score[i].replace(notesWithb, match => {
                        const noteIndex = gabcNotes.indexOf(match[0]);
                        let chars = match.slice(1);
                        let finalNote = toneNotes[noteIndex];
                        if (score[i].includes('b')) {
                            finalNote = finalNote[0] + chars[0] + finalNote.slice(1) + chars.slice(1);
                        }else {
                            finalNote = finalNote + chars;
                        }
                        return finalNote;
                    });
                    break;
            }
        }
    }

    for (let e of clefScoreList) {
        for (let i in e) {
            if (i === '0') continue;
            melody.push(e[i]);
        }
    }
    return melody;
}

//let gabcExample = "(c4) SAl(hhgh)ve,(d.) *(,) Re(hg)gí(fe/fgf)na,(e[ll:1]d..) (;) ma(c)ter(d) mi(dc)se(d)ri(ef)cór(g)di(dec)ae :(d.) (::) (c3) Vi(hhgh)ta,(d.) (,) dul(hg)cé(fe/fgf)do,(e[ll:1]d..) (;) et(c) spes(d) no(ef)stra,(g.) (,) sal(dec)ve.(d.) (::) Ad(df) te(h') cla(g)má(gfh)mus,(e.) (;) éx(g)su(f)les,(edg.) (,) fí(c)li(d)i(edg) He(fe)vae.(d.) (::) Ad(df) te(h') su(j)spi(g)rá(gfg)mus,(h.) (;) ge(d)mén(fg~)tes(g') et(d) flen(fvED)tes(c.) (;) in(d) hac(dcf) la(gh)cri(g)má(fe)rum(g) val(fe~)le.(dcd.) (::) E(ffg){ia}(f) er(gh~)go,(h'_) (,) Ad(j)vo(g)cá(hvGF)ta(d') no(g)stra,(h.) (;) il(k)los(k) tu(ji/jk)os(h'_) (,) mi(k)se(j')ri(h)cór(gfh')des(g) ó(de)cu(f)los(evDC.) (;) ad(cd) nos(f) con(gf~)vér(dcd)te.(d.) (::) Et(d) Je(a)sum,(c_[ll:1]d) (,) be(d)ne(de)dí(e[ll:1]dd)ctum(c') fru(g)ctum(f) ven(e[ll:1]d~)tris(g) tu(fe)i,(dcd.) (;) no(ixdh'!iv)bis(h.) (,) post(hvGF) hoc(g') ex(d)sí(f)li(fe)um(dc__) (,) os(efe)tén(d.)de.(d.) (::) O(hhg/h!iwj) cle(ivHG)mens :(h.) (::) O(g.h!iwjji) pi(hg)a :(gh..) (::) O(hd__fvEDC'd) (,) (de!fg) dul(gf~)cis(g_[uh:l]h) *() Vir(d)go(c') Ma(d)rí(dgff)a.(e[ll:1]d..) (::)";
//let gabcExample = "(c3) AL(evv)le(e)lú(ef'h fi//gi~)ia.(ii) {*}~<i>ij.</i>(;) (g!iwjij//ijihiHF'fe.) (;) (iv.ji/jijvIG.hih'/!ivHF'fe.) (,) (iv.ef//efd.1/fhf/gffe.) (::)<sp>V/</sp> Pas(h)cha(g) nos(ijij)trum(i_j_i_2/j_g//hi/j_i/j_g/hihhg.) (;) im(h)mo(i)lá(il.mvLKlvKJkkki;lv.mvLKlvKJkkki//jvIHh'hf/gh'i,jkIH'ivHF'fe.,g!hwigiigi)tus(giG'FE./[-0.5]gvFEfe) est(e.) *(;) Chris(e/f'h//f!igi)tus.(iie.) (,) (i'jvIH'ivHF'fe.) (,) (iv.ef//efd.1/fhf/gffe.) (::)";
//console.log(gabcToTone(gabcExample));