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
        this.container.style.border = '1px solid #ccc';
        this.container.style.padding = '10px';
        this.container.style.marginTop = '20px';
        this.container.style.backgroundColor = '#f9f9f9';
        this.container.style.borderRadius = '5px';
        this.container.style.boxShadow = '0px 2px 5px rgba(0, 0, 0, 0.1)';
        this.container.style.maxWidth = '300px';
        this.container.style.margin = '0 auto';
        this.container.innerHTML = `<h3 style="margin: 0 0 10px; font-weight: bold;">Progress Indicator</h3>`;
        return this;
    }

    // Step 2: Build the list
    createList() {
        this.list = document.createElement('ul');
        this.list.id = 'completed-books-list';
        this.list.style.listStyleType = 'none';
        this.list.style.padding = '0';
        this.list.style.margin = '0';
        this.container.appendChild(this.list);
        return this;
    }

    // Step 3: Attach the container to the DOM
    attachToDOM() {
        document.body.appendChild(this.container);
        return this;
    }

    // Step 4: Update the progress list dynamically
    updateProgress(completedBooks) {
        if (!this.list) return;

        this.list.innerHTML = ''; // Clear existing list

        if (completedBooks.length === 0) {
            const noBooksMessage = document.createElement('li');
            noBooksMessage.textContent = 'No books completed yet.';
            noBooksMessage.style.borderBottom = '1px solid #ddd';
            noBooksMessage.style.padding = '5px 0';
            this.list.appendChild(noBooksMessage);
            return;
        }

        // Populate the list with completed books
        completedBooks.forEach((bookTitle) => {
            const bookItem = document.createElement('li');
            bookItem.textContent = bookTitle;
            bookItem.style.borderBottom = '1px solid #ddd';
            bookItem.style.padding = '5px 0';
            this.list.appendChild(bookItem);
        });
    }
}

// Initial setup with the Builder Pattern
const progressIndicatorBuilder = new ProgressIndicatorBuilder();
progressIndicatorBuilder
    .createContainer()
    .createList()
    .attachToDOM();

// Example: Update the progress indicator
getCompletedBooks((completedBooks) => {
    progressIndicatorBuilder.updateProgress(completedBooks); // Update the list initially
});

function addMarkCompleteButtons() {
    getCompletedBooks(function (completedBooks) {
        const audiobookElements = Array.from(document.querySelectorAll('a.MuiTypography-root.MuiTypography-link.css-wo4lto'))
            .filter(el => {
                if (el.children.length > 0) {
                    return false;
                }
                if (el.childNodes.length !== 1 || el.childNodes[0].nodeType !== Node.TEXT_NODE) {
                    return false;
                }
                const parent = el.parentElement;
                if (!parent || parent.tagName !== 'H3' || !parent.classList.contains('MuiTypography-root') || !parent.classList.contains('MuiTypography-h3') || !parent.classList.contains('css-pc8fuj')) {
                    return false;
                }
                if (parent.children.length !== 1) {
                    return false;
                }
                return true;
            });

        audiobookElements.forEach((element) => {
            const bookTitle = element.textContent;
            const parentArticle = element.closest('article');

            // Define the initial state based on whether the book is already completed
            let state = completedBooks.includes(bookTitle) ? 'completed' : 'incomplete';

            // Transitions handle only behavioral changes
            const transitions = {
                'incomplete': {
                    markComplete: () => {
                        addCompletedBook(bookTitle); // Save to storage
                        state = 'completed'; // Update the state
                        updateVisualState('completed');
                        progressIndicatorBuilder.updateProgress(completedBooks);// Trigger visual state update
                    },
                },
                'completed': {
                    removeComplete: () => {
                        removeCompletedBook(bookTitle); // Remove from storage
                        state = 'incomplete'; // Update the state
                        updateVisualState('incomplete');
                        progressIndicatorBuilder.updateProgress(completedBooks);// Trigger visual state update
                    },
                },
            };

            // Function to update the visual UI based on the current state
            function updateVisualState(newState) {
                if (newState === 'completed') {
                    element.style.color = completedBackgroundColor; // Indicate book is completed
                    parentArticle.style.backgroundColor = completedBackgroundColor;
                    markCompleteButton.disabled = true;
                    removeCompleteButton.disabled = false;
                } else if (newState === 'incomplete') {
                    element.style.color = ''; // Revert to default
                    parentArticle.style.backgroundColor = '';
                    markCompleteButton.disabled = false;
                    removeCompleteButton.disabled = true;
                }
            }

            // Create buttons
            const markCompleteButton = document.createElement('button');
            markCompleteButton.textContent = "Mark Complete";
            markCompleteButton.style.marginLeft = '10px';
            markCompleteButton.addEventListener('click', () => {
                transitions[state]?.markComplete?.();
            });

            const removeCompleteButton = document.createElement('button');
            removeCompleteButton.textContent = "Remove Complete";
            removeCompleteButton.style.marginLeft = '10px';
            removeCompleteButton.addEventListener('click', () => {
                transitions[state]?.removeComplete?.();
            });

            // Append buttons and set the initial visual state
            element.parentNode.appendChild(markCompleteButton);
            element.parentNode.appendChild(removeCompleteButton);
            updateVisualState(state); // Initialize the UI visuals based on the current state
        });
    });
}

const targetNode = document.getElementById('main');
const config = {childList: true, subtree: true};

// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // New elements added - call the function to add buttons
            addMarkCompleteButtons();
        }
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);
