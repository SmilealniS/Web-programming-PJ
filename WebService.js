const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const jsdom = require("jsdom");
var JSDOM = jsdom.JSDOM;
var global = this;
const app = express();
app.use(cors());
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3030;
let userID = [1, 2, 3];

let connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

connection.connect(function (err) 
{
  if (err) throw err;
});

app.get("/", (req, res) => 
{
  res.sendFile(__dirname + "/HomePage.html");
  console.log("Access Home Page");
});

// Authentication
// Check that user's role
app.get("/LoginAuthentication/:Email&:Pass", function(req, res)
{
    let email = req.params.Email;
    let password = req.params.Pass;

    connection.query("SELECT * FROM user INNER JOIN login ON user.userID = login.userID WHERE (user.email = ? AND user.password = ?)", [email, password], function (error, result) 
    {
        if(result[0] === undefined) return res.send({error: true, message: "Incorrect Email or Password"});
        else if(result[0].role === "admin") return res.send({error: false, data: "admin", message: "This user is an admin."});
        else return res.send({error: false, data: "client", message: "This user is a client"});
    });
});

async function Authentication(Email, Pass)
{
    const res = await(
        await fetch("http://localhost:3030/LoginAuthentication/" + Email + "&" + Pass,
        {
            method: "GET"
        })
    ).json();

    if(res.data === "admin")
    {
        window.location.href = "HomePage.html#iamadmin";
    } else if(res.data === "client")
    {
        window.location.href = "HomePage.html";
    } else if(res.error) alert(res.message);
}

// User in the system
// Search userinfo by userID
app.get("/Search/UserID/:userID", function(req, res)
{
    let userID = req.params.userID;

    connection.query("SELECT CONCAT(firstname, ' ', lastname) AS Name, email AS Email FROM user where userID = ?", userID, function (error, results) 
    {
        return res.send({error: false, data: results, message: "Get user by ID"});
    });
});

async function GetByID(userID)
{
    const res = await(
        await fetch("http://localhost:3030/Search/UserID/" + userID,
        {
            method: "GET"
        })
    ).json();

    document.getElementById("Result").innerHTML = "<h6 class = 'display-6 text-white'>Result</h6><ul>";

    res.data.forEach((user) => 
    {
        document.getElementById("Result").innerHTML += `<li>Name: ${user.Name}<br>Email: ${user.Email}</li>`;
    });
  
    document.getElementById("Result").innerHTML += "</ul>";
}

// Search userinfo by keyword
app.get("/SearchUser/:Search", function(req, res)
{
    let para = req.params.Search;
    if(!para) return res.status(400).send({error: true, message: "Please provide keyword"});
    let param = `%${para}%`;

    connection.query("SELECT CONCAT(firstname, ' ', lastname) AS Name, email AS Email FROM user where firstname LIKE ? OR lastname LIKE ?", [param, param], function(error, results)
    {
        if(error) throw error;
        return res.send({error: false, data: results, message: `Get user contains ${para}`});
    })
});

async function GetUserKeyword(Search)
{
    const res = await(
        await fetch("http://localhost:3030/SearchUser/" + Search,
        {
            method: "GET"
        })
    ).json();
  
    document.getElementById("Result").innerHTML = "<h6 class = 'display-6 text-white'>Result</h6><ul>";
            
    res.data.forEach((user) => 
    {
        document.getElementById("Result").innerHTML += `<li>Name: ${user.Name}<br>Email: ${user.Email}</li>`;
    });

    document.getElementById("Result").innerHTML += "</ul>";
}

// Search userinfo by role
app.get("/Search/Role/:Role", function(req, res)
{
    let role = req.params.Role;
    if(!role) return res.status(400).send({error: true, message: "Please provide role"});

    connection.query("SELECT CONCAT(firstname, ' ', lastname) AS Name, user.email AS Email FROM user INNER JOIN login ON user.userID = login.userID where role = ?", role, function(error, results)
    {
        if(error) throw error;
        return res.send({error: false, data: results, message: `Get user role ${role}`});
    })
});

