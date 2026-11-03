-- name: AddHomeInventory :exec
INSERT INTO home_inventory (user_id, home_store_item_id, quantity)
VALUES (sqlc.arg(user_id), sqlc.arg(home_store_item_id), sqlc.arg(quantity))
ON CONFLICT (user_id, home_store_item_id) DO UPDATE SET quantity = home_inventory.quantity + excluded.quantity;

-- name: GetHomeInventoryQuantity :one
SELECT quantity FROM home_inventory
WHERE user_id = sqlc.arg(user_id) AND home_store_item_id = sqlc.arg(home_store_item_id);

-- name: ListHomeInventory :many
SELECT home_store_items.id, home_store_items.kind, home_store_items.asset, home_store_items.name, home_inventory.quantity
FROM home_inventory
JOIN home_store_items ON home_store_items.id = home_inventory.home_store_item_id
WHERE home_inventory.user_id = sqlc.arg(user_id) AND home_inventory.quantity > 0
ORDER BY home_store_items.id;

-- The guard keeps the inventory from going below zero: no row changed means the
-- user held too few.
-- name: TakeHomeInventory :execrows
UPDATE home_inventory SET quantity = quantity - sqlc.arg(quantity)
WHERE user_id = sqlc.arg(user_id) AND home_store_item_id = sqlc.arg(home_store_item_id) AND quantity >= sqlc.arg(quantity);
