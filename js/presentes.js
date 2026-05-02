const giftGrid = document.getElementById('giftGrid');
const giftPrev = document.getElementById('giftPrev');
const giftNext = document.getElementById('giftNext');

const toggleGiftList = document.getElementById('toggleGiftList');
const giftListWrapper = document.getElementById('giftListWrapper');
const giftList = document.getElementById('giftList');

let presentesLista = [];
let presenteAtual = 0;

async function carregarPresentes() {
    try {
        const resposta = await fetch('./data/presentes.json');
        presentesLista = await resposta.json();

        giftGrid.innerHTML = '';
        giftList.innerHTML = '';

        presentesLista.forEach((presente) => {
            criarCardCarrossel(presente);
            criarItemLista(presente);
        });

        atualizarCarrossel();
    } catch (erro) {
        giftGrid.innerHTML = '<p>Não foi possível carregar os presentes.</p>';
        giftList.innerHTML = '<p>Não foi possível carregar os presentes.</p>';
        console.error('Erro ao carregar presentes:', erro);
    }
}

function criarCardCarrossel(presente) {
    const card = document.createElement('article');
    card.classList.add('gift-card');

    card.innerHTML = `
        <img src="${presente.imagem}" alt="${presente.nome}" class="gift-card__image">

        <div class="gift-card__content">
            <h4>${presente.nome}</h4>
            <p>${presente.descricao}</p>

            <strong class="gift-card__price">
                ${formatarMoeda(presente.valor)}
            </strong>

            <button class="btn gift-card__button" type="button">
                Presentear
            </button>
        </div>
    `;

    const botao = card.querySelector('.gift-card__button');

    botao.addEventListener('click', () => {
        escolherPresente(presente);
    });

    giftGrid.appendChild(card);
}

function criarItemLista(presente) {
    const item = document.createElement('article');
    item.classList.add('gift-list-item');

    item.innerHTML = `
        <img src="${presente.imagem}" alt="${presente.nome}" class="gift-list-item__image">

        <div class="gift-list-item__content">
            <h4>${presente.nome}</h4>
            <p>${presente.descricao}</p>

            <strong class="gift-list-item__price">
                ${formatarMoeda(presente.valor)}
            </strong>
        </div>

        <button class="btn gift-list-item__button" type="button">
            Presentear
        </button>
    `;

    const botao = item.querySelector('.gift-list-item__button');

    botao.addEventListener('click', () => {
        escolherPresente(presente);
    });

    giftList.appendChild(item);
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function getCardsPorTela() {
    if (window.innerWidth <= 600) {
        return 1;
    }

    if (window.innerWidth <= 900) {
        return 2;
    }

    return 3;
}

function atualizarCarrossel() {
    const cardsPorTela = getCardsPorTela();
    const totalPresentes = presentesLista.length;
    const maxIndex = Math.max(totalPresentes - cardsPorTela, 0);

    if (presenteAtual > maxIndex) {
        presenteAtual = maxIndex;
    }

    const primeiroCard = giftGrid.querySelector('.gift-card');

    if (!primeiroCard) {
        return;
    }

    const cardWidth = primeiroCard.offsetWidth;
    const gap = 18;
    const deslocamento = presenteAtual * (cardWidth + gap);

    giftGrid.style.transform = `translateX(-${deslocamento}px)`;

    giftPrev.disabled = presenteAtual === 0;
    giftNext.disabled = presenteAtual >= maxIndex;
}

function proximoPresente() {
    const cardsPorTela = getCardsPorTela();
    const maxIndex = Math.max(presentesLista.length - cardsPorTela, 0);

    if (presenteAtual < maxIndex) {
        presenteAtual++;
        atualizarCarrossel();
    }
}

function presenteAnterior() {
    if (presenteAtual > 0) {
        presenteAtual--;
        atualizarCarrossel();
    }
}

function alternarListaPresentes() {
    const listaAberta = giftListWrapper.classList.toggle('show');

    if (listaAberta) {
        toggleGiftList.textContent = 'Ocultar lista de presentes';
    } else {
        toggleGiftList.textContent = 'Ver todos os presentes';
    }
}

function escolherPresente(presente) {
    const backendUrl = 'https://SEU-BACKEND.com/criar-pix';

    const url = `${backendUrl}?presenteId=${presente.id}&valor=${presente.valor}`;

    window.location.href = url;
}

giftPrev.addEventListener('click', presenteAnterior);
giftNext.addEventListener('click', proximoPresente);
toggleGiftList.addEventListener('click', alternarListaPresentes);

window.addEventListener('resize', atualizarCarrossel);

carregarPresentes();