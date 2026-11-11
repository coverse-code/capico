(function () {
  document.addEventListener('keydown', function (event) {
    if (!event.shiftKey || event.code !== 'Digit1' || event.ctrlKey || event.altKey || event.metaKey) return;
    if (/\/admin\.html$/i.test(window.location.pathname)) return;

    event.preventDefault();
    const rootErrorPage = /\/404\.html$/i.test(window.location.pathname) &&
      !/\/kod\/404\.html$/i.test(window.location.pathname);
    const adminPath = rootErrorPage ? 'kod/admin.html' : 'admin.html';
    window.location.assign(new URL(adminPath, window.location.href).href);
  });
})();
