const API_URL = 'https://script.google.com/macros/s/AKfycbwfj98DZizgj84789ck_CfinKYgB6JpJXC9m7z2mhFXE7wN6RTk8s6KhzgvlvTMCEDz1A/exec';

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
    const linkVoltar = document.getElementById('backToInviteFromPhotos');

    if (!linkVoltar) {
        return;
    }

    if (parametroConvite) {
        linkVoltar.href = `./index.html?${parametroConvite.tipo}=${encodeURIComponent(parametroConvite.valor)}`;
    } else {
        linkVoltar.href = './index.html';
    }
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

function arquivoParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();

        leitor.onload = () => {
            const resultado = leitor.result;
            const base64 = String(resultado).split(',')[1];
            resolve(base64);
        };

        leitor.onerror = reject;
        leitor.readAsDataURL(arquivo);
    });
}

async function enviarFoto(event) {
    event.preventDefault();

    const nomeInput = document.getElementById('photoName');
    const arquivoInput = document.getElementById('photoFile');
    const botao = document.getElementById('photoSubmitButton');
    const mensagem = document.getElementById('photoUploadMessage');

    const nomePessoa = nomeInput.value.trim();
    const arquivos = Array.from(arquivoInput.files);

    if (!nomePessoa || arquivos.length === 0) {
        mensagem.textContent = 'Preencha seu nome e selecione pelo menos uma foto.';
        mensagem.className = 'photo-upload-message photo-upload-message--error';
        return;
    }

    const limitePorFoto = 8 * 1024 * 1024;

    for (const arquivo of arquivos) {
        if (!arquivo.type.startsWith('image/')) {
            mensagem.textContent = 'Envie apenas arquivos de imagem.';
            mensagem.className = 'photo-upload-message photo-upload-message--error';
            return;
        }

        if (arquivo.size > limitePorFoto) {
            mensagem.textContent = `A foto "${arquivo.name}" está muito grande. Envie fotos de até 8 MB cada.`;
            mensagem.className = 'photo-upload-message photo-upload-message--error';
            return;
        }
    }
    botao.disabled = true;
    botao.textContent = 'Enviando...';

    try {
        let enviadas = 0;

        for (let i = 0; i < arquivos.length; i++) {
            const arquivo = arquivos[i];

            botao.textContent = `Enviando ${i + 1} de ${arquivos.length}...`;
            mensagem.textContent = `Enviando foto ${i + 1} de ${arquivos.length}...`;
            mensagem.className = 'photo-upload-message';

            const base64 = await arquivoParaBase64(arquivo);

            const parametroConvite = obterParametroConviteDaUrl();
            const resposta = await fetch(API_URL, {
                method: 'POST',

                body: JSON.stringify({
                    acao: 'uploadFoto',
                    token: parametroConvite ? parametroConvite.valor : '',
                    nomePessoa: nomePessoa,
                    nomeArquivo: arquivo.name,
                    tipoArquivo: arquivo.type,
                    base64: base64
                })
            });

            const dados = await resposta.json();

            if (!dados.sucesso) {
                mensagem.textContent = dados.mensagem || `Não foi possível enviar a foto "${arquivo.name}".`;
                mensagem.className = 'photo-upload-message photo-upload-message--error';
                return;
            }

            enviadas++;
        }

        mensagem.textContent = `${enviadas} foto(s) enviada(s) com sucesso! Obrigado por compartilhar esse momento.`;
        mensagem.className = 'photo-upload-message photo-upload-message--success';

        nomeInput.value = '';
        arquivoInput.value = '';

    } catch (erro) {
        mensagem.textContent = 'Erro ao enviar as fotos. Tente novamente.';
        mensagem.className = 'photo-upload-message photo-upload-message--error';
    } finally {
        botao.disabled = false;
        botao.textContent = 'Enviar fotos';
    }
}

function fotoLiberada() {
    const parametroConvite = obterParametroConviteDaUrl();

    if (parametroConvite && parametroConvite.valor === 'admin1') {
        return true;
    }

    const hoje = new Date();
    const dataFesta = new Date('2026-08-15T00:00:00');

    return hoje >= dataFesta;
}

function bloquearPaginaFotosSeNecessario() {
    if (fotoLiberada()) {
        return;
    }

    const main = document.querySelector('main');

    if (!main) {
        return;
    }

    main.innerHTML = `
        <section class="section photos-page">
            <div class="container">
                <header class="section-title">
                    <p class="script-title">Fotos</p>
                    <h3>Em breve</h3>
                </header>

                <div class="photo-upload-card">
                    <p>
                        A página para envio de fotos será liberada no dia da festa.
                        Depois desse dia, você poderá compartilhar os momentos registrados com Sarah e Sofia.
                    </p>

                    <a class="btn btn-outline btn--spaced" id="backToInviteFromPhotos" href="./index.html">
                        Voltar para o convite
                    </a>
                </div>
            </div>
        </section>
    `;

    configurarLinkVoltarConvite();
}

criarNeve();
configurarLinkVoltarConvite();
bloquearPaginaFotosSeNecessario();

if (fotoLiberada()) {
    const form = document.getElementById('photoUploadForm');

    if (form) {
        form.addEventListener('submit', enviarFoto);
    }
}

if (sessionStorage.getItem('musicaAtiva') === 'sim') {
    tocarMusica();
}