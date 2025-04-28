document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000'; // Assuming your backend runs on port 5000
    let currentToken = localStorage.getItem('authToken');
    let currentUserId = localStorage.getItem('userId');
    let selectedBookIsbn = null;

    // DOM Elements
    const registerUsernameInput = document.getElementById('register-username');
    const registerPasswordInput = document.getElementById('register-password');
    const registerButton = document.getElementById('register-button');
    const registerMessage = document.getElementById('register-message');

    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const loginButton = document.getElementById('login-button');
    const loginMessage = document.getElementById('login-message');
    const logoutButton = document.getElementById('logout-button');

    const searchInput = document.getElementById('search-input');
    const searchTypeSelect = document.getElementById('search-type');
    const searchButton = document.getElementById('search-button');
    const showAllButton = document.getElementById('show-all-button');

    const bookListUl = document.getElementById('book-list');
    const bookGrid = document.getElementById('book-grid');
    const reviewSection = document.getElementById('review-section');
    const reviewBookTitle = document.getElementById('review-book-title');
    const reviewsDisplay = document.getElementById('reviews-display');
    const addReviewForm = document.getElementById('add-review-form');
    const reviewTextInput = document.getElementById('review-text');
    const submitReviewButton = document.getElementById('submit-review-button');
    const deleteReviewButton = document.getElementById('delete-review-button');
    const reviewMessage = document.getElementById('review-message');

    // Modal Elements
    const registerModal = document.getElementById('register-modal');
    const loginModal = document.getElementById('login-modal');
    const showRegisterModalButton = document.getElementById('show-register-modal');
    const showLoginModalButton = document.getElementById('show-login-modal');
    const closeRegisterModalButton = document.getElementById('close-register-modal');
    const closeLoginModalButton = document.getElementById('close-login-modal');

    // --- Helper Functions ---
    const updateAuthUI = () => {
        if (currentToken) {
            // Hide modal trigger buttons when logged in
            showRegisterModalButton.style.display = 'none';
            showLoginModalButton.style.display = 'none';
            logoutButton.style.display = 'inline-block';
            // Optionally display username somewhere else, maybe near logout
            // loginMessage.textContent = `Logged in as ${localStorage.getItem('username') || 'user'}.`;
            if(selectedBookIsbn) addReviewForm.style.display = 'block'; // Show review form if logged in and book selected
        } else {
            // Show modal trigger buttons when logged out
            showRegisterModalButton.style.display = 'inline-block';
            showLoginModalButton.style.display = 'inline-block';
            logoutButton.style.display = 'none';
            // loginMessage.textContent = ''; // Clear any previous login messages
            addReviewForm.style.display = 'none'; // Hide review form if not logged in
            deleteReviewButton.style.display = 'none'; // Hide delete button if not logged in
            // Ensure modals are closed on logout
            registerModal.style.display = 'none';
            loginModal.style.display = 'none';
        }
    };

    const displayBooks = (books) => {
        // bookListUl.innerHTML = '';
        if (!Array.isArray(books)) {
            console.error('Expected an array of books, received:', books);
            if (bookGrid) bookGrid.innerHTML = '<div>Error loading books.</div>';
            return;
        }
        if (books.length === 0) {
            if (bookGrid) bookGrid.innerHTML = '<div>No books found.</div>';
            return;
        }
        if (bookGrid) bookGrid.innerHTML = '';
        books.forEach((book, index) => {
            const isbn = book.isbn || (index + 1);
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <div class="book-card-title">${book.title}</div>
                <div class="book-card-author">by ${book.author}</div>
                <div class="book-card-isbn">ISBN: ${isbn}</div>
                <button class="view-reviews-btn" data-isbn="${isbn}" data-title="${book.title}">View Reviews</button>
                <div class="book-card-reviews" id="reviews-for-${isbn}"></div>
            `;
            card.querySelector('.view-reviews-btn').addEventListener('click', (e) => {
                fetchReviews(isbn, book.title, card);
            });
            bookGrid.appendChild(card);
        });
    };

    const fetchReviews = async (isbn, title, cardEl) => {
        selectedBookIsbn = isbn;
        if (reviewTextInput) reviewTextInput.value = '';
        try {
            const response = await fetch(`${API_BASE_URL}/books/review/${isbn}`);
            if (!response.ok) throw new Error('Could not fetch reviews');
            const reviews = await response.json();
            displayReviews(reviews, title, cardEl);
        } catch (error) {
            if (cardEl) {
                const reviewsDiv = cardEl.querySelector('.book-card-reviews');
                reviewsDiv.innerHTML = '<div>Could not load reviews.</div>';
            }
            reviewsDisplay.innerHTML = '<p>Could not load reviews.</p>';
            reviewSection.style.display = 'block';
            reviewBookTitle.textContent = `Reviews for: ${title}`;
            addReviewForm.style.display = 'none';
        }
    };

    const displayReviews = (reviews, bookTitle, cardEl) => {
        if (cardEl) {
            const reviewsDiv = cardEl.querySelector('.book-card-reviews');
            reviewsDiv.innerHTML = '';
            if (Object.keys(reviews).length === 0) {
                reviewsDiv.innerHTML = '<div class="review">No reviews yet.</div>';
            } else {
                Object.entries(reviews).forEach(([userId, reviewData]) => {
                    const div = document.createElement('div');
                    div.className = 'review';
                    div.innerHTML = `<strong>${reviewData.username || 'User ' + userId}:</strong> ${reviewData.review}`;
                    reviewsDiv.appendChild(div);
                });
            }
            // Add review form for logged-in users
            if (currentToken && currentUserId) {
                const myReview = reviews[currentUserId];
                const formDiv = document.createElement('div');
                formDiv.className = 'review-form';
                formDiv.innerHTML = `
                    <textarea class="review-textarea" rows="2" placeholder="Write your review..."></textarea>
                    <button class="submit-review-btn">Submit Review</button>
                    <button class="delete-review-btn" style="display:${myReview ? 'inline-block' : 'none'};">Delete My Review</button>
                    <span class="review-message"></span>
                `;
                const textarea = formDiv.querySelector('.review-textarea');
                if (myReview) textarea.value = myReview.review;
                const submitBtn = formDiv.querySelector('.submit-review-btn');
                const deleteBtn = formDiv.querySelector('.delete-review-btn');
                const messageSpan = formDiv.querySelector('.review-message');
                submitBtn.onclick = async () => {
                    const reviewText = textarea.value.trim();
                    if (!reviewText) {
                        messageSpan.textContent = 'Review cannot be empty.';
                        return;
                    }
                    try {
                        const response = await fetch(`${API_BASE_URL}/books/auth/review/${selectedBookIsbn || cardEl.querySelector('.view-reviews-btn').dataset.isbn}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${currentToken}`
                            },
                            body: JSON.stringify({ review: reviewText })
                        });
                        if (!response.ok) throw new Error('Failed to submit review');
                        messageSpan.textContent = 'Review submitted!';
                        fetchReviews(selectedBookIsbn || cardEl.querySelector('.view-reviews-btn').dataset.isbn, bookTitle, cardEl);
                    } catch (error) {
                        messageSpan.textContent = 'Error submitting review.';
                    }
                };
                deleteBtn.onclick = async () => {
                    if (!confirm('Are you sure you want to delete your review for this book?')) return;
                    try {
                        const response = await fetch(`${API_BASE_URL}/books/auth/review/${selectedBookIsbn || cardEl.querySelector('.view-reviews-btn').dataset.isbn}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${currentToken}`
                            }
                        });
                        if (!response.ok) throw new Error('Failed to delete review');
                        messageSpan.textContent = 'Review deleted!';
                        fetchReviews(selectedBookIsbn || cardEl.querySelector('.view-reviews-btn').dataset.isbn, bookTitle, cardEl);
                    } catch (error) {
                        messageSpan.textContent = 'Error deleting review.';
                    }
                };
                reviewsDiv.appendChild(formDiv);
            }
            return;
        }
        // Fallback: legacy review section
        reviewBookTitle.textContent = `Reviews for: ${bookTitle}`;
        reviewsDisplay.innerHTML = '';
        reviewMessage.textContent = '';
        deleteReviewButton.style.display = 'none';
        if (Object.keys(reviews).length === 0) {
            reviewsDisplay.innerHTML = '<p>No reviews yet.</p>';
        } else {
            Object.entries(reviews).forEach(([userId, reviewData]) => {
                const div = document.createElement('div');
                div.className = 'review';
                div.innerHTML = `<strong>${reviewData.username || 'User ' + userId}:</strong> ${reviewData.review}`;
                reviewsDisplay.appendChild(div);
            });
        }
        // Show delete button if user has a review
        if (currentToken && currentUserId && reviews[currentUserId]) {
            deleteReviewButton.style.display = 'inline-block';
            reviewTextInput.value = reviews[currentUserId].review;
        }
        reviewSection.style.display = 'block';
        addReviewForm.style.display = 'block';
    };

    const registerUser = async () => {
        const username = registerUsernameInput.value;
        const password = registerPasswordInput.value;
        registerMessage.textContent = '';

        if (!username || !password) {
            registerMessage.textContent = 'Username and password are required.';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            registerMessage.textContent = `Registration successful! ${data.message}. You can now log in.`;
            registerUsernameInput.value = '';
            registerPasswordInput.value = '';
            // Close modal on successful registration
            setTimeout(() => closeModal(registerModal), 1500); // Close after a short delay
        } catch (error) {
            console.error('Registration error:', error);
            registerMessage.textContent = `Registration failed: ${error.message}`;
        }
    };

    const loginUser = async () => {
        const username = loginUsernameInput.value;
        const password = loginPasswordInput.value;
        loginMessage.textContent = '';

        if (!username || !password) {
            loginMessage.textContent = 'Username and password are required.';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            currentToken = data.token;
            localStorage.setItem('authToken', currentToken);
            // Decode token to get userId (simple approach, consider a library for robust decoding)
            try {
                 const payload = JSON.parse(atob(currentToken.split('.')[1]));
                 currentUserId = payload.userId;
                 localStorage.setItem('userId', currentUserId);
                 localStorage.setItem('username', payload.username); // Store username too
            } catch (e) {
                console.error('Failed to decode token:', e);
                // Handle error - maybe logout?
            }

            loginUsernameInput.value = '';
            loginPasswordInput.value = '';
            updateAuthUI();
            // Re-fetch reviews for the currently selected book to show user-specific options
            if (selectedBookIsbn) {
                const currentBookTitle = reviewBookTitle.textContent.replace('Reviews for: ', '');
                fetchReviews(selectedBookIsbn, currentBookTitle);
            }
        } catch (error) {
            console.error('Login error:', error);
            loginMessage.textContent = `Login failed: ${error.message}`;
            currentToken = null;
            currentUserId = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            updateAuthUI();
        }
    };

    const logoutUser = () => {
        currentToken = null;
        currentUserId = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        updateAuthUI();
        // Optionally hide review section or clear specific user review highlights
        if (selectedBookIsbn) {
             const currentBookTitle = reviewBookTitle.textContent.replace('Reviews for: ', '');
             fetchReviews(selectedBookIsbn, currentBookTitle); // Re-fetch to clear user-specific stuff
        }
    };

    const submitReview = async () => {
        const reviewText = reviewTextInput.value;
        reviewMessage.textContent = '';

        if (!selectedBookIsbn) {
            reviewMessage.textContent = 'Please select a book first.';
            return;
        }
        if (!reviewText) {
            reviewMessage.textContent = 'Review text cannot be empty.';
            return;
        }
        if (!currentToken) {
            reviewMessage.textContent = 'You must be logged in to submit a review.';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/books/auth/review/${selectedBookIsbn}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify({ review: reviewText })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            reviewMessage.textContent = data.message;
            // Refresh reviews to show the updated one
            const currentBookTitle = reviewBookTitle.textContent.replace('Reviews for: ', '');
            fetchReviews(selectedBookIsbn, currentBookTitle);
        } catch (error) {
            console.error('Error submitting review:', error);
            reviewMessage.textContent = `Failed to submit review: ${error.message}`;
        }
    };

     const deleteReview = async () => {
        reviewMessage.textContent = '';
        if (!selectedBookIsbn) {
            reviewMessage.textContent = 'No book selected for review deletion.';
            return;
        }
        if (!currentToken) {
            reviewMessage.textContent = 'You must be logged in to delete a review.';
            return;
        }

        if (!confirm('Are you sure you want to delete your review for this book?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/books/auth/review/${selectedBookIsbn}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            reviewMessage.textContent = data.message;
            reviewTextInput.value = ''; // Clear text area after deletion
            // Refresh reviews to show it's gone
            const currentBookTitle = reviewBookTitle.textContent.replace('Reviews for: ', '');
            fetchReviews(selectedBookIsbn, currentBookTitle);
        } catch (error) {
            console.error('Error deleting review:', error);
            reviewMessage.textContent = `Failed to delete review: ${error.message}`;
        }
    };

    // --- Event Listeners ---
    registerButton.addEventListener('click', registerUser);
    loginButton.addEventListener('click', loginUser);
    logoutButton.addEventListener('click', logoutUser);
    searchButton.addEventListener('click', () => searchBooks(searchTypeSelect.value, searchInput.value));
    showAllButton.addEventListener('click', fetchAllBooks);
    submitReviewButton.addEventListener('click', submitReview);
    deleteReviewButton.addEventListener('click', deleteReview);

    // Allow searching by pressing Enter in the search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBooks(searchTypeSelect.value, searchInput.value);
        }
    });

    // --- Initial Load ---
    updateAuthUI();
    // Fetch and display all books on initial load
    fetch(`${API_BASE_URL}/books/`)
        .then(response => response.json())
        .then(data => displayBooks(data))
        .catch(err => {
            if (bookGrid) bookGrid.innerHTML = '<div>Error loading books.</div>';
        });
});

// --- Modal Show/Hide Logic ---
showRegisterModalButton.addEventListener('click', () => {
    registerModal.style.display = 'block';
});
showLoginModalButton.addEventListener('click', () => {
    loginModal.style.display = 'block';
});
closeRegisterModalButton.addEventListener('click', () => {
    registerModal.style.display = 'none';
});
closeLoginModalButton.addEventListener('click', () => {
    loginModal.style.display = 'none';
});
window.addEventListener('click', (event) => {
    if (event.target === registerModal) registerModal.style.display = 'none';
    if (event.target === loginModal) loginModal.style.display = 'none';
});