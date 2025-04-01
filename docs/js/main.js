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
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-menu') && !e.target.closest('.nav-links')) {
            navLinks.classList.remove('active');
        }
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
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
            const response = await fetch('data/features.json');
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

    // Function to load and render notices
    async function loadNotices() {
        const noticeContainer = document.getElementById('notice-container');
        if (!noticeContainer) return;

        try {
            const response = await fetch('data/noticeboard.json');
            const data = await response.json();
            renderNotices(data.notices);
        } catch (error) {
            console.warn('Error loading notices:', error);
            noticeContainer.innerHTML = `
                <div class="notice-card notice-type-info">
                    <div class="notice-header">
                        <div class="notice-title">
                            <i class="fas fa-info-circle"></i>
                            Beta Status
                        </div>
                        <div class="notice-date">2024-03</div>
                    </div>
                    <div class="notice-message">
                        As this project is in beta stage, continuous fixes are being made and some bugs might be present.
                        Please report any issues on GitHub.
                    </div>
                </div>
                <div class="notice-card notice-type-update">
                    <div class="notice-header">
                        <div class="notice-title">
                            <i class="fas fa-bell"></i>
                            Platform Support
                        </div>
                        <div class="notice-date">2024-03</div>
                    </div>
                    <div class="notice-message">
                        Currently available for Linux. Windows support coming soon!
                    </div>
                </div>
            `;
        }
    }

    function renderNotices(notices) {
        const noticeContainer = document.getElementById('notice-container');
        noticeContainer.innerHTML = '';

        notices.forEach((notice, index) => {
            const noticeCard = document.createElement('div');
            noticeCard.className = `notice-card notice-type-${notice.type}`;
            noticeCard.style.animationDelay = `${index * 0.1}s`;

            // Get the icon based on notice type
            const iconClass = notice.type === 'info' ? 'info-circle' : 
                              notice.type === 'update' ? 'bell' : 
                              notice.type === 'warning' ? 'exclamation-triangle' : 'info-circle';

            noticeCard.innerHTML = `
                <div class="notice-header">
                    <div class="notice-title">
                        <i class="fas fa-${iconClass}"></i>
                        ${notice.title}
                    </div>
                    <div class="notice-date">${notice.date}</div>
                </div>
                <div class="notice-message">${notice.message}</div>
            `;

            noticeContainer.appendChild(noticeCard);
        });
    }

    // Add this function after loadNotices()
    async function loadTodos() {
        const todoContainer = document.getElementById('todo-container');
        if (!todoContainer) return;

        try {
            // Add logging to see if the fetch is being attempted
            console.log('Attempting to fetch todo.json...');
            const response = await fetch('data/todo.json');
            
            // Check if the response is OK
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log('Todo data received, parsing JSON...');
            const data = await response.json();
            console.log('Todo data parsed:', data);
            renderTodos(data.todos);
        } catch (error) {
            console.warn('Error loading todos:', error);
            
            // Display a more helpful error message
            todoContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load roadmap items</p>
                    <small>Error details: ${error.message}</small>
                </div>
            `;
            
            // Fallback to hardcoded todos if fetch fails
            const fallbackTodos = [
                {
                    task: "Improve design",
                    status: "in-progress",
                    priority: "high"
                },
                {
                    task: "Add EC2 support",
                    status: "planned",
                    priority: "high"
                },
                {
                    task: "Add user policy support",
                    status: "planned",
                    priority: "medium"
                },
                {
                    task: "Add IAM user password management",
                    status: "planned",
                    priority: "medium"
                }
            ];
            
            // After a short delay, render the fallback todos
            setTimeout(() => {
                console.log('Using fallback todo data');
                renderTodos(fallbackTodos);
            }, 1000);
        }
    }

    function renderTodos(todos) {
        const todoContainer = document.getElementById('todo-container');
        todoContainer.innerHTML = '';

        todos.forEach((todo, index) => {
            const todoItem = document.createElement('div');
            todoItem.className = `todo-item priority-${todo.priority}`;
            todoItem.style.animationDelay = `${index * 0.1}s`;

            todoItem.innerHTML = `
                <div class="todo-task">
                    <i class="fas fa-${todo.status === 'in-progress' ? 'spinner fa-spin' : 'tasks'}"></i>
                    ${todo.task}
                </div>
                <span class="todo-status status-${todo.status}">
                    ${todo.status.replace('-', ' ')}
                </span>
            `;

            todoContainer.appendChild(todoItem);
        });
    }

    // Load features
    loadFeatures();
    loadNotices();
    loadTodos();
}); 