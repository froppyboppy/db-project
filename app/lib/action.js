'use server'
import { connectDb } from './db.js';


//ANYTIME YOU ADD A CLEAN .DB FILE YOU NEED TO RUN THE FOLLOWING COMMANDS

/*
Query 1: [5 points]
Add an extra column ‘Late’ to the Book_Loan table. Values will be 0-for non-late retuns, and 1-for late
returns. Then update the ‘Late’ column with '1' for all records that they have a return date later than the
due date and with '0' for those were returned on time
*/
export async function modifyBookLoan() {
    const db = await connectDb();

    // Check if the 'late' column already exists in bookLoans table
    const checkColumnQuery = await db.all(`
        PRAGMA table_info(bookLoans);
    `);

    // Convert the result to an array for compatibility with array methods
    const columnInfoArray = Array.from(checkColumnQuery);

    const columnExists = columnInfoArray.some((column) => column.name === 'late');

    if (!columnExists) {
        // Add a new column 'Late' to the Book_Loan table
        await db.run(`
            ALTER TABLE bookLoans ADD COLUMN late INTEGER;
        `);

        // Update the 'Late' column based on the conditions
        const modifyResult = await db.run(`
            UPDATE bookLoans
            SET late = CASE WHEN returnedDate > dateDue THEN 1 ELSE 0 END;
        `);

        // Add autoincrement to bookID
        const autoIncrement = await db.run(`
            CREATE TRIGGER IF NOT EXISTS bookID_autoincrement
            AFTER INSERT ON book
            BEGIN
                UPDATE book
                SET bookID = (SELECT MAX(bookID) FROM book) + 1
                WHERE bookID IS NULL;
            END;
        `);

        return modifyResult;
    } else {
        console.log("Column 'late' already exists in the bookLoans table.");
        return null; // You might want to handle this case differently based on your requirements
    }
}



/*
Query 2: [5 points]
Add an extra column ‘LateFee’ to the Library_Branch table, decide late fee per day for each branch and
update that column

I am assuming that one day late is $1, two days late is $2, etc.
*/
export async function modifyLibraryBranch() {
    const db = await connectDb();

    //UNCOMMENT THIS WHEN NEW DB FILE IS ADDED
    // Add a new column 'LateFee' to the Library_Branch table
    await db.run(`
        ALTER TABLE libraryBranch ADD COLUMN lateFee INTEGER;
    `);

    // Calculate the late fee based on days late
    await db.run(`
    UPDATE libraryBranch
    SET lateFee = 1;
    `);


    return;
}

/*
Query 3: [10 points]
Create a view vBookLoanInfo that retrieves all information per book loan. The view should have the
following attributes:
    • CardNo
    • Borrower Name
    • Date_Out,
    • Due_Date,
    • Returned_date
    • Total Days of book loaned out as 'TotalDays'– you need to change weeks to days
    • Book Title
    • Number of days returned late – if returned before or on due_date place zero
    • Branch ID
    • Total Late Fee Balance 'LateFeeBalance' – If the book was not retuned late than fee = ‘0’
*/
export async function createView() {
    const db = await connectDb();

    // Check if the view vBookLoanInfo already exists
    const checkViewQuery = await db.get(`
        SELECT name FROM sqlite_master WHERE type='view' AND name='vBookLoanInfo';
    `);

    const viewExists = checkViewQuery !== undefined;

    if (!viewExists) {
        // Create the vBookLoanInfo view
        await db.run(`
        CREATE VIEW IF NOT EXISTS vBookLoanInfo AS
        SELECT
            bookLoans.cardNo,
            borrowers.borrowerName,
            bookLoans.dateOut AS Date_Out,
            bookLoans.dateDue AS Due_Date,
            bookLoans.returnedDate AS Returned_date,
            -- Calculate total days loaned out (change weeks to days)
            CAST((julianday(bookLoans.returnedDate) - julianday(bookLoans.dateOut)) AS INTEGER) AS TotalDays,
            books.title AS BookTitle,
            -- Calculate number of days returned late
            CASE WHEN bookLoans.returnedDate > bookLoans.dateDue THEN
                CAST((julianday(bookLoans.returnedDate) - julianday(bookLoans.dateDue)) AS INTEGER)
            ELSE
                0
            END AS DaysReturnedLate,
            bookLoans.branchId AS BranchID,
            -- Calculate total late fee balance
            CASE WHEN bookLoans.returnedDate > bookLoans.dateDue THEN
                -- Assuming 'lateFee' is the late fee for each day
                (julianday(bookLoans.returnedDate) - julianday(bookLoans.dateDue)) * libraryBranch.lateFee
            ELSE
                0
            END AS LateFeeBalance
        FROM
            bookLoans
        JOIN
            books ON bookLoans.bookID = books.bookID
        JOIN
            borrowers ON bookLoans.cardNo = borrowers.cardNo
        JOIN
            libraryBranch ON bookLoans.branchId = libraryBranch.branchId;
        
        `);

        console.log("View vBookLoanInfo created successfully.");
    } else {
        console.log("View vBookLoanInfo already exists.");
    }

    // Query the sqlite_master table to get the view definition
    const viewDefinitionQuery = await db.get(`
        SELECT sql FROM sqlite_master WHERE type='view' AND name='vBookLoanInfo';
    `);

    if (viewDefinitionQuery) {
        console.log("View Definition:", viewDefinitionQuery.sql);
    } else {
        console.log("View not found.");
    }
}



