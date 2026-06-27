<?php
$raw = file_get_contents($argv[1] ?? 'php://stdin');
$data = json_decode($raw, true);
if (!is_array($data)) {
    fwrite(STDERR, "not array\n");
    exit(1);
}
$names = array_column($data, 'name');
$named = array_filter($names);
echo 'TOTAL: ' . count($data) . PHP_EOL;
echo 'NAMED: ' . count($named) . PHP_EOL;
$counts = array_count_values($named);
$dups = array_filter($counts, fn($c) => $c > 1);
echo 'DUPES: ' . count($dups) . PHP_EOL;
foreach ($dups as $n => $c) {
    echo "  $c x $n" . PHP_EOL;
}
