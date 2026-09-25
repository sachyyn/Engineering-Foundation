<?php

declare(strict_types=1);

return (new PhpCsFixer\Config())
    ->setRules(['@Symfony' => true, 'declare_strict_types' => true])
    ->setRiskyAllowed(true)
    ->setCacheFile(__DIR__.'/../.cache/php-cs-fixer')
    ->setFinder(PhpCsFixer\Finder::create()->in([
        __DIR__.'/../backend/src',
        __DIR__.'/../backend/tests',
        __DIR__.'/../backend/migrations',
    ]));
