-- Dummy data for registered_employees table
INSERT INTO registered_employees
   (name, password_hash, design_priv, inventory_priv, view_reports_priv)
VALUES
   ("John Doe", SHA2("password123", 256), 1, 0, 1),
   ("Jane Smith", SHA2("securepass", 256), 0, 1, 1),
   ("Alice Johnson", SHA2("mysecret", 256), 1, 1, 0);

-- Dummy data for menu_items table
INSERT INTO menu_items
   (item_name, item_desc, item_image, item_price, quantity_sold, revenue_generated, item_status)
VALUES
   ("Burger", "Delicious burger with cheese", "burger.jpg", 5.99, 100, 599.00, 1),
   ("Pizza", "Pepperoni pizza with extra cheese", "pizza.jpg", 8.99, 75, 674.25, 1),
   ("Salad", "Fresh garden salad with dressing", "salad.jpg", 4.49, 50, 224.50, 1);

-- Dummy data for api_connected_devices table
INSERT INTO api_connected_devices
   (ip_address, device_name, api_token, mac_address)
VALUES
   ("192.168.1.10", "Kiosk 1", "token123", "00:1A:2B:3C:4D:5E"),
   ("192.168.1.11", "Kiosk 2", "token456", "00:2B:3C:4D:5E:6F"),
   ("192.168.1.12", "Kiosk 3", "token789", "00:3C:4D:5E:6F:7A");

-- Dummy data for order_queue table
INSERT INTO order_queue
   (order_id, customer_name, total_price, transaction_date, kiosk_ip_address)
VALUES
   (101, "Customer A", 15.98, '2023-09-08', "192.168.1.10"),
   (102, "Customer B", 24.99, '2023-09-08', "192.168.1.11"),
   (103, "Customer C", 9.49, '2023-09-08', "192.168.1.12"),
   (104, "Customer D", 12.99, '2023-09-08', "192.168.1.10"); -- New entry with queue_number 4

-- Dummy data for items_ordered table
INSERT INTO items_ordered
   (item_id, item_name, item_price, quantity, quantity_times_price, queue_number, order_id)
VALUES
   (1, "Burger", 5.99, 2, 11.98, 1, 101),
   (2, "Pizza", 8.99, 1, 8.99, 1, 101),
   (2, "Pizza", 8.99, 1, 8.99, 2, 102),
   (1, "Burger", 5.99, 2, 11.98, 2, 102),
   (3, "Salad", 4.49, 3, 13.47, 3, 103),
   (1, "Burger", 5.99, 1, 5.99, 3, 103),
   (3, "Salad", 4.49, 2, 8.98, 4, 104),
   (2, "Pizza", 8.99, 2, 17.98, 4, 104);

-- Dummy data for order_queue_history table
INSERT INTO order_queue_history
   (order_id, queue_number, transaction_date, customer_name, total_price, kiosk_ip_address)
VALUES
   (101, 1, '2023-09-07', "Customer A", 15.98, "192.168.1.10"),
   (102, 2, '2023-09-07', "Customer B", 24.99, "192.168.1.11"),
   (103, 3, '2023-09-07', "Customer C", 9.49, "192.168.1.12");

-- Dummy data for order_stats table
INSERT INTO order_stats
   (transaction_date, total_orders_taken, total_orders_done, total_orders_canceled, total_earnings)
VALUES
   ('2023-09-08', 4, 4, 0, 64.45),
   ('2023-09-07', 3, 3, 0, 50.46);

-- Dummy data for items_ordered_history table
INSERT INTO items_ordered_history
   (item_id, order_id, item_name, item_price, quantity, quantity_times_price)
VALUES
   (1, 101, "Burger", 5.99, 2, 11.98),
   (2, 101, "Pizza", 8.99, 1, 8.99),
   (2, 102, "Pizza", 8.99, 1, 8.99),
   (1, 102, "Burger", 5.99, 2, 11.98),
   (3, 103, "Salad", 4.49, 3, 13.47),
   (1, 103, "Burger", 5.99, 1, 5.99),
   (3, 104, "Salad", 4.49, 2, 8.98),
   (2, 104, "Pizza", 8.99, 2, 17.98);
