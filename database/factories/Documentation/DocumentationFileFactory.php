<?php

namespace Database\Factories\Documentation;

use App\Models\Documentation\DocumentationFile;
use App\Models\Identity\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentationFileFactory extends Factory
{
    protected $model = \App\Models\Documentation\DocumentationFile::class;

    public function definition(): array
    {
        $title = fake()->words(3, true);

        return [
            'title' => $title,
            'document_key' => \Illuminate\Support\Str::slug($title),
            'document_type' => 'brd',
            'format' => 'markdown',
            'file_path' => 'qa/' . \Illuminate\Support\Str::slug($title) . '.md',
            'status' => 'generated',
            'generated_by' => User::factory(),
            'generated_at' => now(),
            'summary' => fake()->sentence(),
        ];
    }
}
