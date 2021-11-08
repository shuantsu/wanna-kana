const endgameCta = document.getElementById('action-button');
const input = document.getElementById('input');
const root = document.getElementById('root');
const options = document.getElementById('options');
const table = document.getElementById('table-container');
const select = document.getElementById('alphabet');
const stagingWord = document.getElementById('staging-word');
const flash = document.getElementById('flash');
const statistics = document.getElementById('statistics');
const practiceCheckbox = document.getElementById('practice-checkbox');
let queue = [];
let wrong = 0;
let right = 0;

function setEndgameCtaToNormalGame() {
    endgameCta.innerHTML = 'Voltar para o menu';
    endgameCta.onclick = () => returnToMenu();
}

function setEndgameCtaToCumulativeTraining() {
    endgameCta.innerHTML = 'Próxima iteração';
    endgameCta.onclick = () => {
        returnToMenu();
        game();
    };
}

setEndgameCtaToNormalGame();

const jsConfetti = new JSConfetti(document.getElementById('confetti'));

function prettifySeconds(seconds) {
    const date = new Date(null);
    date.setSeconds(seconds);
    const rest = seconds - Math.floor(seconds);
    let result = date.toISOString().substr(11, 8);
    if (rest) result += '.' + (rest).toFixed(3).split('.')[1];
    const [h,m,s] = result.split(':');
    if (h === "00") {
        if (m === "00") {
            return s;
        }
        return m + ':' + s;
    }
    return result;
}

function fromToPicker() {
    for (let el of [...document.querySelectorAll('#target option')]) {
        el.hidden = document.querySelector('#alphabet').value === el.value;
        document.querySelector('#target').value = document.querySelector('#target option:not([hidden])').value;
    }
}
fromToPicker();

function reveal(el) {
    if (dica) { return false};
    dica = true;
    const staging = el.innerText.trim();
    const to = parseInt(document.getElementById('target').value);
    const from = parseInt(document.getElementById('alphabet').value);
    stagingWord.innerText = smartTransform(staging, from, to);
    input.focus();
    return false;
}

function shuffle(array) {
    var indice_atual = array.length, valor_temporario, indice_aleatorio;

    while (0 !== indice_atual) {

        indice_aleatorio = Math.floor(Math.random() * indice_atual);
        indice_atual -= 1;

        valor_temporario = array[indice_atual];
        array[indice_atual] = array[indice_aleatorio];
        array[indice_aleatorio] = valor_temporario;
    }

    return array;
}

