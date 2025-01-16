document.getElementById('mensalidadeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nome = document.getElementById('nomeCliente').value;
    const valor = parseFloat(document.getElementById('valorMensalidade').value);

    const novaMensalidade = { nome, valor };
    adicionaMensalidadeLocalStorage(novaMensalidade);
    atualizaTabelaEGrafico();
});

function adicionaMensalidadeLocalStorage(mensalidade) {
    let mensalidades = JSON.parse(localStorage.getItem('mensalidades')) || [];
    mensalidades.push(mensalidade);
    localStorage.setItem('mensalidades', JSON.stringify(mensalidades));
}

function atualizaTabelaEGrafico() {
    let mensalidades = JSON.parse(localStorage.getItem('mensalidades')) || [];
    let total = mensalidades.reduce((acc, mensalidade) => acc + mensalidade.valor, 0);

    // Ordena as mensalidades por valor em ordem decrescente
    mensalidades.sort((a, b) => b.valor - a.valor);

    // Recalcula os índices após a ordenação
    mensalidades = mensalidades.map((mensalidade, index) => ({
        ...mensalidade,
        index
    }));

    // Salva a lista ordenada com índices corrigidos no localStorage
    localStorage.setItem('mensalidades', JSON.stringify(mensalidades));

    let conteudoTabela = '';

    // Renderiza a tabela com os índices atualizados
    mensalidades.forEach((mensalidade, index) => {
        let percentual = (mensalidade.valor / total * 100).toFixed(1);
        conteudoTabela += `<tr>
                               <td><button onclick="removeMensalidade(${index})" class="btn btn-danger btn-sm">
                                   <i class="fa fa-trash" aria-hidden="true"></i>
                               </button></td>
                               <td contenteditable="true" data-index="${index}" data-key="nome">${mensalidade.nome}</td>
                               <td contenteditable="true" data-index="${index}" data-key="valor">${mensalidade.valor.toFixed(2)}</td>
                               <td>${percentual}%</td>
                           </tr>`;
    });

    document.getElementById('tabelaMensalidades').innerHTML = conteudoTabela;
    document.getElementById('totalValor').textContent = total.toFixed(2);

    atualizaGrafico(mensalidades, total);

    // Adiciona eventos de edição às células
    const tableBody = document.getElementById('tabelaMensalidades');
    tableBody.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
        cell.addEventListener('blur', function() {
            salvaAlteracoes(cell);
        });
    });
}

function salvaAlteracoes(cell) {
    const index = cell.dataset.index; // Obtém o índice correto da linha
    const key = cell.dataset.key; // Obtém a chave do dado editado

    if (index !== undefined && key) {
        let mensalidades = JSON.parse(localStorage.getItem('mensalidades')) || [];
        let newValue = cell.textContent;

        if (key === 'valor') {
            newValue = parseFloat(newValue) || 0; // Garante que o valor seja um número válido
        }

        mensalidades[index][key] = newValue; // Atualiza somente o dado correspondente
        localStorage.setItem('mensalidades', JSON.stringify(mensalidades)); // Salva no localStorage
        atualizaTabelaEGrafico(); // Atualiza a tabela e o gráfico
    }
}

function removeMensalidade(index) {
    let mensalidades = JSON.parse(localStorage.getItem('mensalidades')) || [];
    mensalidades.splice(index, 1); // Remove a mensalidade pelo índice
    localStorage.setItem('mensalidades', JSON.stringify(mensalidades)); // Salva no localStorage
    atualizaTabelaEGrafico(); // Atualiza a tabela e o gráfico
}

function atualizaGrafico(mensalidades, total) {
    const ctx = document.getElementById('graficoMensalidade').getContext('2d');
    if (window.grafico) window.grafico.destroy(); // Destroi o gráfico existente, se houver

    const coresPrimarias = [
        "#5cb85c", "#66c266", "#4cae4c", "#52be52", "#449d44", "#73c673", "#3f9f3f"
    ];
    let backgroundColors = mensalidades.map((_, index) => coresPrimarias[index % coresPrimarias.length]);

    const data = {
        labels: mensalidades.map(m => m.nome),
        datasets: [{
            label: 'Valor da Mensalidade (R$)',
            data: mensalidades.map(m => m.valor),
            backgroundColor: backgroundColors,
            borderColor: backgroundColors,
            borderWidth: 1
        }]
    };

    window.grafico = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', atualizaTabelaEGrafico);
