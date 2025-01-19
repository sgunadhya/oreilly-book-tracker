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

// Debounced mutation observer callback
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Optimize book element filtering
function getAudiobookElements() {
    // Simplified selector to match the exact structure
    return Array.from(document.querySelectorAll('article'))
        .filter(article => {
            const titleLink = article.querySelector('h3 a');
            return titleLink && 
                   titleLink.children.length === 0 && 
                   titleLink.textContent.trim().length > 0;
        })
        .map(article => ({
            element: article.querySelector('h3 a'),
            article: article
        }));
}

// Optimize button creation
function createButton(text, marginLeft = '10px') {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.marginLeft = marginLeft;
    return button;
}

// Observer Pattern Implementation
class Subject {
    constructor() {
        this.observers = new Set();
    }

    attach(observer) {
        this.observers.add(observer);
    }

    detach(observer) {
        this.observers.delete(observer);
    }

    notify(data) {
        this.observers.forEach(observer => observer.update(data));
    }
}

// Repository Pattern Implementation
class BookRepository {
    constructor() {
        this.listeners = new Set();
    }

    addListener(listener) {
        this.listeners.add(listener);
    }

    removeListener(listener) {
        this.listeners.delete(listener);
    }

    notifyListeners(books) {
        this.listeners.forEach(listener => listener(books));
    }

    async getCompletedBooks() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['completedBooks'], (result) => {
                resolve(result.completedBooks || []);
            });
        });
    }

    async addCompletedBook(bookTitle) {
        const completedBooks = await this.getCompletedBooks();
        if (!completedBooks.includes(bookTitle)) {
            const updatedBooks = [...completedBooks, bookTitle];
            await this.saveCompletedBooks(updatedBooks);
            return updatedBooks;
        }
        return completedBooks;
    }

    async removeCompletedBook(bookTitle) {
        const completedBooks = await this.getCompletedBooks();
        const updatedBooks = completedBooks.filter(book => book !== bookTitle);
        await this.saveCompletedBooks(updatedBooks);
        return updatedBooks;
    }

    async saveCompletedBooks(books) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ 'completedBooks': books }, () => {
                this.notifyListeners(books);
                resolve(books);
            });
        });
    }
}

// Update UIStateManager to properly handle state changes
class UIStateManager extends Subject {
    constructor(bookRepository) {
        super();
        this.completedBooks = new Set();
        this.bookRepository = bookRepository;
        
        // Initialize from repository
        this.bookRepository.getCompletedBooks().then(books => {
            this.updateCompletedBooks(books);
        });

        // Listen for repository changes
        this.bookRepository.addListener(books => {
            this.updateCompletedBooks(books);
        });
    }

    async updateCompletedBooks(books) {
        this.completedBooks = new Set(books);
        this.notify({
            type: 'BOOKS_UPDATED',
            books: Array.from(this.completedBooks)
        });
    }

    async addCompletedBook(bookTitle) {
        const updatedBooks = await this.bookRepository.addCompletedBook(bookTitle);
        await this.updateCompletedBooks(updatedBooks);
    }

    async removeCompletedBook(bookTitle) {
        const updatedBooks = await this.bookRepository.removeCompletedBook(bookTitle);
        await this.updateCompletedBooks(updatedBooks);
    }

    isBookCompleted(bookTitle) {
        return this.completedBooks.has(bookTitle);
    }
}

// Book State with Observer Pattern
class BookState {
    constructor(book, uiStateManager) {
        this.book = book;
        this.uiStateManager = uiStateManager;
    }

    enter() {}
    exit() {}
    markComplete() {}
    removeComplete() {}
}

// Modify Book States to handle async operations
class IncompleteState extends BookState {
    enter() {
        this.book.updateVisualState({
            elementColor: '',
            backgroundColor: '',
            markCompleteDisabled: false,
            removeCompleteDisabled: true
        });
    }

    exit() {
        // Clean up if needed
    }

    async markComplete() {
        await this.uiStateManager.addCompletedBook(this.book.title);
        this.book.setState(new CompleteState(this.book, this.uiStateManager));
    }

    async removeComplete() {
        // Already incomplete, do nothing
    }
}

class CompleteState extends BookState {
    enter() {
        this.book.updateVisualState({
            elementColor: '#006400',  // Dark green for completed
            backgroundColor: '#FFFFCC', // Light yellow background
            markCompleteDisabled: true,
            removeCompleteDisabled: false
        });
    }

    exit() {
        this.book.updateVisualState({
            elementColor: '',
            backgroundColor: '',
            markCompleteDisabled: false,
            removeCompleteDisabled: true
        });
    }

