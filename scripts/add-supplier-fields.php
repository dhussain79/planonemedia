<?php

/**
 * Adds fields to Supplier Profile content type.
 */

$entity_type = 'node';
$bundle = 'supplier_profile';

function entity_field_create($entity_type, $bundle, $field_name, $field_type, $label, $widget_id, $settings = [], $field_storage_settings = []) {
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

// Company logo (media reference).
entity_field_create($entity_type, $bundle, 'field_logo', 'entity_reference', 'Company Logo', 'media_library_widget', [
  'settings' => [
    'handler' => 'default:media',
    'handler_settings' => ['target_bundles' => ['image' => 'image']],
  ],
], ['cardinality' => 1, 'settings' => ['target_type' => 'media']]);

// Company description.
entity_field_create($entity_type, $bundle, 'field_company_description', 'text_long', 'Company Description', 'string_textarea', [],
  ['cardinality' => 1]);

// Contact email.
entity_field_create($entity_type, $bundle, 'field_contact_email', 'email', 'Contact Email', 'email_default', [],
  ['cardinality' => 1]);

// Contact phone.
entity_field_create($entity_type, $bundle, 'field_contact_phone', 'telephone', 'Contact Phone', 'telephone_default', [],
  ['cardinality' => 1]);

// Portfolio (entity reference back to media_listing).
entity_field_create($entity_type, $bundle, 'field_portfolio', 'entity_reference', 'Portfolio', 'options_select', [
  'settings' => [
    'handler' => 'default:node',
    'handler_settings' => ['target_bundles' => ['media_listing' => 'media_listing']],
  ],
], ['cardinality' => -1, 'settings' => ['target_type' => 'node']]);

echo "Supplier Profile fields complete.\n";
