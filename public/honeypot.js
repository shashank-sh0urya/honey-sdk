(function () {
    function detectAttack(formData) {
        const attackPatterns = [
            // SQL Injection
            /(--|#|;|\/\*)/i,
            /\b(UNION|SELECT|INSERT|DELETE|UPDATE|DROP|TRUNCATE|ALTER|EXEC|FROM|WHERE|TABLE)\b/i,
            /\b(OR|AND)\b.*[=<>]/i,
            /('|")/,

            // XSS
            /<script.*?>.*?<\/script>/i,
            /\b(onerror|onload|onclick|alert|document\.cookie)\b/i,

            // Command Injection
            /[;&|]{1,2}/,
            /\b(cat|ls|whoami|wget|curl|nc|bash|sh)\b/i,

            // Local File Inclusion
            /\.\.\/|etc\/passwd|boot\.ini/i,

            // SSRF
            /(http|https):\/\/(127\.0\.0\.1|localhost|169\.254\.169\.254|0\.0\.0\.0)/i
        ];

        return Object.values(formData).some(value =>
            attackPatterns.some(pattern => pattern.test(value))
        );
    }

    document.addEventListener('submit', function (event) {
        let formData = new FormData(event.target);
        let formObject = {};
        formData.forEach((value, key) => formObject[key] = value);

        if (detectAttack(formObject)) {
            const base = window.location.origin; // auto-detect deployed domain

            fetch(`${base}/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formObject,
                    userAgent: navigator.userAgent,
                    type: "deceptive-form",
                    location: window.location.href
                })
            }).then(() => {
                window.location.href = `${base}/admin`; // redirect to fake panel
            }).catch(err => console.error("Track failed", err));

            console.warn("Attack pattern detected. Redirecting to honeypot.");
            event.preventDefault();
        }
    }, true);
})();
