(() => {
  const weatherForm = document.querySelector('#weather-form');
  const placesForm = document.querySelector('#places-form');
  const weatherResult = document.querySelector('#weather-result');
  const placesResult = document.querySelector('#places-result');

  const showMessage = (target, message, title = 'Não foi possível concluir') => {
    target.replaceChildren();
    const paragraph = document.createElement('p');
    paragraph.className = 'notice';
    paragraph.textContent = message;
    const heading = document.createElement('p');
    heading.className = 'result-title';
    heading.textContent = title;
    target.append(heading, paragraph);
    target.hidden = false;
  };

  async function requestJson(url) {
    let response;
    try {
      response = await fetch(url);
    } catch (_) {
      throw new Error('Não conseguimos conectar agora. Verifique sua internet e tente novamente.');
    }
    let data;
    try { data = await response.json(); } catch (_) {
      throw new Error('Recebemos uma resposta inesperada. Tente novamente em alguns instantes.');
    }
    if (!response.ok) {
      if (data.codigo === 'CIDADE_NAO_ENCONTRADA') throw new Error('Não encontramos essa cidade. Confira a escrita ou tente informar apenas o nome principal.');
      if (data.codigo === 'NOME_INVALIDO') throw new Error('Digite o nome de uma cidade (pelo menos duas letras).');
      if (data.codigo === 'UF_NAO_ENCONTRADA' || data.codigo === 'SIGLA_UF_INVALIDA') throw new Error('Não encontramos esse estado. Escolha uma opção da lista e tente novamente.');
      if (data.codigo === 'SERVICO_EXTERNO_INDISPONIVEL') throw new Error('O serviço de consulta está demorando ou fora do ar. Aguarde um pouco e tente novamente.');
      throw new Error('Ocorreu um problema inesperado. Tente novamente.');
    }
    return data;
  }

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  weatherForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const city = document.querySelector('#city').value.trim();
    if (city.length < 2) {
      document.querySelector('#city').focus();
      showMessage(weatherResult, 'Digite pelo menos duas letras do nome da cidade.', 'Falta informar a cidade');
      return;
    }
    const button = weatherForm.querySelector('button');
    button.disabled = true;
    button.querySelector('span:first-child').textContent = 'Buscando previsão…';
    weatherResult.hidden = true;
    try {
      const data = await requestJson(`/api/v1/clima/${encodeURIComponent(city)}`);
      weatherResult.replaceChildren();
      weatherResult.append(make('p', 'result-title', `${data.nome} — ${data.estado}`));
      const sub = make('p', 'result-subtitle', `Previsão consultada ${data.consultado_em ? 'agora' : ''}`);
      weatherResult.append(sub);
      const values = make('div', 'weather-values');
      values.append(
        makeTemperature('Mínima prevista', data.clima.temperatura_min),
        makeTemperature('Máxima prevista', data.clima.temperatura_max)
      );
      weatherResult.append(values);
      weatherResult.append(make('span', 'condition', data.clima.condicao || 'Condição não informada'));
      weatherResult.hidden = false;
    } catch (error) {
      showMessage(weatherResult, error.message, 'Não encontramos a previsão');
    } finally {
      button.disabled = false;
      button.querySelector('span:first-child').textContent = 'Consultar clima';
    }
  });

  function makeTemperature(label, value) {
    const box = make('div', 'temp-box');
    box.append(make('span', 'temp-label', label), make('span', 'temp-value', `${value} °C`));
    return box;
  }

  placesForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const stateSelect = document.querySelector('#state');
    const state = stateSelect.value;
    if (!state) {
      stateSelect.focus();
      showMessage(placesResult, 'Selecione um estado na lista antes de continuar.', 'Escolha um estado');
      return;
    }
    const button = placesForm.querySelector('button');
    button.disabled = true;
    button.querySelector('span:first-child').textContent = 'Buscando cidades…';
    placesResult.hidden = true;
    try {
      const data = await requestJson(`/api/v1/cidades/${encodeURIComponent(state)}?limite=30`);
      placesResult.replaceChildren();
      const option = stateSelect.options[stateSelect.selectedIndex].text;
      placesResult.append(make('p', 'result-title', `Cidades de ${option}`));
      placesResult.append(make('p', 'result-subtitle', `${data.quantidade_retornada} município(s) mostrado(s). Esta é uma amostra da lista.`));
      const list = make('ul', 'place-list');
      data.cidades.forEach((city) => list.append(make('li', '', city.nome)));
      placesResult.append(list);
      placesResult.hidden = false;
    } catch (error) {
      showMessage(placesResult, error.message, 'Não conseguimos listar as cidades');
    } finally {
      button.disabled = false;
      button.querySelector('span:first-child').textContent = 'Mostrar cidades';
    }
  });
})();
