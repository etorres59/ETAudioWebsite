document.addEventListener("DOMContentLoaded", function () {
    // Get the main image and all thumbnail images
    const mainImage = document.querySelector(".mainImage img");
    const thumbnails = document.querySelectorAll(".thumbnails img");

    // Loop through each thumbnail and add a click event
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link behavior

            // Change the big image to the clicked thumbnail’s image
            mainImage.src = this.src;
            mainImage.parentElement.href = this.parentElement.href; // Update the link to open in new tab
        });
    });
});
// Function to handle the form submission and validation
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("contactUsForm").addEventListener("submit", function (e) {
      // Grab input values
      const fname = document.getElementById("fname").value.trim();
      const lname = document.getElementById("lname").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("contactMessage").value.trim();
  
      // Simple email regex
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      // Check for empty fields
      if (!fname || !lname || !email || !message) {
        alert("Please fill in all fields.");
        e.preventDefault();
        return;
      }
  
      // Check for valid email
      if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        e.preventDefault();
        return;
      }
  
      // All good
      alert("Message sent successfully!");
    });
  });  

// Function to show the alert when the button is hovered over
$(document).ready(function () {
    $("#comingSoonButton").on("mouseenter", function() {
        alert("This Pack comes out on July 1st, 2025! You can use code: EARLYBIRD for 10% off our other products!");
    });
});
