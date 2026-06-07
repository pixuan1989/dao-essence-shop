const fs = require('fs');

// Fix favorable-element.html - update loading text
let fav = fs.readFileSync('favorable-element.html', 'utf8');
const favCRLF = fav.includes('\r\n');
const favNorm = favCRLF ? fav.replace(/\r\n/g, '\n') : fav;

const favOld = `            <p class="fe-loading-text" data-i18n="fav.loading_text1">Analyzing your birth chart...</p>
            <p class="fe-loading-text" style="font-size:0.8rem;margin-top:0.5rem;color:var(--text-muted);">`;
const favNew = `            <p class="fe-loading-text" data-i18n="fav.loading_text1">Analyzing your birth chart...</p>
            <p class="fe-loading-text" style="font-size:0.8rem;margin-top:0.5rem;color:var(--text-muted);"><span data-i18n="fav.loading_text2">Character analysis takes time, please wait patiently</span></p>`;

if (favNorm.includes(favOld)) {
    let result = favNorm.replace(favOld, favNew);
    fs.writeFileSync('favorable-element.html', favCRLF ? result.replace(/\n/g, '\r\n') : result, 'utf8');
    console.log('OK: favorable-element.html text updated');
} else {
    console.log('checking fav loading text...');
    // Try to find the actual text
    const idx = favNorm.indexOf('Analyzing your birth chart');
    if (idx >= 0) console.log('Found at char', idx, ':', favNorm.substring(idx-20, idx+80));
    else console.log('NOT found');
}

// Fix almanac.html - add waiting text
let alm = fs.readFileSync('almanac.html', 'utf8');
const almCRLF = alm.includes('\r\n');
const almNorm = almCRLF ? alm.replace(/\r\n/g, '\n') : alm;

const almOld = `            <p id="almLoadingTimer" style="font-size:0.75rem;color:var(--text-muted);margin-top:0.8rem;"></p>`;
const almNew = `            <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.5rem;" data-i18n="alm.loading_wait"><span>命理分析需要時間，請耐心等待</span></p>
            <p id="almLoadingTimer" style="font-size:0.75rem;color:var(--gold);margin-top:0.4rem;"></p>`;

if (almNorm.includes(almOld)) {
    let result = almNorm.replace(almOld, almNew);
    fs.writeFileSync('almanac.html', almCRLF ? result.replace(/\n/g, '\r\n') : result, 'utf8');
    console.log('OK: almanac.html text updated');
} else {
    console.log('checking alm loading text...');
    const idx = almNorm.indexOf('almLoadingTimer');
    if (idx >= 0) console.log('Found at char', idx, ':', almNorm.substring(idx-20, idx+100));
    else console.log('NOT found');
}