    async markComplete() {
        // Already complete, do nothing
    }

    async removeComplete() {
        await this.uiStateManager.removeCompletedBook(this.book.title);
        this.book.setState(new IncompleteState(this.book, this.uiStateManager));
    }
}

// Book Model as Observer
class Book {
    constructor(element, parentArticle, title, buttons, uiStateManager) {
        this.element = element;
        this.parentArticle = parentArticle;
        this.title = title;
        this.buttons = buttons;
        this.uiStateManager = uiStateManager;
        this.state = null;
        this.view = null;
    }

    setButtons(buttons) {
        this.buttons = buttons;
    }

    setState(state) {
        if (this.state) {
            this.state.exit();
        }
        this.state = state;
        this.state.enter();
    }

    updateVisualState(stateData) {
        if (this.view) {
            this.view.updateState(stateData);
        }
    }

    async markComplete() {
        await this.state.markComplete();
    }

    async removeComplete() {
        await this.state.removeComplete();
    }
}

// View Components
class View {
    createElement(tag, attributes = {}, styles = {}) {
        const element = document.createElement(tag);
        Object.assign(element, attributes);
        Object.assign(element.style, styles);
        return element;
    }
}

class BookListView extends View {
    constructor(uiStateManager) {
        super();
        this.container = null;
        this.list = null;
        this.init();
        uiStateManager.attach(this);
    }

    init() {
        this.createContainer();
        this.createList();
        this.attachToDOM();
    }

    createContainer() {
        this.container = this.createElement('div', 
            { id: 'progress-indicator' },
            {
                position: 'fixed',
                right: '0',
                top: '0',
                height: '100vh',
                width: '300px',
                backgroundColor: 'white',  // Changed to white
                borderLeft: '1px solid #ccc',
                padding: '20px',
                boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.1)',
                overflowY: 'auto',
                zIndex: '1000'
            }
        );

        const header = this.createHeader();
        const collapseButton = this.createCollapseButton();

        this.container.appendChild(collapseButton);
        this.container.appendChild(header);
    }

    createHeader() {
        return this.createElement('h3',
            { textContent: 'Completed Books' },
            {
                margin: '0 0 20px',
                fontWeight: 'bold',
                borderBottom: '2px solid #333',
                paddingBottom: '10px'
            }
        );
    }

    createCollapseButton() {
        const button = this.createElement('button',
            { textContent: '>' },
            {
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
            }
        );

        let isCollapsed = false;
        button.addEventListener('click', () => this.handleCollapse(button, isCollapsed));
        return button;
    }

    handleCollapse(button, isCollapsed) {
        if (isCollapsed) {
            this.container.style.transform = 'translateX(0)';
            button.textContent = '>';
        } else {
            this.container.style.transform = 'translateX(300px)';
            button.textContent = '<';
        }
        isCollapsed = !isCollapsed;
    }

    createList() {
        this.list = this.createElement('table',  // Changed to table
            { id: 'completed-books-list' },
            {
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '10px'
            }
        );

        // Add table header
        const thead = this.createElement('thead', {}, {
            backgroundColor: '#f5f5f5'
        });
        const headerRow = this.createElement('tr');
        const headerCell = this.createElement('th', 
            { textContent: 'Book Title' },
            {
                padding: '10px',
                textAlign: 'left',
                borderBottom: '2px solid #ddd',
                fontWeight: 'bold'
            }
        );
        
        headerRow.appendChild(headerCell);
        thead.appendChild(headerRow);
        this.list.appendChild(thead);

        // Add table body
        const tbody = this.createElement('tbody');
        this.list.appendChild(tbody);
        
        this.container.appendChild(this.list);
    }

    attachToDOM() {
        document.body.style.marginRight = '300px';
        document.body.appendChild(this.container);
    }

    update(data) {
        if (['BOOKS_UPDATED', 'BOOK_COMPLETED', 'BOOK_UNCOMPLETED'].includes(data.type)) {
            this.updateBookList(data.books);
        }
    }

    updateBookList(books) {
        if (!this.list) return;
        
        const tbody = this.list.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (books.length === 0) {
            this.addEmptyMessage();
            return;
        }

        // Sort books alphabetically
        const sortedBooks = [...books].sort((a, b) => a.localeCompare(b));
        sortedBooks.forEach(book => this.addBookItem(book));
    }

    addEmptyMessage() {
        const tbody = this.list.querySelector('tbody');
        const row = this.createElement('tr');
        const cell = this.createElement('td',
            { textContent: 'No books completed yet.' },
            {
                padding: '12px 10px',
                textAlign: 'center',
                color: '#666',
                fontStyle: 'italic'
            }
        );
        
        row.appendChild(cell);
        tbody.appendChild(row);
    }

    addBookItem(bookTitle) {
        const tbody = this.list.querySelector('tbody');
        const row = this.createElement('tr', {}, {
            borderBottom: '1px solid #ddd'
        });
        
        const cell = this.createElement('td',
            { textContent: bookTitle },
            {
                padding: '12px 10px',
                fontSize: '14px'
            }
        );
        
        // Add hover effect
        row.addEventListener('mouseover', () => {
            row.style.backgroundColor = '#f8f8f8';
        });
        row.addEventListener('mouseout', () => {
            row.style.backgroundColor = 'transparent';
        });
        
        row.appendChild(cell);
        tbody.appendChild(row);
    }
}

