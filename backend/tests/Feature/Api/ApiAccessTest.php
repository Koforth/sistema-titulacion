<?php

namespace Tests\Feature\Api;

use App\Models\Graduado;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiAccessTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->forceFill(['role' => $role, 'activo' => true])->save();

        return $user;
    }

    public function test_login_devuelve_token_y_rol(): void
    {
        $user = User::factory()->create(['password' => 'secreto123']);

        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'secreto123'])
            ->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    }

    public function test_login_invalido_es_rechazado(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'mala'])
            ->assertStatus(422);
    }

    public function test_endpoints_privados_requieren_token(): void
    {
        $this->getJson('/api/v1/graduados')->assertUnauthorized();
    }

    public function test_consulta_solo_puede_leer(): void
    {
        Sanctum::actingAs($this->userWithRole('consulta'));

        $this->getJson('/api/v1/graduados')->assertOk();
        $this->postJson('/api/v1/graduados', ['nombre_completo' => 'Ana'])->assertForbidden();
    }

    public function test_operador_crea_pero_no_elimina(): void
    {
        Sanctum::actingAs($this->userWithRole('operador'));

        $id = $this->postJson('/api/v1/graduados', ['nombre_completo' => 'Ana Pérez'])
            ->assertCreated()->json('id');

        $this->deleteJson("/api/v1/graduados/{$id}")->assertForbidden();
    }

    public function test_admin_elimina(): void
    {
        Sanctum::actingAs($this->userWithRole('admin'));
        $g = Graduado::create(['nombre_completo' => 'Luis']);

        $this->deleteJson("/api/v1/graduados/{$g->id}")->assertNoContent();
    }

    public function test_validacion_devuelve_422(): void
    {
        Sanctum::actingAs($this->userWithRole('admin'));

        $this->postJson('/api/v1/graduados', [])->assertStatus(422)->assertJsonValidationErrors('nombre_completo');
    }

    public function test_consulta_publica_no_requiere_token(): void
    {
        $this->getJson('/api/v1/publico/estadisticas')->assertOk()->assertJsonStructure(['titulos_emitidos', 'total_registrados']);
    }
}
