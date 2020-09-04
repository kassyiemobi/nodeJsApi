const fileUtil = require('./fileUtil');
const routeHandler = {};
const helper = require('./helper');
routeHandler.Books = (data, callback) => {
    const acceptableHeaders = ["post", "get", "put", "delete"];
    if (acceptableHeaders.indexOf(data.method) > -1) {
        routeHandler._books[data.method](data, callback);
    } else {
        callback(405);
    }
};

//main book route object
routeHandler._books = {};


//Post route -- for creating a book
routeHandler._books.post = (data, callback) => {
     //store userID to a variable
     var userid = data.headers.userid;
     if (userid) {
         //Check if user exist
         fileUtil.read('users', userid, (err, userData) => {
             if (!err && userData) {
                 if (userData.role === 'admin') {
                    //validate that all required fields are filled out
                    var name = typeof(data.payload.name) === 'string' && data.payload.name.trim().length > 0 ? data.payload.name : false;
                    var price = typeof(data.payload.price) === 'string' && !isNaN(parseInt(data.payload.price)) ? data.payload.price : false;
                    var author = typeof(data.payload.author) === 'string' && data.payload.author.trim().length > 0 ? data.payload.author : false;
                    var publisher = typeof(data.payload.publisher) === 'string' && data.payload.publisher.trim().length > 0 ? data.payload.publisher : false;
                    var copies = typeof(data.payload.copies) === 'number' && !isNaN(parseInt(data.payload.copies)) ? data.payload.copies : false;
                    if(name && price && author && publisher && copies){
                        const fileName = helper.generateRandomString(10);
                        data.payload.bookid = fileName;
                        fileUtil.create('books', fileName, data.payload, (err) => {
                            if (!err) {
                                callback(200, { message: `The New book was added successfully with bookID: ${fileName}`, data: data.payload });
                            } else {
                                callback(400, { message: "Oops! This server had issues with your Request, Try again" });
                            }
                        });
                    } else {
                        callback(403, { message: " You are sending an incomplete data", data: { name, author, publisher, price, copies } })
                    }

                } else {
                    callback(403, { message: 'You\'re not an Admin and can\'t perform such function' })
                }
            } else {
                callback(403, { message: 'Oops! You\'re an unauthorized user. Access denied' });
            }
        })

    } else {
        callback(403, { message: 'Please Provide a User(Admin) ID [as a header eg: userid=?] for verification' })
    }

};
//Get route -- for getting a book
routeHandler._books.get = (data, callback) => {
   // fileUtil.read('users', userid, (err, data) => {
    var userid = data.headers.userid;
    var bookid = data.payload.bookid;
    if (userid) {
        fileUtil.read('users', userid, (err, data) => {
            if (!err && data) {
                if (bookid) {
                    fileUtil.read('books', bookid, (err, data) => {
                        if (!err && data) {
                            callback(200, { message: 'Book record Retrieved', data: data});
                        } else {
                            callback(403, { err: err, data: data, message: 'This Book seems not to be in our Library Again' });
                        }
                    });
                } else {
                    callback(403, { message: 'Please Provide a Valid Book ID (as a payload) for your request' })
                }
            } else {
                callback(403, { message: 'This User does not exist in our record' })
            }
        })
    } else {
        callback(403, { message: 'Please provide a valid User ID as a Header (userid = ?)to Verify your Identity' })
    }
};
//Put route -- for updating a book
routeHandler._books.put = (data, callback) => {
    //store userID to a constant
    const userid = data.headers.userid;
    const bookid = data.query.bookid;
    if (userid) {
        //check if user exist
        fileUtil.read('users', userid, (err, userData) => {
            if (!err && userData) {
                //check if user is an admin
                if (userData.role === 'admin') {
                    if (bookid) {
                        fileUtil.update('books', data.query.bookid, data.payload, (err) => {
                            console.log(data.query.name);
                            if (!err) {
                                callback(200, { message: 'book updated successfully', data: data.payload })
                            } else {
                                callback(400, { err: err, data: null, message: 'could not update book' });
                            }
                        });
                    } else {
                        callback(404, { message: 'Please enter a valid Book ID (as a query. bookid = ?) that you want to update' });
                    }


                } else {
                    callback(403, { message: 'This User doesn\'t have administrative previledge' })
                }
            } else {
                callback(403, { message: 'Incorrect UserID: Please enter a Valid user ID. ' })
            }

        });

    } else {
        callback(403, { Message: 'user details can\'t be verified. Enter a Valid User(Admin) ID (userid=?)' });
    }
};
//Delete route -- for deleting a book
routeHandler._books.delete = (data, callback) => {
    const userid = data.headers.userid;
    if (userid) {
        fileUtil.read('users', userid, (err, userData) => {
            if (!err && userData) {
                //check if user is an admin
                if (userData.role === 'admin') {
                    if (data.payload.bookid) {
                        fileUtil.delete('books', data.payload.bookid, (err) => {
                            if (!err) {
                                callback(200, { message: `This Book was deleted successfully` });
                            } else {
                                callback(400, { err: err, message: 'could not delete book' });
                            }
                        })
                    } else {
                        callback(404, { message: 'Please enter a Valid Book id to be deleted.' });
                    }
                } else {
                    callback(403, { message: 'This User doesn\'t have administrative previledge' })
                }
            } else {
                callback(403, { message: 'Incorrect UserID: Please enter a Valid user ID. ' })
            }

        });

    } else {
        callback(403, { Message: 'user details can\'t be verified. Enter a Valid User(Admin) ID as a header (userid=?)' });
    }
};

