<?php

$config = \Drupal::configFactory()->getEditable('language.types');
$interface = $config->get('negotiation.language_interface');
$interface['enabled'] = ['language-url' => 0];
$config->set('negotiation.language_interface', $interface);
$config->save();
print "Fixed language_interface negotiation\n";
