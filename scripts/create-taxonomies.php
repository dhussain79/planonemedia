<?php

/**
 * Creates PlanOneMedia taxonomy vocabularies for media listings.
 */

// ---- 1. Media Type ----
$media_type = \Drupal\taxonomy\Entity\Vocabulary::create([
  'vid' => 'media_type',
  'name' => 'Media Type',
  'description' => 'Types of media assets (Billboard, Digital Screen, etc.)',
]);
$media_type->save();
echo "Created vocabulary: media_type\n";

// ---- 2. Region ----
$region = \Drupal\taxonomy\Entity\Vocabulary::create([
  'vid' => 'region',
  'name' => 'Region',
  'description' => 'Geographic region/country',
]);
$region->save();
echo "Created vocabulary: region\n";

// ---- 3. City ----
$city = \Drupal\taxonomy\Entity\Vocabulary::create([
  'vid' => 'city',
  'name' => 'City',
  'description' => 'City within region',
]);
$city->save();
echo "Created vocabulary: city\n";

// ---- 4. Listing Status ----
$status = \Drupal\taxonomy\Entity\Vocabulary::create([
  'vid' => 'listing_status',
  'name' => 'Listing Status',
  'description' => 'Availability status of media listings',
]);
$status->save();
echo "Created vocabulary: listing_status\n";

echo "All vocabularies created.\n";
