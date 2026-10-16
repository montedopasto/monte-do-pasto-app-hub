const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../Code.gs'),'utf8');
const header=['Nome','Descrição','Link','Categoria','Ícone','Ordem','Visível'];
function run(rows,callback,missing=false){let output;const ctx={SpreadsheetApp:{openById(){return{getSheetByName(){return missing?null:{getLastRow:()=>rows.length,getRange:()=>({getDisplayValues:()=>rows})};}};}},ContentService:{MimeType:{JSON:'json',JAVASCRIPT:'js'},createTextOutput(text){output=text;return{setMimeType:()=>text};}}};vm.createContext(ctx);vm.runInContext(source,ctx);vm.runInContext(`doGet({parameter:${JSON.stringify(callback?{callback}:{})}})`,ctx);return output;}
test('exclui apps ocultas, vazias e links executáveis, ordena e publica só campos permitidos',()=>{const row=(name,url,order,visible)=>[name,'Descrição',url,'Área','',order,visible];const result=JSON.parse(run([header,row('B','https://example.org','2','Sim'),row('Oculta','https://example.org','0','Não'),row('A','https://example.org','1','Sim'),row('Inválida','javascript:alert(1)','0','Sim'),row('','https://example.org','0','Sim'),row('Sem visibilidade','https://example.org','0','')]));assert.deepEqual(result.apps.map(a=>a.name),['A','B']);assert.equal(result.apps[0].order,1);assert.equal(result.apps[0].visible,undefined);});
test('folha vazia resulta em diretório vazio',()=>assert.deepEqual(JSON.parse(run([header])),{apps:[]}));
test('cabeçalhos alterados e folha ausente falham sem expor detalhes',()=>{assert.deepEqual(JSON.parse(run([['Errado']])),{error:'DIRECTORY_UNAVAILABLE'});assert.deepEqual(JSON.parse(run([],null,true)),{error:'DIRECTORY_UNAVAILABLE'});});
test('callback fixo e dados escapados',()=>{assert.equal(run([header],'alert(1)'), '{}');const output=run([header,['</script>','texto','https://example.org','','','','Sim']],'appHubReceive');assert.ok(output.startsWith('appHubReceive('));assert.ok(!output.includes('</script>'));});
