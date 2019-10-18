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

function selectRequest(){
    connection.query("SELECT id, product, price, stock FROM products", function (err, res) {
        if (err) throw err;
        askProduct(res)
    });
}


function askProduct(dataArray) {
    // console.log(dataArray)
    console.table(dataArray);
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
            var position = answer.itemID - 1;

            if (answer.amount > dataArray[position].stock) {
                askBuyAll(answer.itemID, dataArray[position].stock, dataArray[position].price)
            } else {
                var newStock = dataArray[position].stock - answer.amount;
                updateRequest(answer.itemID, answer.amount, newStock, dataArray[position].price);
            }
        });
}

function updateRequest(userIdInput, userAmountInput, newStock, dataPrice){
    connection.query(
        "UPDATE products SET stock = ? WHERE id = ?", [newStock, userIdInput], function (err) {
            if (err) throw err;
            console.log("Order successful!")
            console.log("The total cost of your purchase is " + (userAmountInput * dataPrice).toFixed(2))
            askContinue()
        }
    );
}

function askContinue(){
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
        if(answer.continue === "Yes"){
            selectRequest()
        }else{
            connection.end();
        }
    });
}

function askBuyAll(userIdInput, dataStock, dataPrice){
    inquirer
    .prompt([
        {
            type: "list",
            name: "continue",
            message: "Stock insufficient. Would you like to purchase all " + dataStock + " items instead?",
            choices: ["Yes", "No"]
        }
    ])
    .then(function (answer) {
        if(answer.continue === "Yes"){
            updateRequest(userIdInput, dataStock, 0, dataPrice)
        }else{
            askContinue();
        }
    });
}