class BookItemView extends View {
    constructor(book, handlers) {
        super();
        this.book = book;
        this.handlers = handlers;
        this.element = null;
        this.buttons = null;
    }

    render() {
        this.buttons = this.createButtons();
        this.attachButtons();
        
        // Set initial state based on completion status
        const isCompleted = this.book.uiStateManager.isBookCompleted(this.book.title);
        this.updateState({
            elementColor: isCompleted ? '#006400' : '',  // Dark green if completed
            backgroundColor: isCompleted ? '#FFFFCC' : '',  // Light yellow if completed
            markCompleteDisabled: isCompleted,  // Disable if completed
            removeCompleteDisabled: !isCompleted  // Enable only if completed
        });
        
        return this.buttons;
    }

    createButtons() {
        const markComplete = this.createElement('button', {
            textContent: 'Mark Complete',
            onclick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handlers.onMarkComplete(this.book);
            }
        }, {
            marginRight: '5px',
            padding: '5px 10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            transition: 'all 0.3s ease'  // Transition for all properties
        });

        const removeComplete = this.createElement('button', {
            textContent: 'Remove Complete',
            onclick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handlers.onRemoveComplete(this.book);
            }
        }, {
            padding: '5px 10px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            transition: 'all 0.3s ease'  // Transition for all properties
        });

        // Set initial states
        const isCompleted = this.book.uiStateManager.isBookCompleted(this.book.title);
        this.updateButtonState(markComplete, isCompleted);
        this.updateButtonState(removeComplete, !isCompleted);

        return { markComplete, removeComplete };
    }

    updateButtonState(button, disabled) {
        button.disabled = disabled;
        button.style.opacity = disabled ? '0.5' : '1';
        button.style.cursor = disabled ? 'not-allowed' : 'pointer';
        // Add a disabled background color
        button.style.backgroundColor = disabled ? 
            (button.textContent === 'Mark Complete' ? '#90EE90' : '#ffcccb') : 
            (button.textContent === 'Mark Complete' ? '#4CAF50' : '#f44336');
    }

    updateState({ elementColor, backgroundColor, markCompleteDisabled, removeCompleteDisabled }) {
        if (this.book.element) {
            this.book.element.style.color = elementColor;
        }
        if (this.book.parentArticle) {
            this.book.parentArticle.style.backgroundColor = backgroundColor;
            this.book.parentArticle.style.transition = 'background-color 0.3s ease';
        }
        if (this.buttons) {
            this.updateButtonState(this.buttons.markComplete, markCompleteDisabled);
            this.updateButtonState(this.buttons.removeComplete, removeCompleteDisabled);
        }
    }

    attachButtons() {
        const titleContainer = this.book.element.parentElement;
        if (!titleContainer) {
            console.error('Cannot attach buttons: title container not found');
            return;
        }

        // Create a container for the buttons
        const buttonContainer = this.createElement('div', {}, {
            display: 'inline-block',
            marginLeft: '10px'
        });

        buttonContainer.appendChild(this.buttons.markComplete);
        buttonContainer.appendChild(this.buttons.removeComplete);
        titleContainer.appendChild(buttonContainer);
    }
}

// Book Factory
class BookFactory {
    static create(element, article, uiStateManager) {
        const bookTitle = element.textContent.trim();
        
        // Create book instance
        const book = new Book(
            element,
            article,
            bookTitle,
            null,
            uiStateManager
        );

        // Create view with handlers
        const bookItemView = new BookItemView(book, {
            onMarkComplete: async (book) => {
                await book.markComplete();
            },
            onRemoveComplete: async (book) => {
                await book.removeComplete();
            }
        });

        // Initialize view and get buttons
        const buttons = bookItemView.render();
        book.setButtons(buttons);

        // Set initial state
        const initialState = uiStateManager.isBookCompleted(bookTitle)
            ? new CompleteState(book, uiStateManager)
            : new IncompleteState(book, uiStateManager);
        
        book.setState(initialState);
        book.view = bookItemView;
        
        return book;
    }
}

