var mysql = require("mysql");
var inquirer = require("inquirer");
var figlet = require('figlet');

figlet('SOMEHOW-I-MANAGE', function(err, data) {
  if (err) {
  console.log('Something went wrong...');
  console.dir(err);
  return;
  }
  console.log("\n============================")
  console.log(data)
  console.log("\n============================\n\n\n\n\n\n")
});

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employeeDB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
  });

  function start() {
    inquirer
      .prompt({
        name: "add",
        type: "list",
        message: "Would you like to do?",
        choices: ["View all employees", "View all departments", "View all employee roles", "Add department", "Add role", "Add employee", "Update employee roles"]
      })
      .then(function(answer) {
        // based on their answer, either call the bid or the post functions
        if (answer.add === "View all employees") {
          viewEmployees();
        }
        if (answer.add === "View all departments") {
          viewDepartments();
        }
        if (answer.add === "View all employee roles") {
          viewRoles();
        }
        if (answer.add === "Add department") {
          addDepartment();
        }
        if(answer.add === "Add role") {
          addRole();
        } 
        if(answer.add === "Add employee") {
          addEmployee();
        }
        if(answer.add === "Update employee roles") {
          updateRoles();
        }
      });
  }

  function viewEmployees(){
    let joinTables = "SELECT employee.id, employee.first_name, employee.last_name, employee_role.title, employee_role.salary, department.department_name as department FROM employee LEFT JOIN employee_role ON employee.role_id = employee_role.id LEFT JOIN department ON employee_role.department_id = department.id";
        
    connection.query(joinTables, (error, results) => {
      console.table(results);
      start();
      if (error) {
        return console.error(error.message);
        
      }
    });
  }

  function viewDepartments(){
        
    connection.query("SELECT department.id, department.department_name FROM department", (error, results) => {
      console.table(results);
      start();
      if (error) {
        return console.error(error.message);
      }
    });
  }

  function viewRoles(){
        
    connection.query("SELECT employee_role.id, employee_role.title, employee_role.salary FROM employee_role", (error, results) => {
      console.table(results);
      start();
      if (error) {
        return console.error(error.message);
      }
    });
  }

  function addDepartment() {
    // prompt for the name of the department
    inquirer
      .prompt([
        {
          name: "departmentName",
          type: "input",
          message: "What is the name of the department?"
        },
      ])
      .then(function(answer) {
        // when finished prompting, insert a new item into the db with that info
        connection.query(
          "INSERT INTO department SET ?",
          {
            department_name: answer.departmentName,
          },
          function(err) {
            if (err) throw err;
            console.log("Department was added successfully!");
            // re-prompt the user for if they want to add department
            start();
          }
        );
      });
  }

 

  function addRole() {
    inquirer
      .prompt([
        {
          name: "roleTitle",
          type: "input",
          message: "What is the title of the employee role?"
        },
        {
          name: "roleSalary",
          type: "input",
          message: "What is the yearly salary ($) of the employee role?"
        },
        {
          name: "roleDepartment",
          type: "input",
          message: "What is the department ID of the employee role?"
        },
      ])
      .then(function(answer) {
        connection.query(
          "INSERT INTO employee_role SET ?",
          {
            title: answer.roleTitle,
            salary: answer.roleSalary,
            department_id: answer.roleDepartment,
          },
          function(err) {
            if (err) throw err;
            console.log("Role was added successfully!");
            start();
          }
        );
      });
  }

  function addEmployee() {
    inquirer
      .prompt([
        {
          name: "firstName",
          type: "input",
          message: "What is the first name of the employee?"
        },
        {
          name: "lastName",
          type: "input",
          message: "What is the last name of the employee?"
        },
        {
          name: "roleID",
          type: "input",
          message: "What is the role ID of the employee?"
        },
        {
          name: "managerID",
          type: "input",
          message: "What is the manager ID of the employee? (Leave blank if not a manager)"
        },
      ])
      .then(function(answer) {
        // Adds null to table if manager ID response is blank:
        if ( ( answer.managerID === '') || (answer.managerID.toUpperCase() === 'NULL') ) {
          answer.managerID = null;
        }
        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: answer.roleID,
            manager_id: answer.managerID,
          },
          function(err) {
            if (err) throw err;
            console.log("Employee was added successfully!");
            start();
          }
        );
       
      });
    

  }

  function updateRoles() {
    inquirer
      .prompt([
        {
          name: "updateID",
          type: "input",
          message: "What is the ID of the employee role you want to update?"
        },
        {
          name: "updateTitle",
          type: "input",
          message: "What is the new title of the employee role?"
        },
        {
          name: "updateSalary",
          type: "input",
          message: "What is the new salary of the employee role?"
        },
        {
          name: "updateDepartment",
          type: "input",
          message: "What is the new department ID of the employee role?"
        },
      ])
      .then(function(answer){
        connection.query(
          "UPDATE employee_role SET ? WHERE id = " + answer.updateID,
          [
            {
              title: answer.updateTitle,
              salary: answer.updateSalary,
              department_id: answer.updateDepartment
            }
          ],
          function(err, res) {
            if (err) throw err;
            console.log("Updating all employee roles...\n");
            start();
          }
        );
      })
    }