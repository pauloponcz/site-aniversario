const API_URL = 'https://script.google.com/macros/s/AKfycby1n91z5hsHP8noBpAIb9ZZ9lzqJpRkyJKTIXQbqlrW3ERIzW2t93FOgzwObXaCcnn2ug/exec';

const confirmGreeting = document.getElementById('confirmGreeting');
const confirmText = document.getElementById('confirmText');
const guestList = document.getElementById('guestList');
const confirmMessage = document.getElementById('confirmMessage');

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


function obterParametroUrl(nome) {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get(nome);
}

function obterParametroConviteDaUrl() {
    const tokenGrupo = obterParametroUrl('token');
    const idGrupo = obterParametroUrl('id');

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
    const parametroConvite = obterParametroConviteDaUrl();

    if (!parametroConvite) {
        mostrarErro('Link inválido. O código do convite não foi informado.');
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}?acao=buscar&${parametroConvite.tipo}=${encodeURIComponent(parametroConvite.valor)}`);
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
    if (confirmGreeting) {
        confirmGreeting.textContent = `${dados.nomeExibicao}`;
    }

    if (confirmText) {
        confirmText.textContent = 'Estamos muito felizes em convidar você para celebrar esse momento especial conosco. Para nos ajudar na organização da festa, confirme abaixo quem poderá estar presente nesta noite inesquecível. Para nos ajudar na organização, confirme sua presença até o dia 30/06/2026 clicando no botão abaixo.';
    }

    if (!guestList) {
        return;
    }

    guestList.innerHTML = '';

    dados.convidados.forEach((convidado) => {
        const item = document.createElement('div');
        item.className = 'guest-item';

        const info = document.createElement('div');
        info.className = 'guest-info';

        const nome = document.createElement('strong');
        nome.textContent = convidado.nome;

        const status = document.createElement('span');

        const statusAtual = String(convidado.status || '').toLowerCase();
        const jaConfirmado = statusAtual === 'confirmado';
        const jaRecusado = statusAtual === 'recusado';

        if (jaConfirmado) {
            status.textContent = convidado.dataConfirmacao
                ? `Presença confirmada em ${convidado.dataConfirmacao}`
                : 'Presença confirmada';

            status.className = 'guest-status guest-status--confirmed';
        } else if (jaRecusado) {
            status.textContent = convidado.dataConfirmacao
                ? `Não poderá comparecer. Resposta registrada em ${convidado.dataConfirmacao}`
                : 'Não poderá comparecer';

            status.className = 'guest-status guest-status--declined';
        } else {
            status.textContent = 'Aguardando resposta';
            status.className = 'guest-status';
        }

        info.appendChild(nome);
        info.appendChild(status);

        const actions = document.createElement('div');
        actions.className = 'guest-actions';

        const botaoConfirmar = document.createElement('button');
        botaoConfirmar.type = 'button';
        botaoConfirmar.className = jaConfirmado
            ? 'btn guest-button guest-button--confirmed'
            : 'btn guest-button';

        botaoConfirmar.textContent = jaConfirmado ? 'Confirmado' : 'Confirmar presença';
        botaoConfirmar.disabled = jaConfirmado || jaRecusado;

        botaoConfirmar.addEventListener('click', () => {
            registrarResposta(dados.idGrupo, dados.tokenGrupo, convidado.linha, 'confirmado', botaoConfirmar, actions, status);
        });

        const botaoRecusar = document.createElement('button');
        botaoRecusar.type = 'button';
        botaoRecusar.className = jaRecusado
            ? 'btn btn-outline guest-button guest-button--declined'
            : 'btn btn-outline guest-button guest-button--decline';

        botaoRecusar.textContent = jaRecusado ? 'Recusado' : 'Não poderei comparecer';
        botaoRecusar.disabled = jaConfirmado || jaRecusado;

        botaoRecusar.addEventListener('click', () => {
            registrarResposta(dados.idGrupo, dados.tokenGrupo, convidado.linha, 'recusado', botaoRecusar, actions, status);
        });

        if (jaConfirmado) {
            actions.appendChild(botaoConfirmar);
        } else if (jaRecusado) {
            actions.appendChild(botaoRecusar);
        } else {
            actions.appendChild(botaoConfirmar);
            actions.appendChild(botaoRecusar);
        }

        item.appendChild(info);
        item.appendChild(actions);

        guestList.appendChild(item);
    });
}

async function registrarResposta(idGrupo, tokenGrupo, linha, statusResposta, botaoClicado, actionsEl, statusEl) {
    const botoes = actionsEl.querySelectorAll('button');

    botoes.forEach((botao) => {
        botao.disabled = true;
    });

    botaoClicado.textContent = statusResposta === 'confirmado'
        ? 'Confirmando...'
        : 'Registrando...';

    try {
        let url = `${API_URL}?acao=confirmar&linha=${encodeURIComponent(linha)}&status=${encodeURIComponent(statusResposta)}`;

        if (tokenGrupo) {
            url += `&token=${encodeURIComponent(tokenGrupo)}`;
        } else {
            url += `&id=${encodeURIComponent(idGrupo)}`;
        }

        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (!dados.sucesso) {
            botoes.forEach((botao) => {
                botao.disabled = false;
            });

            mostrarMensagem(dados.mensagem || 'Não foi possível registrar a resposta.', true);
            return;
        }

        actionsEl.innerHTML = '';

        const botaoFinal = document.createElement('button');
        botaoFinal.type = 'button';
        botaoFinal.disabled = true;

        if (statusResposta === 'confirmado') {
            botaoFinal.className = 'btn guest-button guest-button--confirmed';
            botaoFinal.textContent = 'Confirmado';

            statusEl.textContent = dados.dataConfirmacao
                ? `Presença confirmada em ${dados.dataConfirmacao}`
                : 'Presença confirmada';

            statusEl.className = 'guest-status guest-status--confirmed';

            mostrarMensagem('Presença confirmada com sucesso!', false);
        } else {
            botaoFinal.className = 'btn btn-outline guest-button guest-button--declined';
            botaoFinal.textContent = 'Recusado';

            statusEl.textContent = dados.dataConfirmacao
                ? `Não poderá comparecer. Resposta registrada em ${dados.dataConfirmacao}`
                : 'Não poderá comparecer';

            statusEl.className = 'guest-status guest-status--declined';

            mostrarMensagem('Resposta registrada com sucesso.', false);
        }

        actionsEl.appendChild(botaoFinal);
    } catch (erro) {
        botoes.forEach((botao) => {
            botao.disabled = false;
        });

        botaoClicado.textContent = statusResposta === 'confirmado'
            ? 'Confirmar presença'
            : 'Não vou poder ir';

        mostrarMensagem('Erro ao registrar resposta. Tente novamente.', true);
    }
}

function mostrarErro(mensagem) {
    if (confirmGreeting) {
        confirmGreeting.textContent = 'Ops...';
    }

    if (confirmText) {
        confirmText.textContent = mensagem;
    }

    if (guestList) {
        guestList.innerHTML = '';
    }
}

function mostrarMensagem(mensagem, erro) {
    if (!confirmMessage) {
        return;
    }

    confirmMessage.textContent = mensagem;
    confirmMessage.className = erro
        ? 'confirm-message confirm-message--error'
        : 'confirm-message confirm-message--success';

    setTimeout(() => {
        confirmMessage.textContent = '';
        confirmMessage.className = 'confirm-message';
    }, 3500);
}

function configurarLinkVoltarConvite() {
    const parametroConvite = obterParametroConviteDaUrl();
    const backToInvite = document.getElementById('backToInvite');

    if (!backToInvite) {
        return;
    }

    if (parametroConvite) {
        backToInvite.href = `./index.html?${parametroConvite.tipo}=${encodeURIComponent(parametroConvite.valor)}`;
    } else {
        backToInvite.href = './index.html';
    }
}

if (sessionStorage.getItem('musicaAtiva') === 'sim') {
    tocarMusica();
}

configurarLinkVoltarConvite();
criarNeve();
buscarConvidados();