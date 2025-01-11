# O'Reilly Book Tracker



## Core Features
1. **Track Book Completion Status:**
    - Mark books as "Completed" to keep track of finished reading.
    - Remove the "Completed" status to mark books as "Incomplete."

2. **Dynamic Progress Indicator:**
    - Displays a list of completed books.
    - Automatically updates when books are marked as completed or removed from the completed list.

3. **Real-Time User Interface:**
    - Visual changes reflect in real-time when books are marked as complete or incomplete.
    - Supports dynamic styling like background color changes to distinguish completed and incomplete states.

4. **Efficient State Management:**
    - Separates logic for managing completed and incomplete states.
    - Modularized updates ensure clean and maintainable code.

      
## Use Cases
- Keep track of books you’ve completed over time.
- Monitor reading progress and get motivated by viewing the growing list of completed books.
- Use the application as a lightweight personal reading tracker without needing external tools.
## Installation

### Manual Installation

#### Chrome/Edge

1. Download or clone the repository.
2. Open your browser, go to `chrome://extensions/` or `edge://extensions/`.
3. Enable **Developer mode**.
4. Click on **Load unpacked** and select the extension's folder.

#### Firefox

1. Download or clone the repository.
2. Open Firefox and navigate to `about:debugging`.
3. Click on **This Firefox** in the sidebar.
4. Click **Load Temporary Add-on** and select the `manifest.json` file from the extension's folder.

## Usage

### 1. Setup
- Ensure you have a modern browser that supports JavaScript.
- Clone or download the project to your local machine:

```bash
git clone <repository_url>
cd <project_directory>
```

### 2. Running the Application
- Open the `index.html` file directly in your favorite browser (e.g., Google Chrome, Mozilla Firefox, etc.).
- No server setup is required as this project uses plain HTML, CSS, and JavaScript.

### 3. Marking a Book as Completed
1. Locate the form or input field where you can enter the name of the book.
2. Type the title of the book you’ve completed.
3. Click the **"Mark as Complete"** button.
4. The book will be added to the "Completed Books" list and the progress interface will update automatically.

### 4. Removing a Book from the Completed List
1. In the "Completed Books" section, find the book you want to remove.
2. Click the **"Remove"** button next to the book.
3. The book will be removed from the "Completed Books" list and the progress interface will update automatically.

### 5. Observing Progress Updates
- The "Progress Indicator" automatically updates each time you complete or remove a book:
    - If no books are completed, the indicator displays "No books completed yet."
    - Each completed book is listed dynamically in real-time.

### 6. Logs
- Completion or removal of a book is logged in the console for debugging or analytical purposes.
- Open the browser's developer tools (e.g., pressing `F12` or `Cmd + Option + J` on macOS) to view logs.


## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub if you'd like to contribute.

### Steps to Contribute

1. Fork the repository.
2. Create a new branch.
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request on the main repository.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For further inquiries or suggestions, please contact:

- Author: Sushant Srivastava

---