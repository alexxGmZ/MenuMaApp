-- Inserting data into the registered_employees table
INSERT INTO registered_employees (employee_id, name, `password`, design_priv, inventory_priv, view_reports_priv)
VALUES
   -- (1, 'admin', SHA2('password', 256), 1, 1, 1),
   (2, 'manager1', SHA2('managerpass', 256), 1, 1, 1),
   (3, 'employee1', SHA2('employeepass', 256), 0, 1, 0),
   (4, 'employee2', SHA2('securepass', 256), 1, 0, 1),
   (5, 'supervisor', SHA2('securepass2', 256), 1, 1, 1);

-- Inserting data into the menu_items table
INSERT INTO menu_items (item_id, item_name, item_desc, item_image, item_price, quantity_sold, revenue_generated)
VALUES
   (1, 'Burger', 'A delicious burger', 'burger.jpg', 5.99, 200, 1198.00),
   (2, 'Pizza', 'Tasty pizza with various toppings', 'pizza.jpg', 8.99, 150, 1348.50),
   (3, 'Fries', 'Crispy french fries', 'fries.jpg', 2.49, 300, 747.00),
   (4, 'Salad', 'Fresh garden salad', 'salad.jpg', 4.99, 100, 499.00),
   (5, 'Soda', 'Refreshing soda', 'soda.jpg', 1.49, 500, 745.00);

-- Inserting data into the api_connected_devices table
INSERT INTO api_connected_devices (ip_address, device_name, api_token, mac_address)
VALUES
   ('192.168.1.100', 'Kiosk1', 'token123', '00:1A:2B:3C:4D:5E'),
   ('192.168.1.101', 'Kiosk2', 'token456', '00:2A:3B:4C:5D:6E'),
   ('192.168.1.102', 'Kiosk3', 'token789', '00:3A:4B:5C:6D:7E'),
   ('192.168.1.103', 'Kiosk4', 'token012', '00:4A:5B:6C:7D:8E');

-- Inserting data into the order_queue table
INSERT INTO order_queue (order_id, employee_id, customer_name, total_price, transaction_date, kiosk_ip_address)
VALUES
   (1, 2, 'John Doe', 13.47, '2023-09-08', '192.168.1.100'),
   (2, 3, 'Jane Smith', 8.99, '2023-09-08', '192.168.1.101'),
   (3, NULL, 'Guest User', 5.99, '2023-09-08', '192.168.1.102'),
   (4, 4, 'Alice Johnson', 18.47, '2023-09-07', '192.168.1.103'),
   (5, 5, 'Bob Brown', 6.47, '2023-09-07', '192.168.1.100'),
   (6, 2, 'Eva White', 7.99, '2023-09-06', '192.168.1.101');

-- Inserting data into the order_queue_history table
INSERT INTO order_queue_history (order_id, queue_number, transaction_date, customer_name, total_price, kiosk_ip_address)
VALUES
   (1, 1, '2023-09-08', 'John Doe', 13.47, '192.168.1.100'),
   (2, 2, '2023-09-08', 'Jane Smith', 8.99, '192.168.1.101'),
   (3, 3, '2023-09-08', 'Guest User', 5.99, '192.168.1.102'),
   (4, 4, '2023-09-07', 'Alice Johnson', 18.47, '192.168.1.103'),
   (5, 5, '2023-09-07', 'Bob Brown', 6.47, '192.168.1.100'),
   (6, 6, '2023-09-06', 'Eva White', 7.99, '192.168.1.101');

-- Inserting data into the order_stats table
INSERT INTO order_stats (transaction_date, total_orders_taken, total_orders_done, total_orders_canceled, total_earnings)
VALUES
   ('2023-09-08', 3, 2, 0, 28.45),
   ('2023-09-07', 2, 2, 0, 24.94),
   ('2023-09-06', 1, 1, 0, 7.99);

-- Inserting data into the items_ordered table
INSERT INTO items_ordered (item_id, item_name, item_price, quantity, quantity_times_price, queue_number, order_id)
VALUES
   (1, 'Burger', 5.99, 2, 11.98, 1, 1),
   (2, 'Pizza', 8.99, 1, 8.99, 2, 2),
   (3, 'Fries', 2.49, 3, 7.47, 3, 3),
   (4, 'Salad', 4.99, 2, 9.98, 4, 4),
   (5, 'Soda', 1.49, 4, 5.96, 5, 5),
   (1, 'Burger', 5.99, 1, 5.99, 6, 6),
   (2, 'Pizza', 8.99, 2, 17.98, 6, 6);

-- Inserting data into the items_ordered_history table
INSERT INTO items_ordered_history (items_ordered_id, order_id, item_id, item_name, item_price, quantity, quantity_times_price)
VALUES
   (1, 1, 1, 'Burger', 5.99, 2, 11.98),
   (2, 2, 2, 'Pizza', 8.99, 1, 8.99),
   (3, 3, 3, 'Fries', 2.49, 3, 7.47),
   (4, 4, 4, 'Salad', 4.99, 2, 9.98),
   (5, 5, 5, 'Soda', 1.49, 4, 5.96),
   (6, 6, 1, 'Burger', 5.99, 1, 5.99),
   (7, 6, 2, 'Pizza', 8.99, 2, 17.98);