export async function getBranches() {
    const db = await connectDb()
    const branches = await db.all(`
        SELECT * FROM library_branch;
    `);
    return branches;
}
// User checks out a book, add it to Book_Loan, the number of copies needs to be updated via trigger in
// the Book_Copies table. Show the output of the updated Book_Copies. [10 points]
// TODO: THIS NEEDS TO ADD TAKE IN USER INPUT HARDCODED VALUES FOR NOW

export async function bookCheckout() {
    const db = await connectDb()
    const book_id = 3
    const branch_id = 2
    const card_no = 123456
    const date_out = '2021-12-10'
    const due_date = '2021-12-17'
    const updateResult = await db.run(`
        UPDATE bookCopies SET noOfCopies = noOfCopies - 1 WHERE bookID = ${book_id} AND branchId = ${branch_id};
    `);
    const insertResult = await db.run(`
        INSERT INTO bookLoans (bookID, branchId, cardNo, dateOut, dateDue) VALUES (${book_id}, ${branch_id}, ${card_no}, '${date_out}', '${due_date}');
    `);
    const bookCheckoutResult = await db.all(`
        SELECT * FROM bookCopies WHERE bookID = ${book_id} AND branchId = ${branch_id};
    `);
    
    return bookCheckoutResult;
}

//Add information about a new Borrower. Do not provide the CardNo in your query. Output the card
//number as if you are giving a new library card. Submit your editable SQL query that your code
//executes.

//TODO: THIS NEEDS TO ADD TAKE IN USER INPUT HARDCODED VALUES FOR NOW
export async function addNewMember() {
    const db = await connectDb()
    const borrowerName = 'Juan Gamez'
    const address = '123 Ligma Balls st'
    const phone = '123-456-7890'
    const insertResult = await db.run(`
        INSERT INTO borrower (borrowerName, address, phone) VALUES ('${borrowerName}', '${address}', '${phone}');
        `);
    const newMemberResult = await db.all(`
        SELECT cardNo FROM borrower WHERE borrowerName = '${borrowerName}' AND address = '${address}' AND phone = '${phone}';
    `);
    
    return newMemberResult;
}

//Add a new Book with publisher (you can use a publisher that already exists) and author information to
//all 5 branches with 5 copies for each branch. Submit your editable SQL query that your code
//TO DO: NEED TO ADD AUTO INCREMENT AND THIS NEEDS TO ADD TAKE IN USER INPUT HARDCODED VALUES FOR NOW
// My current solution is taking the length of the book table and adding 1 to it to get the next bookID
// This is not a good solution because if a book is deleted, the bookID will be reused and the next book will have the same ID

