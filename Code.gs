function getArgs(e) {
  if (e.contentLength > 0) {
    let { sheetName, row, withTimestamp } = JSON.parse(e.postData.contents);
    withTimestamp = !!withTimestamp;
    return { sheetName, row, withTimestamp };
  } else {
    return {
      sheetName: e.parameter.sheet_name,
      row: e.parameters.n,
      withTimestamp: !!e.parameter.with_timestamp,
    }
  }
}

function jsonResponse(content) {
  const response = ContentService.createTextOutput(content);
  response.setMimeType(ContentService.MimeType.JSON);
  return response;
}

function okResponse(content = "ok") {
  return jsonResponse(content);
}

function badRequest(content = "bad request") {
  return jsonResponse(content);
}

function appendRow(e) {
  try {
    const { sheetName, row, withTimestamp } = getArgs(e);

    if (!sheetName || typeof sheetName !== "string") {
      return badRequest("Sheet name not provided or bad sheet name");
    }

    if (!row || !Array.isArray(row) || !row.length || !row.every(i => typeof i === "string")) {
      return badRequest("Row data not provieded or bad row data");
    }

    const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadSheet.getSheetByName(sheetName);

    if (!sheet) {
      return badRequest(`Sheet with name "${sheetName}" not found`);
    }
    if (withTimestamp) {
      sheet.appendRow([(new Date()).toISOString(), ...row]);
    } else {
      sheet.appendRow(row);
    }
    
    return okResponse();
  } catch (e) {
    if (e instanceof SyntaxError) {
      return badRequest("bad JSON");
    }
    throw e;
  }
}

function doGet(e) {
  return appendRow(e);
}

function doPost(e) {
  return appendRow(e);
}
