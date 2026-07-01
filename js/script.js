const dataEvento = new Date('2026-08-15T19:00:00');

const intro = document.getElementById('intro');

const eventoDia = document.getElementById('evento-dia');
const eventoMes = document.getElementById('evento-mes');
const eventoHorario = document.getElementById('evento-horario');

const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

let musicaTocando = false;

function salvarEstadoMusica() {
    if (!bgMusic) {
        return;
    }

    sessionStorage.setItem('musicaTempo', String(bgMusic.currentTime || 0));
    sessionStorage.setItem('musicaAtiva', musicaTocando ? 'sim' : 'nao');
}

function restaurarTempoMusica() {
    if (!bgMusic) {
        return;
    }

    const tempoSalvo = Number(sessionStorage.getItem('musicaTempo') || 0);

    if (!Number.isNaN(tempoSalvo) && tempoSalvo > 0) {
        bgMusic.currentTime = tempoSalvo;
    }
}

function tocarMusica() {
    if (!bgMusic) {
        return;
    }

    bgMusic.volume = 0.1;
    restaurarTempoMusica();

    bgMusic.play()
        .then(() => {
            musicaTocando = true;
            sessionStorage.setItem('musicaAtiva', 'sim');

            if (musicToggle) {
                musicToggle.textContent = '⏸️';
            }
        })
        .catch(() => {
            musicaTocando = false;

            if (musicToggle) {
                musicToggle.textContent = '🎵';
            }
        });
}

function pausarMusica() {
    if (!bgMusic) {
        return;
    }

    bgMusic.pause();
    musicaTocando = false;
    sessionStorage.setItem('musicaAtiva', 'nao');
    salvarEstadoMusica();

    if (musicToggle) {
        musicToggle.textContent = '🎵';
    }
}
function abrirConvite() {
    if (intro) {
        intro.classList.add('hide');
    }

    tocarMusica();
}

if (window.location.hash === '#confirmar') {
    if (intro) {
        intro.classList.add('hide');
    }

    tocarMusica();
}

function preencherDataEvento() {
    const dia = dataEvento.getDate();

    const mes = dataEvento.toLocaleDateString('pt-BR', {
        month: 'long'
    });

    const horario = dataEvento.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (eventoDia) {
        eventoDia.textContent = dia;
    }

    if (eventoMes) {
        eventoMes.textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
    }

    if (eventoHorario) {
        eventoHorario.textContent = horario;
    }
}

function atualizarContagem() {
    const agora = new Date();
    const diferenca = dataEvento - agora;
    const countdown = document.getElementById('countdown');

    if (diferenca <= 0) {
        if (countdown) {
            countdown.innerHTML = '<div class="count-item" style="grid-column: 1 / -1;"><strong>É hoje!</strong><span>Vamos comemorar</span></div>';
        }
        return;
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferenca / (1000 * 60)) % 60);
    const segundos = Math.floor((diferenca / 1000) % 60);

    const diasEl = document.getElementById('dias');
    const horasEl = document.getElementById('horas');
    const minutosEl = document.getElementById('minutos');
    const segundosEl = document.getElementById('segundos');

    if (diasEl) {
        diasEl.textContent = String(dias).padStart(2, '0');
    }

    if (horasEl) {
        horasEl.textContent = String(horas).padStart(2, '0');
    }

    if (minutosEl) {
        minutosEl.textContent = String(minutos).padStart(2, '0');
    }

    if (segundosEl) {
        segundosEl.textContent = String(segundos).padStart(2, '0');
    }
}

if (musicToggle && bgMusic) {
    musicToggle.addEventListener('click', function () {
        if (!musicaTocando) {
            tocarMusica();
        } else {
            pausarMusica();
        }
    });

    bgMusic.addEventListener('timeupdate', salvarEstadoMusica);
}

