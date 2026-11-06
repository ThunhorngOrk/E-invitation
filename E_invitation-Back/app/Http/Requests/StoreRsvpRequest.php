<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRsvpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:30'],
            'attendance' => ['required', 'in:yes,no'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:20'],
            'message' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
