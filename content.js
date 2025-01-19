const completedBackgroundColor = "#FFFFCC";

class ProgressIndicatorBuilder {
    constructor() {
        this.container = null;
        this.list = null;
    }

    // Step 1: Build the container
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'progress-indicator';
        
        // Updated styles for sidebar
        Object.assign(this.container.style, {
            position: 'fixed',
            right: '0',
            top: '0',
            height: '100vh',
            width: '300px',
            backgroundColor: '#f9f9f9',
            borderLeft: '1px solid #ccc',
            padding: '20px',
            boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.1)',
            overflowY: 'auto',
            zIndex: '1000'
        });

        // Add header
        const header = document.createElement('h3');
        header.textContent = 'Completed Books';
        Object.assign(header.style, {
            margin: '0 0 20px',
            fontWeight: 'bold',
            borderBottom: '2px solid #333',
            paddingBottom: '10px'
        });
        
        // Add collapse button
        const collapseButton = document.createElement('button');
        collapseButton.textContent = '>';
        Object.assign(collapseButton.style, {
            position: 'absolute',
            left: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#f9f9f9',
            border: '1px solid #ccc',
            borderRight: 'none',
            padding: '10px 5px',
            cursor: 'pointer',
            borderRadius: '5px 0 0 5px'
        });

        let isCollapsed = false;
        collapseButton.addEventListener('click', () => {
            if (isCollapsed) {
                this.container.style.transform = 'translateX(0)';
                collapseButton.textContent = '>';
            } else {
                this.container.style.transform = 'translateX(300px)';
                collapseButton.textContent = '<';
            }
            isCollapsed = !isCollapsed;
        });

        this.container.appendChild(collapseButton);
        this.container.appendChild(header);
        return this;
    }

    // Step 2: Build the list
    createList() {
        this.list = document.createElement('ul');
        this.list.id = 'completed-books-list';
        Object.assign(this.list.style, {
            listStyleType: 'none',
            padding: '0',
            margin: '0'
        });
        this.container.appendChild(this.list);
        return this;
    }

    // Step 3: Attach the container to the DOM
    attachToDOM() {
        // Adjust main content to make room for sidebar
        const mainContent = document.body;
        mainContent.style.marginRight = '300px';
        
        document.body.appendChild(this.container);
        return this;
    }

    // Step 4: Update the progress list dynamically
    updateProgress(completedBooks) {
        if (!this.list) return;

        this.list.innerHTML = '';

        if (completedBooks.length === 0) {
            const noBooksMessage = document.createElement('li');
            noBooksMessage.textContent = 'No books completed yet.';
            Object.assign(noBooksMessage.style, {
                padding: '10px',
                borderBottom: '1px solid #ddd',
                color: '#666'
            });
            this.list.appendChild(noBooksMessage);
            return;
        }

        completedBooks.forEach((bookTitle) => {
            const bookItem = document.createElement('li');
            bookItem.textContent = bookTitle;
            Object.assign(bookItem.style, {
                padding: '10px',
                borderBottom: '1px solid #ddd',
                transition: 'background-color 0.2s'
            });
            
            // Add hover effect
            bookItem.addEventListener('mouseover', () => {
                bookItem.style.backgroundColor = '#eee';
            });
            bookItem.addEventListener('mouseout', () => {
                bookItem.style.backgroundColor = 'transparent';
            });
            
            this.list.appendChild(bookItem);
        });
    }
}

// Add this function to check if we're on the search page
function isSearchPage() {
    return window.location.href.includes('/search/');
}

// Add global variable for the progress indicator
let progressIndicatorBuilder = null;

