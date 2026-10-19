// Serviço público apenas de leitura. A folha mantém-se privada.
const SHEET_ID = '1y8jXcZB2O_6vQSia4GAOgEF9CGlWgkOgrndRXKd-rvw';
function doGet(e) {
  const callback = e && e.parameter && e.parameter.callback;
  if (callback && callback !== 'appHubReceive') return ContentService.createTextOutput('{}').setMimeType(ContentService.MimeType.JSON);
  let result;
  try {
    const rows = Sheets.Spreadsheets.Values.get(SHEET_ID, "'Aplicações'!A1:G", {valueRenderOption:'FORMATTED_VALUE'}).values || [];
    const headers = ['Nome','Descrição','Link','Categoria','Ícone','Ordem','Visível'];
    if (!rows.length || !headers.every((v,i) => rows[0][i] === v)) throw new Error('Invalid headers');
    const apps = rows.slice(1).map(r => headers.map((_,i) => String(r[i] == null ? '' : r[i]))).filter(r => r[6].trim().toLowerCase() === 'sim' && r[0].trim() && /^https?:\/\/[^\s/@]+(?:[/:?#]|$)/i.test(r[2].trim())).map(r => ({
      name: r[0].trim().slice(0,150), description: r[1].trim().slice(0,500), url: r[2].trim(),
      category: r[3].trim().slice(0,80) || 'Geral', icon: Array.from(r[4].trim()).slice(0,4).join(''),
      order: r[5].trim() && Number.isFinite(Number(r[5])) ? Number(r[5]) : 1000000000
    })).sort((a,b) => a.order-b.order || a.name.localeCompare(b.name,'pt'));
    result = {apps};
  } catch (error) { console.error(String(error)); result = {error:'DIRECTORY_UNAVAILABLE'}; }
  const json = JSON.stringify(result).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return ContentService.createTextOutput(callback ? 'appHubReceive('+json+');' : json).setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
