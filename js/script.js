// Selecionar elementos HTML usando seus IDs ou classes
const audio = document.querySelector('#audio')
const source = document.querySelector('#source')
const play = document.querySelector('#play')
const previous = document.querySelector('#previous')
const next = document.querySelector('#next')
const shuffle = document.querySelector('#shuffle')
const repeat = document.querySelector('#repeat')
const progressBar = document.querySelector('.progress-current-bar')
const timeStart = document.querySelector('.time-start')
const timeEnd = document.querySelector('.time-end')
const like = document.querySelector('#like')
const btnSelectFile = document.querySelector('#selectFile')
const coverSongs = './assets/img/coverPlayer.png'
const progressContainer = document.querySelector('#progress-container')
const volumeButton = document.querySelector('#volume-button')
const volume = document.querySelector('.volume')
const body = document.getElementsByTagName('body')

// Variáveis e constantes de controle
let isPlaying = false; // Indica se a música está tocando
let isShuffled = false; // Indica se a lista de reprodução está embaralhada
let isRepeatd = false; // Indica se a repetição está ativada

let playList = []; // Lista de reprodução de músicas
let sortPlayList = [...playList]; // Lista de reprodução ordenada
let index = 0; // Índice da faixa atual
let countTrack = 1; // Contador de faixas
let volumeValue = 0; // Valor do volume

// Adicionar ouvintes de eventos aos elementos HTML
// Botão de reprodução/pausa
play.addEventListener('click', playOrPause);

// Evento de atualização do tempo de reprodução do áudio
audio.addEventListener('timeupdate', () => {
    updateProgressBar();
    nextTrack();
});

// Botão de faixa anterior
previous.addEventListener('click', previousSong);

// Botão de próxima faixa
next.addEventListener('click', nextSong);

// Botão de embaralhar
shuffle.addEventListener('click', shuffleActive);

// Botão de repetir
repeat.addEventListener('click', repeatActive);

// Barra de progresso (permite clicar para pular)
progressContainer.addEventListener('click', jumpTo);

// Botão de seleção de arquivo
btnSelectFile.addEventListener("click", () => {
    playList = [];
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mp3, .wav';
    input.multiple = true;
    input.webkitdirectory = false;

    input.addEventListener('change', (event) => {
        const file = event.target.files;
        sendFiles(file);
    });
    input.click();
});

// Botão de controle de volume
volumeButton.addEventListener('click', volumeMute);

// Controle deslizante de volume
volume.addEventListener('click', (e) => {
    const value = e.target.value;
    const vlr = document.querySelector('#volume-vl');
    vlr.innerHTML = value;
    audio.volume = value / 100;
});

// Função para abrir arquivos de áudio
function sendFiles(file) {
    let content = '';
    let index = 1;
    Array.from(file).forEach(file => {
        content += `<source src="${URL.createObjectURL(file)}" id="tarck-${index++}" track="${index}"/>`;
        // Salvando dados na lista de reprodução
        playList.push(file);
    });
    sortPlayList = [...playList];
    initializeMusic();
    playSong();
}

// Função para acessar os metadados do arquivo
function accessMetadata(file) {
    jsmediatags.read(file, {
        onSuccess: function (tag) {
            try {
                const data = tag.tags.picture.data;
                const format = tag.tags.picture.format;
                let base64String = "";
                for (let i = 0; i < data.length; i++) {
                    base64String += String.fromCharCode(data[i]);
                }
                displayMetadata(`url(data:${format};base64,${window.btoa(base64String)})`, tag.tags.title, tag.tags.artist, tag.tags.album);
            } catch (error) {
                // Usar imagem padrão caso não haja imagem nos metadados
                displayMetadata(`url(${coverSongs})`, nameSongs(file.name), "Artista:", "Álbum:");
            }
        },
        onError: function (error) {
            // Usar imagem padrão em caso de erro
            displayMetadata("url(music.jpg)", upload.value.split(/(\\|\/)/g).pop(), "Desconhecido", "Desconhecido");
        }
    });
}

// Função para extrair o nome da música a partir do nome do arquivo
function nameSongs(nome) {
    const regex = /.mp3$/gm;
    const str = nome;
    const subst = ``;
    const result = str.replace(regex, subst);
    return result;
}

// Função para exibir metadados da música
function displayMetadata(cover, title, artist, album) {
    const span = document.createAttribute('span');

    document.querySelector("#cover").style.backgroundImage = cover;
    document.querySelector("#txtTitle").textContent = title;
    document.querySelector("#artist").textContent = artist;
    document.querySelector("#album").textContent = album;
}

