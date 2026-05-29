@echo off
REM MCP STDIO Server Wrapper for DDEV Drupal
REM Pipes JSON-RPC messages through to the Drupal MCP server
cd /d "%~dp0.."
ddev exec php /var/www/html/web/mcp-server.php %*