function criarNeve() {
    const camadaNeve = document.querySelector('.sparkle-layer');

    if (!camadaNeve) {
        return;
    }

    // const quantidadeFlocos = window.innerWidth <= 768 ? 45 : 75;
    const quantidadeFlocos = window.innerWidth <= 768 ? 70 : 120;
    for (let i = 0; i < quantidadeFlocos; i++) {
        const floco = document.createElement('span');

        const tamanho = Math.random() * 5 + 2;
        const posicaoX = Math.random() * 100;
        const duracao = Math.random() * 9 + 8;
        const atraso = Math.random() * -20;
        const opacidade = Math.random() * 0.55 + 0.35;
        const deslocamento = (Math.random() * 140 - 70) + 'px';

        floco.classList.add('snowflake');

        floco.style.left = posicaoX + 'vw';
        floco.style.setProperty('--size', tamanho + 'px');
        floco.style.setProperty('--duration', duracao + 's');
        floco.style.setProperty('--delay', atraso + 's');
        floco.style.setProperty('--opacity', opacidade);
        floco.style.setProperty('--drift', deslocamento);

        camadaNeve.appendChild(floco);
    }
}

function obterParametroConviteDaUrl() {
    const parametros = new URLSearchParams(window.location.search);

    let tokenGrupo = parametros.get('token');
    let idGrupo = parametros.get('id');

    if ((!tokenGrupo && !idGrupo) && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const parametrosHash = new URLSearchParams(hashQuery);

        tokenGrupo = parametrosHash.get('token');
        idGrupo = parametrosHash.get('id');
    }

    if (tokenGrupo) {
        return {
            tipo: 'token',
            valor: tokenGrupo
        };
    }

    if (idGrupo) {
        return {
            tipo: 'id',
            valor: idGrupo
        };
    }

    return null;
}

function configurarLinksConfirmacao() {
    const parametroConvite = obterParametroConviteDaUrl();
    const linksConfirmacao = document.querySelectorAll('.js-confirm-link');

    linksConfirmacao.forEach((link) => {
        let destino = 'confirmar.html';

        if (parametroConvite) {
            destino = `confirmar.html?${parametroConvite.tipo}=${encodeURIComponent(parametroConvite.valor)}`;
        }

        link.setAttribute('href', destino);

        link.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = destino;
        });
    });
}

function configurarLinksPresentes() {
    const parametroConvite = obterParametroConviteDaUrl();
    const linksPresentes = document.querySelectorAll('.js-gift-link');

    linksPresentes.forEach((link) => {
        let destino = './presentes.html';

        if (parametroConvite) {
            destino = `./presentes.html?${parametroConvite.tipo}=${encodeURIComponent(parametroConvite.valor)}`;
        }

        link.setAttribute('href', destino);

        link.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = destino;
        });
    });
}

function configurarLinksFotos() {
    const parametroConvite = obterParametroConviteDaUrl();
    const linksFotos = document.querySelectorAll('.js-photo-link');

    linksFotos.forEach((link) => {
        let destino = './fotos.html';

        if (parametroConvite) {
            destino = `./fotos.html?${parametroConvite.tipo}=${encodeURIComponent(parametroConvite.valor)}`;
        }

        link.setAttribute('href', destino);

        link.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = destino;
        });
    });
}

function fotoLiberada() {
    const parametros = new URLSearchParams(window.location.search);
    const token = parametros.get('token');

    if (token === 'admin1') {
        return true;
    }

    const hoje = new Date();
    const dataFesta = new Date('2026-08-15T00:00:00');

    return hoje >= dataFesta;
}

function controlarSecaoFotos() {
    const secaoFotos = document.getElementById('fotos');

    if (!secaoFotos) {
        return;
    }

    if (!fotoLiberada()) {
        secaoFotos.style.display = 'none';
    }
}

configurarLinksConfirmacao();
configurarLinksPresentes();
configurarLinksFotos();
controlarSecaoFotos();

criarNeve();

if (sessionStorage.getItem('musicaAtiva') === 'sim') {
    tocarMusica();
}

preencherDataEvento();
atualizarContagem();

setInterval(atualizarContagem, 1000);