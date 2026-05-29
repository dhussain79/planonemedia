<?php

/**
 * Creates PlanOneMedia content types and fields.
 */

// ---- 1. Media Listing ----
$media_listing = \Drupal\node\Entity\NodeType::create([
  'type' => 'media_listing',
  'name' => 'Media Listing',
  'description' => 'Core media asset listing (billboard, digital screen, bridge banner, etc.)',
]);
$media_listing->save();
echo "Created: media_listing\n";

// ---- 2. Supplier Profile ----
$supplier = \Drupal\node\Entity\NodeType::create([
  'type' => 'supplier_profile',
  'name' => 'Supplier Profile',
  'description' => 'Media owner / company profile',
]);
$supplier->save();
echo "Created: supplier_profile\n";

echo "Done.\n";
