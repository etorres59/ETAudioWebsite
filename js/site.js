document.addEventListener("DOMContentLoaded", function () {
    // === Gallery Thumbnail Logic ===
    const mainImage = document.querySelector(".mainImage img");
    const thumbnails = document.querySelectorAll(".thumbnails img");

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener("click", function (event) {
            event.preventDefault();
            mainImage.src = this.src;
            mainImage.parentElement.href = this.parentElement.href;
        });
    });

    // === Contact Form Validation ===
    const form = document.getElementById("contactUsForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            const fname = document.getElementById("fname").value.trim();
            const lname = document.getElementById("lname").value.trim();
            const email = document.getElementById("email").value.trim();
            const message = document.getElementById("contactMessage").value.trim();
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!fname || !lname || !email || !message) {
                alert("Please fill in all fields.");
                e.preventDefault();
                return;
            }

            if (!emailPattern.test(email)) {
                alert("Please enter a valid email address.");
                e.preventDefault();
                return;
            }

            alert("Message sent successfully!");
        });
    }

    // === Hamburger Menu Logic ===
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // === Hover Alert for Coming Soon Button ===
    const comingSoonButton = document.getElementById("comingSoonButton");
    if (comingSoonButton) {
        comingSoonButton.addEventListener("mouseenter", () => {
            alert("This Pack comes out on July 1st, 2025! You can use code: EARLYBIRD for 10% off our other products!");
        });
    }
});
