// Function to get completed books from storage
function getCompletedBooks(callback) {
    chrome.storage.local.get(['completedBooks'], function (result) {
        callback(result.completedBooks || []);
    });
}

// Function to add a completed book to storage
function addCompletedBook(bookTitle) {
    getCompletedBooks(function (completedBooks) {
        completedBooks.push(bookTitle);
        chrome.storage.local.set({'completedBooks': completedBooks});
    });
}

// ... (other storage functions as needed)
// Function to remove a completed book from storage
function removeCompletedBook(bookTitle) {
    getCompletedBooks(function (completedBooks) {
        const updatedBooks = completedBooks.filter(book => book !== bookTitle);
        chrome.storage.local.set({'completedBooks': updatedBooks});
    });
}