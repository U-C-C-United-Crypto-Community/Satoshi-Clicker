module.exports = {
    detectTab:  function () {
        // Broadcast that you're opening a page.
        localStorage.openpages = Date.now();
        window.addEventListener('storage', function (e) {
            if(e.key == "openpages") {
                // Listen if anybody else is opening the same page!
                localStorage.page_available = Date.now();
            }
            if(e.key == "page_available") {
                alert("One more page already open");
            }
        }, false);
}}