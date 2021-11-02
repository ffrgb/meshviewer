(function() {
    var iframe=document.getElementById("meshviewer-embedded")
    if (!iframe) {
        console.log("IFrame 'meshviewer-embedded' not found")
        return;
    }
    if (!iframe.contentWindow) {
        console.log("Element 'meshviewer-embedded' seems not to be a valid iframe")
        return;
    }
    if (document.location.hash) {
        window.setTimeout(function() {
            iframe.contentWindow.location.hash = document.location.hash;
        }, 0);
    }
    iframe.contentWindow.addEventListener("message", (event) => {
        if (event && event.data && event.data.hash) {
            window.location.hash = event.data.hash;
        }
    }, false);
    window.onhashchange = function () {
        iframe.contentWindow.location.hash = document.location.hash;
    };
}) ();
