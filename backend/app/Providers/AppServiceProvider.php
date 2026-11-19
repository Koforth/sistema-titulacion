<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Schema::defaultStringLength(191);

        // ISO 27001 A.5.17: política de contraseñas.
        Password::defaults(fn () => Password::min(10)->letters()->mixedCase()->numbers()->symbols());
    }
}
