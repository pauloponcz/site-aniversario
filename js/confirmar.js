const API_URL = 'https://script.google.com/macros/s/AKfycbx-0sqebHQtaETkbwC9_IWQ0NZ9DUMIXQgRt4S-vmmebOnL2K2LPH0DgjJarkh5e9t8ZQ/exec';

const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

const confirmGreeting = document.getElementById('confirmGreeting');
const confirmText = document.getElementById('confirmText');
const guestList = document.getElementById('guestList');
const confirmMessage = document.getElementById('confirmMessage');

let musicaTocando = false;

function obterParametroUrl(nome) {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get(nome);
}

function tocarMusica() {
    if (!bgMusic) {
        return;
    }

    bgMusic.volume = 0.1;

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

function criarNeve() {
    const camadaNeve = document.querySelector('.sparkle-layer');

    if (!camadaNeve) {
        return;
    }

    camadaNeve.innerHTML = '';

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

async function buscarConvidados() {
    const idGrupo = obterParametroUrl('id');

    if (!idGrupo) {
        mostrarErro('Link inválido. O ID do convite não foi informado.');
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}?acao=buscar&id=${encodeURIComponent(idGrupo)}`);
        const dados = await resposta.json();

        if (!dados.sucesso) {
            mostrarErro(dados.mensagem || 'Não foi possível carregar este convite.');
            return;
        }

        montarTelaConfirmacao(dados);
    } catch (erro) {
        mostrarErro('Não foi possível conectar com a lista de convidados. Tente novamente mais tarde.');
    }
}

function montarTelaConfirmacao(dados) {
    confirmGreeting.textContent = `Olá, ${dados.nomeExibicao}`;

    confirmText.textContent = 'Estamos muito felizes em convidar você para celebrar esse momento especial conosco. Para nos ajudar na organização da festa, confirme abaixo quem poderá estar presente nesta noite inesquecível.';

    guestList.innerHTML = '';

    dados.convidados.forEach((convidado) => {
        const item = document.createElement('div');
        item.className = 'guest-item';

        const info = document.createElement('div');
        info.className = 'guest-info';

        const nome = document.createElement('strong');
        nome.textContent = convidado.nome;

        const status = document.createElement('span');

        const jaConfirmado = String(convidado.status).toLowerCase() === 'confirmado';

        if (jaConfirmado) {
            status.textContent = convidado.dataConfirmacao
                ? `Presença confirmada em ${convidado.dataConfirmacao}`
                : 'Presença confirmada';
            status.className = 'guest-status guest-status--confirmed';
        } else {
            status.textContent = 'Aguardando confirmação';
            status.className = 'guest-status';
        }

        info.appendChild(nome);
        info.appendChild(status);

        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = jaConfirmado ? 'btn guest-button guest-button--confirmed' : 'btn guest-button';
        botao.textContent = jaConfirmado ? 'Confirmado' : 'Confirmar presença';
        botao.disabled = jaConfirmado;

        botao.addEventListener('click', () => {
            confirmarPresenca(dados.idGrupo, convidado.linha, botao, status);
        });

        item.appendChild(info);
        item.appendChild(botao);

        guestList.appendChild(item);
    });
}

async function confirmarPresenca(idGrupo, linha, botao, statusEl) {
    botao.disabled = true;
    botao.textContent = 'Confirmando...';

    try {
        const url = `${API_URL}?acao=confirmar&id=${encodeURIComponent(idGrupo)}&linha=${encodeURIComponent(linha)}`;

        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (!dados.sucesso) {
            botao.disabled = false;
            botao.textContent = 'Confirmar presença';
            mostrarMensagem(dados.mensagem || 'Não foi possível confirmar a presença.', true);
            return;
        }

        botao.textContent = 'Confirmado';
        botao.classList.add('guest-button--confirmed');
        botao.disabled = true;

        statusEl.textContent = dados.dataConfirmacao
            ? `Presença confirmada em ${dados.dataConfirmacao}`
            : 'Presença confirmada';

        statusEl.className = 'guest-status guest-status--confirmed';

        mostrarMensagem('Presença confirmada com sucesso!', false);
    } catch (erro) {
        botao.disabled = false;
        botao.textContent = 'Confirmar presença';
        mostrarMensagem('Erro ao confirmar presença. Tente novamente.', true);
    }
}

function mostrarErro(mensagem) {
    confirmGreeting.textContent = 'Ops...';
    confirmText.textContent = mensagem;
    guestList.innerHTML = '';
}

function mostrarMensagem(mensagem, erro) {
    confirmMessage.textContent = mensagem;
    confirmMessage.className = erro ? 'confirm-message confirm-message--error' : 'confirm-message confirm-message--success';

    setTimeout(() => {
        confirmMessage.textContent = '';
        confirmMessage.className = 'confirm-message';
    }, 3500);
}
function configurarLinksConfirmacao() {
    const parametros = new URLSearchParams(window.location.search);
    const idGrupo = parametros.get('id');

    const linksConfirmacao = document.querySelectorAll('.js-confirm-link');

    linksConfirmacao.forEach((link) => {
        if (idGrupo) {
            link.href = `confirmar.html?id=${encodeURIComponent(idGrupo)}`;
        } else {
            link.href = 'confirmar.html';
        }
    });
}

criarNeve();
buscarConvidados();