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
askTask();

function askTask() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "task",
                message: "What would you like to do?",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
            }
        ])
        .then(function (answer) {
            switch (answer.task) {
                case "View Products for Sale":
                    viewProdcuts(true);
                    break;

                case "View Low Inventory":
                    viewLow();
                    break;

                case "Add to Inventory":
                    viewProdcuts(false);
                    break;

                case "Add New Product":
                    newProduct();
                    break;

                case "Exit":
                    connection.end();
                    break;

                default:
                    console.log("Error")
            }
        });
}

function viewProdcuts(restart) {
    connection.query("SELECT id, product, price, stock, sold FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        if (restart) {
            askTask();
        } else {
            restock();
        }
    });
}

function viewLow() {
    connection.query("SELECT id, product, price, stock, sold FROM products WHERE stock < 5", function (err, res) {
        if (err) throw err;
        console.table(res);
        askTask();
    });
}

function restock() {
    inquirer
        .prompt([
            {
                name: "itemID",
                message: "Please enter the ID of the item you would like to restock"
            }, {
                name: "amount",
                message: "How many would you like to add to the stock?"
            }
        ])
        .then(function (answer) {
            connection.query("SELECT product, stock FROM products WHERE id = ?", [answer.itemID], function (err, res) {
                if (err) throw err;
                connection.query("UPDATE products SET stock = ? WHERE id = ?", [res[0].stock + parseInt(answer.amount), answer.itemID], function (err) {
                    if (err) throw err;
                    console.log("Product " + res[0].product + " successfully restocked")
                    askTask();
                });
            });
        });
}

function newProduct() {
    inquirer
        .prompt([
            {
                name: "itemName",
                message: "Please enter the name of the item you would like to add"
            }, {
                type: "list",
                name: "department",
                message: "Please select the department of the item you would like to add",
                choices: ["Department AG", "Department BT", "Department FT", "Department PO", "Department LM"]
            }, {
                name: "price",
                message: "Please enter the price for the item you would like to add"
            }, {
                name: "stock",
                message: "Please enter the available stock of the item you would like to add"
            }
        ])
        .then(function (answer) {
            connection.query("INSERT INTO products (product, department, price, stock) VALUES (?, ?, ?, ?)", [answer.itemName, answer.department, answer.price, answer.stock], function (err) {
                if (err) throw err;
                console.log("New product " + answer.itemName + " successfully added to the store!")
                viewProdcuts(true);
            });
        });
}