async function GetByRole(role)
{
    const res = await(
        await fetch("http://localhost:3030/Search/Role/" + role,
        {
            method: "GET"
        })
    ).json();

    document.getElementById("Result").innerHTML = "<h6 class = 'display-6 text-white'>Result</h6><ul>";

    res.data.forEach((user) => 
    {
        document.getElementById("Result").innerHTML += `<li>Name: ${user.Name}<br>Email: ${user.Email}</li>`;
    });
  
    document.getElementById("Result").innerHTML += "</ul>";
}

// View user
app.get("/Search/AllUser", function(req, res)
{
    connection.query("SELECT CONCAT(firstname, ' ', lastname) AS Name, email AS Email FROM user", function(error, results)
    {
        return res.send({error: false, data: results, message: "Get all user"});
    });
});

async function GetAllUser()
{
    const res = await(
        await fetch("http://localhost:3030/Search/AllUser",
        {
            method: "GET"
        })
    ).json();
  
    document.getElementById("Result").innerHTML = "<h6 class = 'display-6 text-white'>Result</h6><ul>";
  
    res.data.forEach((user) => 
    {
        document.getElementById("Result").innerHTML += `<li>Name: ${user.Name}<br>Email: ${user.Email}</li>`;
    });
  
    document.getElementById("Result").innerHTML += "</ul>";
}

// Insert userinfo to user and login
app.post("/Register", function (req, res)
{
    let tempID = Math.floor(Math.random() * 101) + 3;
    
    while(userID.includes(tempID)) tempID = Math.floor(Math.random() * 101) + 3;

    userID.push(tempID);
    
    let userinfo = 
    {
        userID: tempID,
        firstname: req.body.userinfo.FName,
        lastname: req.body.userinfo.LName,
        email: req.body.userinfo.Email,
        password: req.body.userinfo.Pass
    };

    if (!userinfo)
    {
        return res.status(400).send({ error: true, message: "Please provide correct information" });
    } else
    {
        connection.query("INSERT INTO user SET ?", userinfo, function (error, result) 
        {
            if (error) throw error;

            const logininfo = 
            {
                userID: userinfo.userID,
                password: userinfo.password,
                role: 'client'
            }

            connection.query("INSERT INTO login SET ?", logininfo, function(error, result)
            {
                if(error) throw error;
            })

            return res.send({error: false, data: result, message: "Registered"});
        });
    }
});

async function AddUser()
{
    let userinfo = 
    {
        FName: document.getElementById("FName").value,
        LName: document.getElementById("LName").value,
        Email: document.getElementById("Email").value,
        Pass: document.getElementById("Pass").value,
    }
    const res = await(
        await fetch("http://localhost:3030/Register",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({userinfo: userinfo})
        })
    ).json();
}

async function Register()
{
    let userinfo = 
    {
        FName: document.getElementById("FName").value,
        LName: document.getElementById("LName").value,
        Email: document.getElementById("Email").value,
        Pass: document.getElementById("Pass").value,
    }
    const res = await(
        await fetch("http://localhost:3030/Register",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({userinfo: userinfo})
        })
    ).json();

    window.location.href = "Login.html";
}

// Update userinfo in user and login
app.put("/Update/User", function(req, res)
{
    let info = 
    {
        firstname: req.body.info.FName,
        lastname: req.body.info.LName,
        email: req.body.info.Email,
        password: req.body.info.Pass,
        role: req.body.info.role
    }

    let userinfo = 
    {
        firstname: req.body.info.FName,
        lastname: req.body.info.LName,
        email: req.body.info.Email,
        password: req.body.info.Pass
    };

    if(!userinfo) return res.send({error: true, message: "Please provide correct information"});

    connection.query("UPDATE user SET ? WHERE userID = ?", [userinfo, req.body.info.userID], function (error, result) 
    {
        if (error) throw error;
    });

    let logininfo = 
    {
        password: req.body.info.Pass,
        role: req.body.info.role
    };

    connection.query("UPDATE login SET ? WHERE userID = ?", [logininfo, req.body.info.userID], function (error, result) 
    {
        if (error) throw error;
    });

    return res.send({error: false, data: info, message: "Updated"});
});

async function UpdateUser()
{
    let info = 
    {
        userID: document.getElementById("userID2").value,
        FName: document.getElementById("FName").value,
        LName: document.getElementById("LName").value,
        Email: document.getElementById("Email").value,
        Pass: document.getElementById("Pass").value,
        role: document.getElementById("role").value
    }
    console.log(info);
    const res = await(
        await fetch("http://localhost:3030/Update/User",
        {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({info: info})
        })
    ).json();
}

