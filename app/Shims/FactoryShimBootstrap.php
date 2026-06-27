<?php

/**
 * Factory shim bootstrap.
 *
 * Loaded via composer.json "autoload.files" on every request.
 * Defines 3 factory classes whose source files are permanently locked
 * by the Windows file system (PHP cannot read them).
 * The shim classes in app/Shims/*FactoryShim.php provide minimal
 * definitions; we use class_alias to expose them under their original
 * FQCN so Laravel's factory resolver succeeds.
 */

require_once __DIR__ . "/UserFactoryShim.php";
require_once __DIR__ . "/ProfileFactoryShim.php";
require_once __DIR__ . "/AdminConversationFactoryShim.php";

if (!class_exists("Database\\Factories\\UserFactory", false)) {
    class_alias("App\\Shims\\UserFactoryShim", "Database\\Factories\\UserFactory");
}
if (!class_exists("Database\\Factories\\ProfileFactory", false)) {
    class_alias("App\\Shims\\ProfileFactoryShim", "Database\\Factories\\ProfileFactory");
}
if (!class_exists("Database\\Factories\\AdminConversationFactory", false)) {
    class_alias("App\\Shims\\AdminConversationFactoryShim", "Database\\Factories\\AdminConversationFactory");
}