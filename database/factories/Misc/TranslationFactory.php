<?php

namespace Database\Factories\Misc;

use App\Models\Misc\Translation;
use Illuminate\Database\Eloquent\Factories\Factory;

class TranslationFactory extends Factory
{
    protected $model = \App\Models\Misc\Translation::class;

    public function definition(): array
    {
        return [
            'translatable_type' => 'App\\Models\\CmsPage',
            'translatable_id' => 1,
            'field' => 'title',
            'language_code' => 'en',
            'value' => fake()->sentence(),
        ];
    }
}
