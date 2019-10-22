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
                type: "number",
                name: "itemID",
                message: "Please enter the ID of the item you would like to restock",
                filter: Number
            }, {
                type: "number",
                name: "amount",
                message: "How many would you like to add to the stock?",
                filter: Number
            }
        ])
        .then(function (answer) {
            if (isNaN(answer.itemID) || isNaN(answer.amount)) {
                console.log("Put a number, dummy!")
                restock();
            } else {
                connection.query("SELECT product, department, price FROM products WHERE id = ?", [answer.itemID], function (err, res) {
                    if (err) throw err;
                    connection.query("UPDATE products SET stock = stock + ? WHERE id = ?", [parseInt(answer.amount), answer.itemID], function (err) {
                        if (err) throw err;

                        console.log("Product " + res[0].product + " successfully restocked")

                        updateCosts(parseInt(answer.amount), res[0].price, res[0].department)

                    });
                });
            }
        });
}

function newProduct() {
    connection.query("SELECT department FROM departments", function (err, res) {
        if (err) throw err;
        var options = [];
        res.forEach(element => {
            options.push(element.department)
        });
        inquirer
            .prompt([
                {
                    name: "itemName",
                    message: "Please enter the name of the item you would like to add"
                }, {
                    type: "list",
                    name: "department",
                    message: "Please select the department of the item you would like to add",
                    choices: options
                }, {
                    type: "number",
                    name: "price",
                    message: "Please enter the price for the item you would like to add",
                    filter: Number
                }, {
                    type: "number",
                    name: "stock",
                    message: "Please enter the available stock of the item you would like to add",
                    filter: Number
                }
            ])
            .then(function (answer) {
                if (isNaN(answer.price) || isNaN(answer.stock)) {
                    console.log("Put a number, dummy!")
                    newProduct();
                } else {
                    connection.query("INSERT INTO products (product, department, price, stock) VALUES (?, ?, ?, ?)", [answer.itemName, answer.department, answer.price, answer.stock], function (err) {
                        if (err) throw err;
                        console.log("New product " + answer.itemName + " successfully added to the store!")

                        updateCosts(parseInt(answer.stock), parseFloat(answer.price), answer.department)

                    });
                }
            });
    });
}

function updateCosts(stockAdded, price, department) {
    connection.query("UPDATE departments SET over_head_costs = over_head_costs + ? WHERE department = ?", [stockAdded * price * 0.4, department], function (err) {
        if (err) throw err;
        console.log("Overhead Costs of department " + department + " successfully restocked")
        viewProdcuts(true);
    });
}