// Delete user
app.delete("/Delete/User/:userID", function(req, res)
{
    let userID = req.params.userID;

    connection.query("DELETE FROM login WHERE userID = ?", [userID], function(error, result)
    {
        if(error) throw error;
    });

    connection.query("DELETE FROM user WHERE userID = ?", [userID], function(error, result)
    {
        if(error) throw error;
        return res.send({error: false, data: result.affectedRows, message: "User deleted"});
    });
});

async function DeleteUser(userID)
{
    const res = await(
        await fetch("http://localhost:3030/Delete/User/" + userID,
        {
            method: "DELETE"
        })
    ).json();
}

// Menu in the system
// Search menu by keyword
app.get("/SearchMenu/:Search", function(req, res)
{
    let para = req.params.Search;
    if(!para) return res.status(400).send({error: true, message: "Please provide keyword"});
    let param = `%${para}%`;

    connection.query("SELECT menu_title AS Menu, price AS Price, picture AS url FROM menu where menu_title LIKE ?", param, function(error, results)
    {
        if(error) throw error;
        return res.send({error: false, data: results, message: `Get menu contains ${para}`});
    })
});

async function GetMenuKeyword(Search)
{
    const res = await(
        await fetch("http://localhost:3030/SearchMenu/" + Search,
        {
            method: "GET"
        })
    ).json();
  
    document.getElementById("Result").innerHTML = "<h6 class = 'display-6 text-white'>Result</h6><ul>";

    res.data.forEach((menu) => 
    {
        document.getElementById("Result").innerHTML += `<li><img src = '${menu.url}' style = 'width: 20%'><br>Menu: ${menu.Menu}<br>Price: ${menu.Price}</li>`;
    });
  
    document.getElementById("Result").innerHTML += "</ul>";
}

// Search menu by category
app.get("/Search/Category/:category", function(req, res)
{
    let category = req.params.category;
    if (!category) return res.status(400).send({error: true, message: "Please provide category."});

    connection.query("SELECT menu_title AS Menu, price AS Price, picture AS url FROM menu where category = ?", category, function (error, results) 
    {
        if (error) throw error;
        return res.send({error: false, data: results, message: `Get ${category}`});
    });
});

async function GetByCategory(category)
{
    const res = await(
        await fetch("http://localhost:3030/Search/Category/" + category,
        {
            method: "GET"
        })
    ).json();

    document.getElementById("Result").innerHTML = "<h6 class = 'display-6 text-white'>Result</h6><ul>";

    res.data.forEach((menu) => 
    {
        document.getElementById("Result").innerHTML += `<li><img src = '${menu.url}' style = 'width: 20%'><br>Menu: ${menu.Menu}<br>Price: ${menu.Price}</li>`;
    });
  
    document.getElementById("Result").innerHTML += "</ul>";
}

async function ShowMenu(category)
{
    const res = await(
        await fetch("http://localhost:3030/Search/Category/" + category,
        {
            method: "GET"
        })
    ).json();

    document.getElementById("dimsum-div").innerHTML = "";

    res.data.forEach((menu) =>
    {
        document.getElementById("dimsum-div").innerHTML += `\
        <div class = 'card mb-3'>\
        <div class = 'row g-0'>\
        <div class = 'col-md-4'><img src = '${menu.url}' style = 'width: 100%'></div>\
        <div class = 'col-md-8'>\
        <div class = 'card-body'>\
        <h5 class = 'card-title'>${menu.Menu}</h5>\
        <p class = 'card-subtitle'>THB ${menu.Price}</p></div></div></div></div>`;
    });
};

// Search menu by price
app.get("/Search/Price/:Price", function(req, res)
{
    let price = req.params.Price;
    if(!price) return res.status(400).send({error: true, message: "Please provide price"});

    connection.query("SELECT menu_title AS Menu, price AS Price, picture AS url FROM menu where price <= ?", price, function(error, results)
    {
        if(error) throw error;
        return res.send({error: false, data: results, message: `Get price lower or equal to ${price}`});
    })
});

