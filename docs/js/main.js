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
                <div class="notice-card notice-type-update">
                    <div class="notice-header">
                        <div class="notice-title">
                            <i class="fas fa-bell"></i>
                            First Stable Release
                        </div>
                        <div class="notice-date">2024-03</div>
                    </div>
                    <div class="notice-message">
                        We are excited to announce the first stable release of AWSMGR v1.0.0! This release includes 
                        complete IAM user management capabilities including password management, S3 operations, 
                        and a refined user interface.
                    </div>
                </div>
                <div class="notice-card notice-type-info">
                    <div class="notice-header">
                        <div class="notice-title">
                            <i class="fas fa-info-circle"></i>
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
            
            // Fallback to hardcoded todos - remove the IAM user password management
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

    // Add this near your other page load functions

    async function loadScreenshots() {
        const screenshotsGrid = document.getElementById('screenshots-grid');
        if (!screenshotsGrid) return;

        try {
            console.log('Attempting to fetch assets.json...');
            const response = await fetch('data/assets.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log('Screenshot data received, parsing JSON...');
            const data = await response.json();
            
            // Remove loading spinner
            screenshotsGrid.innerHTML = '';
            
            // Render screenshots
            renderScreenshots(data.screenshots);
            
            // Set up full screen preview (keep this functionality)
            setupFullscreenPreview();
        } catch (error) {
            console.warn('Error loading screenshots:', error);
            
            // Create fallback screenshots
            const fallbackScreenshots = [
                {
                    id: 1,
                    title: "Main Menu",
                    description: "AWS CLI Manager main interface showing available services",
                    image: "assets/main_menu.png",
                    category: "interface"
                },
                {
                    id: 2,
                    title: "IAM Users List",
                    description: "View and manage all IAM users in your AWS account",
                    image: "assets/list_iam_users.png",
                    category: "iam"
                },
                {
                    id: 3,
                    title: "IAM Groups List",
                    description: "Manage IAM groups and their associated permissions",
                    image: "assets/list_iam_groups.png",
                    category: "iam"
                },
                {
                    id: 4,
                    title: "S3 Menu",
                    description: "S3 bucket management options for creating, listing and managing storage",
                    image: "assets/s3_menu.png",
                    category: "s3"
                }
            ];
            
            screenshotsGrid.innerHTML = ''; // Clear error
            renderScreenshots(fallbackScreenshots);
            setupFullscreenPreview();
            
            console.log('Using fallback screenshot data');
        }
    }

    function renderScreenshots(screenshots) {
        const screenshotsGrid = document.getElementById('screenshots-grid');
        screenshotsGrid.innerHTML = '';
        
        // Sort images to show main menu first, then by category
        const sortedScreenshots = [...screenshots].sort((a, b) => {
            // Main menu should always come first
            if (a.title.includes("Main Menu")) return -1;
            if (b.title.includes("Main Menu")) return 1;
            
            // Then sort by category
            if (a.category < b.category) return -1;
            if (a.category > b.category) return 1;
            return 0;
        });
        
        // Start loading main menu immediately (preload)
        if (sortedScreenshots.length > 0) {
            const mainMenuImg = new Image();
            mainMenuImg.src = sortedScreenshots[0].image;
        }
        
        sortedScreenshots.forEach((screenshot, index) => {
            const card = document.createElement('div');
            card.className = `screenshot-card category-${screenshot.category}`;
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Create image container
            const imgContainer = document.createElement('div');
            imgContainer.className = 'screenshot-img-container';
            
            // Create image with improved loading
            const img = document.createElement('img');
            img.alt = screenshot.title;
            img.loading = index === 0 ? 'eager' : 'lazy';
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            img.src = screenshot.image;
            
            // Show image when loaded
            img.onload = function() {
                img.style.opacity = '1';
            };
            
            // Add the category badge and zoom overlay
            const badge = document.createElement('span');
            badge.className = 'category-badge';
            badge.textContent = screenshot.category;
            
            const overlay = document.createElement('div');
            overlay.className = 'zoom-overlay';
            overlay.innerHTML = '<i class="fas fa-search-plus"></i>';
            
            // Add click handler to show preview
            imgContainer.addEventListener('click', () => {
                showFullscreenPreview(screenshot);
            });
            
            // Assemble the image container
            imgContainer.appendChild(img);
            imgContainer.appendChild(badge);
            imgContainer.appendChild(overlay);
            
            // Create the content section
            const content = document.createElement('div');
            content.className = 'screenshot-content';
            content.innerHTML = `
                <h3 class="screenshot-title">${screenshot.title}</h3>
                <p class="screenshot-description">${screenshot.description}</p>
            `;
            
            // Assemble the card
            card.appendChild(imgContainer);
            card.appendChild(content);
            screenshotsGrid.appendChild(card);
        });
        
        // Add click-to-zoom hint
        const hintElement = document.createElement('div');
        hintElement.className = 'zoom-hint';
        hintElement.innerHTML = '<i class="fas fa-search-plus"></i> Click any screenshot to enlarge';
        screenshotsGrid.parentNode.insertBefore(hintElement, screenshotsGrid.nextSibling);
    }

    // Create a dedicated function for showing the fullscreen preview
    function showFullscreenPreview(screenshot) {
        // Get or create fullscreen preview container
        let preview = document.querySelector('.fullscreen-preview');
        
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'fullscreen-preview';
            preview.innerHTML = `
                <button class="close-preview"><i class="fas fa-times"></i></button>
                <img class="fullscreen-image" src="" alt="">
                <div class="image-caption"></div>
            `;
            document.body.appendChild(preview);
            
            // Close on button click
            preview.querySelector('.close-preview').addEventListener('click', () => {
                preview.classList.remove('active');
                document.body.style.overflow = ''; // Restore scrolling
            });
            
            // Close on background click
            preview.addEventListener('click', (e) => {
                if (e.target === preview) {
                    preview.classList.remove('active');
                    document.body.style.overflow = ''; // Restore scrolling
                }
            });
            
            // Close on ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && preview.classList.contains('active')) {
                    preview.classList.remove('active');
                    document.body.style.overflow = ''; // Restore scrolling
                }
            });
        }
        
        // Show loading indicator
        preview.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling while preview is open
        
        const previewImage = preview.querySelector('.fullscreen-image');
        const imageCaption = preview.querySelector('.image-caption');
        
        // Clear previous image and set caption
        previewImage.style.opacity = '0';
        previewImage.src = '';
        imageCaption.innerHTML = `<strong>${screenshot.title}</strong><br>${screenshot.description}`;
        
        // Load the image
        const img = new Image();
        img.onload = function() {
            // Once image is loaded, show it
            previewImage.src = screenshot.image;
            setTimeout(() => {
                previewImage.style.opacity = '1';
            }, 50);
        };
        img.src = screenshot.image;
    }

    // Update the setupFullscreenPreview function
    function setupFullscreenPreview() {
        // Add click event to all screenshot images
        const screenshotCards = document.querySelectorAll('.screenshot-card');
        
        screenshotCards.forEach(card => {
            const img = card.querySelector('img');
            const title = card.querySelector('.screenshot-title').textContent;
            const description = card.querySelector('.screenshot-description').textContent;
            const image = img.src;
            
            // Create screenshot object
            const screenshot = {
                title: title,
                description: description,
                image: image,
                category: card.className.includes('interface') ? 'interface' : 
                        card.className.includes('iam') ? 'iam' : 
                        card.className.includes('s3') ? 's3' : 'other'
            };
            
            // Add click event to the image container
            card.querySelector('.screenshot-img-container').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering card click
                showFullscreenPreview(screenshot);
            });
        });
    }

    // Add this to your existing page load functions
    loadScreenshots();
}); 