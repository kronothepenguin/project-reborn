---
type: SQL Query
title: catalogue.query.sql
description: Catalogue operations that list the furni definitions, the pages with their texts, the items and the furni each item gives, for the game server to load.
resource: packages/store/queries/catalogue.query.sql
tags: [store, query, catalogue]
timestamp: 2026-11-11T15:49:58+00:00
---

# Operations

## ListFurniDefinitions

- Cardinality: `:many`
- Inputs: none
- Result: every furni definition, by id
- Tables: `furni_definitions`

## ListCataloguePages

- Cardinality: `:many`
- Inputs: none
- Result: every page, in the catalogue's order, by position and then id
- Tables: `catalogue_pages`

## ListCataloguePageTexts

- Cardinality: `:many`
- Inputs: none
- Result: every page's numbered texts, by page and number
- Tables: `catalogue_page_texts`

## ListCatalogueItems

- Cardinality: `:many`
- Inputs: none
- Result: every item, by page, then by position and id
- Tables: `catalogue_items`

## ListCatalogueItemFurni

- Cardinality: `:many`
- Inputs: none
- Result: the furni every item gives, by item and definition
- Tables: `catalogue_item_furni`
