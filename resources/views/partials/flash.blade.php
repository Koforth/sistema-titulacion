@if (session('success'))
    <div class="mb-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ session('success') }}</span>
    </div>
@endif
@if (session('error'))
    <div class="mb-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ session('error') }}</span>
    </div>
@endif
@if (session('info'))
    <div class="mb-4 bg-pggl-100 border border-pggl-400 text-pggl-800 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ session('info') }}</span>
    </div>
@endif
