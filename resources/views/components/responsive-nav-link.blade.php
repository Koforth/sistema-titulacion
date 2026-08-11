@props(['active'])

@php
$classes = ($active ?? false)
            ? 'block w-full ps-3 pe-4 py-2 border-l-4 border-pggl-400 text-start text-base font-medium text-pggl-200 bg-pggl-700 focus:outline-none focus:text-pggl-100 focus:bg-pggl-600 focus:border-pggl-400 transition duration-150 ease-in-out'
            : 'block w-full ps-3 pe-4 py-2 border-l-4 border-transparent text-start text-base font-medium text-pggl-100 hover:text-white hover:bg-pggl-700 hover:border-pggl-500 focus:outline-none focus:text-white focus:bg-pggl-700 focus:border-pggl-500 transition duration-150 ease-in-out';
@endphp

<a {{ $attributes->merge(['class' => $classes]) }}>
    {{ $slot }}
</a>
