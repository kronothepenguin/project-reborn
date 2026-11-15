-- name: ListFurniDefinitions :many
SELECT * FROM furni_definitions ORDER BY id;

-- name: ListCataloguePages :many
SELECT * FROM catalogue_pages ORDER BY position, id;

-- name: ListCataloguePageTexts :many
SELECT * FROM catalogue_page_texts ORDER BY catalogue_page_id, number;

-- name: ListCatalogueItems :many
SELECT * FROM catalogue_items ORDER BY catalogue_page_id, position, id;

-- name: ListCatalogueItemFurni :many
SELECT * FROM catalogue_item_furnis ORDER BY catalogue_item_id, furni_definition_id;

-- name: GetFurniDefinition :one
SELECT * FROM furni_definitions WHERE id = sqlc.arg(id);

-- Of the definitions that share a sprite, the one with the lowest id, as Holo took the first (decision
-- server/0120).
-- name: GetFurniDefinitionBySprite :one
SELECT * FROM furni_definitions WHERE sprite = sqlc.arg(sprite) ORDER BY id LIMIT 1;

-- The name of the first catalogue item that sells the furni alone, one piece of it.
-- name: GetFurniName :one
SELECT catalogue_items.name
FROM catalogue_items
JOIN catalogue_item_furnis ON catalogue_item_furnis.catalogue_item_id = catalogue_items.id
WHERE catalogue_item_furnis.furni_definition_id = sqlc.arg(furni_definition_id)
    AND catalogue_item_furnis.amount = 1
    AND (SELECT COUNT(*) FROM catalogue_item_furnis AS pieces WHERE pieces.catalogue_item_id = catalogue_items.id) = 1
ORDER BY catalogue_items.id
LIMIT 1;
