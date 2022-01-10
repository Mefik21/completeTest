function showError(res, message, params, extras) {
  if (!res) return; // для случая когда вызывается функция не юзером, а сервером
  if (res.writableEnded) return;

  let contents = JSON.stringify({
    status: "error",
    message: message || "Error",
    params,
    extras,
  });
  res.end(contents);
}

function showSuccess(res, message, data) {
  if (!res) return; // для случая когда вызывается функция не юзером, а сервером
  if (res.writableEnded) return;

  let contents = JSON.stringify({
    status: "success",
    message: message || "Success",
    data: data,
  });
  res.end(contents);
}

function showInfo(res, message, data) {
  if (!res) return; // для случая когда вызывается функция не юзером, а сервером
  if (res.writableEnded) return;

  let contents = JSON.stringify({
    status: "info",
    message: message || "Info",
    data: data,
  });
  res.end(contents);
}

module.exports = { showError, showInfo, showSuccess };