async function GetByPrice(Price)
{
    const res = await(
        await fetch("http://localhost:3030/Search/Price/" + Price,
        {
            method: "GET"
        })
    ).json();

    document.getElementById("Result").innerHTML = "<h6 class = 'display-6 text-white'>Result</h6><ul>";

    res.data.forEach((menu) => 
    {
        document.getElementById("Result").innerHTML += `<li><img src = '${menu.url}' style = 'width: 20%'><br>Menu: ${menu.Menu}<br>Price: ${menu.Price}</li>`;
    });
  
    document.getElementById("Result").innerHTML += "</ul>";
}

// View all menu
app.get("/Search/AllMenu", function(req, res)
{
    connection.query("SELECT menu_title AS Menu, price AS Price, picture AS url, category FROM menu", function(error, results)
    {
        return res.send({error: false, data: results, message: "Get all menu"});
    });
});

async function GetAllMenu()
{
    const res = await(
    await fetch("http://localhost:3030/Search/AllMenu",
    {
        method: "GET"
    })
    ).json();
  
    document.getElementById("Result").innerHTML = "<h6 class = 'display-6 text-white'>Result</h6><ul>";
  
    res.data.forEach((menu) => 
    {
        document.getElementById("Result").innerHTML += `<li><img src = '${menu.url}' style = 'width: 20%'><br>Menu: ${menu.Menu}<br>Price: ${menu.Price}</li>`;
    });
  
    document.getElementById("Result").innerHTML += "</ul>";
}

// Insert menu
app.post("/AddMenu", function (req, res) 
{
    let menuinfo = 
    {
        menuID: req.body.menuinfo.menuID,
        menu_title: req.body.menuinfo.title,
        category: req.body.menuinfo.category,
        price: req.body.menuinfo.Price
    };
    
    if (!menuinfo)
    {
        return res.status(400).send({ error: true, message: "Please provide correct information" });
    } 
    
    connection.query("INSERT INTO menu SET ?", menuinfo, function (error, result) 
    {
        if (error) throw error;
        return res.send({ error: false, data: result.affectedRows, message: "Completly add menu" });
    });
});

async function AddMenu()
{
    let menuinfo = 
    {
        menuID: document.getElementById("MenuID").value,
        title: document.getElementById("Title").value,
        category: document.getElementById("Category").value,
        Price: document.getElementById("MenuPrice").value,
    }
    const res = await(
        await fetch("http://localhost:3030/AddMenu",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({menuinfo: menuinfo})
        })
    ).json();
}

// Update menuinfo in menu
app.put("/Update/Menu", function(req, res)
{
    let menuinfo = 
    {
        menuID: req.body.menuinfo.menuID,
        menu_title: req.body.menuinfo.title,
        category: req.body.menuinfo.category,
        price: req.body.menuinfo.Price
    };

    if(!menuinfo) return res.send({error: true, message: "Please provide correct information"});

    connection.query("UPDATE menu SET ? WHERE menuID = ?", [menuinfo, menuinfo.menuID], function (error, result) 
    {
        if (error) throw error;
        return res.send({error: false, data: result.affectedRows, message: "Updated"});
    });
});

async function UpdateMenu()
{
    let menuinfo = 
    {
        menuID: document.getElementById("MenuID").value,
        title: document.getElementById("Title").value,
        category: document.getElementById("Category").value,
        Price: document.getElementById("MenuPrice").value,
    }

    const res = await(
        await fetch("http://localhost:3030/Update/Menu",
        {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({menuinfo: menuinfo})
        })
    ).json();
}

// Delete menu
app.delete("/Delete/Menu/:menuID", function(req, res)
{
    let menuID = req.params.menuID;

    connection.query("DELETE FROM menu WHERE menuID = ?", [menuID], function(error, result)
    {
        if(error) throw error;
        return res.send({error: false, data: result.affectedRows, message: "Menu deleted"});
    });
});

async function DeleteMenu(menuID)
{
    const res = await(
        await fetch("http://localhost:3030/Delete/Menu/" + menuID,
        {
            method: "DELETE"
        })
    ).json();
}

// Public API
// let map;

// function initMap() {
//     let map = new google.maps.Map(document.getElementById("map"), {
//       center: { lat: -34.397, lng: 150.644 },
//       zoom: 8,
//     });
//   }

// App listen
app.listen(port, () => 
{
  console.log(`Listening at http://localhost:${port}`);
});