<?php

namespace Database\Factories;

use App\Models\Translation;
use Illuminate\Database\Eloquent\Factories\Factory;

class TranslationFactory extends Factory
{
    protected $model = Translation::class;

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