const kana = [
    [['a', 'ア', 'あ'],  ['i', 'イ', 'い'],   ['u', 'ウ', 'う'],   ['e', 'エ', 'え'],  ['o', 'オ', 'お']],
    [['ka', 'カ', 'か'], ['ki', 'キ', 'き'],  ['ku', 'ク', 'く'],  ['ke', 'ケ', 'け'], ['ko', 'コ', 'こ']],
    [['ga', 'ガ', 'が'], ['gi', 'ギ', 'ぎ'],  ['gu', 'グ', 'ぐ'],  ['ge', 'ゲ', 'げ'], ['go', 'ゴ', 'ご']],
    [['sa', 'サ', 'さ'], ['shi', 'シ', 'し'], ['su', 'ス', 'す'],  ['se', 'セ', 'せ'], ['so', 'ソ', 'そ']],
    [['za', 'ザ', 'ざ'], ['ji', 'ジ', 'じ'],  ['zu', 'ズ', 'ず'],  ['ze', 'ゼ', 'ぜ'], ['zo', 'ゾ', 'ぞ']],
    [['ta', 'タ', 'た'], ['chi', 'チ', 'ち'], ['tsu', 'ツ', 'つ'], ['te', 'テ', 'て'], ['to', 'ト', 'と']],
    [['da', 'ダ', 'だ'], ['dji', 'ヂ', 'ぢ'], ['dzu', 'ヅ', 'づ'], ['de', 'デ', 'で'], ['do', 'ド', 'ど']],
    [['na', 'ナ', 'な'], ['ni', 'ニ', 'に'],  ['nu', 'ヌ', 'ぬ'],  ['ne', 'ネ', 'ね'], ['no', 'ノ', 'の']],
    [['ha', 'ハ', 'は'], ['hi', 'ヒ', 'ひ'],  ['fu', 'フ', 'ふ'],  ['he', 'ヘ', 'へ'], ['ho', 'ホ', 'ほ']],
    [['ba', 'バ', 'ば'], ['bi', 'ビ', 'び'],  ['bu', 'ブ', 'ぶ'],  ['be', 'ベ', 'べ'], ['bo', 'ボ', 'ぼ']],
    [['pa', 'パ', 'ぱ'], ['pi', 'ピ', 'ぴ'],  ['pu', 'プ', 'ぷ'],  ['pe', 'ペ', 'ぺ'], ['po', 'ポ', 'ぽ']],
    [['ma', 'マ', 'ま'], ['mi', 'ミ', 'み'],  ['mu', 'ム', 'む'],  ['me', 'メ', 'め'], ['mo', 'モ', 'も']],
    [['ya', 'ヤ', 'や'], ['yu', 'ユ', 'ゆ'],  ['yo', 'ヨ', 'よ']],
    [['ra', 'ラ', 'ら'], ['ri', 'リ', 'り'],  ['ru', 'ル', 'る'],  ['re', 'レ', 'れ'], ['ro', 'ロ', 'ろ']],
    [['wa', 'ワ', 'わ'], ['wo', 'ヲ', 'を'],  ['n', 'ン', 'ん']],

    [["kya", "キャ", "きゃ"], ["kyu", "キュ", "きゅ"], ["kyo", "キョ", "きょ"]], 
    [["gya", "ギャ", "ぎゃ"], ["gyu", "ギュ", "ぎゅ"], ["gyo", "ギョ", "ぎょ"]], 
    [["sha", "シャ", "しゃ"], ["shu", "シュ", "しゅ"], ["sho", "ショ", "しょ"]], 
    [["ja", "ジャ", "じゃ"],  ["ju", "ジュ", "じゅ"],  ["jo", "ジョ", "じょ"]], 
    [["cha", "チャ", "ちゃ"], ["chu", "チュ", "ちゅ"], ["cho", "チョ", "ちょ"]], 
    [["nya", "ニャ", "にゃ"], ["nyu", "ニュ", "にゅ"], ["nyo", "ニョ", "にょ"]], 
    [["hya", "ヒャ", "ひゃ"], ["hyu", "ヒュ", "ひゅ"], ["hyo", "ヒョ", "ひょ"]], 
    [["bya", "ビャ", "びゃ"], ["byu", "ビュ", "びゅ"], ["byo", "ビョ", "びょ"]], 
    [["pya", "ピャ", "ぴゃ"], ["pyu", "ピュ", "ぴゅ"], ["pyo", "ピョ", "ぴょ"]], 
    [["mya", "ミャ", "みゃ"], ["myu", "ミュ", "みゅ"], ["myo", "ミョ", "みょ"]], 
    [["rya", "リャ", "りゃ"], ["ryu", "リュ", "りゅ"], ["ryo", "リョ", "りょ"]]
];

