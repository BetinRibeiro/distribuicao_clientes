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

    mensalidades.sort((a, b) => b.valor - a.valor);

    let conteudoTabela = '';
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

    // Adiciona evento para salvar ao pressionar Enter
    const tableBody = document.getElementById('tabelaMensalidades');
    tableBody.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
        cell.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                salvaAlteracoes(cell);
            }
        });
    });
}

function salvaAlteracoes(cell) {
    const index = cell.dataset.index;
    const key = cell.dataset.key;

    if (index !== undefined && key) {
        let mensalidades = JSON.parse(localStorage.getItem('mensalidades')) || [];
        const newValue = key === 'valor' ? parseFloat(cell.textContent) : cell.textContent;

        mensalidades[index][key] = newValue || mensalidades[index][key];
        localStorage.setItem('mensalidades', JSON.stringify(mensalidades));
        atualizaTabelaEGrafico();
    }
}

function removeMensalidade(index) {
    let mensalidades = JSON.parse(localStorage.getItem('mensalidades')) || [];
    mensalidades.splice(index, 1);
    localStorage.setItem('mensalidades', JSON.stringify(mensalidades));
    atualizaTabelaEGrafico();
}

function atualizaGrafico(mensalidades, total) {
    const ctx = document.getElementById('graficoMensalidade').getContext('2d');
    if (window.grafico) window.grafico.destroy(); 

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