export async function addNewBook() {
    const db = await connectDb();
    const title = 'The Art of I Miss Us';
    const publisherName = 'Pan Books';
    const authorName = 'Hoai Dinh';
    const branchId = 1;
    const noOfCopies = 5;


    //#step 1: add book to books table and give it its own bookID
    const addToBook = await db.run(`
        INSERT INTO book (bookTitle, publisherName) VALUES ('${title}', '${publisherName}');
    `);
    const lastBookId = addToBook.lastID;
    console.log(lastBookId);

    //#step 2: add book to book_copies table for each branch and reference the bookID
    const addToBookCopies = await db.run(`
    INSERT INTO bookCopies (bookID, branchId, noOfCopies)
    SELECT ${lastBookId}, branchId, ${noOfCopies}
    FROM libraryBranch
    WHERE branchId BETWEEN 1 AND 5;
    `);


    console.log(addToBookCopies)
    return addToBook;
}

//Given a book title list the number of copies loaned out per branch. [5 points]
//TODO: Needs better teseting once bookId is fixed
export async function getBookCopies() {
    const db = await connectDb();
    const title = 'The Art of I Miss Us';

    const bookCopies = await db.all(`
        SELECT book.bookTitle, bookCopies.branchId, SUM(bookCopies.noOfCopies) AS totalCopies
        FROM book
        JOIN bookCopies ON book.bookID = bookCopies.bookID
        WHERE book.bookTitle = '${title}'
        GROUP BY bookCopies.branchId;
    `);

    console.log(bookCopies);
    return bookCopies;
}


//Given any due date range list the Book_Loans that were returned late and how many days they were
//late. Submit your editable SQL queries that your code executes. [8 points]
//TODO: SHOULD BE GOOD BUT DOUBLE CHECK
export async function getLateBookLoans() {
    const db = await connectDb();
    const firstDate = '2022-01-10';
    const secondDate = '2022-02-17';

    const lateBookLoans = await db.all(`
        SELECT bookLoans.bookID, bookLoans.branchId, bookLoans.cardNo, bookLoans.dateOut, bookLoans.dateDue, bookLoans.returnedDate, (julianday(bookLoans.returnedDate) - julianday(bookLoans.dateDue)) AS daysLate
        FROM bookLoans
        WHERE bookLoans.dateOut BETWEEN '${firstDate}' AND '${secondDate}' AND bookLoans.returnedDate > bookLoans.dateDue;
    `);

    console.log(lateBookLoans);
    return lateBookLoans;
}

/*
The fifth requirement is to return the view’s results by applying the following criteria:
a. List for every borrower the ID, name, and if there is any lateFee balance. The user has the
right to search either by a borrower ID, name, part of the name, or to run the query with no
filters/criteria. The amount needs to be in US dollars. For borrowers with zero (0) or NULL
balance, you need to return zero dollars ($0.00). Make sure that your query returns
meaningful attribute names. In the case that the user decides not to provide any filters, order
the results based on the balance amount. Make sure that you return all records. Submit your
editable SQL query that your code executes. [10 points]
*/
export async function listBorrowerLateFees() {
    const db = await connectDb();
    //FOR EVERY BORROWER
    

    const borrowerLateFees = await db.all(`
        SELECT borrower.cardNo, borrower.borrowerName, IFNULL(SUM(fines.fineAmt), 0) AS totalFine
        FROM borrower
        LEFT JOIN bookLoans ON borrower.cardNo = bookLoans.cardNo
        LEFT JOIN fines ON bookLoans.loanId = fines.loanId
        GROUP BY borrower.cardNo;
    `);

    console.log(borrowerLateFees);
    return borrowerLateFees;
}

/*
b. List book information in the view. The user must search with borrowerID and any of the
following search items: book id, books title, part of book title, or to run the query with no
filters/criteria. The late fee amount needs to be in US dollars. The late fee price amount needs
to have two decimals as well as the dollar ‘$’ sign. For books that they do not have any late
fee amount, you need to substitute the NULL value with a ‘Non-Applicable’ text. Make sure
that your query returns meaningful attribute names. In the case that the user decides not to
provide any filters, order the results based on the highest late fee remaining. Submit your
editable SQL query that your code executes. [10 points
*/
