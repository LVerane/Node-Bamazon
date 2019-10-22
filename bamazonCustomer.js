var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

//Start
selectRequest()

function selectRequest() {
    connection.query("SELECT id, product, price, stock FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        askProduct()
    });
}


function askProduct() {
    inquirer
        .prompt([
            {
                type: "number",
                name: "itemID",
                message: "Please enter the ID of the item you would like to purchase",
                filter: Number
            }, {
                type: "number",
                name: "amount",
                message: "How many would you like to buy?",
                filter: Number
            }
        ])
        .then(function (answer) {
            if (isNaN(answer.itemID) || isNaN(answer.amount)) {
                console.log("Put a number, dummy!")
                askProduct();
            } else {
                // use the ID the user selected to make another call so it works with any array position
                connection.query("SELECT price, stock FROM products WHERE id = ?", [answer.itemID], function (err, response) {
                    if (err) throw err;
                    if (answer.amount > response[0].stock) {
                        askBuyAll(answer.itemID, response[0]);
                    } else {
                        updateRequest(answer.itemID, parseInt(answer.amount), response[0].price);
                    }
                });
            }
        });
}

function updateRequest(userIdInput, userAmountInput, price) {
    connection.query("UPDATE products SET sold = sold + ? WHERE id = ?", [userAmountInput, userIdInput], function (err) {
        if (err) throw err;
    });
    connection.query("UPDATE products SET stock = stock - ? WHERE id = ?", [userAmountInput, userIdInput], function (err) {
        if (err) throw err;
        console.log("Order successful!")
        console.log("The total cost of your purchase is " + (userAmountInput * price).toFixed(2))
        askContinue()
    });
}

function askContinue() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "continue",
                message: "Would you like to continue shopping?",
                choices: ["Yes", "No"]
            }
        ])
        .then(function (answer) {
            if (answer.continue === "Yes") {
                selectRequest()
            } else {
                connection.end();
            }
        });
}

function askBuyAll(userIdInput, itemArray) {
    inquirer
        .prompt([
            {
                type: "list",
                name: "continue",
                message: "Stock insufficient. Would you like to purchase all " + itemArray.stock + " items instead?",
                choices: ["Yes", "No"]
            }
        ])
        .then(function (answer) {
            if (answer.continue === "Yes") {
                updateRequest(userIdInput, itemArray.stock, itemArray.price)
            } else {
                askContinue();
            }
        });
}