// Update BookController to properly handle observers
class BookController {
    constructor() {
        this.bookRepository = new BookRepository();
        this.uiStateManager = new UIStateManager(this.bookRepository);
        this.bookListView = null;
        this.processedAttribute = 'data-processed';
        this.books = new Map();
        this.observer = null;
        console.log('BookController constructed');
    }

    // Add getAudiobookElements method
    getAudiobookElements() {
        // Simplified selector to match the exact structure
        return Array.from(document.querySelectorAll('article'))
            .filter(article => {
                const titleLink = article.querySelector('h3 a');
                return titleLink && 
                       titleLink.children.length === 0 && 
                       titleLink.textContent.trim().length > 0;
            })
            .map(article => ({
                element: article.querySelector('h3 a'),
                article: article
            }));
    }

    async init() {
        if (isSearchPage()) {
            console.log('Initializing BookController on search page');
            this.bookListView = new BookListView(this.uiStateManager);
            this.setupMutationObserver();
            await this.initializeBooks();
            await this.processBooks();
        } else {
            console.log('Not on search page, skipping initialization');
        }
    }

    setupMutationObserver() {
        // Clean up existing observer if any
        if (this.observer) {
            this.observer.disconnect();
        }

        const targetNode = document.getElementById('main');
        if (targetNode) {
            console.log('Setting up mutation observer');
            this.observer = new MutationObserver(
                debounce(async (mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            console.log('DOM mutation detected, processing books');
                            await this.processBooks();
                        }
                    }
                }, 250)
            );
            this.observer.observe(targetNode, { childList: true, subtree: true });
            console.log('Mutation observer setup complete');
        } else {
            console.warn('Main element not found for mutation observer');
        }
    }

    async initializeBooks() {
        console.log('Initializing books');
        const completedBooks = await this.bookRepository.getCompletedBooks();
        await this.uiStateManager.updateCompletedBooks(completedBooks);
    }

    async processBooks() {
        if (!isSearchPage()) {
            console.log('Not on search page, skipping book processing');
            return;
        }

        console.log('Processing books');
        const audiobookElements = this.getAudiobookElements();
        
        if (audiobookElements.length === 0) {
            console.log('No audiobook elements found, retrying in 1 second...');
            setTimeout(() => this.processBooks(), 1000);
            return;
        }

        for (const element of audiobookElements) {
            await this.processBookElement(element);
        }
    }

    async processBookElement(elementData) {
        const { element, article } = elementData;
        
        if (element.hasAttribute(this.processedAttribute)) {
            return;
        }

        console.log('Processing book element:', element.textContent);
        element.setAttribute(this.processedAttribute, 'true');

        try {
            const book = BookFactory.create(element, article, this.uiStateManager);
            this.books.set(book.title, book);
            console.log('Book processed successfully:', book.title);
        } catch (error) {
            console.error('Error processing book:', error);
            element.removeAttribute(this.processedAttribute);
        }
    }
}

// Initialize with proper cleanup and immediate execution
function initializeWithRetry(maxRetries = 5, retryDelay = 1000) {
    let retryCount = 0;
    let currentController = null;

    function cleanup() {
        if (currentController && currentController.observer) {
            currentController.observer.disconnect();
        }
    }

    async function tryInit() {
        console.log(`Initialization attempt ${retryCount + 1}`);
        cleanup();
        
        if (!isSearchPage()) {
            console.log('Not on search page, waiting...');
            return;
        }

        currentController = new BookController();
        try {
            await currentController.init();
            console.log('Initialization successful');
            await currentController.processBooks();
        } catch (error) {
            console.error('Error in initialization:', error);
            retryCount++;
            if (retryCount < maxRetries) {
                console.log(`Retrying in ${retryDelay}ms...`);
                setTimeout(tryInit, retryDelay);
            }
        }
    }

    // Start immediately
    tryInit();
    
    return cleanup;
}

// Start initialization with cleanup handling
console.log('Starting application initialization');
let cleanup = initializeWithRetry();

// URL change detection with proper cleanup
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        console.log('URL changed from', lastUrl, 'to', url);
        lastUrl = url;
        cleanup();
        cleanup = initializeWithRetry();
    }
}).observe(document, {subtree: true, childList: true});

// Add immediate execution after a small delay to ensure DOM is ready
setTimeout(() => {
    console.log('Running delayed initialization check');
    if (isSearchPage() && !document.getElementById('progress-indicator')) {
        console.log('Progress indicator not found, reinitializing');
        cleanup();
        cleanup = initializeWithRetry();
    }
}, 1000);
