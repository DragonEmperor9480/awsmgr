document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Function to set theme with animation
    function setTheme(isDark) {
        // Add transition to all elements that need smooth color changes
        document.body.style.transition = 'var(--theme-transition)';
        document.querySelectorAll('section, .navbar, .footer, .feature-card, .doc-card').forEach(element => {
            element.style.transition = 'var(--theme-transition)';
        });

        // Set theme
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeToggle.checked = isDark;
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Remove transition after animation completes
        setTimeout(() => {
            document.body.style.transition = '';
            document.querySelectorAll('section, .navbar, .footer, .feature-card, .doc-card').forEach(element => {
                element.style.transition = '';
            });
        }, 300);
    }
    
    // Set initial theme based on saved preference or system preference
    if (localStorage.getItem('theme')) {
        setTheme(localStorage.getItem('theme') === 'dark');
    } else {
        setTheme(prefersDarkScheme.matches);
    }
    
    // Listen for theme toggle changes
    themeToggle.addEventListener('change', () => {
        setTheme(themeToggle.checked);
    });
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches);
        }
    });

    // Mobile menu toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenu.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    // Copy to clipboard functionality
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', () => {
            const codeBlock = button.parentElement.querySelector('code');
            navigator.clipboard.writeText(codeBlock.textContent.trim());
            
            // Visual feedback
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                button.innerHTML = '<i class="far fa-copy"></i>';
            }, 2000);
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Scroll reveal animation
    function reveal() {
        const reveals = document.querySelectorAll('.reveal');
        
        reveals.forEach(element => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', reveal);
    reveal(); // Initial check

    // Add reveal class to sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('reveal');
    });

    // Function to load and render features
    async function loadFeatures() {
        const fallbackFeatures = {
            features: [
                {
                    icon: "fa-user-shield",
                    title: "IAM Management",
                    description: "Easily manage IAM users, groups, and permissions through an intuitive interface."
                },
                {
                    icon: "fa-server",
                    title: "EC2 Control",
                    description: "Monitor and manage EC2 instances with simple commands (Coming Soon)."
                },
                {
                    icon: "fa-database",
                    title: "S3 Operations",
                    description: "Create, list, and manage S3 buckets effortlessly."
                },
                {
                    icon: "fa-terminal",
                    title: "CLI Interface",
                    description: "Beautiful terminal UI with intuitive navigation and clear feedback."
                }
            ]
        };

        const featureGrid = document.getElementById('feature-grid');
        if (!featureGrid) {
            console.error('Feature grid element not found');
            return;
        }

        try {
            // Try to fetch features from JSON file
            const response = await fetch('/pages/data/features.json');
            const data = await response.json();
            renderFeatures(data.features);
        } catch (error) {
            console.warn('Falling back to default features:', error);
            renderFeatures(fallbackFeatures.features);
        }
    }

    // Separate function to render features
    function renderFeatures(features) {
        const featureGrid = document.getElementById('feature-grid');
        featureGrid.innerHTML = '';
        
        features.forEach((feature, index) => {
            const featureCard = document.createElement('div');
            featureCard.className = 'feature-card';
            featureCard.style.animationDelay = `${index * 0.1}s`;
            
            featureCard.innerHTML = `
                <div class="feature-content">
                    <i class="fas ${feature.icon}"></i>
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
            `;
            
            featureGrid.appendChild(featureCard);
        });
    }

    // Load features
    loadFeatures();
}); 