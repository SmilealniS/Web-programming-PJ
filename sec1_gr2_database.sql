DROP DATABASE IF EXISTS system_log;
CREATE DATABASE system_log;
use system_log;

CREATE TABLE `user` (
	userID		INT(5) PRIMARY KEY,
    firstname	VARCHAR(45),
    lastname	VARCHAR(45),
    email		VARCHAR(100),
    `password`	VARCHAR(40)
);

CREATE TABLE login (
	userID			INT(5),
    `password`		VARCHAR(40),
    `role`			VARCHAR(6),
    CONSTRAINT FK_LoginUser FOREIGN KEY (userID) REFERENCES `user`(userID)
);

CREATE TABLE menu (
	menuID		INT(4) PRIMARY KEY,
    menu_title	VARCHAR(100),
    category	VARCHAR(10),
    price		INT(3),
    picture		LONGTEXT	DEFAULT NULL
);

CREATE TABLE `order` (
	orderID			INT(9) PRIMARY KEY,
    userID			INT(5),
    order_datetime	DATETIME,
    CONSTRAINT FK_OrderUser FOREIGN KEY (userID) REFERENCES `user`(userID)
);

CREATE TABLE food_order (
	orderID	INT(9),
    menuID	INT(4),
    amount	INT(3),
    PRIMARY KEY (orderID, menuID),
    CONSTRAINT FK_FoodOrder	FOREIGN KEY (orderID)	REFERENCES `order`(orderID),
    CONSTRAINT FK_FoodMenu	FOREIGN KEY (menuID)	REFERENCES `menu`(menuID)
);

INSERT INTO `user` VALUES
	(1, "Tony", "Stark", "iron_man@gmail.com", "iamironman"),
    (2, "Steve", "Roger", "captain_america@gmail.com", "icandothisallday"),
    (3, "Bruce", "Banner", "the_hulk@gmail.com", "punygod");
    
INSERT INTO login VALUES
	(1, "iamironman", "admin"),
    (2, "icandothisallday", "client"),
    (3, "punygod", "client");

INSERT INTO menu VALUES
	(1001, "Pork Dumpling + Shrimp Dumpling", "Dim Sum", 40, "Picture/Menu/Pork Dumpling + Shrimp Dumpling.jpg"),
    (1002, "Steamed Stuffed Seaweed", "Dim Sum", 40, "Picture/Menu/Steamed Stuffed Seaweed.jpg"),
    (1003, "Steamed Pork Dumpling", "Dim Sum", 40, "Picture/Menu/Steamed Pork Dumpling.jpg"),
    (1004, "Steamed Vegetables and Pork", "Dim Sum", 40, "Picture/Menu/Steamed Vegetables and Pork.jpg"),
    (1005, "Salted Egg with Pork", "Dim Sum", 40, "Picture/Menu/Salted Egg with Pork.jpg"),
    (1006, "Steamed Stuffed Preserved Egg", "Dim Sum", 40, "Picture/Menu/Steamed Stuffed Preserved Egg.jpg"),
    (1007, "Pork Wrap with Jade Noodles", "Dim Sum", 40, "Picture/Menu/Pork Wrap with Jade Noodles.jpg"),
    (1008, "Steamed Fish Soya Sauce", "Dim Sum", 40, "Picture/Menu/Steamed Fish Soya Sauce.jpg"),
    (1009, "Bacon Wrapped Golden Needle Mushroom - Seafood Sauce", "Dim Sum", 40, "Picture/Menu/Bacon Wrapped Golden Needle Mushroom - Seafood Sauce.jpg"),
    (2001, "Black Sesame Bualoy in Ginger Juice", "Dessert", 30, "Picture/Menu/Black Sesame Bualoy in Ginger Juice.jpg");

INSERT INTO `order` VALUES
	(1, 2, "2021-04-08 11:27:33"),
    (2, 3, "2021-04-08 12:26:56"),
    (3, 2, "2021-04-08 17:27:33");

INSERT INTO food_order VALUES
	(1, 1001, 1),
    (2, 1001, 1),
    (2, 2001, 1),
    (3, 1002, 2);