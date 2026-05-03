const dataEvento = new Date('2026-08-15T19:00:00');

const intro = document.getElementById('intro');

const eventoDia = document.getElementById('evento-dia');
const eventoMes = document.getElementById('evento-mes');
const eventoHorario = document.getElementById('evento-horario');

function abrirConvite() {
    if (intro) {
        intro.classList.add('hide');
    }
}

if (window.location.hash === '#confirmar' && intro) {
    intro.classList.add('hide');
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

preencherDataEvento();
atualizarContagem();

setInterval(atualizarContagem, 1000);