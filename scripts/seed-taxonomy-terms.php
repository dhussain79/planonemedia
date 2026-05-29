<?php

/**
 * Seeds taxonomy terms for PlanOneMedia.
 */

$terms = [
  'media_type' => [
    'Billboard',
    'Unipole',
    'Digital Screen',
    'Bridge Banner',
    'Street Furniture',
    'Transit Advertising',
    'Building Wrap',
    'LED Facade',
  ],
  'region' => [
    'KSA',
    'UAE',
    'Bahrain',
    'Kuwait',
    'Oman',
    'Qatar',
  ],
  'city' => [
    'Riyadh',
    'Jeddah',
    'Dammam',
    'Khobar',
    'Makkah',
    'Madinah',
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Kuwait City',
    'Manama',
    'Muscat',
    'Doha',
  ],
  'listing_status' => [
    'Available',
    'Booked',
    'Under Maintenance',
  ],
];

foreach ($terms as $vid => $term_names) {
  foreach ($term_names as $name) {
    $term = \Drupal\taxonomy\Entity\Term::create([
      'vid' => $vid,
      'name' => $name,
    ]);
    $term->save();
    echo "  Added term '$name' to $vid\n";
  }
}

echo "All taxonomy terms seeded.\n";
