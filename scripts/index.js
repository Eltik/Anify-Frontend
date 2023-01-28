let observer = new IntersectionObserver(function(entries) {
    if(entries[0].isIntersecting === true) {
        anime({
            targets: ".header",
            opacity: 1,
            duration: 800,
            easing: "easeInOutQuad"
        });
        anime({
            targets: [".header h1", ".box_grid", ".subheader h1", ".subheader h2"],
            translateY: "70px",
            opacity: 1,
            duration: 1000,
            easing: "easeInOutQuad",
            delay: anime.stagger(100)
        });

        anime({
            targets: ".header h1",
            translateY: "20px",
            opacity: 1,
            duration: 1500,
            easing: "easeInOutQuad",
        })
        anime({
            targets: ".header h1",
            keyframes: [
                { textShadow: "0 0 .6em rgba(var(--pink-500), 0.2)"},
                { textShadow: "0 0 .6em rgba(var(--pink-500), 0.25)"},
                { textShadow: "0 0 .6em rgba(var(--pink-500), 0.2)"},
            ],
            duration: 3000,
            easing: "easeInOutQuad",
            loop: true
        })
        anime({
            targets: ".arrow_down",
            opacity: 0,
            duration: 800,
            easing: "easeInOutQuad"
        })
    } else {
        anime({
            targets: ".header",
            opacity: 0,
            duration: 800,
            easing: "easeInOutQuad"
        });
        anime({
            targets: [".header h1", ".box_grid", ".subheader h1", ".subheader h2"],
            translateY: "-50px",
            opacity: 0,
            duration: 1000,
            easing: "easeInOutQuad",
            delay: anime.stagger(100)
        });
        anime({
            targets: ".arrow_down",
            opacity: 1,
            duration: 800,
            easing: "easeInOutQuad"
        })
    }
}, { threshold: [0.5] });

observer.observe(document.querySelector(".header"));

function scrollDown() {
    anime({
        targets: ".arrow_down",
        opacity: 0,
        duration: 800,
        easing: "easeInOutQuad"
    })
    document.getElementById("header").scrollIntoView({
        behavior: "smooth"
    });
}