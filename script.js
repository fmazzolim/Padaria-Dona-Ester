"use strict";

/* ============================================================
   CONFIGURAÇÃO - altere aqui o que mudar no dia a dia
   ============================================================ */

const CONFIG = {
  // Número do WhatsApp que recebe os pedidos: 55 + DDD + número, só dígitos.
  // CONFIRME com a Dona Ester se este é o número certo antes de publicar.
  whatsapp: "5500000000000",
  antecedenciaHoras: 24,
  cidade: "Registro/SP",
};

// Cardápio: para mudar preço, nome ou incluir produto, edite esta lista.
// "opcoes" cria um seletor (ex.: recheio) no card do produto.
const CARDAPIO = [
  {
    categoria: "Pães",
    itens: [
      { id: "pao-caseiro", nome: "Pão caseiro", preco: 12 },
      { id: "pao-frango", nome: "Pão com recheio de frango", preco: 25 },
      { id: "pao-frios", nome: "Pão de frios", preco: 25 },
      { id: "pao-calabresa", nome: "Pão com recheio de calabresa", preco: 25 },
    ],
  },
  {
    categoria: "Panquecas",
    itens: [
      { id: "panqueca-carne", nome: "Panqueca de carne", preco: 25 },
      { id: "panqueca-frango", nome: "Panqueca de frango", preco: 25 },
      { id: "panqueca-calabresa", nome: "Panqueca de calabresa", preco: 25 },
    ],
  },
  {
    categoria: "Empadões e tortas",
    itens: [
      {
        id: "empadao-grande",
        nome: "Empadão grande",
        preco: 60,
        opcoes: ["Frango", "Palmito", "Frango e palmito"],
      },
      {
        id: "empadao-medio",
        nome: "Empadão médio",
        preco: 25,
        opcoes: ["Frango", "Palmito", "Frango e palmito"],
      },
      {
        id: "empadinhas",
        nome: "Empadinhas de frango com catupiry (3 unidades)",
        preco: 15,
      },
      {
        id: "torta",
        nome: "Torta",
        preco: 25,
        opcoes: ["Frango", "Palmito", "Frango e palmito"],
      },
    ],
  },
  {
    categoria: "Bolos e biscoitos",
    itens: [
      { id: "bolo-chocolate", nome: "Bolo de chocolate", preco: 20 },
      { id: "casadinho-goiabada", nome: "Casadinhos de goiabada", preco: 10 },
      { id: "casadinho-doce-de-leite", nome: "Casadinhos de doce de leite", preco: 10 },
      { id: "biscoito-de-coco", nome: "Biscoitos de coco", preco: 10 },
    ],
  },
];

/* ============================================================
   Utilidades
   ============================================================ */

const brl = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const $ = (seletor) => document.querySelector(seletor);

function el(tag, classe, texto) {
  const node = document.createElement(tag);
  if (classe) node.className = classe;
  if (texto !== undefined) node.textContent = texto;
  return node;
}

const dois = (n) => String(n).padStart(2, "0");

function dataParaInput(data) {
  return `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}`;
}

function dataBr(isoData) {
  const [a, m, d] = isoData.split("-");
  return `${d}/${m}/${a}`;
}

/* ============================================================
   Estado do carrinho
   ============================================================ */

const carrinho = new Map(); // chave -> { id, nome, opcao, preco, qtd }
const CHAVE_STORAGE = "dona-ester-carrinho";

function salvarCarrinho() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify([...carrinho.entries()]));
  } catch (e) {
    /* sem armazenamento: o carrinho continua funcionando na página */
  }
}

function carregarCarrinho() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_STORAGE) || "[]");
    for (const [chave, item] of salvo) {
      const existe = CARDAPIO.some((c) => c.itens.some((i) => i.id === item.id));
      if (existe && item.qtd > 0) carrinho.set(chave, item);
    }
  } catch (e) {
    /* dados inválidos: começa com o carrinho vazio */
  }
}

