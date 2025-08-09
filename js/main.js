// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navbar = document.querySelector('.navbar');
    
    if (mobileMenuToggle && navbar) {
        mobileMenuToggle.addEventListener('click', function() {
            navbar.classList.toggle('active');
            
            // Change icon based on menu state
            const icon = this.querySelector('i');
            if (navbar.classList.contains('active')) {
                icon.className = 'ri-close-line';
            } else {
                icon.className = 'ri-menu-line';
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.navbar .nav-list a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbar.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.className = 'ri-menu-line';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navbar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                navbar.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.className = 'ri-menu-line';
            }
        });
    }
}); 