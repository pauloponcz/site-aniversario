const API_URL = 'https://script.google.com/macros/s/AKfycbwfj98DZizgj84789ck_CfinKYgB6JpJXC9m7z2mhFXE7wN6RTk8s6KhzgvlvTMCEDz1A/exec';

const giftGallerySarah = document.getElementById('giftGallerySarah');
const giftGallerySofia = document.getElementById('giftGallerySofia');
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
    const token = obterParametroUrl('token');
    const id = obterParametroUrl('id');

    if (token) {
        return {
            tipo: 'token',
            valor: token
        };
    }

    if (id) {
        return {
            tipo: 'id',
            valor: id
        };
    }

    return null;
}

function configurarLinkVoltarConvite() {
    const parametroConvite = obterParametroConviteDaUrl();
    const linkVoltar = document.getElementById('backToInviteFromGifts');

    if (!linkVoltar) {
        return;
    }

    if (parametroConvite) {
        linkVoltar.href = `./index.html?${parametroConvite.tipo}=${encodeURIComponent(parametroConvite.valor)}`;
    } else {
        linkVoltar.href = './index.html';
    }
}

function configurarAbasPresentes() {
    const tabs = document.querySelectorAll('[data-gift-tab]');

    const panels = {
        sarah: document.getElementById('gift-sarah'),
        sofia: document.getElementById('gift-sofia')
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-gift-tab');

            tabs.forEach((item) => item.classList.remove('active'));
            tab.classList.add('active');

            Object.values(panels).forEach((panel) => {
                if (panel) {
                    panel.classList.remove('active');
                }
            });

            if (panels[target]) {
                panels[target].classList.add('active');
            }
        });
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

async function carregarPresentes(pessoa, galeria) {
    if (!galeria) {
        return;
    }

    galeria.innerHTML = `<p class="gift-loading">Carregando presentes de ${pessoa}...</p>`;

    try {
        const resposta = await fetch(`${API_URL}?acao=listarPresentes&pessoa=${encodeURIComponent(pessoa)}`);
        const dados = await resposta.json();

        if (!dados.sucesso) {
            galeria.innerHTML = `<p class="gift-loading">${dados.mensagem || 'Não foi possível carregar os presentes.'}</p>`;
            return;
        }

        if (!dados.presentes || dados.presentes.length === 0) {
            galeria.innerHTML = '<p class="gift-loading">Nenhum presente cadastrado ainda.</p>';
            return;
        }

        montarGaleriaPresentes(dados.presentes, galeria);
    } catch (erro) {
        galeria.innerHTML = '<p class="gift-loading">Erro ao carregar os presentes. Tente novamente mais tarde.</p>';
    }
}

function montarGaleriaPresentes(presentes, galeria) {
    galeria.innerHTML = '';

    const parametroConvite = obterParametroConviteDaUrl();
    const temTokenOuId = parametroConvite && parametroConvite.valor;

    presentes.forEach((presente) => {
        const podeRepetir = String(presente.podeRepetir || '').toUpperCase() === 'S';
        const status = String(presente.status || 'disponivel').toLowerCase();

        const indisponivel = !podeRepetir && status === 'escolhido';

        const card = document.createElement('article');
        card.className = indisponivel ? 'gift-card gift-card--unavailable' : 'gift-card';

        const img = document.createElement('img');
        img.src = presente.linkImagem;
        img.alt = presente.nomePresente || 'Sugestão de presente';
        img.loading = 'lazy';

        const titulo = document.createElement('p');
        titulo.textContent = presente.nomePresente || 'Presente';

        const tag = document.createElement('span');
        tag.className = indisponivel ? 'gift-status-tag unavailable' : 'gift-status-tag available';
        tag.textContent = indisponivel ? 'Indisponível' : 'Disponível';

        const botao = document.createElement('button');
        botao.type = 'button';

        if (!temTokenOuId) {
            botao.className = 'btn gift-choose-button gift-choose-button--disabled';
            botao.textContent = 'Acesse pelo convite';
            botao.disabled = true;
        } else {
            botao.className = indisponivel
                ? 'btn gift-choose-button gift-choose-button--disabled'
                : 'btn gift-choose-button';

            botao.textContent = indisponivel ? 'Já escolhido' : 'Escolher presente';
            botao.disabled = indisponivel;

            botao.addEventListener('click', () => {
                escolherPresente(presente, botao, tag, card);
            });
        }

        card.appendChild(img);
        card.appendChild(titulo);
        card.appendChild(tag);
        card.appendChild(botao);

        galeria.appendChild(card);
    });
}

