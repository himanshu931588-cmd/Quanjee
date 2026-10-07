// Reveal elements on scroll
function reveal() {
    var reveals = document.querySelectorAll(".reveal");

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100; // when to trigger

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        } else {
            // Optional: Remove class to repeat animation on scrolling up
            // reveals[i].classList.remove("active");
        }
    }
}

window.addEventListener("scroll", reveal);

// Trigger once on load
reveal();

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.05)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        navbar.style.border = '1px solid rgba(255, 255, 255, 0.05)';
    } else {
        navbar.style.background = 'var(--glass-bg)';
        navbar.style.boxShadow = 'none';
        navbar.style.border = '1px solid transparent';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