// Modified addMarkCompleteButtons with performance improvements
function addMarkCompleteButtons() {
    // Only proceed if we're on a search page
    if (!isSearchPage()) return;
    
    const processedAttribute = 'data-processed';
    
    getCompletedBooks(function (completedBooks) {
        const audiobookElements = getAudiobookElements();
        
        audiobookElements.forEach((element) => {
            // Skip already processed elements
            if (element.hasAttribute(processedAttribute)) {
                return;
            }
            element.setAttribute(processedAttribute, 'true');
            
            const bookTitle = element.textContent;
            const parentArticle = element.closest('article');
            let state = completedBooks.includes(bookTitle) ? 'completed' : 'incomplete';

            // Create buttons only once
            const markCompleteButton = createButton("Mark Complete");
            const removeCompleteButton = createButton("Remove Complete");
            
            // Add click handlers
            markCompleteButton.addEventListener('click', () => {
                if (state === 'incomplete') {
                    addCompletedBook(bookTitle);
                    state = 'completed';
                    updateVisualState('completed');
                    getCompletedBooks((updatedBooks) => {
                        if (progressIndicatorBuilder) {
                            progressIndicatorBuilder.updateProgress(updatedBooks);
                        }
                    });
                }
            });

            removeCompleteButton.addEventListener('click', () => {
                if (state === 'completed') {
                    removeCompletedBook(bookTitle);
                    state = 'incomplete';
                    updateVisualState('incomplete');
                    getCompletedBooks((updatedBooks) => {
                        if (progressIndicatorBuilder) {
                            progressIndicatorBuilder.updateProgress(updatedBooks);
                        }
                    });
                }
            });

            // Function to update the visual UI based on the current state
            function updateVisualState(newState) {
                if (newState === 'completed') {
                    element.style.color = completedBackgroundColor;
                    parentArticle.style.backgroundColor = completedBackgroundColor;
                    markCompleteButton.disabled = true;
                    removeCompleteButton.disabled = false;
                } else if (newState === 'incomplete') {
                    element.style.color = '';
                    parentArticle.style.backgroundColor = '';
                    markCompleteButton.disabled = false;
                    removeCompleteButton.disabled = true;
                }
            }

            // Append buttons and set initial state
            element.parentNode.appendChild(markCompleteButton);
            element.parentNode.appendChild(removeCompleteButton);
            updateVisualState(state);
        });
    });
}

// Debounced mutation observer callback
const debouncedCallback = debounce((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            addMarkCompleteButtons();
        }
    }
}, 250);  // 250ms debounce time

// Use the debounced callback in the observer
const observer = new MutationObserver(debouncedCallback);

// Initialize everything when the page loads
if (isSearchPage()) {
    // Initialize progress indicator
    progressIndicatorBuilder = new ProgressIndicatorBuilder();
    progressIndicatorBuilder
        .createContainer()
        .createList()
        .attachToDOM();

    // Update the progress indicator initially
    getCompletedBooks((completedBooks) => {
        progressIndicatorBuilder.updateProgress(completedBooks);
    });

    // Start observing the target node for configured mutations
    const targetNode = document.getElementById('main');
    if (targetNode) {
        const config = {childList: true, subtree: true};
        observer.observe(targetNode, config);
    }
    
    // Initial call to add buttons
    addMarkCompleteButtons();
}

// Add event listener for URL changes (for single-page applications)
let lastUrl = location.href; 
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        if (isSearchPage()) {
            addMarkCompleteButtons();
        }
    }
}).observe(document, {subtree: true, childList: true});

// Add debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize book element filtering
function getAudiobookElements() {
    const selector = 'a.MuiTypography-root.MuiTypography-link.css-wo4lto';
    return Array.from(document.querySelectorAll(selector))
        .filter(el => {
            return el.children.length === 0 &&
                   el.childNodes.length === 1 &&
                   el.childNodes[0].nodeType === Node.TEXT_NODE &&
                   el.parentElement?.tagName === 'H3' &&
                   el.parentElement?.classList.contains('MuiTypography-root') &&
                   el.parentElement?.classList.contains('MuiTypography-h3') &&
                   el.parentElement?.classList.contains('css-pc8fuj') &&
                   el.parentElement?.children.length === 1;
        });
}

// Optimize button creation
function createButton(text, marginLeft = '10px') {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.marginLeft = marginLeft;
    return button;
}