const transform = {
    hiraganaToRomaji: {},
    hiraganaToKatakana: {},
    katakanaToRomaji: {},
    katakanaToHiragana: {},
    romajiToKatakana: {},
    romajiToHiragana: {},
};
for (let group of kana) {
    for (let k of group) {
        for (let from of [0,1,2]) {
            for (let to of [0,1,2]) {
                if (from !== to) {
                    // 0 = romaji
                    // 1 = katakana
                    // 2 = hiragana
                    if (from === 0 && to === 1) {
                        transform.romajiToKatakana[k[from]]=k[to];
                    }
                    if (from === 2 && to === 1) {
                        transform.hiraganaToKatakana[k[from]]=k[to];
                    }
                    if (from === 1 && to === 2) {
                        transform.katakanaToHiragana[k[from]]=k[to];
                    }
                    if (from === 0 && to === 2) {
                        transform.romajiToHiragana[k[from]]=k[to];
                    }
                    if (from === 1 && to === 0) {
                        transform.katakanaToRomaji[k[from]]=k[to];
                    }
                    if (from === 2 && to === 0) {
                        transform.hiraganaToRomaji[k[from]]=k[to];
                    }
                }
            }
        }
    }
}
function smartTransform(k, from, to) {
    if (from === 0 && to === 1) {
        return transform.romajiToKatakana[k];
    }
    if (from === 2 && to === 1) {
        return transform.hiraganaToKatakana[k];
    }
    if (from === 1 && to === 2) {
        return transform.katakanaToHiragana[k];
    }
    if (from === 0 && to === 2) {
        return transform.romajiToHiragana[k];
    }
    if (from === 1 && to === 0) {
        return transform.katakanaToRomaji[k];
    }
    if (from === 2 && to === 0) {
        return transform.hiraganaToRomaji[k];
    }
}

const tableUtils = {
    showAll: () => {
        document.querySelectorAll('#table-container [type=checkbox]').forEach(el=>{
            el.checked=true;
            el.onchange();
        });
    },
    hideAll: () => {
        document.querySelectorAll('#table-container [type=checkbox]').forEach(el=>{
            el.checked=false;
            el.onchange();
        });
    },
    toggleRow: (checked, row) => {
        const rowList = document.querySelectorAll(`.kana-row`)[+row];
        [...rowList.querySelectorAll('.kana-cell')].map(cell => {
            if (checked) {
                cell.classList.add('active');
            } else {
                cell.classList.remove('active');
            }
        });
    },
    toggleActive : (el) => {
        el.classList.toggle('active');
        const total = el.parentNode.querySelectorAll('.kana-cell').length;
        const active = el.parentNode.querySelectorAll('.active').length;
        if (total === active) {
            el.parentNode.querySelector('[type=checkbox]').checked = true;
        }
        if (active === 0) {
            el.parentNode.querySelector('[type=checkbox]').checked = false;
        }
    }
};

function compare(a, b, fun) {
    return fun(a) === b;
}

function isEquivalent() {
    const to = parseInt(document.getElementById('target').value);
    const from = parseInt(document.getElementById('alphabet').value);
    const expected = queue[queueIndex].trim().toLowerCase();
    const answer = input.value.trim().toLowerCase();
    return compare(expected, answer, (x) => smartTransform(x, from, to));
}

function renderTable() {
    const output = [];
    let row = 0;
    let n = 0;
    for (let group of kana) {
        const openingTag = `<span onclick="if (!isCumulativeTraining()) tableUtils.toggleActive(this);" class="kana-cell"">`;
        output.push(`<div data-row="${row}" class="kana-row"><input onchange="tableUtils.toggleRow(this.checked, this.parentNode.dataset.row)" type="checkbox"/>${openingTag}` + group.map(i=>`<span class="romaji">${i[0]}</span><span class="katakana">${i[1]}</span><span class="hiragana">${i[2]}</span>`).join(`</span>${openingTag}`) + '</span></div>')
        row++;
    }
    table.innerHTML = output.join('');
}

renderTable();
tableUtils.showAll();

select.onchange = (ev) => {
    fromToPicker();
    document.querySelector('#table-container').className = ["romaji", "katakana", "hiragana","kana"][parseInt(ev.target.value)];
};

let queueIndex = 0;

let times = [];

let dica;

function nextKanaCount() {
    document.getElementById('kanas-left').innerHTML = `${right+wrong+1}/${queue.length}`;
}

let row = 0;

