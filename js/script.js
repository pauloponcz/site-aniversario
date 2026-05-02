const dataEvento = new Date('2026-08-15T19:00:00');

const intro = document.getElementById('intro');

const eventoDia = document.getElementById('evento-dia');
const eventoMes = document.getElementById('evento-mes');
const eventoHorario = document.getElementById('evento-horario');

function abrirConvite() {
    intro.classList.add('hide');
}

if (window.location.hash === '#confirmar') {
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

    eventoDia.textContent = dia;
    eventoMes.textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
    eventoHorario.textContent = horario;
}

function atualizarContagem() {
    const agora = new Date();
    const diferenca = dataEvento - agora;

    if (diferenca <= 0) {
        document.getElementById('countdown').innerHTML = '<div class="count-item" style="grid-column: 1 / -1;"><strong>É hoje!</strong><span>Vamos comemorar</span></div>';
        return;
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferenca / (1000 * 60)) % 60);
    const segundos = Math.floor((diferenca / 1000) % 60);

    document.getElementById('dias').textContent = String(dias).padStart(2, '0');
    document.getElementById('horas').textContent = String(horas).padStart(2, '0');
    document.getElementById('minutos').textContent = String(minutos).padStart(2, '0');
    document.getElementById('segundos').textContent = String(segundos).padStart(2, '0');
}

preencherDataEvento();
atualizarContagem();

setInterval(atualizarContagem, 1000);