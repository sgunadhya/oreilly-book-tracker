// Add caching mechanism
let cachedCompletedBooks = null;

// Function to get completed books from storage with caching
function getCompletedBooks(callback) {
    if (cachedCompletedBooks !== null) {
        callback(cachedCompletedBooks);
        return;
    }
    
    chrome.storage.local.get(['completedBooks'], function (result) {
        cachedCompletedBooks = result.completedBooks || [];
        callback(cachedCompletedBooks);
    });
}

// Function to add a completed book to storage
function addCompletedBook(bookTitle) {
    getCompletedBooks(function (completedBooks) {
        if (!completedBooks.includes(bookTitle)) {  // Prevent duplicates
            completedBooks.push(bookTitle);
            cachedCompletedBooks = completedBooks;
            chrome.storage.local.set({'completedBooks': completedBooks});
        }
    });
}

// Function to remove a completed book from storage
function removeCompletedBook(bookTitle) {
    getCompletedBooks(function (completedBooks) {
        const updatedBooks = completedBooks.filter(book => book !== bookTitle);
        cachedCompletedBooks = updatedBooks;
        chrome.storage.local.set({'completedBooks': updatedBooks});
    });
}

// ... (other storage functions as needed)