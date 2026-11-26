def test_pagina_inicial_exibe_interface_para_usuarios(client):
    resposta = client.get("/")

    assert resposta.status_code == 200
    assert "Clima &amp; Lugares" in resposta.get_data(as_text=True) or "Clima & Lugares" in resposta.get_data(as_text=True)
    assert "Como está o clima?" in resposta.get_data(as_text=True)
    assert "Selecione um estado" in resposta.get_data(as_text=True)
