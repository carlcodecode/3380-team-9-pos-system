USE bento_pos;

--
-- Trigger for notifying order shipment/delivery to customers
--

DROP TRIGGER IF EXISTS trg_order_delivery_notif;
DELIMITER $$
CREATE TRIGGER trg_order_delivery_notif
AFTER UPDATE ON ORDERS
FOR EACH ROW
BEGIN
-- Trigger logic of shipments (Shipped and delivered), alongside the customer, tracking, and shipment timestamp
IF NOT (NEW.order_status <=> OLD.order_status) THEN -- Checks for order status update
	IF NEW.order_status = 2 THEN -- Checks if order shipped where shipped = status # 2
		INSERT INTO EVENT_OUTBOX (event_type, ref_order_id, payload_json) -- Storing the "processed" event
        VALUES (
			'ORDER_SHIPPED',
            NEW.order_id,
            JSON_OBJECT (
            'tracking_number', NEW.tracking_number,
            'customer_ref', NEW.customer_ref,
            'shipped_at', NOW()
            )
		);
	END IF;
    
    IF NEW.order_status = 3 THEN
		INSERT INTO EVENT_OUTBOX (event_type, ref_order_id, payload_json)
        VALUES (
			'ORDER_DELIVERED',
			NEW.order_id,
			JSON_OBJECT (
				'tracking_number', NEW.tracking_number,
				'customer_ref', NEW.customer_ref,
				'delivered_at', NOW()
			)
		);
	END IF;
END IF;

	-- Protection to ensure the event will occur if and only if the order has tracking (will not occur on change or without)
	IF (OLD.tracking_number IS NULL OR OLD.tracking_number = '')
		AND NEW.tracking_number IS NOT NULL AND NEW.tracking_number <> '' THEN
		INSERT INTO EVENT_OUTBOX (event_type, ref_order_id, payload_json)
		VALUES (
			'ORDER_TRACKING_ASSIGNED',
			NEW.order_id,
			JSON_OBJECT (
				'tracking_number', NEW.tracking_number,
				'assigned_at', NOW()
			)
		);
	END IF;
END $$
DELIMITER ;

--
-- Trigger for restocking when stock reaches the threshold
--

DROP TRIGGER IF EXISTS trg_inv_restock;
DELIMITER $$
CREATE TRIGGER trg_inv_restock
BEFORE UPDATE ON STOCK
FOR EACH ROW
BEGIN
	SET NEW.needs_reorder = (NEW.quantity_in_stock <= NEW.reorder_threshold); -- Create status on if restock needed (updated for bool)
    -- Marks latest restock date
    IF NEW.quantity_in_stock > OLD.quantity_in_stock THEN
		SET NEW.last_restock = CURRENT_DATE;
	END IF;
    -- Notify of which meal needs a restock, alongside what it is, how much is left, the threshold trigger, and when it was triggered
    IF (OLD.quantity_in_stock > OLD.reorder_threshold)
		AND (NEW.quantity_in_stock <= NEW.reorder_threshold) THEN
		INSERT INTO EVENT_OUTBOX (event_type, ref_order_id, payload_json)
        VALUES (
			'INVENTORY_RESTOCK_NEEDED',
            NULL,
            JSON_OBJECT(
				'meal_ref', NEW.meal_ref,
                'stock_id', NEW.stock_id,
                'quantity_in_stock', NEW.quantity_in_stock,
                'reorder_threshold', NEW.reorder_threshold,
                'detected_at', NOW()
			)
		);
	END IF;
END $$
DELIMITER ;