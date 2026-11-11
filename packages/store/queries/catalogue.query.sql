-- name: ListFurniDefinitions :many
SELECT * FROM furni_definitions ORDER BY id;

-- name: ListCataloguePages :many
SELECT * FROM catalogue_pages ORDER BY position, id;

-- name: ListCataloguePageTexts :many
SELECT * FROM catalogue_page_texts ORDER BY catalogue_page_id, number;

-- name: ListCatalogueItems :many
SELECT * FROM catalogue_items ORDER BY catalogue_page_id, position, id;

-- name: ListCatalogueItemFurni :many
SELECT * FROM catalogue_item_furni ORDER BY catalogue_item_id, furni_definition_id;
