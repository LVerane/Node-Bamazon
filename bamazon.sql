CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  id INT NOT NULL AUTO_INCREMENT,
  product VARCHAR(50) NOT NULL,
  department VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT (10),
  sold INT (10) DEFAULT 0,
  PRIMARY KEY (id)
);

INSERT INTO products (product, department, price, stock)
VALUES ("Item A", "Department AG", 10.55, 5), ("Item B", "Department AG", 8.45, 5), ("Item C", "Department AG", 11.75, 10), ("Item D", "Department BT", 99.95, 15), ("Item E", "Department BT", 84.95, 20),
("Item F", "Department FT", 149.95, 2), ("Item G", "Department FT", 199.95, 2), ("Item H", "Department PO", 3.15, 20), ("Item I", "Department LM", 27.35, 15), ("Item J", "Department LM", 2.75, 10);

SELECT * FROM products;