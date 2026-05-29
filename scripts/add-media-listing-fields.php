<?php

/**
 * Adds fields to Media Listing content type with proper handler settings.
 */

$entity_type = 'node';
$bundle = 'media_listing';

function entity_field_create($entity_type, $bundle, $field_name, $field_type, $label, $widget_id, $settings = [], $field_storage_settings = []) {
  // Storage.
  $storage = \Drupal\field\Entity\FieldStorageConfig::loadByName($entity_type, $field_name);
  if (!$storage) {
    $storage = \Drupal\field\Entity\FieldStorageConfig::create([
      'field_name' => $field_name,
      'entity_type' => $entity_type,
      'type' => $field_type,
    ] + $field_storage_settings);
    $storage->save();
    echo "  Storage: $field_name\n";
  }

  // Instance.
  $field = \Drupal\field\Entity\FieldConfig::loadByName($entity_type, $bundle, $field_name);
  if (!$field) {
    $field = \Drupal\field\Entity\FieldConfig::create([
      'field_name' => $field_name,
      'entity_type' => $entity_type,
      'bundle' => $bundle,
      'label' => $label,
    ] + $settings);
    $field->save();
    echo "  Field: $field_name\n";
  }
}

// Media Type (taxonomy reference to media_type).
entity_field_create($entity_type, $bundle, 'field_media_type', 'entity_reference', 'Media Type', 'options_select', [
  'settings' => [
    'handler' => 'default:taxonomy_term',
    'handler_settings' => ['target_bundles' => ['media_type' => 'media_type']],
  ],
], ['cardinality' => 1, 'settings' => ['target_type' => 'taxonomy_term']]);

// Region.
entity_field_create($entity_type, $bundle, 'field_region', 'entity_reference', 'Region', 'options_select', [
  'settings' => [
    'handler' => 'default:taxonomy_term',
    'handler_settings' => ['target_bundles' => ['region' => 'region']],
  ],
], ['cardinality' => 1, 'settings' => ['target_type' => 'taxonomy_term']]);

// City.
entity_field_create($entity_type, $bundle, 'field_city', 'entity_reference', 'City', 'options_select', [
  'settings' => [
    'handler' => 'default:taxonomy_term',
    'handler_settings' => ['target_bundles' => ['city' => 'city']],
  ],
], ['cardinality' => 1, 'settings' => ['target_type' => 'taxonomy_term']]);

// Listing Status.
entity_field_create($entity_type, $bundle, 'field_listing_status', 'entity_reference', 'Listing Status', 'options_select', [
  'settings' => [
    'handler' => 'default:taxonomy_term',
    'handler_settings' => ['target_bundles' => ['listing_status' => 'listing_status']],
  ],
], ['cardinality' => 1, 'settings' => ['target_type' => 'taxonomy_term']]);

// Latitude.
entity_field_create($entity_type, $bundle, 'field_latitude', 'string', 'Latitude', 'string_textfield', [],
  ['cardinality' => 1]);

// Longitude.
entity_field_create($entity_type, $bundle, 'field_longitude', 'string', 'Longitude', 'string_textfield', [],
  ['cardinality' => 1]);

// Rate Card.
entity_field_create($entity_type, $bundle, 'field_rate_card', 'string_long', 'Rate Card', 'string_textarea', [],
  ['cardinality' => 1]);

// Images (media reference, unlimited).
entity_field_create($entity_type, $bundle, 'field_images', 'entity_reference', 'Images', 'media_library_widget', [
  'settings' => [
    'handler' => 'default:media',
    'handler_settings' => ['target_bundles' => ['image' => 'image']],
    'media_types' => [],
  ],
], ['cardinality' => -1, 'settings' => ['target_type' => 'media']]);

// Supplier reference.
entity_field_create($entity_type, $bundle, 'field_supplier', 'entity_reference', 'Supplier', 'options_select', [
  'settings' => [
    'handler' => 'default:node',
    'handler_settings' => ['target_bundles' => ['supplier_profile' => 'supplier_profile']],
  ],
], ['cardinality' => 1, 'settings' => ['target_type' => 'node']]);

echo "Media Listing fields complete.\n";
