<?php
// api/v1/index.php

require_once 'config.php';
require_once 'router.php';

// Simple router to handle incoming requests
$uri = $_SERVER['REQUEST_URI'] ?? '/';
route_request($uri);
?>
