// Add this file to the EXISTING Apps Script project. Keep the other handlers.
// Inside doPost, after JSON.parse, add:
// if (datos.app === 'CHQ_SWING_SIMPLE') return guardarSwingSimpleCHQ(datos);

function guardarSwingSimpleCHQ(datos) {
  function reply(value) {
    return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
  }
  const uuid = /^[a-zA-Z0-9-]{1,100}$/;
  if (datos.schemaVersion !== 1 || typeof datos.revisionId !== 'string' || !uuid.test(datos.revisionId) ||
      typeof datos.evaluationId !== 'string' || !uuid.test(datos.evaluationId) ||
      typeof datos.studentId !== 'string' || !datos.studentId.trim() || datos.studentId.length > 100 ||
      !Number.isInteger(datos.revisionNumber) || datos.revisionNumber < 1 || datos.revisionNumber > 100000 ||
      typeof datos.submittedAt !== 'string' || isNaN(Date.parse(datos.submittedAt)) ||
      !datos.fields || typeof datos.fields !== 'object' || Array.isArray(datos.fields)) {
    return reply({ok:false,error:'Registro inválido / Invalid record.'});
  }
  const fields = chqSwingSimpleFields();
  const f = datos.fields;
  if (Object.keys(f).some(k=>!fields.some(x=>x[0]===k)) ||
      fields.some(x=>typeof f[x[0]]!=='string' || f[x[0]].length>4000) || !f.studentName.trim()) {
    return reply({ok:false,error:'Campos inválidos / Invalid fields.'});
  }
  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;
  }
  if (!validDate(f.date) || (f.birthDate && !validDate(f.birthDate))) {
    return reply({ok:false,error:'Fecha inválida / Invalid date.'});
  }
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify([datos.evaluationId,datos.studentId,datos.revisionNumber,datos.submittedAt,fields.map(x=>f[x[0]])]),
    Utilities.Charset.UTF_8).map(x=>('0'+((x+256)%256).toString(16)).slice(-2)).join('');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return reply({ok:false,error:'Ocupado. Intenta de nuevo / Busy. Please retry.'});
  try {
    const book = SpreadsheetApp.openById('180IUIA1jS9uNSPmiKMR1fZbK_xUZIaK9d3Fv5YErbRs');
    const name = 'CHQ Swing - Evaluaciones';
    let sheet = book.getSheetByName(name);
    if (!sheet) sheet = book.insertSheet(name);
    const headers = ['Revision ID / ID revisión','Evaluation ID / ID evaluación','Student ID / ID alumno',
      'Revision / Revisión','Submitted at / Fecha de envío','Coach','Fingerprint / Huella',
      ...fields.map(x=>x[2]+' / '+x[1])];
    if (sheet.getLastRow()===0) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#163d32').setFontColor('#ffffff');
    }
    const actual = sheet.getRange(1,1,1,headers.length).getValues()[0];
    if (actual.some((v,i)=>v!==headers[i])) return reply({ok:false,error:'Las columnas de esta pestaña no coinciden / Sheet columns do not match.'});
    const rows = sheet.getLastRow()>1 ? sheet.getRange(2,1,sheet.getLastRow()-1,7).getValues() : [];
    const prior = rows.find(row=>String(row[0])===datos.revisionId);
    if (prior) {
      if (String(prior[6])!==hash) return reply({ok:false,error:'Esta revisión ya contiene otros datos / Revision conflict.'});
      return reply({ok:true,revisionId:datos.revisionId,duplicate:true});
    }
    const safe = value => /^[=+\-@\t\r]/.test(String(value)) ? "'"+String(value) : String(value);
    const row = [datos.revisionId,datos.evaluationId,safe(datos.studentId),datos.revisionNumber,
      datos.submittedAt,'Chela Quintana',hash,...fields.map(x=>safe(f[x[0]]))];
    const next = sheet.getLastRow()+1;
    sheet.getRange(next,1,1,headers.length).setValues([row]);
    sheet.getRange(next,8,1,fields.length).setWrap(true);
    SpreadsheetApp.flush();
    return reply({ok:true,revisionId:datos.revisionId});
  } catch(error) {
    return reply({ok:false,error:'No se confirmó el guardado en Sheets / Sheets save was not confirmed.'});
  } finally {
    lock.releaseLock();
  }
}

// The build writes the exact bilingual field order here.
function chqSwingSimpleFields() { return [["studentName", "Nombre", "Name"], ["birthDate", "FDN · Fecha de nacimiento", "DOB · Date of birth"], ["date", "Fecha de evaluación", "Evaluation date"], ["setupAnalysis", "Análisis de la parada", "Address analysis"], ["grip", "Grip", "Grip"], ["posture", "Postura", "Posture"], ["alignment", "Alineación", "Alignment"], ["ballPosition", "Posición de la bola", "Ball position"], ["bodyMovement", "Movimiento del cuerpo", "Body movement"], ["faults", "Fallas", "Swing faults"], ["takeaway", "Paso 1 · La sacada", "Step 1 · Takeaway"], ["p2", "Paso 2 · Palo paralelo al piso — backswing", "Step 2 · Club parallel to the ground — backswing"], ["p3", "Paso 3 · Brazo delantero paralelo al piso — posición en L", "Step 3 · Lead arm parallel to the ground — L position"], ["p4", "Paso 4 · El tope del backswing", "Step 4 · Top of backswing"], ["p5", "Paso 5 · Brazo delantero paralelo al piso — downswing", "Step 5 · Lead arm parallel to the ground — downswing"], ["p6", "Paso 6 · Shaft paralelo al piso — downswing", "Step 6 · Shaft parallel to the ground — downswing"], ["p75", "Paso 7.5 · Shaft entre P7 y P8", "Step 7.5 · Shaft between P7 and P8"], ["p8", "Paso 8 · Shaft paralelo al piso — follow-through", "Step 8 · Shaft parallel to the ground — follow-through"], ["p9", "Paso 9 · Brazo delantero paralelo al piso — follow-through", "Step 9 · Lead arm parallel to the ground — follow-through"], ["p10", "Paso 10 · El finish", "Step 10 · Finish"], ["corrections", "Correcciones", "Corrections"], ["drills", "Ejercicios / Drills", "Exercises / Drills"], ["behavior", "Manera de actuar", "Conduct"], ["physical", "Condición física y limitaciones", "Physical condition and limitations"], ["skills", "Habilidades técnicas", "Technical skills"], ["putting", "Putt", "Putting"]]; }
