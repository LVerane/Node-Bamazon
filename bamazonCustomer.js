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
                name: "itemID",
                message: "Please enter the ID of the item you would like to purchase"
            }, {
                name: "amount",
                message: "How many would you like to buy?"
            }
        ])
        .then(function (answer) {
            //use the ID the user selected to make another call so it works with any array position
            connection.query("SELECT price, stock, sold FROM products WHERE id = ?", [answer.itemID], function (err, response) {
                if (err) throw err;
                if (answer.amount > response[0].stock) {
                    askBuyAll(answer.itemID, response[0]);
                } else {
                    updateRequest(answer.itemID, parseInt(answer.amount), response[0]);
                }
            });
        });
}

function updateRequest(userIdInput, userAmountInput, itemArray){
    connection.query("UPDATE products SET sold = ? WHERE id = ?", [itemArray.sold + userAmountInput, userIdInput], function (err) {
        if (err) throw err;
    });
    connection.query("UPDATE products SET stock = ? WHERE id = ?", [itemArray.stock - userAmountInput, userIdInput], function (err) {
        if (err) throw err;
        console.log("Order successful!")
        console.log("The total cost of your purchase is " + (userAmountInput * itemArray.price).toFixed(2))
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

function askBuyAll(userIdInput, itemArray){
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
                updateRequest(userIdInput, itemArray.stock, itemArray)
            } else {
                askContinue();
            }
        });
}