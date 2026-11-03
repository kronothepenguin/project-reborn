-- name: CreateHomeStoreCategory :exec
INSERT INTO home_store_categories (id, name, staff_only, position)
VALUES (sqlc.arg(id), sqlc.arg(name), sqlc.arg(staff_only), sqlc.arg(position));

-- Holo's ids are kept, so that the seed's items find their categories.
-- name: SeedHomeStoreItem :exec
INSERT INTO home_store_items (id, home_store_category_id, kind, asset, name, price, quantity)
VALUES (
    sqlc.arg(id), sqlc.arg(home_store_category_id), sqlc.arg(kind), sqlc.arg(asset), sqlc.arg(name),
    sqlc.arg(price), sqlc.arg(quantity)
);

-- name: CreateHomeStoreItem :one
INSERT INTO home_store_items (home_store_category_id, kind, asset, name, price, quantity, enabled)
VALUES (
    sqlc.arg(home_store_category_id), sqlc.arg(kind), sqlc.arg(asset), sqlc.arg(name), sqlc.arg(price),
    sqlc.arg(quantity), sqlc.arg(enabled)
)
RETURNING *;

-- name: ListHomeStoreCategories :many
SELECT * FROM home_store_categories
ORDER BY position, id;

-- name: GetHomeStoreCategory :one
SELECT * FROM home_store_categories WHERE id = sqlc.arg(id);

-- name: ListEnabledHomeStoreItems :many
SELECT * FROM home_store_items
WHERE home_store_category_id = sqlc.arg(home_store_category_id) AND enabled
ORDER BY id;

-- name: ListHomeStoreItems :many
SELECT * FROM home_store_items
ORDER BY home_store_category_id, id;

-- name: GetHomeStoreItem :one
SELECT * FROM home_store_items WHERE id = sqlc.arg(id);

-- name: UpdateHomeStoreItem :exec
UPDATE home_store_items
SET home_store_category_id = sqlc.arg(home_store_category_id), name = sqlc.arg(name), price = sqlc.arg(price),
    quantity = sqlc.arg(quantity), enabled = sqlc.arg(enabled)
WHERE id = sqlc.arg(id);
