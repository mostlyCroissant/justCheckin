function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const guestSheet = ss.getSheetByName("Guests");
  const guestData = guestSheet.getDataRange().getValues();
  const guestHeaders = guestData.shift();

  const guests = guestData.map(row => {
    let obj = {};
    guestHeaders.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });

  const metaSheet = ss.getSheetByName("Meta");
  let meta = {};

  if (metaSheet) {
    const metaData = metaSheet.getDataRange().getValues();
    metaData.forEach(row => {
      if (row[0]) meta[row[0]] = row[1];
    });
  }

  return ContentService.createTextOutput(
    JSON.stringify({ guests, meta })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const id = body.guest_id;
  const checkedInAt = body.checked_in_at || "";

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Guests");
  const data = sheet.getDataRange().getValues();

  const headers = data[0];
  const idIndex = headers.indexOf("guest_id");
  const checkIndex = headers.indexOf("checked_in_at");

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] == id) {
      sheet.getRange(i + 1, checkIndex + 1).setValue(checkedInAt);
      break;
    }
  }

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}