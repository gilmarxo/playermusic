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

//Variable/Constant
let isPlaying = false;
let isShuffled = false;
let isRepeatd = false;
let isLikend = false;

let playList = [];
let sortPlayList = [...playList]
let index = 0;
let countTrack = 1;
let volumeValue = 0


//Events
play.addEventListener('click', playOrPause);
audio.addEventListener('timeupdate', () => {
    updateProgressBar();
    nextTrack();
});
previous.addEventListener('click', previousSong);
next.addEventListener('click', nextSong);
shuffle.addEventListener('click', shuffleActive);
repeat.addEventListener('click', repeatActive);
progressContainer.addEventListener('click', jumpTo);

//Button Open File
btnSelectFile.addEventListener("click", () => {
    playList = []
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mp3, .wav';
    input.multiple = true;
    input.webkitdirectory = false;

    input.addEventListener('change', (event) => {
        const file = event.target.files
        sendFiles(file);
    });
    input.click();
});

volumeButton.addEventListener('click', volumeMute)

volume.addEventListener('click', (e) => {
    const value = e.target.value
    const vlr = document.querySelector('#volume-vl')
    vlr.innerHTML = value
    audio.volume = value / 100;
})

//Function
//Open file
function sendFiles(file) {
    let content = '';
    let index = 1
    Array.from(file).forEach(file => {
        content += `<source src="${URL.createObjectURL(file)}" id="tarck-${index++}" track="${index}"/>`
        //Salvando dados na PlayList
        playList.push(file)
    })
    sortPlayList = [...playList]
    initializeMusic();
    playSong();

}

//MetaData File
function accessMetadata(file) {

    jsmediatags.read(file, {

        onSuccess: function (tag) {
            try {
                const data = tag.tags.picture.data
                const format = tag.tags.picture.format
                let base64String = ""
                for (let i = 0; i < data.length; i++) {
                    base64String += String.fromCharCode(data[i])
                }
                displayMetadata(`url(data:${format};base64,${window.btoa(base64String)})`, tag.tags.title, tag.tags.artist, tag.tags.album)
            } catch (error) {
                //"url(music.jpg)"
                displayMetadata(`url(${coverSongs})`, nameSongs(file.name), "Artista:", "Album:")
            }
        },
        onError: function (error) {
            displayMetadata("url(music.jpg)", upload.value.split(/(\\|\/)/g).pop(), "Unknown", "Unknown")
        }
    })
}
//regex 
function nameSongs(nome) {
    const regex = /.mp3$/gm;
    const str = nome;
    const subst = ``;
    const result = str.replace(regex, subst);
    return result;
}

function displayMetadata(cover, title, artist, album) {
    
    const span = document.createAttribute('span')

    document.querySelector("#cover").style.backgroundImage = cover
    document.querySelector("#txtTitle").textContent = title
    document.querySelector("#artist").textContent = artist
    document.querySelector("#album").textContent = album
}
//inicializar play
function initializeMusic() {
    audio.src = URL.createObjectURL(sortPlayList[index]);
    accessMetadata(sortPlayList[index])
    audio.addEventListener('loadeddata', () => {
        timeEnd.textContent = segundsForMinuts(Math.floor(audio.duration));

    })
}
//Controller Play
function playSong() {
    play.querySelector('.bi').classList.remove('bi-play-circle-fill');
    play.querySelector('.bi').classList.add('bi-pause-circle-fill');
    audio.play();
    isPlaying = true;
}
function pauseSong() {
    play.querySelector('.bi').classList.remove('bi-pause-circle-fill');
    play.querySelector('.bi').classList.add('bi-play-circle-fill');
    audio.pause();
    isPlaying = false;
}

function playOrPause() {
    if (isPlaying === false && sortPlayList.length != []) {
        playSong();
    } else {
        pauseSong();
    }
}

//Controller Previous
function previousSong() {
    if (index === 0) {
        index = sortPlayList.length - 1;
    }
    else {
        index -= 1;
    }
    initializeMusic();
    playSong();
}

//Controller Next
function nextSong() {
    if (index === sortPlayList.length - 1) {
        index = 0;
    } else {
        index += 1;

    }
    initializeMusic();
    playSong();
}

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

//Controller Shuffle
//Shuffle PlayList Bubble sort
function shuffleArray(ordemPlayList) {
    const size = ordemPlayList.length;
    let currentIndex = size - 1;
    let randomIndex = 0
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * size);
        let aux = ordemPlayList[currentIndex];
        ordemPlayList[currentIndex] = ordemPlayList[randomIndex];
        ordemPlayList[randomIndex] = aux;
        currentIndex -= 1;
    }
}

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


//Controller Repeat
function repeatActive() {
    if (isRepeatd === false) {
        isRepeatd = true;
        sortPlayList.sort()
        repeat.classList.add('button-active-controller')
    } else {
        sortPlayList.reverse()
        isRepeatd = false;
        repeat.classList.remove('button-active-controller')
    }
}

//next Track
function nextTrack() {
    if (audio.duration === audio.currentTime) {
        if (countTrack < sortPlayList.length) {
            countTrack += 1;
            nextSong()
        } else {
            pauseSong();
        }
    }
    if (audio.duration === audio.currentTime && isRepeatd === true) {
        nextSong();
    }

}

//Barra de progresso
function updateProgressBar() {
    progressBar.style.width = Math.floor((audio.currentTime / audio.duration) * 100) + '%';
    timeStart.textContent = segundsForMinuts(Math.floor(audio.currentTime));
    timeEnd.textContent = segundsForMinuts(Math.floor(audio.duration - audio.currentTime));
}
//Permite click na barra de progresso
function jumpTo(event) {
    const width = progressContainer.clientWidth;
    const clickPosition = event.offsetX;
    const jumpToTime = (clickPosition / width) * audio.duration;
    audio.currentTime = jumpToTime;
}

//Converter segundos para minutos
function segundsForMinuts(segunds) {
    let frmMinuts = Math.floor(segunds / 60);
    let frmSegunds = segunds % 60;
    if (frmSegunds < 10) {
        frmSegunds = '0' + frmSegunds;
    }
    return frmMinuts + ':' + frmSegunds;
}

