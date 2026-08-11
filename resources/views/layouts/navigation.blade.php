<nav x-data="{ open: false }" class="bg-pggl-800 border-b border-pggl-900">
    <!-- Primary Navigation Menu -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex">
                <!-- Logo -->
                <div class="shrink-0 flex items-center">
                    <a href="{{ route('dashboard') }}" class="flex items-center gap-2">
                        <img src="{{ asset('img/logo-uncpggl.png') }}" alt="UNCPGGL" class="block h-10 w-auto">
                        <span class="hidden md:block text-white font-semibold leading-tight">
                            SIGTU Sistema Integral de<br>Gestión de Títulos Universitarios
                        </span>
                    </a>
                </div>

                <!-- Navigation Links -->
                <div class="hidden space-x-4 sm:-my-px sm:ms-6 sm:flex">
                    <x-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')">
                        {{ __('Dashboard') }}
                    </x-nav-link>
                    <x-nav-link :href="route('graduados.index')" :active="request()->routeIs('graduados.*')">
                        {{ __('Graduados') }}
                    </x-nav-link>
                    <x-nav-link :href="route('titulaciones.index')" :active="request()->routeIs('titulaciones.*')">
                        {{ __('Titulaciones') }}
                    </x-nav-link>
                    <x-nav-link :href="route('procesos-titulo.index')" :active="request()->routeIs('procesos-titulo.*')">
                        {{ __('Procesos') }}
                    </x-nav-link>
                    <x-nav-link :href="route('impresion.index')" :active="request()->routeIs('impresion.*')">
                        {{ __('Impresión') }}
                    </x-nav-link>
                    <x-nav-link :href="route('setec.index')" :active="request()->routeIs('setec.*')">
                        {{ __('SETEC') }}
                    </x-nav-link>
                    <x-nav-link :href="route('titulos-fisicos.index')" :active="request()->routeIs('titulos-fisicos.*')">
                        {{ __('Títulos físicos') }}
                    </x-nav-link>
                    <x-nav-link :href="route('entrega.index')" :active="request()->routeIs('entrega.*')">
                        {{ __('Entrega') }}
                    </x-nav-link>
                    <x-nav-link :href="route('reportes.index')" :active="request()->routeIs('reportes.*')">
                        {{ __('Reportes') }}
                    </x-nav-link>
                </div>
            </div>

            <!-- Settings Dropdown -->
            <div class="hidden sm:flex sm:items-center sm:ms-6">
                <x-dropdown align="right" width="48">
                    <x-slot name="trigger">
                        <button class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-pggl-800 hover:text-pggl-100 focus:outline-none transition ease-in-out duration-150">
                            <div>{{ Auth::user()->name }}</div>

                            <div class="ms-1">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </x-slot>

                    <x-slot name="content">
                        <x-dropdown-link :href="route('profile.edit')">
                            {{ __('Profile') }}
                        </x-dropdown-link>

                        <!-- Authentication -->
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf

                            <x-dropdown-link :href="route('logout')"
                                    onclick="event.preventDefault();
                                                this.closest('form').submit();">
                                {{ __('Log Out') }}
                            </x-dropdown-link>
                        </form>
                    </x-slot>
                </x-dropdown>
            </div>

            <!-- Hamburger -->
            <div class="-me-2 flex items-center sm:hidden">
                <button @click="open = ! open" class="inline-flex items-center justify-center p-2 rounded-md text-pggl-100 hover:text-white hover:bg-pggl-700 focus:outline-none focus:bg-pggl-700 focus:text-white transition duration-150 ease-in-out">
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path :class="{'hidden': open, 'inline-flex': ! open }" class="inline-flex" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        <path :class="{'hidden': ! open, 'inline-flex': open }" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Responsive Navigation Menu -->
    <div :class="{'block': open, 'hidden': ! open}" class="hidden sm:hidden bg-pggl-800">
        <div class="pt-2 pb-3 space-y-1">
            <x-responsive-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')">
                {{ __('Dashboard') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('graduados.index')" :active="request()->routeIs('graduados.*')">
                {{ __('Graduados') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('titulaciones.index')" :active="request()->routeIs('titulaciones.*')">
                {{ __('Titulaciones') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('procesos-titulo.index')" :active="request()->routeIs('procesos-titulo.*')">
                {{ __('Procesos') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('impresion.index')" :active="request()->routeIs('impresion.*')">
                {{ __('Impresión') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('setec.index')" :active="request()->routeIs('setec.*')">
                {{ __('SETEC') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('titulos-fisicos.index')" :active="request()->routeIs('titulos-fisicos.*')">
                {{ __('Títulos físicos') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('entrega.index')" :active="request()->routeIs('entrega.*')">
                {{ __('Entrega') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('reportes.index')" :active="request()->routeIs('reportes.*')">
                {{ __('Reportes') }}
            </x-responsive-nav-link>
        </div>

        <!-- Responsive Settings Options -->
        <div class="pt-4 pb-1 border-t border-pggl-700">
            <div class="px-4">
                <div class="font-medium text-base text-white">{{ Auth::user()->name }}</div>
                <div class="font-medium text-sm text-pggl-100">{{ Auth::user()->email }}</div>
            </div>

            <div class="mt-3 space-y-1">
                <x-responsive-nav-link :href="route('profile.edit')">
                    {{ __('Profile') }}
                </x-responsive-nav-link>

                <!-- Authentication -->
                <form method="POST" action="{{ route('logout') }}">
                    @csrf

                    <x-responsive-nav-link :href="route('logout')"
                            onclick="event.preventDefault();
                                        this.closest('form').submit();">
                        {{ __('Log Out') }}
                    </x-responsive-nav-link>
                </form>
            </div>
        </div>
    </div>
</nav>