function adicionar(produto, opcao) {
  const chave = opcao ? `${produto.id}|${opcao}` : produto.id;
  const atual = carrinho.get(chave);
  if (atual) {
    atual.qtd += 1;
  } else {
    carrinho.set(chave, {
      id: produto.id,
      nome: produto.nome,
      opcao: opcao || "",
      preco: produto.preco,
      qtd: 1,
    });
  }
  atualizar();
}

function mudarQtd(chave, delta) {
  const item = carrinho.get(chave);
  if (!item) return;
  item.qtd += delta;
  if (item.qtd <= 0) carrinho.delete(chave);
  atualizar();
}

function total() {
  let soma = 0;
  for (const item of carrinho.values()) soma += item.preco * item.qtd;
  return soma;
}

function quantidadeTotal() {
  let soma = 0;
  for (const item of carrinho.values()) soma += item.qtd;
  return soma;
}

/* ============================================================
   Desenho da página
   ============================================================ */

function desenharCardapio() {
  const raiz = $("#cardapio-lista");
  raiz.replaceChildren();

  for (const grupo of CARDAPIO) {
    const secao = el("div", "categoria");
    secao.appendChild(el("h3", "", grupo.categoria));
    const grade = el("div", "grade");

    for (const produto of grupo.itens) {
      const card = el("article", "item");
      card.appendChild(el("h4", "item__nome", produto.nome));
      card.appendChild(el("p", "item__preco", brl(produto.preco)));

      const rodape = el("div", "item__rodape");
      let seletor = null;

      if (produto.opcoes) {
        const idSel = `opcao-${produto.id}`;
        const rotulo = el("label", "", "Recheio");
        rotulo.setAttribute("for", idSel);
        seletor = el("select");
        seletor.id = idSel;
        for (const opcao of produto.opcoes) {
          const o = el("option", "", opcao);
          o.value = opcao;
          seletor.appendChild(o);
        }
        rodape.append(rotulo, seletor);
      }

      const botao = el("button", "btn btn--principal", "Adicionar");
      botao.type = "button";
      botao.setAttribute("aria-label", `Adicionar ${produto.nome} ao pedido`);
      botao.addEventListener("click", () =>
        adicionar(produto, seletor ? seletor.value : "")
      );
      rodape.appendChild(botao);

      card.appendChild(rodape);
      grade.appendChild(card);
    }

    secao.appendChild(grade);
    raiz.appendChild(secao);
  }
}

function desenharCarrinho() {
  const raiz = $("#carrinho");
  raiz.replaceChildren();

  if (carrinho.size === 0) {
    raiz.appendChild(
      el("p", "carrinho-vazio", "Seu pedido está vazio. Escolha os produtos no cardápio.")
    );
    return;
  }

  const lista = el("ul", "carrinho-lista");

  for (const [chave, item] of carrinho.entries()) {
    const li = el("li", "carrinho-item");

    const nome = el("span", "carrinho-item__nome", item.nome);
    if (item.opcao) nome.appendChild(el("span", "carrinho-item__opcao", item.opcao));

    const qtd = el("div", "qtd");
    const menos = el("button", "", "−");
    menos.type = "button";
    menos.setAttribute("aria-label", `Diminuir quantidade de ${item.nome}`);
    menos.addEventListener("click", () => mudarQtd(chave, -1));
    const saida = el("output", "", String(item.qtd));
    const mais = el("button", "", "+");
    mais.type = "button";
    mais.setAttribute("aria-label", `Aumentar quantidade de ${item.nome}`);
    mais.addEventListener("click", () => mudarQtd(chave, 1));
    qtd.append(menos, saida, mais);

    li.append(
      nome,
      el("span", "carrinho-item__subtotal", brl(item.preco * item.qtd)),
      qtd
    );
    lista.appendChild(li);
  }

  const linhaTotal = el("p", "total");
  const rotulo = el("span", "", "Total dos itens");
  rotulo.appendChild(el("small", "", "Combinamos o pagamento no WhatsApp"));
  linhaTotal.append(rotulo, el("span", "", brl(total())));

  raiz.append(lista, linhaTotal);
}

