<?php
/**
 * MCP Server STDIO Wrapper
 * Bootstraps Drupal and runs MCP server via STDIO transport.
 * Designed to be used as an OpenCode/Claude MCP server command.
 *
 * Usage: php /var/www/html/web/mcp-server.php
 */

$autoloader = require_once '/var/www/html/vendor/autoload.php';
use Drupal\Core\DrupalKernel;
use Symfony\Component\HttpFoundation\Request;

$request = Request::createFromGlobals();
$kernel = DrupalKernel::createFromRequest($request, $autoloader, 'prod');
$kernel->boot();

$server = \Drupal::service('mcp_server.server');
$transport = new \Mcp\Server\Transport\StdioTransport();
$server->run($transport);