routeHandler.users = (data, callback)=> {
    const acceptableHeaders= ["post","get","delete","put"]
   if(acceptableHeaders.indexOf(data.method) > -1 ){
       routeHandler._users[data.method](data, callback)
   } else{
       callback (405);
   }

}

routeHandler._users={}

routeHandler._users.post=(data, callback)=> {
    var fullName = typeof(data.payload.fullName)==="string" && data.payload.fullName.trim().length > 0 ? data.payload.fullName : false
    var email = typeof(data.payload.email)==="string" && data.payload.email.trim().length > 0 ? data.payload.email : false
    var phoneNumber = typeof (data.payload.phoneNumber)==="number" && !isNaN(parseInt(data.payload.phoneNumber)) ? data.payload.phoneNumber: false
    var address = typeof(data.payload.address)==="string" && data.payload.address.trim().length > 0 ? data.payload.address : false
    if (fullName && email && phoneNumber && address){
        var fileName = helper.generateRandomString(10)
        data.payload.borrowed =0
        data.payload.userid = fileName
        data.payload.role = "user"
        fileUtil.create("users", fileName , data.payload, (err) =>{
            if (!err){
                callback (200,{message:'registeration successful!'})

            }else;
            callback (405, {message:"error registering user, try again!"})
        })
        
    }else{
        callback(403,{message: "incomplete data", data: { fullName, email, address, phoneNumber }})
    }

}
routeHandler.ping = (data, callback) => {
    callback(200, { response: "server is live" });
};
routeHandler.notfound = (data, callback) => {
    callback(404, { response: 'not found' });
};
routeHandler.request = (data,callback)=> {
    var bookid = data.payload.bookid;
    var userid = data.headers.userid;
    // console.log(bookid, userid);
    if (userid) {
        fileUtil.read('users', userid, (err, userData) => {
            if (!err && userData) {

                fileUtil.read('books', bookid, (err, data) => {
                    var book = data

                    //check if book count is O for rent
                    if (book.copies < 1) {
                        callback(403, { message: `We are sorry.You cannot Rent ${data.name}, It is all rented out` })
                    } else {
                        book.copies = book.copies - 1
                        fileUtil.update('books', bookid, book, (err, data) => {
                            //update user borrowed number
                            userData.borrowed = userData.borrowed + 1;

                            fileUtil.update('users', userid, userData, (err, userData) => {
                                callback(200, { message: 'You have Successfully rented this Book', data: book });

                            })
                        })
                    }
                })
            } else {
                callback(403, { message: 'User not found' })
            }
        })
    } else {
        callback(403, {
            message: 'sorry! This User does not exist and cant Rent a Book'
        })
    }

}

routeHandler.return = (data, callback)=>{
    
    var bookid = data.payload.bookid;
    var userid = data.headers.userid;
    if (userid) {
        //Verify if user is registered
        fileUtil.read('users', userid, (err, userData) => {
            if (!err && userData) {
                if (userData.borrowed < 1) {
                    callback(403, { message: 'This user has no books rented' })
                } else {
                    fileUtil.read('books', bookid, (err, data) => {
                        var book = data

                        //Update book copies for rent
                        book.copies = book.copies + 1
                        fileUtil.update('books', bookid, book, (err, data) => {

                            userData.borrowed = userData.borrowed - 1;

                            fileUtil.update('users', userid, userData, (err, userData) => {

                                callback(200, { message: ` ${book.name} was successfully Returned`, data: book })
                            })
                        })
                    })

                }
                // Read book details and update
            } else {
                callback(403, { message: 'User not found' })
            }
        })
    } else {
        callback(403, {
            message: 'sorry! This User does not exist and cannot Rent a Book'
        })
    }

}



module.exports = routeHandler;