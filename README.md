# Dona Ester Pães e Doces

Site de encomendas para a padaria artesanal Dona Ester, de Registro/SP. Projeto real, feito para a padaria da minha família: o cliente monta o pedido no cardápio online e envia tudo pronto pelo WhatsApp.

## Problema

A padaria trabalha sob encomenda e recebia os pedidos em conversas soltas, sem padrão. O site organiza o pedido (itens, data, horário e endereço) e envia uma mensagem completa, o que reduz perguntas e erros.

## Funcionalidades

- Cardápio por categoria, com preços e escolha de recheio.
- Carrinho com quantidades, total e contador, salvo no navegador.
- Regra de negócio: encomendas com no mínimo 24 horas de antecedência, validada no calendário e no envio.
- Entrega somente em Registro/SP, com confirmação do endereço.
- Mensagem de pedido formatada e enviada ao WhatsApp da padaria; pagamento por Pix.
- Layout responsivo, pensado primeiro para celular, com tema escuro baseado no logo.
- Acessibilidade: rótulos nos campos, foco visível e botões com tamanho adequado ao toque.

## Tecnologias

HTML, CSS e JavaScript puro, sem dependências nem etapa de build.

## Como rodar

Abra o `index.html` no navegador, ou rode um servidor local:

```
npx serve .
```

## Estrutura

```
index.html   estrutura da página
style.css    estilos e tema
script.js    cardápio, carrinho, validações e envio ao WhatsApp
images/      logo e fotos dos produtos
```

## Configuração

No topo do `script.js`:

- `CONFIG`: número do WhatsApp, antecedência mínima e cidade atendida.
- `CARDAPIO`: produtos, preços e opções de recheio.

## Próximos passos

- Painel para a padaria cadastrar produtos, preços e fotos sem mexer no código.
- Banco de dados para guardar os pedidos.
- Fotos individuais de cada produto.
