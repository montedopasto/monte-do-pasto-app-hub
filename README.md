# MONTE DO PASTO | APP HUB

Portal estático preparado para GitHub Pages. A administração é a Google Sheet privada do proprietário; não há credenciais, Supabase ou login público.

## Gestão

[Abrir a folha de aplicações](https://docs.google.com/spreadsheets/d/1y8jXcZB2O_6vQSia4GAOgEF9CGlWgkOgrndRXKd-rvw/edit).

Na folha **Aplicações**, preencher Nome, Descrição, Link, Categoria, Ícone, Ordem e Visível. Publicar apenas links destinados ao diretório público. Uma linha por app. `Sim` publica, `Não` ou vazio oculta. Ordem numérica crescente; vazio fica no fim. Ícone opcional: emoji ou até quatro caracteres, sem imagens externas. Apagar uma linha remove a app. Categorias são criadas a partir dos valores preenchidos. Não mudar os cabeçalhos.

## Estado da configuração

- Google Sheet criada e privada, com duas folhas e validação de visibilidade.
- Interface pronta, sem dados fictícios. A marca gráfica é provisória, não é o logótipo oficial.
- Serviço Apps Script fornecido em `Code.gs`, ainda por instalar e autorizar.
- `config.js` tem o endpoint vazio intencionalmente. O site apresenta estado de preparação até ser configurado.
- GitHub Pages ainda por ativar. Não foi criado um endereço de produção.

## Ligar a Google Sheet

1. Na folha, abrir **Extensões → Apps Script** e criar o projeto `Monte do Pasto App Hub`.
2. Substituir o conteúdo de `Code.gs` pelo ficheiro deste repositório.
3. Nas definições do projeto, mostrar o manifesto `appsscript.json` e usar o ficheiro incluído. Solicita apenas leitura de folhas. A autenticação autoriza o script na conta do proprietário; a folha continua privada.
4. Implementar como **Aplicação Web**, executar como o proprietário e permitir acesso a **Qualquer pessoa**. Esta escolha torna público apenas o resultado de leitura das apps visíveis. Confirmar que as políticas da conta Google permitem acesso anónimo.
5. Copiar o URL real terminado em `/exec` para `endpoint` em `config.js`. Nunca usar `/dev`.
6. Abrir a página sem sessão Google e testar uma app real marcada `Sim`; mudar para `Não`, atualizar e confirmar que desaparece. A folha vazia deve devolver `{"apps":[]}`. O serviço suporta JSON e JSONP com callback fixo `appHubReceive`, sem comandos de escrita ou seleção de folhas por parâmetros.
7. Para alterações futuras no código Apps Script, atualizar a versão da implementação existente.

O serviço não permite escrever. Não colocar senhas, tokens ou links com credenciais na folha. Apps ocultas não são devolvidas pelo serviço; ocultar um cartão não revoga o acesso à própria aplicação.

## GitHub Pages

Em **Settings → Pages**, escolher **Deploy from a branch**, ramo `main`, pasta `/ (root)`. O conteúdo é estático e os caminhos são relativos, compatíveis com páginas de projeto. O Pages num repositório privado depende do plano GitHub. Caso não esteja disponível, decidir se o repositório pode ser público ou usar um plano compatível; não alterar a visibilidade sem confirmação.

Não há compilação nem dependências para executar o portal. Os ficheiros `Code.gs` e `appsscript.json` são apenas a fonte do serviço, não são executados pelo Pages. Nunca adicionar segredos ao repositório.

## Verificações

Executar `node --test tests/service.test.cjs` para verificar filtragem, ordem, cabeçalhos, ocultação, callback e respostas de erro do serviço. Verificação final com endpoint Google real e publicação Pages pendente até à autorização/implementação Google.

Referências: [Google Apps Script Web Apps](https://developers.google.com/apps-script/guides/web), [Content Service e JSONP](https://developers.google.com/apps-script/guides/content).