function atualizar() {
  desenharCarrinho();
  $("#contador").textContent = String(quantidadeTotal());
  salvarCarrinho();
}

/* ============================================================
   Data mínima e validação das 24 horas
   ============================================================ */

function limiteEntrega() {
  return new Date(Date.now() + CONFIG.antecedenciaHoras * 60 * 60 * 1000);
}

function configurarData() {
  // O calendário só libera datas a partir do limite (amanhã, no mínimo).
  $("#data").min = dataParaInput(limiteEntrega());
}

function dataHoraEscolhida(iso, hora) {
  const [a, m, d] = iso.split("-").map(Number);
  const [h, min] = hora.split(":").map(Number);
  return new Date(a, m - 1, d, h, min);
}

/* ============================================================
   Mensagem do WhatsApp
   ============================================================ */

function montarMensagem(dados) {
  const linhas = [];
  linhas.push("Olá, Dona Ester! Gostaria de fazer uma encomenda:");
  linhas.push("");
  linhas.push("*Itens*");

  for (const item of carrinho.values()) {
    const opcao = item.opcao ? ` (${item.opcao})` : "";
    linhas.push(`- ${item.qtd}x ${item.nome}${opcao}: ${brl(item.preco * item.qtd)}`);
  }

  linhas.push("");
  linhas.push(`*Total dos itens:* ${brl(total())}`);
  linhas.push("");
  linhas.push(`*Entrega:* ${dataBr(dados.data)} às ${dados.hora}`);

  const endereco = [dados.rua, dados.bairro, dados.complemento]
    .filter(Boolean)
    .join(", ");
  linhas.push(`*Endereço:* ${endereco} - ${CONFIG.cidade}`);
  linhas.push(`*Nome:* ${dados.nome}`);
  linhas.push("*Pagamento:* Pix");

  if (dados.obs) {
    linhas.push("");
    linhas.push(`*Observações:* ${dados.obs}`);
  }

  return linhas.join("\n");
}

function mostrarErro(texto) {
  const caixa = $("#erro");
  caixa.textContent = texto;
  caixa.hidden = false;
  caixa.scrollIntoView({ block: "center", behavior: "smooth" });
}

function limparErro() {
  const caixa = $("#erro");
  caixa.hidden = true;
  caixa.textContent = "";
}

function enviarPedido(evento) {
  evento.preventDefault();
  limparErro();

  if (carrinho.size === 0) {
    mostrarErro("Adicione pelo menos um produto ao pedido antes de enviar.");
    return;
  }

  const form = evento.target;
  const dados = {
    nome: form.nome.value.trim(),
    data: form.data.value,
    hora: form.hora.value,
    rua: form.rua.value.trim(),
    bairro: form.bairro.value.trim(),
    complemento: form.complemento.value.trim(),
    obs: form.obs.value.trim(),
  };

  if (!dados.nome || !dados.data || !dados.hora || !dados.rua || !dados.bairro) {
    mostrarErro("Preencha nome, data, horário, rua e bairro para continuar.");
    return;
  }

  if (!$("#cidade-ok").checked) {
    mostrarErro(
      `Entregamos somente em ${CONFIG.cidade}. Marque a confirmação do endereço para continuar.`
    );
    return;
  }

  const escolhida = dataHoraEscolhida(dados.data, dados.hora);
  if (Number.isNaN(escolhida.getTime()) || escolhida < limiteEntrega()) {
    mostrarErro(
      `As encomendas precisam ser feitas com pelo menos ${CONFIG.antecedenciaHoras} horas de antecedência. Escolha uma data e um horário posteriores.`
    );
    return;
  }

  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(
    montarMensagem(dados)
  )}`;
  window.open(url, "_blank", "noopener");
}

/* ============================================================
   Início
   ============================================================ */

carregarCarrinho();
desenharCardapio();
atualizar();
configurarData();
$("#form-pedido").addEventListener("submit", enviarPedido);