async function escolherPresente(presente, botao, tag, card) {
    const parametroConvite = obterParametroConviteDaUrl();

    if (!parametroConvite || !parametroConvite.valor) {
        alert('Para escolher um presente, acesse a lista pelo link do convite.');
        return;
    }

    botao.disabled = true;
    botao.textContent = 'Registrando...';

    let url = `${API_URL}?acao=escolherPresente&idPresente=${encodeURIComponent(presente.idPresente)}`;

    if (parametroConvite) {
        url += `&${parametroConvite.tipo}=${encodeURIComponent(parametroConvite.valor)}`;
    }

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (!dados.sucesso) {
            botao.disabled = false;
            botao.textContent = 'Escolher presente';
            alert(dados.mensagem || 'Não foi possível escolher este presente.');
            return;
        }

        const podeRepetir = String(presente.podeRepetir || '').toUpperCase() === 'S';

        if (podeRepetir) {
            botao.disabled = false;
            botao.textContent = 'Escolher presente';
            alert('Presente registrado com sucesso!');
            return;
        }

        botao.textContent = 'Já escolhido';
        botao.disabled = true;
        botao.classList.add('gift-choose-button--disabled');

        tag.textContent = 'Indisponível';
        tag.className = 'gift-status-tag unavailable';

        card.classList.add('gift-card--unavailable');

        alert('Presente escolhido com sucesso!');
    } catch (erro) {
        botao.disabled = false;
        botao.textContent = 'Escolher presente';
        alert('Erro ao registrar o presente. Tente novamente.');
    }
}

function configurarLinksPresentesNoIndex() {
    const parametroConvite = obterParametroConviteDaUrl();
    const links = document.querySelectorAll('.js-gift-link');

    links.forEach((link) => {
        let destino = './presentes.html';

        if (parametroConvite) {
            destino = `./presentes.html?${parametroConvite.tipo}=${encodeURIComponent(parametroConvite.valor)}`;
        }

        link.setAttribute('href', destino);
    });
}

function configurarPix() {
    const pixKey = document.getElementById('pixKey');
    const copyPixButton = document.getElementById('copyPixButton');
    const pixCopyFeedback = document.getElementById('pixCopyFeedback');

    if (!pixKey || !copyPixButton) {
        return;
    }

    copyPixButton.addEventListener('click', async () => {
        const chavePix = pixKey.textContent.trim();

        try {
            await navigator.clipboard.writeText(chavePix);

            copyPixButton.textContent = 'Chave copiada!';

            if (pixCopyFeedback) {
                pixCopyFeedback.textContent = 'Agora é só colar a chave Pix no app do seu banco.';
            }

            setTimeout(() => {
                copyPixButton.textContent = 'Copiar chave Pix';

                if (pixCopyFeedback) {
                    pixCopyFeedback.textContent = '';
                }
            }, 3000);
        } catch (error) {
            if (pixCopyFeedback) {
                pixCopyFeedback.textContent = `Não foi possível copiar automaticamente. Copie manualmente: ${chavePix}`;
            }
        }
    });
}

function configurarPix() {
    const botoesPix = document.querySelectorAll('.pix-copy-button');

    botoesPix.forEach((botao) => {
        botao.addEventListener('click', async () => {
            const idChave = botao.getAttribute('data-pix-target');
            const chaveEl = document.getElementById(idChave);

            if (!chaveEl) {
                return;
            }

            const chavePix = chaveEl.textContent.trim();
            const textoOriginal = botao.textContent;

            try {
                await navigator.clipboard.writeText(chavePix);

                botao.textContent = 'Pix copiado!';

                setTimeout(() => {
                    botao.textContent = textoOriginal;
                }, 2500);
            } catch (error) {
                alert('Não foi possível copiar automaticamente. Copie manualmente: ' + chavePix);
            }
        });
    });
}

criarNeve();
configurarAbasPresentes();
configurarLinkVoltarConvite();
configurarLinksPresentesNoIndex();
configurarPix();
if (sessionStorage.getItem('musicaAtiva') === 'sim') {
    tocarMusica();
}
carregarPresentes('Sarah', giftGallerySarah);
carregarPresentes('Sofia', giftGallerySofia);
