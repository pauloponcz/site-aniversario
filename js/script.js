const dataEvento = new Date('2026-08-15T19:00:00');

const intro = document.getElementById('intro');

const eventoDia = document.getElementById('evento-dia');
const eventoMes = document.getElementById('evento-mes');
const eventoHorario = document.getElementById('evento-horario');

const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

let musicaTocando = false;

function tocarMusica() {
    if (!bgMusic) {
        return;
    }

    bgMusic.volume = 0;

    bgMusic.play()
        .then(() => {
            musicaTocando = true;

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
            bgMusic.pause();
            musicaTocando = false;
            musicToggle.textContent = '🎵';
        }
    });
}

const pixButtons = document.querySelectorAll('.pix-mobile-button');

pixButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        const pix = button.getAttribute('data-pix');

        if (!pix) {
            alert('Pix não configurado.');
            return;
        }

        try {
            await navigator.clipboard.writeText(pix);

            const textoOriginal = button.textContent;
            button.textContent = 'Pix copiado!';

            setTimeout(() => {
                button.textContent = textoOriginal;
            }, 2000);
        } catch (error) {
            alert('Não foi possível copiar automaticamente. Copie manualmente: ' + pix);
        }
    });
});

preencherDataEvento();
atualizarContagem();

setInterval(atualizarContagem, 1000);