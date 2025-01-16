// Adiciona um evento ao formulário para capturar o envio
document.getElementById('mensalidadeForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário (recarregar a página)

    // Obtém o valor do campo "Nome do Cliente"
    const nome = document.getElementById('nomeCliente').value;

    // Obtém e converte o valor do campo "Valor da Mensalidade" para número
    const valor = parseFloat(document.getElementById('valorMensalidade').value);

    // Cria um objeto representando a nova mensalidade
    const novaMensalidade = { nome, valor };

    // Adiciona a nova mensalidade ao localStorage
    adicionaMensalidadeLocalStorage(novaMensalidade);

    // Atualiza a tabela e o gráfico com os dados mais recentes
    atualizaTabelaEGrafico();
});

// Função para adicionar uma mensalidade ao localStorage
function adicionaMensalidadeLocalStorage(mensalidade) {
    // Recupera as mensalidades do localStorage ou inicializa como uma lista vazia
    let mensalidades = JSON.parse(localStorage.getItem('mensalidades')) || [];
    mensalidades.push(mensalidade); // Adiciona a nova mensalidade ao array
    // Atualiza o localStorage com as mensalidades modificadas
    localStorage.setItem('mensalidades', JSON.stringify(mensalidades));
}

// Função para atualizar a tabela e o gráfico
function atualizaTabelaEGrafico() {
    // Recupera as mensalidades do localStorage ou inicializa como uma lista vazia
    let mensalidades = JSON.parse(localStorage.getItem('mensalidades')) || [];
    // Calcula o valor total das mensalidades
    let total = mensalidades.reduce((acc, mensalidade) => acc + mensalidade.valor, 0);

    // Ordena as mensalidades por valor em ordem decrescente
    mensalidades.sort((a, b) => b.valor - a.valor);

    let conteudoTabela = ''; // Inicializa o conteúdo da tabela como vazio

    // Itera sobre cada mensalidade e cria uma linha na tabela
    mensalidades.forEach((mensalidade, index) => {
        let percentual = (mensalidade.valor / total * 100).toFixed(1); // Calcula o percentual da mensalidade
        conteudoTabela += `<tr>
                               <td><button onclick="removeMensalidade(${index})" class="btn btn-danger btn-sm">
                                   <i class="fa fa-trash" aria-hidden="true"></i>
                               </button></td>
                               <td contenteditable="true" data-index="${index}" data-key="nome">${mensalidade.nome}</td>
                               <td contenteditable="true" data-index="${index}" data-key="valor">${mensalidade.valor.toFixed(2)}</td>
                               <td>${percentual}%</td>
                           </tr>`;
    });

    // Insere o conteúdo gerado na tabela
    document.getElementById('tabelaMensalidades').innerHTML = conteudoTabela;

    // Atualiza o valor total exibido na tabela
    document.getElementById('totalValor').textContent = total.toFixed(2);

    // Atualiza o gráfico com os dados mais recentes
    atualizaGrafico(mensalidades, total);

    // Adiciona evento para salvar alterações ao pressionar Enter
    const tableBody = document.getElementById('tabelaMensalidades');
    tableBody.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
        cell.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') { // Verifica se a tecla pressionada é Enter
                event.preventDefault(); // Evita a inserção de uma nova linha
                salvaAlteracoes(cell); // Salva a alteração no localStorage
            }
        });
    });
}

// Função para salvar alterações feitas em uma célula da tabela
function salvaAlteracoes(cell) {
    const index = cell.dataset.index; // Obtém o índice da mensalidade
    const key = cell.dataset.key; // Obtém a chave (nome ou valor)

    if (index !== undefined && key) {
        // Recupera as mensalidades do localStorage
        let mensalidades = JSON.parse(localStorage.getItem('mensalidades')) || [];
        // Atualiza o valor da chave editada
        const newValue = key === 'valor' ? parseFloat(cell.textContent) : cell.textContent;

        mensalidades[index][key] = newValue || mensalidades[index][key]; // Atualiza o valor no array
        // Salva as alterações no localStorage
        localStorage.setItem('mensalidades', JSON.stringify(mensalidades));
        atualizaTabelaEGrafico(); // Atualiza a tabela e o gráfico
    }
}

// Função para remover uma mensalidade
function removeMensalidade(index) {
    // Recupera as mensalidades do localStorage
    let mensalidades = JSON.parse(localStorage.getItem('mensalidades')) || [];
    mensalidades.splice(index, 1); // Remove a mensalidade no índice especificado
    // Salva as alterações no localStorage
    localStorage.setItem('mensalidades', JSON.stringify(mensalidades));
    atualizaTabelaEGrafico(); // Atualiza a tabela e o gráfico
}

// Função para atualizar o gráfico
function atualizaGrafico(mensalidades, total) {
    const ctx = document.getElementById('graficoMensalidade').getContext('2d'); // Obtém o contexto do canvas do gráfico
    if (window.grafico) window.grafico.destroy(); // Destroi o gráfico anterior, se existir

    const coresPrimarias = [
        "#5cb85c", "#66c266", "#4cae4c", "#52be52", "#449d44", "#73c673", "#3f9f3f"
    ]; // Define cores para o gráfico

    let backgroundColors = mensalidades.map((_, index) => coresPrimarias[index % coresPrimarias.length]); // Mapeia as cores para os dados

    // Cria os dados para o gráfico
    const data = {
        labels: mensalidades.map(m => m.nome), // Define os rótulos como os nomes das mensalidades
        datasets: [{
            label: 'Valor da Mensalidade (R$)', // Define o rótulo do conjunto de dados
            data: mensalidades.map(m => m.valor), // Define os valores das mensalidades
            backgroundColor: backgroundColors, // Define as cores de fundo
            borderColor: backgroundColors, // Define as cores das bordas
            borderWidth: 1 // Define a largura das bordas
        }]
    };

    // Cria um novo gráfico do tipo "bar" (barra)
    window.grafico = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true // Faz o eixo Y começar do zero
                }
            },
            responsive: true, // Torna o gráfico responsivo
            plugins: {
                legend: {
                    position: 'top', // Posiciona a legenda no topo
                }
            }
        }
    });
}

// Adiciona um evento ao carregar o DOM para atualizar a tabela e o gráfico
document.addEventListener('DOMContentLoaded', atualizaTabelaEGrafico);