function game() {
    arrRightWrong = [];
    const currentSortedTh = document.querySelector('.sortable th.dir-d,.sortable th.dir-u');
    if (currentSortedTh) {
        currentSortedTh.classList.value="";
    }
    const to = parseInt(document.getElementById('target').value);
    const from = parseInt(document.getElementById('alphabet').value);
    const alphabets = ["Romaji", "Katakana", "Hiragana"];
    input.placeholder = `De: ${alphabets[parseInt(from)]} - Para: ${alphabets[parseInt(to)]}`;
    dica = false;
    computedTimes = [];
    times = [+new Date()];
    wrong = 0;
    right = 0;
    stats = [];
    document.getElementById('stats-table-body').innerHTML = "";
    queueIndex = 0;
    input.value="";
    queue = [...document.querySelectorAll('.kana-cell.active')].map(i=>i.innerText);
    if (queue.length === 0) {
        Toastify({
            text: "Escolha primeiro!",
            duration: 1000,
            style: {
                background: "linear-gradient(to right, rgb(238, 0, 167), rgb(255, 99, 8))",
            }
        }).showToast();
        return false;
    }
    shuffle(queue);
    showKana();
    root.classList.remove('hide');
    options.classList.add('hide');
    input.focus();
    nextKanaCount();
}
function showKana() {
    stagingWord.innerText = queue[queueIndex];
}

const zip = (...arrays) => {
    const length = Math.min(...arrays.map(arr => arr.length));
    return Array.from({ length }, (value, index) => arrays.map((array => array[index])));
};

function compute(times) {
    return zip(times, times.slice(1)).map((a) => (a[1]-a[0])/1000);
}

let computedTimes = [];

function endGame() {
    if (right + wrong === 0) {
        options.classList.remove('hide');
        root.classList.add('hide');
        return false;
    }
    if ((right + wrong) !== queue.length) {
        times.push(+new Date());
    } else {
        if (isCumulativeTraining()) {
            if (row === document.querySelectorAll('.kana-row').length - 1) {
                if (document.querySelectorAll('.kana-cell.active').length === 0)  {
                    jsConfetti.addConfetti();
                    exitPractice();
                    setEndgameCtaToNormalGame();
                    practiceCheckbox.checked = false;
                }
            } else {
                setEndgameCtaToCumulativeTraining();
                tableUtils.toggleRow(true, ++row);
            }
        } else {
            if (wrong === 0) jsConfetti.addConfetti();
        }
    }
    computedTimes = compute(times);
    const computedTimesRW = zip(computedTimes, arrRightWrong);
    const rightTimes = computedTimesRW.filter(i=>i[1]===1).map(i=>i[0]);
    const sumTimes = rightTimes.reduce((a,b)=>a+b, null);
    document.querySelectorAll('[data-time-index]').forEach((el, idx) => {
        el.innerText = `${prettifySeconds(computedTimes[idx])}s`;
        el.dataset.sort = computedTimes[idx];
    });
    statistics.classList.remove('hide');
    root.classList.add('hide');
    let details = '';
    if (rightTimes.length !== 0) {
        details = `Tempo mínimo de acertos: ${prettifySeconds(Math.min.apply(Math, rightTimes))}s
Tempo máximo de acertos: ${prettifySeconds(Math.max.apply(Math, rightTimes))}s
Tempo médio de acertos: ${prettifySeconds(sumTimes / (wrong+right))}s`;
    }
    document.getElementById('results').innerHTML = `Tempo total: ${prettifySeconds(computedTimes.reduce((a,b)=>a+b, null))}s
Feitos: ${right+wrong}/${queue.length} (${((right+wrong)*100/(queue.length)).toFixed(2)}%)

Acertos total: ${(right)}/${queue.length} (${(parseInt(right)*100/(queue.length)).toFixed(2)}%)
Acertos parcial: ${(right)}/${right+wrong} (${(parseInt(right)*100/(right+wrong)).toFixed(2)}%)

${details}`;
    
    function hideKeyboard() {
        const activeElement = document.activeElement;
        activeElement.setAttribute('readonly', 'readonly'); 
        activeElement.setAttribute('disabled', 'true');
        activeElement.blur();
        activeElement.removeAttribute('readonly');
        activeElement.removeAttribute('disabled');
    }
    hideKeyboard();
}
function returnToMenu() {
    statistics.classList.add('hide');
    options.classList.remove('hide');
}

