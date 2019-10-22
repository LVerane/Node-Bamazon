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
                choices: ["View Product Sales by Department", "Create New Department", "Exit"]
            }
        ])
        .then(function (answer) {
            switch (answer.task) {
                case "View Product Sales by Department":
                    viewSales();
                    break;

                case "Create New Department":
                    createDepartment();
                    break;

                case "Exit":
                    connection.end();
                    break;

                default:
                    console.log("Error")
            }
        });
}

function viewSales() {
    var query = "SELECT dep.id, dep.department, over_head_costs, IFNULL(sum(price*sold),0) gross_sales, (IFNULL(sum(price*sold),0) - over_head_costs) profit FROM departments dep ";
    query += "LEFT JOIN products pd on dep.department = pd.department GROUP BY dep.department";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(res)
        askTask();
    });
}

function createDepartment() {
    inquirer
        .prompt([
            {
                name: "departmentName",
                message: "Please enter the name of the department you would like to create"
            }, {
                type: "number",
                name: "costs",
                message: "Please enter the overhead costs of the new deparment",
                filter: Number
            }
        ])
        .then(function (answer) {
            if (isNaN(answer.costs)) {
                console.log("Put a number, dummy!")
                createDepartment();
            } else {
                connection.query("INSERT INTO departments (department, over_head_costs) VALUES (?, ?)", [answer.departmentName, answer.costs], function (err) {
                    if (err) throw err;
                    console.log("Department " + answer.departmentName + " successfully created!")
                    askTask();
                });
            }
        });
}