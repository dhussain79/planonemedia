<?php
$autoloader = require_once '/var/www/html/vendor/autoload.php';
use Drupal\Core\DrupalKernel;
use Symfony\Component\HttpFoundation\Request;

$request = Request::createFromGlobals();
$kernel = DrupalKernel::createFromRequest($request, $autoloader, 'prod');
$kernel->boot();

// List all available MCP tool plugins
$toolManager = \Drupal::service('plugin.manager.mcp_server.tool');
echo "Tool plugins:\n";
print_r($toolManager->getDefinitions());

// List all Tool API tools
echo "\nTool API tools:\n";
try {
  $toolApiManager = \Drupal::service('plugin.manager.tool');
  print_r($toolApiManager->getDefinitions());
} catch (Exception $e) {
  echo "Tool API not available: " . $e->getMessage() . "\n";
}

// List MCP tool config entities
echo "\nMCP Tool Config entities:\n";
try {
  $configs = \Drupal::entityTypeManager()->getStorage('mcp_tool_config')->loadMultiple();
  print_r($configs);
} catch (Exception $e) {
  echo "Error: " . $e->getMessage() . "\n";
}