let arrRightWrong = [];

function addStatistics(status, expected, answered, tip) {
    const to = parseInt(document.getElementById('target').value);
    const from = parseInt(document.getElementById('alphabet').value);
    const answer = input.value.trim().toLowerCase();
    expected = smartTransform(expected, from, to);
    document.getElementById('stats-table-body').innerHTML += `<tr class="${(!dica && status) ? "certo" : "errado"}"><td>${(!dica && status) ? "Certo" : "Err/Dica"}</td><td>${answered === "" ? "-" : answered}${tip ? "(*)" : ""}</td><td>${expected}</td><td data-time-index="${queueIndex}"></td></tr>`
}

function commit() {
    times.push(+new Date());
    const isCorrect = isEquivalent(input.value.trim().toLowerCase(), queue[queueIndex].trim().toLowerCase());
    if (isCorrect && !dica) {
        if (isCumulativeTraining()) {
            tableUtils.toggleActive([...document.querySelectorAll('.kana-cell')].filter(i=>i.innerText===queue[queueIndex])[0]);
        }
        arrRightWrong.push(1);
        flashState(true);
        right++;
    } else {
        arrRightWrong.push(0);
        flashState(false);
        wrong++;
    }
    nextKanaCount()
    addStatistics(isCorrect, queue[queueIndex], input.value.trim().toLowerCase(), dica);
    input.value = "";
    if (queueIndex === queue.length-1) {
        endGame();
    }
    const nextKana = queue[++queueIndex];
    showKana();
    dica = false;
}
document.addEventListener('keyup', function(e) {
    if (e.key === 'Enter' && e.target === input) {
        commit();
    }
});

function flashState(state) {
    if (state) {
        Toastify({
            text: "Certo!",
            duration: 1000,
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();
    } else {
        Toastify({
            text: "Errado / Usou dica",
            duration: 1000,
            style: {
                background: "linear-gradient(to right, rgb(238, 0, 167), rgb(255, 99, 8))",
            }
        }).showToast();
    }
}

function isCumulativeTraining() {
    return(practiceCheckbox.checked);
}

let tableState;

function saveTableState() {
    const checkboxesState = [];
    const kanaCellsState = [];
    table.querySelectorAll('[type=checkbox]').forEach(el=>{
        checkboxesState.push(el.checked);
    });
    table.querySelectorAll('.kana-cell').forEach(el=>{
        kanaCellsState.push(/active/.test(el.className));
    });
    tableState = {checkboxesState, kanaCellsState};
}

function loadTableState() {
    const { checkboxesState, kanaCellsState } = tableState;
    table.querySelectorAll('[type=checkbox]').forEach((el, idx)=>{
        el.checked = checkboxesState[idx];
    });
    table.querySelectorAll('.kana-cell').forEach((el, idx)=>{
        if (kanaCellsState[idx]) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

function exitPractice() {
    select.disabled=false;
    target.disabled=false;
    loadTableState();
    table.querySelectorAll('[type=checkbox]').forEach(el=>{el.disabled=false});
    document.querySelectorAll('#kana-controllers button').forEach(el=>el.disabled=false);
}

function enterPractice() {
    select.disabled=true;
        target.disabled=true;
        saveTableState();
        table.querySelectorAll('[type=checkbox]').forEach(el=>{el.disabled=true});
        tableUtils.hideAll();
        row = 0;
        tableUtils.toggleRow(true, row);
        document.querySelectorAll('#kana-controllers button').forEach(el=>el.disabled=true);
}

practiceCheckbox.onchange = (ev) => {
    ev.preventDefault();
    if (ev.target.checked) {
        setEndgameCtaToCumulativeTraining();
        enterPractice();
    } else {
        if (!confirm('Sair agora significa perder o progresso feito no treino cumulativo. Prosseguir?')){
            ev.target.checked = true;
            return false;
        }
        setEndgameCtaToNormalGame();
        exitPractice();
    }
};