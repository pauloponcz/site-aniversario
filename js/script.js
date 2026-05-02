function abrirConvite() {
    document.getElementById('intro').classList.add('hide');
}

const dataEvento = new Date('2026-08-15T19:30:00');

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

atualizarContagem();
setInterval(atualizarContagem, 1000);