<?php

declare(strict_types=1);

$finder = PhpCsFixer\Finder::create()->in([__DIR__.'/src', __DIR__.'/tests', __DIR__.'/config', __DIR__.'/migrations']);

return (new PhpCsFixer\Config())->setRules(['@Symfony' => true, 'declare_strict_types' => true])->setRiskyAllowed(true)->setFinder($finder);