// Função para inicializar a reprodução da música
function initializeMusic() {
    audio.src = URL.createObjectURL(sortPlayList[index]);
    accessMetadata(sortPlayList[index]);
    audio.addEventListener('loadeddata', () => {
        timeEnd.textContent = segundsForMinuts(Math.floor(audio.duration));
    });
}

// Função para iniciar a reprodução da música
function playSong() {
    play.querySelector('.bi').classList.remove('bi-play-circle-fill');
    play.querySelector('.bi').classList.add('bi-pause-circle-fill');
    audio.play();
    isPlaying = true;
}

// Função para pausar a reprodução da música
function pauseSong() {
    play.querySelector('.bi').classList.remove('bi-pause-circle-fill');
    play.querySelector('.bi').classList.add('bi-play-circle-fill');
    audio.pause();
    isPlaying = false;
}

// Função para alternar entre reprodução e pausa
function playOrPause() {
    if (isPlaying === false && sortPlayList.length != []) {
        playSong();
    } else {
        pauseSong();
    }
}

// Função para ir para a faixa anterior
function previousSong() {
    if (index === 0) {
        index = sortPlayList.length - 1;
    } else {
        index -= 1;
    }
    initializeMusic();
    playSong();
}

// Função para ir para a próxima faixa
function nextSong() {
    if (index === sortPlayList.length - 1) {
        index = 0;
    } else {
        index += 1;
    }
    initializeMusic();
    playSong();
}

// Função para ativar ou desativar o mudo
function volumeMute() {
    if (audio.muted) {
        audio.muted = false;
        volumeButton.querySelector('.bi').classList.remove('bi-volume-mute-fill');
        volumeButton.querySelector('.bi').classList.add('bi-volume-up-fill');
    } else {
        audio.muted = true;
        volumeButton.querySelector('.bi').classList.remove('bi-volume-up-fill');
        volumeButton.querySelector('.bi').classList.add('bi-volume-mute-fill');
    }
}

// Função para embaralhar a lista de reprodução (Bubble sort)
function shuffleArray(ordemPlayList) {
    const size = ordemPlayList.length;
    let currentIndex = size - 1;
    let randomIndex = 0;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * size);
        let aux = ordemPlayList[currentIndex];
        ordemPlayList[currentIndex] = ordemPlayList[randomIndex];
        ordemPlayList[randomIndex] = aux;
        currentIndex -= 1;
    }
}

// Função para ativar ou desativar o modo de reprodução aleatória
function shuffleActive() {
    if (isShuffled === false) {
        isShuffled = true;
        shuffleArray(sortPlayList);
        shuffle.classList.add('button-active-controller');
    } else {
        isShuffled = false;
        sortPlayList = [...playList];
        shuffle.classList.remove('button-active-controller');
    }
}

// Função para ativar ou desativar o modo de repetição
function repeatActive() {
    if (isRepeatd === false) {
        isRepeatd = true;
        sortPlayList.sort();
        repeat.classList.add('button-active-controller');
    } else {
        sortPlayList.reverse();
        isRepeatd = false;
        repeat.classList.remove('button-active-controller');
    }
}

// Função para avançar para a próxima faixa quando a atual terminar
function nextTrack() {
    if (audio.duration === audio.currentTime) {
        if (countTrack < sortPlayList.length) {
            countTrack += 1;
            nextSong();
        } else {
            pauseSong();
        }
    }
    if (audio.duration === audio.currentTime && isRepeatd === true) {
        nextSong();
    }
}

// Função para atualizar a barra de progresso
function updateProgressBar() {
    progressBar.style.width = Math.floor((audio.currentTime / audio.duration) * 100) + '%';
    timeStart.textContent = segundsForMinuts(Math.floor(audio.currentTime));
    timeEnd.textContent = segundsForMinuts(Math.floor(audio.duration - audio.currentTime));
}

// Função para permitir clicar na barra de progresso para pular para uma posição específica
function jumpTo(event) {
    const width = progressContainer.clientWidth;
    const clickPosition = event.offsetX;
    const jumpToTime = (clickPosition / width) * audio.duration;
    audio.currentTime = jumpToTime;
}

// Função para converter segundos em minutos no formato "MM:SS"
function segundsForMinuts(segunds) {
    let frmMinuts = Math.floor(segunds / 60);
    let frmSegunds = segunds % 60;
    if (frmSegunds < 10) {
        frmSegunds = '0' + frmSegunds;
    }
    return frmMinuts + ':' + frmSegunds;
}