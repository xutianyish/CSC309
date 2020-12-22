/* E2 Library - JS */

/*-----------------------------------------------------------*/
/* Starter code - DO NOT edit the code below. */
/*-----------------------------------------------------------*/

// global counts
let numberOfBooks = 0; // total number of books
let numberOfPatrons = 0; // total number of patrons

// global arrays
const libraryBooks = [] // Array of books owned by the library (whether they are loaned or not)
const patrons = [] // Array of library patrons.

// Book 'class'
class Book {
	constructor(title, author, genre) {
		this.title = title;
		this.author = author;
		this.genre = genre;
		this.patron = null; // will be the patron objet

		// set book ID
		this.bookId = numberOfBooks;
		numberOfBooks++;
	}

	setLoanTime() {
		// Create a setTimeout that waits 3 seconds before indicating a book is overdue

		const self = this; // keep book in scope of anon function (why? the call-site for 'this' in the anon function is the DOM window)
		setTimeout(function() {
			
			console.log('overdue book!', self.title)
			changeToOverdue(self);

		}, 3000)

	}
}

// Patron constructor
const Patron = function(name) {
	this.name = name;
	this.cardNumber = numberOfPatrons;

	numberOfPatrons++;
}


// Adding these books does not change the DOM - we are simply setting up the 
// book and patron arrays as they appear initially in the DOM.
libraryBooks.push(new Book('Harry Potter', 'J.K. Rowling', 'Fantasy'));
libraryBooks.push(new Book('1984', 'G. Orwell', 'Dystopian Fiction'));
libraryBooks.push(new Book('A Brief History of Time', 'S. Hawking', 'Cosmology'));

patrons.push(new Patron('Jim John'))
patrons.push(new Patron('Kelly Jones'))

// Patron 0 loans book 0
libraryBooks[0].patron = patrons[0]
// Set the overdue timeout
libraryBooks[0].setLoanTime()  // check console to see a log after 3 seconds


/* Select all DOM form elements you'll need. */ 
const bookAddForm = document.querySelector('#bookAddForm');
const bookInfoForm = document.querySelector('#bookInfoForm');
const bookLoanForm = document.querySelector('#bookLoanForm');
const patronAddForm = document.querySelector('#patronAddForm');

/* bookTable element */
const bookTable = document.querySelector('#bookTable')
/* bookInfo element */
const bookInfo = document.querySelector('#bookInfo')
/* Full patrons entries element */
const patronEntries = document.querySelector('#patrons')

/* Event listeners for button submit and button click */

bookAddForm.addEventListener('submit', addNewBookToBookList);
bookLoanForm.addEventListener('submit', loanBookToPatron);
patronAddForm.addEventListener('submit', addNewPatron)
bookInfoForm.addEventListener('submit', getBookInfo);

/* Listen for click patron entries - will have to check if it is a return button in returnBookToLibrary */
patronEntries.addEventListener('click', returnBookToLibrary)

/*-----------------------------------------------------------*/
/* End of starter code - do *not* edit the code above. */
/*-----------------------------------------------------------*/


/** ADD your code to the functions below. DO NOT change the function signatures. **/


/*** Functions that don't edit DOM themselves, but can call DOM functions 
     Use the book and patron arrays appropriately in these functions.
 ***/
// Adds a new book to the global book list and calls addBookToLibraryTable()
function addNewBookToBookList(e) {
	e.preventDefault();

	// Add book book to global array
	const bookName = document.querySelector('#newBookName').value;
	const author = document.querySelector('#newBookAuthor').value;
	const genre = document.querySelector('#newBookGenre').value;
	libraryBooks.push(new Book(bookName, author, genre));
	
	// Call addBookToLibraryTable properly to add book to the DOM
	addBookToLibraryTable(libraryBooks[numberOfBooks-1]);
}

// Changes book patron information, and calls 
function loanBookToPatron(e) {
	e.preventDefault();

	// Get correct book and patron
	const bookId = parseInt(document.querySelector('#loanBookId').value);
	const cardNumber = document.querySelector('#loanCardNum').value;
	
	// Add patron to the book's patron property
	libraryBooks[bookId].patron = patrons[cardNumber];
	bookTable.children[0].children[bookId+1].children[2].innerText = cardNumber;
	
	// Add book to the patron's book table in the DOM by calling addBookToPatronLoans()
	addBookToPatronLoans(libraryBooks[bookId])

	// Start the book loan timer.
	libraryBooks[bookId].setLoanTime()
}

// Changes book patron information and calls returnBookToLibraryTable()
function returnBookToLibrary(e){
	e.preventDefault();
	// check if return button was clicked, otherwise do nothing.
	if(e.target.classList.contains('return')){
		// Call removeBookFromPatronTable()
		const bookId = parseInt(e.target.parentElement.parentElement.children[0].innerText);
		removeBookFromPatronTable(libraryBooks[bookId]);
		// Change the book object to have a patron of 'null'
		libraryBooks[bookId].patron = null;
	}
}

// Creates and adds a new patron
function addNewPatron(e) {
	e.preventDefault();

	// Add a new patron to global array
	const patronName = document.querySelector('#newPatronName').value
	patrons.push(new Patron(patronName))
	
	// Call addNewPatronEntry() to add patron to the DOM
	addNewPatronEntry(patrons[numberOfPatrons-1])
}

// Gets book info and then displays
function getBookInfo(e) {
	e.preventDefault();

	// Get correct book
	const bookId = document.querySelector('#bookInfoId').value;
	// Call displayBookInfo()	
	displayBookInfo(libraryBooks[bookId])
}


/*-----------------------------------------------------------*/
/*** DOM functions below - use these to create and edit DOM objects ***/
// Adds a book to the library table.
function addBookToLibraryTable(book) {
	// Add code here
	const tableRow = document.createElement('tr')
	const bookID = document.createElement('td')
	bookID.appendChild(document.createTextNode(book.bookId))
	
	const bookTitle = document.createElement('td')
	const bookTitleSt = document.createElement('strong')
	bookTitleSt.appendChild(document.createTextNode(book.title))
	bookTitle.appendChild(bookTitleSt)
	
	const patronNumber = document.createElement('td')
	
	tableRow.appendChild(bookID)
	tableRow.appendChild(bookTitle)
	tableRow.appendChild(patronNumber)
	bookTable.children[0].appendChild(tableRow)
}

// Displays deatiled info on the book in the Book Info Section
function displayBookInfo(book) {
	// Add code here
	bookInfo.children[0].children[0].innerText = book.bookId
	bookInfo.children[1].children[0].innerText = book.title
	bookInfo.children[2].children[0].innerText = book.author
	bookInfo.children[3].children[0].innerText = book.genre
	if(book.patron === null){
		bookInfo.children[4].children[0].innerText = 'N/A'
	}else{
		bookInfo.children[4].children[0].innerText = book.patron.name
	}
}


// Adds a book to a patron's book list with a status of 'Within due date'. 
// (don't forget to add a 'return' button).
function addBookToPatronLoans(book) {
	// Add code here
	const tableRow = document.createElement('tr');
	const col0 = document.createElement('td');
	col0.appendChild(document.createTextNode(book.bookId));
	tableRow.appendChild(col0);
	
	const col1 = document.createElement('td');
	const str = document.createElement('strong');
	str.appendChild(document.createTextNode(book.title));
	col1.appendChild(str);
	tableRow.appendChild(col1);
	
	const col2 = document.createElement('td');
	const span = document.createElement('span');
	span.className = 'green';
	span.appendChild(document.createTextNode('Within due date'));
	col2.appendChild(span);
	tableRow.appendChild(col2);
	
	const col3 = document.createElement('td');
	const returnButton = document.createElement('button');
	returnButton.className = 'return';
	returnButton.appendChild(document.createTextNode('return'));
	col3.appendChild(returnButton);
	tableRow.appendChild(col3);
		
	// figure out where to append
	const patronIdx = book.patron.cardNumber;
	patronEntries.children[patronIdx].children[3].children[0].appendChild(tableRow);
}

// Adds a new patron with no books in their table to the DOM, including name, card number,
// and blank book list (with only the <th> headers: BookID, Title, Status).
function addNewPatronEntry(patron) {
	// Add code here
	const patronDiv = document.createElement('div')
	patronDiv.className = 'patron'
	
	const patronName = document.createElement('p')
	patronName.appendChild(document.createTextNode('Name: '))
	const patronNameSpan = document.createElement('span')
	patronNameSpan.className = 'bold'
	patronNameSpan.appendChild(document.createTextNode(patron.name))
	patronName.appendChild(patronNameSpan)
	patronDiv.appendChild(patronName)
	
	const cardNumber = document.createElement('p')
	cardNumber.appendChild(document.createTextNode('Card Number: '))
	const cardNumberSpan = document.createElement('span')
	cardNumberSpan.className = 'bold'
	cardNumberSpan.appendChild(document.createTextNode(patron.cardNumber))
	cardNumber.appendChild(cardNumberSpan)
	patronDiv.appendChild(cardNumber)
	
	const booksOnLoan = document.createElement('h4')
	booksOnLoan.appendChild(document.createTextNode('Books on loan:'))
	patronDiv.appendChild(booksOnLoan)
	
	const table = document.createElement('table')
	table.className = 'patronLoansTable'
	const tbody = document.createElement('tbody')
	const row = document.createElement('tr')
	const col0 = document.createElement('th')
	col0.appendChild(document.createTextNode('BookID'))
	const col1 = document.createElement('th')
	col1.appendChild(document.createTextNode('Title'))
	const col2 = document.createElement('th')
	col2.appendChild(document.createTextNode('Status'))
	const col3 = document.createElement('th')
	col3.appendChild(document.createTextNode('Return'))
	row.appendChild(col0)
	row.appendChild(col1)
	row.appendChild(col2)
	row.appendChild(col3)
	tbody.appendChild(row)
	table.appendChild(tbody)
	patronDiv.appendChild(table)

	patronEntries.appendChild(patronDiv)
}


// Removes book from patron's book table and remove patron card number from library book table
function removeBookFromPatronTable(book) {
	// Add code here
	// remove book from library book table
	bookTable.children[0].children[book.bookId+1].children[2].innerText = ''
	
	// remove book from patron's book table
	const booksOnLoan = patronEntries.children[book.patron.cardNumber].children[3].children[0];
	for(let i = 0; i < booksOnLoan.children.length; i++){
		if(parseInt(booksOnLoan.children[i].children[0].innerText) === book.bookId){
			booksOnLoan.removeChild(booksOnLoan.children[i]);
		}
	}
}

// Set status to red 'Overdue' in the book's patron's book table.
function changeToOverdue(book) {
	// Add code here
	if(book.patron != null){
		const booksOnLoan = patronEntries.children[book.patron.cardNumber].children[3].children[0];
		for(let i = 0; i < booksOnLoan.children.length; i++){
			if(parseInt(booksOnLoan.children[i].children[0].innerText) === book.bookId){
				booksOnLoan.children[i].children[2].innerText = 'Overdue';
				booksOnLoan.children[i].children[2].className = 'red';
			}
		}
	}
}

